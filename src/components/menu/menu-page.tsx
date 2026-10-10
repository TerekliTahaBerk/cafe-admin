import type { Metadata } from "next";

import { MenuView } from "@/components/menu/menu-view";
import { languageAlternates, localizedPath, localizedProduct, translate, type Locale } from "@/lib/i18n";
import { getMenu, getSiteSettings } from "@/lib/data";
import { publicImageUrl } from "@/lib/env";

// Statically rendered and cached; Server Actions call revalidatePath("/menu")
// after every admin change, and this is a safety net.

export async function menuMetadata(locale: Locale = "tr"): Promise<Metadata> {
  const t = (text: string) => translate(locale, text);
  const settings = await getSiteSettings();
  const title = `${t("Menü")} · ${settings.cafe_name}`;
  const description = `${settings.cafe_name} ${t("menüsü: sıcak ve soğuk içecekler, ev yapımı tatlılar ve atıştırmalıklar. Fiyatlar ve alerjen bilgileri.")}`;
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: localizedPath(locale, "/menu"), languages: languageAlternates("/menu") },
    openGraph: { title, description, url: localizedPath(locale, "/menu"), locale: locale === "tr" ? "tr_TR" : locale === "en" ? "en_US" : "de_DE" },
  };
}


export async function MenuPage({ locale = "tr" }: { locale?: Locale } = {}) {
  const [settings, menu] = await Promise.all([getSiteSettings(), getMenu()]);
  const sections = menu
    .filter((s) => s.products.length > 0)
    .map((s) => ({ id: s.id, name: locale === "tr" ? s.name : s[`name_${locale}`]?.trim() || s.name, products: s.products.map((p) => localizedProduct(p, locale)) }));

  return (
    <>
      <MenuView
        key={locale}
        locale={locale}
        cafeName={settings.cafe_name}
        logoUrl={publicImageUrl(settings.logo_path)}
        subtitle={settings.location_label}
        tagline={settings.tagline}
        wifiPassword={settings.wifi_password}
        openingHours={settings.opening_hours}
        sections={sections}
      />
    </>
  );
}

