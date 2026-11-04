import { ArrowUpRight, ChevronDown, Settings2, Sparkles } from "lucide-react";
import { useApp } from "../../state/AppStore";
import { PROTOCOLS, type Protocol } from "../../lib/types";
import { Toggle } from "../ui";
import { cn } from "../../utils/cn";

const PROTOCOL_HINT: Record<Protocol, string> = {
  WireGuard: "Modern kernel tunnel · lowest overhead",
  "Lightway UDP": "Fast handshake · optimised for streaming",
  "OpenVPN UDP": "Balanced throughput · broad compatibility",
  "OpenVPN TCP": "Reliable fallback · resilient on strict networks",
};

export function SettingsCard({ highlight, onNavigate }: { highlight: boolean; onNavigate: () => void }) {
  const { vpn, setProtocol, toggleSetting, busy } = useApp();

  const rows = [
    {
      key: "networkLock" as const,
      label: "Network Lock",
      description: "Block all traffic if the tunnel drops",
      checked: vpn.networkLock,
    },
    {
      key: "autoConnect" as const,
      label: "Auto Connect",
      description: "Open a tunnel when Crafto launches",
      checked: vpn.autoConnect,
    },
    {
      key: "splitTunneling" as const,
      label: "Split Tunneling",
      description: "Route chosen apps outside the VPN",
      checked: vpn.splitTunneling,
    },
  ];

  return (
    <section
      id="vpn-settings"
      className={cn(
        "panel flex h-full flex-col rounded-2xl p-4 transition-all duration-500 md:p-5",
        highlight && "ring-2 ring-sky-400/45 ring-offset-2 ring-offset-[#05080f]",
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <Settings2 className="h-4 w-4 text-sky-300" />
          <h2 className="text-[13px] font-semibold text-slate-100">VPN settings</h2>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full border border-cyan-400/15 bg-cyan-400/[0.05] px-1.5 py-[2px] text-[8.5px] font-medium uppercase tracking-[0.1em] text-cyan-300/90">
          <Sparkles className="h-2.5 w-2.5" />
          Synced
        </span>
      </div>
      <p className="mt-1 text-[10.5px] text-slate-500">
        Applied to the tunnel instantly and mirrored to the agent.
      </p>

      <div className="mt-3 flex-1">
        <div className="flex items-center justify-between gap-3 border-b border-white/[0.055] py-3">
          <div className="min-w-0">
            <p className="text-[12px] font-medium text-slate-200">VPN Protocol</p>
            <p className="mt-0.5 truncate text-[10px] text-slate-500">
              {PROTOCOL_HINT[vpn.protocol]}
            </p>
          </div>
          <div className="relative shrink-0">
            <select
              aria-label="VPN protocol"
              value={vpn.protocol}
              disabled={busy}
              onChange={(event) => setProtocol(event.target.value as Protocol)}
              className="cursor-pointer appearance-none disabled:cursor-not-allowed disabled:opacity-60 rounded-lg border border-white/[0.09] bg-[#0d1626] py-[6px] pl-2.5 pr-7 font-mono text-[10.5px] text-slate-200 transition-colors hover:border-sky-400/30 focus:border-sky-400/50"
            >
              {PROTOCOLS.map((protocol) => (
                <option key={protocol} value={protocol}>
                  {protocol}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-500" />
          </div>
        </div>

        {rows.map((row) => (
          <div
            key={row.key}
            className="flex items-center justify-between gap-3 border-b border-white/[0.055] py-3 last:border-0"
          >
            <div className="min-w-0">
              <p className="text-[12px] font-medium text-slate-200">{row.label}</p>
              <p className="mt-0.5 truncate text-[10px] text-slate-500">{row.description}</p>
            </div>
            <Toggle
              checked={row.checked}
              onChange={() => toggleSetting(row.key)}
              label={`Toggle ${row.label}`}
              disabled={busy}
            />
          </div>
        ))}
      </div>

      <div className="mt-2 rounded-lg border border-white/[0.055] bg-white/[0.018] p-2.5">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[9.5px] leading-snug text-slate-500">
            {busy ? "Agent is executing — settings stay in sync." : "Changes are reflected in the AI console."}
          </p>
          <button
            onClick={onNavigate}
            className="group inline-flex shrink-0 items-center gap-1 text-[9.5px] font-medium text-sky-300 transition-colors hover:text-sky-200"
          >
            Open agent
            <ArrowUpRight className="h-3 w-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>
    </section>
  );
}
