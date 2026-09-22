import {
  categories,
  CATALOG_CONTRACT_VERSION,
  products,
  queryCatalog,
  resolveCatalogQuery,
  type CatalogPage,
  type CatalogQuery,
  type Product,
} from "@/lib/catalog";

const SITE_PROJECT_REF = "whwloseshzraipljisqo";
const SITE_HOST = `${SITE_PROJECT_REF}.supabase.co`;
const publicColumns =
  "id,sku,slug,name,original_name,category,tagline,description,image_path,minimum,personalizable,source_date";

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

export type SiteServerConfig = { url: string; secret: string };
type SitePublicConfig = { url: string; key: string };

function approvedUrl(rawUrl: string) {
  const url = new URL(rawUrl);
  if (
    url.protocol !== "https:" ||
    url.hostname !== SITE_HOST ||
    url.pathname !== "/" ||
    url.port ||
    url.username ||
    url.password ||
    url.search ||
    url.hash
  )
    throw new Error("Site Supabase host does not match the approved project.");
  return url.origin;
}

function siteConfig(): SitePublicConfig | null {
  const rawUrl = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!rawUrl && !key) return null;
  if (!rawUrl || !key || process.env.SUPABASE_PROJECT_REF !== SITE_PROJECT_REF)
    throw new Error("Site Supabase configuration is incomplete.");
  return { url: approvedUrl(rawUrl), key };
}

/** Server-only credentials for persistence. Never import this in a client component. */
export function siteServerConfig(): SiteServerConfig | null {
  const rawUrl = process.env.SUPABASE_URL;
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!rawUrl && !secret) return null;
  if (
    !rawUrl ||
    !secret ||
    process.env.SUPABASE_PROJECT_REF !== SITE_PROJECT_REF
  )
    throw new Error("Site server database configuration is incomplete.");
  return { url: approvedUrl(rawUrl), secret };
}

export function hasSiteCatalogConfig() {
  return Boolean(siteConfig());
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
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      row.id as string,
    ) &&
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(row.slug as string) &&
    typeof row.sku === "string" &&
    row.sku.trim() === row.sku &&
    row.sku.length <= 64 &&
    /^\d{4}-\d{2}-\d{2}$/.test(row.source_date as string) &&
    !Number.isNaN(Date.parse(row.source_date as string)) &&
    new Date(row.source_date as string).toISOString().slice(0, 10) ===
      row.source_date &&
    typeof row.minimum === "number" &&
    Number.isInteger(row.minimum) &&
    row.minimum >= 1 &&
    row.minimum <= 10000 &&
    typeof row.personalizable === "boolean" &&
    /^\/images\/[a-zA-Z0-9][a-zA-Z0-9._-]*\.(?:webp|avif|png|jpe?g)$/.test(
      row.image_path as string,
    ) &&
    !(row.image_path as string).includes("..")
  );
}

function toProduct(row: CatalogRow): Product {
  return {
    id: row.id,
    sku: row.sku,
    slug: row.slug,
    name: row.name,
    originalName: row.original_name,
    category: row.category as Product["category"],
    tagline: row.tagline,
    description: row.description,
    image: row.image_path,
    minimum: row.minimum,
    personalizable: row.personalizable,
    sourceDate: row.source_date,
  };
}

function exactCount(response: Response, rowCount: number, offset: number) {
  const range = response.headers.get("content-range");
  if (range === "*/0" && rowCount === 0 && offset === 0) return 0;
  const match = /^(\d+)-(\d+)\/(\d+)$/.exec(range ?? "");
  if (!match) throw new Error("Site catalog did not return an exact range.");
  const [first, last, count] = match.slice(1).map(Number);
  if (
    ![first, last, count].every(Number.isSafeInteger) ||
    first !== offset ||
    last < first ||
    last - first + 1 !== rowCount ||
    count <= last
  )
    throw new Error("Site catalog returned an inconsistent range.");
  return count;
}

async function fetchCatalogPage(endpoint: URL, key: string, fresh: boolean) {
  return fetch(endpoint, {
    headers: {
      apikey: key,
      Accept: "application/json",
      Prefer: "count=exact",
    },
    ...(fresh ? { cache: "no-store" as const } : { next: { revalidate: 300 } }),
    signal: AbortSignal.timeout(8000),
  });
}

function safeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9\s-]/g, " ")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, 100);
}

