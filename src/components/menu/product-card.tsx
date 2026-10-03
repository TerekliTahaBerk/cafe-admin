import { Photo } from "@/components/ui/photo";
import { ProductTags, SoldOutStamp } from "@/components/ui/tag";
import { cn } from "@/lib/cn";
import { formatPrice, trLower } from "@/lib/format";
import { publicImageUrl } from "@/lib/env";
import type { Product } from "@/lib/types";

export const SOLD_OUT_NOTE = "Bugünlük bitti — yarın sabah yine burada.";

/**
 * Menu row: square photo, name + price, short description, tags.
 * Sold out = 55% faded photo with a tilted stamp, neutral name/price and a
 * short note instead of tags. The price is never struck through and the
 * product is never hidden.
 */
export function ProductCard({
  product,
  onSelect,
  priority,
}: {
  product: Product;
  onSelect: (product: Product) => void;
  priority?: boolean;
}) {
  const soldOut = !product.in_stock;
  return (
    <button
      type="button"
      onClick={() => onSelect(product)}
      aria-haspopup="dialog"
      className={cn(
        "group flex w-full cursor-pointer gap-3.5 border-b border-divider py-4 text-left md:gap-[18px] md:py-5",
        "transition-colors hover:bg-text/[0.025] focus-visible:outline-offset-[-2px]",
      )}
    >
      <div className="relative size-[88px] flex-none md:size-[104px]">
        <Photo
          src={publicImageUrl(product.image_path)}
          alt={product.name}
          sizes="(min-width: 768px) 104px, 88px"
          label={product.image_path ? undefined : trLower(product.name)}
          muted={soldOut}
          priority={priority}
          className="size-full rounded-lg border border-divider"
        />
        {soldOut ? <SoldOutStamp /> : null}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-[5px] md:gap-1.5">
        <div className="flex items-baseline justify-between gap-2.5">
          <h3
            className={cn(
              "font-heading text-[20px] leading-[1.12] font-semibold md:text-[21px]",
              soldOut && "text-neutral-700",
            )}
          >
            {product.name}
          </h3>
          <span
            className={cn(
              "tnum font-heading text-[19px] font-semibold whitespace-nowrap md:text-[20px]",
              soldOut && "text-neutral-600",
            )}
          >
            {formatPrice(product.price)}
          </span>
        </div>
        {product.description ? (
          <p
            className={cn(
              "text-[13px] leading-[1.45] text-pretty text-neutral-700 md:leading-normal",
              soldOut && "opacity-85",
            )}
          >
            {product.description}
          </p>
        ) : null}
        {soldOut ? (
          <span className="text-[12px] text-neutral-700 italic">
            <span className="sr-only">Tükendi. </span>
            {SOLD_OUT_NOTE}
          </span>
        ) : (
          <ProductTags tags={product.tags} />
        )}
      </div>
    </button>
  );
}
