# Jön Coffee & Patisserie — web sitesi, QR menü ve yönetim paneli

Mahalle kafesi için tek proje: tanıtım sitesi (`/`), telefondan açılan QR menü (`/menu`) ve kafe sahibinin ürün/stok yönettiği panel (`/admin`). Arayüz Türkçedir. Jön kimliği `#748064` / `#d0c9be`, Cormorant Garamond başlıklar, DM Sans gövde, kemerli hero ve yuvarlatılmış menü kartlarından oluşur. Mekân self servistir; sepet veya online sipariş yoktur. Görsel kaynakları: [docs/brand-assets.md](docs/brand-assets.md).

**Teknoloji:** Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · Supabase (Postgres, Auth, Storage) · zod · react-hook-form · @dnd-kit · qrcode · pdf-lib · sonner · Vercel

| Rota | Ne yapar |
| --- | --- |
| `/` | Tanıtım sitesi: hero, hikâye, kahve/patisserie anlatımı, self servis, saatler/adres/harita |
| `/menu` | Herkese açık QR menü: yapışkan kategori filtreleri, arama, ürün detayı (bottom sheet), “Tükendi” durumu |
| `/admin/login` | Yönetici girişi (+ `/admin/forgot-password`) |
| `/admin` | Özet: toplam / stokta / tükenen, tükenenleri tek dokunuşla stoğa alma |
| `/admin/products` | Ürün listesi, arama, kategori + durum filtresi, tek dokunuşla stok anahtarı, ekle/düzenle/sil |
| `/admin/categories` | Kategori ekle, yeniden adlandır, sürükle-bırak sırala, sil (ürünleri taşıyarak) |
| `/admin/qr` | QR önizleme, PNG indir, yazdırılabilir masa kartı PDF'i (A7 / A6 / A5) |
| `/admin/settings` | Kafe bilgileri, logo, çalışma saatleri, iletişim, şifre değiştirme |

---

## 1. Yerel kurulum

Gereksinimler: Node.js 20.9+, npm. Yerel Supabase için ayrıca Docker.

```bash
git clone https://github.com/TerekliTahaBerk/cafe-admin.git
cd cafe-admin
npm install
cp .env.example .env.local   # değerleri doldur (aşağıya bak)
npm run dev                  # http://localhost:3000
```

### Seçenek A — Yerel Supabase (Docker ile, önerilen geliştirme ortamı)

```bash
npx supabase start          # migration'ları ve seed.sql'i otomatik uygular
npx supabase status         # API URL ve anon key'i gösterir
```

`.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<status çıktısındaki anon key>
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Veritabanını sıfırlayıp tekrar doldurmak için: `npx supabase db reset`.

### Seçenek B — Doğrudan bulut Supabase projesi

Aşağıdaki 2–4. adımları uygula, `.env.local` içine projenin URL ve anon key'ini yaz.

## 2. Supabase projesi oluşturma

1. [supabase.com/dashboard](https://supabase.com/dashboard) → **New project**. Bölge olarak kullanıcılara yakın birini seç (ör. *Central EU (Frankfurt)*).
2. **Project Settings → API** sayfasından şunları al:
   - *Project URL* → `NEXT_PUBLIC_SUPABASE_URL`
   - *anon / publishable* key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - *service_role / secret* key'i **hiçbir yere koyma**; uygulama buna ihtiyaç duymaz.
3. **Authentication → Sign In / Providers**:
   - **Allow new users to sign up** → **kapalı** (kayıt kapalı; admin elle eklenir).
   - Email sağlayıcısı açık kalmalı (şifreyle giriş için gerekli).
4. **Authentication → URL Configuration**:
   - *Site URL*: `https://senin-alan-adin.com`
   - *Redirect URLs*: `https://senin-alan-adin.com/auth/confirm` (yerelde `http://localhost:3000/auth/confirm`)

## 3. Migration'ları çalıştırma

