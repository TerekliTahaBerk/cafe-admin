import type { Metadata } from "next";

import { CategoriesView } from "@/components/admin/categories/categories-view";
import { getAdminCategories } from "@/lib/admin-data";
import { requireAdminPage } from "@/lib/auth";

export const metadata: Metadata = { title: "Kategoriler" };

export default async function CategoriesPage() {
  const { supabase } = await requireAdminPage();
  const categories = await getAdminCategories(supabase);
  return <CategoriesView initial={categories} />;
}
