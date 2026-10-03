import Image from "next/image";

import { cn } from "@/lib/cn";

// A warm neutral 1×1 used as the blur placeholder while photos stream in.
const BLUR =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPScxJyBoZWlnaHQ9JzEnPjxyZWN0IHdpZHRoPScxJyBoZWlnaHQ9JzEnIGZpbGw9JyNlYWU3ZTcnLz48L3N2Zz4=";

/**
 * A product/ambience photo. Without a source it renders the design's striped
 * placeholder with a small monospace caption describing the intended shot.
 */
export function Photo({
  src,
  alt,
  sizes,
  label,
  priority,
  muted,
  stripes = "sm",
  className,
  labelClassName,
}: {
  src?: string | null;
  alt: string;
  sizes: string;
  label?: string;
  priority?: boolean;
  /** Sold-out treatment: 55% opacity. */
  muted?: boolean;
  stripes?: "sm" | "lg";
  className?: string;
  labelClassName?: string;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden bg-neutral-200",
        !src && (muted ? "stripes-muted" : stripes === "lg" ? "stripes-lg" : "stripes"),
        className,
      )}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          placeholder="blur"
          blurDataURL={BLUR}
          className={cn("object-cover", muted && "opacity-55 grayscale-[35%]")}
        />
      ) : (
        <>
          {muted ? <span className="absolute inset-0 bg-bg/45" aria-hidden /> : null}
          {label ? (
            <span
              aria-hidden
              className={cn(
                "absolute bottom-1.5 left-1.5 right-1.5 font-mono text-[9px] leading-[1.2] text-neutral-700",
                labelClassName,
              )}
            >
              {label}
            </span>
          ) : null}
          <span className="sr-only">{alt}</span>
        </>
      )}
    </div>
  );
}
