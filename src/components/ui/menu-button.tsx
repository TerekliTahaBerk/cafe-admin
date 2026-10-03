"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { EllipsisVertical } from "lucide-react";

import { cn } from "@/lib/cn";

export type MenuItem = {
  label: string;
  onSelect: () => void;
  icon?: ReactNode;
  danger?: boolean;
};

/** Kebab (⋮) button with a small popover list. Arrow keys move, Esc closes. */
export function MenuButton({
  label,
  items,
  className,
}: {
  label: string;
  items: MenuItem[];
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const id = useId();

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    rootRef.current?.querySelector<HTMLElement>("[role=menuitem]")?.focus();
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    const list = Array.from(rootRef.current?.querySelectorAll<HTMLElement>("[role=menuitem]") ?? []);
    const idx = list.indexOf(document.activeElement as HTMLElement);
    if (e.key === "Escape") {
      setOpen(false);
      triggerRef.current?.focus();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      list[(idx + 1) % list.length]?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      list[(idx - 1 + list.length) % list.length]?.focus();
    }
  };

  return (
    <div ref={rootRef} className={cn("relative", className)} onKeyDown={onKeyDown}>
      <button
        ref={triggerRef}
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        onClick={() => setOpen((v) => !v)}
        className="grid h-11 w-9 cursor-pointer place-items-center rounded-md text-neutral-700 hover:bg-text/7"
      >
        <EllipsisVertical size={18} aria-hidden />
      </button>
      {open ? (
        <ul
          id={id}
          role="menu"
          className="absolute top-full right-0 z-20 mt-1 min-w-44 animate-fade-in rounded-lg border border-divider bg-surface py-1 shadow-md"
        >
          {items.map((item) => (
            <li key={item.label} role="none">
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  item.onSelect();
                }}
                className={cn(
                  "flex h-11 w-full cursor-pointer items-center gap-2.5 px-3.5 text-left text-[14px] hover:bg-text/7 focus-visible:bg-text/7 focus-visible:outline-none",
                  item.danger && "text-danger",
                )}
              >
                {item.icon}
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
