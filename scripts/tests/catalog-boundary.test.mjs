import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  countActiveSourceProducts,
  readSourceProducts,
  SOURCE_COLUMNS,
} from "../lib/catalog-source.mjs";
import {
  CATALOG_FIELD_LIMITS,
  readSyncState,
  recordSyncState,
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
    materials: item.materials,
    dimensions_display: item.dimensions,
    weight_g: item.weightG,
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
  // editorial_order is unique for the whole table, so the fake target mirrors the
  // constraint for every single statement: a write in the wrong order has to fail
  // here exactly like it fails against Postgres.
  const storefront = new Map();
  const holds = (id, order) =>
    order !== undefined &&
    [...storefront].some(
      ([otherId, held]) => held === order && otherId !== id,
    );
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
    if (init.method === "GET") {
      assert.equal(
        url.searchParams.get("select"),
        "id,published,editorial_order",
      );
      assert.equal(url.searchParams.get("order"), "editorial_order.asc");
      assert.equal(init.headers.Prefer, "count=exact");
      const response = existing
        ? existing()
        : jsonRows(
            snapshot.map((item, index) => ({
              id: item.id,
              published: true,
              editorial_order: index + 1,
            })),
          );
      if (response.ok)
        for (const row of await response.clone().json())
          storefront.set(row.id, row.editorial_order);
      return response;
    }
    assert.equal(url.searchParams.get("select"), "id");
    if (init.method === "PATCH") {
      const id = url.searchParams.get("id").replace(/^eq\./, "");
      const fields = JSON.parse(init.body);
      assert.ok(!Object.hasOwn(fields, "id"), "a patch must not rewrite the id");
      assert.ok(
        !Object.hasOwn(fields, "published"),
        "a patch must leave the publication decision untouched",
      );
      assert.ok(!Object.hasOwn(fields, "cost_price"));
      if (holds(id, fields.editorial_order))
        return Response.json({ code: "23505" }, { status: 409 });
      if (fields.editorial_order !== undefined)
        storefront.set(id, fields.editorial_order);
      return write ? write() : Response.json([{ id }]);
    }
    assert.equal(init.method, "POST");
    const rows = JSON.parse(init.body);
    assert.ok(rows.every((item) => !Object.hasOwn(item, "cost_price")));
    assert.ok(
      rows.every((item) => Object.hasOwn(item, "published")),
      "an insert must carry published for every row it sends",
    );
    assert.equal(
      new Set(rows.map((row) => Object.keys(row).sort().join(","))).size,
      1,
      "PostgREST rejects a batch whose rows do not share the same keys",
    );
    const orders = rows.map((row) => row.editorial_order);
    assert.equal(
      new Set(orders).size,
      orders.length,
      "a single insert statement cannot hold two rows at the same editorial_order",
    );
    if (rows.some((row) => holds(row.id, row.editorial_order)))
      return Response.json({ code: "23505" }, { status: 409 });
    for (const row of rows) storefront.set(row.id, row.editorial_order);
    return write ? write() : Response.json(rows.map(({ id }) => ({ id })));
  };
  return { calls, fetcher, storefront };
}

test("the fake storefront rejects one insert batch with a repeated editorial_order", async () => {
  const h = harness();
  const post = (rows) =>
    h.fetcher(
      new URL(
        `https://${targetHost}/rest/v1/premium_catalog_items?select=id&on_conflict=id`,
      ),
      {
        method: "POST",
        redirect: "error",
        headers: {
          apikey: env["SUPABASE" + "_SECRET_KEY"],
          Prefer: "resolution=merge-duplicates,return=representation",
        },
        body: JSON.stringify(rows),
      },
    );
  const row = (index, editorialOrder) => ({
    id: snapshot[index].id,
    published: true,
    editorial_order: editorialOrder,
  });
  await assert.rejects(
    post([row(0, 1), row(1, 1)]),
    /cannot hold two rows at the same editorial_order/,
    "Postgres rejects the whole statement, so the fake storefront must too",
  );
  assert.equal(
    h.storefront.size,
    0,
    "a rejected statement must leave no row behind",
  );
  const accepted = await post([row(2, 1), row(3, 2)]);
  assert.equal(accepted.status, 200);
  assert.equal(h.storefront.size, 2);
});

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
    [
      `${sourceHost}:GET`,
      `${targetHost}:GET`,
      ...snapshot.map(() => `${targetHost}:PATCH`),
    ],
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

