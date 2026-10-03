-- ════════════════════════════════════════════════════════════════════════
-- Kafe Adı — schema, Row Level Security and storage
-- ════════════════════════════════════════════════════════════════════════

create extension if not exists "pgcrypto";

-- ── Admins ──────────────────────────────────────────────────────────────
-- Being signed in is NOT enough to write: a user must also be listed here.
-- Rows are added by hand (SQL editor) — see README "Admin kullanıcısı ekleme".
create table public.admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;
-- No policies: the table is invisible to anon/authenticated roles. Only the
-- SECURITY DEFINER function below (and the dashboard / service role) reads it.

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admins a where a.user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- ── updated_at helper ───────────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ── Categories ──────────────────────────────────────────────────────────
create table public.categories (
  id         uuid primary key default gen_random_uuid(),
  name       text not null check (char_length(btrim(name)) between 1 and 40),
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index categories_sort_order_idx on public.categories (sort_order);

-- ── Products ────────────────────────────────────────────────────────────
create table public.products (
  id          uuid primary key default gen_random_uuid(),
  -- RESTRICT: a category that still has products cannot be deleted; the
  -- admin UI moves the products first ("Taşı ve sil").
  category_id uuid not null references public.categories (id) on delete restrict,
  name        text not null check (char_length(btrim(name)) between 1 and 80),
  description text check (description is null or char_length(description) <= 140),
  price       numeric(10, 2) not null check (price >= 0),
  image_path  text,
  tags        text[] not null default '{}',
  allergens   text[] not null default '{}',
  in_stock    boolean not null default true,
  is_visible  boolean not null default true,
  is_featured boolean not null default false,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index products_category_sort_idx on public.products (category_id, sort_order);
create index products_featured_idx on public.products (is_featured) where is_featured;

create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

-- ── Site settings (single row) ──────────────────────────────────────────
create table public.site_settings (
  id             boolean primary key default true check (id),
  cafe_name      text not null default 'Kafe Adı',
  tagline        text,
  about_text     text,
  location_label text,
  address        text,
  phone          text,
  instagram      text,
  wifi_password  text,
  opening_hours  jsonb not null default '[]'::jsonb,
  logo_path      text,
  map_embed_url  text,
  updated_at     timestamptz not null default now()
);

create trigger site_settings_set_updated_at
  before update on public.site_settings
  for each row execute function public.set_updated_at();

insert into public.site_settings (id) values (true) on conflict do nothing;

-- ── Row Level Security ──────────────────────────────────────────────────
alter table public.categories    enable row level security;
alter table public.products      enable row level security;
alter table public.site_settings enable row level security;

-- Categories: anyone can read, only admins write.
create policy "categories are public"
  on public.categories for select
  to anon, authenticated
  using (true);

create policy "admins insert categories"
  on public.categories for insert
  to authenticated
  with check ((select public.is_admin()));

create policy "admins update categories"
  on public.categories for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "admins delete categories"
  on public.categories for delete
  to authenticated
  using ((select public.is_admin()));

-- Products: the public only sees visible products; admins see everything.
create policy "visible products are public"
  on public.products for select
  to anon, authenticated
  using (is_visible or (select public.is_admin()));

create policy "admins insert products"
  on public.products for insert
  to authenticated
  with check ((select public.is_admin()));

create policy "admins update products"
  on public.products for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "admins delete products"
  on public.products for delete
  to authenticated
  using ((select public.is_admin()));

-- Site settings: public read, admin update. No insert/delete policy: the
-- single row is created above and can never be removed through the API.
create policy "site settings are public"
  on public.site_settings for select
  to anon, authenticated
  using (true);

create policy "admins update site settings"
  on public.site_settings for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- ── Reordering categories atomically ────────────────────────────────────
-- SECURITY INVOKER: runs as the caller, so the RLS update policy above
-- still decides whether the caller may write.
create or replace function public.reorder_categories(ids uuid[])
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'not authorized' using errcode = '42501';
  end if;

  update public.categories c
     set sort_order = o.ord
    from unnest(ids) with ordinality as o(id, ord)
   where c.id = o.id;
end;
$$;

revoke all on function public.reorder_categories(uuid[]) from public;
grant execute on function public.reorder_categories(uuid[]) to authenticated;

-- ── Storage: product-images bucket ──────────────────────────────────────
-- Public read (served via the CDN URL), writes for admins only. Also holds
-- the cafe logo under the `site/` prefix.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Public files are served from the public URL without any policy. SELECT is
-- granted to admins only (needed for remove/overwrite); this keeps anonymous
-- users from listing the bucket.
create policy "admins read product images"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'product-images' and (select public.is_admin()));

create policy "admins upload product images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'product-images' and (select public.is_admin()));

create policy "admins update product images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'product-images' and (select public.is_admin()))
  with check (bucket_id = 'product-images' and (select public.is_admin()));

create policy "admins delete product images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'product-images' and (select public.is_admin()));
