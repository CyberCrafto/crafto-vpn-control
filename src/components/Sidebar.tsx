import {
  LayoutDashboard,
  Loader2,
  LockKeyhole,
  Power,
  Settings2,
  ShieldCheck,
  ShieldOff,
  Sparkles,
  TerminalSquare,
  X,
} from "lucide-react";
import { useApp } from "../state/AppStore";
import { Flag } from "./Flag";
import { Logo } from "./Logo";
import { Kbd, SectionLabel, StatusDot } from "./ui";
import { cn } from "../utils/cn";
import type { Page } from "../lib/types";

interface SidebarProps {
  page: Page;
  onNavigate: (page: Page) => void;
  onSettings: () => void;
  onClose?: () => void;
}

export function Sidebar({ page, onNavigate, onSettings, onClose }: SidebarProps) {
  const { vpn, region, toggleConnection, isSwitching, busy, activeTool } = useApp();

  const navItem = (target: Page, label: string, icon: React.ReactNode, shortcut: string) => {
    const active = page === target;
    return (
      <button
        key={target}
        onClick={() => onNavigate(target)}
        aria-current={active ? "page" : undefined}
        className={cn(
          "group relative flex w-full items-center gap-3 rounded-[10px] px-3 py-2.5 text-left text-[13px] font-medium transition-all duration-200",
          active
            ? "bg-gradient-to-r from-sky-500/[0.16] to-cyan-400/[0.055] text-white"
            : "text-slate-400 hover:bg-white/[0.035] hover:text-slate-200",
        )}
      >
        {active && (
          <span className="absolute inset-y-2 left-0 w-[2px] rounded-full bg-gradient-to-b from-sky-400 to-cyan-300 shadow-[0_0_10px_rgba(56,189,248,0.8)]" />
        )}
        <span className={cn("transition-colors", active ? "text-sky-300" : "text-slate-500 group-hover:text-slate-300")}>
          {icon}
        </span>
        <span className="flex-1">{label}</span>
        {target === "terminal" && target !== page && (
          <span className="rounded border border-cyan-400/20 bg-cyan-400/10 px-1.5 py-[1px] font-mono text-[9px] font-medium tracking-wide text-cyan-300">
            AI
          </span>
        )}
        <Kbd className={cn("hidden xl:inline-flex", active && "border-sky-400/20 text-sky-300/80")}>
          {shortcut}
        </Kbd>
      </button>
    );
  };

  return (
    <aside className="flex h-full w-[264px] shrink-0 flex-col border-r border-white/[0.055] bg-[#070c15]">
      <div className="flex items-center justify-between px-5 pb-5 pt-5">
        <button
          onClick={() => onNavigate("dashboard")}
          className="rounded-xl text-left transition-opacity hover:opacity-90"
          aria-label="Crafto VPN Control home"
        >
          <Logo />
        </button>
        {onClose && (
          <button
            onClick={onClose}
            className="rounded-lg border border-white/10 p-1.5 text-slate-400 hover:text-white lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-3 pb-3">
        <div className="px-3 pb-2 pt-1">
          <SectionLabel>Workspace</SectionLabel>
        </div>
        <nav className="space-y-1" aria-label="Primary">
          {navItem("dashboard", "VPN Dashboard", <LayoutDashboard className="h-[17px] w-[17px]" />, "1")}
          {navItem("terminal", "AI Terminal", <TerminalSquare className="h-[17px] w-[17px]" />, "2")}
        </nav>

        <div className="mx-3 my-4 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />

        {/* tunnel quick control */}
        <div
          className={cn(
            "relative overflow-hidden rounded-xl border p-3.5 transition-colors",
            vpn.connected
              ? "border-emerald-400/[0.14] bg-[#0a1720]"
              : "border-white/[0.07] bg-[#0a101b]",
          )}
        >
          <div
            className={cn(
              "pointer-events-none absolute -right-6 -top-8 h-24 w-24 rounded-full blur-2xl",
              vpn.connected ? "bg-emerald-400/10" : "bg-slate-500/10",
            )}
          />
          <div className="relative flex items-center justify-between">
            <SectionLabel>Tunnel</SectionLabel>
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-2 py-[3px] text-[9.5px] font-semibold uppercase tracking-wider",
                vpn.connected
                  ? "bg-emerald-400/10 text-emerald-300"
                  : "bg-slate-500/10 text-slate-400",
              )}
            >
              <StatusDot tone={vpn.connected ? "success" : "offline"} pulse={vpn.connected} />
              {vpn.connected ? "Active" : "Offline"}
            </span>
          </div>

          <div className="relative mt-3 flex items-center gap-2.5">
            <Flag code={region.id} size="md" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12.5px] font-medium text-slate-100">{region.city}</p>
              <p className="truncate text-[10.5px] text-slate-500">{region.country}</p>
            </div>
          </div>

          <button
            onClick={toggleConnection}
            disabled={isSwitching || busy}
            className={cn(
              "relative mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border py-[7px] text-[11.5px] font-medium transition-all duration-200",
              vpn.connected
                ? "border-white/10 bg-white/[0.04] text-slate-300 hover:border-rose-400/25 hover:bg-rose-500/10 hover:text-rose-200"
                : "border-sky-400/25 bg-sky-500/[0.14] text-sky-200 hover:bg-sky-500/20",
              (isSwitching || busy) && "cursor-not-allowed opacity-70",
            )}
          >
            {isSwitching ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Power className="h-3.5 w-3.5" />
            )}
            {isSwitching ? "Applying…" : vpn.connected ? "Disconnect" : "Connect"}
          </button>
        </div>

        {/* MCP status */}
        <div className="mt-3 rounded-xl border border-white/[0.06] bg-white/[0.014] p-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md border border-sky-400/20 bg-sky-400/[0.08] text-sky-300">
                <Sparkles className="h-3 w-3" />
              </span>
              <span className="text-[11.5px] font-medium text-slate-300">MCP Server</span>
            </div>
            <span className="flex items-center gap-1.5 text-[10px] font-medium text-emerald-300">
              <StatusDot tone="success" />
              Connected
            </span>
          </div>
          <div className="mt-2.5 flex items-center justify-between border-t border-white/[0.05] pt-2.5 text-[10.5px]">
            <span className="text-slate-500">VPN Controller</span>
            <span className="flex items-center gap-1.5 font-medium text-slate-300">
              <StatusDot tone="info" pulse={false} />
              Available
            </span>
          </div>
          <div className="mt-1.5 flex items-center justify-between text-[10.5px]">
            <span className="text-slate-500">Tools registered</span>
            <span className="font-mono text-slate-400">8</span>
          </div>
          <div className="mt-1.5 flex items-center justify-between text-[10.5px]">
            <span className="text-slate-500">Round trip</span>
            <span className="font-mono text-slate-400">{busy && activeTool ? "executing" : "12 ms"}</span>
          </div>
        </div>

        <div className="mt-auto pt-4">
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.014] p-3.5">
            <div className="flex items-center gap-2 text-[11px] font-medium text-slate-300">
              {vpn.networkLock ? (
                <LockKeyhole className="h-3.5 w-3.5 text-cyan-300" />
              ) : (
                <ShieldOff className="h-3.5 w-3.5 text-slate-500" />
              )}
              Network Lock
              <span
                className={cn(
                  "ml-auto font-mono text-[9.5px] uppercase tracking-wider",
                  vpn.networkLock ? "text-cyan-300/90" : "text-slate-500",
                )}
              >
                {vpn.networkLock ? "Armed" : "Off"}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between text-[10.5px]">
              <span className="text-slate-500">Auto Connect</span>
              <span className="flex items-center gap-1.5 text-slate-400">
                <ShieldCheck className="h-3 w-3" />
                {vpn.autoConnect ? "On launch" : "Disabled"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/[0.055] p-3">
        <div className="flex items-center gap-2.5 rounded-lg px-1.5 py-1.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-sky-300/20 bg-gradient-to-br from-sky-500/30 to-cyan-400/15 text-[11px] font-semibold text-sky-100">
            SC
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[12px] font-medium text-slate-200">Shahin Crafto</p>
            <p className="truncate text-[10px] text-slate-500">Administrator</p>
          </div>
          <button
            onClick={onSettings}
            title="VPN settings"
            aria-label="Open VPN settings"
            className="rounded-md border border-transparent p-1.5 text-slate-500 transition-colors hover:border-white/10 hover:bg-white/[0.04] hover:text-slate-200"
          >
            <Settings2 className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-1.5 px-1.5 font-mono text-[9px] tracking-wide text-slate-600">
          v2.4.0 · build 2026.02.18
        </p>
      </div>
    </aside>
  );
}