test("reordering the published order parks the old order before rewriting it", async () => {
  const h = harness({
    existing: () =>
      jsonRows(
        snapshot.map((item, index) => ({
          id: item.id,
          published: true,
          editorial_order: snapshot.length - index,
        })),
      ),
  });
  assert.deepEqual(
    await syncSiteCatalog(snapshot, { env, fetcher: h.fetcher }),
    { count: snapshot.length, project: "whwloseshzraipljisqo", dryRun: false },
  );
  const writes = h.calls.filter(({ init }) => init.method !== "GET");
  assert.equal(
    writes.length,
    snapshot.length * 2,
    "the old editorial order must be parked first",
  );
  assert.ok(writes.every(({ init }) => init.method === "PATCH"));
  const read = ({ url, init }) => [
    url.searchParams.get("id").replace(/^eq\./, ""),
    JSON.parse(init.body),
  ];
  const parked = new Map(writes.slice(0, snapshot.length).map(read));
  const final = new Map(writes.slice(snapshot.length).map(read));
  assert.deepEqual(
    writes
      .slice(0, snapshot.length)
      .map(({ init }) => Object.keys(JSON.parse(init.body))),
    snapshot.map(() => ["editorial_order"]),
    "parking only moves the position",
  );
  assert.deepEqual(
    [...final.values()].map((fields) => fields.editorial_order),
    snapshot.map((_, index) => index + 1),
  );
  assert.ok(
    [...parked.values()].every(
      (fields) => fields.editorial_order > snapshot.length,
    ),
    "parked rows must leave the target range free",
  );
  const sequence = (rows) =>
    [...rows.keys()].sort(
      (left, right) =>
        rows.get(left).editorial_order - rows.get(right).editorial_order,
    );
  assert.deepEqual(
    sequence(parked),
    sequence(final),
    "an interrupted run must still read in the target order",
  );
});

test("a manual unpublication that races the read is never republished", async () => {
  const h = harness({
    existing: () =>
      jsonRows(
        snapshot.map((item, index) => ({
          id: item.id,
          published: true,
          editorial_order: index + 1,
        })),
      ),
  });
  await syncSiteCatalog(snapshot, { env, fetcher: h.fetcher });
  const writes = h.calls.filter(({ init }) => init.method !== "GET");
  assert.equal(
    writes.length,
    snapshot.length,
    "an unchanged order must not park anything",
  );
  assert.ok(writes.every(({ init }) => init.method === "PATCH"));
  for (const { init } of writes) {
    const fields = JSON.parse(init.body);
    for (const key of [
      "sku",
      "slug",
      "name",
      "original_name",
      "category",
      "tagline",
      "description",
      "image_path",
      "minimum",
      "personalizable",
      "source_date",
      "materials",
      "dimensions",
      "weight_g",
      "packaging",
      "editorial_order",
    ])
      assert.ok(
        Object.hasOwn(fields, key),
        `${key} must be refreshed so the row stays complete`,
      );
  }
});

test("a newly curated product is still published while known ones are not", async () => {
  const known = snapshot.slice(0, snapshot.length - 1);
  const h = harness({
    existing: () =>
      jsonRows(
        known.map((item, index) => ({
          id: item.id,
          published: true,
          editorial_order: index + 1,
        })),
      ),
  });
  await syncSiteCatalog(snapshot, { env, fetcher: h.fetcher });
  const inserts = h.calls.filter(({ init }) => init.method === "POST");
  const updates = h.calls.filter(({ init }) => init.method === "PATCH");
  assert.equal(
    updates.length,
    known.length,
    "known products are refreshed in place",
  );
  assert.equal(inserts.length, 1, "new products go out as a single batch");
  const inserted = JSON.parse(inserts[0].init.body);
  assert.deepEqual(
    inserted.map((row) => row.id),
    [snapshot[snapshot.length - 1].id],
  );
  assert.equal(inserted[0].published, true);
  assert.equal(inserted[0].editorial_order, snapshot.length);
  assert.deepEqual(
    Object.keys(inserted[0]).sort(),
    [
      "category",
      "description",
      "dimensions",
      "editorial_order",
      "id",
      "image_path",
      "materials",
      "minimum",
      "name",
      "original_name",
      "packaging",
      "personalizable",
      "published",
      "sku",
      "slug",
      "source_date",
      "tagline",
      "weight_g",
    ].sort(),
    "the insert must carry every column the table requires",
  );
});

