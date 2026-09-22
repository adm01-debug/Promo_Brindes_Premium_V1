import { readFileSync } from "node:fs";

const approvedHost = "whwloseshzraipljisqo.supabase.co";
const url = new URL(process.env.SUPABASE_URL || "https://invalid.local");
const key = process.env.SUPABASE_PUBLISHABLE_KEY;
if (
  url.protocol !== "https:" ||
  url.hostname !== approvedHost ||
  url.pathname !== "/" ||
  url.port ||
  url.username ||
  url.password ||
  url.search ||
  url.hash ||
  process.env.SUPABASE_PROJECT_REF !== "whwloseshzraipljisqo" ||
  !key
)
  throw new Error("Configuração pública do banco premium canônico inválida.");

const fields = {
  id: "id",
  sku: "sku",
  slug: "slug",
  name: "name",
  originalName: "original_name",
  category: "category",
  tagline: "tagline",
  description: "description",
  image: "image_path",
  minimum: "minimum",
  personalizable: "personalizable",
  sourceDate: "source_date",
};
const expected = JSON.parse(readFileSync("src/lib/products.json", "utf8"));
const endpoint = new URL("/rest/v1/premium_catalog_items", url);
endpoint.search = new URLSearchParams({
  select: Object.values(fields).join(","),
  published: "eq.true",
  limit: "100",
}).toString();
const response = await fetch(endpoint, {
  method: "GET",
  redirect: "error",
  cache: "no-store",
  headers: { apikey: key, Accept: "application/json", Prefer: "count=exact" },
  signal: AbortSignal.timeout(8000),
});
if (!response.ok)
  throw new Error(`Leitura pública do catálogo falhou: ${response.status}`);
const rows = await response.json();
const range = response.headers.get("content-range");
const match = /^(\d+)-(\d+)\/(\d+)$/.exec(range ?? "");
if (
  !Array.isArray(rows) ||
  !match ||
  Number(match[1]) !== 0 ||
  Number(match[2]) + 1 !== rows.length ||
  Number(match[3]) !== rows.length ||
  rows.length > 100
)
  throw new Error("Catálogo retornou contagem incompleta ou inválida.");

const byId = new Map(rows.map((row) => [row.id, row]));
const differences = [];
for (const product of expected) {
  const current = byId.get(product.id);
  if (!current) {
    differences.push(`${product.sku}:ausente`);
    continue;
  }
  const changed = Object.entries(fields)
    .filter(([source, remote]) => product[source] !== current[remote])
    .map(([source]) => source);
  if (changed.length) differences.push(`${product.sku}:${changed.join(",")}`);
}
if (byId.size !== expected.length || differences.length)
  throw new Error(
    `Drift na publicação premium: ${differences.join("; ") || "contagem diferente"}`,
  );
console.log(
  `Catálogo canônico conferido: ${rows.length} produtos publicados; 12 campos por peça iguais ao snapshot.`,
);
