# Languages

The public site and QR menu support Turkish, English and German. Turkish uses `/` and `/menu`; English uses `/en` and `/en/menu`; German uses `/de` and `/de/menu`. The language links keep visitors on the equivalent page, and all navigation stays within the selected language. Currency remains Turkish lira. Canonical URLs, hreflang links and the sitemap cover all six pages.

Site copy is maintained in `src/lib/i18n/messages.json`. Shared renderers live in `components/site/home-page.tsx` and `components/menu/menu-page.tsx`. Public content has a server-rendered `lang` attribute; the language selector also updates the document language on navigation.

Product forms have Türkçe, English and Deutsch tabs. Names and descriptions are independent; all three languages are saved together. Empty English or German fields fall back to the corresponding Turkish field. Prices, photos, tags, allergens, stock and visibility are shared. Translations have the same limits as Turkish (80 characters for names, 140 for descriptions). The category rename form also supports English and German names; new categories can have their translations added there.

`supabase/migrations/20261010190000_menu_translations.sql` adds nullable translation columns and backfills the existing 16 products and 5 categories. It was applied to the connected Supabase project using its SQL editor. It preserves existing translations and only translates known matching Turkish descriptions. No permissions or RLS policies change. Apply this migration before deploying this version to another environment. All six public routes are revalidated on admin saves.

Validation: production build, lint, 13 assertions covering translation fallback, source preservation, shared values, German/Turkish search normalization, route paths and server-side field limits; desktop/mobile browser checks for language switching, translated menus, searches and product details. Admin persistence is checked against the deployed application.