test("a reordered storefront still accepts a new product", async () => {
  const known = snapshot.slice(0, snapshot.length - 1);
  const h = harness({
    existing: () =>
      jsonRows(
        known.map((item, index) => ({
          id: item.id,
          published: true,
          editorial_order: known.length - index,
        })),
      ),
  });
  assert.deepEqual(await syncSiteCatalog(snapshot, { env, fetcher: h.fetcher }), {
    count: snapshot.length,
    project: "whwloseshzraipljisqo",
    dryRun: false,
  });
  const writes = h.calls.filter(({ init }) => init.method !== "GET");
  assert.deepEqual(
    writes.map(({ init }) => init.method),
    [...known.map(() => "PATCH"), ...known.map(() => "PATCH"), "POST"],
    "park, rewrite, then insert the newcomer last",
  );
  assert.ok(
    writes
      .slice(0, known.length)
      .every(({ init }) => JSON.parse(init.body).editorial_order > snapshot.length),
    "the newcomer's position must stay free until the end",
  );
  const inserted = JSON.parse(writes[writes.length - 1].init.body);
  assert.equal(inserted[0].editorial_order, snapshot.length);
  assert.equal(inserted[0].published, true);
});

test("a product outside the curation never blocks the positions it holds", async () => {
  const departed = {
    id: "00000000-0000-4000-8000-000000000000",
    published: true,
    editorial_order: 3,
  };
  const kept = snapshot
    .map((item, index) => ({
      id: item.id,
      published: true,
      editorial_order: index + 1,
    }))
    .filter((item) => item.editorial_order !== departed.editorial_order);
  const h = harness({ existing: () => jsonRows([...kept, departed]) });
  assert.deepEqual(await syncSiteCatalog(snapshot, { env, fetcher: h.fetcher }), {
    count: snapshot.length,
    project: "whwloseshzraipljisqo",
    dryRun: false,
  });
  const writes = h.calls.filter(({ init }) => init.method !== "GET");
  const assigned = writes.flatMap(({ url, init }) =>
    init.method === "POST"
      ? JSON.parse(init.body).map((row) => [row.id, row.editorial_order])
      : [
          [
            url.searchParams.get("id").replace(/^eq\./, ""),
            JSON.parse(init.body).editorial_order,
          ],
        ],
  );
  assert.equal(
    new Set(assigned.map(([, order]) => order)).size,
    assigned.length,
    "no two rows may be written to the same position",
  );
  assert.ok(
    !assigned.some(([id]) => id === departed.id),
    "a product outside the curation must never be rewritten",
  );
  assert.ok(
    !assigned.some(([, order]) => order === departed.editorial_order),
    "the position held by that product must stay untouched",
  );
  const inserted = writes.filter(({ init }) => init.method === "POST");
  assert.equal(inserted.length, 1, "the replaced product is inserted once");
  assert.equal(
    JSON.parse(inserted[0].init.body)[0].editorial_order,
    4,
    "the newcomer takes the first free position in the curation order",
  );
  const expected = [];
  for (let candidate = 1; expected.length < snapshot.length; candidate += 1)
    if (candidate !== departed.editorial_order) expected.push(candidate);
  assert.deepEqual(
    snapshot.map((item) => h.storefront.get(item.id)),
    expected,
    "every curated product ends on a free position, in curation order",
  );
  assert.equal(
    h.storefront.get(departed.id),
    departed.editorial_order,
    "the product outside the curation keeps the position it already had",
  );
});

