// Release probes for source pagination and delivery semantics. Everything is
// synthetic: this script never contacts Supabase or a commercial destination.
import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import vm from "node:vm";
import ts from "typescript";

const require = createRequire(import.meta.url);
const { NextRequest } = require("next/server");
const products = JSON.parse(readFileSync("src/lib/products.json", "utf8"));
const project = "whwloseshzraipljisqo";
const results = [];

function load(file, env = {}, fetcher = async () => new Response("{}")) {
  const exports = {};
  const js = ts.transpileModule(readFileSync(file, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
    },
  }).outputText;
  const localRequire = (name) => {
    if (name === "./products.json") return products;
    if (name.startsWith("@/"))
      return load(`src/${name.slice(2)}.ts`, env, fetcher);
    return require(name);
  };
  vm.runInNewContext(
    js,
    {
      exports,
      require: localRequire,
      process: { env },
      fetch: fetcher,
      URL,
      AbortSignal,
      Response,
      Request,
      TextDecoder,
      setTimeout,
      clearTimeout,
      console,
    },
    { filename: file },
  );
  return exports;
}

async function probe(id, expected, run) {
  const observed = await run();
  results.push({ id, expected, observed, passed: observed === expected });
}

const item = {
  id: "0144f10f-c311-47eb-afd6-14b9ebef35b6",
  sku: "08255",
  slug: "kit-executivo-2-pecas-08255",
  name: "Kit executivo",
  original_name: "Kit executivo",
  category: "Kits & experiências",
  tagline: "Teste de entrega",
  description: "Produto sintético de auditoria.",
  image_path: "/images/kit.webp",
  minimum: 5,
  personalizable: true,
  source_date: "2026-09-22",
};
const payload = {
  name: "Pessoa sintética",
  company: "Empresa de teste",
  email: "teste@example.com",
  occasion: "Auditoria local",
  items: [{ productId: item.id, quantity: 5 }],
};

function request(key, body = payload, headers = {}) {
  return new NextRequest("http://localhost:3111/api/briefings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Idempotency-Key": key,
      "x-vercel-forwarded-for": "203.0.113.42",
      ...headers,
    },
    body: JSON.stringify(body),
  });
}

function deliveryHarness() {
  const records = new Map();
  const rateAttempts = new Map();
  let webhookCalls = 0;
  const fetcher = async (input, init = {}) => {
    const url = new URL(String(input));
    if (url.pathname.endsWith("/allow_premium_briefing_attempt")) {
      const { p_client_hash: hash } = JSON.parse(String(init.body));
      const count = rateAttempts.get(hash) ?? 0;
      if (count >= 5) return Response.json(false);
      rateAttempts.set(hash, count + 1);
      return Response.json(true);
    }
    if (url.pathname === "/rest/v1/premium_catalog_items")
      return new Response(JSON.stringify([item]), {
        headers: { "content-range": "0-0/1" },
      });
    if (url.pathname.endsWith("/persist_premium_briefing")) {
      const body = JSON.parse(String(init.body));
      const current = records.get(body.p_idempotency_key);
      if (current)
        return Response.json([
          {
            protocol: current.protocol,
            duplicate: true,
            payload_conflict: current.hash !== body.p_request_hash,
            delivery_status: current.status,
          },
        ]);
      const record = {
        protocol: "PB-SYNTHETIC001",
        hash: body.p_request_hash,
        status: "pending",
        attempts: 0,
      };
      records.set(body.p_idempotency_key, record);
      return Response.json([
        {
          protocol: record.protocol,
          duplicate: false,
          payload_conflict: false,
          delivery_status: record.status,
        },
      ]);
    }
    if (url.pathname.endsWith("/claim_premium_briefing_delivery")) {
      const { p_idempotency_key: key } = JSON.parse(String(init.body));
      const record = records.get(key);
      const claimed = record.status === "pending" || record.status === "failed";
      if (claimed) {
        record.status = "delivering";
        record.attempts += 1;
      }
      return Response.json([
        { protocol: record.protocol, claimed, delivery_status: record.status },
      ]);
    }
    if (url.pathname.endsWith("/record_premium_briefing_delivery")) {
      const body = JSON.parse(String(init.body));
      const record = records.get(body.p_idempotency_key);
      record.status = body.p_delivered ? "delivered" : "failed";
      return Response.json([
        {
          protocol: record.protocol,
          delivery_status: record.status,
          delivery_attempts: record.attempts,
        },
      ]);
    }
    if (url.hostname === "localhost") {
      webhookCalls += 1;
      await new Promise((resolve) => setTimeout(resolve, 20));
      return Response.json({ accepted: true });
    }
    throw new Error(`Unexpected synthetic request: ${url}`);
  };
  return { fetcher, webhookCalls: () => webhookCalls };
}

