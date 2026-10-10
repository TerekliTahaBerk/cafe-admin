"use client";

import Link from 'next/link';
import { useEffect } from 'react';
import { LOCALES, localizedPath, type Locale } from '@/lib/i18n';

const names = { tr: 'Türkçe', en: 'English', de: 'Deutsch' };
export function LanguageSwitcher({ locale, page = '' }: { locale: Locale; page?: string }) {
  useEffect(() => { document.documentElement.lang = locale; }, [locale]);
  return <nav className="language-switcher" aria-label={locale === 'tr' ? 'Dil seçimi' : locale === 'en' ? 'Language' : 'Sprache'}>
    {LOCALES.map((l) => <Link key={l} href={localizedPath(l, page)} hrefLang={l} lang={l} aria-label={names[l]} aria-current={locale === l ? 'page' : undefined}>{l.toUpperCase()}</Link>)}
  </nav>;
}