test("a storefront with a product outside the curation converges on the next run", async () => {
  const departed = {
    id: "00000000-0000-4000-8000-000000000000",
    published: true,
    editorial_order: 3,
  };
  const settled = snapshot.map((item, index) => ({
    id: item.id,
    published: true,
    editorial_order: [1, 2, 4, 5, 6, 7, 8, 9][index],
  }));
  const h = harness({ existing: () => jsonRows([...settled, departed]) });
  await syncSiteCatalog(snapshot, { env, fetcher: h.fetcher });
  const writes = h.calls.filter(({ init }) => init.method !== "GET");
  assert.equal(
    writes.length,
    snapshot.length,
    "a settled storefront is refreshed without any parking",
  );
  assert.ok(writes.every(({ init }) => init.method === "PATCH"));
  assert.deepEqual(
    snapshot.map((item) => h.storefront.get(item.id)),
    settled.map((item) => item.editorial_order),
    "a settled storefront is rewritten in place, without touching the gaps",
  );
  assert.equal(h.storefront.get(departed.id), departed.editorial_order);
});

test("counts the complete active public source separately from the curated IDs", async () => {
  let calls = 0;
  const count = await countActiveSourceProducts({
    env,
    fetcher: async (input, init) => {
      calls += 1;
      const url = new URL(input);
      assert.equal(url.hostname, sourceHost);
      assert.equal(url.pathname, "/rest/v1/v_products_public");
      assert.equal(url.searchParams.get("select"), "id");
      assert.equal(url.searchParams.get("is_active"), "eq.true");
      assert.equal(url.searchParams.get("limit"), "1");
      assert.equal(init.method, "GET");
      assert.equal(init.body, undefined);
      assert.equal(init.redirect, "error");
      assert.equal(init.headers.Prefer, "count=exact");
      return Response.json([{ id: snapshot[0].id }], {
        status: 206,
        headers: { "content-range": "0-0/7678" },
      });
    },
  });
  assert.equal(count, 7678);
  assert.equal(calls, 1);
});

test("accepts an exact empty active source count", async () => {
  const count = await countActiveSourceProducts({
    env,
    fetcher: async () =>
      Response.json([], { headers: { "content-range": "*/0" } }),
  });
  assert.equal(count, 0);
});

