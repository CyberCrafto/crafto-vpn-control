import { findRegion } from "./regions";
import type { Protocol } from "./types";

export type Intent =
  | { type: "connect"; region?: ReturnType<typeof findRegion> }
  | { type: "disconnect" }
  | { type: "reconnect" }
  | { type: "status" }
  | { type: "change_location"; region: NonNullable<ReturnType<typeof findRegion>> }
  | { type: "list_locations" }
  | { type: "ip" }
  | { type: "protocol"; protocol: Protocol }
  | { type: "network_lock"; enabled: boolean }
  | { type: "auto_connect"; enabled: boolean }
  | { type: "speed_test" }
  | { type: "check" }
  | { type: "stats" }
  | { type: "help" }
  | { type: "unknown"; input: string };

const PROTOCOL_ALIASES: Array<{ protocol: Protocol; match: RegExp }> = [
  { protocol: "WireGuard", match: /wire\s*-?\s*guard/ },
  { protocol: "Lightway UDP", match: /light\s*-?\s*way(\s*udp)?/ },
  { protocol: "OpenVPN UDP", match: /open\s*-?\s*vpn\s*(udp)?/ },
  { protocol: "OpenVPN TCP", match: /open\s*-?\s*vpn\s*tcp/ },
];

export function parseProtocol(input: string): Protocol | null {
  const text = input.toLowerCase();
  if (/open\s*-?\s*vpn\s*tcp/.test(text)) return "OpenVPN TCP";
  if (/open\s*-?\s*vpn\s*udp/.test(text)) return "OpenVPN UDP";
  const hit = PROTOCOL_ALIASES.find((p) => p.match.test(text));
  return hit ? hit.protocol : null;
}

function normalize(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[’`]/g, "'")
    .replace(/[!?.,]+$/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^(please|hey|ok|okay|crafto|can you|could you|would you|i'd like to|i want to)\s+/, "")
    .trim();
}

export function parseCommand(raw: string): Intent {
  const text = normalize(raw);
  const unknown: Intent = { type: "unknown", input: raw.trim() };

  if (!text) return unknown;

  // ---- diagnostics & information ----
  if (/^(help|what can you do|commands|capabilities)$/.test(text)) return { type: "help" };
  if (/(speed ?test|throughput test|bandwidth test|run.*speed)/.test(text)) return { type: "speed_test" };
  if (/(vpn\s*)?statistics|(show|get).*(vpn )?stats\b/.test(text) && !/status/.test(text)) {
    return { type: "stats" };
  }
  if (
    /(check|test|diagnose|verify).*(vpn|connection|tunnel)/.test(text) ||
    /^(diagnostics|run diagnostics|check vpn connection)$/.test(text)
  ) {
    if (!/disconnect|connect to|change location/.test(text)) return { type: "check" };
  }
  if (/(connection|vpn|tunnel) status|^status$|^check status$|show status/.test(text)) {
    return { type: "status" };
  }
  if (/(list|show|available|all).*(locations?|regions?|servers?)/.test(text) && !/change|switch|connect/.test(text)) {
    return { type: "list_locations" };
  }
  if (/(my|the|vpn|public).*\bip\b|^ip$|what('s| is) my ip/.test(text)) {
    return { type: "ip" };
  }

  // ---- protocol ----
  if (/protocol/.test(text)) {
    const protocol = parseProtocol(text);
    if (protocol) return { type: "protocol", protocol };
    return unknown;
  }

  // ---- settings ----
  if (/(network ?lock|kill ?switch)/.test(text)) {
    if (/\b(disable|turn off|deactivate|off)\b/.test(text)) return { type: "network_lock", enabled: false };
    if (/\b(enable|turn on|activate|on)\b/.test(text)) return { type: "network_lock", enabled: true };
    return unknown;
  }
  if (/auto\s*-?\s*connect/.test(text)) {
    if (/\b(disable|turn off|deactivate|off)\b/.test(text)) return { type: "auto_connect", enabled: false };
    if (/\b(enable|turn on|activate|on)\b/.test(text)) return { type: "auto_connect", enabled: true };
    return unknown;
  }

  // ---- location ----
  const locationMatch = text.match(
    /^(?:change|switch|set|move|route)\s+(?:my\s+|the\s+)?(?:vpn\s+)?(?:location|country|exit|server)\s+(?:to\s+)?(.+)$/,
  );
  if (locationMatch) {
    const region = findRegion(locationMatch[1]);
    return region ? { type: "change_location", region } : unknown;
  }
  const switchMatch = text.match(/^(?:switch|move)\s+to\s+(.+)$/);
  if (switchMatch) {
    const region = findRegion(switchMatch[1]);
    return region ? { type: "change_location", region } : unknown;
  }

  // ---- tunnel control ----
  if (/^(disconnect( (the )?vpn)?|close (the )?vpn|turn off (the )?vpn|drop (the )?tunnel)$/.test(text)) {
    return { type: "disconnect" };
  }
  if (/^(reconnect|reconnect (the )?vpn|restart (the )?vpn|cycle (the )?tunnel)$/.test(text)) {
    return { type: "reconnect" };
  }
  if (/^connect\s+(?:to|me to)\s+(.+)$/.test(text)) {
    const target = text.match(/^connect\s+(?:to|me to)\s+(.+)$/)?.[1] ?? "";
    const region = findRegion(target);
    return region ? { type: "connect", region } : unknown;
  }
  if (/^(connect|connect (the )?vpn|start (the )?vpn|turn on (the )?vpn|connect me)$/.test(text)) {
    return { type: "connect" };
  }
  if (/^connect\s+(.+)$/.test(text)) {
    const region = findRegion(text.replace(/^connect\s+/, ""));
    if (region) return { type: "connect", region };
  }

  return unknown;
}

export const SUGGESTED_COMMANDS = [
  { label: "Connect to Germany", command: "connect to Germany" },
  { label: "Switch to USA", command: "change location to USA" },
  { label: "Disconnect VPN", command: "disconnect VPN" },
  { label: "Check Status", command: "show connection status" },
  { label: "Run Speed Test", command: "run speed test" },
];

export const COMMAND_GROUPS: Array<{ title: string; items: Array<{ label: string; command: string }> }> = [
  {
    title: "Connection",
    items: [
      { label: "Connect", command: "connect VPN" },
      { label: "Disconnect", command: "disconnect VPN" },
      { label: "Reconnect", command: "reconnect VPN" },
      { label: "Status", command: "show connection status" },
    ],
  },
  {
    title: "Locations",
    items: [
      { label: "United States", command: "change location to USA" },
      { label: "Germany", command: "change location to Germany" },
      { label: "Japan", command: "change location to Japan" },
      { label: "List all", command: "list available locations" },
    ],
  },
  {
    title: "Security",
    items: [
      { label: "Network Lock on", command: "enable network lock" },
      { label: "Auto Connect on", command: "enable auto connect" },
      { label: "WireGuard", command: "change protocol to WireGuard" },
      { label: "OpenVPN TCP", command: "change protocol to OpenVPN TCP" },
    ],
  },
];
