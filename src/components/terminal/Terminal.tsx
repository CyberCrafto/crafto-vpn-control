import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  ArrowDown,
  Check,
  CornerDownLeft,
  Copy,
  Gauge,
  Globe2,
  Lock,
  MapPin,
  PowerOff,
  Radio,
  Sparkles,
  TerminalSquare,
  Trash2,
} from "lucide-react";
import { useApp } from "../../state/AppStore";
import { SUGGESTED_COMMANDS } from "../../lib/commands";
import { LogoMark } from "../Logo";
import { StatusDot } from "../ui";
import { MessageList } from "./Messages";
import { ContextRail } from "./ContextRail";
import { cn } from "../../utils/cn";
import type { Page } from "../../lib/types";

const SUGGESTION_ICONS = [Globe2, MapPin, PowerOff, Activity, Gauge];

export function Terminal({ onNavigate }: { onNavigate: (page: Page) => void }) {
  const { messages, busy, activeTool, runCommand, clearTerminal, commandCount, history, transcript, region, vpn } =
    useApp();
  const [input, setInput] = useState("");
  const [copied, setCopied] = useState(false);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [pinned, setPinned] = useState(true);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const sessionId = useMemo(
    () => `mcp_${Math.random().toString(36).slice(2, 8)}${Math.random().toString(36).slice(2, 5)}`,
    [],
  );

  const lastMessage = messages[messages.length - 1];
  const lastLength = lastMessage ? ("text" in lastMessage ? lastMessage.text.length : 0) : 0;

  useEffect(() => {
    const node = scrollRef.current;
    if (!node || !pinned) return;
    node.scrollTop = node.scrollHeight;
  }, [messages.length, lastLength, busy, activeTool, pinned]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const submit = (raw?: string) => {
    const value = (raw ?? input).trim();
    if (!value || busy) return;
    runCommand(value);
    if (raw === undefined) setInput("");
    setHistoryIndex(-1);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(transcript());
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  const handleHistory = (direction: -1 | 1) => {
    if (!history.length) return;
    let next = historyIndex;
    if (direction === -1) {
      next = historyIndex < 0 ? history.length - 1 : Math.max(0, historyIndex - 1);
    } else {
      if (historyIndex < 0) return;
      next = historyIndex + 1;
      if (next >= history.length) {
        setHistoryIndex(-1);
        setInput("");
        return;
      }
    }
    setHistoryIndex(next);
    setInput(history[next] ?? "");
  };

  return (
    <div className="flex h-full min-h-0 flex-col px-4 pb-4 pt-3.5 md:px-5 lg:px-6 lg:pb-5">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="flex items-center gap-2 text-[20px] font-semibold tracking-[-0.03em] text-white">
              <Sparkles className="h-4 w-4 text-cyan-300" />
              AI Terminal
            </h1>
            <span className="rounded border border-cyan-400/15 bg-cyan-400/[0.05] px-1.5 py-[1px] font-mono text-[8.5px] uppercase tracking-[0.12em] text-cyan-300/80">
              beta
            </span>
          </div>
          <p className="mt-1 text-[11.5px] text-slate-500">
            Operate your VPN in natural language — every action executes through an MCP tool call.
          </p>
        </div>
        <div className="flex items-center gap-2 font-mono text-[9px] text-slate-600">
          <span className="flex items-center gap-1 rounded border border-emerald-400/15 bg-emerald-400/[0.05] px-1.5 py-[2px] text-emerald-300/90 md:hidden">
            <span className="h-1 w-1 rounded-full bg-emerald-400" />
            MCP Connected
          </span>
          <span className="flex items-center gap-1 rounded border border-sky-400/15 bg-sky-400/[0.05] px-1.5 py-[2px] text-sky-300/90 md:hidden">
            <span className="h-1 w-1 rounded-full bg-sky-400" />
            VPN Available
          </span>
          <span className="hidden items-center gap-1.5 sm:flex">
            <Radio className="h-3 w-3 text-emerald-400/70" />
            session {sessionId}
          </span>
          <span className="hidden h-3 w-px bg-white/10 sm:block" />
          <span>{commandCount} commands</span>
        </div>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 xl:grid-cols-12">
        <section className="relative flex min-h-[58vh] flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[#060b13] shadow-[0_30px_80px_-40px_rgba(0,0,0,0.95)] xl:col-span-9 xl:min-h-0">
          {/* console chrome */}
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.06] bg-[#080f1a]/90 px-3 py-2 md:px-3.5">
            <div className="flex min-w-0 items-center gap-2.5">
              <div className="relative">
                <LogoMark className="h-8 w-8" />
                <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border-2 border-[#080f1a] bg-emerald-400" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-[12px] font-semibold tracking-[-0.01em] text-slate-100">
                  Crafto AI Agent
                </p>
                <p className="truncate font-mono text-[8.5px] text-slate-500">
                  agent-v2.4 · mcp://local · encrypted
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <div className="hidden items-center gap-1.5 rounded-md border border-emerald-400/15 bg-emerald-400/[0.05] px-2 py-[4px] md:flex">
                <StatusDot tone="success" pulse={!busy} />
                <span className="text-[9px] font-medium uppercase tracking-[0.06em] text-slate-400">
                  MCP Server
                </span>
                <span className="text-[9px] font-semibold text-emerald-300">Connected</span>
              </div>
              <div className="hidden items-center gap-1.5 rounded-md border border-sky-400/15 bg-sky-400/[0.05] px-2 py-[4px] sm:flex">
                <StatusDot tone="info" pulse={false} />
                <span className="text-[9px] font-medium uppercase tracking-[0.06em] text-slate-400">
                  VPN Controller
                </span>
                <span className="text-[9px] font-semibold text-sky-300">Available</span>
              </div>
              <span className="hidden h-4 w-px bg-white/[0.08] lg:block" />
              <button
                onClick={handleCopy}
                disabled={busy}
                className="flex items-center gap-1 rounded-md border border-transparent px-1.5 py-1 text-[9.5px] font-medium text-slate-500 transition-colors hover:border-white/10 hover:bg-white/[0.04] hover:text-slate-200 disabled:opacity-40"
                title="Copy transcript"
              >
                {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                <span className="hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
              </button>
              <button
                onClick={clearTerminal}
                disabled={busy}
                className="flex items-center gap-1 rounded-md border border-transparent px-1.5 py-1 text-[9.5px] font-medium text-slate-500 transition-colors hover:border-white/[0.12] hover:bg-white/[0.04] hover:text-rose-200 disabled:opacity-40"
                title={busy ? "Available when the agent is idle" : "Clear terminal"}
              >
                <Trash2 className="h-3 w-3" />
                <span className="hidden sm:inline">Clear</span>
              </button>
            </div>
          </div>

          {/* session strip */}
          <div className="flex items-center justify-between gap-3 border-b border-white/[0.045] bg-white/[0.014] px-3 py-1.5 font-mono text-[8.5px] text-slate-600 md:px-3.5">
            <div className="flex min-w-0 items-center gap-2">
              <span className="flex items-center gap-1.5 text-slate-500">
                <Lock className="h-2.5 w-2.5 text-slate-600" />
                session
              </span>
              <span className="truncate text-slate-500">{sessionId}</span>
            </div>
            <div className="flex shrink-0 items-center gap-2.5">
              <span className="hidden sm:inline">
                {vpn.connected ? `${region.country} · ${region.ip}` : "tunnel offline"}
              </span>
              <span className="text-slate-700">|</span>
              <span className={cn(busy ? "text-sky-300" : "text-emerald-400/70")}>
                {busy ? (activeTool ? `run: ${activeTool}` : "agent thinking") : "agent ready"}
              </span>
            </div>
          </div>

          {/* transcript */}
          <div
            ref={scrollRef}
            onScroll={(event) => {
              const node = event.currentTarget;
              const distance = node.scrollHeight - node.scrollTop - node.clientHeight;
              setPinned(distance < 90);
            }}
            className="terminal-scroll relative min-h-0 flex-1 overflow-y-auto px-3 py-4 md:px-5"
          >
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="absolute -left-20 top-10 h-60 w-60 rounded-full bg-sky-500/[0.035] blur-[70px]" />
              <div className="absolute right-0 top-1/3 h-52 w-52 rounded-full bg-cyan-400/[0.025] blur-[70px]" />
            </div>
            <div className="relative">
              <MessageList messages={messages} />

              <AnimatePresence>
                {busy && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="mt-4 flex items-center gap-2.5 rounded-lg border border-white/[0.055] bg-white/[0.016] px-3 py-2"
                  >
                    <span className="relative flex h-4 w-4 items-center justify-center">
                      <span className="absolute h-4 w-4 rounded-full border border-sky-400/25" />
                      <span className="h-1.5 w-1.5 animate-ping rounded-full bg-sky-400" />
                    </span>
                    <p className="font-mono text-[10px] text-sky-200/80">
                      {activeTool ? (
                        <>
                          Executing <span className="text-cyan-300">{activeTool}</span> on the VPN controller
                        </>
                      ) : (
                        "Agent is analysing your request"
                      )}
                    </p>
                    <span className="ml-auto flex items-center gap-1">
                      {[0, 1, 2].map((i) => (
                        <span
                          key={i}
                          className="h-1 w-1 animate-bounce rounded-full bg-sky-400/70"
                          style={{ animationDelay: `${i * 120}ms` }}
                        />
                      ))}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <AnimatePresence>
              {!pinned && (
                <motion.button
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  onClick={() => {
                    const node = scrollRef.current;
                    if (node) node.scrollTop = node.scrollHeight;
                    setPinned(true);
                  }}
                  className="sticky bottom-2 left-1/2 z-20 mt-3 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-sky-400/25 bg-[#0b1a2b]/95 px-3 py-1.5 text-[9.5px] font-medium text-sky-200 shadow-lg backdrop-blur"
                >
                  <ArrowDown className="h-3 w-3" />
                  Jump to latest
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* composer */}
          <div className="relative z-10 border-t border-white/[0.065] bg-[#080e17] px-3 pb-2.5 pt-2.5 md:px-3.5">
            <div className="mb-2 flex items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1.5">
                {SUGGESTED_COMMANDS.map((suggestion, index) => {
                  const Icon = SUGGESTION_ICONS[index] ?? Sparkles;
                  return (
                    <button
                      key={suggestion.command}
                      onClick={() => {
                        setInput(suggestion.command);
                        submit(suggestion.command);
                      }}
                      disabled={busy}
                      className="flex shrink-0 items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.02] px-2.5 py-[4.5px] text-[9.5px] font-medium text-slate-400 transition-all hover:border-cyan-400/25 hover:bg-cyan-400/[0.06] hover:text-cyan-200 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Icon className="h-2.5 w-2.5 text-slate-500" />
                      {suggestion.label}
                    </button>
                  );
                })}
              </div>
              <span
                className={cn(
                  "hidden shrink-0 items-center gap-1.5 font-mono text-[8.5px] uppercase tracking-wider sm:flex",
                  busy ? "text-amber-300/80" : "text-slate-600",
                )}
              >
                <span className={cn("h-1 w-1 rounded-full", busy ? "bg-amber-400" : "bg-emerald-400/80")} />
                {busy ? "operation locked" : "agent idle"}
              </span>
            </div>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                submit();
              }}
            >
              <div
                className={cn(
                  "flex items-center gap-2 rounded-xl border bg-[#0a1320] px-2.5 py-1.5 transition-all duration-200",
                  busy
                    ? "border-amber-400/20"
                    : "border-white/[0.09] focus-within:border-sky-400/45 focus-within:shadow-[0_0_0_3px_rgba(46,144,255,0.08)]",
                )}
              >
                <span className={cn("pl-1 font-mono text-[14px]", busy ? "text-amber-300/70" : "text-cyan-300")}>
                  ❯
                </span>
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(event) => {
                    setInput(event.target.value);
                    setHistoryIndex(-1);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "ArrowUp") {
                      event.preventDefault();
                      handleHistory(-1);
                    } else if (event.key === "ArrowDown") {
                      event.preventDefault();
                      handleHistory(1);
                    }
                  }}
                  disabled={busy}
                  placeholder={
                    busy ? "Agent is executing a command — input is locked" : "Ask the agent to manage your VPN…"
                  }
                  spellCheck={false}
                  autoComplete="off"
                  className="h-9 min-w-0 flex-1 bg-transparent font-mono text-[12px] text-slate-100 outline-none placeholder:text-slate-600 disabled:cursor-not-allowed"
                  aria-label="Agent command"
                />
                <span className="hidden items-center gap-1 rounded border border-white/[0.08] bg-white/[0.03] px-1.5 py-0.5 font-mono text-[8.5px] text-slate-500 sm:flex">
                  <CornerDownLeft className="h-2.5 w-2.5" />
                  Enter
                </span>
                <button
                  type="submit"
                  disabled={!input.trim() || busy}
                  className={cn(
                    "flex h-[30px] shrink-0 items-center gap-1.5 rounded-lg border px-2.5 text-[10.5px] font-semibold transition-all",
                    input.trim() && !busy
                      ? "border-sky-300/30 bg-gradient-to-r from-[#1d7bff] to-[#22a9d8] text-[#ffffff] shadow-[0_6px_18px_-8px_rgba(46,144,255,0.9)] hover:brightness-110"
                      : "border-white/[0.07] bg-white/[0.03] text-slate-600",
                  )}
                >
                  <Sparkles className="h-3 w-3" />
                  Run
                </button>
              </div>
            </form>

            <div className="mt-1.5 flex items-center justify-between px-0.5 text-[8.5px] text-slate-600">
              <span className="flex items-center gap-2.5">
                <span className="flex items-center gap-1">
                  <TerminalSquare className="h-2.5 w-2.5" />
                  ↑ ↓ command history
                </span>
                <span className="hidden sm:inline">⌘K focus</span>
              </span>
              <span className="font-mono">{busy ? "one operation at a time" : "mcp · tls local · v2.4"}</span>
            </div>
          </div>
        </section>

        <ContextRail onNavigate={onNavigate} />
      </div>
    </div>
  );
}
