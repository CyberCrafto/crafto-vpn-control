import { useEffect } from "react";
import { ChevronRight, Loader2, Sparkles, Zap } from "lucide-react";
import { useApp } from "../../state/AppStore";
import { ConnectionCard } from "./ConnectionCard";
import { TrafficCard } from "./TrafficCard";
import { StatCards } from "./StatCards";
import { LocationGrid } from "./LocationGrid";
import { SettingsCard } from "./SettingsCard";
import type { Page } from "../../lib/types";
import { cn } from "../../utils/cn";

interface DashboardProps {
  onNavigate: (page: Page) => void;
  highlightSettings: boolean;
}

export function Dashboard({ onNavigate, highlightSettings }: DashboardProps) {
  const { vpn, runSpeedTest, isTesting, busy } = useApp();

  useEffect(() => {
    if (!highlightSettings) return;
    const timer = window.setTimeout(() => {
      document.getElementById("vpn-settings")?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 160);
    return () => window.clearTimeout(timer);
  }, [highlightSettings]);

  return (
    <div className="mx-auto w-full max-w-[1560px] space-y-4 p-4 md:p-5 lg:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.16em] text-slate-600">
            <span className="text-slate-500">Control plane</span>
            <ChevronRight className="h-2.5 w-2.5" />
            <span>Overview</span>
          </div>
          <h1 className="mt-1.5 text-[24px] font-semibold leading-tight tracking-[-0.03em] text-white">
            Network overview
          </h1>
          <p className="mt-1 text-[12px] text-slate-500">
            Monitor your tunnel, route traffic and keep every connection protected.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={runSpeedTest}
            disabled={!vpn.connected || isTesting || busy}
            className={cn(
              "inline-flex h-[34px] items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.025] px-3 text-[11.5px] font-medium text-slate-300 transition-colors hover:border-white/[0.16] hover:bg-white/[0.05] hover:text-white",
              (!vpn.connected || isTesting || busy) && "cursor-not-allowed opacity-50",
            )}
          >
            {isTesting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-cyan-300" />
            ) : (
              <Zap className="h-3.5 w-3.5 text-cyan-300" />
            )}
            {isTesting ? "Testing…" : "Speed test"}
          </button>
          <button
            onClick={() => onNavigate("terminal")}
            className="group inline-flex h-[34px] items-center gap-1.5 rounded-lg border border-sky-300/25 bg-gradient-to-r from-[#1a6fe8]/25 to-[#25b6c9]/20 px-3 text-[11.5px] font-medium text-sky-100 transition-all hover:border-sky-300/40 hover:from-[#1a6fe8]/35 hover:to-[#25b6c9]/25"
          >
            <Sparkles className="h-3.5 w-3.5 text-cyan-300" />
            Ask AI Agent
            <ChevronRight className="h-3 w-3 text-sky-300/70 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div className="xl:col-span-8">
          <ConnectionCard />
        </div>
        <div className="xl:col-span-4">
          <TrafficCard />
        </div>
      </div>

      <StatCards />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div className="xl:col-span-8">
          <LocationGrid />
        </div>
        <div className="xl:col-span-4">
          <SettingsCard highlight={highlightSettings} onNavigate={() => onNavigate("terminal")} />
        </div>
      </div>

      <div className="flex items-center justify-between px-1 pb-1 pt-0.5 text-[9.5px] text-slate-600">
        <span className="flex items-center gap-1.5">
          <span className="h-1 w-1 rounded-full bg-emerald-400/80" />
          Crafto Edge network · 8 regions operational
        </span>
        <span className="hidden font-mono sm:block">control plane · eu-central-1</span>
      </div>
    </div>
  );
}
