import type { Metadata } from "next";

import { QrView } from "@/components/admin/qr/qr-view";
import { getAdminSettings } from "@/lib/admin-data";
import { requireAdminPage } from "@/lib/auth";
import { getSiteUrl } from "@/lib/env";

export const metadata: Metadata = { title: "QR Kod" };

export default async function QrPage() {
  const { supabase } = await requireAdminPage();
  const settings = await getAdminSettings(supabase);
  return <QrView url={`${getSiteUrl()}/menu`} cafeName={settings.cafe_name} />;
}
