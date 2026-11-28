import assert from "node:assert/strict";
import test from "node:test";
import {
  PREMIUM_SYNONYMS,
  describeExpansion,
  expandSearchQuery,
  normalizeSearchTerm,
  searchTextMatches,
} from "../../src/lib/search-synonyms.mjs";

const vocabulary = new Set(["caneca", "ceramica", "garrafa", "termica"]);

test("consulta composta preserva os grupos de palavras", () => {
  const expansion = expandSearchQuery("canecas vidro", vocabulary);
  assert.equal(expansion.groups.length, 2);
  assert.deepEqual(expansion.groups[0], ["canecas", "caneca", "xicara", "copo"]);
  assert.deepEqual(expansion.groups[1], ["vidro"]);
  assert.equal(expansion.expanded, true);
});

test("termo existente no catalogo nao e expandido", () => {
  const expansion = expandSearchQuery("caneca", vocabulary);
  assert.deepEqual(expansion.groups, [["caneca"]]);
  assert.equal(expansion.expanded, false);
  assert.equal(describeExpansion(expansion), "");
});

test("palavra fora do catalogo usa sinonimo premium", () => {
  const expansion = expandSearchQuery("xicaras", vocabulary);
  assert.ok(expansion.groups[0].includes("caneca"));
});

test("todas as chaves do dicionario apontam para termos normalizados", () => {
  for (const [key, values] of Object.entries(PREMIUM_SYNONYMS)) {
    assert.equal(key, normalizeSearchTerm(key));
    assert.ok(values.length > 0);
    for (const value of values) assert.equal(value, normalizeSearchTerm(value));
  }
});

test("consulta vazia ou somente numeros nao quebra", () => {
  assert.deepEqual(expandSearchQuery("", vocabulary).groups, []);
  assert.deepEqual(expandSearchQuery("   ", vocabulary).groups, []);
  assert.deepEqual(expandSearchQuery("08255", vocabulary).groups, [["08255"]]);
});

test("grupo casa quando qualquer alternativa aparece no texto", () => {
  const groups = [["xicaras", "caneca"], ["vidro"]];
  assert.equal(searchTextMatches("caneca de vidro", groups), true);
  assert.equal(searchTextMatches("caneca de ceramica", groups), false);
});

test("descricao explica a expansao aplicada", () => {
  const text = describeExpansion(expandSearchQuery("brindes", vocabulary));
  assert.match(text, /brindes → brinde, kit, presente/);
});