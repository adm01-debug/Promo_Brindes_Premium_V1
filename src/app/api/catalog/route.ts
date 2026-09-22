import { NextRequest, NextResponse } from "next/server";
import { queryCatalog } from "@/lib/catalog";
import { getSiteCatalog } from "@/lib/site-database";

export const revalidate = 300;

function integer(value: string | null) {
  if (!value) return undefined;
  if (!/^\d+$/.test(value)) return null;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
}

function invalid(message: string) {
  return NextResponse.json(
    { error: "INVALID_CATALOG_QUERY", message },
    { status: 400, headers: { "Cache-Control": "no-store" } },
  );
}

/**
 * Versioned, safe catalog projection. It intentionally does not proxy the
 * internal application or expose costs, suppliers, stock, discount rules or
 * unrestricted filters.
 */
export async function GET(request: NextRequest) {
  const search = request.nextUrl.searchParams;
  const query = search.get("q");
  const category = search.get("category");
  const page = integer(search.get("page"));
  const pageSize = integer(search.get("pageSize"));
  const sort = search.get("sort");
  if (query && query.length > 100)
    return invalid("q aceita no máximo 100 caracteres.");
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
    return invalid("category não pertence à taxonomia pública.");
  if (
    page === null ||
    pageSize === null ||
    (pageSize !== undefined && pageSize > 24)
  )
    return invalid(
      "page e pageSize devem ser inteiros positivos; pageSize é no máximo 24.",
    );
  if (sort && !["curadoria", "nome"].includes(sort))
    return invalid("sort deve ser curadoria ou nome.");
  let catalogItems;
  try {
    catalogItems = await getSiteCatalog();
  } catch {
    return NextResponse.json(
      { error: "CATALOG_UNAVAILABLE" },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
  const result = queryCatalog(
    {
      query: query ?? undefined,
      category: category ?? undefined,
      page: page ?? undefined,
      pageSize: pageSize ?? undefined,
      sort: sort ?? undefined,
    },
    catalogItems,
  );
  return NextResponse.json(result, {
    headers: {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      "X-Catalog-Contract-Version": result.contractVersion,
      "X-Catalog-Source": process.env.SUPABASE_URL
        ? "site-database"
        : "snapshot",
    },
  });
}
