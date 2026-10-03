import type { MetadataRoute } from "next";

import { getSiteUrl } from "@/lib/env";

export default function sitemap(): MetadataRoute.Sitemap {
  const site = getSiteUrl();
  return [
    { url: `${site}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${site}/menu`, changeFrequency: "daily", priority: 0.9 },
  ];
}
