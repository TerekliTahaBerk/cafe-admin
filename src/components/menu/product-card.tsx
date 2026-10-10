import { translate, type Locale } from "@/lib/i18n";
import { ProductTags, SoldOutStamp } from "@/components/ui/tag";
import { cn } from "@/lib/cn";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/lib/types";
import { ProductVisual } from "./product-visual";

export const SOLD_OUT_NOTE = "Şu an tükendi. Diğer lezzetlerimize göz atabilirsin.";

export function ProductCard({ product, onSelect, priority, locale = "tr" }: { locale?: Locale; product: Product; onSelect: (product: Product) => void; priority?: boolean }) {
  const t = (text: string) => translate(locale, text);
  const soldOut = !product.in_stock;
  return (
    <button type="button" onClick={() => onSelect(product)} aria-haspopup="dialog" className={cn("menu-product-card", soldOut && "is-sold-out")}>
      <div className="product-media"><ProductVisual locale={locale} product={product} priority={priority} />{soldOut ? <SoldOutStamp locale={locale} /> : null}</div>
      <div className="product-card-copy">
        <div className="product-title-row"><h3>{product.name}</h3><span className="product-price">{formatPrice(product.price)}</span></div>
        {product.description ? <p>{product.description}</p> : null}
        <div className="product-card-bottom">{soldOut ? <span className="sold-out-label">{t("Şu an tükendi")}</span> : <ProductTags locale={locale} tags={product.tags} />}<span className="product-details-label">{t("İçerik & detaylar ↗")}</span></div>
      </div>
    </button>
  );
}
