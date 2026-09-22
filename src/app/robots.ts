import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const indexable = process.env.PROMO_PREMIUM_INDEXABLE === "true";
  return {
    rules: {
      userAgent: "*",
      allow: indexable ? "/" : [],
      disallow: indexable ? ["/planejamento"] : "/",
    },
    sitemap: indexable ? "/sitemap.xml" : undefined,
  };
}
