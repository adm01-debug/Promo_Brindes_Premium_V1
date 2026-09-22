import type { MetadataRoute } from "next";
import { isIndexableSite, publicSiteOrigin } from "@/lib/publication";

export default function robots(): MetadataRoute.Robots {
  const indexable = isIndexableSite();
  return {
    rules: {
      userAgent: "*",
      allow: indexable ? "/" : [],
      disallow: indexable ? ["/planejamento"] : "/",
    },
    sitemap: indexable ? `${publicSiteOrigin()}/sitemap.xml` : undefined,
  };
}
