-- Sample content from the design (Kafe Adı · Moda, Kadıköy).
-- Safe to re-run: it clears products & categories first.

delete from public.products;
delete from public.categories;

insert into public.categories (id, name, sort_order) values
  ('11111111-1111-4111-8111-000000000001', 'Sıcak İçecekler', 1),
  ('11111111-1111-4111-8111-000000000002', 'Soğuk İçecekler', 2),
  ('11111111-1111-4111-8111-000000000003', 'Tatlılar',        3),
  ('11111111-1111-4111-8111-000000000004', 'Atıştırmalıklar', 4),
  ('11111111-1111-4111-8111-000000000005', 'Kahvaltılık',     5);

insert into public.products
  (category_id, name, description, price, tags, allergens, in_stock, is_visible, is_featured, sort_order)
values
  -- Sıcak İçecekler
  ('11111111-1111-4111-8111-000000000001', 'Türk Kahvesi', 'Közde, bakır cezvede. Yanında lokum ve bir bardak su.', 120, '{}', '{}', true, true, true, 1),
  ('11111111-1111-4111-8111-000000000001', 'Filtre Kahve', 'Haftanın çekirdeği Etiyopya Guji — çiçeksi, hafif, berrak.', 140, '{yeni}', '{}', true, true, true, 2),
  ('11111111-1111-4111-8111-000000000001', 'Latte', 'Çift shot espresso, ipeksi süt köpüğü. Yulaf sütüyle de olur.', 165, '{}', '{sut}', true, true, false, 3),
  ('11111111-1111-4111-8111-000000000001', 'Sahlep', 'Maraş sahlebi, üstüne bolca tarçın.', 150, '{}', '{sut}', false, true, false, 4),
  ('11111111-1111-4111-8111-000000000001', 'Demlik Çay', 'İki kişilik, Rize çayı, ince belli bardakta.', 90, '{vegan}', '{}', true, true, false, 5),
  -- Soğuk İçecekler
  ('11111111-1111-4111-8111-000000000002', 'Ev Yapımı Limonata', 'Taze sıkım, naneli, az şekerli.', 130, '{vegan,glutensiz}', '{}', true, true, true, 1),
  ('11111111-1111-4111-8111-000000000002', 'Cold Brew', '18 saat soğuk demleme, buz üstünde.', 170, '{vegan}', '{}', true, true, false, 2),
  ('11111111-1111-4111-8111-000000000002', 'Buzlu Latte', 'Espresso, soğuk süt, bol buz.', 175, '{}', '{sut}', true, true, false, 3),
  ('11111111-1111-4111-8111-000000000002', 'Kızılcık Şerbeti', 'Annemin tarifi, karanfilli.', 110, '{yeni,vegan}', '{}', true, true, false, 4),
  -- Tatlılar
  ('11111111-1111-4111-8111-000000000003', 'San Sebastian Cheesecake', 'Yüksek ısıda pişen, yüzeyi karamelleşmiş, içi kremamsı Bask usulü cheesecake.', 210, '{ev-yapimi,glutensiz}', '{sut,yumurta}', true, true, true, 1),
  ('11111111-1111-4111-8111-000000000003', 'Fıstıklı Brownie', 'Bitter çikolata, Antep fıstığı.', 160, '{ev-yapimi}', '{gluten,yumurta,kuruyemis,sut}', false, true, false, 2),
  ('11111111-1111-4111-8111-000000000003', 'Havuçlu Tarçınlı Kek', 'Cevizli, krem peynir kaplamalı.', 150, '{ev-yapimi}', '{gluten,yumurta,kuruyemis,sut}', true, true, true, 3),
  -- Atıştırmalıklar
  ('11111111-1111-4111-8111-000000000004', 'Kaşarlı Tost', 'Ekşi maya ekmek, eski kaşar, tereyağı.', 180, '{}', '{gluten,sut}', true, true, true, 1),
  ('11111111-1111-4111-8111-000000000004', 'Acılı Sucuklu Tost', 'Kasap sucuğu, kaşar, pul biber.', 220, '{aci}', '{gluten,sut}', true, true, false, 2),
  ('11111111-1111-4111-8111-000000000004', 'Humus Tabağı', 'Zeytinyağı, sumak, köz biber, pide.', 190, '{vegan,aci}', '{susam,gluten}', true, true, false, 3),
  -- Kahvaltılık
  ('11111111-1111-4111-8111-000000000005', 'Simit Tabağı', 'Beyaz peynir, domates, zeytin.', 140, '{}', '{gluten,susam,sut}', false, false, false, 1),
  ('11111111-1111-4111-8111-000000000005', 'Menemen', 'Köy yumurtası, közlenmiş biber, ekşi maya ekmekle.', 190, '{}', '{yumurta,gluten}', true, true, false, 2);

update public.site_settings set
  cafe_name      = 'Kafe Adı',
  tagline        = 'Siparişini kasada ver, masana geç. Hazır olunca adını sesleniriz.',
  location_label = 'Mahalle kafesi · Moda',
  about_text     = 'Kafe Adı, apartmanın zemin katındaki eski bir terzi dükkânında açıldı. Bugün hâlâ aynı tezgâhtayız: sabah öğrenciler, öğlen mahallenin teyzeleri, akşamüstü laptopuyla gelen komşular. Siparişini kasada ver, istediğin masaya geç — gerisini biz hallederiz.',
  address        = 'Moda Cad. No: 41, Kadıköy / İstanbul',
  phone          = '0216 345 67 89',
  instagram      = 'kafeadi',
  wifi_password  = 'mahalle2026',
  map_embed_url  = null,
  opening_hours  = '[
    {"day":0,"open":false,"from":"08:00","to":"22:00"},
    {"day":1,"open":true,"from":"08:00","to":"22:00"},
    {"day":2,"open":true,"from":"08:00","to":"22:00"},
    {"day":3,"open":true,"from":"08:00","to":"22:00"},
    {"day":4,"open":true,"from":"08:00","to":"22:00"},
    {"day":5,"open":true,"from":"09:00","to":"23:00"},
    {"day":6,"open":true,"from":"09:00","to":"23:00"}
  ]'::jsonb
where id;
