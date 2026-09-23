import test from "node:test";
import assert from "node:assert/strict";
import { allowsCatalogSnapshotFallback } from "../../src/lib/runtime-environment.mjs";
import { allowsPlanningDashboard } from "../../src/lib/planning-access.mjs";

test("permite snapshot apenas fora de ambiente implantado", () => {
  assert.equal(allowsCatalogSnapshotFallback(undefined), true);
  assert.equal(allowsCatalogSnapshotFallback(""), true);
  assert.equal(allowsCatalogSnapshotFallback("development"), true);
});

for (const environment of ["preview", "production", "staging", "unknown"]) {
  test(`falha fechado no ambiente implantado ${environment}`, () => {
    assert.equal(allowsCatalogSnapshotFallback(environment), false);
  });
}

test("planejamento interno exige opt-in local explícito", () => {
  assert.equal(allowsPlanningDashboard(undefined, undefined), false);
  assert.equal(allowsPlanningDashboard("false", undefined), false);
  assert.equal(allowsPlanningDashboard("true", undefined), true);
  assert.equal(allowsPlanningDashboard("true", "development"), true);
});

for (const environment of ["preview", "production", "staging", "unknown"]) {
  test(`planejamento falha fechado no ambiente implantado ${environment}`, () => {
    assert.equal(allowsPlanningDashboard("true", environment), false);
  });
}
