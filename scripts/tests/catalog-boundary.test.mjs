import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { readSourceProducts, SOURCE_COLUMNS } from "../lib/catalog-source.mjs";
import {
  CATALOG_FIELD_LIMITS,
  syncSiteCatalog,
} from "../sync-site-catalog.mjs";

const snapshot = JSON.parse(
  readFileSync(new URL("../../src/lib/products.json", import.meta.url), "utf8"),
);
const sourceHost = "doufsxqlfjyuvxuezpln.supabase.co";
const targetHost = "whwloseshzraipljisqo.supabase.co";
const env = {
  CATALOG_SOURCE_SUPABASE_URL: `https://${sourceHost}`,
  CATALOG_SOURCE_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_synthetic",
  SUPABASE_PROJECT_REF: "whwloseshzraipljisqo",
  SUPABASE_URL: `https://${targetHost}`,
  ["SUPABASE" + "_SECRET_KEY"]: "synthetic-target-credential",
};
const sourceRows = () =>
  snapshot.map((item) => ({
    id: item.id,
    sku: item.sku,
    name: item.originalName,
    min_quantity: item.minimum,
    allows_personalization: item.personalizable,
    is_active: true,
  }));
const jsonRows = (rows) =>
  Response.json(rows, {
    headers: {
      "content-range": rows.length
        ? `0-${rows.length - 1}/${rows.length}`
        : "*/0",
    },
  });

function harness({ source, existing, write } = {}) {
  const calls = [];
  const fetcher = async (input, init) => {
    const url = new URL(input);
    calls.push({ url, init });
    assert.equal(init.redirect, "error");
    if (url.hostname === sourceHost) {
      assert.equal(
        init.method,
        "GET",
        "No write may reach the operational source",
      );
      assert.equal(init.body, undefined);
      assert.equal(
        init.headers.apikey,
        env.CATALOG_SOURCE_SUPABASE_PUBLISHABLE_KEY,
      );
      assert.equal(init.headers.Authorization, undefined);
      assert.equal(url.pathname, "/rest/v1/v_products_public");
      assert.equal(url.searchParams.get("select"), SOURCE_COLUMNS);
      return source ? source() : jsonRows(sourceRows());
    }
    assert.equal(url.hostname, targetHost);
    assert.equal(url.pathname, "/rest/v1/premium_catalog_items");
    assert.equal(init.headers.apikey, env.SUPABASE_SECRET_KEY);
    if (init.method === "GET")
      return existing
        ? existing()
        : jsonRows(snapshot.map((item) => ({ id: item.id, published: true })));
    assert.equal(init.method, "POST");
    const payload = JSON.parse(init.body);
    assert.equal(payload.length, snapshot.length);
    assert.ok(payload.every((item) => !Object.hasOwn(item, "cost_price")));
    return write ? write() : Response.json(payload.map(({ id }) => ({ id })));
  };
  return { calls, fetcher };
}

test("sync reads the operational source and writes only to the premium project", async () => {
  const h = harness();
  assert.deepEqual(
    await syncSiteCatalog(snapshot, { env, fetcher: h.fetcher }),
    {
      count: 8,
      project: "whwloseshzraipljisqo",
      dryRun: false,
    },
  );
  assert.deepEqual(
    h.calls.map(({ url, init }) => `${url.hostname}:${init.method}`),
    [`${sourceHost}:GET`, `${targetHost}:GET`, `${targetHost}:POST`],
  );
});

test("dry run performs no writes in either project", async () => {
  const h = harness();
  const result = await syncSiteCatalog(snapshot, {
    env,
    fetcher: h.fetcher,
    dryRun: true,
  });
  assert.equal(result.dryRun, true);
  assert.equal(h.calls.length, 2);
  assert.ok(h.calls.every(({ init }) => init.method === "GET"));
});

const mutate = (changes, index = 0) =>
  snapshot.map((item, itemIndex) =>
    itemIndex === index ? { ...item, ...changes } : { ...item },
  );

