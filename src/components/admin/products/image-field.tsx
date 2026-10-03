"use client";

import { useRef, useState } from "react";
import { Crop, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { checkImageFile, prepareSquareImage, type PreparedImage } from "@/lib/image-client";

export type ImageState =
  | { kind: "existing"; url: string | null }
  | { kind: "new"; prepared: PreparedImage; originalName: string }
  | { kind: "removed" };

/**
 * Drag-and-drop / file picker with a square preview. The dashed inner frame
 * marks the area shown in the menu thumbnail.
 */
export function ImageField({
  value,
  onChange,
  error,
  onError,
}: {
  value: ImageState;
  onChange: (next: ImageState) => void;
  error?: string;
  onError: (message: string | undefined) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [busy, setBusy] = useState(false);

  const previewUrl =
    value.kind === "new" ? value.prepared.previewUrl : value.kind === "existing" ? value.url : null;
  const fileName =
    value.kind === "new" ? value.originalName : value.kind === "existing" && value.url ? "mevcut görsel" : null;

  async function accept(file: File | undefined) {
    if (!file) return;
    const problem = checkImageFile(file);
    if (problem) {
      onError(problem);
      return;
    }
    setBusy(true);
    try {
      const prepared = await prepareSquareImage(file);
      onError(undefined);
      onChange({ kind: "new", prepared, originalName: file.name });
    } catch {
      onError(`${file.name} okunamadı. Başka bir görsel dene.`);
    } finally {
      setBusy(false);
    }
  }

  const picker = (
    <input
      ref={inputRef}
      type="file"
      accept="image/jpeg,image/png,image/webp"
      className="sr-only"
      tabIndex={-1}
      aria-hidden
      onChange={(e) => {
        void accept(e.target.files?.[0]);
        e.target.value = "";
      }}
    />
  );

  const hint = (
    <span className="flex items-center gap-1.5 text-[12px] text-neutral-700">
      <Crop size={14} strokeWidth={1.75} aria-hidden />
      Kare kırpılır · en az 800×800 px · JPG/PNG/WebP, 5 MB
    </span>
  );

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[12px] text-neutral-800" id="image-label">
        Görsel
      </span>
      {picker}

      {/* Desktop: preview + dropzone */}
      <div className="hidden gap-4 md:flex">
        {previewUrl ? (
          <Preview url={previewUrl} name={fileName} size="lg" />
        ) : null}
        <button
          type="button"
          aria-describedby="image-label"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            void accept(e.dataTransfer.files?.[0]);
          }}
          className={cn(
            "flex flex-1 cursor-pointer flex-col justify-center gap-2 rounded-md border border-dashed p-3.5 text-left transition-colors",
            previewUrl ? "min-h-[132px]" : "min-h-[108px] items-center text-center",
            error ? "border-danger-line" : "border-neutral-400 hover:border-accent",
            dragOver && "border-accent bg-accent-100",
          )}
        >
          {!previewUrl ? <Upload size={20} strokeWidth={1.75} className="text-neutral-700" aria-hidden /> : null}
          <span className="text-[14px]">
            {busy ? "Görsel hazırlanıyor…" : previewUrl ? "Yeni görseli buraya sürükle ya da " : "Görseli sürükle ya da "}
            {!busy ? <span className="text-accent-700 underline underline-offset-[3px]">dosya seç</span> : null}
          </span>
          {previewUrl ? (
            <>
              {hint}
              <span className="text-[12px] text-neutral-700">Kesikli çizgi menüde görünecek alanı gösterir.</span>
            </>
          ) : null}
        </button>
      </div>

      {/* Mobile: thumbnail + button */}
      <div className="flex items-center gap-3.5 md:hidden">
        {previewUrl ? (
          <Preview url={previewUrl} size="sm" />
        ) : (
          <div className="stripes size-24 flex-none rounded-md border-[5px] border-surface outline outline-divider" />
        )}
        <div className="flex flex-col gap-1.5">
          <Button variant="secondary" size="sm" onClick={() => inputRef.current?.click()} loading={busy}>
            Fotoğraf çek / seç
          </Button>
          <span className="text-[11px] text-neutral-700">Kare kırpılır · en az 800×800 px</span>
        </div>
      </div>

      {error ? (
        <span role="alert" className="text-[12px] text-danger">
          {error}
        </span>
      ) : value.kind === "new" && value.prepared.small ? (
        <span className="text-[12px] text-neutral-700">
          Görsel 800×800 px’ten küçük; menüde biraz bulanık görünebilir.
        </span>
      ) : null}

      {previewUrl ? (
        <button
          type="button"
          onClick={() => onChange({ kind: "removed" })}
          className="h-11 w-max cursor-pointer text-[13px] text-neutral-700 underline underline-offset-[3px] hover:text-danger md:h-8"
        >
          Görseli kaldır
        </button>
      ) : null}
    </div>
  );
}

function Preview({ url, name, size }: { url: string; name?: string | null; size: "lg" | "sm" }) {
  return (
    <div
      className={cn(
        "relative flex-none overflow-hidden rounded-md border-[5px] border-surface bg-neutral-200 outline outline-divider",
        size === "lg" ? "size-[132px]" : "size-24",
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- local blob / storage preview */}
      <img src={url} alt="Seçili görsel önizlemesi" className="size-full object-cover" />
      {size === "lg" ? (
        <>
          <span aria-hidden className="absolute inset-3.5 border border-dashed border-white outline outline-dashed outline-neutral-600" />
          {name ? (
            <span className="absolute bottom-1.5 left-1.5 max-w-[110px] truncate rounded-sm bg-bg/80 px-1 font-mono text-[9px] text-neutral-700">
              {name}
            </span>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
