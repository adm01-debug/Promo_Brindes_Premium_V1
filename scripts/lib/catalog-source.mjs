/** The operational catalog is READ ONLY. Never add writes or RPCs here. */
export const SOURCE_PROJECT_REF = "doufsxqlfjyuvxuezpln";
export const SOURCE_COLUMNS =
  "id,sku,name,min_quantity,allows_personalization,is_active";

const uuid =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function approvedProjectUrl(raw, project) {
  let url;
  try {
    url = new URL(raw);
  } catch {
    throw new Error("Missing or invalid catalog project URL.");
  }
  if (
    url.origin !== `https://${project}.supabase.co` ||
    url.username ||
    url.password ||
    url.port ||
    url.pathname !== "/" ||
    url.search ||
    url.hash
  )
    throw new Error("Catalog URL does not match the approved project.");
  return url;
}

/** Accepts IDs only: callers cannot supply a path, method, body or headers. */
export async function readSourceProducts(
  ids,
  { env = process.env, fetcher = fetch } = {},
) {
  const url = approvedProjectUrl(
    env.CATALOG_SOURCE_SUPABASE_URL,
    SOURCE_PROJECT_REF,
  );
  const key = env.CATALOG_SOURCE_SUPABASE_PUBLISHABLE_KEY;
  if (typeof key !== "string" || !/^sb_publishable_[A-Za-z0-9_-]+$/.test(key))
    throw new Error(
      "The catalog source requires a publishable key, never a secret key.",
    );
  if (
    !Array.isArray(ids) ||
    ids.length < 1 ||
    ids.length > 100 ||
    ids.some((id) => typeof id !== "string" || !uuid.test(id)) ||
    new Set(ids).size !== ids.length
  )
    throw new Error(
      "Expected 1–100 unique product IDs for source verification.",
    );

  const endpoint = new URL("/rest/v1/v_products_public", url);
  endpoint.search = new URLSearchParams({
    select: SOURCE_COLUMNS,
    id: `in.(${ids.join(",")})`,
    order: "id.asc",
    limit: String(ids.length),
  }).toString();
  const response = await fetcher(endpoint, {
    method: "GET",
    redirect: "error",
    cache: "no-store",
    headers: { apikey: key, Accept: "application/json", Prefer: "count=exact" },
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok)
    throw new Error(
      `Operational catalog read failed (HTTP ${response.status}).`,
    );
  const rows = await response.json();
  const range = response.headers.get("content-range");
  if (
    !Array.isArray(rows) ||
    rows.length !== ids.length ||
    range !== `0-${ids.length - 1}/${ids.length}` ||
    new Set(rows.map((row) => row?.id)).size !== ids.length ||
    rows.some(
      (row) =>
        !row ||
        !ids.includes(row.id) ||
        typeof row.sku !== "string" ||
        !row.sku.trim() ||
        row.sku.length > 64 ||
        typeof row.name !== "string" ||
        !row.name.trim() ||
        !Number.isInteger(row.min_quantity) ||
        row.min_quantity < 1 ||
        row.min_quantity > 10000 ||
        typeof row.allows_personalization !== "boolean" ||
        typeof row.is_active !== "boolean",
    )
  )
    throw new Error(
      "Operational catalog is incomplete or violates the source contract; sync stopped.",
    );

  // Reconstruct even this server-side DTO: unexpected upstream fields stay out.
  return rows.map((row) => ({
    id: row.id,
    sku: row.sku,
    name: row.name,
    min_quantity: row.min_quantity,
    allows_personalization: row.allows_personalization,
    is_active: row.is_active,
  }));
}

/** Count the public active catalog without downloading or mutating its rows. */
export async function countActiveSourceProducts({
  env = process.env,
  fetcher = fetch,
} = {}) {
  const url = approvedProjectUrl(
    env.CATALOG_SOURCE_SUPABASE_URL,
    SOURCE_PROJECT_REF,
  );
  const key = env.CATALOG_SOURCE_SUPABASE_PUBLISHABLE_KEY;
  if (typeof key !== "string" || !/^sb_publishable_[A-Za-z0-9_-]+$/.test(key))
    throw new Error(
      "The catalog source requires a publishable key, never a secret key.",
    );

  const endpoint = new URL("/rest/v1/v_products_public", url);
  endpoint.search = new URLSearchParams({
    select: "id",
    is_active: "eq.true",
    limit: "1",
  }).toString();
  const response = await fetcher(endpoint, {
    method: "GET",
    redirect: "error",
    cache: "no-store",
    headers: { apikey: key, Accept: "application/json", Prefer: "count=exact" },
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok)
    throw new Error(
      `Operational catalog count failed (HTTP ${response.status}).`,
    );

  const rows = await response.json();
  const range = response.headers.get("content-range");
  const populated = /^0-0\/([1-9]\d*)$/.exec(range ?? "");
  const count = range === "*/0" ? 0 : populated ? Number(populated[1]) : NaN;
  if (
    !Array.isArray(rows) ||
    !Number.isSafeInteger(count) ||
    count < 0 ||
    (count === 0 ? rows.length !== 0 : rows.length !== 1)
  )
    throw new Error(
      "Operational catalog count is missing or violates the source contract.",
    );
  return count;
}

/** Source drift needs editorial review before copying it to the public site. */
export async function verifyCuratedSource(snapshot, options) {
  const rows = await readSourceProducts(
    snapshot.map((item) => item.id),
    options,
  );
  const byId = new Map(rows.map((row) => [row.id, row]));
  const fields = {
    sku: "sku",
    originalName: "name",
    minimum: "min_quantity",
    personalizable: "allows_personalization",
  };
  for (const item of snapshot) {
    const source = byId.get(item.id);
    if (!source.is_active)
      throw new Error(
        `Source product ${item.id} is inactive; review publication before syncing.`,
      );
    const changed = Object.entries(fields)
      .filter(([local, remote]) => item[local] !== source[remote])
      .map(([local]) => local);
    if (changed.length)
      throw new Error(
        `Source product ${item.id} changed (${changed.join(", ")}); review the snapshot before syncing.`,
      );
  }
  return rows;
}
