/**
 * Static copy and imagery for the public site. Text that the owner edits
 * often (name, about text, hours, contact) lives in Supabase `site_settings`;
 * this file holds the editorial bits from the design.
 *
 * To replace a striped placeholder with a real photo, put the file under
 * /public/images and set its `src` (e.g. "/images/hero.jpg").
 */
export const siteContent = {
  heroKicker: "Moda, Kadıköy · 2019’dan beri",
  heroTitle: { plain: "Mahallenin", italic: "oturma odası." },
  heroLead:
    "Taze kavrulmuş kahve, sabah fırından çıkan kek, gün boyu çalışabileceğin bir masa. Adını bilen bir barista.",
  heroLeadShort: "Taze kahve, sabah fırından çıkan kek, gün boyu çalışabileceğin bir masa.",
  heroImage: {
    src: null as string | null,
    alt: "Pencere kenarında, sabah ışığında buharı tüten bir fincan",
    label: "hero fotoğrafı · pencere kenarı, sabah ışığı, buharı tüten fincan",
  },
  aboutTitle: "Komşu gibi bir kafe.",
  values: [
    {
      title: "Taze çekirdek",
      text: "Kavrulduktan sonraki üç hafta içinde demleriz. Her hafta yeni bir yöre.",
    },
    {
      title: "Ev yapımı tatlılar",
      text: "Kekler, cheesecake ve kurabiyeler her sabah bu mutfakta.",
    },
    {
      title: "Çalışmaya uygun",
      text: "Hızlı Wi‑Fi, her masada priz, arka salonda sessiz köşe.",
    },
  ],
  featuredTitle: "Mahallenin favorileri",
  galleryTitle: "Bir köşe seç, otur.",
  gallery: [
    { src: null as string | null, alt: "Ana salon, geniş açı", label: "ana salon · geniş açı" },
    { src: null as string | null, alt: "Espresso makinesi başında barista", label: "espresso makinesi, barista eli" },
    { src: null as string | null, alt: "Arka salondaki sessiz çalışma köşesi", label: "arka salon · sessiz çalışma köşesi" },
    { src: null as string | null, alt: "Tezgâhta dizili ev yapımı kekler", label: "tezgâhta kekler" },
    { src: null as string | null, alt: "Kaldırımdaki masalar", label: "kaldırım masaları" },
  ],
  visitTitle: "Uğra, kahve hazır.",
  loginImage: {
    src: null as string | null,
    label: "atmosfer fotoğrafı · sabah ışığında tezgâh",
    quote: "“Sabah yedi buçuk. İlk demlik çay, ilk tanıdık yüz.”",
  },
} as const;
