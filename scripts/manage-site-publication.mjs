import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { approvedProjectUrl } from "./lib/catalog-source.mjs";

const SITE_PROJECT_REF = "whwloseshzraipljisqo";
const uuid =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const timestamp =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,6})?(?:Z|[+-]\d{2}:\d{2})$/;
const columns =
  "id,sku,slug,published,published_from,published_until,updated_at";

function normalizedTimestamp(value, field, nullable = false) {
  if (nullable && value === null) return null;
  if (typeof value !== "string" || !timestamp.test(value))
    throw new Error(`${field} must be an RFC 3339 timestamp with timezone.`);
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime()))
    throw new Error(`${field} is not a valid timestamp.`);
  return parsed.toISOString();
}

function config(env) {
  if (env.SUPABASE_PROJECT_REF !== SITE_PROJECT_REF)
    throw new Error("Publication management requires the premium project ref.");
  const url = approvedProjectUrl(env.SUPABASE_URL, SITE_PROJECT_REF);
  const secret = env.SUPABASE_SECRET_KEY;
  if (typeof secret !== "string" || !/^sb_secret_[A-Za-z0-9_-]+$/.test(secret))
    throw new Error("Publication management requires a premium secret key.");
  return { url, secret };
}

function publicationRow(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const keys = Object.keys(value).sort().join(",");
  if (
    keys !==
      "id,published,published_from,published_until,sku,slug,updated_at" ||
    typeof value.id !== "string" ||
    !uuid.test(value.id) ||
    typeof value.sku !== "string" ||
    value.sku.length < 1 ||
    value.sku.length > 64 ||
    value.sku.trim() !== value.sku ||
    typeof value.slug !== "string" ||
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value.slug) ||
    typeof value.published !== "boolean"
  )
    return null;
  try {
    return {
      id: value.id,
      sku: value.sku,
      slug: value.slug,
      published: value.published,
      published_from: normalizedTimestamp(
        value.published_from,
        "published_from",
        true,
      ),
      published_until: normalizedTimestamp(
        value.published_until,
        "published_until",
        true,
      ),
      updated_at: normalizedTimestamp(value.updated_at, "updated_at"),
    };
  } catch {
    return null;
  }
}

function proposedState(current, changes) {
  const allowed = new Set(["published", "published_from", "published_until"]);
  if (
    !changes ||
    typeof changes !== "object" ||
    Array.isArray(changes) ||
    Object.keys(changes).some((key) => !allowed.has(key))
  )
    throw new Error("Publication changes contain an unsupported field.");
  const proposed = { ...current };
  if (Object.hasOwn(changes, "published")) {
    if (typeof changes.published !== "boolean")
      throw new Error("published must be boolean.");
    proposed.published = changes.published;
  }
  for (const field of ["published_from", "published_until"])
    if (Object.hasOwn(changes, field))
      proposed[field] = normalizedTimestamp(changes[field], field, true);
  if (
    proposed.published_from !== null &&
    proposed.published_until !== null &&
    proposed.published_until <= proposed.published_from
  )
    throw new Error("published_until must be later than published_from.");
  return proposed;
}

