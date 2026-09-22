import { catalogCollections, type CatalogSummary } from "@/lib/catalog-library";
import { getSiteCatalogPage } from "@/lib/site-database";

/** Only the premium public projection is read; no source writes or private fields. */
export async function getCollectionProducts(ids: readonly string[]) {
  if (ids.length < 1 || ids.length > 24 || new Set(ids).size !== ids.length)
    throw new Error("Collection requires 1–24 unique products.");
  const result = await getSiteCatalogPage({ ids, pageSize: 24 });
  if (result.totalPages > 1 || result.items.length !== result.total)
    throw new Error("Collection exceeds its verified product window.");
  const byId = new Map(result.items.map((product) => [product.id, product]));
  return ids.flatMap((id) => (byId.has(id) ? [byId.get(id)!] : []));
}

/**
 * Finds other published pieces that share an editorial collection with the
 * current product. Collection order is the recommendation order; no physical
 * compatibility, stock or kit composition is inferred here.
 */
export async function getContextualProducts(productId: string, limit = 3) {
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      productId,
    ) ||
    !Number.isInteger(limit) ||
    limit < 1 ||
    limit > 6
  )
    throw new Error("Contextual recommendation input is invalid.");
  const relatedIds = [
    ...new Set(
      catalogCollections
        .filter((collection) => collection.productIds.includes(productId))
        .flatMap((collection) => collection.productIds)
        .filter((id) => id !== productId),
    ),
  ].slice(0, limit);
  return relatedIds.length ? getCollectionProducts(relatedIds) : [];
}

export async function getCatalogLibrary(): Promise<CatalogSummary[]> {
  const ids = [
    ...new Set(
      catalogCollections.flatMap((collection) => collection.productIds),
    ),
  ];
  let products;
  try {
    products = await getCollectionProducts(ids);
  } catch {
    return catalogCollections.map((collection) => ({
      ...collection,
      productCount: null,
      cover: null,
    }));
  }
  return catalogCollections.map((collection) => {
    const available = collection.productIds.flatMap((id) =>
      products.filter((product) => product.id === id),
    );
    return {
      ...collection,
      productCount: available.length,
      cover: available[0]
        ? { image: available[0].image, name: available[0].name }
        : null,
    };
  });
}
