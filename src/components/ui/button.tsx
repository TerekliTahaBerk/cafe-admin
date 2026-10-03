import { forwardRef, type ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

export type ButtonVariant =
  | "primary"
  | "filled"
  | "secondary"
  | "ghost"
  | "plain"
  | "danger"
  | "inverse";
export type ButtonSize = "sm" | "md" | "lg" | "xl" | "icon" | "icon-sm";

const base =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap select-none cursor-pointer " +
  "font-heading font-semibold leading-[1.2] rounded-md border transition-colors duration-150 " +
  "disabled:cursor-not-allowed disabled:opacity-45 aria-disabled:cursor-not-allowed aria-disabled:opacity-45";

const variants: Record<ButtonVariant, string> = {
  // Accent outline — the system's primary action. Never a solid fill.
  primary:
    "border-accent text-accent-700 bg-transparent hover:bg-accent/12 active:bg-accent/22",
  // Outline with a pale accent wash, for the one main CTA on a screen.
  filled:
    "border-accent text-accent-800 bg-accent-100 hover:bg-accent-200 active:bg-accent-300",
  secondary:
    "border-divider text-text bg-transparent hover:bg-text/7 active:bg-text/14",
  ghost:
    "border-transparent text-accent-700 bg-transparent px-2.5 hover:bg-accent/10 active:bg-accent/18",
  plain:
    "border-transparent text-text bg-transparent px-3 hover:bg-text/7 active:bg-text/14",
  danger:
    "border-danger-strong text-danger-ink bg-transparent hover:bg-danger-hover active:bg-danger-hover",
  // Used on dark surfaces (toasts).
  inverse:
    "border-transparent text-accent-300 bg-transparent px-2.5 hover:bg-white/10 active:bg-white/15",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-10 px-3.5 text-[15px]",
  md: "h-11 px-[18px] text-[16px]",
  lg: "h-12 px-5 text-[16px]",
  xl: "h-[52px] px-[26px] text-[18px]",
  icon: "size-11 p-0",
  "icon-sm": "size-9 p-0",
};

export function buttonStyles({
  variant = "primary",
  size = "md",
  className,
}: { variant?: ButtonVariant; size?: ButtonSize; className?: string } = {}) {
  return cn(base, sizes[size], variants[variant], className);
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant, size, className, loading, disabled, children, type = "button", ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonStyles({ variant, size, className })}
      {...props}
    >
      {loading ? <Spinner /> : null}
      {children}
    </button>
  );
});

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-block size-4 animate-spin rounded-full border-[1.5px] border-current border-r-transparent",
        className,
      )}
    />
  );
}
