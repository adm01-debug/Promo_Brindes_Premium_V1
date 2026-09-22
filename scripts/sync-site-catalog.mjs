import { readFile } from "node:fs/promises";

const ref = "whwloseshzraipljisqo";
const siteUrl = new URL(process.env.SUPABASE_URL || "http://invalid.local");
const secret = process.env.SUPABASE_SECRET_KEY;
if (
  process.env.SUPABASE_PROJECT_REF !== ref ||
  siteUrl.protocol !== "https:" ||
  siteUrl.hostname !== `${ref}.supabase.co` ||
  !secret
) {
  throw new Error("Approved site API configuration is missing or mismatched.");
}

const snapshot = JSON.parse(await readFile("src/lib/products.json", "utf8"));
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
if (payload.length !== 8 || new Set(payload.map((item) => item.id)).size !== 8)
  throw new Error(
    "The curated snapshot is not the approved eight-product set.",
  );

const existingUrl = new URL("/rest/v1/premium_catalog_items", siteUrl);
existingUrl.searchParams.set("select", "id,published");
existingUrl.searchParams.set(
  "id",
  `in.(${payload.map((item) => item.id).join(",")})`,
);
const existingResponse = await fetch(existingUrl, {
  headers: { apikey: secret, Accept: "application/json" },
  signal: AbortSignal.timeout(15000),
});
if (!existingResponse.ok)
  throw new Error("Could not inspect current publication state.");
const existing = await existingResponse.json();
if (existing.some((item) => item.published === false))
  throw new Error(
    "A product was manually unpublished; sync stopped to preserve that decision.",
  );

const endpoint = new URL(
  "/rest/v1/premium_catalog_items?on_conflict=id",
  siteUrl,
);
const response = await fetch(endpoint, {
  method: "POST",
  headers: {
    apikey: secret,
    "Content-Type": "application/json",
    Prefer: "resolution=merge-duplicates,return=representation",
  },
  body: JSON.stringify(payload),
  signal: AbortSignal.timeout(15000),
});
if (!response.ok) {
  console.error(
    "Catalog sync failed:",
    response.status,
    (await response.text()).slice(0, 300),
  );
  process.exit(1);
}
const rows = await response.json();
if (!Array.isArray(rows) || rows.length !== payload.length)
  throw new Error("Catalog sync returned an unexpected number of rows.");
console.log(`Synchronized ${rows.length} approved catalog items in ${ref}.`);
