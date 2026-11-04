import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { executeCommand } from "../lib/engine";
import { parseCommand } from "../lib/commands";
import { getRegion } from "../lib/regions";
import {
  clamp,
  formatDataShort,
  randomBetween,
  sleep,
  uid,
} from "../lib/format";
import type {
  Protocol,
  Region,
  RegionId,
  TerminalMessage,
  VpnPatch,
  VpnState,
} from "../lib/types";

type SettingKey = "networkLock" | "autoConnect" | "splitTunneling";

interface AppContextValue {
  vpn: VpnState;
  region: Region;
  messages: TerminalMessage[];
  busy: boolean;
  activeTool: string | null;
  commandCount: number;
  history: string[];
  isSwitching: boolean;
  isTesting: boolean;
  runCommand: (raw: string) => void;
  clearTerminal: () => void;
  toggleConnection: () => void;
  connectTo: (regionId: RegionId) => void;
  setProtocol: (protocol: Protocol) => void;
  toggleSetting: (key: SettingKey) => void;
  runSpeedTest: () => void;
  transcript: () => string;
}

const AppContext = createContext<AppContextValue | null>(null);

function seedHistory(base: number, spread = 46, length = 42): number[] {
  const points: number[] = [];
  let value = base;
  for (let i = 0; i < length; i += 1) {
    value = clamp(value + randomBetween(-spread / 4, spread / 3), base - spread, base + spread);
    points.push(Number(value.toFixed(1)));
  }
  return points;
}

function createInitialState(): VpnState {
  const speed = { down: 486.2, up: 74.8, ping: 18 };
  return {
    connected: true,
    locationId: "de",
    protocol: "WireGuard",
    networkLock: true,
    autoConnect: true,
    splitTunneling: false,
    connectedAt: Date.now() - 1000 * (14 * 60 + 32),
    dataMB: 2684.7,
    speed,
    downHistory: seedHistory(speed.down, 90),
    upHistory: seedHistory(speed.up, 18),
  };
}