const activeEnv = {
  NODE_ENV: "development",
  BRIEFING_DELIVERY_ENABLED: "true",
  BRIEFING_WEBHOOK_URL: "http://localhost:3999/mock",
  PROMO_PREMIUM_CLIENT_IP_HEADER: "x-vercel-forwarded-for",
  SUPABASE_PROJECT_REF: project,
  SUPABASE_URL: `https://${project}.supabase.co`,
  SUPABASE_PUBLISHABLE_KEY: "synthetic-public",
  ["SUPABASE" + "_SECRET_KEY"]: "synthetic-service",
};

await probe("AUD-01-concurrent-idempotency", "201,202;1", async () => {
  const harness = deliveryHarness();
  const api = load(
    "src/app/api/briefings/route.ts",
    activeEnv,
    harness.fetcher,
  );
  const responses = await Promise.all([
    api.POST(request("audit-concurrent-0001")),
    api.POST(request("audit-concurrent-0001")),
  ]);
  return `${responses
    .map((response) => response.status)
    .sort()
    .join(",")};${harness.webhookCalls()}`;
});

await probe("AUD-02-key-payload-conflict", 409, async () => {
  const harness = deliveryHarness();
  const api = load(
    "src/app/api/briefings/route.ts",
    activeEnv,
    harness.fetcher,
  );
  assert.equal((await api.POST(request("audit-conflict-0001"))).status, 201);
  return (
    await api.POST(
      request("audit-conflict-0001", { ...payload, company: "Outra empresa" }),
    )
  ).status;
});

await probe("AUD-03-body-without-content-length", 413, async () => {
  const api = load(
    "src/app/api/briefings/route.ts",
    activeEnv,
    deliveryHarness().fetcher,
  );
  return (
    await api.POST(
      request("audit-large-body-0001", {
        ...payload,
        unexpected: "x".repeat(20000),
      }),
    )
  ).status;
});

await probe("AUD-16-stream-body-limit", "413;true", async () => {
  let cancelled = false;
  const stream = new ReadableStream({
    pull(controller) {
      controller.enqueue(new Uint8Array(8000));
    },
    cancel() {
      cancelled = true;
    },
  });
  const api = load(
    "src/app/api/briefings/route.ts",
    activeEnv,
    deliveryHarness().fetcher,
  );
  const response = await api.POST(
    new NextRequest("http://localhost:3111/api/briefings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Idempotency-Key": "audit-stream-0001",
        "x-vercel-forwarded-for": "203.0.113.42",
      },
      body: stream,
      duplex: "half",
    }),
  );
  return `${response.status};${cancelled}`;
});

await probe("AUD-14-shared-rate-limit", "422,422,422,422,422,429", async () => {
  const harness = deliveryHarness();
  const first = load(
    "src/app/api/briefings/route.ts",
    activeEnv,
    harness.fetcher,
  );
  const second = load(
    "src/app/api/briefings/route.ts",
    activeEnv,
    harness.fetcher,
  );
  const statuses = [];
  for (let index = 0; index < 6; index += 1) {
    const api = index % 2 ? second : first;
    const response = await api.POST(
      request(`audit-rate-${String(index).padStart(12, "0")}`, {}),
    );
    statuses.push(response.status);
  }
  return statuses.join(",");
});

await probe("AUD-15-missing-trusted-address", 503, async () => {
  const api = load(
    "src/app/api/briefings/route.ts",
    activeEnv,
    deliveryHarness().fetcher,
  );
  return (
    await api.POST(
      request("audit-no-address-0001", payload, {
        "x-vercel-forwarded-for": "untrusted, 203.0.113.42",
      }),
    )
  ).status;
});

await probe("AUD-04-invalid-destination-capability", false, async () => {
  const api = load(
    "src/app/api/briefings/route.ts",
    { ...activeEnv, BRIEFING_WEBHOOK_URL: "not-a-url" },
    deliveryHarness().fetcher,
  );
  return (await api.GET().json()).configured;
});

await probe("AUD-05-invalid-date-suffix", false, async () => {
  const api = load("src/lib/briefing.ts");
  return api.validateBriefing({ ...payload, date: "2026-12-01invalid" }).ok;
});