function applyQuery(endpoint: URL, input: CatalogQuery) {
  const resolved = resolveCatalogQuery(input);
  endpoint.searchParams.set("select", publicColumns);
  endpoint.searchParams.set("published", "eq.true");
  if (resolved.category !== "Todos")
    endpoint.searchParams.set("category", `eq.${resolved.category}`);
  if (resolved.ids.length)
    endpoint.searchParams.set("id", `in.(${resolved.ids.join(",")})`);
  const search = safeSearch(resolved.query);
  if (search) endpoint.searchParams.set("search_text", `ilike.*${search}*`);
  endpoint.searchParams.set(
    "order",
    resolved.sort === "nome" ? "name.asc,id.asc" : "editorial_order.asc,id.asc",
  );
  endpoint.searchParams.set("limit", String(resolved.pageSize));
  endpoint.searchParams.set(
    "offset",
    String((resolved.page - 1) * resolved.pageSize),
  );
  return resolved;
}

/**
 * Reads one public page at the source. Filtering, count and pagination never
 * rely on a truncated browser snapshot.
 */
export async function getSiteCatalogPage(
  input: CatalogQuery = {},
  options: { fresh?: boolean } = {},
): Promise<CatalogPage> {
  const config = siteConfig();
  if (!config) return queryCatalog(input, products);
  const endpoint = new URL("/rest/v1/premium_catalog_items", config.url);
  const resolved = applyQuery(endpoint, input);
  let response = await fetchCatalogPage(
    endpoint,
    config.key,
    options.fresh === true,
  );
  let resolvedPage = resolved.page;
  if (response.status === 416 && resolved.page > 1) {
    const range = response.headers.get("content-range");
    const match = /^\*\/(\d+)$/.exec(range ?? "");
    const total = match ? Number(match[1]) : NaN;
    if (!Number.isSafeInteger(total))
      throw new Error("Site catalog did not return an exact total.");
    resolvedPage = Math.max(1, Math.ceil(total / resolved.pageSize));
    endpoint.searchParams.set(
      "offset",
      String((resolvedPage - 1) * resolved.pageSize),
    );
    response = await fetchCatalogPage(
      endpoint,
      config.key,
      options.fresh === true,
    );
  }
  if (!response.ok) throw new Error("Site catalog is unavailable.");
  const rows: unknown = await response.json();
  if (!Array.isArray(rows) || !rows.every(isCatalogRow))
    throw new Error("Site catalog did not satisfy the public contract.");
  if (
    rows.length > resolved.pageSize ||
    ["id", "sku", "slug"].some(
      (field) =>
        new Set(rows.map((row) => row[field as keyof CatalogRow])).size !==
        rows.length,
    ) ||
    (resolved.ids.length > 0 &&
      rows.some((row) => !resolved.ids.includes(row.id))) ||
    (resolved.category !== "Todos" &&
      rows.some((row) => row.category !== resolved.category))
  )
    throw new Error("Site catalog returned inconsistent products.");
  const total = exactCount(
    response,
    rows.length,
    (resolvedPage - 1) * resolved.pageSize,
  );
  const totalPages = Math.max(1, Math.ceil(total / resolved.pageSize));
  return {
    contractVersion: CATALOG_CONTRACT_VERSION,
    items: rows.map(toProduct),
    page: Math.min(resolvedPage, totalPages),
    pageSize: resolved.pageSize,
    total,
    totalPages,
    query: resolved.query,
    category: resolved.category,
    sort: resolved.sort,
  };
}

export async function getSiteProductBySlug(
  slug: string,
): Promise<Product | null> {
  const config = siteConfig();
  if (!config) return products.find((product) => product.slug === slug) ?? null;
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return null;
  const endpoint = new URL("/rest/v1/premium_catalog_items", config.url);
  endpoint.searchParams.set("select", publicColumns);
  endpoint.searchParams.set("published", "eq.true");
  endpoint.searchParams.set("slug", `eq.${slug}`);
  endpoint.searchParams.set("limit", "1");
  const response = await fetch(endpoint, {
    headers: { apikey: config.key, Accept: "application/json" },
    next: { revalidate: 300 },
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error("Site product is unavailable.");
  const rows: unknown = await response.json();
  if (
    !Array.isArray(rows) ||
    rows.length > 1 ||
    !rows.every(isCatalogRow) ||
    rows.some((row) => row.slug !== slug)
  )
    throw new Error("Site product did not satisfy the public contract.");
  return rows[0] ? toProduct(rows[0]) : null;
}
