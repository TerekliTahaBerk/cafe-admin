import { notFound } from 'next/navigation';
import { MenuPage, menuMetadata } from '@/components/menu/menu-page';
import { isLocale } from '@/lib/i18n';

export const revalidate = 300;
export const dynamicParams = false;
export function generateStaticParams() { return [{ locale: 'en' }, { locale: 'de' }]; }
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale) || locale === 'tr') notFound();
  return menuMetadata(locale);
}
export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale) || locale === 'tr') notFound();
  return <MenuPage locale={locale} />;
}
