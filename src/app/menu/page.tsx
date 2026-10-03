import type { Metadata } from "next";

import { MenuView } from "@/components/menu/menu-view";
import { menuTimeScript } from "@/components/menu/time-script";
import { getMenu, getSiteSettings } from "@/lib/data";
import { publicImageUrl } from "@/lib/env";

// Statically rendered and cached; Server Actions call revalidatePath("/menu")
// after every admin change, and this is a safety net.
export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const title = `Menü · ${settings.cafe_name}`;
  const description = `${settings.cafe_name} menüsü: sıcak ve soğuk içecekler, ev yapımı tatlılar ve atıştırmalıklar. Fiyatlar ve alerjen bilgileri.`;
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: "/menu" },
    openGraph: { title, description, url: "/menu" },
  };
}

export default async function MenuPage() {
  const [settings, menu] = await Promise.all([getSiteSettings(), getMenu()]);
  const sections = menu
    .filter((s) => s.products.length > 0)
    .map((s) => ({ id: s.id, name: s.name, products: s.products }));

  return (
    <>
      <MenuView
        cafeName={settings.cafe_name}
        logoUrl={publicImageUrl(settings.logo_path)}
        subtitle={settings.location_label}
        tagline={settings.tagline}
        wifiPassword={settings.wifi_password}
        openingHours={settings.opening_hours}
        sections={sections}
      />
      <script dangerouslySetInnerHTML={{ __html: menuTimeScript(settings.opening_hours) }} />
    </>
  );
}
