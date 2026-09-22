"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Check, RotateCcw, Search, Sparkles } from "lucide-react";
import { categories, type CatalogFacets } from "@/lib/catalog";
import { catalogCollections } from "@/lib/catalog-library";

export type CatalogDiscovery = {
  search: string;
  category: (typeof categories)[number];
  occasions: string[];
  personalizable: boolean;
  quantity: number | null;
};

export function countDiscoveryFilters(value: CatalogDiscovery) {
  return (
    Number(Boolean(value.search)) +
    Number(value.category !== "Todos") +
    Number(value.occasions.length > 0) +
    Number(value.personalizable) +
    Number(value.quantity !== null)
  );
}

export default function CatalogFilters({
  value,
  facets,
  resultCount,
  loading,
  error,
  onChange,
  onSearch,
  onClear,
  onClose,
}: {
  value: CatalogDiscovery;
  facets: CatalogFacets | null;
  resultCount: number;
  loading: boolean;
  error: boolean;
  onChange: (next: CatalogDiscovery) => void;
  onSearch: (next: CatalogDiscovery) => void;
  onClear: () => void;
  onClose: () => void;
}) {
  const [searchDraft, setSearchDraft] = useState(value.search);
  const [quantityDraft, setQuantityDraft] = useState(
    value.quantity?.toString() ?? "",
  );

  useEffect(() => setSearchDraft(value.search), [value.search]);
  useEffect(
    () => setQuantityDraft(value.quantity?.toString() ?? ""),
    [value.quantity],
  );

  const activeCount = countDiscoveryFilters(value);
  const applyQuantity = () => {
    if (!quantityDraft) {
      if (value.quantity !== null) onChange({ ...value, quantity: null });
      return;
    }
    const quantity = Number(quantityDraft);
    if (Number.isInteger(quantity) && quantity >= 1 && quantity <= 10000)
      onChange({ ...value, quantity });
  };

  return (
    <div className="catalog-filter-panel">
      <div className="catalog-filter-intro">
        <p className="eyebrow">ENCONTRE O PRESENTE CERTO</p>
        <h2>
          Refine com <em>intenção.</em>
        </h2>
        <p>
          Escolha a ocasião, o tipo de peça e a quantidade desejada. Cada
          critério usa somente informações confirmadas nesta curadoria.
        </p>
      </div>

      <form
        className="catalog-filter-search"
        onSubmit={(event) => {
          event.preventDefault();
          onSearch({ ...value, search: searchDraft.trim().slice(0, 100) });
        }}
      >
        <label htmlFor="catalog-filter-search">
          Nome, categoria ou código do produto
        </label>
        <div className="search-input">
          <Search size={20} aria-hidden="true" />
          <input
            autoFocus
            id="catalog-filter-search"
            type="search"
            placeholder="Experimente “onboarding” ou “08255”"
            value={searchDraft}
            onChange={(event) => setSearchDraft(event.target.value)}
            maxLength={100}
          />
          <button className="icon-button" aria-label="Aplicar busca">
            <ArrowRight size={24} />
          </button>
        </div>
        <div className="search-suggestions" aria-label="Sugestões de busca">
          {["Onboarding", "Caderno", "Garrafa", "Kit"].map((word) => (
            <button
              type="button"
              key={word}
              onClick={() => {
                setSearchDraft(word);
                onChange({ ...value, search: word });
              }}
            >
              {word} <ArrowRight size={13} />
            </button>
          ))}
        </div>
        <button className="button button-outline catalog-search-submit">
          Ver resultados <ArrowRight size={16} />
        </button>
      </form>

      <fieldset className="catalog-filter-section">
        <legend>Tipo de presente</legend>
        <div className="catalog-filter-options compact">
          {categories.map((category) => {
            const count = facets?.categories[category] ?? null;
            const selected = value.category === category;
            return (
              <button
                type="button"
                key={category}
                className={selected ? "selected" : ""}
                aria-pressed={selected}
                disabled={!selected && count === 0}
                onClick={() => onChange({ ...value, category })}
              >
                <span>{category}</span>
                {count !== null && <small>{count}</small>}
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset className="catalog-filter-section">
        <legend>Ocasião</legend>
        <p className="catalog-filter-help">
          Você pode combinar mais de uma ocasião.
        </p>
        <div className="catalog-filter-options occasions">
          {catalogCollections.map((collection) => {
            const selected = value.occasions.includes(collection.slug);
            const count = facets?.occasions[collection.slug] ?? null;
            return (
              <label
                key={collection.slug}
                className={selected ? "selected" : ""}
              >
                <input
                  type="checkbox"
                  checked={selected}
                  disabled={!selected && count === 0}
                  onChange={() =>
                    onChange({
                      ...value,
                      occasions: selected
                        ? value.occasions.filter(
                            (occasion) => occasion !== collection.slug,
                          )
                        : [...value.occasions, collection.slug],
                    })
                  }
                />
                <span className="filter-check" aria-hidden="true">
                  {selected && <Check size={13} />}
                </span>
                <span>
                  <strong>{collection.title}</strong>
                  <small>{collection.tags.slice(0, 2).join(" · ")}</small>
                </span>
                {count !== null && <b>{count}</b>}
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="catalog-filter-two-columns">
        <fieldset className="catalog-filter-section">
          <legend>Personalização</legend>
          <label
            className={`catalog-filter-toggle ${value.personalizable ? "selected" : ""}`}
          >
            <input
              type="checkbox"
              checked={value.personalizable}
              disabled={!value.personalizable && facets?.personalizable === 0}
              onChange={() =>
                onChange({
                  ...value,
                  personalizable: !value.personalizable,
                })
              }
            />
            <span className="filter-check" aria-hidden="true">
              {value.personalizable && <Check size={13} />}
            </span>
            <span>
              <strong>Aceita personalização</strong>
              <small>Possibilidades e condições sob consulta.</small>
            </span>
            {facets && <b>{facets.personalizable}</b>}
          </label>
        </fieldset>

        <fieldset className="catalog-filter-section">
          <legend>Quantidade desejada</legend>
          <p className="catalog-filter-help">
            Mostra peças cujo pedido mínimo cabe no seu projeto.
          </p>
          <div className="quantity-filter">
            <input
              type="number"
              inputMode="numeric"
              min="1"
              max="10000"
              step="1"
              aria-label="Quantidade desejada"
              placeholder="Ex.: 100"
              value={quantityDraft}
              onChange={(event) => setQuantityDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  applyQuantity();
                }
              }}
            />
            <button type="button" onClick={applyQuantity}>
              Aplicar
            </button>
          </div>
          <small className="catalog-filter-caveat">
            Compatibilidade com o mínimo. Disponibilidade sob consulta.
          </small>
        </fieldset>
      </div>

      <div className="catalog-filter-footer">
        <button
          type="button"
          className="catalog-filter-reset"
          onClick={onClear}
          disabled={activeCount === 0}
        >
          <RotateCcw size={15} /> Limpar {activeCount || ""}
        </button>
        <button
          type="button"
          className="button button-gold"
          onClick={onClose}
          disabled={loading}
        >
          <Sparkles size={16} />
          {loading
            ? "Atualizando…"
            : error
              ? "Revisar filtros"
              : `Ver ${resultCount} ${resultCount === 1 ? "peça" : "peças"}`}
        </button>
      </div>
    </div>
  );
}
