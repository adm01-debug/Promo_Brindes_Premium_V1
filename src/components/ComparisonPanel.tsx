"use client";
import Image from "next/image";
import { GitCompareArrows, Gift, Trash2 } from "lucide-react";
import Modal from "@/components/Modal";
import { COMPARISON_MAX_ITEMS, buildComparisonMatrix } from "@/lib/product-comparison.mjs";

type ComparisonProduct = {
  id: string;
  name: string;
  sku?: string | null;
  image?: string | null;
  slug?: string | null;
  category?: string | null;
  minimum?: number | null;
  materials?: string[] | null;
  dimensions?: string | null;
  weightG?: number | null;
  packaging?: string | null;
  personalizable?: boolean | null;
};

type ComparisonColumn = { id: string; available: boolean; name: string; sku: string | null; image: string | null; slug: string | null };
type ComparisonCell = { text: string; missing: boolean; value: unknown };
type ComparisonRow = { key: string; label: string; cells: ComparisonCell[]; comparable: boolean; different: boolean };

type Props = {
  items: string[];
  products: ComparisonProduct[];
  imageUnavailable: (src: string) => boolean;
  onToggle: (productId: string) => void;
  onClear: () => void;
  onClose: () => void;
};

export default function ComparisonPanel({
  items,
  products,
  imageUnavailable,
  onToggle,
  onClear,
  onClose,
}: Props) {
  const matrix = buildComparisonMatrix(items, products);
  return (
    <Modal
      title="Comparação de peças"
      onClose={onClose}
      className="comparison-modal"
    >
      <p className="eyebrow">DECISÃO LADO A LADO</p>
      <h2>
        Até {COMPARISON_MAX_ITEMS} peças, <em>sem adivinhação.</em>
      </h2>
      <p className="comparison-intro">
        O que o catálogo não informa aparece como <strong>Não informado</strong>.
        Só marcamos diferença quando as duas peças têm o dado cadastrado.
      </p>
      {matrix.columns.length === 0 ? (
        <p className="comparison-empty">
          Nenhuma peça na comparação. Use “Comparar” nos cartões da curadoria.
        </p>
      ) : (
        <>
          <div
            className="comparison-scroll"
            role="region"
            aria-label="Tabela de comparação"
            tabIndex={0}
          >
            <table className="comparison-table">
              <caption className="sr-only">
                Comparação de {matrix.columns.length} peças por atributo
              </caption>
              <thead>
                <tr>
                  <th scope="col">Atributo</th>
                  {matrix.columns.map((column: ComparisonColumn) => (
                    <th scope="col" key={column.id}>
                      <div className="comparison-head">
                        {column.available && column.image ? (
                          imageUnavailable(column.image) ? (
                            <span
                              className="media-fallback comparison-media-fallback"
                              role="img"
                              aria-label={`Imagem de ${column.name} temporariamente indisponível`}
                            >
                              <Gift aria-hidden="true" size={18} />
                            </span>
                          ) : (
                            <Image
                              src={column.image}
                              alt=""
                              width={72}
                              height={72}
                            />
                          )
                        ) : (
                          <span
                            className="media-fallback comparison-media-fallback"
                            role="img"
                            aria-label="Imagem indisponível"
                          >
                            <Gift aria-hidden="true" size={18} />
                          </span>
                        )}
                        <strong>{column.name}</strong>
                        {column.sku && <small>REF. {column.sku}</small>}
                        {!column.available && (
                          <small className="comparison-warning">
                            Fora da curadoria atual
                          </small>
                        )}
                        <button
                          type="button"
                          className="comparison-remove"
                          onClick={() => onToggle(column.id)}
                          aria-label={`Remover ${column.name} da comparação`}
                        >
                          <Trash2 size={13} aria-hidden="true" /> Remover
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {matrix.rows.map((row: ComparisonRow) => (
                  <tr
                    key={row.key}
                    className={row.different ? "is-different" : undefined}
                  >
                    <th scope="row">
                      {row.label}
                      {row.different && (
                        <span className="sr-only"> (diferente entre as peças)</span>
                      )}
                    </th>
                    {row.cells.map((entry: ComparisonCell, index: number) => (
                      <td
                        key={matrix.columns[index].id}
                        data-missing={entry.missing ? "true" : undefined}
                      >
                        {entry.text}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {matrix.availableCount < matrix.columns.length && (
            <p className="comparison-note" role="status">
              Uma ou mais peças saíram da curadoria. Elas continuam listadas
              como indisponíveis até você removê-las.
            </p>
          )}
          <div className="comparison-actions">
            <button type="button" className="ghost" onClick={onClear}>
              Limpar comparação
            </button>
            <button type="button" onClick={onClose}>
              Voltar à curadoria
            </button>
          </div>
        </>
      )}
    </Modal>
  );
}

export function ComparisonTray({
  count,
  onOpen,
  onClear,
}: {
  count: number;
  onOpen: () => void;
  onClear: () => void;
}) {
  if (!count) return null;
  return (
    <div className="comparison-tray" role="region" aria-label="Comparação">
      <span>
        <GitCompareArrows size={15} aria-hidden="true" /> {count} na comparação
      </span>
      <button type="button" onClick={onOpen}>
        Comparar
      </button>
      <button type="button" className="ghost" onClick={onClear}>
        Limpar
      </button>
    </div>
  );
}
