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
  material: 60,
  dimensions: 80,
  packaging: 120,
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
      !validDate(item.sourceDate) ||
      !Array.isArray(item.materials) ||
      item.materials.length > 5 ||
      item.materials.some(
        (material) => !validText(material, CATALOG_FIELD_LIMITS.material),
      ) ||
      (item.dimensions !== null &&
        !validText(item.dimensions, CATALOG_FIELD_LIMITS.dimensions)) ||
      (item.weightG !== null &&
        (!Number.isInteger(item.weightG) ||
          item.weightG < 1 ||
          item.weightG > 100000)) ||
      (item.packaging !== null &&
        !validText(item.packaging, CATALOG_FIELD_LIMITS.packaging))
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
    materials: item.materials,
    dimensions: item.dimensions,
    weight_g: item.weightG,
    packaging: item.packaging,
    editorial_order: index + 1,
    published: true,
  }));
  // No target write is reachable before a complete, current source check.
  await verifyCuratedSource(snapshot, { env, fetcher });

  const payloadIds = new Set(payload.map((item) => item.id));
  // editorial_order is unique for the whole table, so the entire storefront has
  // to be read: a product that left the curation keeps holding its position and
  // would silently block the product that replaced it.
  const existingUrl = new URL("/rest/v1/premium_catalog_items", siteUrl);
  existingUrl.searchParams.set("select", "id,published,editorial_order");
  existingUrl.searchParams.set("order", "editorial_order.asc");
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
    new Set(existing.map((item) => item?.id)).size !== existing.length ||
    existing.some(
      (item) =>
        !item ||
        typeof item.id !== "string" ||
        !Number.isInteger(item.editorial_order) ||
        typeof item.published !== "boolean",
    ) ||
    existingResponse.headers.get("content-range") !==
      (existing.length ? `0-${existing.length - 1}/${existing.length}` : "*/0")
  )
    throw new Error("Could not verify the complete current publication state.");
  if (existing.some((item) => payloadIds.has(item.id) && item.published === false))
    throw new Error(
      "A product was manually unpublished; sync stopped to preserve that decision.",
    );

  if (dryRun) return { count: payload.length, project: ref, dryRun: true };

  const curated = existing.filter((item) => payloadIds.has(item.id));
  const position = new Map(payload.map((item, index) => [item.id, index]));
  const reserved = new Set(
    existing
      .filter((item) => !payloadIds.has(item.id))
      .map((item) => item.editorial_order),
  );
  // Positions still held by products outside the curation are skipped instead of
  // overwritten, so the sync converges without ever dropping a stored product.
  const targets = [];
  for (let candidate = 1; targets.length < payload.length; candidate += 1)
    if (!reserved.has(candidate)) targets.push(candidate);
  payload.forEach((item, index) => {
    item.editorial_order = targets[index];
  });

  const targetItems = new URL("/rest/v1/premium_catalog_items", siteUrl);
  const requireReturned = (rows, ids) => {
    if (
      !Array.isArray(rows) ||
      rows.length !== ids.length ||
      new Set(rows.map((row) => row?.id)).size !== ids.length ||
      rows.some((row) => !row || !ids.includes(row.id))
    )
      throw new Error("Catalog sync returned an unexpected set of products.");
    return rows;
  };
  const send = async (method, params, body, prefer) => {
    const endpoint = new URL(targetItems);
    for (const [key, value] of Object.entries(params))
      endpoint.searchParams.set(key, value);
    const response = await fetcher(endpoint, {
      method,
      redirect: "error",
      headers: {
        apikey: secret,
        "Content-Type": "application/json",
        Prefer: prefer,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok)
      throw new Error(`Catalog sync failed (HTTP ${response.status}).`);
    return response.json();
  };
  // PostgREST only accepts one set of keys per batch (PGRST102) and checks NOT
  // NULL before resolving a conflict, so complete rows of newly curated
  // products go in one insert while products that already exist are updated
  // one by one, each with its own position.
  const insertRows = async (rows) =>
    requireReturned(
      await send(
        "POST",
        { on_conflict: "id", select: "id" },
        rows,
        "resolution=merge-duplicates,return=representation",
      ),
      rows.map((row) => row.id),
    );
  const updateRow = async (id, fields) =>
    requireReturned(
      await send(
        "PATCH",
        { id: `eq.${id}`, select: "id" },
        fields,
        "return=representation",
      ),
      [id],
    );

  const targetOrder = new Map(
    payload.map((item) => [item.id, item.editorial_order]),
  );
  const existingIds = new Set(curated.map((item) => item.id));
  // editorial_order is unique and checked row by row, so the current values must
  // leave the target range before the new ones are written. Parking above every
  // stored value keeps the sequence readable if this run is cut short, and the
  // next run always converges because it re-reads the real state.
  if (
    curated.some(
      (item) => item.editorial_order !== targetOrder.get(item.id),
    )
  ) {
    const base =
      Math.max(
        payload.length,
        ...existing.map((item) => item.editorial_order),
        ...targets,
      ) + 1;
    for (const item of curated)
      await updateRow(item.id, {
        editorial_order: base + position.get(item.id),
      });
  }
  // published is never sent for a product that already exists, so a manual
  // unpublication that raced the read above survives the update.
  for (const item of payload) {
    if (!existingIds.has(item.id)) continue;
    const fields = { ...item };
    delete fields.id;
    delete fields.published;
    await updateRow(item.id, fields);
  }
  const fresh = payload.filter((item) => !existingIds.has(item.id));
  if (fresh.length) await insertRows(fresh);
  return { count: payload.length, project: ref, dryRun: false };
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
