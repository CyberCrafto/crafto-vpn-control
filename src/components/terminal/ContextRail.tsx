import {
  ArrowUpRight,
  Clock3,
  Fingerprint,
  LockKeyhole,
  Network,
  ShieldCheck,
  Workflow,
} from "lucide-react";
import { useApp } from "../../state/AppStore";
import { useNow } from "../../hooks/useNow";
import { formatDuration, formatTimeAgo } from "../../lib/format";
import { Flag } from "../Flag";
import { StatusDot } from "../ui";
import { cn } from "../../utils/cn";
import type { Page } from "../../lib/types";

const MCP_TOOLS = [
  "vpn_connect",
  "vpn_disconnect",
  "vpn_get_regions",
  "vpn_change_location",
  "vpn_get_ip",
  "vpn_set_protocol",
  "vpn_speed_test",
  "vpn_diagnostics",
];

export function ContextRail({ onNavigate }: { onNavigate: (page: Page) => void }) {
  const { vpn, region, messages, commandCount, busy, activeTool } = useApp();
  const now = useNow(1000);

  const toolCalls = messages.filter((m) => m.kind === "tool");
  const completed = toolCalls.filter((m) => m.kind === "tool" && m.durationMs !== undefined);
  const avgLatency = completed.length
    ? Math.round(
        completed.reduce((sum, m) => sum + (m.kind === "tool" ? (m.durationMs ?? 0) : 0), 0) /
          completed.length,
      )
    : 0;
  const lastEvent = messages[messages.length - 1];

  const rows = [
    { label: "Exit IP", value: vpn.connected ? region.ip : "Not assigned", mono: true },
    { label: "Protocol", value: vpn.protocol, mono: false },
    { label: "Network Lock", value: vpn.networkLock ? "Armed" : "Off", mono: false },
    { label: "Session", value: formatDuration(vpn.connectedAt, now), mono: true },
  ];

  return (
    <aside className="hidden min-h-0 flex-col gap-3 overflow-y-auto xl:col-span-3 xl:flex">
      <section className="panel overflow-hidden rounded-2xl">
        <div className="flex items-center justify-between border-b border-white/[0.055] px-3.5 py-2.5">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-3.5 w-3.5 text-sky-300" />
            <h2 className="text-[11.5px] font-semibold text-slate-200">Live connection</h2>
          </div>
          <span className="flex items-center gap-1.5 font-mono text-[8.5px] uppercase tracking-wider text-emerald-300/80">
            <StatusDot tone={vpn.connected ? "success" : "offline"} pulse={vpn.connected} />
            synced
          </span>
        </div>
        <div className="px-3.5 py-3">
          <div className="flex items-center gap-2.5">
            <Flag code={region.id} size="lg" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12px] font-medium text-slate-100">{region.city}</p>
              <p className="truncate text-[10px] text-slate-500">{region.country}</p>
            </div>
            <span
              className={cn(
                "rounded-full border px-[7px] py-[2px] text-[8.5px] font-semibold uppercase tracking-wider",
                vpn.connected
                  ? "border-emerald-400/20 bg-emerald-400/[0.07] text-emerald-300"
                  : "border-rose-400/20 bg-rose-400/[0.06] text-rose-300",
              )}
            >
              {vpn.connected ? "UP" : "DOWN"}
            </span>
          </div>

          <div className="mt-3 space-y-1.5 border-t border-white/[0.05] pt-2.5">
            {rows.map((row) => (
              <div key={row.label} className="flex items-center justify-between gap-2 text-[10.5px]">
                <span className="flex items-center gap-1.5 text-slate-500">
                  {row.label === "Exit IP" && <Fingerprint className="h-2.5 w-2.5" />}
                  {row.label === "Session" && <Clock3 className="h-2.5 w-2.5" />}
                  {row.label === "Network Lock" && <LockKeyhole className="h-2.5 w-2.5" />}
                  {row.label === "Protocol" && <Network className="h-2.5 w-2.5" />}
                  {row.label}
                </span>
                <span
                  className={cn(
                    "truncate text-slate-300",
                    row.mono && "font-mono text-[10px]",
                    row.label === "Network Lock" && vpn.networkLock && "text-cyan-300",
                    vpn.connected ? "" : "text-slate-500",
                  )}
                >
                  {row.value}
                </span>
              </div>
            ))}
          </div>

          <button
            onClick={() => onNavigate("dashboard")}
            className="mt-3 flex w-full items-center justify-between rounded-lg border border-white/[0.07] bg-white/[0.02] px-2.5 py-[6px] text-[10px] font-medium text-slate-400 transition-colors hover:border-sky-400/25 hover:bg-sky-400/[0.05] hover:text-sky-200"
          >
            Open dashboard
            <ArrowUpRight className="h-3 w-3" />
          </button>
        </div>
      </section>

      <section className="panel overflow-hidden rounded-2xl">
        <div className="flex items-center justify-between border-b border-white/[0.055] px-3.5 py-2.5">
          <div className="flex items-center gap-2">
            <Workflow className="h-3.5 w-3.5 text-cyan-300" />
            <h2 className="text-[11.5px] font-semibold text-slate-200">MCP tools</h2>
          </div>
          <span className="rounded border border-white/[0.07] bg-white/[0.03] px-1.5 py-[1px] font-mono text-[8.5px] text-slate-400">
            {MCP_TOOLS.length} available
          </span>
        </div>
        <div className="px-3 py-2">
          {MCP_TOOLS.map((tool) => (
            <div
              key={tool}
              className="group flex items-center justify-between gap-2 rounded px-1 py-[4.5px] transition-colors hover:bg-white/[0.02]"
            >
              <div className="flex min-w-0 items-center gap-2">
                <span className="h-1 w-1 shrink-0 rounded-full bg-emerald-400/80" />
                <code className="truncate font-mono text-[9.5px] text-slate-400 group-hover:text-slate-300">
                  {tool}
                </code>
              </div>
              <span className="font-mono text-[8px] text-slate-700">
                {busy && activeTool === tool ? "run" : "ready"}
              </span>
            </div>
          ))}
        </div>
        <div className="border-t border-white/[0.045] px-3.5 py-2 font-mono text-[8.5px] text-slate-600">
          transport: local · permissions: vpn:write
        </div>
      </section>

      <section className="panel rounded-2xl p-3.5">
        <div className="flex items-center justify-between">
          <h2 className="text-[11.5px] font-semibold text-slate-200">Session metrics</h2>
          <span className="font-mono text-[8.5px] text-slate-600">mcp:local</span>
        </div>
        <div className="mt-2.5 grid grid-cols-2 gap-2">
          <div className="rounded-lg border border-white/[0.055] bg-white/[0.018] px-2 py-1.5">
            <p className="text-[8px] uppercase tracking-[0.1em] text-slate-600">Commands</p>
            <p className="mt-0.5 font-mono text-[12px] text-slate-200">{commandCount}</p>
          </div>
          <div className="rounded-lg border border-white/[0.055] bg-white/[0.018] px-2 py-1.5">
            <p className="text-[8px] uppercase tracking-[0.1em] text-slate-600">Tool calls</p>
            <p className="mt-0.5 font-mono text-[12px] text-slate-200">{toolCalls.length}</p>
          </div>
          <div className="rounded-lg border border-white/[0.055] bg-white/[0.018] px-2 py-1.5">
            <p className="text-[8px] uppercase tracking-[0.1em] text-slate-600">Avg latency</p>
            <p className="mt-0.5 font-mono text-[12px] text-slate-200">{avgLatency || 0} ms</p>
          </div>
          <div className="rounded-lg border border-white/[0.055] bg-white/[0.018] px-2 py-1.5">
            <p className="text-[8px] uppercase tracking-[0.1em] text-slate-600">Last event</p>
            <p className="mt-0.5 truncate font-mono text-[9px] text-slate-400">
              {lastEvent ? formatTimeAgo(lastEvent.at, now) : "—"}
            </p>
          </div>
        </div>
      </section>
    </aside>
  );
}
