import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { getProductBySlug, products } from "@/lib/catalog";
import ProductDetailActions from "@/components/ProductDetailActions";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  return params.then(({ slug }) => {
    const product = getProductBySlug(slug);
    if (!product) return {};
    return {
      title: `${product.name} | Promo Brindes Premium`,
      description: product.description
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 155),
      openGraph: {
        images: [{ url: product.image, alt: product.originalName }],
      },
      alternates: { canonical: `/produtos/${product.slug}` },
    };
  });
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();
  const minimum = Math.max(1, product.minimum ?? 1);
  const siteUrl = process.env.PROMO_PREMIUM_SITE_URL?.replace(/\/$/, "");
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
            Snapshot editorial consultado em{" "}
            {product.sourceDate.split("-").reverse().join(".")}. Condições,
            materiais, variantes e estoque precisam ser confirmados pelo
            comercial antes da proposta.
          </p>
        </div>
      </article>
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
