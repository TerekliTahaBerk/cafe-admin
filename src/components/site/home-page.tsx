import type { Metadata } from "next";
import Link from "next/link";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { SiteHeader } from "@/components/site/site-header";
import { Wordmark } from "@/components/site/wordmark";
import { Photo } from "@/components/ui/photo";
import { siteContent as c } from "@/content/site";
import { displayCafeName, SELF_SERVICE_NOTE } from "@/lib/brand";
import { DAYS_BY_LOCALE, languageAlternates, localizedPath, translate, type Locale } from "@/lib/i18n";
import { getSiteSettings } from "@/lib/data";
import { getSiteUrl, publicImageUrl } from "@/lib/env";
import { directionsUrl, instagramUrl, telUrl } from "@/lib/format";


export async function homeMetadata(locale: Locale = "tr"): Promise<Metadata> {
  const t = (text: string) => translate(locale, text);
  const s = await getSiteSettings();
  const title = `${displayCafeName(s.cafe_name)} · ${t("Güzel bir kahve molası")}`;
  const description = t("Kahveni seç, tatlını bul, kendine bir mola ver. Jön Coffee & Patisserie menüsü, çalışma saatleri ve ziyaret bilgileri.");
  return { title: { absolute: title }, description, alternates: { canonical: localizedPath(locale), languages: languageAlternates() }, openGraph: { title, description, url: localizedPath(locale), locale: locale === "tr" ? "tr_TR" : locale === "en" ? "en_US" : "de_DE" } };
}


