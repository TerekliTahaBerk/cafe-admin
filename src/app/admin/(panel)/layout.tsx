import { AdminShell } from "@/components/admin/admin-shell";
import { getAdminSettings } from "@/lib/admin-data";
import { requireAdminPage } from "@/lib/auth";
import { publicImageUrl } from "@/lib/env";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const { supabase, user } = await requireAdminPage();
  const [settings, { count }] = await Promise.all([
    getAdminSettings(supabase),
    supabase.from("products").select("id", { count: "exact", head: true }),
  ]);

  return (
    <AdminShell
      cafeName={settings.cafe_name}
      logoUrl={publicImageUrl(settings.logo_path)}
      email={user.email ?? ""}
      productCount={count ?? 0}
    >
      {children}
    </AdminShell>
  );
}
