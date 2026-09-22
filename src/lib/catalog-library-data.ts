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
