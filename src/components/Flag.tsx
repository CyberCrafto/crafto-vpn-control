import type { ReactNode } from "react";
import { cn } from "../utils/cn";
import type { RegionId } from "../lib/types";

const FLAGS: Record<RegionId, ReactNode> = {
  de: (
    <>
      <rect width="40" height="9.34" fill="#1c1c1c" />
      <rect y="9.34" width="40" height="9.33" fill="#c8102e" />
      <rect y="18.67" width="40" height="9.33" fill="#f2c500" />
    </>
  ),
  us: (
    <>
      <rect width="40" height="28" fill="#f5f7fb" />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <rect key={i} y={i * 4.3} width="40" height="2.15" fill="#c8324a" />
      ))}
      <rect width="17" height="15.05" fill="#1d3a6b" />
      {[0, 1, 2].map((row) =>
        [0, 1, 2, 3].map((col) => (
          <circle
            key={`${row}-${col}`}
            cx={2.8 + col * 4}
            cy={3.2 + row * 4.4}
            r="0.85"
            fill="#f5f7fb"
          />
        )),
      )}
    </>
  ),
  uk: (
    <>
      <rect width="40" height="28" fill="#1b3668" />
      <path d="M0 0 40 28M40 0 0 28" stroke="#f5f7fb" strokeWidth="5.4" />
      <path d="M0 0 40 28M40 0 0 28" stroke="#c8324a" strokeWidth="2.2" />
      <path d="M20 0v28M0 14h40" stroke="#f5f7fb" strokeWidth="8.2" />
      <path d="M20 0v28M0 14h40" stroke="#c8324a" strokeWidth="4.4" />
    </>
  ),
  fr: (
    <>
      <rect width="13.33" height="28" fill="#23408e" />
      <rect x="13.33" width="13.34" height="28" fill="#f5f7fb" />
      <rect x="26.67" width="13.33" height="28" fill="#c8324a" />
    </>
  ),
  nl: (
    <>
      <rect width="40" height="9.34" fill="#b3263d" />
      <rect y="9.34" width="40" height="9.33" fill="#f5f7fb" />
      <rect y="18.67" width="40" height="9.33" fill="#21468b" />
    </>
  ),
  jp: (
    <>
      <rect width="40" height="28" fill="#f5f7fb" />
      <circle cx="20" cy="14" r="7" fill="#c8324a" />
    </>
  ),
  tr: (
    <>
      <rect width="40" height="28" fill="#c8102e" />
      <circle cx="16.5" cy="14" r="6.4" fill="#f5f7fb" />
      <circle cx="18.7" cy="14" r="5.1" fill="#c8102e" />
      <path
        d="M27 10.8 27.79 12.91 30.04 13.01 28.28 14.42 28.88 16.59 27 15.35 25.12 16.59 25.72 14.42 23.96 13.01 26.21 12.91Z"
        fill="#f5f7fb"
      />
    </>
  ),
  ca: (
    <>
      <rect width="40" height="28" fill="#f5f7fb" />
      <rect width="10" height="28" fill="#c8102e" />
      <rect x="30" width="10" height="28" fill="#c8102e" />
      <path
        d="m20 6.5.9 3.1 2.5-1.1-.9 2.8 2.9 1.7-2.6 1.1.5 3.1-3.3-1.6-3.3 1.6.5-3.1-2.6-1.1 2.9-1.7-.9-2.8 2.5 1.1Z"
        fill="#c8102e"
      />
      <rect x="19.35" y="17" width="1.3" height="5" fill="#c8102e" />
    </>
  ),
};

const SIZES = {
  xs: "h-[14px] w-5",
  sm: "h-[18px] w-[26px]",
  md: "h-[22px] w-8",
  lg: "h-[30px] w-[42px]",
  xl: "h-[38px] w-[54px]",
};

export function Flag({
  code,
  size = "sm",
  className,
}: {
  code: RegionId;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 overflow-hidden rounded-[3px] bg-[#0c1524] ring-1 ring-white/15",
        "shadow-[0_1px_5px_rgba(0,0,0,0.45)]",
        SIZES[size],
        className,
      )}
      aria-hidden="true"
    >
      <svg viewBox="0 0 40 28" preserveAspectRatio="none" className="h-full w-full">
        {FLAGS[code]}
      </svg>
    </span>
  );
}
