import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Loader2,
  Sparkles,
  Terminal,
  Wrench,
} from "lucide-react";
import { formatClock } from "../../lib/format";
import type { TerminalMessage, ToolMsg } from "../../lib/types";
import { LogoMark } from "../Logo";
import { cn } from "../../utils/cn";

function JsonBlock({ value }: { value: unknown }) {
  const json = JSON.stringify(value, null, 2) ?? "null";
  const lines = json.split("\n");

  return (
    <pre className="terminal-scroll max-h-[196px] overflow-auto rounded-lg border border-white/[0.055] bg-[#050a11] px-3 py-2.5 font-mono text-[10.5px] leading-[1.75]">
      <code>
        {lines.map((line, index) => {
          const parts = line.split(/("(?:[^"\\]|\\.)*"\s*:?|-?\d+(?:\.\d+)?|\btrue\b|\bfalse\b|\bnull\b)/g);
          return (
            <div key={index} className="whitespace-pre">
              {parts.map((part, partIndex) => {
                let cls = "text-slate-500";
                if (/^"/.test(part)) {
                  cls = /:\s*$/.test(part) ? "text-sky-300/95" : "text-emerald-300/90";
                } else if (/^(true|false|null)$/.test(part)) {
                  cls = "text-violet-300";
                } else if (/^-?\d/.test(part)) {
                  cls = "text-amber-300/95";
                } else if (/^[{}\[\],:]/.test(part.trim()) && part.trim().length > 0) {
                  cls = "text-slate-500";
                }
                return (
                  <span key={partIndex} className={cls}>
                    {part}
                  </span>
                );
              })}
            </div>
          );
        })}
      </code>
    </pre>
  );
}

