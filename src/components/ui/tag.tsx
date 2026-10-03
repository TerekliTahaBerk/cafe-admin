import { tagByKey, type TagTone } from "@/lib/constants";
import { cn } from "@/lib/cn";

const tones: Record<TagTone, string> = {
  accent: "px-2 py-0.5 bg-accent-100 text-accent-800",
  plain: "px-[7px] py-px border border-neutral-400 text-neutral-800",
  hot: "px-[7px] py-px border border-danger-line text-danger",
};

export function Tag({ tone, children }: { tone: TagTone; children: React.ReactNode }) {
  return (
    <span className={cn("inline-flex items-center rounded-[3px] text-[11px] leading-[1.45]", tones[tone])}>
      {children}
    </span>
  );
}

export function ProductTags({ tags, className }: { tags: string[]; className?: string }) {
  const known = tags.map(tagByKey).filter((t) => !!t);
  if (!known.length) return null;
  return (
    <ul className={cn("flex flex-wrap gap-[5px]", className)} aria-label="Etiketler">
      {known.map((t) => (
        <li key={t.key}>
          <Tag tone={t.tone}>{t.label}</Tag>
        </li>
      ))}
    </ul>
  );
}

/** Slightly tilted rubber stamp laid over a sold-out product's photo. */
export function SoldOutStamp({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-6 whitespace-nowrap",
        "rounded-[3px] border border-neutral-800 bg-bg px-2 py-[3px] text-[10px] tracking-[0.12em] text-neutral-900 uppercase",
        className,
      )}
    >
      Tükendi
    </span>
  );
}
