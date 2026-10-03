import type { Metadata } from "next";

import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: { default: "Yönetim", template: "%s · Yönetim" },
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminRootLayout({ children }: LayoutProps<"/admin">) {
  return (
    <>
      {children}
      <Toaster />
    </>
  );
}
