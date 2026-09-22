import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { getSiteCatalogPage } from "@/lib/site-database";
import { catalogCollections } from "@/lib/catalog-library";

export const revalidate = 300;

function integer(value: string | null) {
  if (!value) return undefined;
  if (!/^\d+$/.test(value)) return null;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
}

function timingHeaders(startedAt: number, requestId: string) {
  return {
    "Server-Timing": `catalog;dur=${(performance.now() - startedAt).toFixed(1)}`,
    "X-Request-Id": requestId,
  };
}

function invalid(message: string, startedAt: number, requestId: string) {
  return NextResponse.json(
    { error: "INVALID_CATALOG_QUERY", message },
    {
      status: 400,
      headers: {
        "Cache-Control": "no-store",
        ...timingHeaders(startedAt, requestId),
      },
    },
  );
}

/**
 * Versioned, safe catalog projection. It intentionally does not proxy the
 * internal application or expose costs, suppliers, stock, discount rules or
 * unrestricted filters.
 */
export async function GET(request: NextRequest) {
  const startedAt = performance.now();
  const requestId = randomUUID();
  const search = request.nextUrl.searchParams;
  const query = search.get("q");
  const category = search.get("category");
  const page = integer(search.get("page"));
  const pageSize = integer(search.get("pageSize"));
  const sort = search.get("sort");
  const ids = search.get("ids");
  const occasion = search.get("occasion");
  const personalizable = search.get("personalizable");
  const quantity = integer(search.get("quantity"));
  if (query && query.length > 100)
    return invalid("q aceita no máximo 100 caracteres.", startedAt, requestId);
  if (
    category &&
    ![
      "Todos",
      "Kits & experiências",
      "Escrita",
      "Lifestyle",
      "Viagem",
    ].includes(category)
  )
    return invalid(
      "category não pertence à taxonomia pública.",
      startedAt,
      requestId,
    );
  if (
    page === null ||
    pageSize === null ||
    (pageSize !== undefined && pageSize > 24)
  )
    return invalid(
      "page e pageSize devem ser inteiros positivos; pageSize é no máximo 24.",
      startedAt,
      requestId,
    );
  if (sort && !["curadoria", "nome"].includes(sort))
    return invalid("sort deve ser curadoria ou nome.", startedAt, requestId);
  const occasions = occasion ? occasion.split(",") : [];
  const knownOccasions = new Set(
    catalogCollections.map((collection) => collection.slug),
  );
  if (
    occasions.length > catalogCollections.length ||
    occasions.some((value) => value === "") ||
    new Set(occasions).size !== occasions.length ||
    occasions.some((value) => !knownOccasions.has(value))
  )
    return invalid(
      "occasion contém uma curadoria pública inválida.",
      startedAt,
      requestId,
    );
  if (personalizable !== null && personalizable !== "1")
    return invalid(
      "personalizable deve ser 1 quando informado.",
      startedAt,
      requestId,
    );
  if (quantity === null || (quantity !== undefined && quantity > 10000))
    return invalid(
      "quantity deve ser um inteiro entre 1 e 10000.",
      startedAt,
      requestId,
    );
  const selectedIds = ids ? ids.split(",") : [];
  if (
    selectedIds.length > 24 ||
    selectedIds.some(
      (id) =>
        !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
          id,
        ),
    )
  )
    return invalid(
      "ids aceita no máximo 24 UUIDs públicos separados por vírgula.",
      startedAt,
      requestId,
    );
  if (
    selectedIds.length > 0 &&
    (query ||
      category ||
      occasions.length > 0 ||
      personalizable !== null ||
      quantity !== undefined)
  )
    return invalid(
      "ids não pode ser combinado com filtros de descoberta.",
      startedAt,
      requestId,
    );
  try {
    const result = await getSiteCatalogPage(
      {
        query: query ?? undefined,
        category: category ?? undefined,
        occasions,
        personalizable: personalizable === "1",
        quantity,
        page: page ?? undefined,
        pageSize: pageSize ?? undefined,
        sort: sort ?? undefined,
        ids: selectedIds,
      },
      { fresh: selectedIds.length > 0 },
    );
    return NextResponse.json(result, {
      headers: {
        "Cache-Control": selectedIds.length
          ? "no-store"
          : "public, s-maxage=300, stale-while-revalidate=600",
        "X-Catalog-Contract-Version": result.contractVersion,
        "X-Catalog-Source": process.env.SUPABASE_URL
          ? "site-database"
          : "snapshot",
        ...timingHeaders(startedAt, requestId),
      },
    });
  } catch {
    console.error(
      JSON.stringify({
        level: "error",
        event: "catalog_unavailable",
        route: "/api/catalog",
        status: 503,
        requestId,
        durationMs: Math.round(performance.now() - startedAt),
      }),
    );
    return NextResponse.json(
      { error: "CATALOG_UNAVAILABLE" },
      {
        status: 503,
        headers: {
          "Cache-Control": "no-store",
          ...timingHeaders(startedAt, requestId),
        },
      },
    );
  }
}
