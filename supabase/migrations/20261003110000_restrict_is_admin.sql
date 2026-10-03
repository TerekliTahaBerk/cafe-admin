-- Anonymous visitors never need is_admin(): give them their own read policy
-- and revoke execute. Signed-in users keep it (RLS policies and the app use
-- it; it only reveals whether the caller themself is an admin).

alter policy "visible products are public"
  on public.products
  to anon
  using (is_visible);

create policy "admins see all products"
  on public.products for select
  to authenticated
  using (is_visible or (select public.is_admin()));

revoke execute on function public.is_admin() from anon;
