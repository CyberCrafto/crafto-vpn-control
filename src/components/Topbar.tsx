import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Bell,
  CheckCircle2,
  Menu,
  Moon,
  Server,
  Settings2,
  ShieldOff,
  Sun,
  Wifi,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useApp } from "../state/AppStore";
import { useTheme } from "../theme/ThemeProvider";
import { useNow } from "../hooks/useNow";
import { formatTimeAgo } from "../lib/format";
import { LogoMark } from "./Logo";
import { StatusDot } from "./ui";
import { cn } from "../utils/cn";
import type { Page } from "../lib/types";

interface TopbarProps {
  page: Page;
  onOpenSidebar: () => void;
  onNavigate: (page: Page) => void;
  onSettings: () => void;
}

const PAGE_LABEL: Record<Page, string> = {
  dashboard: "VPN Dashboard",
  terminal: "AI Terminal",
};

export function Topbar({ page, onOpenSidebar, onNavigate, onSettings }: TopbarProps) {
  const { messages, busy, vpn } = useApp();
  const { theme, setTheme } = useTheme();
  const now = useNow(15000);
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(1);
  const panelRef = useRef<HTMLDivElement>(null);

  const events = messages
    .filter((m) => m.kind === "system" && m.source === "dashboard")
    .slice(-6)
    .reverse();

  useEffect(() => {
    if (!open) return;
    const handler = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <header className="relative z-30 flex h-[62px] shrink-0 items-center justify-between gap-4 border-b border-white/[0.055] bg-[#070c15]/80 px-4 backdrop-blur-xl lg:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="rounded-lg border border-white/10 p-2 text-slate-300 hover:bg-white/5 lg:hidden"
          aria-label="Open navigation"
        >
          <Menu className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-2.5">
          <LogoMark className="h-[26px] w-[26px] rounded-lg" />
          <span className="hidden text-[12.5px] font-medium tracking-[-0.01em] text-slate-200 sm:inline">
            Crafto VPN Control
          </span>
        </div>
        <span className="hidden h-4 w-px bg-white/10 md:block" />
        <span className="hidden truncate text-[11.5px] font-medium text-slate-500 sm:inline">{PAGE_LABEL[page]}</span>
        <span className="hidden items-center gap-1.5 rounded-full border border-white/[0.07] bg-white/[0.02] px-2 py-[3px] text-[9.5px] font-medium uppercase tracking-[0.12em] text-slate-400 md:inline-flex">
          {vpn.connected ? "Protected" : "Unprotected"}
        </span>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <div className="hidden items-center gap-1.5 text-[11px] text-slate-400 xl:flex">
          <span className="relative flex h-4 w-4 items-center justify-center">
            <Wifi className="h-3.5 w-3.5 text-emerald-400/90" />
          </span>
          <span className="font-medium text-slate-300">Online</span>
          <span className="text-slate-600">·</span>
          <span className="text-slate-500">All systems operational</span>
        </div>

        <div className="hidden items-center gap-2 rounded-lg border border-emerald-400/[0.14] bg-emerald-400/[0.055] px-2.5 py-[5px] sm:flex">
          <StatusDot tone="success" pulse={!busy} />
          <span className="text-[10.5px] font-medium text-emerald-200/90">MCP Connected</span>
          <span className="font-mono text-[9.5px] text-emerald-300/50">
            {busy ? "exec" : "12ms"}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <div
            role="group"
            aria-label="Color theme"
            className="flex items-center gap-[2px] rounded-lg border border-white/[0.08] bg-white/[0.02] p-[2px]"
          >
            <button
              type="button"
              onClick={() => setTheme("dark")}
              aria-pressed={theme === "dark"}
              title="Dark theme"
              aria-label="Switch to dark theme"
              className="theme-switch-btn flex h-[26px] w-[27px] items-center justify-center rounded-[6px]"
            >
              <Moon className="h-[13px] w-[13px]" />
            </button>
            <button
              type="button"
              onClick={() => setTheme("light")}
              aria-pressed={theme === "light"}
              title="Light theme"
              aria-label="Switch to light theme"
              className="theme-switch-btn flex h-[26px] w-[27px] items-center justify-center rounded-[6px]"
            >
              <Sun className="h-[13px] w-[13px]" />
            </button>
          </div>

          <div className="relative" ref={panelRef}>
            <button
              onClick={() => {
                setOpen((v) => !v);
                setUnread(0);
              }}
              aria-label="Activity notifications"
              aria-expanded={open}
              className={cn(
                "relative rounded-lg border border-transparent p-2 text-slate-400 transition-colors hover:border-white/10 hover:bg-white/[0.04] hover:text-slate-200",
                open && "border-white/10 bg-white/[0.05] text-slate-100",
              )}
            >
              <Bell className="h-[17px] w-[17px]" />
              {unread > 0 && (
                <span className="absolute right-1.5 top-1.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-sky-500 px-1 text-[8.5px] font-bold text-[#ffffff] ring-2 ring-[#070c15]">
                  {unread}
                </span>
              )}
            </button>

            <AnimatePresence>
              {open && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.985 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.985 }}
                  transition={{ duration: 0.16, ease: "easeOut" }}
                  className="absolute right-0 top-[calc(100%+10px)] w-[336px] overflow-hidden rounded-xl border border-white/[0.09] bg-[#0a111d] shadow-[0_28px_70px_-20px_rgba(0,0,0,0.95)]"
                >
                  <div className="flex items-center justify-between border-b border-white/[0.06] px-3.5 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[11.5px] font-semibold text-slate-200">Activity</span>
                      <span className="rounded bg-white/[0.06] px-1.5 py-[1px] font-mono text-[9px] text-slate-400">
                        {events.length}
                      </span>
                    </div>
                    <button
                      onClick={() => setOpen(false)}
                      className="rounded p-1 text-slate-500 hover:bg-white/5 hover:text-slate-300"
                      aria-label="Close activity"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="max-h-[320px] overflow-y-auto p-1.5">
                    {events.length === 0 && (
                      <div className="px-3 py-6 text-center text-[11px] leading-relaxed text-slate-500">
                        Operations you run from the dashboard will appear here.
                      </div>
                    )}
                    {events.map((event) => {
                      if (event.kind !== "system") return null;
                      const warning = event.tone === "warning";
                      return (
                        <div
                          key={event.id}
                          className="flex gap-2.5 rounded-lg px-2 py-2 transition-colors hover:bg-white/[0.03]"
                        >
                          <span
                            className={cn(
                              "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border",
                              warning
                                ? "border-amber-400/20 bg-amber-400/[0.08] text-amber-300"
                                : "border-emerald-400/20 bg-emerald-400/[0.08] text-emerald-300",
                            )}
                          >
                            {warning ? (
                              <ShieldOff className="h-3 w-3" />
                            ) : (
                              <CheckCircle2 className="h-3 w-3" />
                            )}
                          </span>
                          <div className="min-w-0">
                            <p className="text-[11px] leading-snug text-slate-300">{event.text}</p>
                            <p className="mt-0.5 font-mono text-[9px] text-slate-600">
                              {formatTimeAgo(event.at, now)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => {
                      onNavigate("terminal");
                      setOpen(false);
                    }}
                    className="flex w-full items-center justify-between border-t border-white/[0.06] px-3.5 py-2.5 text-[10.5px] font-medium text-sky-300 transition-colors hover:bg-sky-400/[0.06]"
                  >
                    Open in AI console
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={onSettings}
            aria-label="VPN settings"
            title="VPN settings"
            className="rounded-lg border border-transparent p-2 text-slate-400 transition-colors hover:border-white/10 hover:bg-white/[0.04] hover:text-slate-200"
          >
            <Settings2 className="h-[17px] w-[17px]" />
          </button>
        </div>

        <span className="hidden h-5 w-px bg-white/[0.08] sm:block" />
        <div className="hidden items-center gap-2 sm:flex">
          <div className="relative flex h-7 w-7 items-center justify-center rounded-full border border-white/[0.1] bg-gradient-to-br from-[#16233a] to-[#0c1421]">
            <Server className="h-3.5 w-3.5 text-slate-400" />
            <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-[#070c15]" />
          </div>
        </div>
      </div>
    </header>
  );
}