test("rejects a source count without an exact content range", async () => {
  await assert.rejects(
    countActiveSourceProducts({
      env,
      fetcher: async () => Response.json([{ id: snapshot[0].id }]),
    }),
    /count is missing/,
  );
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
  ["untrimmed material", mutate({ materials: [" Algodão"] })],
  ["blank material", mutate({ materials: [""] })],
  ["one character dimensions", mutate({ dimensions: "x" })],
  ["one character packaging", mutate({ packaging: "x" })],
  [
    "too many materials",
    mutate({ materials: ["A", "B", "C", "D", "E", "F"] }),
  ],
  ["missing dimensions", mutate({ dimensions: undefined })],
  ["untrimmed packaging", mutate({ packaging: "Caixa " })],
  ["fractional weight", mutate({ weightG: 12.5 })],
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

for (const [name, changes, sourceMaterials] of [
  ["an empty material list", { materials: [] }, []],
  ["a null material list", { materials: [] }, null],
  [
    "a pending technical sheet",
    { materials: [], dimensions: null, weightG: null, packaging: null },
    null,
  ],
])
  test(`sync publishes ${name} from the source`, async () => {
    const curated = mutate(changes);
    const h = harness({
      source: () => {
        const rows = sourceRows();
        rows[0].materials = sourceMaterials;
        rows[0].dimensions_display = curated[0].dimensions;
        rows[0].weight_g = curated[0].weightG;
        return jsonRows(rows);
      },
    });
    await syncSiteCatalog(curated, { env, fetcher: h.fetcher });
    const written = h.calls
      .filter(({ init }) => init.method === "POST" || init.method === "PATCH")
      .flatMap(({ init }) => {
        const body = JSON.parse(init.body);
        return Array.isArray(body) ? body : [body];
      })
      .find((row) => row.sku === curated[0].sku);
    assert.ok(written, "the curated product has to reach the storefront");
    assert.deepEqual(written.materials, curated[0].materials);
    assert.equal(written.dimensions, curated[0].dimensions);
    assert.equal(written.weight_g, curated[0].weightG);
    assert.equal(written.packaging, curated[0].packaging);
  });

test("a product absent from the storefront is inserted with the technical sheet", async () => {
  // O destino responde com o catálogo vazio: o sync precisa inserir, não
  // atualizar. É a primeira publicação de uma peça curada, caminho que o
  // restante da suíte não exercita porque sempre simula produtos já cadastrados.
  const h = harness({ existing: () => jsonRows([]) });
  assert.deepEqual(
    await syncSiteCatalog(snapshot, { env, fetcher: h.fetcher }),
    { count: snapshot.length, project: "whwloseshzraipljisqo", dryRun: false },
  );
  const writes = h.calls.filter(({ init }) => init.method !== "GET");
  assert.equal(writes.length, 1, "the whole catalog is inserted in one statement");
  assert.equal(writes[0].init.method, "POST");
  const rows = JSON.parse(writes[0].init.body);
  assert.equal(rows.length, snapshot.length);
  assert.ok(
    rows.every((row) => row.published === true),
    "a product that reaches the storefront through the curation goes live",
  );
  const inserted = rows.find((row) => row.sku === snapshot[0].sku);
  assert.ok(inserted, "the curated product has to be inserted");
  assert.deepEqual(inserted.materials, snapshot[0].materials);
  assert.equal(inserted.dimensions, snapshot[0].dimensions);
  assert.equal(inserted.weight_g, snapshot[0].weightG);
  assert.equal(inserted.packaging, snapshot[0].packaging);
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
    "changed materials",
    () => {
      const rows = sourceRows();
      rows[0].materials = ["Vidro"];
      return jsonRows(rows);
    },
  ],
  [
    "invalid materials",
    () => {
      const rows = sourceRows();
      rows[0].materials = [" Material "];
      return jsonRows(rows);
    },
  ],
  [
    "changed dimensions",
    () => {
      const rows = sourceRows();
      rows[0].dimensions_display = "40 x 40 cm";
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
          editorial_order: index + 1,
        })),
      ),
  ],
  [
    "incomplete publication state",
    () =>
      Response.json(
        [{ id: snapshot[0].id, published: true, editorial_order: 1 }],
        {
          headers: { "content-range": "0-0/8" },
        },
      ),
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

const heartbeatStore = () => {
  const calls = [];
  const fetcher = async (input, init) => {
    const url = new URL(input);
    calls.push({ url, init });
    assert.equal(url.hostname, targetHost);
    assert.equal(url.pathname, "/rest/v1/premium_catalog_sync_state");
    assert.equal(init.headers.apikey, env.SUPABASE_SECRET_KEY);
    return new Response(null, { status: init.method === "GET" ? 200 : 201 });
  };
  return { calls, fetcher };
};

test("the sync heartbeat writes the outcome to the premium project only", async () => {
  const h = heartbeatStore();
  const stored = await recordSyncState(
    {
      status: "success",
      attemptAt: "2026-11-26T14:00:00.000Z",
      curatedCount: 8,
      sourceCount: 7968,
    },
    { env, fetcher: h.fetcher },
  );
  assert.equal(h.calls.length, 1);
  const { url, init } = h.calls[0];
  assert.equal(init.method, "POST");
  assert.equal(url.searchParams.get("on_conflict"), "id");
  assert.equal(
    init.headers.Prefer,
    "resolution=merge-duplicates,return=minimal",
  );
  assert.deepEqual(JSON.parse(init.body), {
    id: true,
    last_attempt_at: "2026-11-26T14:00:00.000Z",
    last_status: "success",
    last_error: null,
    source_count: 7968,
    curated_count: 8,
    last_success_at: "2026-11-26T14:00:00.000Z",
  });
  assert.equal(stored.last_status, "success");

  // Uma falha posterior não pode apagar a marca do último sucesso.
  await recordSyncState(
    {
      status: "failed",
      attemptAt: "2026-11-27T14:00:00.000Z",
      error: "Catalog sync failed (HTTP 503).",
    },
    { env, fetcher: h.fetcher },
  );
  const failedBody = JSON.parse(h.calls[1].init.body);
  assert.equal(failedBody.last_status, "failed");
  assert.equal(failedBody.last_error, "Catalog sync failed (HTTP 503).");
  assert.equal(failedBody.source_count, null);
  assert.equal(failedBody.curated_count, null);
  assert.ok(!Object.hasOwn(failedBody, "last_success_at"));
});

test("the heartbeat refuses another project, a bad status and an empty reason", async () => {
  const h = heartbeatStore();
  await assert.rejects(
    recordSyncState(
      { status: "success", attemptAt: "2026-11-26T14:00:00.000Z" },
      { env: { ...env, SUPABASE_URL: `https://${sourceHost}` }, fetcher: h.fetcher },
    ),
    /Catalog URL does not match the approved project/,
  );
  await assert.rejects(
    recordSyncState(
      { status: "success", attemptAt: "2026-11-26T14:00:00.000Z" },
      {
        env: { ...env, SUPABASE_PROJECT_REF: "outro" },
        fetcher: h.fetcher,
      },
    ),
    /Approved site API configuration is missing or mismatched/,
  );
  await assert.rejects(
    recordSyncState(
      { status: "success", attemptAt: "2026-11-26T14:00:00.000Z" },
      { env: { ...env, ["SUPABASE" + "_SECRET_KEY"]: "" }, fetcher: h.fetcher },
    ),
    /Approved site API configuration is missing or mismatched/,
  );
  await assert.rejects(
    recordSyncState(
      { status: "partial", attemptAt: "2026-11-26T14:00:00.000Z" },
      { env, fetcher: h.fetcher },
    ),
    /must be success or failed/,
  );
  assert.equal(h.calls.length, 0);

  const blank = await recordSyncState(
    { status: "failed", attemptAt: "2026-11-26T14:00:00.000Z", error: "   " },
    { env, fetcher: h.fetcher },
  );
  assert.equal(blank.last_error, "Falha sem mensagem.");
  const long = await recordSyncState(
    { status: "failed", attemptAt: "2026-11-26T14:00:00.000Z", error: "x".repeat(400) },
    { env, fetcher: h.fetcher },
  );
  assert.equal(long.last_error.length, 200);
  await assert.rejects(
    recordSyncState(
      { status: "success", attemptAt: "2026-11-26T14:00:00.000Z" },
      {
        env,
        fetcher: async () => new Response("no", { status: 401 }),
      },
    ),
    /Sync heartbeat failed \(HTTP 401\)/,
  );
});

test("the heartbeat reads back the stored state, or an empty one", async () => {
  assert.deepEqual(await readSyncState({ env, fetcher: async (input, init) => {
    const url = new URL(input);
    assert.equal(url.pathname, "/rest/v1/premium_catalog_sync_state");
    assert.equal(url.searchParams.get("id"), "eq.true");
    assert.equal(url.searchParams.get("limit"), "1");
    assert.equal(
      url.searchParams.get("select"),
      "last_attempt_at,last_status,last_success_at,last_error,source_count,curated_count",
    );
    assert.equal(init.method, "GET");
    return Response.json([]);
  } }), {
    id: true,
    last_attempt_at: null,
    last_status: null,
    last_success_at: null,
    last_error: null,
    source_count: null,
    curated_count: null,
  });

  const row = {
    last_attempt_at: "2026-11-26T14:00:00.000Z",
    last_status: "success",
    last_success_at: "2026-11-26T14:00:00.000Z",
    last_error: null,
    source_count: 7968,
    curated_count: 8,
  };
  assert.deepEqual(
    await readSyncState({
      env,
      fetcher: async (input) => {
        assert.equal(new URL(input).hostname, targetHost);
        return Response.json([{ ...row, id: true }]);
      },
    }),
    { ...row, id: true },
  );
});