Şema, RLS politikaları, `product-images` bucket'ı ve storage politikaları tek dosyada: `supabase/migrations/20261003100000_init.sql`. Örnek menü verisi: `supabase/seed.sql`.

**CLI ile (önerilen):**

```bash
npx supabase login
npx supabase link --project-ref <proje-ref>     # Project Settings → General
npx supabase db push                            # migration'ları uygular
npx supabase db push --include-seed             # (isteğe bağlı) örnek veriyi de yükler
```

**Panelden:** *SQL Editor*'e önce migration dosyasının, sonra (istersen) `seed.sql`'in içeriğini yapıştırıp çalıştır.

## 4. Admin kullanıcısı ekleme

Sadece giriş yapmış olmak yetmez; kullanıcının `public.admins` tablosunda olması gerekir (RLS bunu `is_admin()` ile kontrol eder).

1. **Authentication → Users → Add user → Create new user**: e-posta + şifre gir, *Auto Confirm User* işaretli olsun.
2. **SQL Editor**'de:

```sql
insert into public.admins (user_id)
select id from auth.users where email = 'ayse@kafeadi.com';
```

Yetkiyi geri almak için `delete from public.admins where user_id = (select id from auth.users where email = '…');`.

Yerel Supabase'de aynı işlemi `npx supabase status` çıktısındaki Studio adresinden ya da `psql postgresql://postgres:postgres@127.0.0.1:54322/postgres` ile yapabilirsin.

## 5. Ortam değişkenleri

| Değişken | Nerede | Açıklama |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | istemci + sunucu | Supabase proje URL'si |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | istemci + sunucu | anon/publishable key — RLS ile korunur, istemcide görünmesi güvenlidir |
| `NEXT_PUBLIC_SITE_URL` | istemci + sunucu | Sitenin kök adresi (sonda `/` yok). QR kod, sitemap, canonical ve şifre sıfırlama bağlantısı bunu kullanır. Vercel'de tanımlı değilse `VERCEL_PROJECT_PRODUCTION_URL` kullanılır. |

Service role key uygulamada **hiç kullanılmaz**; tüm yazma işlemleri giriş yapmış adminin oturumuyla ve RLS altında yapılır.

## 6. Vercel'e deploy

1. Repoyu GitHub'a gönder, [vercel.com/new](https://vercel.com/new) → **Import** ile projeyi seç (Framework: Next.js, ayar gerekmez).
2. **Settings → Environment Variables**: yukarıdaki üç değişkeni *Production* (ve istersen *Preview*) için ekle.
3. **Deploy**. Sonra **Settings → Domains** ile alan adını bağla ve `NEXT_PUBLIC_SITE_URL`'i bu adrese güncelleyip yeniden deploy et.
4. Supabase **Authentication → URL Configuration**'a üretim adresini ve `/auth/confirm` yönlendirmesini ekle.
5. `/admin/qr` sayfasından masa kartını indir; QR, `NEXT_PUBLIC_SITE_URL + /menu` adresini gösterir.

## Komutlar

```bash
npm run dev       # geliştirme sunucusu
npm run build     # üretim derlemesi
npm run start     # üretim sunucusu
npm run lint      # ESLint
npx tsc --noEmit  # tip kontrolü
```

---

## Mimari notlar

- **Veri akışı.** `/` ve `/menu` statik üretilir ve önbelleğe alınır (ISR, 5 dk güvenlik ağı). Her Server Action sonunda `revalidatePath('/menu')` ve `revalidatePath('/')` çağrılır, böylece stok değişikliği menüye hemen yansır. Herkese açık sayfalar çerezsiz anonim istemciyle okur; RLS yalnızca `is_visible = true` ürünleri döndürür.
- **Güvenlik katmanları.**
  1. `src/proxy.ts` (Next 16'da `middleware`'in yeni adı): `/admin/*` için oturum yoksa `/admin/login`'e yönlendirir, oturum çerezini yeniler, `X-Robots-Tag: noindex` ekler.
  2. Panel layout'u ve **her** Server Action `requireAdmin()` ile `is_admin()` kontrolü yapar.
  3. Veritabanında RLS: okuma herkese açık (`products` için yalnızca görünür olanlar), yazma yalnızca `admins` tablosundaki kullanıcılara. Kategori silme `ON DELETE RESTRICT` ile korunur.
  4. Storage: `product-images` bucket'ı herkese açık okunur (CDN URL'si), yalnızca adminler yükler/siler; anonim kullanıcı bucket'ı listeleyemez. Bucket ayrıca 5 MB ve JPG/PNG/WebP ile sınırlıdır.
