import { useId } from "react";
import { cn } from "../utils/cn";
import { clamp } from "../lib/format";

export function StatusDot({
  tone = "success",
  pulse = true,
  className,
}: {
  tone?: "success" | "offline" | "info" | "warning";
  pulse?: boolean;
  className?: string;
}) {
  const color =
    tone === "success"
      ? "bg-emerald-400"
      : tone === "info"
        ? "bg-sky-400"
        : tone === "warning"
          ? "bg-amber-400"
          : "bg-slate-500";
  return (
    <span className={cn("relative inline-flex h-1.5 w-1.5 shrink-0 rounded-full", className)}>
      <span className={cn("absolute inset-0 rounded-full", color)} />
      {pulse && (
        <span
          className={cn(
            "absolute inset-0 rounded-full opacity-70",
            tone === "success" ? "ping-soft text-emerald-400" : "ping-soft text-sky-400",
          )}
        />
      )}
    </span>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
  disabled,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={onChange}
      className={cn(
        "relative inline-flex h-[22px] w-[39px] shrink-0 items-center rounded-full border transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-sky-400/50",
        checked
          ? "border-sky-300/30 bg-gradient-to-r from-[#1f7bff] to-[#2ee6d6] shadow-[0_0_16px_-2px_rgba(46,144,255,0.65)]"
          : "border-white/10 bg-[#182337]",
        disabled && "cursor-not-allowed opacity-50",
      )}
    >
      <span
        className={cn(
          "absolute h-[16px] w-[16px] rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.5)] transition-all duration-300",
          checked ? "left-[19px] bg-white" : "left-[2px] bg-[#8b9bb4]",
        )}
      />
    </button>
  );
}

export function Sparkline({
  data,
  color = "#3fe0d8",
  className,
  strokeWidth = 1.6,
  fill = true,
  min,
  max,
}: {
  data: number[];
  color?: string;
  className?: string;
  strokeWidth?: number;
  fill?: boolean;
  min?: number;
  max?: number;
}) {
  const gradientId = useId().replace(/:/g, "");
  const width = 120;
  const height = 36;
  if (!data.length) return null;

  const lo = min ?? Math.min(...data);
  const hi = max ?? Math.max(...data);
  const span = hi - lo || 1;
  const points = data.map((value, index) => {
    const x = (index / Math.max(1, data.length - 1)) * width;
    const y = height - clamp((value - lo) / span, 0, 1) * (height - 4) - 2;
    return [x, y] as const;
  });

  const line = points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`).join(" ");
  const area = `${line} L${width} ${height} L0 ${height} Z`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className={cn("h-9 w-full overflow-visible", className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`spark-${gradientId}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.32" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {fill && <path d={area} fill={`url(#spark-${gradientId})`} />}
      <path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SectionLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Kbd({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <kbd
      className={cn(
        "rounded border border-white/10 bg-white/[0.04] px-1.5 py-0.5 font-mono text-[9.5px] font-medium text-slate-400",
        className,
      )}
    >
      {children}
    </kbd>
  );
}
