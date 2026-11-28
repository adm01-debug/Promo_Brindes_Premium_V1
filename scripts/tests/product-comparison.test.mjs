import assert from "node:assert/strict";
import test from "node:test";
import {
  COMPARISON_MAX_ITEMS,
  buildComparisonMatrix,
  canCompare,
  comparisonRefusalMessage,
  toggleComparison,
} from "../../src/lib/product-comparison.mjs";

const A = {
  id: "a",
  name: "Caneca A",
  sku: "SKU-A",
  category: "Escritorio",
  minimum: 25,
  materials: ["Ceramica"],
  dimensions: "9 x 8 cm",
  weightG: 320,
  packaging: "Caixa de presente",
  personalizable: true,
};
const B = {
  id: "b",
  name: "Caneca B",
  sku: "SKU-B",
  category: "Escritorio",
  minimum: 25,
  materials: ["Ceramica"],
  dimensions: "9 x 8 cm",
  weightG: null,
  packaging: null,
  personalizable: false,
};

test("comparacao aceita ate o limite e recusa com motivo", () => {
  assert.equal(COMPARISON_MAX_ITEMS, 3);
  let state = [];
  for (const id of ["a", "b", "c"]) {
    const step = toggleComparison(state, id, ["a", "b", "c", "d"]);
    assert.equal(step.accepted, true);
    assert.equal(step.reason, "added");
    state = step.items;
  }
  assert.deepEqual(state, ["a", "b", "c"]);
  const full = toggleComparison(state, "d", ["a", "b", "c", "d"]);
  assert.equal(full.accepted, false);
  assert.equal(full.reason, "full");
  assert.deepEqual(full.items, state);
  assert.match(comparisonRefusalMessage(full.reason), /no maximo 3 pecas|máximo 3 peças/);
});

test("peca fora do catalogo nao entra e diz o motivo", () => {
  const refused = toggleComparison([], "zzz", ["a", "b"]);
  assert.equal(refused.accepted, false);
  assert.equal(refused.reason, "unavailable");
  assert.deepEqual(refused.items, []);
  assert.equal(canCompare(["a"], "a"), true);
  assert.equal(canCompare(["a"], "b"), false);
  assert.equal(canCompare(undefined, "a"), false);
  assert.ok(comparisonRefusalMessage(refused.reason).length > 0);
});

test("remover devolve o conjunto sem a peca e nao depende do catalogo", () => {
  const removed = toggleComparison(["a", "b"], "a", []);
  assert.equal(removed.accepted, true);
  assert.equal(removed.reason, "removed");
  assert.deepEqual(removed.items, ["b"]);
});

test("matriz so marca diferenca quando as duas pecas tem o dado", () => {
  const matrix = buildComparisonMatrix(["a", "b"], [A, B]);
  const byKey = Object.fromEntries(matrix.rows.map((row) => [row.key, row]));
  assert.equal(matrix.columns.length, 2);
  assert.equal(matrix.availableCount, 2);
  assert.equal(byKey.category.different, false);
  assert.equal(byKey.minimum.different, false);
  assert.equal(byKey.personalizable.different, true);
  assert.equal(byKey.weightG.different, false);
  assert.equal(byKey.weightG.comparable, false);
  assert.equal(byKey.weightG.cells[1].text, "N\u00e3o informado");
  assert.equal(byKey.weightG.cells[1].missing, true);
  assert.equal(byKey.packaging.cells[0].text, "Caixa de presente");
  assert.equal(matrix.hasMissingData, true);
});

test("dado ausente nunca vira atributo positivo", () => {
  const matrix = buildComparisonMatrix(["a"], [
    { ...A, personalizable: undefined, materials: [], dimensions: null, minimum: null, weightG: null, packaging: "" },
  ]);
  for (const row of matrix.rows) {
    if (row.key === "category") continue;
    assert.equal(row.cells[0].missing, true, row.key);
    assert.equal(row.cells[0].text, "N\u00e3o informado", row.key);
  }
  assert.notEqual(matrix.rows.find((row) => row.key === "personalizable").cells[0].text, "N\u00e3o prevista");
});

test("peca retirada do catalogo aparece indisponivel sem sumir", () => {
  const matrix = buildComparisonMatrix(["a", "gone"], [A]);
  assert.equal(matrix.columns.length, 2);
  assert.equal(matrix.availableCount, 1);
  assert.equal(matrix.columns[1].available, false);
  assert.equal(matrix.columns[1].name, "Pe\u00e7a indispon\u00edvel");
  assert.equal(matrix.rows[0].cells[1].text, "Indispon\u00edvel");
  assert.equal(matrix.rows[0].comparable, false);
});

test("matriz vazia nao quebra", () => {
  const matrix = buildComparisonMatrix([], undefined);
  assert.deepEqual(matrix.columns, []);
  assert.equal(matrix.rows.length, 7);
  assert.equal(matrix.availableCount, 0);
  assert.equal(matrix.hasDifference, false);
});
