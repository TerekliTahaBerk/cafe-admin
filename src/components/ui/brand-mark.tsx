import Image from "next/image";

import { BRAND_LOGO } from "@/lib/brand";
import { cn } from "@/lib/cn";

/** Circular monogram (or uploaded logo) used across the site, menu and panel. */
export function BrandMark({
  name,
  logoUrl,
  size = 44,
  className,
}: {
  name: string;
  logoUrl?: string | null;
  size?: number;
  className?: string;
}) {
  const src = logoUrl || (name.startsWith("Jön") ? BRAND_LOGO : null);
  const letter = (name.trim()[0] ?? "K").toLocaleUpperCase("tr-TR");
  return (
    <span
      aria-hidden
      style={{ width: size, height: size, fontSize: Math.round(size * 0.5) }}
      className={cn(
        "relative grid flex-none place-items-center overflow-hidden rounded-full border border-accent font-heading leading-none text-accent-700",
        className,
      )}
    >
      {src ? (
        <Image src={src} alt="" fill sizes={`${size * 2}px`} className="object-contain p-[12%]" />
      ) : (
        letter
      )}
    </span>
  );
}
