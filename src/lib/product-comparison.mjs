export const COMPARISON_MAX_ITEMS = 3;

/**
 * Campos que a comparação destaca. A ordem é a de leitura na tela: primeiro o
 * que decide a peça, depois o que confirma a viabilidade do pedido.
 */
export const COMPARISON_ROWS = Object.freeze([
  { key: "category", label: "Categoria" },
  { key: "minimum", label: "Pedido mínimo" },
  { key: "materials", label: "Materiais" },
  { key: "dimensions", label: "Dimensões" },
  { key: "weightG", label: "Peso" },
  { key: "packaging", label: "Embalagem" },
  { key: "personalizable", label: "Personalização" },
]);

/**
 * Uma peça pode entrar na comparação quando o catálogo ainda a devolve.
 * Chamar isso antes de comparar evita montar a tela com uma peça retirada.
 */
export function canCompare(catalogIds, productId) {
  return Array.isArray(catalogIds) && catalogIds.includes(productId);
}

/**
 * Aplica a escolha do usuário ao conjunto comparado, devolvendo também o
 * motivo quando a ação é recusada, para o chamador mostrar em vez de falhar
 * em silêncio.
 */
export function toggleComparison(current, productId, catalogIds) {
  const items = Array.isArray(current) ? current.filter(Boolean) : [];
  if (!productId) {
    return { items, accepted: false, reason: "invalid" };
  }
  if (items.includes(productId)) {
    return {
      items: items.filter((id) => id !== productId),
      accepted: true,
      reason: "removed",
    };
  }
  if (!canCompare(catalogIds, productId)) {
    return { items, accepted: false, reason: "unavailable" };
  }
  if (items.length >= COMPARISON_MAX_ITEMS) {
    return { items, accepted: false, reason: "full" };
  }
  return { items: [...items, productId], accepted: true, reason: "added" };
}

/** Mensagem exata do motivo recusado, para a tela não inventar texto. */
export function comparisonRefusalMessage(reason, max = COMPARISON_MAX_ITEMS) {
  if (reason === "full")
    return `A comparação mostra no máximo ${max} peças. Remova uma para comparar outra.`;
  if (reason === "unavailable")
    return "Essa peça não está mais disponível na curadoria e não pode ser comparada.";
  if (reason === "invalid")
    return "Escolha uma peça da curadoria para comparar.";
  return "";
}

function normalizeText(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLocaleLowerCase("pt-BR");
}

function cell(value, kind) {
  if (kind === "minimum") {
    return Number.isFinite(value) && value > 0
      ? { text: `${value} un.`, missing: false, value }
      : { text: "Não informado", missing: true, value: null };
  }
  if (kind === "weightG") {
    return Number.isFinite(value) && value > 0
      ? { text: `${value} g`, missing: false, value }
      : { text: "Não informado", missing: true, value: null };
  }
  if (kind === "personalizable") {
    if (typeof value !== "boolean")
      return { text: "Não informado", missing: true, value: null };
    return {
      text: value ? "Sim, sob consulta" : "Não prevista",
      missing: false,
      value,
    };
  }
  if (kind === "materials") {
    const list = Array.isArray(value)
      ? value.filter((item) => typeof item === "string" && item.trim())
      : [];
    return list.length
      ? { text: list.join(" · "), missing: false, value: list }
      : { text: "Não informado", missing: true, value: null };
  }
  const text = typeof value === "string" ? value.trim() : "";
  return text
    ? { text, missing: false, value: text }
    : { text: "Não informado", missing: true, value: null };
}

function comparableKey(cellValue, kind) {
  if (cellValue.missing) return null;
  if (kind === "materials") return normalizeText(cellValue.value.join(" "));
  if (kind === "personalizable") return cellValue.value ? "sim" : "nao";
  return normalizeText(cellValue.text);
}

/**
 * Monta a matriz da tela a partir dos produtos que o catálogo devolveu.
 *
 * Regras de honestidade que os testes cobrem:
 * - dado ausente nunca vira atributo positivo ("Não prevista" so para booleano
 *   falso, "Não informado" para o resto);
 * - a linha so e marcada como diferente quando todas as peças tem o dado, para
 *   a tela não destacar diferença onde há apenas falta de cadastro;
 * - a peça retirada do catálogo aparece como indisponível, nunca omitida.
 */
export function buildComparisonMatrix(items, products) {
  const list = Array.isArray(items) ? items.filter(Boolean) : [];
  const byId = new Map(
    (Array.isArray(products) ? products : [])
      .filter((product) => product && product.id)
      .map((product) => [product.id, product]),
  );
  const columns = list.map((id) => {
    const product = byId.get(id);
    if (!product) {
      return {
        id,
        available: false,
        name: "Peça indisponível",
        sku: null,
        image: null,
        slug: null,
      };
    }
    return {
      id,
      available: true,
      name: String(product.name ?? ""),
      sku: typeof product.sku === "string" ? product.sku : null,
      image: typeof product.image === "string" ? product.image : null,
      slug: typeof product.slug === "string" ? product.slug : null,
    };
  });
  const rows = COMPARISON_ROWS.map(({ key, label }) => {
    const cells = columns.map((column) => {
      const product = byId.get(column.id);
      if (!product) return { text: "Indisponível", missing: true, value: null };
      return cell(product[key], key);
    });
    const keys = cells.map((entry) => comparableKey(entry, key));
    const comparable = keys.every((entry) => entry !== null);
    return {
      key,
      label,
      cells,
      comparable,
      different: comparable && keys.length > 1 && new Set(keys).size > 1,
    };
  });
  return {
    columns,
    rows,
    availableCount: columns.filter((column) => column.available).length,
    hasMissingData: rows.some((row) =>
      row.cells.some((entry) => entry.missing),
    ),
    hasDifference: rows.some((row) => row.different),
  };
}
