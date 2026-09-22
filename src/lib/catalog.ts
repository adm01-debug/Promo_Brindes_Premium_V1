import catalog from "./products.json";
import { catalogCollections } from "./catalog-library";

/**
 * Public, editorial projection of the catalog snapshot. Keep operational
 * fields (cost, supplier, stock and discount rules) outside this module.
 */
export const CATALOG_CONTRACT_VERSION = "2026-09-22.2";
export type PublicCategory =
  | "Kits & experiências"
  | "Escrita"
  | "Lifestyle"
  | "Viagem";
export type Product = {
  id: string;
  sku: string;
  slug: string;
  name: string;
  originalName: string;
  category: PublicCategory;
  tagline: string;
  description: string;
  image: string;
  minimum: number;
  personalizable: boolean;
  sourceDate: string;
};
export const products: readonly Product[] = Object.freeze([
  ...catalog,
] as Product[]);
export type Selection = Record<string, number>;
export const SELECTION_STORAGE_TTL_MS = 14 * 24 * 60 * 60 * 1000;
export const categories = [
  "Todos",
  "Kits & experiências",
  "Escrita",
  "Lifestyle",
  "Viagem",
] as const;

export type CatalogSort = "curadoria" | "nome";

export type CatalogQuery = {
  query?: string;
  category?: string;
  occasions?: readonly string[];
  personalizable?: boolean;
  quantity?: number | null;
  page?: number;
  pageSize?: number;
  sort?: string;
  ids?: readonly string[];
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
  occasions: string[];
  personalizable: boolean;
  quantity: number | null;
  suggestedQuery: string | null;
  facets: CatalogFacets;
};

export type CatalogFacets = {
  categories: Record<(typeof categories)[number], number>;
  occasions: Record<string, number>;
  personalizable: number;
};

