import { Check, Globe2, Loader2, Zap } from "lucide-react";
import { useApp } from "../../state/AppStore";
import { REGIONS } from "../../lib/regions";
import { Flag } from "../Flag";
import { SectionLabel, StatusDot } from "../ui";
import { cn } from "../../utils/cn";

export function LocationGrid() {
  const { vpn, connectTo, isSwitching, busy } = useApp();
  const fastest = [...REGIONS].sort((a, b) => a.ping - b.ping)[0];

  return (
    <section className="panel flex h-full flex-col rounded-2xl p-4 md:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Globe2 className="h-4 w-4 text-sky-300" />
            <h2 className="text-[13px] font-semibold tracking-[-0.01em] text-slate-100">
              Server locations
            </h2>
            <span className="rounded border border-white/[0.07] bg-white/[0.03] px-1.5 py-[1px] font-mono text-[9px] text-slate-400">
              {REGIONS.length}
            </span>
          </div>
          <p className="mt-1 text-[10.5px] text-slate-500">
            Choose an exit node — your selection stays in sync with the AI agent.
          </p>
        </div>
        <button
          onClick={() => connectTo(fastest.id)}
          disabled={isSwitching || busy}
          className="flex shrink-0 items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.025] px-2.5 py-[6px] text-[10.5px] font-medium text-slate-300 transition-colors hover:border-cyan-400/25 hover:bg-cyan-400/[0.06] hover:text-cyan-200 disabled:cursor-wait disabled:opacity-60"
        >
          {isSwitching ? <Loader2 className="h-3 w-3 animate-spin" /> : <Zap className="h-3 w-3 text-cyan-300" />}
          Fastest
        </button>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
        {REGIONS.map((region) => {
          const selected = vpn.locationId === region.id;
          const live = selected && vpn.connected;
          const barColor =
            region.load < 30
              ? "bg-emerald-400/80"
              : region.load < 45
                ? "bg-cyan-400/80"
                : "bg-amber-400/80";

          return (
            <button
              key={region.id}
              onClick={() => connectTo(region.id)}
              disabled={isSwitching || busy}
              className={cn(
                "group relative overflow-hidden rounded-xl border p-3 text-left transition-all duration-200 disabled:cursor-wait",
                live
                  ? "border-sky-400/35 bg-gradient-to-br from-sky-500/[0.13] to-cyan-400/[0.04] shadow-[0_0_0_1px_rgba(56,189,248,0.08),0_14px_30px_-22px_rgba(46,144,255,0.9)]"
                  : selected
                    ? "border-cyan-400/20 bg-cyan-400/[0.045] hover:border-cyan-300/30 hover:bg-cyan-400/[0.07]"
                    : "border-white/[0.065] bg-white/[0.014] hover:border-white/[0.14] hover:bg-white/[0.035]",
              )}
            >
              {live && (
                <span className="pointer-events-none absolute -right-4 -top-5 h-14 w-14 rounded-full bg-sky-400/15 blur-xl" />
              )}
              <div className="relative flex items-start justify-between gap-2">
                <Flag code={region.id} size="md" />
                {live ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-1.5 py-[2px] text-[8.5px] font-semibold uppercase tracking-wider text-emerald-300">
                    <Check className="h-2.5 w-2.5" />
                    Active
                  </span>
                ) : selected ? (
                  <span className="rounded-full border border-cyan-400/20 bg-cyan-400/[0.08] px-1.5 py-[2px] text-[8.5px] font-semibold uppercase tracking-wider text-cyan-300">
                    Selected
                  </span>
                ) : (
                  <span className="font-mono text-[9.5px] text-slate-500 group-hover:text-slate-400">
                    {region.ping} ms
                  </span>
                )}
              </div>

              <div className="relative mt-2.5">
                <p className="truncate text-[12px] font-medium leading-tight text-slate-100">
                  {region.country}
                </p>
                <p className="mt-[2px] truncate text-[10px] text-slate-500">
                  {region.city} · {region.shortCode}
                </p>
              </div>

              <div className="relative mt-2.5 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <StatusDot tone="success" pulse={false} className="h-1 w-1" />
                  <SectionLabel className="text-[8px] tracking-[0.1em]">Online</SectionLabel>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-[3px] w-11 overflow-hidden rounded-full bg-white/[0.08]">
                    <div
                      className={cn("h-full rounded-full", barColor)}
                      style={{ width: `${region.load}%` }}
                    />
                  </div>
                  <span className="font-mono text-[8.5px] text-slate-500">{region.load}%</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
