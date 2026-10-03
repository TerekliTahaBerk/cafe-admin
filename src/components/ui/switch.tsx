"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

type SwitchSize = "sm" | "md" | "lg";

const track: Record<SwitchSize, string> = {
  sm: "h-[26px] w-11",
  md: "h-7 w-12",
  lg: "h-[30px] w-[52px]",
};
const knob: Record<SwitchSize, { size: string; on: string }> = {
  sm: { size: "size-[17px]", on: "translate-x-[17px]" },
  md: { size: "size-[19px]", on: "translate-x-[19px]" },
  lg: { size: "size-[21px]", on: "translate-x-[21px]" },
};

/** The visual track + knob. Interactive behaviour lives in <Switch>. */
export function SwitchTrack({ checked, size = "md" }: { checked: boolean; size?: SwitchSize }) {
  return (
    <span
      aria-hidden
      className={cn(
        "relative inline-block flex-none rounded-full border-[1.5px] transition-colors duration-150",
        track[size],
        checked ? "border-accent bg-accent-100" : "border-neutral-500 bg-transparent",
      )}
    >
      <span
        className={cn(
          "absolute top-[3px] left-[1.5px] rounded-full transition-transform duration-150",
          knob[size].size,
          checked ? cn("bg-accent-600", knob[size].on) : "bg-neutral-500",
        )}
      />
    </span>
  );
}

/**
 * Accessible switch. The label is always shown next to the track — colour
 * alone never carries the meaning (design rule).
 *
 * layout:
 *  - "inline": [track] Label     (desktop table)
 *  - "stacked": track over label (mobile list, 72×48 touch target)
 *  - "trailing": Label [track]   (form rows)
 */
export function Switch({
  checked,
  onCheckedChange,
  onLabel,
  offLabel,
  ariaLabel,
  size = "md",
  layout = "inline",
  disabled,
  className,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  onLabel: ReactNode;
  offLabel: ReactNode;
  ariaLabel: string;
  size?: SwitchSize;
  layout?: "inline" | "stacked" | "trailing";
  disabled?: boolean;
  className?: string;
}) {
  const label = (
    <span
      className={cn(
        layout === "stacked" ? "text-[10px] leading-none" : "text-[13px]",
        checked ? "text-accent-800" : "text-neutral-800",
      )}
    >
      {checked ? onLabel : offLabel}
    </span>
  );

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "inline-flex cursor-pointer items-center rounded-md disabled:cursor-not-allowed disabled:opacity-45",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        layout === "inline" && "h-11 gap-2.5 pr-1.5",
        layout === "trailing" && "h-11 gap-3 pl-1.5",
        layout === "stacked" && "h-12 w-[72px] flex-col justify-center gap-1",
        className,
      )}
    >
      {layout === "trailing" ? label : null}
      <SwitchTrack checked={checked} size={size} />
      {layout !== "trailing" ? label : null}
    </button>
  );
}
