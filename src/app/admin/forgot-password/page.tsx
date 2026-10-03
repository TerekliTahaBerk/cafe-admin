import type { Metadata } from "next";

import { AuthShell } from "@/components/admin/auth-shell";
import { ForgotPasswordForm } from "@/components/admin/forgot-password-form";
import { getSiteSettings } from "@/lib/data";
import { publicImageUrl } from "@/lib/env";

export const metadata: Metadata = { title: "Şifre sıfırlama" };

export default async function ForgotPasswordPage() {
  const settings = await getSiteSettings();
  return (
    <AuthShell cafeName={settings.cafe_name} logoUrl={publicImageUrl(settings.logo_path)}>
      <div>
        <h1 className="text-[34px] font-normal lg:text-[40px]">Şifreni mi unuttun?</h1>
        <p className="mt-1 text-[14px] text-neutral-700">
          E-posta adresini yaz; şifreni yenilemen için bir bağlantı gönderelim.
        </p>
      </div>
      <ForgotPasswordForm />
    </AuthShell>
  );
}