export type ResolvedCatalogQuery = {
  query: string;
  page: number;
  pageSize: number;
  sort: CatalogSort;
  category: (typeof categories)[number];
  occasions: string[];
  personalizable: boolean;
  quantity: number | null;
  ids: readonly string[];
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

export function resolveCatalogQuery(
  input: CatalogQuery = {},
): ResolvedCatalogQuery {
  const query = String(input.query ?? "")
    .trim()
    .slice(0, 100);
  const category = categories.includes(
    input.category as (typeof categories)[number],
  )
    ? (String(input.category) as (typeof categories)[number])
    : "Todos";
  const knownOccasions = new Set(
    catalogCollections.map((collection) => collection.slug),
  );
  const occasions = Array.isArray(input.occasions)
    ? [
        ...new Set(
          input.occasions.filter(
            (occasion): occasion is string =>
              typeof occasion === "string" && knownOccasions.has(occasion),
          ),
        ),
      ].slice(0, catalogCollections.length)
    : [];
  const quantity =
    Number.isSafeInteger(input.quantity) &&
    Number(input.quantity) >= 1 &&
    Number(input.quantity) <= 10000
      ? Number(input.quantity)
      : null;
  return {
    query,
    category,
    occasions,
    personalizable: input.personalizable === true,
    quantity,
    sort: input.sort === "nome" ? "nome" : "curadoria",
    pageSize: Math.min(asPositiveInteger(input.pageSize, 12), 24),
    page: asPositiveInteger(input.page, 1),
    ids: Array.isArray(input.ids) ? [...new Set(input.ids)] : [],
  };
}

function productOccasions(productId: string) {
  return catalogCollections.filter((collection) =>
    collection.productIds.includes(productId),
  );
}

function productCoreSearchText(product: Product) {
  return normalize(
    [product.name, product.originalName, product.sku, product.category].join(
      " ",
    ),
  );
}

function productSearchText(product: Product) {
  const occasions = productOccasions(product.id);
  return normalize(
    [
      product.name,
      product.originalName,
      product.sku,
      product.category,
      ...occasions.flatMap((occasion) => [
        occasion.title,
        occasion.eyebrow,
        ...occasion.tags,
        ...occasion.aliases,
      ]),
    ].join(" "),
  );
}

function editDistance(left: string, right: string) {
  const previous = Array.from(
    { length: right.length + 1 },
    (_, index) => index,
  );
  for (let i = 1; i <= left.length; i++) {
    let diagonal = previous[0];
    previous[0] = i;
    for (let j = 1; j <= right.length; j++) {
      const above = previous[j];
      previous[j] = Math.min(
        previous[j] + 1,
        previous[j - 1] + 1,
        diagonal + (left[i - 1] === right[j - 1] ? 0 : 1),
      );
      diagonal = above;
    }
  }
  return previous[right.length];
}

/** Suggests one public catalog term only after an exact zero-result search. */
export function suggestCatalogQuery(
  query: string,
  catalogItems: readonly Product[] = products,
) {
  const term = normalize(query.trim());
  if (term.length < 5 || /\s|\d/.test(term)) return null;
  const vocabulary = new Set<string>();
  for (const product of catalogItems)
    for (const token of productSearchText(product).split(/[^a-z0-9]+/))
      if (token.length >= 5 && !/\d/.test(token)) vocabulary.add(token);
  let best: { value: string; distance: number } | null = null;
  for (const candidate of vocabulary) {
    const distance = editDistance(term, candidate);
    if (
      distance === 1 &&
      (!best ||
        distance < best.distance ||
        (distance === best.distance && candidate.localeCompare(best.value) < 0))
    )
      best = { value: candidate, distance };
  }
  return best?.value ?? null;
}

type FilterDimension = "category" | "occasions" | "personalizable";

function filterCatalogItems(
  catalogItems: readonly Product[],
  query: ResolvedCatalogQuery,
  options: { exclude?: FilterDimension; search?: string } = {},
) {
  const terms = normalize(options.search ?? query.query)
    .split(/\s+/)
    .filter(Boolean);
  // When an exact product-field match exists, it wins over broader editorial
  // aliases. “Garrafa” must not return every product from a travel collection.
  const useCoreSearch =
    terms.length > 0 &&
    catalogItems.some((product) =>
      terms.every((term) => productCoreSearchText(product).includes(term)),
    );
  const occasionIds = new Set(
    catalogCollections
      .filter((collection) => query.occasions.includes(collection.slug))
      .flatMap((collection) => collection.productIds),
  );
  return catalogItems.filter(
    (product) =>
      (options.exclude === "category" ||
        query.category === "Todos" ||
        product.category === query.category) &&
      (!query.ids.length || query.ids.includes(product.id)) &&
      (options.exclude === "occasions" ||
        !query.occasions.length ||
        occasionIds.has(product.id)) &&
      (options.exclude === "personalizable" ||
        !query.personalizable ||
        product.personalizable) &&
      (query.quantity === null || product.minimum <= query.quantity) &&
      terms.every((term) =>
        (useCoreSearch
          ? productCoreSearchText(product)
          : productSearchText(product)
        ).includes(term),
      ),
  );
}

function catalogFacets(
  catalogItems: readonly Product[],
  query: ResolvedCatalogQuery,
  effectiveSearch: string,
): CatalogFacets {
  const withoutCategory = filterCatalogItems(catalogItems, query, {
    exclude: "category",
    search: effectiveSearch,
  });
  const withoutOccasion = filterCatalogItems(catalogItems, query, {
    exclude: "occasions",
    search: effectiveSearch,
  });
  const withoutPersonalization = filterCatalogItems(catalogItems, query, {
    exclude: "personalizable",
    search: effectiveSearch,
  });
  return {
    categories: Object.fromEntries(
      categories.map((category) => [
        category,
        category === "Todos"
          ? withoutCategory.length
          : withoutCategory.filter((product) => product.category === category)
              .length,
      ]),
    ) as CatalogFacets["categories"],
    occasions: Object.fromEntries(
      catalogCollections.map((collection) => [
        collection.slug,
        withoutOccasion.filter((product) =>
          collection.productIds.includes(product.id),
        ).length,
      ]),
    ),
    personalizable: withoutPersonalization.filter(
      (product) => product.personalizable,
    ).length,
  };
}

/**
 * Deterministic query used by the local snapshot and the public API. It is
 * deliberately limited to fields whose meaning is known in this preview.
 */
export function queryCatalog(
  input: CatalogQuery = {},
  catalogItems: readonly Product[] = products,
): CatalogPage {
  const resolved = resolveCatalogQuery(input);
  let effectiveSearch = resolved.query;
  let matches = filterCatalogItems(catalogItems, resolved);
  let suggestedQuery: string | null = null;
  const suggestion =
    matches.length === 0
      ? suggestCatalogQuery(resolved.query, catalogItems)
      : null;
  if (suggestion) {
    const suggestedMatches = filterCatalogItems(catalogItems, resolved, {
      search: suggestion,
    });
    if (suggestedMatches.length > 0) {
      suggestedQuery = suggestion;
      effectiveSearch = suggestion;
      matches = suggestedMatches;
    }
  }
  const ordered =
    resolved.sort === "nome"
      ? [...matches].sort(
          (a, b) =>
            a.name.localeCompare(b.name, "pt-BR", { sensitivity: "base" }) ||
            a.id.localeCompare(b.id),
        )
      : matches;
  const totalPages = Math.max(1, Math.ceil(ordered.length / resolved.pageSize));
  const resolvedPage = Math.min(resolved.page, totalPages);
  const start = (resolvedPage - 1) * resolved.pageSize;

  return {
    contractVersion: CATALOG_CONTRACT_VERSION,
    items: ordered.slice(start, start + resolved.pageSize),
    page: resolvedPage,
    pageSize: resolved.pageSize,
    total: ordered.length,
    totalPages,
    query: resolved.query,
    category: resolved.category,
    sort: resolved.sort,
    occasions: resolved.occasions,
    personalizable: resolved.personalizable,
    quantity: resolved.quantity,
    suggestedQuery,
    facets: catalogFacets(catalogItems, resolved, effectiveSearch),
  };
}

/** Keeps valid local quantities while a remote catalog is refreshed server-side. */
export function readUnverifiedSelection(raw: string | null): Selection {
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
    for (const [id, quantity] of Object.entries(candidate))
      if (
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
          id,
        ) &&
        typeof quantity === "number" &&
        Number.isInteger(quantity) &&
        quantity >= 1 &&
        quantity <= 10000
      )
        safe[id] = quantity;
    return safe;
  } catch {
    return {};
  }
}

export function readSelection(raw: string | null): Selection {
  const candidate = readUnverifiedSelection(raw);
  const safe: Selection = {};
  for (const product of products) {
    const value = candidate[product.id];
    if (
      typeof value === "number" &&
      Number.isInteger(value) &&
      value >= Math.max(1, product.minimum ?? 1) &&
      value <= 10000
    )
      safe[product.id] = value;
  }
  return safe;
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
