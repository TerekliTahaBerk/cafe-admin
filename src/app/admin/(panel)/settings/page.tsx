import type { Metadata } from "next";

import { SettingsView } from "@/components/admin/settings/settings-view";
import { getAdminSettings } from "@/lib/admin-data";
import { requireAdminPage } from "@/lib/auth";
import { publicImageUrl } from "@/lib/env";

export const metadata: Metadata = { title: "Ayarlar" };

export default async function SettingsPage() {
  const { supabase } = await requireAdminPage();
  const settings = await getAdminSettings(supabase);
  return <SettingsView settings={settings} logoUrl={publicImageUrl(settings.logo_path)} />;
}
