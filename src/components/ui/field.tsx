"use client";

import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/cn";

/*
 * Inputs follow the design: 44px tall (48–52px on phones), hairline border,
 * accent border + 3px accent-100 ring on focus, 1.5px terracotta on error.
 * Font size is 16px on phones so iOS doesn't zoom on focus.
 */
export const inputBase =
  "w-full min-w-0 rounded-md border border-divider bg-transparent px-3 text-[16px] md:text-[15px] " +
  "text-text placeholder:text-neutral-600 caret-accent transition-[border-color] " +
  "hover:border-text/45 focus-visible:border-accent focus-visible:outline-[3px] focus-visible:outline-accent-100 focus-visible:outline-offset-0 " +
  "aria-invalid:border-[1.5px] aria-invalid:border-danger-line disabled:opacity-45";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return <input ref={ref} className={cn(inputBase, "h-12 md:h-11", className)} {...props} />;
  },
);

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(inputBase, "min-h-[72px] resize-y py-2.5 leading-normal", className)}
      {...props}
    />
  );
});

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ className, children, ...props }, ref) {
    return (
      <div className="relative">
        <select
          ref={ref}
          className={cn(inputBase, "h-12 cursor-pointer appearance-none pr-10 md:h-11", className)}
          {...props}
        >
          {children}
        </select>
        <ChevronDown
          aria-hidden
          size={16}
          strokeWidth={1.75}
          className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2"
        />
      </div>
    );
  },
);

/** Prefixes an input with a fixed adornment, e.g. "₺" for prices. */
export function Adorned({
  prefix,
  children,
  invalid,
}: {
  prefix: ReactNode;
  children: ReactNode;
  invalid?: boolean;
}) {
  return (
    <div
      data-invalid={invalid || undefined}
      className={cn(
        "flex h-12 items-center gap-2 rounded-md border border-divider px-3 md:h-11",
        "hover:border-text/45 focus-within:border-accent focus-within:outline-[3px] focus-within:outline-accent-100",
        "data-invalid:border-[1.5px] data-invalid:border-danger-line",
      )}
    >
      <span className="text-neutral-700">{prefix}</span>
      {children}
    </div>
  );
}

export function Field({
  label,
  htmlFor,
  error,
  hint,
  aside,
  children,
  className,
}: {
  label: ReactNode;
  htmlFor?: string;
  error?: string;
  hint?: ReactNode;
  aside?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex items-baseline justify-between gap-3 text-[12px] text-neutral-800">
        <label htmlFor={htmlFor}>{label}</label>
        {aside}
      </div>
      {children}
      {error ? (
        <span id={htmlFor ? `${htmlFor}-error` : undefined} className="text-[12px] text-danger" role="alert">
          {error}
        </span>
      ) : hint ? (
        <span className="text-[12px] text-neutral-700">{hint}</span>
      ) : null}
    </div>
  );
}

export function useFieldId(prefix: string) {
  const id = useId();
  return `${prefix}-${id.replace(/:/g, "")}`;
}

/** Error banner shown at the top of a form or the login card. */
export function FormAlert({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      role="alert"
      className={cn(
        "flex gap-2.5 rounded-md border border-danger-line bg-danger-wash px-3.5 py-3 text-[13px] leading-[1.45] text-danger-deep",
        className,
      )}
    >
      <svg
        aria-hidden
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        className="flex-none"
      >
        <circle cx="12" cy="12" r="9.5" />
        <path d="M12 8v4" />
        <path d="M12 16h.01" />
      </svg>
      <span>{children}</span>
    </div>
  );
}

export function Checkbox({
  checked,
  onChange,
  label,
  className,
  name,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: ReactNode;
  className?: string;
  name?: string;
}) {
  return (
    <label className={cn("flex h-11 cursor-pointer items-center gap-2.5 text-[14px] md:h-8", className)}>
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="peer sr-only"
      />
      <span
        aria-hidden
        className={cn(
          "grid size-[18px] flex-none place-items-center rounded-[3px] border-[1.5px] transition-colors",
          "peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent",
          checked ? "border-accent bg-accent-600" : "border-neutral-500",
        )}
      >
        {checked ? (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        ) : null}
      </span>
      {label}
    </label>
  );
}
