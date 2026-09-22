import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { products, type Product } from "@/lib/catalog";
import { getContextualProducts } from "@/lib/catalog-library-data";
import { getSiteProductBySlug } from "@/lib/site-database";
import { publicSiteOrigin } from "@/lib/publication";
import ProductDetailActions from "@/components/ProductDetailActions";
import ProductRecommendationImage from "@/components/ProductRecommendationImage";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export const revalidate = 60;
export const dynamicParams = true;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const product = await getSiteProductBySlug(slug);
    if (!product)
      return {
        alternates: { canonical: `/produtos/${slug}` },
        robots: { index: false, follow: false },
      };
    return {
      title: `${product.name} | Promo Brindes Premium`,
      description: product.description
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 155),
      openGraph: {
        title: `${product.name} | Promo Brindes Premium`,
        description: product.tagline,
        type: "website",
        url: `/produtos/${product.slug}`,
        images: [{ url: product.image, alt: product.originalName }],
      },
      twitter: {
        card: "summary_large_image",
        title: `${product.name} | Promo Brindes Premium`,
        description: product.tagline,
        images: [{ url: product.image, alt: product.originalName }],
      },
      alternates: { canonical: `/produtos/${product.slug}` },
    };
  } catch {
    return {
      alternates: { canonical: `/produtos/${slug}` },
      robots: { index: false, follow: false },
    };
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let product;
  try {
    product = await getSiteProductBySlug(slug);
  } catch {
    return (
      <main className="legal-page">
        <h1>Curadoria temporariamente indisponível.</h1>
        <p>Não foi possível confirmar os dados publicados desta peça agora.</p>
        <Link href="/" className="button button-gold">
          Voltar à curadoria
        </Link>
      </main>
    );
  }
  if (!product) notFound();
  let contextualProducts: Product[] = [];
  try {
    contextualProducts = await getContextualProducts(product.id);
  } catch {
    // The product detail remains useful when contextual discovery is offline.
  }
  const minimum = Math.max(1, product.minimum ?? 1);
  const siteUrl = publicSiteOrigin();
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description.replace(/\s+/g, " ").trim(),
    sku: product.sku,
    brand: { "@type": "Brand", name: "Promo Brindes" },
    ...(siteUrl ? { image: `${siteUrl}${product.image}` } : {}),
  };

  return (
    <main className="product-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
        }}
      />
      <header className="product-page-header">
        <Link
          href="/"
          className="brand"
          aria-label="Promo Brindes Premium, início"
        >
          <span className="brand-emblem" aria-hidden="true">
            p<span>.</span>
          </span>
          <span className="brand-name">
            PROMO BRINDES<span>PREMIUM COLLECTION</span>
          </span>
        </Link>
        <Link href="/#curadoria" className="text-button">
          <ArrowLeft size={16} /> Voltar à curadoria
        </Link>
      </header>
      <article className="product-page-layout">
        <div className="product-page-image">
          <Image
            src={product.image}
            alt={product.originalName}
            fill
            priority
            sizes="(max-width: 820px) 100vw, 50vw"
          />
          <span>FOTO DO FORNECEDOR · REF. {product.sku}</span>
        </div>
        <div className="product-page-copy">
          <p className="eyebrow">
            {product.category.toUpperCase()} · CURADORIA PREMIUM
          </p>
          <h1>{product.name}</h1>
          <p className="product-page-tagline">{product.tagline}</p>
          <p className="product-page-description">{product.description}</p>
          <dl className="product-page-facts">
            <div>
              <dt>Quantidade mínima cadastrada</dt>
              <dd>
                {minimum} {minimum === 1 ? "unidade" : "unidades"}
              </dd>
            </div>
            <div>
              <dt>Personalização</dt>
              <dd>
                {product.personalizable
                  ? "Possibilidades sob consulta"
                  : "Consultar alternativas"}
              </dd>
            </div>
            <div>
              <dt>Investimento, prazo e disponibilidade</dt>
              <dd>Confirmados em proposta sob medida</dd>
            </div>
          </dl>
          <ProductDetailActions product={product} />
          <p className="fine-print">
            Dados editoriais confirmados em{" "}
            {product.sourceDate.split("-").reverse().join(".")}. Condições,
            materiais, variantes e estoque precisam ser confirmados pelo
            comercial antes da proposta.
          </p>
        </div>
      </article>
      {contextualProducts.length > 0 && (
        <section
          className="product-recommendations"
          aria-labelledby="product-recommendations-title"
        >
          <div className="product-recommendations-heading">
            <div>
              <p className="eyebrow">OUTRAS PEÇAS PARA A MESMA OCASIÃO</p>
              <h2 id="product-recommendations-title">
                Continue sua <em>curadoria.</em>
              </h2>
            </div>
            <p>
              Sugestões publicadas nas mesmas coleções editoriais. Cada peça é
              escolhida separadamente; composição, disponibilidade e
              personalização são confirmadas na proposta.
            </p>
          </div>
          <div className="product-recommendation-grid">
            {contextualProducts.map((related) => (
              <article className="product-recommendation-card" key={related.id}>
                <Link
                  href={`/produtos/${related.slug}`}
                  className="product-recommendation-image"
                  aria-label={`Conhecer ${related.name}`}
                >
                  <ProductRecommendationImage image={related.image} />
                  <span>REF. {related.sku}</span>
                </Link>
                <p className="product-category">{related.category}</p>
                <h3>
                  <Link href={`/produtos/${related.slug}`}>{related.name}</Link>
                </h3>
                <p>{related.tagline}</p>
                <Link
                  href={`/produtos/${related.slug}`}
                  className="text-button"
                >
                  Conhecer a peça <ArrowRight size={16} aria-hidden="true" />
                </Link>
              </article>
            ))}
          </div>
        </section>
      )}
      <section className="product-page-next">
        <p className="eyebrow">UMA SELEÇÃO COM CONTEXTO</p>
        <h2>
          Seu projeto começa por uma escolha.
          <br />
          <em>Os detalhes vêm na conversa.</em>
        </h2>
        <Link href="/#curadoria" className="button button-gold">
          Explorar a curadoria <ArrowRight size={17} />
        </Link>
      </section>
    </main>
  );
}
