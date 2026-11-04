import { useId } from "react";
import { cn } from "../utils/cn";

export function LogoMark({ className }: { className?: string }) {
  const raw = useId().replace(/[:]/g, "");
  const tile = `crafto-tile-${raw}`;
  const bird = `crafto-bird-${raw}`;
  const edge = `crafto-edge-${raw}`;
  return (
    <svg
      viewBox="0 0 48 48"
      className={cn("h-10 w-10", className)}
      role="img"
      aria-label="Crafto"
    >
      <defs>
        <linearGradient id={tile} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0e2138" />
          <stop offset="55%" stopColor="#0a1524" />
          <stop offset="100%" stopColor="#070f1b" />
        </linearGradient>
        <linearGradient id={bird} x1="0.1" y1="0.1" x2="0.95" y2="0.9">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="48%" stopColor="#b8e4ff" />
          <stop offset="100%" stopColor="#2ee6d6" />
        </linearGradient>
        <linearGradient id={edge} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#69b6ff" stopOpacity="0.65" />
          <stop offset="55%" stopColor="#2e90ff" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#2ee6d6" stopOpacity="0.45" />
        </linearGradient>
      </defs>
      <rect x="0.75" y="0.75" width="46.5" height="46.5" rx="13" fill={`url(#${tile})`} />
      <rect
        x="0.75"
        y="0.75"
        width="46.5"
        height="46.5"
        rx="13"
        fill="none"
        stroke={`url(#${edge})`}
        strokeWidth="1.5"
      />
      <circle cx="38" cy="11" r="1.4" fill="#3fe0d8" opacity="0.9" />
      <circle cx="10" cy="36" r="1" fill="#2e90ff" opacity="0.8" />

      {/* falcon silhouette — sharp head, beak and swept wing */}
      <path
        d="M19.6 13.4 28.9 16l4.2 4.4-4.2.5-2.3 3.4c-2.6 3.4-6.5 5-10.6 4.1l3.4-4.4-4.4-1.8c.6-3.6 2.1-6.6 4.6-8.8Z"
        fill={`url(#${bird})`}
      />
      <path d="M20.3 30.7 23 24.6l6.4-1.9-4.9 9.5Z" fill={`url(#${bird})`} opacity="0.72" />
      <path d="M16.1 30.1 18.9 26l5.6.8-5.1 6.6Z" fill={`url(#${bird})`} opacity="0.5" />
      <circle cx="25.7" cy="19.4" r="1.45" fill="#08131f" />
      <circle cx="25.3" cy="19" r="0.45" fill="#8ee7ff" />
    </svg>
  );
}

export function Logo({
  compact = false,
  className,
}: {
  compact?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <LogoMark className={compact ? "h-8 w-8" : "h-10 w-10"} />
      {!compact && (
        <div className="min-w-0">
          <div className="flex items-baseline gap-1.5">
            <span className="brand-wordmark text-[19px] font-semibold leading-none tracking-[-0.02em]">
              Crafto
            </span>
            <span className="text-[10px] font-medium uppercase tracking-[0.13em] text-cyan-300/80">
              VPN
            </span>
          </div>
          <p className="mt-[5px] text-[9px] font-medium uppercase tracking-[0.28em] text-slate-500">
            Control Platform
          </p>
        </div>
      )}
    </div>
  );
}