await probe("AUD-06-source-pagination-truncation", 30, async () => {
  const rows = Array.from({ length: 30 }, (_, index) => ({
    ...item,
    id: `00000000-0000-4000-8000-${String(index).padStart(12, "0")}`,
    sku: `AUD${index}`,
    slug: `aud-${index}`,
    name: `Auditoria ${index}`,
    original_name: `Auditoria ${index}`,
  }));
  const api = load(
    "src/lib/site-database.ts",
    {
      SUPABASE_PROJECT_REF: project,
      SUPABASE_URL: `https://${project}.supabase.co`,
      SUPABASE_PUBLISHABLE_KEY: "synthetic",
    },
    async (input) => {
      const url = new URL(String(input));
      const limit = Number(url.searchParams.get("limit"));
      return new Response(JSON.stringify(rows.slice(0, limit)), {
        headers: { "content-range": `0-${limit - 1}/${rows.length}` },
      });
    },
  );
  return (await api.getSiteCatalogPage({ pageSize: 12 })).total;
});

for (const [id, rows, range] of [
  ["AUD-17-missing-exact-total", [item], null],
  ["AUD-18-inconsistent-page-range", [item, item], "0-0/30"],
]) {
  await probe(id, true, async () => {
    const api = load(
      "src/lib/site-database.ts",
      {
        SUPABASE_PROJECT_REF: project,
        SUPABASE_URL: `https://${project}.supabase.co`,
        SUPABASE_PUBLISHABLE_KEY: "synthetic",
      },
      async () =>
        new Response(JSON.stringify(rows), {
          headers: range ? { "content-range": range } : {},
        }),
    );
    try {
      await api.getSiteCatalogPage();
      return false;
    } catch {
      return true;
    }
  });
}

await probe("AUD-19-empty-exact-total", 0, async () => {
  const api = load(
    "src/lib/site-database.ts",
    {
      SUPABASE_PROJECT_REF: project,
      SUPABASE_URL: `https://${project}.supabase.co`,
      SUPABASE_PUBLISHABLE_KEY: "synthetic",
    },
    async () => new Response("[]", { headers: { "content-range": "*/0" } }),
  );
  return (await api.getSiteCatalogPage()).total;
});

await probe("AUD-20-selection-bypasses-source-cache", "no-store", async () => {
  let cacheMode = "missing";
  const api = load(
    "src/lib/site-database.ts",
    {
      SUPABASE_PROJECT_REF: project,
      SUPABASE_URL: `https://${project}.supabase.co`,
      SUPABASE_PUBLISHABLE_KEY: "synthetic",
    },
    async (_input, init) => {
      cacheMode = init.cache ?? "missing";
      return new Response(JSON.stringify([item]), {
        headers: { "content-range": "0-0/1" },
      });
    },
  );
  await api.getSiteCatalogPage({ ids: [item.id] }, { fresh: true });
  return cacheMode;
});

for (const [id, freshRow] of [
  ["AUD-21-server-rejects-unpublished-item", null],
  ["AUD-22-server-rejects-raised-minimum", { ...item, minimum: 10 }],
]) {
  await probe(id, "422;no-store;0", async () => {
    const harness = deliveryHarness();
    let catalogCache = "missing";
    const api = load(
      "src/app/api/briefings/route.ts",
      activeEnv,
      async (input, init = {}) => {
        if (
          new URL(String(input)).pathname === "/rest/v1/premium_catalog_items"
        ) {
          catalogCache = init.cache ?? "missing";
          const rows =
            catalogCache === "no-store" ? (freshRow ? [freshRow] : []) : [item];
          return new Response(JSON.stringify(rows), {
            headers: { "content-range": rows.length ? "0-0/1" : "*/0" },
          });
        }
        return harness.fetcher(input, init);
      },
    );
    const response = await api.POST(request(`audit-fresh-${id}-0001`));
    return `${response.status};${catalogCache};${harness.webhookCalls()}`;
  });
}

for (const [id, changedRow] of [
  ["AUD-23-invalid-slug", { ...item, slug: "../private" }],
  ["AUD-24-invalid-date", { ...item, source_date: "2026-02-31" }],
  [
    "AUD-25-unsafe-media-path",
    { ...item, image_path: "/images/../private.webp" },
  ],
]) {
  await probe(id, true, async () => {
    const api = load(
      "src/lib/site-database.ts",
      activeEnv,
      async () =>
        new Response(JSON.stringify([changedRow]), {
          headers: { "content-range": "0-0/1" },
        }),
    );
    try {
      await api.getSiteCatalogPage();
      return false;
    } catch {
      return true;
    }
  });
}