for (const [name, candidate] of [
  ["duplicate SKU", mutate({ sku: snapshot[1].sku })],
  [
    "case-insensitive duplicate SKU",
    mutate({ sku: snapshot[1].sku.toLowerCase() }),
  ],
  ["duplicate slug", mutate({ slug: snapshot[1].slug })],
  ["invalid slug", mutate({ slug: "../catalogo-interno" })],
  ["invalid image path", mutate({ image: "/images/../private.webp" })],
  ["invalid source date", mutate({ sourceDate: "2026-02-31" })],
  ["invalid category", mutate({ category: "Interno" })],
  ["invalid minimum", mutate({ minimum: 0 })],
  ["invalid personalization", mutate({ personalizable: "yes" })],
  ["untrimmed public text", mutate({ name: ` ${snapshot[0].name}` })],
  ["oversized SKU", mutate({ sku: "S".repeat(CATALOG_FIELD_LIMITS.sku + 1) })],
  [
    "oversized slug",
    mutate({ slug: "s".repeat(CATALOG_FIELD_LIMITS.slug + 1) }),
  ],
  [
    "oversized name",
    mutate({ name: "N".repeat(CATALOG_FIELD_LIMITS.name + 1) }),
  ],
  [
    "oversized original name",
    mutate({
      originalName: "O".repeat(CATALOG_FIELD_LIMITS.originalName + 1),
    }),
  ],
  [
    "oversized tagline",
    mutate({ tagline: "T".repeat(CATALOG_FIELD_LIMITS.tagline + 1) }),
  ],
  [
    "oversized description",
    mutate({ description: "D".repeat(CATALOG_FIELD_LIMITS.description + 1) }),
  ],
  [
    "oversized image path",
    mutate({
      image: `/images/${"i".repeat(CATALOG_FIELD_LIMITS.image)}.webp`,
    }),
  ],
])
  test(`${name} is rejected before any database call`, async () => {
    const h = harness();
    await assert.rejects(
      syncSiteCatalog(candidate, { env, fetcher: h.fetcher }),
    );
    assert.equal(h.calls.length, 0);
  });

for (const url of [
  `https://${sourceHost}`,
  `https://${targetHost}.example.com`,
  `http://${targetHost}`,
  `https://${targetHost}:8443`,
  `https://user:password@${targetHost}`,
  `https://${targetHost}/other`,
  `https://${targetHost}/?redirect=${sourceHost}`,
  `https://${targetHost}/#fragment`,
])
  test(`rejects unsafe write destination: ${url}`, async () => {
    const h = harness();
    await assert.rejects(
      syncSiteCatalog(snapshot, {
        env: { ...env, SUPABASE_URL: url },
        fetcher: h.fetcher,
      }),
    );
    assert.equal(h.calls.length, 0);
  });

test("rejects operational project ref even with the premium URL", async () => {
  const h = harness();
  await assert.rejects(
    syncSiteCatalog(snapshot, {
      env: { ...env, SUPABASE_PROJECT_REF: "doufsxqlfjyuvxuezpln" },
      fetcher: h.fetcher,
    }),
  );
  assert.equal(h.calls.length, 0);
});

for (const [name, changes] of [
  ["missing public key", { CATALOG_SOURCE_SUPABASE_PUBLISHABLE_KEY: "" }],
  [
    "administrative source key",
    { CATALOG_SOURCE_SUPABASE_PUBLISHABLE_KEY: "sb_secret_synthetic" },
  ],
  [
    "legacy JWT key",
    { CATALOG_SOURCE_SUPABASE_PUBLISHABLE_KEY: "eyJsynthetic" },
  ],
  [
    "wrong source project",
    { CATALOG_SOURCE_SUPABASE_URL: `https://${targetHost}` },
  ],
  [
    "source credentials in URL",
    { CATALOG_SOURCE_SUPABASE_URL: `https://user:pass@${sourceHost}` },
  ],
  [
    "source lookalike",
    { CATALOG_SOURCE_SUPABASE_URL: `https://${sourceHost}.example.com` },
  ],
])
  test(`rejects ${name} before any network call`, async () => {
    const h = harness();
    await assert.rejects(
      syncSiteCatalog(snapshot, {
        env: { ...env, ...changes },
        fetcher: h.fetcher,
      }),
    );
    assert.equal(h.calls.length, 0);
  });