- **Doğrulama.** `src/lib/validation.ts` içindeki zod şemaları hem react-hook-form'da (istemci) hem Server Action'larda (sunucu) çalışır.
- **Görsel yükleme.** İstemci dosya türünü (JPG/PNG/WebP) ve boyutu (≤ 5 MB) kontrol eder, görseli kare kırpıp en fazla 1200 px WebP'ye çevirir (Vercel'in ~4.5 MB istek sınırının altında kalır). Sunucu türü, boyutu ve dosyanın gerçek imzasını (magic bytes) yeniden kontrol eder. Görsel değişince veya ürün silinince eski dosya storage'dan silinir.
- **Stok anahtarı.** İyimser güncelleme: anahtar hemen döner, hata olursa geri alınır ve toast gösterilir; başarılıysa toast'ta “Geri al” vardır.
- **Tasarım token'ları.** `src/app/globals.css` içindeki `@theme` bloğu Jön renklerini tüm site ve panele uygular. Public site/menü stilleri ortak bir tasarım sistemi kullanır.

## Test edilenler

Yerel Supabase yığını (`supabase start`) üzerinde, Playwright ile tarayıcıda:

- Giriş (doğru/yanlış şifre, admin olmayan hesap reddi), çıkış, oturumsuz `/admin/*` yönlendirmesi.
- Ürün ekleme (görsel yüklemeyle) → `/menu`'de anında görünme; görsel değiştirme → eski dosyanın storage'dan silinmesi; HEIC dosyasının reddi; ürün silme → görselin silinmesi; doğrulama hataları ve hata özeti.
- Stok anahtarı + “Geri al” toast'u; silme onayı ve “menüde gösterme” kısayolu.
- Kategori: klavyeyle sürükle-bırak sıralama (menüye yansıması), ekleme, yeniden adlandırma, ürünlü kategoriyi “Taşı ve sil”.
- Ayarlar: saat doğrulaması, kaydetme, şifre eşleşmeme hatası.
- QR: PNG ve A7/A6/A5 PDF indirme (Türkçe karakterli fontlar PDF'de doğru).
- RLS: anonim ve admin olmayan kullanıcıların REST/Storage üzerinden yazamadığı, gizli ürünleri göremediği, bucket'ı listeleyemediği; kayıt (sign-up) isteğinin reddedildiği.

**Lighthouse (mobil, `next start`):** gerçek ağ/CPU kısıtlamasıyla (`--throttling-method=devtools`) `/` ve `/menu` için Performans 97, Erişilebilirlik 100, En iyi uygulamalar 100, SEO 100. Lighthouse'un varsayılan *simüle* modunda `/` 96, `/menu` 88 performans alıyor; tarayıcıda yavaş 4G + 4× CPU ile ölçülen gerçek LCP `/menu` için ~1 sn. Gerçek ürün fotoğrafları eklendiğinde yeniden ölçmek iyi olur.

---

## Varsayımlar

- **Next.js 16 kullanıldı.** Bu sürümde `middleware.ts` dosyasının adı `proxy.ts` oldu; spesifikasyondaki “middleware ile koruma” `src/proxy.ts` ile yapılıyor.
- **Admin kontrolü** `public.admins` tablosu + `is_admin()` (SECURITY DEFINER) fonksiyonuyla yapılıyor. Birden çok admin eklenebilir.
- **`site_settings`'e üç alan eklendi:** `location_label` (menüde kafe adının altındaki “Mahalle kafesi · Moda” satırı), `wifi_password` (menü başlığındaki Wi‑Fi bilgisi) ve `updated_at`. Tasarımda bu bilgiler vardı ama veri modelinde yoktu. `opening_hours` biçimi: `[{ "day": 0-6 (0 = Pazartesi), "open": bool, "from": "08:00", "to": "22:00" }]`.
- **Etiket ve alerjenler** sabit listelerdir (`src/lib/constants.ts`) ve veritabanında anahtar olarak saklanır (`yeni`, `vegan`, `glutensiz`, `aci`, `ev-yapimi` / `sut`, `gluten`, `yumurta`, `kuruyemis`, `soya`, `susam`).
- **“Öne çıkar” anahtarı** ürün formuna eklendi (`is_featured`); ana sayfadaki “Mahallenin favorileri” bölümünde en fazla 6 öne çıkan ürün gösterilir.
- **`/admin` özet sayfası** tasarımda ayrı bir ekran olarak yoktu. Tasarımdaki özet şeridini, tükenenler listesini ve kısayolları içeriyor. Kenar çubuğuna ve mobil sekme çubuğuna “Özet” sekmesi eklendi (mobilde 5 sekme).
- **Ürün silmede “Geri al” yok** (görsel de silindiği için). Silme her zaman onay diyaloğu istiyor. “Geri al” stok değişikliğinde var.
- **Kategori silme:** içinde ürün varsa silme engelleniyor ve ürünleri başka bir kategoriye taşıyıp silme seçeneği sunuluyor (tasarımdaki “Taşı ve sil”). Boş kategoriler menüde gösterilmiyor.
- **Görseller kare kırpılıyor** (merkezden) ve WebP'ye çevriliyor. Tasarımdaki serbest kırpma aracı yerine kesikli çizgi “menüde görünecek alan” ipucu kullanıldı.
- **Logo** aynı `product-images` bucket'ında `site/` klasörüne yükleniyor. Biçim PNG/WebP/JPG; SVG kabul edilmiyor (güvenlik ve bucket kısıtı).
- **Tanıtım görselleri** temsili ImageGen görselleridir; üretim briefleri `docs/brand-assets.md` içinde. Gerçek mekân görselleriyle değiştirmek için `public/images/` ve `src/content/site.ts` kullanılabilir.
- **Harita:** Ayarlar'a Google Haritalar “Harita yerleştir” bağlantısı (ya da OpenStreetMap) girilirse gerçek harita gösterilir; boşsa tasarımdaki stilize harita alanı ve “Yol tarifi al” bağlantısı görünür.
- **Masa kartı PDF'i** tarayıcıda, sayfanın kendi fontlarıyla 300 dpi çiziliyor ve beyaz zemine basılıyor (mürekkep tasarrufu için tasarımdaki gri zemin yerine).
- **Selamlama** (“Günaydın / İyi günler / İyi akşamlar”) ve “Bugün açığız” satırı İstanbul saatine göre ziyaretçinin tarayıcısında hesaplanıyor; önbellekteki sayfa gün boyu doğru kalıyor.
- **Erişilebilirlik için küçük renk ayarı:** tasarımda tükenen ürünün fiyatı ve bazı küçük gri metinler `neutral-600` idi; WCAG kontrastını sağlamak için `neutral-700` yapıldı.
- **Şifre sıfırlama:** “Şifremi unuttum” e-posta gönderir; bağlantı `/auth/confirm` üzerinden oturum açıp Ayarlar'daki şifre formuna yönlendirir. Supabase'in e-posta şablonu varsayılan haliyle çalışır.
- **“Beni hatırla”** işaretli değilse oturum çerezleri tarayıcı kapanınca silinen oturum çerezlerine dönüşür.
