import {
  ArrowDownUp,
  Clock3,
  Fingerprint,
  Loader2,
  LockKeyhole,
  Power,
  ServerCog,
  ShieldCheck,
} from "lucide-react";
import { motion } from "framer-motion";
import { useApp } from "../../state/AppStore";
import { useNow } from "../../hooks/useNow";
import { formatDataShort, formatDuration } from "../../lib/format";
import { Flag } from "../Flag";
import { cn } from "../../utils/cn";

export function ConnectionCard() {
  const { vpn, region, toggleConnection, isSwitching, busy } = useApp();
  const now = useNow(1000);
  const connected = vpn.connected;

  const details = [
    {
      label: "VPN IP Address",
      value: connected ? region.ip : "—",
      icon: <Fingerprint className="h-3.5 w-3.5" />,
      mono: true,
    },
    {
      label: "Connection Duration",
      value: connected ? formatDuration(vpn.connectedAt, now) : "00:00:00",
      icon: <Clock3 className="h-3.5 w-3.5" />,
      mono: true,
    },
    {
      label: "Protocol",
      value: vpn.protocol,
      icon: <ServerCog className="h-3.5 w-3.5" />,
      mono: false,
    },
    {
      label: "Data Routed",
      value: connected ? formatDataShort(vpn.dataMB) : "0 MB",
      icon: <ArrowDownUp className="h-3.5 w-3.5" />,
      mono: true,
    },
  ];

  return (
    <section className="panel relative flex h-full flex-col overflow-hidden rounded-2xl">
      <div className="hairline-grid pointer-events-none absolute inset-0 opacity-70" />
      <div
        className={cn(
          "pointer-events-none absolute -left-24 -top-28 h-72 w-72 rounded-full blur-[90px] transition-colors duration-700",
          connected ? "bg-emerald-400/[0.09]" : "bg-rose-500/[0.06]",
        )}
      />
      <div className="pointer-events-none absolute -right-16 bottom-0 h-56 w-56 rounded-full bg-sky-500/[0.07] blur-[80px]" />

      <div className="relative flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2.5">
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-2 py-[3px] text-[9.5px] font-semibold uppercase tracking-[0.12em]",
                  connected
                    ? "border-emerald-400/20 bg-emerald-400/[0.08] text-emerald-300"
                    : "border-rose-400/20 bg-rose-400/[0.07] text-rose-300",
                )}
              >
                <span className="relative flex h-1.5 w-1.5">
                  <span
                    className={cn(
                      "absolute inline-flex h-full w-full rounded-full",
                      connected ? "bg-emerald-400" : "bg-rose-400",
                    )}
                  />
                  {connected && (
                    <span className="ping-soft absolute inline-flex h-full w-full rounded-full text-emerald-400" />
                  )}
                </span>
                {isSwitching ? "Applying" : connected ? "Connected" : "Disconnected"}
              </span>
              <span className="text-[9.5px] font-medium uppercase tracking-[0.16em] text-slate-500">
                Connection status
              </span>
            </div>

            <div className="mt-3.5 flex items-center gap-3">
              <div className="relative">
                <Flag code={region.id} size="xl" className="ring-white/20" />
                <span
                  className={cn(
                    "absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-[#0a111d]",
                    connected ? "bg-emerald-400" : "bg-slate-500",
                  )}
                />
              </div>
              <div className="min-w-0">
                <h2 className="flex flex-wrap items-baseline gap-x-2 text-[23px] font-semibold leading-tight tracking-[-0.025em] text-white">
                  {region.city}
                  <span className="text-[13px] font-normal text-slate-400">{region.country}</span>
                </h2>
                <p className="mt-1 truncate font-mono text-[10.5px] text-slate-500">{region.server}</p>
              </div>
            </div>
          </div>

          <div className="relative hidden h-[104px] w-[104px] shrink-0 items-center justify-center sm:flex">
            <div
              className={cn(
                "spin-slower absolute inset-0 rounded-full border border-dashed",
                connected ? "border-emerald-300/20" : "border-white/[0.07]",
              )}
            />
            <div className="spin-slow absolute inset-[13px] rounded-full border border-white/[0.055]">
              <span
                className={cn(
                  "absolute -top-[2.5px] left-1/2 h-[5px] w-[5px] -translate-x-1/2 rounded-full",
                  connected ? "bg-cyan-300 shadow-[0_0_8px_2px_rgba(63,224,216,0.75)]" : "bg-slate-600",
                )}
              />
            </div>
            <div
              className={cn(
                "relative flex h-[70px] w-[70px] items-center justify-center rounded-full border transition-all duration-500",
                connected
                  ? "border-emerald-300/25 bg-emerald-400/[0.07] shadow-[0_0_35px_-6px_rgba(52,211,153,0.4)]"
                  : "border-white/10 bg-white/[0.02]",
              )}
            >
              {isSwitching ? (
                <Loader2 className="h-7 w-7 animate-spin text-sky-300" />
              ) : connected ? (
                <ShieldCheck className="h-8 w-8 text-emerald-300" strokeWidth={1.6} />
              ) : (
                <ShieldCheck className="h-8 w-8 text-slate-600" strokeWidth={1.6} />
              )}
            </div>
            <span
              className={cn(
                "absolute -bottom-1 rounded-full border px-2 py-[2px] font-mono text-[8.5px] uppercase tracking-[0.16em]",
                connected
                  ? "border-emerald-400/20 bg-[#0a1a1a] text-emerald-300/90"
                  : "border-white/10 bg-[#0b1220] text-slate-500",
              )}
            >
              {connected ? "Encrypted" : "Standby"}
            </span>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.045] sm:grid-cols-4">
          {details.map((item) => (
            <div key={item.label} className="bg-[#0a1220]/95 px-3 py-2.5">
              <div className="flex items-center gap-1.5 text-slate-500">
                {item.icon}
                <span className="text-[9px] font-medium uppercase tracking-[0.1em]">{item.label}</span>
              </div>
              <p
                className={cn(
                  "mt-1.5 truncate text-[13px] font-semibold text-slate-100",
                  item.mono && "font-mono text-[12px] tracking-tight",
                )}
                title={item.value}
              >
                {item.value}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-auto flex flex-col gap-3 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <motion.button
            whileTap={{ scale: 0.99 }}
            onClick={toggleConnection}
            disabled={isSwitching || busy}
            className={cn(
              "group relative inline-flex h-[46px] w-full items-center justify-center gap-2.5 overflow-hidden rounded-xl px-6 text-[13px] font-semibold transition-all duration-300 sm:w-[224px]",
              connected
                ? "border border-rose-400/25 bg-rose-500/[0.09] text-rose-200 hover:border-rose-400/40 hover:bg-rose-500/[0.15]"
                : "border border-sky-300/30 bg-gradient-to-r from-[#1d7bff] via-[#2296ff] to-[#2bbfd4] text-[#ffffff] shadow-[0_12px_34px_-12px_rgba(46,144,255,0.85)] hover:brightness-110",
              (isSwitching || busy) && "cursor-wait opacity-80",
            )}
          >
            <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/25" />
            {isSwitching ? (
              <Loader2 className="h-[17px] w-[17px] animate-spin" />
            ) : (
              <Power className="h-[17px] w-[17px]" strokeWidth={2.2} />
            )}
            {isSwitching ? "Negotiating tunnel…" : connected ? "Disconnect VPN" : "Connect VPN"}
          </motion.button>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[10.5px] text-slate-500">
            <span className="flex items-center gap-1.5">
              <LockKeyhole
                className={cn("h-3 w-3", vpn.networkLock ? "text-cyan-300/90" : "text-slate-600")}
              />
              Network Lock {vpn.networkLock ? "armed" : "off"}
            </span>
            <span className="hidden h-3 w-px bg-white/10 sm:block" />
            <span className="flex items-center gap-1.5">
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  connected ? "bg-emerald-400" : "bg-slate-600",
                )}
              />
              {connected ? `${region.ping} ms round trip` : "No active tunnel"}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
