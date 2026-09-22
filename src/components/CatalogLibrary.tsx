"use client";
import { useEffect, useState, useTransition, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowDown,
  ArrowRight,
  BookOpen,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import {
  catalogThemes,
  filterCatalogs,
  type CatalogSummary,
  type CatalogTheme,
} from "@/lib/catalog-library";
import CatalogCover from "@/components/CatalogCover";
import ShareCatalog from "@/components/ShareCatalog";

export default function CatalogLibrary({
  collections,
  query,
  theme,
}: {
  collections: CatalogSummary[];
  query: string;
  theme: CatalogTheme;
}) {
  const router = useRouter();
  const [draft, setDraft] = useState(query);
  const [pending, startTransition] = useTransition();
  useEffect(() => setDraft(query), [query]);
  const results = filterCatalogs(collections, query, theme);
  const unavailable = collections.some(
    (collection) => collection.productCount === null,
  );

  function filter(nextQuery: string, nextTheme: CatalogTheme) {
    const params = new URLSearchParams();
    const trimmed = nextQuery.trim().slice(0, 80);
    if (trimmed) params.set("q", trimmed);
    if (nextTheme !== "todos") params.set("tema", nextTheme);
    startTransition(() =>
      router.push(`/catalogos${params.size ? `?${params}` : ""}`, {
        scroll: false,
      }),
    );
  }
  function search(event: FormEvent) {
    event.preventDefault();
    filter(draft, theme);
  }

  return (
    <>
      <section className="library-hero" aria-labelledby="catalogs-title">
        <div className="library-hero-copy">
          <p className="eyebrow">
            <span className="tiny-line" /> A BIBLIOTECA PREMIUM
          </p>
          <h1 id="catalogs-title">
            Para cada intenção,
            <br />
            um presente.
            <br />
            <em>
              Para cada gesto,
              <br />
              um significado.
            </em>
          </h1>
          <p>
            Explore nossos catálogos e encontre um ponto de partida para
            presentear com a essência da sua marca.
          </p>
          <a href="#biblioteca" className="button button-gold">
            Encontre sua inspiração <ArrowDown size={17} aria-hidden="true" />
          </a>
          <span className="library-hero-caption">
            SELEÇÕES POR OCASIÃO · ACESSO LIVRE
          </span>
        </div>
        <div className="library-shelf" aria-hidden="true">
          <div className="library-book library-book--back">
            <CatalogCover collection={collections[2]} />
          </div>
          <div className="library-book library-book--middle">
            <CatalogCover collection={collections[1]} />
          </div>
          <div className="library-book library-book--front">
            <CatalogCover
              collection={collections[0]}
              image={collections[0].cover?.image}
              priority
            />
          </div>
          <span className="shelf-caption">
            O EXTRAORDINÁRIO COMEÇA NA ESCOLHA.
          </span>
        </div>
      </section>

      <section
        id="biblioteca"
        className="library-section"
        aria-labelledby="library-title"
      >
        <div className="library-section-heading">
          <div>
            <p className="eyebrow">ENCONTRE A SUA DIREÇÃO</p>
            <h2 id="library-title">
              Uma ocasião.
              <br />
              <em>Muitas possibilidades.</em>
            </h2>
          </div>
          <p>
            Do primeiro encontro a uma conquista memorável. Coleções online para
            explorar, compartilhar e transformar em um projeto.
          </p>
        </div>
        <div className="library-controls" aria-busy={pending}>
          <form onSubmit={search} role="search" className="library-search">
            <label htmlFor="catalog-search">Qual é a ocasião?</label>
            <div>
              <Search size={19} aria-hidden="true" />
              <input
                id="catalog-search"
                type="search"
                placeholder="Busque por onboarding, clientes, viagem…"
                maxLength={80}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
              />
              {draft && (
                <button
                  type="button"
                  className="icon-button"
                  aria-label="Limpar busca"
                  onClick={() => {
                    setDraft("");
                    filter("", theme);
                  }}
                >
                  <X size={17} aria-hidden="true" />
                </button>
              )}
              <button
                type="submit"
                className="library-search-submit"
                disabled={pending}
              >
                Buscar <ArrowRight size={16} aria-hidden="true" />
              </button>
            </div>
          </form>
          <div className="library-themes">
            <span>
              <SlidersHorizontal size={15} aria-hidden="true" /> Explorar por
              tema
            </span>
            <div role="group" aria-label="Temas dos catálogos">
              {catalogThemes.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  aria-pressed={theme === option.id}
                  onClick={() => filter(draft, option.id)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="library-results-bar">
          <p role="status">
            {pending
              ? "Atualizando catálogos…"
              : `${results.length} ${results.length === 1 ? "catálogo encontrado" : "catálogos encontrados"}`}
          </p>
          {query || theme !== "todos" ? (
            <button
              type="button"
              className="text-button"
              onClick={() => {
                setDraft("");
                filter("", "todos");
              }}
            >
              Limpar filtros <X size={14} aria-hidden="true" />
            </button>
          ) : (
            <span>CURADORIA PREMIUM · COLEÇÕES ONLINE</span>
          )}
        </div>
        {unavailable && (
          <div className="library-notice" role="alert">
            <p>
              Não foi possível conferir as peças agora. Os catálogos continuam
              disponíveis para consulta assim que a conexão for restabelecida.
            </p>
            <button
              type="button"
              className="text-button"
              disabled={pending}
              onClick={() => startTransition(() => router.refresh())}
            >
              Tentar novamente
            </button>
          </div>
        )}
        {results.length ? (
          <div className="library-grid">
            {results.map((collection) => (
              <article key={collection.slug} className="library-card">
                <Link
                  href={`/catalogos/${collection.slug}`}
                  className="library-card-cover"
                  aria-label={`Explorar ${collection.title}`}
                >
                  <CatalogCover
                    collection={collection}
                    image={collection.cover?.image}
                  />
                </Link>
                <div className="library-card-meta">
                  <span>
                    <BookOpen size={14} aria-hidden="true" /> Coleção online
                  </span>
                  <span>Nº {collection.number}</span>
                </div>
                <p className="library-card-eyebrow">{collection.eyebrow}</p>
                <h3>
                  <Link href={`/catalogos/${collection.slug}`}>
                    {collection.title}
                  </Link>
                </h3>
                <p className="library-card-description">
                  {collection.description}
                </p>
                <ul
                  className="library-tags"
                  aria-label={`Temas de ${collection.title}`}
                >
                  {collection.tags.map((tag) => (
                    <li key={tag}>{tag}</li>
                  ))}
                </ul>
                <p className="library-piece-count">
                  {collection.productCount === null
                    ? "Peças em conferência"
                    : collection.productCount === 0
                      ? "Seleção em atualização"
                      : `${collection.productCount} peças nesta seleção`}
                </p>
                <div className="library-card-actions">
                  <Link
                    href={`/catalogos/${collection.slug}`}
                    className="text-button"
                  >
                    Explorar catálogo{" "}
                    <ArrowRight size={16} aria-hidden="true" />
                  </Link>
                  <ShareCatalog
                    title={collection.title}
                    slug={collection.slug}
                  />
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="library-empty">
            <BookOpen size={32} aria-hidden="true" />
            <h3>Uma nova inspiração está por perto.</h3>
            <p>
              Nenhum catálogo corresponde a essa combinação. Experimente outra
              ocasião ou explore todos os temas.
            </p>
            <button
              type="button"
              className="button button-gold"
              onClick={() => {
                setDraft("");
                filter("", "todos");
              }}
            >
              Ver todos os catálogos <ArrowRight size={17} aria-hidden="true" />
            </button>
          </div>
        )}
      </section>

      <section className="library-how" aria-labelledby="library-how-title">
        <p className="eyebrow">DA INSPIRAÇÃO AO SEU PROJETO</p>
        <h2 id="library-how-title">
          O próximo gesto <em>é seu.</em>
        </h2>
        <ol>
          <li>
            <span>01</span>
            <h3>Encontre uma intenção</h3>
            <p>
              Escolha uma coleção pelo momento ou pela pessoa que você quer
              presentear.
            </p>
          </li>
          <li>
            <span>02</span>
            <h3>Compartilhe a inspiração</h3>
            <p>
              Envie o link do catálogo e alinhe as referências com seu time.
            </p>
          </li>
          <li>
            <span>03</span>
            <h3>Prepare o seu projeto</h3>
            <p>
              Abra as peças, faça sua seleção e reúna os detalhes no briefing.
            </p>
          </li>
        </ol>
        <Link className="text-button" href="/#curadoria">
          Explorar todas as peças <ArrowRight size={17} aria-hidden="true" />
        </Link>
      </section>
    </>
  );
}
