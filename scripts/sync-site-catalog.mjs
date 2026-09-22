import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  approvedProjectUrl,
  verifyCuratedSource,
} from "./lib/catalog-source.mjs";

const uuid =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const slug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const imagePath =
  /^\/images\/[a-zA-Z0-9][a-zA-Z0-9._-]*\.(?:webp|avif|png|jpe?g)$/;
const categories = new Set([
  "Kits & experiências",
  "Escrita",
  "Lifestyle",
  "Viagem",
]);

export const CATALOG_FIELD_LIMITS = Object.freeze({
  sku: 64,
  slug: 120,
  name: 120,
  originalName: 240,
  tagline: 160,
  description: 2000,
  image: 255,
});

function validText(value, limit) {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value.length <= limit &&
    value.trim() === value
  );
}

function validDate(value) {
  return (
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(Date.parse(value)) &&
    new Date(value).toISOString().slice(0, 10) === value
  );
}

/** Reject malformed or ambiguous editorial data before either database is contacted. */
export function validateCatalogSnapshot(snapshot) {
  if (!Array.isArray(snapshot) || snapshot.length !== 8)
    throw new Error(
      "The curated snapshot is not the approved eight-product set.",
    );
  for (const item of snapshot) {
    if (
      !item ||
      typeof item !== "object" ||
      !uuid.test(item.id) ||
      !validText(item.sku, CATALOG_FIELD_LIMITS.sku) ||
      !validText(item.slug, CATALOG_FIELD_LIMITS.slug) ||
      !slug.test(item.slug) ||
      !validText(item.name, CATALOG_FIELD_LIMITS.name) ||
      !validText(item.originalName, CATALOG_FIELD_LIMITS.originalName) ||
      !categories.has(item.category) ||
      !validText(item.tagline, CATALOG_FIELD_LIMITS.tagline) ||
      !validText(item.description, CATALOG_FIELD_LIMITS.description) ||
      !validText(item.image, CATALOG_FIELD_LIMITS.image) ||
      !imagePath.test(item.image) ||
      item.image.includes("..") ||
      !Number.isInteger(item.minimum) ||
      item.minimum < 1 ||
      item.minimum > 10000 ||
      typeof item.personalizable !== "boolean" ||
      !validDate(item.sourceDate)
    )
      throw new Error("The curated snapshot violates the catalog contract.");
  }
  const unique = (field, normalize = (value) => value) =>
    new Set(snapshot.map((item) => normalize(item[field]))).size ===
    snapshot.length;
  if (
    !unique("id", (value) => value.toLowerCase()) ||
    !unique("sku", (value) => value.toLocaleLowerCase("en-US")) ||
    !unique("slug")
  )
    throw new Error(
      "The curated snapshot contains duplicate IDs, SKUs or slugs.",
    );
}

export async function syncSiteCatalog(
  snapshot,
  { env = process.env, fetcher = fetch, dryRun = false } = {},
) {
  const ref = "whwloseshzraipljisqo";
  const siteUrl = approvedProjectUrl(env.SUPABASE_URL, ref);
  const secret = env.SUPABASE_SECRET_KEY;
  if (
    env.SUPABASE_PROJECT_REF !== ref ||
    siteUrl.protocol !== "https:" ||
    siteUrl.hostname !== `${ref}.supabase.co` ||
    !secret
  ) {
    throw new Error(
      "Approved site API configuration is missing or mismatched.",
    );
  }

  validateCatalogSnapshot(snapshot);
  const payload = snapshot.map((item, index) => ({
    id: item.id,
    sku: item.sku,
    slug: item.slug,
    name: item.name,
    original_name: item.originalName,
    category: item.category,
    tagline: item.tagline,
    description: item.description,
    image_path: item.image,
    minimum: item.minimum,
    personalizable: item.personalizable,
    source_date: item.sourceDate,
    editorial_order: index + 1,
    published: true,
  }));
  // No target write is reachable before a complete, current source check.
  await verifyCuratedSource(snapshot, { env, fetcher });

  const existingUrl = new URL("/rest/v1/premium_catalog_items", siteUrl);
  existingUrl.searchParams.set("select", "id,published");
  existingUrl.searchParams.set(
    "id",
    `in.(${payload.map((item) => item.id).join(",")})`,
  );
  const existingResponse = await fetcher(existingUrl, {
    method: "GET",
    redirect: "error",
    headers: {
      apikey: secret,
      Accept: "application/json",
      Prefer: "count=exact",
    },
    signal: AbortSignal.timeout(15000),
  });
  if (!existingResponse.ok)
    throw new Error("Could not inspect current publication state.");
  const existing = await existingResponse.json();
  if (
    !Array.isArray(existing) ||
    existing.length > payload.length ||
    new Set(existing.map((item) => item?.id)).size !== existing.length ||
    existing.some(
      (item) =>
        !item ||
        !snapshot.some((product) => product.id === item.id) ||
        typeof item.published !== "boolean",
    ) ||
    existingResponse.headers.get("content-range") !==
      (existing.length ? `0-${existing.length - 1}/${existing.length}` : "*/0")
  )
    throw new Error("Could not verify the complete current publication state.");
  if (existing.some((item) => item.published === false))
    throw new Error(
      "A product was manually unpublished; sync stopped to preserve that decision.",
    );

  if (dryRun) return { count: payload.length, project: ref, dryRun: true };

  const endpoint = new URL(
    "/rest/v1/premium_catalog_items?on_conflict=id&select=id",
    siteUrl,
  );
  const response = await fetcher(endpoint, {
    method: "POST",
    redirect: "error",
    headers: {
      apikey: secret,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=representation",
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok)
    throw new Error(`Catalog sync failed (HTTP ${response.status}).`);
  const rows = await response.json();
  if (
    !Array.isArray(rows) ||
    rows.length !== payload.length ||
    new Set(rows.map((row) => row?.id)).size !== payload.length ||
    rows.some((row) => !row || !snapshot.some((item) => item.id === row.id))
  )
    throw new Error("Catalog sync returned an unexpected set of products.");
  return { count: rows.length, project: ref, dryRun: false };
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  try {
    const args = process.argv.slice(2);
    if (args.some((arg) => arg !== "--dry-run"))
      throw new Error("Only --dry-run is supported.");
    const snapshot = JSON.parse(
      await readFile("src/lib/products.json", "utf8"),
    );
    const result = await syncSiteCatalog(snapshot, {
      dryRun: args.includes("--dry-run"),
    });
    console.log(
      result.dryRun
        ? `Dry run: ${result.count} source products verified; target ${result.project}. No writes.`
        : `Synchronized ${result.count} verified catalog items in ${result.project}. Source was read only.`,
    );
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