async function readCurrent(id, site, fetcher) {
  const endpoint = new URL("/rest/v1/premium_catalog_items", site.url);
  endpoint.search = new URLSearchParams({
    select: columns,
    id: `eq.${id}`,
    limit: "1",
  }).toString();
  const response = await fetcher(endpoint, {
    method: "GET",
    redirect: "error",
    cache: "no-store",
    headers: {
      apikey: site.secret,
      Accept: "application/json",
      Prefer: "count=exact",
    },
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok)
    throw new Error(`Could not inspect publication (HTTP ${response.status}).`);
  const rows = await response.json();
  const row =
    Array.isArray(rows) && rows.length === 1 ? publicationRow(rows[0]) : null;
  if (
    !row ||
    row.id !== id ||
    response.headers.get("content-range") !== "0-0/1"
  )
    throw new Error("Publication record is missing or violates the contract.");
  return row;
}

export async function inspectSitePublication(
  id,
  { env = process.env, fetcher = fetch } = {},
) {
  if (typeof id !== "string" || !uuid.test(id))
    throw new Error("Publication management requires one valid product UUID.");
  return readCurrent(id, config(env), fetcher);
}

export async function manageSitePublication(
  id,
  changes,
  {
    env = process.env,
    fetcher = fetch,
    apply = false,
    expectedUpdatedAt,
    confirmSku,
  } = {},
) {
  if (typeof id !== "string" || !uuid.test(id))
    throw new Error("Publication management requires one valid product UUID.");
  const site = config(env);
  const current = await readCurrent(id, site, fetcher);
  const proposed = proposedState(current, changes);
  const patch = Object.fromEntries(
    ["published", "published_from", "published_until"]
      .filter((field) => proposed[field] !== current[field])
      .map((field) => [field, proposed[field]]),
  );
  if (!Object.keys(patch).length)
    return { applied: false, noOp: true, current, proposed };
  if (!apply) return { applied: false, noOp: false, current, proposed };

  const expected = normalizedTimestamp(expectedUpdatedAt, "expectedUpdatedAt");
  if (expected !== current.updated_at)
    throw new Error("Publication changed since the reviewed revision.");
  if (confirmSku !== current.sku)
    throw new Error("SKU confirmation does not match the publication record.");

  const endpoint = new URL("/rest/v1/premium_catalog_items", site.url);
  endpoint.search = new URLSearchParams({
    id: `eq.${id}`,
    updated_at: `eq.${expected}`,
    select: columns,
  }).toString();
  const response = await fetcher(endpoint, {
    method: "PATCH",
    redirect: "error",
    headers: {
      apikey: site.secret,
      Accept: "application/json",
      "Content-Type": "application/json",
      Prefer: "return=representation,count=exact",
    },
    body: JSON.stringify(patch),
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok)
    throw new Error(`Publication update failed (HTTP ${response.status}).`);
  const rows = await response.json();
  const updated =
    Array.isArray(rows) && rows.length === 1 ? publicationRow(rows[0]) : null;
  if (
    !updated ||
    updated.id !== id ||
    response.headers.get("content-range") !== "0-0/1" ||
    Object.entries(patch).some(([field, value]) => updated[field] !== value)
  )
    throw new Error(
      "Publication update lost its revision race or returned an invalid record.",
    );
  return { applied: true, noOp: false, previous: current, current: updated };
}

function parseArgs(args) {
  const flags = new Map();
  const values = new Set([
    "--id",
    "--published",
    "--from",
    "--until",
    "--expect-updated-at",
    "--confirm-sku",
  ]);
  const booleans = new Set(["--apply", "--inspect"]);
  for (let index = 0; index < args.length; index += 1) {
    const key = args[index];
    if ((!values.has(key) && !booleans.has(key)) || flags.has(key))
      throw new Error(`Unsupported or repeated argument: ${key}`);
    if (booleans.has(key)) flags.set(key, true);
    else {
      const value = args[++index];
      if (!value || value.startsWith("--"))
        throw new Error(`Missing value for ${key}.`);
      flags.set(key, value);
    }
  }
  if (!flags.has("--id")) throw new Error("--id is required.");
  return flags;
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  try {
    const flags = parseArgs(process.argv.slice(2));
    const id = flags.get("--id");
    if (flags.has("--inspect")) {
      if (flags.size !== 2)
        throw new Error("--inspect cannot be combined with mutation options.");
      console.log(JSON.stringify(await inspectSitePublication(id), null, 2));
    } else {
      const changes = {};
      if (flags.has("--published")) {
        const value = flags.get("--published");
        if (!/^(?:true|false)$/.test(value))
          throw new Error("--published accepts true or false.");
        changes.published = value === "true";
      }
      for (const [flag, field] of [
        ["--from", "published_from"],
        ["--until", "published_until"],
      ])
        if (flags.has(flag))
          changes[field] = flags.get(flag) === "null" ? null : flags.get(flag);
      if (!Object.keys(changes).length)
        throw new Error("At least one publication change is required.");
      const result = await manageSitePublication(id, changes, {
        apply: flags.has("--apply"),
        expectedUpdatedAt: flags.get("--expect-updated-at"),
        confirmSku: flags.get("--confirm-sku"),
      });
      console.log(JSON.stringify(result, null, 2));
    }
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