for (const [name, source] of [
  ["upstream denied", () => new Response("denied", { status: 403 })],
  ["upstream unavailable", () => new Response("down", { status: 503 })],
  [
    "upstream timeout",
    () => {
      throw new Error("synthetic timeout");
    },
  ],
  ["missing item", () => jsonRows(sourceRows().slice(1))],
  [
    "duplicate ID",
    () => {
      const rows = sourceRows();
      rows[1] = rows[0];
      return jsonRows(rows);
    },
  ],
  [
    "truncated response",
    () =>
      Response.json(sourceRows(), { headers: { "content-range": "0-7/9" } }),
  ],
  ["missing exact count", () => Response.json(sourceRows())],
  [
    "inactive item",
    () => {
      const rows = sourceRows();
      rows[0].is_active = false;
      return jsonRows(rows);
    },
  ],
  [
    "changed SKU",
    () => {
      const rows = sourceRows();
      rows[0].sku = "changed";
      return jsonRows(rows);
    },
  ],
  [
    "changed original name",
    () => {
      const rows = sourceRows();
      rows[0].name = "changed";
      return jsonRows(rows);
    },
  ],
  [
    "changed minimum",
    () => {
      const rows = sourceRows();
      rows[0].min_quantity = 100;
      return jsonRows(rows);
    },
  ],
  [
    "changed personalization",
    () => {
      const rows = sourceRows();
      rows[0].allows_personalization = false;
      return jsonRows(rows);
    },
  ],
  [
    "invalid minimum",
    () => {
      const rows = sourceRows();
      rows[0].min_quantity = 0;
      return jsonRows(rows);
    },
  ],
])
  test(`${name} stops sync before any target call`, async () => {
    const h = harness({ source });
    await assert.rejects(
      syncSiteCatalog(snapshot, { env, fetcher: h.fetcher }),
    );
    assert.equal(h.calls.length, 1);
    assert.equal(h.calls[0].url.hostname, sourceHost);
  });

test("unexpected source columns are discarded", async () => {
  const h = harness({
    source: () =>
      jsonRows(
        sourceRows().map((row) => ({
          ...row,
          cost_price: 123,
          supplier_id: "private",
        })),
      ),
  });
  const result = await readSourceProducts(
    snapshot.map((item) => item.id),
    { env, fetcher: h.fetcher },
  );
  assert.ok(
    result.every((row) => Object.keys(row).join(",") === SOURCE_COLUMNS),
  );
});

for (const [name, existing] of [
  [
    "manual unpublication",
    () =>
      jsonRows(
        snapshot.map((item, index) => ({
          id: item.id,
          published: index !== 0,
        })),
      ),
  ],
  [
    "incomplete publication state",
    () =>
      Response.json([{ id: snapshot[0].id, published: true }], {
        headers: { "content-range": "0-0/8" },
      }),
  ],
  ["failed target read", () => new Response("down", { status: 503 })],
])
  test(`${name} prevents writes`, async () => {
    const h = harness({ existing });
    await assert.rejects(
      syncSiteCatalog(snapshot, { env, fetcher: h.fetcher }),
    );
    assert.equal(h.calls.length, 2);
    assert.ok(h.calls.every(({ init }) => init.method === "GET"));
  });

test("failed write is reported and never retried against another project", async () => {
  const h = harness({
    write: () => new Response("private response body", { status: 503 }),
  });
  await assert.rejects(
    syncSiteCatalog(snapshot, { env, fetcher: h.fetcher }),
    /Catalog sync failed \(HTTP 503\)/,
  );
  assert.equal(h.calls.length, 3);
});
