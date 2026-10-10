import { CakeSlice, Coffee, Croissant, CupSoda, Utensils } from "lucide-react";
import { Photo } from "@/components/ui/photo";
import { publicImageUrl } from "@/lib/env";
import { normalizeSearch } from "@/lib/format";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/cn";

/** Uploaded product photography wins; missing photos get a clear, neutral illustration. */
export function ProductVisual({ product, priority, className }: { product: Product; priority?: boolean; className?: string }) {
  if (product.image_path) return <Photo src={publicImageUrl(product.image_path)} alt={product.name} sizes="(min-width: 1000px) 25vw, 50vw" muted={!product.in_stock} priority={priority} className={cn("product-visual", className)} />;
  const name = normalizeSearch(product.name);
  const pastry = /kek|cheesecake|brownie|tatli|tiramisu/.test(name);
  const cold = /buz|cold|limonata|serbet|soguk/.test(name);
  const snack = /tost|humus|menemen|kahvalti/.test(name);
  const Icon = pastry ? CakeSlice : cold ? CupSoda : snack ? Utensils : /kruvasan|croissant/.test(name) ? Croissant : Coffee;
  return <div className={cn("product-visual product-illustration", pastry && "illustration-pastry", cold && "illustration-cold", !product.in_stock && "illustration-muted", className)}><span className="illustration-orbit" aria-hidden /><Icon size={64} strokeWidth={1.1} aria-hidden /><span className="product-photo-note">Fotoğraf yakında</span></div>;
}
