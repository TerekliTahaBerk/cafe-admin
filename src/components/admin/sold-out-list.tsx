"use client";

import { useState } from "react";
import { toast } from "sonner";

import { setProductStock } from "@/app/admin/actions/products";
import { Switch } from "@/components/ui/switch";

type Item = { id: string; name: string; category: string };

/** Dashboard list of sold-out products with a one-tap "back in stock" switch. */
export function SoldOutList({ items }: { items: Item[] }) {
  const [restocked, setRestocked] = useState<Set<string>>(new Set());

  async function toggle(item: Item, inStock: boolean) {
    setRestocked((s) => {
      const n = new Set(s);
      if (inStock) n.add(item.id);
      else n.delete(item.id);
      return n;
    });
    const res = await setProductStock(item.id, inStock);
    if (!res.ok) {
      setRestocked((s) => {
        const n = new Set(s);
        if (inStock) n.delete(item.id);
        else n.add(item.id);
        return n;
      });
      toast.error(`${item.name} güncellenemedi.`);
      return;
    }
    toast.success(
      <span>
        <strong>{item.name}</strong> {inStock ? "yeniden stokta." : "tükendi."}
      </span>,
    );
  }

  return (
    <ul>
      {items.map((item) => {
        const inStock = restocked.has(item.id);
        return (
          <li key={item.id} className="flex items-center gap-3 border-b border-divider py-1.5">
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate font-heading text-[17px] font-semibold">{item.name}</span>
              <span className="text-[12px] text-neutral-700">{item.category}</span>
            </div>
            <Switch
              checked={inStock}
              onCheckedChange={(v) => void toggle(item, v)}
              onLabel="Stokta"
              offLabel="Tükendi"
              ariaLabel={`${item.name} stokta`}
            />
          </li>
        );
      })}
    </ul>
  );
}
