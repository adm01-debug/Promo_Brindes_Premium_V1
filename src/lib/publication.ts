import { isIP } from "node:net";
import { hasSiteCatalogConfig } from "@/lib/site-database";

export function publicSiteOrigin(): string | null {
  const raw = process.env.PROMO_PREMIUM_SITE_URL;
  if (!raw) return null;
  try {
    const url = new URL(raw);
    if (
      url.protocol !== "https:" ||
      !url.hostname.includes(".") ||
      isIP(url.hostname) !== 0 ||
      url.hostname === "example.com" ||
      url.hostname.endsWith(".example.com") ||
      [".localhost", ".local", ".test", ".invalid", ".vercel.app"].some(
        (suffix) => url.hostname.endsWith(suffix),
      ) ||
      url.hostname.endsWith(".supabase.co") ||
      url.username ||
      url.password ||
      url.port ||
      url.pathname !== "/" ||
      url.search ||
      url.hash
    )
      return null;
    return url.origin;
  } catch {
    return null;
  }
}

export function isIndexableSite(): boolean {
  if (process.env.PROMO_PREMIUM_INDEXABLE !== "true" || !publicSiteOrigin())
    return false;
  try {
    return hasSiteCatalogConfig();
  } catch {
    return false;
  }
}
