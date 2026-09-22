import type { Metadata } from "next";
import CatalogLibrary from "@/components/CatalogLibrary";
import { CatalogFooter, CatalogHeader } from "@/components/CatalogFrame";
import { getCatalogLibrary } from "@/lib/catalog-library-data";
import { resolveCatalogTheme } from "@/lib/catalog-library";

export const metadata: Metadata = {
  title: "Catálogos de presentes corporativos | Promo Brindes Premium",
  description:
    "Explore coleções de presentes corporativos por ocasião: boas-vindas, reconhecimento, relacionamento, celebrações, escrita e viagem.",
  alternates: { canonical: "/catalogos" },
  openGraph: {
    title: "Catálogos | Promo Brindes Premium",
    description:
      "Para cada intenção, um presente. Explore nossas coleções online.",
    url: "/catalogos",
  },
};

export default async function CatalogsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const query =
    typeof params.q === "string" ? params.q.trim().slice(0, 80) : "";
  const theme = resolveCatalogTheme(
    typeof params.tema === "string" ? params.tema : undefined,
  );
  const collections = await getCatalogLibrary();
  return (
    <>
      <CatalogHeader />
      <main id="conteudo">
        <CatalogLibrary collections={collections} query={query} theme={theme} />
      </main>
      <CatalogFooter />
    </>
  );
}
