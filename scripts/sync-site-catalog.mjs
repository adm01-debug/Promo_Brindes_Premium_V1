import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  approvedProjectUrl,
  verifyCuratedSource,
} from "./lib/catalog-source.mjs";

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
  if (
    payload.length !== 8 ||
    new Set(payload.map((item) => item.id)).size !== 8
  )
    throw new Error(
      "The curated snapshot is not the approved eight-product set.",
    );

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
