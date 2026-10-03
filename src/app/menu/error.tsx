"use client";

import { RotateCw } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function MenuError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-3 px-8 text-center">
      <div className="grid size-[72px] place-items-center rounded-full border border-accent text-accent-700">
        <RotateCw size={26} strokeWidth={1.5} aria-hidden />
      </div>
      <h1 className="mt-2 text-[28px] font-normal">Menü şu an açılamadı</h1>
      <p className="max-w-[300px] text-[14px] leading-normal text-neutral-700">
        Bağlantıda kısa bir sorun var. Bir kez daha dene; olmazsa kasada sor, menüyü sözlü anlatalım.
      </p>
      <Button variant="primary" size="lg" className="mt-3.5" onClick={reset}>
        Tekrar dene
      </Button>
    </main>
  );
}
