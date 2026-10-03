"use client";

import { useId, type ReactNode } from "react";
import { Trash, TriangleAlert } from "lucide-react";

import { Button } from "./button";
import { Overlay } from "./overlay";

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  children,
  confirmLabel = "Evet, sil",
  cancelLabel = "Vazgeç",
  icon = "trash",
  loading,
  confirmDisabled,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: ReactNode;
  children?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  icon?: "trash" | "warning";
  loading?: boolean;
  confirmDisabled?: boolean;
}) {
  const id = useId();
  const Icon = icon === "trash" ? Trash : TriangleAlert;
  return (
    <Overlay
      open={open}
      onClose={loading ? () => {} : onClose}
      labelledBy={`${id}-title`}
      describedBy={`${id}-body`}
    >
      <div className="grid size-11 place-items-center rounded-full border border-danger-line text-danger">
        <Icon size={19} strokeWidth={1.75} aria-hidden />
      </div>
      <h2 id={`${id}-title`} className="text-[24px] leading-tight">
        {title}
      </h2>
      <div id={`${id}-body`} className="flex flex-col gap-3.5 text-[14px] leading-[1.55] text-neutral-800">
        {children}
      </div>
      <div className="mt-1.5 flex flex-wrap justify-end gap-2.5">
        <Button variant="secondary" onClick={onClose} disabled={loading}>
          {cancelLabel}
        </Button>
        <Button
          variant="danger"
          onClick={onConfirm}
          loading={loading}
          disabled={confirmDisabled}
          autoFocus
        >
          {confirmLabel}
        </Button>
      </div>
    </Overlay>
  );
}
