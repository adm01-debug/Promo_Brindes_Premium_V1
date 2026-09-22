import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, BookOpen } from "lucide-react";
import { CatalogHeader, CatalogFooter } from "@/components/CatalogFrame";
import CatalogCover from "@/components/CatalogCover";
import ShareCatalog from "@/components/ShareCatalog";
import RetryCollection from "@/components/RetryCollection";
import CollectionProductImage from "@/components/CollectionProductImage";
import {
  catalogCollections,
  getCatalogCollection,
} from "@/lib/catalog-library";
import { getCollectionProducts } from "@/lib/catalog-library-data";
import type { Product } from "@/lib/catalog";

export const revalidate = 60;
export function generateStaticParams() {
  return catalogCollections.map(({ slug }) => ({ slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const collection = getCatalogCollection((await params).slug);
  if (!collection)
    return {
      title: "Catálogo não encontrado",
      robots: { index: false, follow: false },
    };
  return {
    title: `${collection.title} | Catálogos Promo Brindes Premium`,
    description: collection.description,
    alternates: { canonical: `/catalogos/${collection.slug}` },
    openGraph: {
      title: collection.title,
      description: collection.description,
      url: `/catalogos/${collection.slug}`,
      images: [
        {
          url: "/images/hero-gifting.webp",
          alt: "Composição conceitual da Promo Brindes Premium",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${collection.title} | Promo Brindes Premium`,
      description: collection.description,
      images: ["/images/hero-gifting.webp"],
    },
  };
}
export default async function CollectionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const collection = getCatalogCollection((await params).slug);
  if (!collection) notFound();
  let products: Product[] = [];
  let unavailable = false;
  try {
    products = await getCollectionProducts(collection.productIds);
  } catch {
    unavailable = true;
  }
  return (
    <>
      <CatalogHeader />
      <main id="conteudo">
        <section className="collection-intro">
          <div className="collection-intro-copy">
            <Link className="text-button collection-back" href="/catalogos">
              <ArrowLeft size={16} aria-hidden="true" /> Todos os catálogos
            </Link>
            <p className="eyebrow">
              CATÁLOGO Nº {collection.number} · {collection.eyebrow}
            </p>
            <h1>
              {collection.title}
              <span>.</span>
            </h1>
            <p className="collection-description">{collection.introduction}</p>
            <div className="collection-meta">
              <span>
                <BookOpen size={16} aria-hidden="true" /> Coleção online
              </span>
              <span>
                Edição editorial ·{" "}
                {collection.editedAt.split("-").reverse().join(".")}
              </span>
            </div>
            <div className="collection-intro-actions">
              <a href="#pecas" className="button button-gold">
                Explorar as peças <ArrowRight size={17} aria-hidden="true" />
              </a>
              <ShareCatalog title={collection.title} slug={collection.slug} />
            </div>
          </div>
          <div className="collection-intro-cover">
            <CatalogCover
              collection={collection}
              image={products[0]?.image}
              priority
            />
          </div>
        </section>
        <section
          className="collection-pieces library-section"
          id="pecas"
          aria-labelledby="pieces-title"
        >
          <div className="library-section-heading">
            <div>
              <p className="eyebrow">ESCOLHAS COM INTENÇÃO</p>
              <h2 id="pieces-title">
                Peças para <em>este momento.</em>
              </h2>
            </div>
            <p>
              Abra uma peça para conhecer os detalhes e incluí-la no seu
              projeto. Cada produto é escolhido individualmente; esta coleção
              não é um kit fechado.
            </p>
          </div>
          {unavailable ? (
            <div className="library-empty" role="alert">
              <h3>Não foi possível conferir as peças agora.</h3>
              <p>Tente novamente para consultar esta seleção.</p>
              <RetryCollection />
            </div>
          ) : !products.length ? (
            <div className="library-empty">
              <h3>Uma seleção em atualização.</h3>
              <p>
                As peças desta coleção não estão publicadas no momento. Explore
                os outros catálogos para encontrar uma nova direção.
              </p>
              <Link href="/catalogos" className="button button-gold">
                Explorar outros catálogos{" "}
                <ArrowRight size={17} aria-hidden="true" />
              </Link>
            </div>
          ) : (
            <>
              <p className="collection-count">
                {products.length}{" "}
                {products.length === 1 ? "peça publicada" : "peças publicadas"}{" "}
                nesta seleção
              </p>
              <div className="collection-products">
                {products.map((product) => (
                  <article className="collection-product" key={product.id}>
                    <Link
                      href={`/produtos/${product.slug}`}
                      className="collection-product-photo"
                      aria-label={`Ver ${product.name}`}
                    >
                      <CollectionProductImage
                        image={product.image}
                        name={product.name}
                      />
                      <span>REF. {product.sku}</span>
                    </Link>
                    <p className="library-card-eyebrow">{product.category}</p>
                    <h3>
                      <Link href={`/produtos/${product.slug}`}>
                        {product.name}
                      </Link>
                    </h3>
                    <p>{product.tagline}</p>
                    <span className="collection-product-minimum">
                      Mínimo cadastrado: {product.minimum}{" "}
                      {product.minimum === 1 ? "unidade" : "unidades"}
                    </span>
                    <Link
                      href={`/produtos/${product.slug}`}
                      className="text-button"
                    >
                      Conhecer a peça{" "}
                      <ArrowRight size={16} aria-hidden="true" />
                    </Link>
                  </article>
                ))}
              </div>
            </>
          )}
        </section>
        <section className="collection-closing">
          <p className="eyebrow">UM PROJETO COM A SUA ESSÊNCIA</p>
          <h2>
            Da escolha ao gesto.
            <br />
            <em>O cuidado está nos detalhes.</em>
          </h2>
          <p>
            Explore as peças e prepare seu briefing. Quantidades, técnicas de
            personalização, composição, investimento e prazo são confirmados na
            proposta.
          </p>
          <Link href="/#curadoria" className="button button-gold">
            Continuar meu projeto <ArrowRight size={17} aria-hidden="true" />
          </Link>
          <Link href="/catalogos" className="text-button">
            Voltar aos catálogos <ArrowLeft size={16} aria-hidden="true" />
          </Link>
        </section>
      </main>
      <CatalogFooter />
    </>
  );
}
