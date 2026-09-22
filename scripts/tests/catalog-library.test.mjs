import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

function load(file, readCatalog) {
  const exports = {};
  const code = ts.transpileModule(readFileSync(file, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  vm.runInNewContext(code, {
    exports,
    require: (name) => {
      if (name === "@/lib/catalog-library")
        return load("src/lib/catalog-library.ts", readCatalog);
      if (name === "@/lib/site-database")
        return { getSiteCatalogPage: readCatalog };
      throw new Error(`Unexpected dependency: ${name}`);
    },
  });
  return exports;
}

const library = load("src/lib/catalog-library.ts");
const products = JSON.parse(readFileSync("src/lib/products.json", "utf8"));
const data = (read) => load("src/lib/catalog-library-data.ts", read);
const pageOf = (items) => ({ items, total: items.length, totalPages: 1 });

test("all collection links reference known products with unique stable slugs", () => {
  const slugs = new Set();
  for (const collection of library.catalogCollections) {
    assert.match(collection.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    assert.ok(!slugs.has(collection.slug));
    slugs.add(collection.slug);
    assert.ok(
      collection.productIds.length > 0 && collection.productIds.length <= 24,
    );
    assert.equal(
      new Set(collection.productIds).size,
      collection.productIds.length,
    );
    assert.ok(
      collection.productIds.every((id) =>
        products.some((product) => product.id === id),
      ),
    );
    assert.ok(
      library.catalogThemes.some((theme) => theme.id === collection.theme),
    );
  }
});

test("search combines every term with the chosen theme and ignores accents", () => {
  const found = library.filterCatalogs(
    library.catalogCollections,
    " PREMIACAO  liderança ",
    "pessoas",
  );
  assert.equal(found.length, 1);
  assert.equal(found[0].slug, "conquistas-memoraveis");
  assert.equal(
    library.filterCatalogs(library.catalogCollections, "viagem", "pessoas")
      .length,
    0,
  );
  assert.equal(library.resolveCatalogTheme("unknown"), "todos");
});

test("collection keeps editorial order and never reintroduces unpublished products", async () => {
  const ids = library.catalogCollections[0].productIds;
  const available = products
    .filter((product) => product.id === ids[2] || product.id === ids[0])
    .reverse();
  const result = await data(async (query) => {
    assert.equal(query.ids.join(","), ids.join(","));
    return pageOf(available);
  }).getCollectionProducts(ids);
  assert.equal(
    result.map((product) => product.id).join(","),
    [ids[0], ids[2]].join(","),
  );
});

test("library uses one bounded read and covers/counts only the published response", async () => {
  let calls = 0;
  const visible = products.filter(
    (product) => product.id === library.catalogCollections[0].productIds[1],
  );
  const result = await data(async (query) => {
    calls++;
    assert.ok(query.ids.length <= 24);
    assert.equal(query.pageSize, 24);
    return pageOf(visible);
  }).getCatalogLibrary();
  assert.equal(calls, 1);
  assert.equal(result[0].productCount, 1);
  assert.equal(result[0].cover.image, visible[0].image);
  for (const collection of result.filter(
    (item) => !item.productIds.includes(visible[0].id),
  )) {
    assert.equal(collection.productCount, 0);
    assert.equal(collection.cover, null);
  }
});

test("upstream failure is unavailable, never an empty or stale snapshot", async () => {
  const api = data(async () => {
    throw new Error("upstream unavailable");
  });
  const result = await api.getCatalogLibrary();
  assert.ok(
    result.every(
      (collection) =>
        collection.productCount === null && collection.cover === null,
    ),
  );
  await assert.rejects(
    api.getCollectionProducts(library.catalogCollections[0].productIds),
  );
});

test("an empty published catalog is distinct from a failure", async () => {
  const result = await data(async () => pageOf([])).getCatalogLibrary();
  assert.ok(
    result.every(
      (collection) =>
        collection.productCount === 0 && collection.cover === null,
    ),
  );
});

for (const [label, response] of [
  ["multiple pages", { items: products.slice(0, 1), total: 2, totalPages: 2 }],
  [
    "silent server limit",
    { items: products.slice(0, 1), total: 2, totalPages: 1 },
  ],
])
  test(`${label} cannot produce inaccurate library counts`, async () => {
    const api = data(async () => response);
    await assert.rejects(
      api.getCollectionProducts(library.catalogCollections[0].productIds),
    );
    const result = await api.getCatalogLibrary();
    assert.ok(result.every((collection) => collection.productCount === null));
  });

for (const [label, ids] of [
  ["empty selection", []],
  ["duplicate selection", [products[0].id, products[0].id]],
  [
    "oversized selection",
    Array.from({ length: 25 }, (_, index) => String(index)),
  ],
])
  test(`${label} is rejected before any database read`, async () => {
    let called = false;
    await assert.rejects(
      data(async () => {
        called = true;
        return pageOf(products);
      }).getCollectionProducts(ids),
    );
    assert.equal(called, false);
  });
