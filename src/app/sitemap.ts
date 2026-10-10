import type { MetadataRoute } from 'next';
import { getSiteUrl } from '@/lib/env';
import { LOCALES, languageAlternates, localizedPath } from '@/lib/i18n';

export default function sitemap(): MetadataRoute.Sitemap {
  const site = getSiteUrl();
  return LOCALES.flatMap((locale) => ['', '/menu'].map((page) => ({
    url: `${site}${localizedPath(locale, page)}`,
    changeFrequency: page ? 'daily' as const : 'weekly' as const,
    priority: page ? 0.9 : 1,
    alternates: { languages: Object.fromEntries(Object.entries(languageAlternates(page)).map(([l,p]) => [l, `${site}${p}`])) },
  })));
}
