import catalog from "./products.json";

/**
 * Public, editorial projection of the catalog snapshot. Keep operational
 * fields (cost, supplier, stock and discount rules) outside this module.
 */
export const CATALOG_CONTRACT_VERSION = "2026-09-21";
export const products = Object.freeze([...catalog]);
export type Product = (typeof catalog)[number];
export type Selection = Record<string, number>;
export const SELECTION_STORAGE_TTL_MS = 14 * 24 * 60 * 60 * 1000;
export const categories = [
  "Todos",
  "Kits & experiências",
  "Escrita",
  "Lifestyle",
  "Viagem",
] as const;

export type PublicCategory = (typeof categories)[number];
export type CatalogSort = "curadoria" | "nome";

export type CatalogQuery = {
  query?: string;
  category?: string;
  page?: number;
  pageSize?: number;
  sort?: string;
};

export type CatalogPage = {
  contractVersion: typeof CATALOG_CONTRACT_VERSION;
  items: Product[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  query: string;
  category: string;
  sort: CatalogSort;
};

export function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR");
}

export function getProductBySlug(slug: string) {
  return products.find((product) => product.slug === slug);
}

export function getProductById(id: string) {
  return products.find((product) => product.id === id);
}

function asPositiveInteger(value: number | undefined, fallback: number) {
  return Number.isInteger(value) && value && value > 0 ? value : fallback;
}

/**
 * Deterministic query used by the local snapshot and the public API. It is
 * deliberately limited to fields whose meaning is known in this preview.
 */
export function queryCatalog(
  input: CatalogQuery = {},
  catalogItems: readonly Product[] = products,
): CatalogPage {
  const query = String(input.query ?? "")
    .trim()
    .slice(0, 100);
  const category = categories.includes(input.category as PublicCategory)
    ? String(input.category)
    : "Todos";
  const sort: CatalogSort = input.sort === "nome" ? "nome" : "curadoria";
  const pageSize = Math.min(asPositiveInteger(input.pageSize, 12), 24);
  const page = asPositiveInteger(input.page, 1);
  const needle = normalize(query);
  const matches = catalogItems.filter(
    (product) =>
      (category === "Todos" || product.category === category) &&
      normalize(
        `${product.name} ${product.originalName} ${product.sku} ${product.category}`,
      ).includes(needle),
  );
  const ordered =
    sort === "nome"
      ? [...matches].sort((a, b) =>
          a.name.localeCompare(b.name, "pt-BR", { sensitivity: "base" }),
        )
      : matches;
  const totalPages = Math.max(1, Math.ceil(ordered.length / pageSize));
  const resolvedPage = Math.min(page, totalPages);
  const start = (resolvedPage - 1) * pageSize;

  return {
    contractVersion: CATALOG_CONTRACT_VERSION,
    items: ordered.slice(start, start + pageSize),
    page: resolvedPage,
    pageSize,
    total: ordered.length,
    totalPages,
    query,
    category,
    sort,
  };
}

export function readSelection(raw: string | null): Selection {
  try {
    const input: unknown = JSON.parse(raw ?? "{}");
    if (!input || typeof input !== "object" || Array.isArray(input)) return {};
    const stored = input as Record<string, unknown>;
    const hasEnvelope = "items" in stored || "savedAt" in stored;
    if (
      hasEnvelope &&
      (typeof stored.savedAt !== "number" ||
        !Number.isFinite(stored.savedAt) ||
        Date.now() - stored.savedAt > SELECTION_STORAGE_TTL_MS ||
        Date.now() < stored.savedAt)
    )
      return {};
    const candidate = hasEnvelope ? stored.items : stored;
    if (!candidate || typeof candidate !== "object" || Array.isArray(candidate))
      return {};
    const safe: Selection = {};
    for (const product of products) {
      const value = (candidate as Record<string, unknown>)[product.id];
      if (
        typeof value === "number" &&
        Number.isInteger(value) &&
        value >= Math.max(1, product.minimum ?? 1) &&
        value <= 10000
      )
        safe[product.id] = value;
    }
    return safe;
  } catch {
    return {};
  }
}

/** Stores only product identifiers and quantities, never briefing contact data. */
export function serializeSelection(selection: Selection) {
  return JSON.stringify({ version: 1, savedAt: Date.now(), items: selection });
}

export function downloadText(
  filename: string,
  contents: string,
  type = "text/plain;charset=utf-8",
) {
  const url = URL.createObjectURL(new Blob([contents], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
