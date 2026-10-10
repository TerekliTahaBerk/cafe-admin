import Image from "next/image";
import { cn } from "@/lib/cn";

export function Wordmark({ name, logoUrl, className }: { name: string; logoUrl?: string | null; className?: string }) {
  const jon = name.startsWith("Jön");
  return (
    <span className={cn("wordmark", className)} aria-label={name}>
      {logoUrl ? <Image src={logoUrl} alt="" width={48} height={48} className="size-12 object-contain" /> : null}
      <span aria-hidden="true" className="wordmark-text">
        <span className={cn("wordmark-name", !jon && "wordmark-custom")}>{jon ? "jön" : name}</span>
        {jon ? <span className="wordmark-caption">COFFEE & PATISSERIE</span> : null}
      </span>
    </span>
  );
}
