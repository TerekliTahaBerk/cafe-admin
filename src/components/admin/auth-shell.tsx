import type { ReactNode } from "react";

import { BrandMark } from "@/components/ui/brand-mark";
import { Photo } from "@/components/ui/photo";
import { siteContent } from "@/content/site";

/** Two-panel layout for the login screens: ambience plate + form column. */
export function AuthShell({
  cafeName,
  logoUrl,
  children,
}: {
  cafeName: string;
  logoUrl: string | null;
  children: ReactNode;
}) {
  const img = siteContent.loginImage;
  return (
    <div className="flex min-h-dvh flex-col lg:grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
      <div className="m-4 lg:m-0 lg:flex lg:p-10">
        <div className="plate relative flex h-[220px] flex-col justify-end overflow-hidden lg:h-auto lg:flex-1 lg:border-8 lg:p-9">
          <Photo
            src={img.src}
            alt=""
            sizes="(min-width: 1024px) 50vw, 100vw"
            stripes="lg"
            priority
            className="absolute inset-0"
          />
          {!img.src ? (
            <span className="absolute top-3.5 left-3.5 font-mono text-[10px] text-neutral-700 lg:top-5 lg:left-5 lg:text-[11px]">
              {img.label}
            </span>
          ) : null}
          <p className="relative hidden max-w-[420px] font-heading text-[34px] leading-[1.15] italic lg:block">
            {img.quote}
          </p>
        </div>
      </div>
      <main className="flex flex-1 justify-center px-6 pt-2 pb-6 lg:items-center lg:p-10">
        <div className="flex w-full max-w-[380px] flex-col gap-4 lg:gap-[18px]">
          <BrandMark name={cafeName} logoUrl={logoUrl} size={52} className="hidden lg:grid" />
          {children}
        </div>
      </main>
    </div>
  );
}
