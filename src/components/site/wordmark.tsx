import Image from "next/image";
import { cn } from "@/lib/cn";
import { BRAND_LOGO } from "@/lib/brand";

export function Wordmark({ name, logoUrl, className }: { name: string; logoUrl?: string | null; className?: string }) {
  const src = logoUrl || (name.startsWith("Jön") ? BRAND_LOGO : null);
  return (
    <span className={cn("wordmark", className)} aria-label={name}>
      {src ? (
        <Image src={src} alt="" width={1536} height={1024} sizes="(max-width: 767px) 108px, 150px" className="wordmark-logo" />
      ) : (
        <span aria-hidden="true" className="wordmark-text"><span className="wordmark-name wordmark-custom">{name}</span></span>
      )}
    </span>
  );
}
