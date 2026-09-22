import assert from "node:assert/strict";
import test from "node:test";
import {
  inspectSitePublication,
  manageSitePublication,
} from "../manage-site-publication.mjs";

const host = "whwloseshzraipljisqo.supabase.co";
const id = "0144f10f-c311-47eb-afd6-14b9ebef35b6";
const updatedAt = "2026-09-22T20:00:00.000Z";
const secretKey = ["sb", "secret", "synthetic"].join("_");
const publishableKey = ["sb", "publishable", "synthetic"].join("_");
const env = {
  SUPABASE_PROJECT_REF: "whwloseshzraipljisqo",
  SUPABASE_URL: `https://${host}`,
  [["SUPABASE", "SECRET", "KEY"].join("_")]: secretKey,
};
const current = {
  id,
  sku: "08255",
  slug: "kit-executivo-2-pecas-08255",
  published: true,
  published_from: null,
  published_until: null,
  updated_at: updatedAt,
};
const response = (rows, range = rows.length ? "0-0/1" : "*/0") =>
  Response.json(rows, { headers: { "content-range": range } });

function harness({ row = current, update } = {}) {
  const calls = [];
  const fetcher = async (input, init) => {
    const url = new URL(String(input));
    calls.push({ url, init });
    assert.equal(url.hostname, host);
    assert.equal(url.pathname, "/rest/v1/premium_catalog_items");
    assert.equal(init.redirect, "error");
    assert.equal(init.headers.apikey, env.SUPABASE_SECRET_KEY);
    if (init.method === "GET") {
      assert.equal(init.cache, "no-store");
      assert.equal(url.searchParams.get("id"), `eq.${id}`);
      return response([row]);
    }
    assert.equal(init.method, "PATCH");
    return update
      ? update(url, init)
      : response([
          {
            ...row,
            ...JSON.parse(init.body),
            updated_at: "2026-09-22T20:01:00.000Z",
          },
        ]);
  };
  return { calls, fetcher };
}

test("inspection is read-only and returns the exact premium record", async () => {
  const h = harness();
  assert.deepEqual(
    await inspectSitePublication(id, { env, fetcher: h.fetcher }),
    current,
  );
  assert.equal(h.calls.length, 1);
  assert.equal(h.calls[0].init.method, "GET");
});

test("dry run plans a bounded window without writing", async () => {
  const h = harness();
  const result = await manageSitePublication(
    id,
    {
      published_from: "2026-10-01T09:00:00-03:00",
      published_until: "2026-10-31T21:00:00-03:00",
    },
    { env, fetcher: h.fetcher },
  );
  assert.equal(result.applied, false);
  assert.equal(result.noOp, false);
  assert.equal(result.proposed.published_from, "2026-10-01T12:00:00.000Z");
  assert.equal(result.proposed.published_until, "2026-11-01T00:00:00.000Z");
  assert.equal(h.calls.length, 1);
});

test("apply uses SKU confirmation and an optimistic revision lock", async () => {
  const h = harness({
    update(url, init) {
      assert.equal(url.searchParams.get("id"), `eq.${id}`);
      assert.equal(url.searchParams.get("updated_at"), `eq.${updatedAt}`);
      assert.deepEqual(JSON.parse(init.body), { published: false });
      assert.equal(init.headers.Prefer, "return=representation,count=exact");
      return response([
        {
          ...current,
          published: false,
          updated_at: "2026-09-22T20:01:00.000Z",
        },
      ]);
    },
  });
  const result = await manageSitePublication(
    id,
    { published: false },
    {
      env,
      fetcher: h.fetcher,
      apply: true,
      expectedUpdatedAt: updatedAt,
      confirmSku: current.sku,
    },
  );
  assert.equal(result.applied, true);
  assert.equal(result.current.published, false);
  assert.deepEqual(
    h.calls.map(({ init }) => init.method),
    ["GET", "PATCH"],
  );
});

for (const [name, options, message] of [
  [
    "stale revision",
    { expectedUpdatedAt: "2026-09-22T19:59:00Z", confirmSku: current.sku },
    /changed since/,
  ],
  [
    "wrong SKU confirmation",
    { expectedUpdatedAt: updatedAt, confirmSku: "OTHER" },
    /SKU confirmation/,
  ],
])
  test(`${name} blocks the write`, async () => {
    const h = harness();
    await assert.rejects(
      manageSitePublication(
        id,
        { published: false },
        {
          env,
          fetcher: h.fetcher,
          apply: true,
          ...options,
        },
      ),
      message,
    );
    assert.equal(h.calls.length, 1);
  });

test("a concurrent update returning zero rows fails closed", async () => {
  const h = harness({ update: () => response([]) });
  await assert.rejects(
    manageSitePublication(
      id,
      { published: false },
      {
        env,
        fetcher: h.fetcher,
        apply: true,
        expectedUpdatedAt: updatedAt,
        confirmSku: current.sku,
      },
    ),
    /revision race/,
  );
  assert.equal(h.calls.length, 2);
});

for (const [name, changes] of [
  [
    "inverted window",
    {
      published_from: "2026-11-01T00:00:00Z",
      published_until: "2026-10-01T00:00:00Z",
    },
  ],
  ["ambiguous timestamp", { published_from: "2026-10-01T09:00:00" }],
  ["unknown field", { editorial_order: 99 }],
  ["wrong published type", { published: "false" }],
])
  test(`${name} is rejected without a write`, async () => {
    const h = harness();
    await assert.rejects(
      manageSitePublication(id, changes, { env, fetcher: h.fetcher }),
    );
    assert.equal(h.calls.length, 1);
    assert.equal(h.calls[0].init.method, "GET");
  });

test("clearing an already-null bound is an explicit no-op", async () => {
  const h = harness();
  const result = await manageSitePublication(
    id,
    { published_until: null },
    { env, fetcher: h.fetcher },
  );
  assert.equal(result.noOp, true);
  assert.equal(h.calls.length, 1);
});

for (const [name, changedEnv] of [
  [
    "operational destination",
    { SUPABASE_URL: "https://doufsxqlfjyuvxuezpln.supabase.co" },
  ],
  ["lookalike destination", { SUPABASE_URL: `https://${host}.example.com` }],
  ["wrong project ref", { SUPABASE_PROJECT_REF: "doufsxqlfjyuvxuezpln" }],
  [
    "publishable destination key",
    { [["SUPABASE", "SECRET", "KEY"].join("_")]: publishableKey },
  ],
])
  test(`${name} is rejected before the network`, async () => {
    let calls = 0;
    await assert.rejects(
      inspectSitePublication(id, {
        env: { ...env, ...changedEnv },
        fetcher: async () => {
          calls += 1;
          return response([current]);
        },
      }),
    );
    assert.equal(calls, 0);
  });

test("malformed or missing records cannot be edited", async () => {
  for (const invalid of [
    [],
    [{ ...current, supplier_cost: 12 }],
    [{ ...current, updated_at: "not-a-date" }],
  ]) {
    let calls = 0;
    await assert.rejects(
      inspectSitePublication(id, {
        env,
        fetcher: async () => {
          calls += 1;
          return response(invalid);
        },
      }),
    );
    assert.equal(calls, 1);
  }
});