for (const [id, input, rows] of [
  ["AUD-26-duplicate-item", {}, [item, item]],
  [
    "AUD-27-unrequested-item",
    { ids: [item.id] },
    [{ ...item, id: "03b447a0-930f-43f9-a51f-5fce910bfc4a" }],
  ],
  [
    "AUD-28-overfilled-page",
    { pageSize: 1 },
    [
      item,
      {
        ...item,
        id: "03b447a0-930f-43f9-a51f-5fce910bfc4a",
        sku: "93586",
        slug: "other-item",
      },
    ],
  ],
  ["AUD-32-category-filter-drift", { category: "Escrita" }, [item]],
]) {
  await probe(id, true, async () => {
    const api = load(
      "src/lib/site-database.ts",
      activeEnv,
      async () =>
        new Response(JSON.stringify(rows), {
          headers: {
            "content-range": `0-${rows.length - 1}/${rows.length}`,
          },
        }),
    );
    try {
      await api.getSiteCatalogPage(input);
      return false;
    } catch {
      return true;
    }
  });
}

await probe("AUD-29-product-slug-mismatch", true, async () => {
  const api = load(
    "src/lib/site-database.ts",
    activeEnv,
    async () => new Response(JSON.stringify([{ ...item, slug: "other-item" }])),
  );
  try {
    await api.getSiteProductBySlug(item.slug);
    return false;
  } catch {
    return true;
  }
});

await probe(
  "AUD-30-accepted-webhook-not-marked-failed",
  "503;1;0",
  async () => {
    const harness = deliveryHarness();
    let falseRecords = 0;
    const api = load(
      "src/app/api/briefings/route.ts",
      activeEnv,
      async (input, init = {}) => {
        if (
          new URL(String(input)).pathname.endsWith(
            "/record_premium_briefing_delivery",
          )
        ) {
          const body = JSON.parse(String(init.body));
          if (body.p_delivered) throw new Error("SYNTHETIC_DB_FAILURE");
          falseRecords++;
        }
        return harness.fetcher(input, init);
      },
    );
    const response = await api.POST(request("audit-confirmation-0001"));
    return `${response.status};${harness.webhookCalls()};${falseRecords}`;
  },
);

await probe("AUD-31-rejected-webhook-marked-failed", "503;1", async () => {
  const harness = deliveryHarness();
  let falseRecords = 0;
  const api = load(
    "src/app/api/briefings/route.ts",
    activeEnv,
    async (input, init = {}) => {
      const url = new URL(String(input));
      if (url.hostname === "localhost")
        return new Response("unavailable", { status: 503 });
      if (url.pathname.endsWith("/record_premium_briefing_delivery")) {
        const body = JSON.parse(String(init.body));
        if (!body.p_delivered) falseRecords++;
      }
      return harness.fetcher(input, init);
    },
  );
  const response = await api.POST(request("audit-rejection-0001"));
  return `${response.status};${falseRecords}`;
});

for (const [id, url] of [
  ["AUD-07-reject-legacy-project", "https://doufsxqlfjyuvxuezpln.supabase.co"],
  [
    "AUD-08-reject-lookalike-host",
    `https://${project}.supabase.co.example.com`,
  ],
]) {
  await probe(id, true, async () => {
    let requested = false;
    const api = load(
      "src/lib/site-database.ts",
      {
        SUPABASE_PROJECT_REF: project,
        SUPABASE_URL: url,
        SUPABASE_PUBLISHABLE_KEY: "synthetic",
      },
      async () => {
        requested = true;
        return Response.json([]);
      },
    );
    try {
      await api.getSiteCatalogPage();
      return false;
    } catch {
      return !requested;
    }
  });
}

const report = {
  generatedAt: new Date().toISOString(),
  scope:
    "Isolated source modules; synthetic inputs; no external network or database writes",
  results,
  passed: results.filter((result) => result.passed).length,
  failed: results.filter((result) => !result.passed).length,
};
writeFileSync(
  "docs/audit/plan-scenarios.json",
  JSON.stringify(report, null, 2) + "\n",
);
console.log(JSON.stringify(report, null, 2));
if (report.failed) process.exit(1);
