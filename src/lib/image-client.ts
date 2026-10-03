"use client";

import { IMAGE_MAX_BYTES, IMAGE_TYPES } from "./constants";

export type PreparedImage = { file: File; previewUrl: string; width: number; height: number; small: boolean };

/** Client-side check mirroring the server rules (type + 5 MB). */
export function checkImageFile(file: File): string | null {
  if (!IMAGE_TYPES.includes(file.type as (typeof IMAGE_TYPES)[number])) {
    return `${file.name} yüklenemedi: yalnızca JPG, PNG ya da WebP.`;
  }
  if (file.size > IMAGE_MAX_BYTES) return `${file.name} yüklenemedi: dosya 5 MB'tan büyük.`;
  return null;
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality?: number) {
  return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));
}

async function encode(canvas: HTMLCanvasElement, preferred: string, quality: number) {
  let blob = await canvasToBlob(canvas, preferred, quality);
  // Browsers that can't encode WebP silently return PNG; fall back to JPEG.
  if (!blob || (preferred === "image/webp" && blob.type !== "image/webp")) {
    blob = await canvasToBlob(canvas, "image/jpeg", quality);
  }
  if (!blob) throw new Error("encode failed");
  return blob;
}

/**
 * Centre-crops to a square and scales down to at most `max` px, re-encoding
 * as WebP. Keeps uploads small (well under Vercel's request limit) and makes
 * the menu thumbnail exactly what the admin previewed.
 */
export async function prepareSquareImage(file: File, max = 1200): Promise<PreparedImage> {
  const bitmap = await createImageBitmap(file);
  const side = Math.min(bitmap.width, bitmap.height);
  const target = Math.min(max, side);
  const canvas = document.createElement("canvas");
  canvas.width = target;
  canvas.height = target;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas unavailable");
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(
    bitmap,
    (bitmap.width - side) / 2,
    (bitmap.height - side) / 2,
    side,
    side,
    0,
    0,
    target,
    target,
  );
  bitmap.close();
  const blob = await encode(canvas, "image/webp", 0.86);
  const ext = blob.type === "image/webp" ? "webp" : "jpg";
  const name = file.name.replace(/\.[^.]+$/, "") + `.${ext}`;
  const out = new File([blob], name, { type: blob.type });
  return {
    file: out,
    previewUrl: URL.createObjectURL(out),
    width: target,
    height: target,
    small: side < 800,
  };
}

/** Logos keep their aspect ratio and transparency (PNG), max 512 px. */
export async function prepareLogo(file: File, max = 512): Promise<PreparedImage> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();
  const blob = await encode(canvas, "image/png", 1);
  const out = new File([blob], file.name.replace(/\.[^.]+$/, "") + ".png", { type: blob.type });
  return { file: out, previewUrl: URL.createObjectURL(out), width: w, height: h, small: false };
}
