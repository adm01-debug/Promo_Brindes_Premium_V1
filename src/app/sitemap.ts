import type { MetadataRoute } from "next";
import { getSiteCatalogPage } from "@/lib/site-database";
import { isIndexableSite, publicSiteOrigin } from "@/lib/publication";
import { catalogCollections } from "@/lib/catalog-library";

export const revalidate = 60;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = publicSiteOrigin();
  if (!origin || !isIndexableSite()) return [];
  try {
    const entries: MetadataRoute.Sitemap = [
      { url: origin },
      { url: `${origin}/catalogos` },
      ...catalogCollections.map((collection) => ({
        url: `${origin}/catalogos/${collection.slug}`,
        lastModified: new Date(collection.editedAt),
      })),
    ];
    const seen = new Set<string>();
    let page = 1;
    let totalPages = 1;
    let publishedTotal = 0;
    do {
      const result = await getSiteCatalogPage({ page, pageSize: 24 });
      if (result.page !== page || (result.total > 0 && !result.items.length))
        return [];
      totalPages = result.totalPages;
      publishedTotal = result.total;
      for (const product of result.items) {
        if (seen.has(product.slug)) return [];
        const lastModified = new Date(product.sourceDate);
        if (Number.isNaN(lastModified.getTime())) return [];
        seen.add(product.slug);
        entries.push({
          url: `${origin}/produtos/${product.slug}`,
          lastModified,
        });
      }
      page++;
    } while (page <= totalPages);
    if (seen.size !== publishedTotal) return [];
    return entries;
  } catch {
    return [];
  }
}
