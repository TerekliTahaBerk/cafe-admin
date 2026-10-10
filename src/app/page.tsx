import type { Metadata } from "next";
import Link from "next/link";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { SiteHeader } from "@/components/site/site-header";
import { Wordmark } from "@/components/site/wordmark";
import { Photo } from "@/components/ui/photo";
import { siteContent as c } from "@/content/site";
import { displayCafeName, SELF_SERVICE_NOTE } from "@/lib/brand";
import { DAYS } from "@/lib/constants";
import { getSiteSettings } from "@/lib/data";
import { getSiteUrl, publicImageUrl } from "@/lib/env";
import { directionsUrl, instagramUrl, telUrl } from "@/lib/format";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteSettings();
  const title = `${displayCafeName(s.cafe_name)} · Güzel bir kahve molası`;
  const description = "Kahveni seç, tatlını bul, kendine bir mola ver. Jön Coffee & Patisserie menüsü, çalışma saatleri ve ziyaret bilgileri.";
  return { title: { absolute: title }, description, alternates: { canonical: "/" }, openGraph: { title, description, url: "/" } };
}

export default async function HomePage() {
  const s = await getSiteSettings();
  const name = displayCafeName(s.cafe_name);
  const logoUrl = publicImageUrl(s.logo_path);
  const directions = directionsUrl(s.address);
  const insta = instagramUrl(s.instagram);
  const tel = telUrl(s.phone);
  const jsonLd = {
    "@context": "https://schema.org", "@type": "CafeOrCoffeeShop", name, url: getSiteUrl(),
    telephone: s.phone ?? undefined, address: s.address ?? undefined, servesCuisine: ["Kahve", "Patisserie"],
    hasMenu: `${getSiteUrl()}/menu`, sameAs: insta ? [insta] : undefined,
    openingHoursSpecification: s.opening_hours.filter((h) => h.open).map((h) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"][h.day],
      opens: h.from, closes: h.to,
    })),
  };
  return (
    <div className="public-site">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <a href="#icerik" className="skip-link">İçeriğe geç</a>
      <SiteHeader cafeName={name} logoUrl={logoUrl} />
      <main id="icerik">
        <section className="site-container home-hero">
          <div className="hero-copy">
            <p className="eyebrow">Kahve & Patisserie</p>
            <h1>Güzel bir gün,<br /><em>iyi bir kahveyle.</em></h1>
            <p className="hero-lead">Kahveni seç, tatlını bul,<br className="mobile-only" /> kendine bir mola ver.</p>
            <div className="hero-actions">
              <Link href="/menu" className="jon-button">Menüyü keşfet <ArrowUpRight size={18} aria-hidden /></Link>
              <a href="#ziyaret" className="jon-button jon-button-outline">Bize uğra</a>
            </div>
            <a href="#hikayemiz" className="hero-scroll"><ArrowDown size={16} aria-hidden /> Jön’de bir mola</a>
          </div>
          <div className="hero-media">
            <Photo src={c.heroImage.src} alt={c.heroImage.alt} sizes="(min-width: 900px) 46vw, 90vw" priority className="hero-photo" />
            <div className="hero-seal" aria-hidden><span>Bir kahve<br /><em>molası.</em></span><span className="seal-star">✳</span></div>
            <span className="image-credit">Jön atmosferi · temsili görsel</span>
          </div>
        </section>
        <section id="hikayemiz" className="story-band">
          <div className="site-container story-inner">
            <p className="eyebrow">Bizim hikâyemiz</p>
            <h2>Bir fincan kahve.<br /><em>Kendine ayırdığın zaman.</em></h2>
            <p>Bir arkadaşla sohbet, kitabının bir sonraki sayfası ya da günün ortasında küçük bir durak. Jön, kahveyle tatlının buluştuğu o güzel mola.</p>
          </div>
        </section>
        <section id="kahve-tatli" className="site-container editorial-section">
          <div className="section-heading">
            <div><p className="eyebrow">Kahve & Tatlı</p><h2>Birbirine <em>çok yakışır.</em></h2></div>
            <p>Bir yudum kahve, küçük bir tatlı.<br />Günün en güzel eşleşmesini menüde bul.</p>
          </div>
          <div className="editorial-grid">
            <Link href="/menu" className="editorial-card">
              <Photo src={c.coffeeImage.src} alt={c.coffeeImage.alt} sizes="(min-width: 768px) 44vw, 90vw" className="editorial-photo" />
              <div className="editorial-caption"><div><h3>Kahve molası</h3><p>Sıcak ya da soğuk, tam senin sevdiğin gibi.</p></div><ArrowUpRight size={26} aria-hidden /></div>
            </Link>
            <Link href="/menu" className="editorial-card">
              <Photo src={c.pastryImage.src} alt={c.pastryImage.alt} sizes="(min-width: 768px) 44vw, 90vw" className="editorial-photo" />
              <div className="editorial-caption"><div><h3>Tatlı bir eşlikçi</h3><p>Kahvenin yanına küçük bir mutluluk.</p></div><ArrowUpRight size={26} aria-hidden /></div>
            </Link>
          </div>
          <div className="self-service-banner"><span className="self-service-star" aria-hidden>✳</span><div><h3>Sen seç, biz hazırlayalım.</h3><p>{SELF_SERVICE_NOTE}</p></div><Link href="/menu" className="text-link">Menüye göz at <ArrowUpRight size={16} aria-hidden /></Link></div>
        </section>
        <section id="ziyaret" className="visit-section">
          <div className="site-container visit-grid">
            <div className="visit-copy"><p className="eyebrow">Ziyaret</p><h2>Gel, otur.<br /><em>Bir mola ver.</em></h2><p>İyi kahve, tatlı bir eşlikçi ve kendine ayırdığın biraz zaman. Jön’de görüşelim.</p>
              <div className="contact-grid">
                {s.address ? <div><h3>Adres</h3><address>{s.address}</address>{directions ? <a className="text-link" href={directions} target="_blank" rel="noopener noreferrer">Yol tarifi <ArrowUpRight size={15} aria-hidden /></a> : null}</div> : null}
                {s.phone || insta ? <div><h3>İletişim</h3>{s.phone && tel ? <a href={tel}>{s.phone}</a> : null}{insta ? <a href={insta} target="_blank" rel="noopener noreferrer">@{s.instagram?.replace(/^@/, "")}</a> : null}</div> : null}
              </div>
              {s.map_embed_url ? <iframe src={s.map_embed_url} title={`${name} konumu`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="visit-map" /> : null}
            </div>
            <div className="hours-card"><h3>Çalışma saatleri</h3>{s.opening_hours.length ? <dl>{[...s.opening_hours].sort((a, b) => a.day - b.day).map((h) => <div key={h.day}><dt>{DAYS[h.day]}</dt><dd>{h.open ? `${h.from} – ${h.to}` : "Kapalı"}</dd></div>)}</dl> : <p>Güncel çalışma saatlerimiz yakında burada.</p>}<span className="hours-flourish" aria-hidden>✳</span></div>
          </div>
        </section>
      </main>
      <footer className="site-footer"><div className="site-container footer-inner"><Wordmark name={name} logoUrl={logoUrl} /><p>Güzel bir gün, iyi bir kahveyle.</p><div><Link href="/menu">Menü</Link><a href="#ziyaret">Ziyaret</a>{insta ? <a href={insta} target="_blank" rel="noopener noreferrer">Instagram</a> : null}</div></div><div className="site-container footer-bottom"><span>© {new Date().getFullYear()} {name}</span><span>Self servis · Siparişler kasadan</span></div></footer>
    </div>
  );
}
