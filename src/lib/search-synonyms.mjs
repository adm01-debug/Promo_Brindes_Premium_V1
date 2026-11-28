/**
 * Expansão de busca por sinônimos premium (APV1-04).
 *
 * Regras:
 * - cada palavra da consulta é expandida isoladamente, então consultas
 *   compostas preservam seus grupos ("caneca vidro" continua sendo duas
 *   palavras que precisam casar);
 * - termo que já existe no vocabulário nunca é expandido, garantindo que o
 *   resultado exato sempre vença;
 * - expansão ambígua (mais de um grupo com o mesmo termo) é descartada em vez
 *   de corrigir a intenção silenciosamente.
 */

/** Termos que compradores usam e que o catálogo não escreve igual. */
export const PREMIUM_SYNONYMS = {
  canecas: ["caneca", "xicara", "copo"],
  xicaras: ["xicara", "caneca", "copo"],
  copos: ["copo", "caneca", "garrafa"],
  garrafas: ["garrafa", "squeeze", "copo"],
  squezes: ["squeeze", "garrafa"],
  squeezes: ["squeeze", "garrafa"],
  garrafinhas: ["garrafa", "squeeze"],
  cadernos: ["caderno", "notebook", "agenda"],
  agendas: ["agenda", "caderno", "notebook"],
  notebooks: ["notebook", "caderno", "agenda"],
  blocos: ["bloco", "caderno", "agenda"],
  mochilas: ["mochila", "bolsa", "necessaire"],
  bolsas: ["bolsa", "mochila", "necessaire"],
  estojos: ["estojo", "necessaire", "bolsa"],
  canetas: ["caneta", "lapiseira", "marcador"],
  lapiseiras: ["lapiseira", "caneta"],
  chaveiros: ["chaveiro", "porta-chaves", "chave"],
  brinde: ["brinde", "kit", "presente"],
  brindes: ["brinde", "kit", "presente"],
  presente: ["presente", "kit", "brinde"],
  presentes: ["presente", "kit", "brinde"],
  lembrancinha: ["lembranca", "presente", "kit"],
  lembrancinhas: ["lembranca", "presente", "kit"],
  corporativo: ["corporativo", "executivo", "empresa"],
  corporativa: ["corporativo", "executivo", "empresa"],
  executivo: ["executivo", "premium", "corporativo"],
  luxo: ["premium", "executivo"],
  sofisticado: ["premium", "executivo"],
  cafe: ["cafe", "gourmet"],
  cha: ["cha", "bambu"],
};

const STOP_WORDS = new Set(["de", "da", "do", "das", "dos", "para", "pra", "com"]);

export function normalizeSearchTerm(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR")
    .trim();
}

/**
 * Expande uma consulta usando sinônimos premium.
 * @returns {{
 *   groups: string[][],
 *   expanded: boolean,
 *   terms: { term: string, alternatives: string[] }[]
 * }}
 */
export function expandSearchQuery(query, vocabulary) {
  const words = normalizeSearchTerm(query).split(/\s+/).filter(Boolean);
  const known = new Set(
    Array.from(vocabulary ?? [], (token) => normalizeSearchTerm(token)).filter(
      Boolean,
    ),
  );
  let expanded = false;
  const terms = words.map((word) => {
    if (STOP_WORDS.has(word) || /\d/.test(word) || known.has(word))
      return { term: word, alternatives: [word] };
    const alternatives = dedupe([
      word,
      ...(PREMIUM_SYNONYMS[word] ?? []).map(normalizeSearchTerm),
    ]);
    if (alternatives.length > 1) expanded = true;
    return { term: word, alternatives };
  });
  return { groups: terms.map((entry) => entry.alternatives), expanded, terms };
}

function dedupe(values) {
  const seen = new Set();
  const out = [];
  for (const value of values)
    if (value && !seen.has(value)) {
      seen.add(value);
      out.push(value);
    }
  return out;
}

/**
 * Aplica a expansão a um texto já normalizado: um grupo casa quando qualquer
 * uma de suas alternativas aparece no texto.
 */
export function searchTextMatches(text, groups) {
  const haystack = normalizeSearchTerm(text);
  return groups.every((group) =>
    group.some((alternative) => haystack.includes(alternative)),
  );
}

/** Frase curta para a UI explicar o que foi considerado. */
export function describeExpansion(expansion) {
  const parts = expansion.groups
    .filter((group) => group.length > 1)
    .map((group) => `${group[0]} → ${group.slice(1).join(", ")}`);
  return parts.length ? parts.join(" · ") : "";
}