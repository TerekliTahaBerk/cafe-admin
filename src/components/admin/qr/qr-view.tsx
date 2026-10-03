"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { Download, Share2 } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { downloadQrPng, downloadTableCardPdf, type CardSize } from "@/lib/table-card";

function QrCanvas({ url, px }: { url: string; px: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    void QRCode.toCanvas(ref.current, url, {
      errorCorrectionLevel: "M",
      margin: 0,
      width: px * 2,
      color: { dark: "#201f1d", light: "#00000000" },
    }).then(() => {
      if (ref.current) {
        ref.current.style.width = `${px}px`;
        ref.current.style.height = `${px}px`;
      }
    });
  }, [url, px]);
  return <canvas ref={ref} role="img" aria-label={`Menü bağlantısının QR kodu: ${url}`} className="block" style={{ width: px, height: px }} />;
}

export function QrView({ url, cafeName }: { url: string; cafeName: string }) {
  const [size, setSize] = useState<CardSize>("A6");
  const [busy, setBusy] = useState<"png" | "pdf" | null>(null);
  const displayUrl = url.replace(/^https?:\/\//, "");
  const slug = cafeName
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/ı/g, "i")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Bağlantı kopyalandı.");
    } catch {
      toast.error("Kopyalanamadı; bağlantıyı elle seç.");
    }
  }

  async function share() {
    if (navigator.share) {
      try {
        await navigator.share({ title: `${cafeName} menüsü`, url });
      } catch {
        /* user cancelled */
      }
    } else await copy();
  }

  async function png() {
    setBusy("png");
    try {
      await downloadQrPng(url, `${slug || "kafe"}-menu-qr.png`);
    } catch {
      toast.error("PNG oluşturulamadı.");
    } finally {
      setBusy(null);
    }
  }

  async function pdf() {
    setBusy("pdf");
    try {
      await downloadTableCardPdf({ size, cafeName, url, displayUrl });
    } catch (e) {
      console.error(e);
      toast.error("PDF oluşturulamadı.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex flex-col gap-3.5 px-5 pt-[18px] md:gap-6 md:px-10 md:py-8">
      <PageHeader kicker="Paylaş" title="QR Kod" />

      <div className="grid items-start gap-[18px] lg:grid-cols-[440px_minmax(0,1fr)] lg:gap-14">
        {/* Preview */}
        <div className="flex justify-center rounded-lg bg-surface p-[22px] md:p-9">
          <div className="hidden w-[300px] flex-col items-center gap-3.5 border border-divider bg-bg px-7 py-8 text-center shadow-md md:flex">
            <span className="font-heading text-[13px] tracking-[0.2em] text-accent-700 uppercase">{cafeName}</span>
            <span className="font-heading text-[30px] leading-[1.05]">
              Menümüz <em>burada</em>
            </span>
            <div className="border border-divider p-2.5">
              <QrCanvas url={url} px={203} />
            </div>
            <span className="text-[12px] leading-normal text-neutral-800">
              Kameranı koda tut.
              <br />
              Siparişini kasada verebilirsin.
            </span>
            <span className="font-mono text-[10px] text-neutral-700">{displayUrl}</span>
          </div>
          <div className="flex flex-col items-center gap-2.5 md:hidden">
            <div className="border border-divider bg-bg p-2.5">
              <QrCanvas url={url} px={180} />
            </div>
            <span className="font-mono text-[11px] text-neutral-800">{displayUrl}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex max-w-[520px] flex-col gap-2.5 md:gap-[22px]">
          <div className="hidden flex-col gap-1.5 md:flex">
            <label htmlFor="menu-url" className="text-[12px] text-neutral-800">
              Menü bağlantısı
            </label>
            <div className="flex gap-2">
              <input
                id="menu-url"
                readOnly
                value={url}
                onFocus={(e) => e.target.select()}
                className="h-11 min-w-0 flex-1 rounded-md border border-divider bg-transparent px-3 font-mono text-[13px] focus-visible:border-accent"
              />
              <Button variant="secondary" onClick={copy} className="text-[15px]">
                Kopyala
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <span id="card-size" className="text-[12px] text-neutral-800">
              Masa kartı boyutu
            </span>
            <div role="radiogroup" aria-labelledby="card-size" className="flex h-11 w-max overflow-hidden rounded-md border border-divider text-[14px]">
              {(["A7", "A6", "A5"] as const).map((s, i) => (
                <button
                  key={s}
                  type="button"
                  role="radio"
                  aria-checked={size === s}
                  onClick={() => setSize(s)}
                  className={cn(
                    "cursor-pointer px-4",
                    i > 0 && "border-l border-divider",
                    size === s
                      ? "bg-accent-100 text-accent-800 shadow-[inset_0_0_0_1px_var(--color-accent)]"
                      : "hover:bg-text/7",
                  )}
                >
                  {s}
                  {s === "A6" ? " · önerilen" : ""}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-2 flex flex-col gap-2.5 md:mt-0 md:flex-row">
            <Button variant="primary" size="lg" onClick={png} loading={busy === "png"} className="h-[52px] text-[17px] md:h-12 md:text-[16px]">
              {busy !== "png" ? <Download size={17} strokeWidth={1.75} aria-hidden /> : null}
              PNG indir
            </Button>
            <Button variant="secondary" size="lg" onClick={pdf} loading={busy === "pdf"} className="h-[52px] text-[17px] md:h-12 md:text-[16px]">
              {busy !== "pdf" ? <Download size={17} strokeWidth={1.75} aria-hidden /> : null}
              PDF indir (masa kartı)
            </Button>
            <Button variant="ghost" size="lg" onClick={share} className="h-[52px] text-[17px] md:hidden">
              <Share2 size={17} strokeWidth={1.75} aria-hidden />
              Bağlantıyı paylaş
            </Button>
          </div>

          <p className="mt-1.5 text-[13px] leading-[1.55] text-neutral-800 md:hidden">
            Kod hiç değişmez. Menüyü güncellediğinde kartları yeniden basmana gerek yok.
          </p>

          <div className="hidden flex-col gap-2.5 border-t border-divider pt-[18px] md:flex">
            <span className="kicker">Nasıl kullanılır</span>
            <ol className="flex list-decimal flex-col gap-1.5 pl-5 text-[14px] leading-normal">
              <li>PDF’i mat kâğıda bas, masa kartı standına yerleştir.</li>
              <li>Her masaya bir kart yeter; kasanın yanına da bir tane koy.</li>
              <li>Kod hiç değişmez — menüyü güncellediğinde yeniden basmana gerek yok.</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
