"use client";

import QRCode from "qrcode";

export type CardSize = "A7" | "A6" | "A5";

export const CARD_SIZES: Record<CardSize, { w: number; h: number }> = {
  A7: { w: 74, h: 105 },
  A6: { w: 105, h: 148 },
  A5: { w: 148, h: 210 },
};

const INK = "#201f1d";
const ACCENT_700 = "#7d5411";
const NEUTRAL_700 = "#605d5d";
const NEUTRAL_800 = "#444141";
const DIVIDER = "rgba(32,31,29,0.16)";

function cssFont(variable: string, fallback: string) {
  const value = getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
  return value || fallback;
}

/** Draws crisp QR modules (no anti-aliasing seams) into a square. */
function drawQr(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, size: number) {
  const qr = QRCode.create(text, { errorCorrectionLevel: "M" });
  const n = qr.modules.size;
  const cell = size / n;
  ctx.fillStyle = INK;
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (qr.modules.get(r, c)) {
        const x0 = Math.floor(x + c * cell);
        const y0 = Math.floor(y + r * cell);
        ctx.fillRect(x0, y0, Math.ceil(x + (c + 1) * cell) - x0, Math.ceil(y + (r + 1) * cell) - y0);
      }
    }
  }
}

/**
 * Renders the table card from the design ("Menümüz burada") at 300 dpi.
 * Text is drawn with the page's own web fonts so Turkish characters render
 * exactly as on screen.
 */
export async function renderTableCard({
  size,
  cafeName,
  url,
  displayUrl,
}: {
  size: CardSize;
  cafeName: string;
  url: string;
  displayUrl: string;
}) {
  const heading = cssFont("--font-cormorant", "Georgia, serif");
  const body = cssFont("--font-lora", "Georgia, serif");
  // Best effort: next/font also registers a local() fallback face whose load
  // can reject; the real web font is still used once available.
  await Promise.allSettled([
    document.fonts.load(`400 40px ${heading}`),
    document.fonts.load(`italic 400 40px ${heading}`),
    document.fonts.load(`400 20px ${body}`),
  ]);
  await document.fonts.ready;

  const dpi = 300;
  const { w: mmW, h: mmH } = CARD_SIZES[size];
  const W = Math.round((mmW / 25.4) * dpi);
  const H = Math.round((mmH / 25.4) * dpi);
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas unavailable");

  // Layout is the 300px-wide on-screen card, scaled to the paper width.
  const u = W / 300;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, W, H);
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  const cx = W / 2;

  const qrBox = 203 * u + 20 * u; // QR + 10px padding each side
  const contentH = 13 * u + 14 * u + 30 * u + 14 * u + qrBox + 14 * u + 36 * u + 14 * u + 10 * u;
  let y = Math.max(28 * u, (H - contentH) / 2);

  // Kicker: cafe name, tracked caps, accent.
  ctx.fillStyle = ACCENT_700;
  ctx.font = `400 ${13 * u}px ${heading}`;
  if ("letterSpacing" in ctx) (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = `${2.6 * u}px`;
  y += 13 * u;
  ctx.fillText(cafeName.toLocaleUpperCase("tr-TR"), cx, y);
  if ("letterSpacing" in ctx) (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = "0px";

  // Title: "Menümüz *burada*"
  y += 14 * u + 30 * u;
  ctx.fillStyle = INK;
  const regular = `400 ${30 * u}px ${heading}`;
  const italic = `italic 400 ${30 * u}px ${heading}`;
  ctx.font = regular;
  const a = "Menümüz ";
  const aw = ctx.measureText(a).width;
  ctx.font = italic;
  const bw = ctx.measureText("burada").width;
  const start = cx - (aw + bw) / 2;
  ctx.textAlign = "left";
  ctx.font = regular;
  ctx.fillText(a, start, y);
  ctx.font = italic;
  ctx.fillText("burada", start + aw, y);
  ctx.textAlign = "center";

  // QR in a hairline box.
  y += 14 * u + 8 * u;
  const boxX = cx - qrBox / 2;
  ctx.strokeStyle = DIVIDER;
  ctx.lineWidth = Math.max(1, u);
  ctx.strokeRect(boxX, y, qrBox, qrBox);
  drawQr(ctx, url, boxX + 10 * u, y + 10 * u, 203 * u);
  y += qrBox;

  // Instructions.
  ctx.fillStyle = NEUTRAL_800;
  ctx.font = `400 ${12 * u}px ${body}`;
  y += 14 * u + 12 * u;
  ctx.fillText("Kameranı koda tut.", cx, y);
  y += 18 * u;
  ctx.fillText("Siparişini kasada verebilirsin.", cx, y);

  // URL.
  ctx.fillStyle = NEUTRAL_700;
  ctx.font = `400 ${10 * u}px ui-monospace, Menlo, monospace`;
  y += 14 * u + 10 * u;
  ctx.fillText(displayUrl, cx, y);

  return { canvas, mmW, mmH };
}

export async function downloadTableCardPdf(opts: Parameters<typeof renderTableCard>[0]) {
  const { PDFDocument } = await import("pdf-lib");
  const { canvas, mmW, mmH } = await renderTableCard(opts);
  const pngBytes = await new Promise<ArrayBuffer>((resolve, reject) =>
    canvas.toBlob((b) => (b ? b.arrayBuffer().then(resolve, reject) : reject(new Error("png"))), "image/png"),
  );
  const pdf = await PDFDocument.create();
  pdf.setTitle(`${opts.cafeName} · Masa kartı (${opts.size})`);
  pdf.setCreator(opts.cafeName);
  const pt = (mm: number) => (mm / 25.4) * 72;
  const page = pdf.addPage([pt(mmW), pt(mmH)]);
  const img = await pdf.embedPng(pngBytes);
  page.drawImage(img, { x: 0, y: 0, width: pt(mmW), height: pt(mmH) });
  const bytes = await pdf.save();
  triggerDownload(new Blob([bytes as BlobPart], { type: "application/pdf" }), `masa-karti-${opts.size.toLowerCase()}.pdf`);
}

export async function downloadQrPng(url: string, fileName: string) {
  const dataUrl = await QRCode.toDataURL(url, {
    errorCorrectionLevel: "M",
    margin: 4,
    width: 1200,
    color: { dark: INK, light: "#ffffff" },
  });
  const blob = await (await fetch(dataUrl)).blob();
  triggerDownload(blob, fileName);
}

function triggerDownload(blob: Blob, fileName: string) {
  const href = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = href;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(href), 1000);
}
