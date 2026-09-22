import type { MetadataRoute } from "next";
import { products } from "@/lib/catalog";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.PROMO_PREMIUM_SITE_URL;
  if (process.env.PROMO_PREMIUM_INDEXABLE !== "true" || !siteUrl) return [];
  const base = siteUrl.replace(/\/$/, "");
  return [
    { url: base, lastModified: new Date("2026-09-21") },
    ...products.map((product) => ({
      url: `${base}/produtos/${product.slug}`,
      lastModified: new Date(product.sourceDate),
    })),
  ];
}