function createInitialMessages(): TerminalMessage[] {
  const now = Date.now();
  return [
    {
      id: uid("sys"),
      at: now - 90_000,
      kind: "system",
      text: "MCP session established · 8 VPN tools registered · transport local",
      tone: "success",
      source: "system",
    },
    {
      id: uid("sys"),
      at: now - 89_000,
      kind: "system",
      text: "Auto Connect armed · tunnel to Germany — Frankfurt established at launch",
      tone: "success",
      source: "dashboard",
    },
    {
      id: uid("agent"),
      at: now - 88_000,
      kind: "agent",
      text:
        "Welcome back, Shahin. I'm connected to your Crafto control plane over MCP. Your tunnel to Frankfurt is healthy and Network Lock is armed. What would you like me to do?",
    },
  ];
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [vpn, setVpn] = useState<VpnState>(createInitialState);
  const [messages, setMessages] = useState<TerminalMessage[]>(createInitialMessages);
  const [busy, setBusy] = useState(false);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [commandCount, setCommandCount] = useState(0);
  const [history, setHistory] = useState<string[]>([]);
  const [isSwitching, setIsSwitching] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  const vpnRef = useRef(vpn);
  const busyRef = useRef(false);
  const switchingRef = useRef(false);
  const testingRef = useRef(false);

  useEffect(() => {
    vpnRef.current = vpn;
  }, [vpn]);

  const pushMessage = useCallback((message: TerminalMessage) => {
    setMessages((prev) => [...prev, message].slice(-280));
  }, []);

  const patchMessage = useCallback(
    (id: string, updater: (message: TerminalMessage) => TerminalMessage) => {
      setMessages((prev) => prev.map((m) => (m.id === id ? updater(m) : m)));
    },
    [],
  );

  const applyPatch = useCallback((patch: VpnPatch) => {
    setVpn((prev) => {
      const next = { ...prev, ...patch };
      vpnRef.current = next;
      return next;
    });
  }, []);

  const logSystem = useCallback(
    (text: string, tone: "info" | "success" | "warning" = "info", source: "dashboard" | "agent" = "dashboard") => {
      pushMessage({
        id: uid("sys"),
        at: Date.now(),
        kind: "system",
        text,
        tone,
        source,
      });
    },
    [pushMessage],
  );

  const typeAgentMessage = useCallback(
    async (text: string) => {
      const id = uid("agent");
      pushMessage({ id, at: Date.now(), kind: "agent", text: "", streaming: true });
      const chunk = 3;
      for (let i = chunk; i < text.length + chunk; i += chunk) {
        const slice = text.slice(0, i);
        patchMessage(id, (m) => (m.kind === "agent" ? { ...m, text: slice } : m));
        await sleep(11);
      }
      patchMessage(id, (m) => (m.kind === "agent" ? { ...m, text, streaming: false } : m));
    },
    [patchMessage, pushMessage],
  );

  /* ------------------------------------------------------------------ */
  /* Agent runner                                                        */
  /* ------------------------------------------------------------------ */
  const runCommand = useCallback(
    async (rawInput: string) => {
      const raw = rawInput.trim();
      if (!raw || busyRef.current) return;

      busyRef.current = true;
      setBusy(true);
      setHistory((prev) => [...prev.filter((item) => item !== raw), raw].slice(-40));
      setCommandCount((count) => count + 1);
      pushMessage({ id: uid("user"), at: Date.now(), kind: "user", text: raw });

      await sleep(360);

      const intent = parseCommand(raw);
      const generator = executeCommand(raw, intent, vpnRef.current);

      try {
        for await (const step of generator) {
          if (step.t === "agent") {
            await typeAgentMessage(step.text);
          } else if (step.t === "tool_start") {
            setActiveTool(step.name);
            pushMessage({
              id: step.id,
              at: Date.now(),
              kind: "tool",
              callId: step.id,
              name: step.name,
              args: step.args,
              status: "running",
              startedAt: performance.now(),
            });
            await sleep(140);
          } else if (step.t === "tool_end") {
            patchMessage(step.id, (m) =>
              m.kind === "tool"
                ? {
                    ...m,
                    status: "success",
                    result: step.result,
                    durationMs: Math.max(
                      120,
                      Math.round(performance.now() - (m.startedAt ?? performance.now())),
                    ),
                  }
                : m,
            );
            setActiveTool(null);
          } else if (step.t === "patch") {
            applyPatch(step.patch);
          }
        }
      } finally {
        busyRef.current = false;
        setBusy(false);
        setActiveTool(null);
      }
    },
    [applyPatch, patchMessage, pushMessage, typeAgentMessage],
  );

  const submitCommand = useCallback(
    (raw: string) => {
      void runCommand(raw);
    },
    [runCommand],
  );

  const clearTerminal = useCallback(() => {
    if (busyRef.current) return;
    setMessages([
      {
        id: uid("sys"),
        at: Date.now(),
        kind: "system",
        text: `Console cleared · MCP session ${uid("mcp_").slice(0, 9)} still connected · ${8} VPN tools available`,
        tone: "success",
        source: "system",
      },
    ]);
  }, []);

  /* ------------------------------------------------------------------ */
  /* Dashboard actions — also mirrored into the agent console            */
  /* ------------------------------------------------------------------ */
  const toggleConnection = useCallback(async () => {
    if (switchingRef.current || busyRef.current) return;
    switchingRef.current = true;
    setIsSwitching(true);

    const snapshot = vpnRef.current;
    const current = getRegion(snapshot.locationId);
    await sleep(snapshot.connected ? 620 : 980);

    if (snapshot.connected) {
      applyPatch({ connected: false, connectedAt: null });
      logSystem(
        `Tunnel closed from dashboard · ${current.country} — ${current.city} released ${current.ip}`,
        "warning",
      );
    } else {
      applyPatch({
        connected: true,
        connectedAt: Date.now(),
        dataMB: 0,
        speed: {
          down: randomBetween(260, 620),
          up: randomBetween(46, 102),
          ping: current.ping,
        },
      });
      logSystem(
        `Tunnel established from dashboard · ${current.country} — ${current.city} · ${current.ip}`,
        "success",
      );
    }

    switchingRef.current = false;
    setIsSwitching(false);
  }, [applyPatch, logSystem]);

  const connectTo = useCallback(
    async (regionId: RegionId) => {
      if (switchingRef.current || busyRef.current) return;
      const snapshot = vpnRef.current;
      const region = getRegion(regionId);
      if (regionId === snapshot.locationId && snapshot.connected) {
        logSystem(`Already routed through ${region.country} — ${region.city} · no change applied`, "info");
        return;
      }

      switchingRef.current = true;
      setIsSwitching(true);
      await sleep(snapshot.connected ? 760 : 320);

      applyPatch({
        locationId: regionId,
        ...(snapshot.connected
          ? {
              connectedAt: Date.now(),
              dataMB: 0,
              speed: {
                down: randomBetween(240, 620),
                up: randomBetween(44, 104),
                ping: region.ping,
              },
            }
          : { speed: { ...snapshot.speed, ping: region.ping } }),
      });

      logSystem(
        snapshot.connected
          ? `Exit node switched from dashboard · ${region.country} — ${region.city} · ${region.ip}`
          : `Exit location set from dashboard · ${region.country} — ${region.city} · ${region.ip}`,
        snapshot.connected ? "success" : "info",
      );

      switchingRef.current = false;
      setIsSwitching(false);
    },
    [applyPatch, logSystem],
  );

  const setProtocol = useCallback(
    (protocol: Protocol) => {
      if (busyRef.current) return;
      const previous = vpnRef.current.protocol;
      if (previous === protocol) return;
      applyPatch({ protocol });
      logSystem(`Protocol changed from dashboard · ${previous} → ${protocol}`, "info");
    },
    [applyPatch, logSystem],
  );

  const toggleSetting = useCallback(
    (key: SettingKey) => {
      if (busyRef.current) return;
      const next = !vpnRef.current[key];
      applyPatch({ [key]: next } as VpnPatch);
      const label =
        key === "networkLock" ? "Network Lock" : key === "autoConnect" ? "Auto Connect" : "Split Tunneling";
      logSystem(
        `${label} ${next ? "enabled" : "disabled"} from dashboard`,
        key === "networkLock" && !next ? "warning" : "info",
      );
    },
    [applyPatch, logSystem],
  );

  const runSpeedTest = useCallback(async () => {
    if (testingRef.current || busyRef.current) return;
    if (!vpnRef.current.connected) {
      logSystem("Speed test unavailable from dashboard · tunnel is disconnected", "warning");
      return;
    }
    testingRef.current = true;
    setIsTesting(true);
    const current = getRegion(vpnRef.current.locationId);
    await sleep(1900);
    const down = randomBetween(320, 680);
    const up = randomBetween(56, 116);
    const ping = clamp(current.ping + Math.round(randomBetween(-2, 3, 0)), 6, 220);
    applyPatch({ speed: { down, up, ping } });
    logSystem(
      `Speed test completed from dashboard · ${down} Mbps down · ${up} Mbps up · ${ping} ms`,
      "success",
    );
    testingRef.current = false;
    setIsTesting(false);
  }, [applyPatch, logSystem]);

  /* ------------------------------------------------------------------ */
  /* Live telemetry                                                      */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    if (!vpn.connected) return;
    const interval = window.setInterval(() => {
      setVpn((prev) => {
        if (!prev.connected) return prev;
        const down = Number(clamp(prev.speed.down + randomBetween(-7.5, 7.5), 90, 900).toFixed(1));
        const up = Number(clamp(prev.speed.up + randomBetween(-2.2, 2.2), 24, 160).toFixed(1));
        const basePing = getRegion(prev.locationId).ping;
        const ping = Math.max(4, basePing + Math.round(randomBetween(-1, 2, 0)));
        const next: VpnState = {
          ...prev,
          speed: { down, up, ping },
          dataMB: prev.dataMB + randomBetween(0.4, 3.1),
          downHistory: [...prev.downHistory.slice(-41), down],
          upHistory: [...prev.upHistory.slice(-41), up],
        };
        vpnRef.current = next;
        return next;
      });
    }, 2000);
    return () => window.clearInterval(interval);
  }, [vpn.connected]);

  const region = useMemo(() => getRegion(vpn.locationId), [vpn.locationId]);

  const transcript = useCallback(() => {
    return messages
      .map((m) => {
        if (m.kind === "user") return `You: ${m.text}`;
        if (m.kind === "agent") return `Crafto Agent: ${m.text}`;
        if (m.kind === "system") return `[system] ${m.text}`;
        return `[tool] ${m.name} ${JSON.stringify(m.args)}${m.result ? ` → ${JSON.stringify(m.result)}` : ""}`;
      })
      .join("\n\n");
  }, [messages]);

  const value = useMemo<AppContextValue>(
    () => ({
      vpn,
      region,
      messages,
      busy,
      activeTool,
      commandCount,
      history,
      isSwitching,
      isTesting,
      runCommand: submitCommand,
      clearTerminal,
      toggleConnection: () => void toggleConnection(),
      connectTo: (regionId) => void connectTo(regionId),
      setProtocol,
      toggleSetting,
      runSpeedTest: () => void runSpeedTest(),
      transcript,
    }),
    [
      activeTool,
      busy,
      clearTerminal,
      commandCount,
      connectTo,
      history,
      isSwitching,
      isTesting,
      messages,
      region,
      runSpeedTest,
      setProtocol,
      submitCommand,
      toggleConnection,
      toggleSetting,
      transcript,
      vpn,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used inside AppProvider");
  return context;
}

export { formatDataShort };
