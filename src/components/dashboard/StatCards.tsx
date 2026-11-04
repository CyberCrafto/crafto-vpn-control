import { Activity, ArrowDownToLine, ArrowUpFromLine, Database } from "lucide-react";
import { useApp } from "../../state/AppStore";
import { formatData } from "../../lib/format";
import { Sparkline } from "../ui";
import { cn } from "../../utils/cn";

export function StatCards() {
  const { vpn, region } = useApp();
  const active = vpn.connected;
  const data = formatData(vpn.dataMB);
  const ping = active ? vpn.speed.ping : null;
  const pingQuality = ping === null ? "Offline" : ping < 40 ? "Excellent" : ping < 90 ? "Good" : "Elevated";

  const stats = [
    {
      label: "Download Speed",
      value: active ? vpn.speed.down.toFixed(1) : "0.0",
      unit: "Mbps",
      icon: <ArrowDownToLine className="h-3.5 w-3.5" />,
      accent: "text-cyan-300",
      tile: "border-cyan-400/15 bg-cyan-400/[0.06]",
      footer: active ? `Peak ${Math.max(...vpn.downHistory).toFixed(1)} Mbps` : "Tunnel offline",
      spark: active ? vpn.downHistory : null,
      color: "#3fe0d8",
    },
    {
      label: "Upload Speed",
      value: active ? vpn.speed.up.toFixed(1) : "0.0",
      unit: "Mbps",
      icon: <ArrowUpFromLine className="h-3.5 w-3.5" />,
      accent: "text-sky-300",
      tile: "border-sky-400/15 bg-sky-400/[0.06]",
      footer: active ? `Peak ${Math.max(...vpn.upHistory).toFixed(1)} Mbps` : "Tunnel offline",
      spark: active ? vpn.upHistory : null,
      color: "#5aa9ff",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="panel group relative overflow-hidden rounded-xl px-3.5 py-3 transition-colors hover:border-white/[0.14]"
        >
          <div className="flex items-center justify-between">
            <span className="text-[9.5px] font-medium uppercase tracking-[0.12em] text-slate-500">
              {stat.label}
            </span>
            <span className={cn("flex h-5 w-5 items-center justify-center rounded-[5px] border", stat.tile, stat.accent)}>
              {stat.icon}
            </span>
          </div>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="font-mono text-[20px] font-medium leading-none tracking-[-0.03em] text-white tabular-nums">
              {stat.value}
            </span>
            <span className="text-[9.5px] text-slate-500">{stat.unit}</span>
          </div>
          {stat.spark ? (
            <div className="mt-1 h-[18px] opacity-90">
              <Sparkline
                data={stat.spark}
                color={stat.color}
                className="h-[18px]"
                strokeWidth={1.3}
                fill={false}
              />
            </div>
          ) : (
            <div className="mt-1 h-[18px]">
              <div className="mt-2 h-px w-full bg-white/[0.045]" />
            </div>
          )}
          <p className="mt-1 truncate text-[9px] text-slate-600">{stat.footer}</p>
        </div>
      ))}

      <div className="panel group relative overflow-hidden rounded-xl px-3.5 py-3 transition-colors hover:border-white/[0.14]">
        <div className="flex items-center justify-between">
          <span className="text-[9.5px] font-medium uppercase tracking-[0.12em] text-slate-500">Ping</span>
          <span className="flex h-5 w-5 items-center justify-center rounded-[5px] border border-emerald-400/15 bg-emerald-400/[0.06] text-emerald-300">
            <Activity className="h-3.5 w-3.5" />
          </span>
        </div>
        <div className="mt-1.5 flex items-baseline gap-1.5">
          <span className="font-mono text-[20px] font-medium leading-none tracking-[-0.03em] text-white tabular-nums">
            {ping ?? "—"}
          </span>
          {ping !== null && <span className="text-[9.5px] text-slate-500">ms</span>}
        </div>
        <div className="mt-[9px] flex items-center gap-2">
          <div className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className={cn(
                "h-full rounded-full",
                pingQuality === "Excellent"
                  ? "bg-emerald-400/80"
                  : pingQuality === "Good"
                    ? "bg-cyan-400/80"
                    : pingQuality === "Elevated"
                      ? "bg-amber-400/80"
                      : "bg-slate-600",
              )}
              style={{ width: ping === null ? "0%" : `${Math.max(12, Math.min(100, 100 - region.ping / 2))}%` }}
            />
          </div>
          <span className="font-mono text-[8.5px] text-slate-500">{pingQuality}</span>
        </div>
        <p className="mt-1 truncate text-[9px] text-slate-600">
          {active ? `Jitter ${(region.ping / 9).toFixed(1)} ms` : "No active route"}
        </p>
      </div>

      <div className="panel group relative overflow-hidden rounded-xl px-3.5 py-3 transition-colors hover:border-white/[0.14]">
        <div className="flex items-center justify-between">
          <span className="text-[9.5px] font-medium uppercase tracking-[0.12em] text-slate-500">
            Data Transferred
          </span>
          <span className="flex h-5 w-5 items-center justify-center rounded-[5px] border border-violet-400/15 bg-violet-400/[0.06] text-violet-300">
            <Database className="h-3.5 w-3.5" />
          </span>
        </div>
        <div className="mt-1.5 flex items-baseline gap-1.5">
          <span className="font-mono text-[20px] font-medium leading-none tracking-[-0.03em] text-white tabular-nums">
            {data.value}
          </span>
          <span className="text-[9.5px] text-slate-500">{data.unit}</span>
        </div>
        <div className="mt-[9px] h-[3px] w-full overflow-hidden rounded-full bg-white/[0.06]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-violet-400/80 to-sky-400/80"
            style={{ width: `${Math.min(100, Math.max(6, (vpn.dataMB % 1024) / 10.24))}%` }}
          />
        </div>
        <p className="mt-1 truncate text-[9px] text-slate-600">
          {active ? "Current session · live" : "Last session total"}
        </p>
      </div>
    </div>
  );
}
