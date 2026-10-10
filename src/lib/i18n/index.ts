import messages from './messages.json';
import type { Product } from '@/lib/types';

export const LOCALES = ['tr', 'en', 'de'] as const;
export type Locale = (typeof LOCALES)[number];
export function isLocale(value: string): value is Locale { return LOCALES.some((l) => l === value); }
export function translate(locale: Locale, text: string): string {
  return locale === 'tr' ? text : (messages as Record<string, Record<string, string>>)[text]?.[locale] ?? text;
}
export function localizedPath(locale: Locale, page = '') { return `${locale === 'tr' ? '' : `/${locale}`}${page || '/'}`.replace(/\/$/, '') || '/'; }
export function languageAlternates(page = '') { return Object.fromEntries(LOCALES.map((l) => [l, localizedPath(l, page)])); }
export function localizedProduct(p: Product, locale: Locale): Product {
  if (locale === 'tr') return p;
  return { ...p, name: p[`name_${locale}`]?.trim() || p.name, description: p[`description_${locale}`]?.trim() || p.description };
}
export const DAYS_BY_LOCALE: Record<Locale, string[]> = {
  tr: ['Pazartesi','Salı','Çarşamba','Perşembe','Cuma','Cumartesi','Pazar'],
  en: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'],
  de: ['Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag','Sonntag'],
};
export function resultsLabel(locale: Locale, query: string, count: number) {
  return locale === 'en' ? `${count} ${count === 1 ? "result" : "results"} for “${query}”` : locale === 'de' ? `${count} ${count === 1 ? "Ergebnis" : "Ergebnisse"} für „${query}“` : `“${query}” için ${count} sonuç`;
}
export function stockLabel(locale: Locale, count: number) { return locale === 'en' ? `${count} items available` : locale === 'de' ? `${count} Artikel verfügbar` : `${count} ürün stokta`; }

export function optionLabel(locale: Locale, count: number) { return locale === "en" ? (count === 1 ? "option" : "options") : locale === "de" ? (count === 1 ? "Auswahlmöglichkeit" : "Auswahlmöglichkeiten") : "seçenek"; }