export async function HomePage({ locale = "tr" }: { locale?: Locale } = {}) {
  const t = (text: string) => translate(locale, text);
  const s = await getSiteSettings();
  const name = displayCafeName(s.cafe_name);
  const logoUrl = publicImageUrl(s.logo_path);
  const directions = directionsUrl(s.address);
  const insta = instagramUrl(s.instagram);
  const tel = telUrl(s.phone);
  const jsonLd = {
    "@context": "https://schema.org", "@type": "CafeOrCoffeeShop", name, url: `${getSiteUrl()}${localizedPath(locale)}`,
    telephone: s.phone ?? undefined, address: s.address ?? undefined, servesCuisine: ["Kahve", "Patisserie"],
    hasMenu: `${getSiteUrl()}${localizedPath(locale, "/menu")}`, sameAs: insta ? [insta] : undefined,
    openingHoursSpecification: s.opening_hours.filter((h) => h.open).map((h) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"][h.day],
      opens: h.from, closes: h.to,
    })),
  };
  return (
    <div className="public-site" lang={locale}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <a href="#icerik" className="skip-link">{t("İçeriğe geç")}</a>
      <SiteHeader cafeName={name} logoUrl={logoUrl} locale={locale} />
      <main id="icerik">
        <section className="site-container home-hero">
          <div className="hero-copy">
            <p className="eyebrow">{t("Kahve & Patisserie")}</p>
            <h1>{t("Güzel bir gün,")}<br /><em>{t("iyi bir kahveyle.")}</em></h1>
            <p className="hero-lead">{t("Kahveni seç, tatlını bul,")}<br className="mobile-only" />{" "}{t("kendine bir mola ver.")}</p>
            <div className="hero-actions">
              <Link href={localizedPath(locale, "/menu")} className="jon-button">{t("Menüyü keşfet")}<ArrowUpRight size={18} aria-hidden /></Link>
              <a href="#ziyaret" className="jon-button jon-button-outline">{t("Bize uğra")}</a>
            </div>
            <a href="#hikayemiz" className="hero-scroll"><ArrowDown size={16} aria-hidden />{t("Jön’de bir mola")}</a>
          </div>
          <div className="hero-media">
            <Photo src={c.heroImage.src} alt={t(c.heroImage.alt)} sizes="(min-width: 900px) 46vw, 90vw" priority className="hero-photo" />
            <span className="image-credit">{t("Jön atmosferi · temsili görsel")}</span>
          </div>
        </section>
        <section id="hikayemiz" className="story-band">
          <div className="site-container story-inner">
            <p className="eyebrow">{t("Bizim hikâyemiz")}</p>
            <h2>{t("Bir fincan kahve.")}<br /><em>{t("Kendine ayırdığın zaman.")}</em></h2>
            <p>{t("Bir arkadaşla sohbet, kitabının bir sonraki sayfası ya da günün ortasında küçük bir durak. Jön, kahveyle tatlının buluştuğu o güzel mola.")}</p>
          </div>
        </section>
        <section id="kahve-tatli" className="site-container editorial-section">
          <div className="section-heading">
            <div><p className="eyebrow">{t("Kahve & Tatlı")}</p><h2>{t("Birbirine")}{" "}<em>{t("çok yakışır.")}</em></h2></div>
            <p>{t("Bir yudum kahve, küçük bir tatlı.")}<br />{t("Günün en güzel eşleşmesini menüde bul.")}</p>
          </div>
          <div className="editorial-grid">
            <Link href={localizedPath(locale, "/menu")} className="editorial-card">
              <Photo src={c.coffeeImage.src} alt={t(c.coffeeImage.alt)} sizes="(min-width: 768px) 44vw, 90vw" className="editorial-photo" />
              <div className="editorial-caption"><div><h3>{t("Kahve molası")}</h3><p>{t("Sıcak ya da soğuk, tam senin sevdiğin gibi.")}</p></div><ArrowUpRight size={26} aria-hidden /></div>
            </Link>
            <Link href={localizedPath(locale, "/menu")} className="editorial-card">
              <Photo src={c.pastryImage.src} alt={t(c.pastryImage.alt)} sizes="(min-width: 768px) 44vw, 90vw" className="editorial-photo" />
              <div className="editorial-caption"><div><h3>{t("Tatlı bir eşlikçi")}</h3><p>{t("Kahvenin yanına küçük bir mutluluk.")}</p></div><ArrowUpRight size={26} aria-hidden /></div>
            </Link>
          </div>
          <div className="self-service-banner"><span className="self-service-star" aria-hidden>✳</span><div><h3>{t("Sen seç, biz hazırlayalım.")}</h3><p>{t(SELF_SERVICE_NOTE)}</p></div><Link href={localizedPath(locale, "/menu")} className="text-link">{t("Menüye göz at")}<ArrowUpRight size={16} aria-hidden /></Link></div>
        </section>
        <section id="ziyaret" className="visit-section">
          <div className="site-container visit-grid">
            <div className="visit-copy"><p className="eyebrow">{t("Ziyaret")}</p><h2>{t("Gel, otur.")}<br /><em>{t("Bir mola ver.")}</em></h2><p>{t("İyi kahve, tatlı bir eşlikçi ve kendine ayırdığın biraz zaman. Jön’de görüşelim.")}</p>
              <div className="contact-grid">
                {s.address ? <div><h3>{t("Adres")}</h3><address>{s.address}</address>{directions ? <a className="text-link" href={directions} target="_blank" rel="noopener noreferrer">{t("Yol tarifi")}<ArrowUpRight size={15} aria-hidden /></a> : null}</div> : null}
                {s.phone || insta ? <div><h3>{t("İletişim")}</h3>{s.phone && tel ? <a href={tel}>{s.phone}</a> : null}{insta ? <a href={insta} target="_blank" rel="noopener noreferrer">@{s.instagram?.replace(/^@/, "")}</a> : null}</div> : null}
              </div>
              {s.map_embed_url ? <iframe src={s.map_embed_url} title={`${name} ${t("konumu")}`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="visit-map" /> : null}
            </div>
            <div className="hours-card"><h3>{t("Çalışma saatleri")}</h3>{s.opening_hours.length ? <dl>{[...s.opening_hours].sort((a, b) => a.day - b.day).map((h) => <div key={h.day}><dt>{DAYS_BY_LOCALE[locale][h.day]}</dt><dd>{h.open ? `${h.from} – ${h.to}` : t("Kapalı")}</dd></div>)}</dl> : <p>{t("Güncel çalışma saatlerimiz yakında burada.")}</p>}<span className="hours-flourish" aria-hidden>✳</span></div>
          </div>
        </section>
      </main>
      <footer className="site-footer"><div className="site-container footer-inner"><Wordmark name={name} logoUrl={logoUrl} /><p>{t("Güzel bir gün, iyi bir kahveyle.")}</p><div><Link href={localizedPath(locale, "/menu")}>{t("Menü")}</Link><a href="#ziyaret">{t("Ziyaret")}</a>{insta ? <a href={insta} target="_blank" rel="noopener noreferrer">Instagram</a> : null}</div></div><div className="site-container footer-bottom"><span>© {new Date().getFullYear()} {name}</span><span>{t("Self servis · Siparişler kasadan")}</span></div></footer>
    </div>
  );
}

