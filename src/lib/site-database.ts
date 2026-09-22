import { categories, products, type Product } from "@/lib/catalog";

const SITE_PROJECT_REF = "whwloseshzraipljisqo";
const SITE_HOST = `${SITE_PROJECT_REF}.supabase.co`;

type CatalogRow = {
  id: string;
  sku: string;
  slug: string;
  name: string;
  original_name: string;
  category: string;
  tagline: string;
  description: string;
  image_path: string;
  minimum: number;
  personalizable: boolean;
  source_date: string;
};

function siteConfig() {
  const rawUrl = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!rawUrl && !key) return null;
  if (!rawUrl || !key || process.env.SUPABASE_PROJECT_REF !== SITE_PROJECT_REF)
    throw new Error("Site Supabase configuration is incomplete.");
  const url = new URL(rawUrl);
  if (
    url.protocol !== "https:" ||
    url.hostname !== SITE_HOST ||
    url.pathname !== "/"
  )
    throw new Error("Site Supabase host does not match the approved project.");
  return { url: url.origin, key };
}

function isCatalogRow(value: unknown): value is CatalogRow {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const row = value as Record<string, unknown>;
  return (
    [
      "id",
      "sku",
      "slug",
      "name",
      "original_name",
      "tagline",
      "description",
      "image_path",
      "source_date",
    ].every((field) => typeof row[field] === "string" && row[field] !== "") &&
    categories.includes(row.category as (typeof categories)[number]) &&
    row.category !== "Todos" &&
    typeof row.minimum === "number" &&
    Number.isInteger(row.minimum) &&
    row.minimum >= 1 &&
    row.minimum <= 10000 &&
    typeof row.personalizable === "boolean" &&
    (row.image_path as string).startsWith("/images/")
  );
}

/** Uses the dedicated site database when configured; the local snapshot supports offline previews. */
export async function getSiteCatalog(): Promise<Product[]> {
  const config = siteConfig();
  if (!config) return [...products];
  const endpoint = new URL("/rest/v1/premium_catalog_items", config.url);
  endpoint.searchParams.set(
    "select",
    "id,sku,slug,name,original_name,category,tagline,description,image_path,minimum,personalizable,source_date",
  );
  endpoint.searchParams.set("published", "eq.true");
  endpoint.searchParams.set("order", "editorial_order.asc");
  endpoint.searchParams.set("limit", "24");
  const response = await fetch(endpoint, {
    headers: { apikey: config.key, Accept: "application/json" },
    next: { revalidate: 300 },
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error("Site catalog is unavailable.");
  const rows: unknown = await response.json();
  if (!Array.isArray(rows) || rows.length === 0 || !rows.every(isCatalogRow))
    throw new Error("Site catalog did not satisfy the public contract.");
  return rows.map((row) => ({
    id: row.id,
    sku: row.sku,
    slug: row.slug,
    name: row.name,
    originalName: row.original_name,
    category: row.category,
    tagline: row.tagline,
    description: row.description,
    image: row.image_path,
    minimum: row.minimum,
    personalizable: row.personalizable,
    sourceDate: row.source_date,
  }));
}
