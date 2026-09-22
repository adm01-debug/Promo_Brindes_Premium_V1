import {
  categories,
  products,
  queryCatalog,
  resolveCatalogQuery,
  type CatalogPage,
  type CatalogQuery,
  type Product,
} from "@/lib/catalog";
import { allowsCatalogSnapshotFallback } from "@/lib/runtime-environment.mjs";

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
const publishableKeyPattern = /^sb_publishable_[A-Za-z0-9_-]+$/;
const secretKeyPattern = /^sb_secret_[A-Za-z0-9_-]+$/;

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
  if (!rawUrl && !key) {
    if (!allowsCatalogSnapshotFallback())
      throw new Error("Site catalog configuration is required on Vercel.");
    return null;
  }
  if (
    !rawUrl ||
    !key ||
    !publishableKeyPattern.test(key) ||
    process.env.SUPABASE_PROJECT_REF !== SITE_PROJECT_REF
  )
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
    !secretKeyPattern.test(secret) ||
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

async function fetchCatalogRows(endpoint: URL, key: string, fresh: boolean) {
  return fetch(endpoint, {
    method: "GET",
    redirect: "error",
    headers: {
      apikey: key,
      Accept: "application/json",
      Prefer: "count=exact",
    },
    ...(fresh ? { cache: "no-store" as const } : { next: { revalidate: 60 } }),
    signal: AbortSignal.timeout(8000),
  });
}

const DATABASE_PAGE_SIZE = 500;
const MAX_PUBLIC_CATALOG_ITEMS = 10000;

function publicationWindow(reference: Date) {
  const timestamp = reference.toISOString();
  return `(or(published_from.is.null,published_from.lte.${timestamp}),or(published_until.is.null,published_until.gt.${timestamp}))`;
}

async function readPublishedCatalog(
  config: SitePublicConfig,
  ids: readonly string[],
  fresh: boolean,
) {
  const reference = new Date();
  const rows: CatalogRow[] = [];
  let offset = 0;
  let total: number | null = null;
  do {
    const endpoint = new URL("/rest/v1/premium_catalog_items", config.url);
    endpoint.searchParams.set("select", publicColumns);
    endpoint.searchParams.set("published", "eq.true");
    endpoint.searchParams.set("and", publicationWindow(reference));
    if (ids.length) endpoint.searchParams.set("id", `in.(${ids.join(",")})`);
    endpoint.searchParams.set("order", "editorial_order.asc,id.asc");
    endpoint.searchParams.set("limit", String(DATABASE_PAGE_SIZE));
    endpoint.searchParams.set("offset", String(offset));
    const response = await fetchCatalogRows(endpoint, config.key, fresh);
    if (!response.ok) throw new Error("Site catalog is unavailable.");
    const page: unknown = await response.json();
    if (!Array.isArray(page) || !page.every(isCatalogRow))
      throw new Error("Site catalog did not satisfy the public contract.");
    const pageTotal = exactCount(response, page.length, offset);
    if (total !== null && pageTotal !== total)
      throw new Error("Site catalog changed during pagination.");
    total = pageTotal;
    if (total > MAX_PUBLIC_CATALOG_ITEMS)
      throw new Error("Site catalog exceeds the audited public limit.");
    rows.push(...page);
    offset += page.length;
    if (page.length === 0 && offset < total)
      throw new Error(
        "Site catalog pagination stopped before the exact total.",
      );
  } while (offset < (total ?? 0));
  if (
    rows.length !== total ||
    ["id", "sku", "slug"].some(
      (field) =>
        new Set(rows.map((row) => row[field as keyof CatalogRow])).size !==
        rows.length,
    ) ||
    (ids.length > 0 && rows.some((row) => !ids.includes(row.id)))
  )
    throw new Error("Site catalog returned inconsistent products.");
  return rows.map(toProduct);
}

/**
 * Reads the complete curated public projection on the server, then applies one
 * deterministic query for results and contextual facet counts. Next's data
 * cache reuses the bounded database pages for one minute; the browser only
 * receives the requested result page.
 */
export async function getSiteCatalogPage(
  input: CatalogQuery = {},
  options: { fresh?: boolean } = {},
): Promise<CatalogPage> {
  const config = siteConfig();
  if (!config) return queryCatalog(input, products);
  const resolved = resolveCatalogQuery(input);
  const allProducts = await readPublishedCatalog(
    config,
    resolved.ids,
    options.fresh === true,
  );
  return queryCatalog(input, allProducts);
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
  endpoint.searchParams.set("and", publicationWindow(new Date()));
  endpoint.searchParams.set("slug", `eq.${slug}`);
  endpoint.searchParams.set("limit", "1");
  const response = await fetch(endpoint, {
    method: "GET",
    redirect: "error",
    headers: { apikey: config.key, Accept: "application/json" },
    next: { revalidate: 60 },
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
