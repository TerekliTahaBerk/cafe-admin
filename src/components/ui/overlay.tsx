"use client";

import { useEffect, useRef, type ReactNode } from "react";

import { cn } from "@/lib/cn";

type Variant = "center" | "sheet" | "drawer";

const backdrops: Record<Variant, string> = {
  center: "bg-neutral-900/50",
  sheet: "bg-neutral-900/52",
  drawer: "bg-neutral-900/40",
};

const panels: Record<Variant, string> = {
  center:
    "relative m-auto flex w-[min(460px,calc(100%-32px))] flex-col gap-3.5 rounded-lg border border-divider bg-surface p-[26px] shadow-lg animate-fade-in",
  // Bottom sheet on phones; a centred card from md up.
  sheet:
    "absolute inset-x-0 bottom-0 flex max-h-[92dvh] flex-col overflow-y-auto overscroll-contain rounded-t-sheet bg-bg shadow-lg animate-sheet-in " +
    "md:relative md:inset-auto md:m-auto md:max-h-[88dvh] md:w-[min(560px,calc(100%-48px))] md:rounded-lg md:animate-fade-in",
  // Full screen on phones; a 560px side drawer from md up.
  drawer:
    "absolute inset-0 flex flex-col bg-bg animate-fade-in " +
    "md:inset-y-0 md:right-0 md:left-auto md:w-[560px] md:border-l md:border-divider md:shadow-lg md:animate-drawer-in",
};

/**
 * Modal surface built on the native <dialog> element: it gives us the top
 * layer, inert background, focus containment and Esc-to-close for free.
 */
export function Overlay({
  open,
  onClose,
  variant = "center",
  labelledBy,
  describedBy,
  children,
  className,
}: {
  open: boolean;
  onClose: () => void;
  variant?: Variant;
  labelledBy?: string;
  describedBy?: string;
  children: ReactNode;
  className?: string;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ startY: number; dy: number } | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      document.documentElement.style.overflow = "hidden";
    } else if (!open && dialog.open) {
      dialog.close();
    }
    if (!open) document.documentElement.style.overflow = "";
  }, [open]);

  useEffect(
    () => () => {
      document.documentElement.style.overflow = "";
    },
    [],
  );

  // Swipe down to dismiss the bottom sheet (only when scrolled to the top).
  const sheetHandlers =
    variant === "sheet"
      ? {
          onTouchStart: (e: React.TouchEvent) => {
            const panel = panelRef.current;
            if (!panel || panel.scrollTop > 0 || window.matchMedia("(min-width: 768px)").matches) return;
            drag.current = { startY: e.touches[0].clientY, dy: 0 };
          },
          onTouchMove: (e: React.TouchEvent) => {
            const panel = panelRef.current;
            if (!drag.current || !panel) return;
            const dy = Math.max(0, e.touches[0].clientY - drag.current.startY);
            drag.current.dy = dy;
            panel.style.transform = `translateY(${dy}px)`;
          },
          onTouchEnd: () => {
            const panel = panelRef.current;
            if (!drag.current || !panel) return;
            const { dy } = drag.current;
            drag.current = null;
            panel.style.transition = "transform 180ms ease-out";
            panel.style.transform = "";
            setTimeout(() => panel && (panel.style.transition = ""), 200);
            if (dy > 110) onClose();
          },
        }
      : {};

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      className="fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none bg-transparent p-0 text-text open:flex"
    >
      {open ? (
        <>
          <div
            aria-hidden
            className={cn("absolute inset-0 animate-fade-in", backdrops[variant])}
            onClick={onClose}
          />
          <div ref={panelRef} className={cn(panels[variant], className)} {...sheetHandlers}>
            {children}
          </div>
        </>
      ) : null}
    </dialog>
  );
}
