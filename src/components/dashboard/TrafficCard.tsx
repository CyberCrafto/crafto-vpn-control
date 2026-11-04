import { Activity, ArrowDown, ArrowUp, Loader2, Radio, Zap } from "lucide-react";
import { useApp } from "../../state/AppStore";
import { Sparkline } from "../ui";
import { cn } from "../../utils/cn";

export function TrafficCard() {
  const { vpn, runSpeedTest, isTesting, busy } = useApp();
  const active = vpn.connected;
  const peakDown = Math.max(...vpn.downHistory).toFixed(1);

  return (
    <section className="panel flex h-full flex-col overflow-hidden rounded-2xl">
      <div className="flex items-center justify-between border-b border-white/[0.055] px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md border border-cyan-400/15 bg-cyan-400/[0.07] text-cyan-300">
            <Activity className="h-3.5 w-3.5" />
          </span>
          <h2 className="text-[12.5px] font-semibold text-slate-100">Traffic monitor</h2>
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-2 py-[2px] font-mono text-[8.5px] font-medium uppercase tracking-[0.12em]",
            active
              ? "border-emerald-400/15 bg-emerald-400/[0.06] text-emerald-300"
              : "border-white/[0.07] bg-white/[0.02] text-slate-500",
          )}
        >
          <span className={cn("h-1 w-1 rounded-full", active ? "bg-emerald-400" : "bg-slate-500")} />
          {active ? "Live" : "Paused"}
        </span>
      </div>

      <div className="flex flex-1 flex-col px-4 pb-4 pt-3.5">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-[9.5px] font-medium uppercase tracking-[0.13em] text-slate-500">
              <ArrowDown className="h-3 w-3 text-cyan-300" />
              Download
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="font-mono text-[26px] font-medium leading-none tracking-[-0.03em] text-white tabular-nums">
                {active ? vpn.speed.down.toFixed(1) : "0.0"}
              </span>
              <span className="text-[10.5px] text-slate-500">Mbps</span>
            </div>
          </div>
          <div className="rounded-md border border-white/[0.07] bg-white/[0.02] px-2 py-1 text-right">
            <p className="text-[8.5px] uppercase tracking-[0.1em] text-slate-600">Peak</p>
            <p className="font-mono text-[10px] text-slate-400">{active ? peakDown : "0.0"}</p>
          </div>
        </div>

        <div className="relative mt-1">
          <Sparkline
            data={active ? vpn.downHistory : vpn.downHistory.map(() => 0)}
            color={active ? "#3fe0d8" : "#334155"}
            className="h-[62px]"
            strokeWidth={1.7}
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-white/[0.05]" />
        </div>

        <div className="mt-2 grid grid-cols-2 gap-2">
          <div className="rounded-lg border border-white/[0.055] bg-white/[0.018] px-2.5 py-2">
            <div className="flex items-center gap-1 text-[9px] uppercase tracking-[0.08em] text-slate-500">
              <ArrowUp className="h-2.5 w-2.5 text-sky-400" />
              Upload
            </div>
            <p className="mt-1 font-mono text-[13px] text-slate-200 tabular-nums">
              {active ? vpn.speed.up.toFixed(1) : "0.0"}
              <span className="ml-1 text-[9px] text-slate-500">Mbps</span>
            </p>
          </div>
          <div className="rounded-lg border border-white/[0.055] bg-white/[0.018] px-2.5 py-2">
            <div className="flex items-center gap-1 text-[9px] uppercase tracking-[0.08em] text-slate-500">
              <Radio className="h-2.5 w-2.5 text-emerald-400" />
              Latency
            </div>
            <p className="mt-1 font-mono text-[13px] text-slate-200 tabular-nums">
              {active ? vpn.speed.ping : "—"}
              <span className="ml-1 text-[9px] text-slate-500">ms</span>
            </p>
          </div>
        </div>

        <div className="mt-2.5 flex items-center justify-between text-[9px] text-slate-600">
          <span className="flex items-center gap-1">
            <span className="h-1 w-1 rounded-full bg-cyan-400/70" />
            Sampled every 2s
          </span>
          <span className="font-mono">{active ? "AES-256-GCM" : "Tunnel offline"}</span>
        </div>

        <button
          onClick={runSpeedTest}
          disabled={!active || isTesting || busy}
          className={cn(
            "mt-3 flex h-[34px] w-full items-center justify-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.025] text-[11px] font-medium text-slate-300 transition-all hover:border-sky-400/25 hover:bg-sky-500/[0.07] hover:text-sky-200",
            (!active || isTesting || busy) && "cursor-not-allowed opacity-50 hover:border-white/[0.08] hover:bg-white/[0.025] hover:text-slate-300",
          )}
        >
          {isTesting ? <Loader2 className="h-3.5 w-3.5 animate-spin text-sky-300" /> : <Zap className="h-3.5 w-3.5 text-sky-300" />}
          {isTesting ? "Running throughput test…" : "Run speed test"}
        </button>
      </div>
    </section>
  );
}
