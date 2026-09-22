import test from "node:test";
import assert from "node:assert/strict";
import { allowsCatalogSnapshotFallback } from "../../src/lib/runtime-environment.mjs";

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
