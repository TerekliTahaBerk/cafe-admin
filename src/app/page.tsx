import type { Metadata } from "next";
import Link from "next/link";
import { Clock, MapPin, Phone } from "lucide-react";

import { SiteHeader } from "@/components/site/site-header";
import { buttonStyles } from "@/components/ui/button";
import { InstagramIcon } from "@/components/ui/icons";
import { Photo } from "@/components/ui/photo";
import { siteContent as c } from "@/content/site";
import { DAYS } from "@/lib/constants";
import { getFeatured, getSiteSettings } from "@/lib/data";
import { getSiteUrl, publicImageUrl } from "@/lib/env";
import {
  directionsUrl,
  formatPrice,
  groupOpeningHours,
  instagramUrl,
  telUrl,
  trLower,
} from "@/lib/format";
import { cn } from "@/lib/cn";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteSettings();
  const title = `${s.cafe_name} · Mahallenin oturma odası`;
  const description =
    s.about_text?.slice(0, 155) ??
    "Taze kavrulmuş kahve, ev yapımı tatlılar ve gün boyu çalışabileceğin bir masa.";
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: "/" },
    openGraph: { title, description, url: "/" },
  };
}

const sectionPad = "px-5 py-12 lg:px-16 lg:py-[88px]";
const kicker = "text-[11px] tracking-[0.14em] text-accent-700 uppercase lg:text-[12px]";
const h2 = "mt-2 text-[36px] leading-[1.05] font-normal lg:mt-2.5 lg:text-[52px]";

