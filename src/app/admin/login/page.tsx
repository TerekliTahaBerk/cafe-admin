import type { Metadata } from "next";

import { AuthShell } from "@/components/admin/auth-shell";
import { LoginForm } from "@/components/admin/login-form";
import { getSiteSettings } from "@/lib/data";
import { publicImageUrl } from "@/lib/env";

export const metadata: Metadata = { title: "Giriş" };

const NOTICES: Record<string, string> = {
  forbidden: "Bu hesabın yönetim paneline erişimi yok.",
  link: "Bağlantının süresi dolmuş ya da geçersiz. Yeni bir sıfırlama bağlantısı iste.",
};

export default async function LoginPage({ searchParams }: PageProps<"/admin/login">) {
  const params = await searchParams;
  const settings = await getSiteSettings();
  const next = typeof params.next === "string" && params.next.startsWith("/admin") ? params.next : "/admin";
  const notice = typeof params.error === "string" ? NOTICES[params.error] : undefined;

  return (
    <AuthShell cafeName={settings.cafe_name} logoUrl={publicImageUrl(settings.logo_path)}>
      <div>
        <h1 className="text-[34px] font-normal lg:text-[40px]">Tekrar hoş geldin</h1>
        <p className="mt-0.5 text-[14px] text-neutral-700 lg:mt-1">
          {settings.cafe_name} yönetim paneline giriş yap.
        </p>
      </div>
      <LoginForm next={next} notice={notice} />
    </AuthShell>
  );
}