function ToolCallCard({ message }: { message: ToolMsg }) {
  const [open, setOpen] = useState(true);
  const running = message.status === "running";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="relative overflow-hidden rounded-xl border border-white/[0.08] bg-[#080e18]"
    >
      <div
        className={cn(
          "absolute inset-x-0 top-0 h-px",
          running
            ? "bg-gradient-to-r from-transparent via-sky-400/70 to-transparent"
            : "bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent",
        )}
      />
      <div className="flex items-center justify-between gap-3 border-b border-white/[0.055] px-3 py-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className={cn(
              "flex h-6 w-6 shrink-0 items-center justify-center rounded-md border",
              running
                ? "border-sky-400/25 bg-sky-400/[0.09] text-sky-300"
                : "border-cyan-400/20 bg-cyan-400/[0.07] text-cyan-300",
            )}
          >
            <Wrench className="h-3 w-3" />
          </span>
          <span className="truncate font-mono text-[11.5px] font-medium text-cyan-200">
            {message.name}
          </span>
          <span className="hidden rounded border border-white/[0.08] bg-white/[0.02] px-1.5 py-[1px] font-mono text-[8px] uppercase tracking-[0.1em] text-slate-500 sm:inline">
            tool call
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-2.5">
          {running ? (
            <span className="flex items-center gap-1.5 rounded-full border border-sky-400/20 bg-sky-400/[0.07] px-2 py-[2px] text-[9.5px] font-medium text-sky-300">
              <Loader2 className="h-2.5 w-2.5 animate-spin" />
              Running
            </span>
          ) : (
            <span className="flex items-center gap-1.5 rounded-full border border-emerald-400/15 bg-emerald-400/[0.06] px-2 py-[2px] text-[9.5px] font-medium text-emerald-300">
              <CheckCircle2 className="h-2.5 w-2.5" />
              Success
              <span className="font-mono text-[8.5px] text-emerald-300/60">
                {message.durationMs ?? 0}ms
              </span>
            </span>
          )}
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Collapse tool call" : "Expand tool call"}
            className="rounded p-1 text-slate-500 transition-colors hover:bg-white/5 hover:text-slate-300"
          >
            {open ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="grid gap-3 p-3 lg:grid-cols-2">
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="font-mono text-[8.5px] uppercase tracking-[0.14em] text-slate-500">
                    Arguments
                  </span>
                  <span className="font-mono text-[8px] text-slate-700">
                    {Object.keys(message.args).length} params
                  </span>
                </div>
                <JsonBlock value={message.args} />
              </div>
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="font-mono text-[8.5px] uppercase tracking-[0.14em] text-slate-500">
                    Result
                  </span>
                  {running ? (
                    <span className="flex items-center gap-1 font-mono text-[8px] text-sky-400/70">
                      <span className="h-1 w-1 animate-pulse rounded-full bg-sky-400" />
                      awaiting controller
                    </span>
                  ) : (
                    <span className="font-mono text-[8px] text-emerald-400/60">ok · 200</span>
                  )}
                </div>
                {running ? (
                  <div className="space-y-2 rounded-lg border border-white/[0.055] bg-[#050a11] px-3 py-3">
                    {[72, 88, 54, 64].map((width, index) => (
                      <div
                        key={index}
                        className="h-2 animate-pulse rounded bg-white/[0.05]"
                        style={{ width: `${width}%`, animationDelay: `${index * 120}ms` }}
                      />
                    ))}
                    <p className="flex items-center gap-1.5 pt-1 font-mono text-[9px] text-sky-300/60">
                      <Loader2 className="h-2.5 w-2.5 animate-spin" />
                      vpn-controller is processing the request
                    </p>
                  </div>
                ) : (
                  <JsonBlock value={message.result} />
                )}
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-white/[0.045] px-3 py-1.5 font-mono text-[8.5px] text-slate-600">
              <span>mcp.tools/call · local transport</span>
              <span>{formatClock(message.at)}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function MessageRow({ message }: { message: TerminalMessage }) {
  if (message.kind === "system") {
    return (
      <div className="flex items-start gap-2 py-0.5 font-mono text-[10px] leading-relaxed text-slate-500">
        <span
          className={cn(
            "mt-[5px] h-1 w-1 shrink-0 rounded-full",
            message.tone === "success"
              ? "bg-emerald-400/80"
              : message.tone === "warning"
                ? "bg-amber-400/80"
                : "bg-slate-500",
          )}
        />
        <p className="min-w-0 flex-1">
          {message.text}
          {message.source === "dashboard" && (
            <span className="ml-2 rounded border border-sky-400/15 bg-sky-400/[0.05] px-1 py-[1px] text-[8px] uppercase tracking-wider text-sky-300/70">
              dashboard
            </span>
          )}
        </p>
        <span className="shrink-0 text-[9px] text-slate-700">{formatClock(message.at)}</span>
      </div>
    );
  }

  if (message.kind === "user") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18 }}
        className="flex gap-3"
      >
        <div className="mt-[1px] flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-white/[0.09] bg-white/[0.035] text-slate-300">
          <ChevronRight className="h-3.5 w-3.5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-400">
              You
            </span>
            <span className="font-mono text-[8.5px] text-slate-700">{formatClock(message.at)}</span>
          </div>
          <p className="mt-1 break-words text-[13px] font-medium leading-relaxed text-white">
            {message.text}
          </p>
        </div>
      </motion.div>
    );
  }

  if (message.kind === "agent") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18 }}
        className="flex gap-3"
      >
        <div className="mt-[1px] shrink-0">
          <LogoMark className="h-6 w-6 rounded-md" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-cyan-200/90">
              Crafto Agent
            </span>
            <span className="inline-flex items-center gap-1 rounded border border-cyan-400/15 bg-cyan-400/[0.05] px-1 py-[1px] font-mono text-[8px] uppercase tracking-wider text-cyan-300/70">
              <Sparkles className="h-2 w-2" />
              ai
            </span>
            <span className="font-mono text-[8.5px] text-slate-700">{formatClock(message.at)}</span>
          </div>
          <p className="mt-1 whitespace-pre-line break-words text-[13px] leading-[1.75] text-slate-300/95">
            {message.text}
            {message.streaming && (
              <span className="caret ml-0.5 inline-block h-[13px] w-[6px] translate-y-[2px] rounded-[1px] bg-cyan-300/90" />
            )}
          </p>
        </div>
      </motion.div>
    );
  }

  return <ToolCallCard message={message} />;
}

export function MessageList({ messages }: { messages: TerminalMessage[] }) {
  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <MessageRow key={message.id} message={message} />
      ))}
      {messages.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.025] text-slate-500">
            <Terminal className="h-5 w-5" />
          </span>
          <p className="mt-3 text-[12px] font-medium text-slate-400">Console is empty</p>
          <p className="mt-1 max-w-[280px] text-[11px] leading-relaxed text-slate-600">
            Send a command below to operate the VPN controller through the Crafto agent.
          </p>
        </div>
      )}
    </div>
  );
}