export default async function HomePage() {
  const [s, featured] = await Promise.all([getSiteSettings(), getFeatured()]);
  const logoUrl = publicImageUrl(s.logo_path);
  const directions = directionsUrl(s.address);
  const insta = instagramUrl(s.instagram);
  const tel = telUrl(s.phone);
  const hours = groupOpeningHours(s.opening_hours);
  const closedDays = s.opening_hours.filter((h) => !h.open).map((h) => DAYS[h.day]);
  const instaHandle = s.instagram ? `@${s.instagram.replace(/^@/, "")}` : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CafeOrCoffeeShop",
    name: s.cafe_name,
    url: getSiteUrl(),
    telephone: s.phone ?? undefined,
    address: s.address ?? undefined,
    servesCuisine: "Kahve",
    hasMenu: `${getSiteUrl()}/menu`,
    sameAs: insta ? [insta] : undefined,
    openingHoursSpecification: s.opening_hours
      .filter((h) => h.open)
      .map((h) => ({
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"][h.day],
        opens: h.from,
        closes: h.to,
      })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <a
        href="#icerik"
        className="sr-only z-50 rounded-md bg-bg px-4 py-2 focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        İçeriğe geç
      </a>
      <SiteHeader cafeName={s.cafe_name} logoUrl={logoUrl} />

      <main id="icerik">
        {/* ── Hero ── */}
        <section className="grid gap-[18px] px-5 pt-7 pb-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-end lg:gap-16 lg:px-16 lg:pt-[72px] lg:pb-[88px]">
          <div className="flex flex-col gap-[18px] lg:gap-6 lg:pb-5">
            <span className={kicker}>{c.heroKicker}</span>
            <h1 className="text-[54px] leading-[0.98] font-normal tracking-[-0.03em] md:text-[72px] lg:text-[92px] lg:leading-[0.95]">
              {c.heroTitle.plain} <em>{c.heroTitle.italic}</em>
            </h1>
            <p className="max-w-[440px] text-[16px] leading-[1.6] text-pretty text-neutral-800 lg:text-[17px]">
              <span className="lg:hidden">{c.heroLeadShort}</span>
              <span className="hidden lg:inline">{c.heroLead}</span>
            </p>
            <div className="order-last grid grid-cols-2 gap-2.5 lg:order-none lg:flex lg:gap-3 lg:pt-2">
              <Link
                href="/menu"
                className={buttonStyles({ variant: "filled", size: "xl", className: "px-0 text-[17px] lg:px-[26px] lg:text-[18px]" })}
              >
                Menüyü Gör
              </Link>
              {directions ? (
                <a
                  href={directions}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonStyles({ variant: "secondary", size: "xl", className: "gap-2.5 px-0 text-[17px] lg:px-6 lg:text-[18px]" })}
                >
                  <MapPin size={18} strokeWidth={1.75} aria-hidden className="hidden lg:block" />
                  Yol Tarifi
                </a>
              ) : null}
            </div>
            <Photo
              src={c.heroImage.src}
              alt={c.heroImage.alt}
              label={c.heroImage.label}
              sizes="100vw"
              priority
              stripes="lg"
              labelClassName="bottom-3 left-3 text-[10px]"
              className="plate h-[300px] lg:hidden"
            />
          </div>
          <Photo
            src={c.heroImage.src}
            alt={c.heroImage.alt}
            label={c.heroImage.label}
            sizes="58vw"
            stripes="lg"
            labelClassName="bottom-5 left-5 text-[12px]"
            className="plate hidden h-[600px] border-8 lg:block"
          />
        </section>

        {/* ── Hakkımızda ── */}
        <section
          id="hakkimizda"
          aria-labelledby="hakkimizda-baslik"
          className={cn(sectionPad, "scroll-mt-16 border-t border-divider lg:grid lg:scroll-mt-[76px] lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16")}
        >
          <div>
            <span className={kicker}>Hakkımızda</span>
            <h2 id="hakkimizda-baslik" className={h2}>
              {c.aboutTitle}
            </h2>
          </div>
          <div className="mt-4 flex flex-col gap-4 lg:mt-0 lg:gap-10">
            {s.about_text ? (
              <p className="max-w-[640px] text-[16px] leading-[1.65] hyphens-auto lg:text-justify lg:text-[18px]">
                {s.about_text}
              </p>
            ) : null}
            <ol className="flex flex-col border-t border-divider lg:grid lg:grid-cols-3">
              {c.values.map((v, i) => (
                <li
                  key={v.title}
                  className={cn(
                    "flex gap-3.5 border-b border-divider py-4 lg:flex-col lg:gap-2 lg:border-b-0 lg:pt-[22px] lg:pb-0",
                    i === 0 && "lg:pr-6",
                    i === 1 && "lg:border-l lg:px-6",
                    i === 2 && "lg:border-l lg:pl-6",
                  )}
                >
                  <span className="tnum font-heading text-accent-700 lg:text-[15px]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="flex flex-col gap-0.5 lg:gap-2">
                    <h3 className="text-[21px] lg:text-[24px]">{v.title}</h3>
                    <p className="text-[14px] leading-[1.55] text-neutral-800">{v.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── Öne çıkanlar ── */}
        {featured.length ? (
          <section
            id="one-cikanlar"
            aria-labelledby="one-cikanlar-baslik"
            className="scroll-mt-16 border-t border-divider py-12 pl-5 lg:scroll-mt-[76px] lg:px-16 lg:py-[88px]"
          >
            <div className="flex items-end justify-between pr-5 pb-[18px] lg:pr-0 lg:pb-9">
              <div>
                <span className={kicker}>Öne çıkanlar</span>
                <h2 id="one-cikanlar-baslik" className={h2}>
                  {c.featuredTitle}
                </h2>
              </div>
              <Link
                href="/menu"
                className="hidden font-heading text-[17px] font-semibold text-accent-700 underline underline-offset-[5px] lg:inline"
              >
                Tüm menü →
              </Link>
            </div>
            <ul className="no-scrollbar flex snap-x snap-mandatory gap-3.5 overflow-x-auto pr-5 lg:grid lg:grid-cols-3 lg:gap-x-8 lg:gap-y-10 lg:overflow-visible lg:pr-0">
              {featured.map((p) => (
                <li key={p.id} className="flex w-[250px] flex-none snap-start flex-col gap-2.5 lg:w-auto lg:gap-3.5">
                  <Photo
                    src={publicImageUrl(p.image_path)}
                    alt={p.name}
                    label={trLower(p.name)}
                    sizes="(min-width: 1024px) 30vw, 250px"
                    stripes="lg"
                    labelClassName="bottom-2.5 left-2.5 text-[10px] lg:bottom-3 lg:left-3 lg:text-[11px]"
                    className="plate h-[200px] border-[5px] lg:aspect-[4/3] lg:h-auto lg:border-[6px]"
                  />
                  <div className="flex items-baseline justify-between gap-3 lg:border-b lg:border-divider lg:pb-3">
                    <div className="flex flex-col gap-0.5">
                      <h3 className="text-[21px] lg:text-[24px]">{p.name}</h3>
                      {p.description ? (
                        <span className="hidden text-[13px] text-neutral-700 lg:line-clamp-1">{p.description}</span>
                      ) : null}
                    </div>
                    <span className="tnum font-heading text-[19px] font-semibold lg:text-[22px]">
                      {formatPrice(p.price)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
            <Link
              href="/menu"
              className="mt-5 inline-block font-heading text-[17px] font-semibold text-accent-700 underline underline-offset-[5px] lg:hidden"
            >
              Tüm menü →
            </Link>
          </section>
        ) : null}

        {/* ── Mekân ── */}
        <section
          id="mekan"
          aria-labelledby="mekan-baslik"
          className={cn(sectionPad, "scroll-mt-16 border-t border-divider lg:scroll-mt-[76px]")}
        >
          <div className="pb-[18px] lg:pb-9">
            <span className={kicker}>Mekân</span>
            <h2 id="mekan-baslik" className={h2}>
              {c.galleryTitle}
            </h2>
          </div>
          <div className="grid grid-cols-2 grid-rows-[220px_150px_150px] gap-2.5 lg:grid-cols-12 lg:grid-rows-[280px_220px_280px] lg:gap-4">
            {c.gallery.map((g, i) => (
              <Photo
                key={g.label}
                src={g.src}
                alt={g.alt}
                label={g.label}
                sizes={i === 0 ? "(min-width: 1024px) 58vw, 100vw" : "(min-width: 1024px) 40vw, 50vw"}
                stripes="lg"
                labelClassName="bottom-2.5 left-2.5 text-[10px] lg:bottom-3.5 lg:left-3.5 lg:text-[11px]"
                className={cn(
                  "plate border-[5px] lg:border-[6px]",
                  i === 0 && "col-span-2 lg:col-[1/8] lg:row-[1/3]",
                  i === 1 && "lg:col-[8/13] lg:row-[1/2]",
                  i === 2 && "row-span-2 row-start-2 col-start-1 lg:col-[8/13] lg:row-[2/4]",
                  i === 3 && "lg:col-[1/4] lg:row-[3/4]",
                  i === 4 && "hidden lg:col-[4/8] lg:row-[3/4] lg:block",
                )}
              />
            ))}
          </div>
        </section>

        {/* ── Ziyaret ── */}
        <section
          id="ziyaret"
          aria-labelledby="ziyaret-baslik"
          className={cn(sectionPad, "scroll-mt-16 border-t border-divider lg:grid lg:scroll-mt-[76px] lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16")}
        >
          <div className="flex flex-col gap-[18px] lg:gap-7">
            <div>
              <span className={kicker}>Ziyaret</span>
              <h2 id="ziyaret-baslik" className={h2}>
                {c.visitTitle}
              </h2>
            </div>
            <MapBlock
              className="h-[220px] border-[5px] lg:hidden"
              embedUrl={s.map_embed_url}
              cafeName={s.cafe_name}
              address={s.address}
              directions={null}
            />
            {hours.length ? (
              <dl className="flex flex-col">
                {hours.map((h) => (
                  <div key={h.d} className="flex justify-between border-b border-divider py-[11px] text-[15px] lg:py-3">
                    <dt>{h.d}</dt>
                    <dd className="tnum">{h.t}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
            <ul className="flex flex-col gap-3 text-[15px]">
              {s.address ? (
                <li className="flex gap-3">
                  <MapPin size={18} strokeWidth={1.75} className="mt-0.5 flex-none text-accent-700" aria-hidden />
                  <address className="not-italic">{s.address}</address>
                </li>
              ) : null}
              {closedDays.length ? (
                <li className="flex gap-3">
                  <Clock size={18} strokeWidth={1.75} className="mt-0.5 flex-none text-accent-700" aria-hidden />
                  {closedDays.join(", ")} kapalıyız — dinleniyoruz.
                </li>
              ) : null}
              {s.phone && tel ? (
                <li className="flex gap-3">
                  <Phone size={18} strokeWidth={1.75} className="mt-0.5 flex-none text-accent-700" aria-hidden />
                  <a href={tel} className="tnum no-underline hover:underline">
                    {s.phone}
                  </a>
                </li>
              ) : null}
              {insta && instaHandle ? (
                <li className="flex gap-3">
                  <InstagramIcon size={18} className="mt-0.5 flex-none text-accent-700" aria-hidden />
                  <a href={insta} target="_blank" rel="noopener noreferrer" className="no-underline hover:underline">
                    {instaHandle}
                  </a>
                </li>
              ) : null}
            </ul>
            <div className="grid grid-cols-2 gap-2.5 lg:hidden">
              {directions ? (
                <a
                  href={directions}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonStyles({ variant: "primary", size: "xl", className: "px-0 text-[16px]" })}
                >
                  Yol tarifi
                </a>
              ) : null}
              {tel ? (
                <a href={tel} className={buttonStyles({ variant: "secondary", size: "xl", className: "px-0 text-[16px]" })}>
                  Ara
                </a>
              ) : null}
            </div>
          </div>
          <MapBlock
            className="hidden min-h-[520px] lg:grid"
            embedUrl={s.map_embed_url}
            cafeName={s.cafe_name}
            address={s.address}
            directions={directions}
          />
        </section>
      </main>

      <footer className="flex flex-col gap-1.5 border-t border-divider px-5 pt-9 pb-11 lg:flex-row lg:items-end lg:gap-8 lg:px-16 lg:py-12">
        <div className="flex flex-col gap-1.5 lg:mr-auto">
          <span className="font-heading text-[32px] leading-none lg:text-[40px]">{s.cafe_name}</span>
          <span className="hidden text-[13px] text-neutral-700 lg:block">
            {s.location_label ?? "Mahalle kafesi"}
          </span>
        </div>
        <nav aria-label="Alt bağlantılar" className="my-2 flex gap-5 text-[13px] lg:my-0 lg:gap-8">
          <Link href="/menu" className="no-underline hover:underline">
            Menü
          </Link>
          {insta ? (
            <a href={insta} target="_blank" rel="noopener noreferrer" className="no-underline hover:underline">
              Instagram
            </a>
          ) : null}
          {directions ? (
            <a href={directions} target="_blank" rel="noopener noreferrer" className="no-underline hover:underline">
              Yol tarifi
            </a>
          ) : null}
        </nav>
        <span className="text-[12px] text-neutral-700">
          © {new Date().getFullYear()} {s.cafe_name}
          <span className="lg:hidden"> · {s.location_label ?? "Mahalle kafesi"}</span>
        </span>
      </footer>
    </>
  );
}

function MapBlock({
  embedUrl,
  cafeName,
  address,
  directions,
  className,
}: {
  embedUrl: string | null;
  cafeName: string;
  address: string | null;
  directions: string | null;
  className?: string;
}) {
  if (embedUrl) {
    return (
      <div className={cn("plate relative overflow-hidden", className)}>
        <iframe
          src={embedUrl}
          title={`${cafeName} harita konumu`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="absolute inset-0 size-full border-0"
        />
      </div>
    );
  }
  return (
    <div className={cn("plate map-grid relative grid place-items-center overflow-hidden", className)}>
      <div className="flex flex-col items-center gap-2" aria-hidden>
        <span className="size-[18px] rounded-full bg-accent shadow-[0_0_0_7px_color-mix(in_srgb,var(--color-accent)_22%,transparent)] lg:size-5 lg:shadow-[0_0_0_8px_color-mix(in_srgb,var(--color-accent)_22%,transparent)]" />
        <span className="hidden rounded-md border border-divider bg-bg px-3 py-1.5 font-heading text-[15px] font-semibold lg:block">
          {cafeName}
        </span>
      </div>
      {address ? (
        <span className="absolute bottom-3.5 left-3.5 hidden font-mono text-[11px] text-neutral-700 lg:block">
          harita · {address}
        </span>
      ) : null}
      {directions ? (
        <a
          href={directions}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonStyles({ variant: "primary", size: "md", className: "absolute right-4 bottom-3.5 bg-bg" })}
        >
          Yol tarifi al
        </a>
      ) : null}
    </div>
  );
}
