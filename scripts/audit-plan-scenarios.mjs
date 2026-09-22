// Release probes for source pagination and delivery semantics. Everything is
// synthetic: this script never contacts Supabase or a commercial destination.
import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, extname, resolve } from "node:path";
import vm from "node:vm";
import ts from "typescript";

const require = createRequire(import.meta.url);
const { NextRequest } = require("next/server");
const products = JSON.parse(readFileSync("src/lib/products.json", "utf8"));
const project = "whwloseshzraipljisqo";
const results = [];

function load(
  file,
  env = {},
  fetcher = async () => new Response("{}"),
  transform = (source) => source,
) {
  const exports = {};
  const js = ts.transpileModule(transform(readFileSync(file, "utf8"), file), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
    },
  }).outputText;
  const localRequire = (name) => {
    if (name === "./products.json") return products;
    if (name.startsWith("@/")) {
      const dependency = `src/${name.slice(2)}`;
      return load(
        extname(dependency) ? dependency : `${dependency}.ts`,
        env,
        fetcher,
        transform,
      );
    }
    if (name.startsWith(".")) {
      const dependency = resolve(dirname(file), name);
      return load(
        extname(dependency) ? dependency : `${dependency}.ts`,
        env,
        fetcher,
        transform,
      );
    }
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
      performance,
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
  let leaseSequence = 0;
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
    if (url.pathname.endsWith("/lookup_premium_briefing")) {
      const body = JSON.parse(String(init.body));
      const current = records.get(body.p_idempotency_key);
      return Response.json(
        current
          ? [
              {
                protocol: current.protocol,
                payload_conflict: current.hash !== body.p_request_hash,
                delivery_status: current.status,
              },
            ]
          : [],
      );
    }
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
    if (url.pathname.endsWith("/claim_premium_briefing_delivery_v2")) {
      const { p_idempotency_key: key } = JSON.parse(String(init.body));
      const record = records.get(key);
      const claimed =
        record.status === "pending" ||
        record.status === "failed" ||
        (record.status === "delivering" && record.expired);
      if (claimed) {
        record.status = "delivering";
        record.attempts += 1;
        record.expired = false;
        leaseSequence += 1;
        record.leaseToken = `00000000-0000-4000-8000-${String(leaseSequence).padStart(12, "0")}`;
      }
      return Response.json([
        {
          protocol: record.protocol,
          claimed,
          delivery_status: record.status,
          delivery_lease_token: claimed ? record.leaseToken : null,
        },
      ]);
    }
    if (url.pathname.endsWith("/record_premium_briefing_delivery_v2")) {
      const body = JSON.parse(String(init.body));
      const record = records.get(body.p_idempotency_key);
      if (
        record.status !== "delivering" ||
        record.leaseToken !== body.p_delivery_lease_token
      )
        return Response.json([]);
      record.status = body.p_delivered ? "delivered" : "failed";
      record.leaseToken = null;
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
  return {
    fetcher,
    webhookCalls: () => webhookCalls,
    expireLease(key) {
      const record = records.get(key);
      if (record) record.expired = true;
    },
    deliveryStatus(key) {
      return records.get(key)?.status;
    },
  };
}

const activeEnv = {
  NODE_ENV: "development",
  BRIEFING_DELIVERY_ENABLED: "true",
  BRIEFING_WEBHOOK_URL: "http://localhost:3999/mock",
  PROMO_PREMIUM_CLIENT_IP_HEADER: "x-vercel-forwarded-for",
  SUPABASE_PROJECT_REF: project,
  SUPABASE_URL: `https://${project}.supabase.co`,
  SUPABASE_PUBLISHABLE_KEY: "sb_publishable_synthetic",
  ["SUPABASE" + "_SECRET_KEY"]: "sb_secret_synthetic",
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

await probe(
  "AUD-33-delivered-retry-after-withdrawal",
  "201,200;1",
  async () => {
    const harness = deliveryHarness();
    let withdrawn = false;
    const api = load(
      "src/app/api/briefings/route.ts",
      activeEnv,
      async (input, init = {}) => {
        if (
          new URL(String(input)).pathname === "/rest/v1/premium_catalog_items"
        ) {
          const rows = withdrawn ? [] : [item];
          return new Response(JSON.stringify(rows), {
            headers: { "content-range": rows.length ? "0-0/1" : "*/0" },
          });
        }
        return harness.fetcher(input, init);
      },
    );
    const first = await api.POST(request("audit-withdrawn-retry-0001"));
    withdrawn = true;
    const retry = await api.POST(request("audit-withdrawn-retry-0001"));
    return `${first.status},${retry.status};${harness.webhookCalls()}`;
  },
);

await probe(
  "AUD-34-pending-retry-after-withdrawal",
  "503,503;true",
  async () => {
    const harness = deliveryHarness();
    let withdrawn = false;
    let deliveries = 0;
    const api = load(
      "src/app/api/briefings/route.ts",
      activeEnv,
      async (input, init = {}) => {
        const url = new URL(String(input));
        if (url.pathname === "/rest/v1/premium_catalog_items") {
          const rows = withdrawn ? [] : [item];
          return new Response(JSON.stringify(rows), {
            headers: { "content-range": rows.length ? "0-0/1" : "*/0" },
          });
        }
        if (url.hostname === "localhost") {
          deliveries++;
          return new Response("unavailable", { status: 503 });
        }
        return harness.fetcher(input, init);
      },
    );
    const first = await api.POST(request("audit-pending-withdrawal-0001"));
    const firstBody = await first.json();
    withdrawn = true;
    const retry = await api.POST(request("audit-pending-withdrawal-0001"));
    const retryBody = await retry.json();
    return `${first.status},${retry.status};${deliveries === 1 && firstBody.protocol === retryBody.protocol}`;
  },
);

await probe("AUD-35-conflict-after-withdrawal", 409, async () => {
  const harness = deliveryHarness();
  let withdrawn = false;
  const api = load(
    "src/app/api/briefings/route.ts",
    activeEnv,
    async (input, init = {}) => {
      if (
        new URL(String(input)).pathname === "/rest/v1/premium_catalog_items"
      ) {
        const rows = withdrawn ? [] : [item];
        return new Response(JSON.stringify(rows), {
          headers: { "content-range": rows.length ? "0-0/1" : "*/0" },
        });
      }
      return harness.fetcher(input, init);
    },
  );
  assert.equal(
    (await api.POST(request("audit-withdrawn-conflict-0001"))).status,
    201,
  );
  withdrawn = true;
  return (
    await api.POST(
      request("audit-withdrawn-conflict-0001", {
        ...payload,
        company: "Outra empresa",
      }),
    )
  ).status;
});

await probe("AUD-36-normalized-intent-retry", "200;1", async () => {
  const harness = deliveryHarness();
  const api = load(
    "src/app/api/briefings/route.ts",
    activeEnv,
    harness.fetcher,
  );
  assert.equal(
    (await api.POST(request("audit-normalized-retry-0001"))).status,
    201,
  );
  const retry = await api.POST(
    request("audit-normalized-retry-0001", {
      ...payload,
      name: `  ${payload.name}  `,
      email: payload.email.toUpperCase(),
      budget: "",
    }),
  );
  return `${retry.status};${harness.webhookCalls()}`;
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

await probe("APV1-01-event-before-receipt", false, async () => {
  const api = load("src/lib/briefing.ts");
  return api.parseBriefingInput({
    ...payload,
    date: "2026-12-10",
    eventDate: "2026-12-01",
  }).ok;
});

await probe("APV1-01-phone-required-for-whatsapp", false, async () => {
  const api = load("src/lib/briefing.ts");
  return api.parseBriefingInput({ ...payload, contactChannel: "whatsapp" }).ok;
});

await probe("APV1-01-structured-project-and-legacy-hash", true, async () => {
  const api = load("src/lib/briefing.ts");
  const legacy = api.parseBriefingInput(payload);
  const structured = api.parseBriefingInput({
    ...payload,
    budget: "R$ 15.000",
    budgetScope: "total",
    eventDate: "2026-12-15",
    deadlineFlexibility: "fixed",
    contactChannel: "whatsapp",
    phone: "11999998888",
    logoStatus: "ready",
  });
  if (!legacy.ok || !structured.ok) return false;
  const commercial = api.toCommercialPayload(structured.value);
  return (
    !Object.hasOwn(legacy.value, "budgetScope") &&
    commercial.project.budgetScope === "total" &&
    commercial.project.eventDate === "2026-12-15" &&
    commercial.contact.phone === "11999998888" &&
    api
      .briefingDatabaseMessage(structured.value)
      .includes("Data do evento: 2026-12-15")
  );
});

await probe("APV1-01-message-limit-with-context", false, async () => {
  const api = load("src/lib/briefing.ts");
  return api.parseBriefingInput({
    ...payload,
    message: "A".repeat(2000),
    eventDate: "2026-12-15",
  }).ok;
});

await probe(
  "APV1-01-commercial-payload-and-retry",
  "201,200,409;true",
  async () => {
    const harness = deliveryHarness();
    let storedMessage = "";
    let commercial = null;
    const api = load(
      "src/app/api/briefings/route.ts",
      activeEnv,
      async (input, init = {}) => {
        const path = new URL(String(input)).pathname;
        if (path.endsWith("/persist_premium_briefing"))
          storedMessage = JSON.parse(String(init.body)).p_message;
        if (path === "/mock") commercial = JSON.parse(String(init.body));
        return harness.fetcher(input, init);
      },
    );
    const details = {
      ...payload,
      budget: "R$ 15.000",
      budgetScope: "total",
      date: "2026-12-01",
      eventDate: "2026-12-15",
      contactChannel: "whatsapp",
      phone: "11999998888",
    };
    const first = await api.POST(
      request("audit-structured-briefing-0001", details),
    );
    const retry = await api.POST(
      request("audit-structured-briefing-0001", details),
    );
    const changed = await api.POST(
      request("audit-structured-briefing-0001", {
        ...details,
        eventDate: "2026-12-16",
      }),
    );
    const correct =
      storedMessage.includes("Data do evento: 2026-12-15") &&
      commercial?.project.eventDate === "2026-12-15" &&
      commercial?.project.budgetScope === "total" &&
      commercial?.contact.phone === "11999998888" &&
      harness.webhookCalls() === 1;
    return `${first.status},${retry.status},${changed.status};${correct}`;
  },
);

await probe("AUD-06-source-pagination-truncation", 530, async () => {
  const rows = Array.from({ length: 530 }, (_, index) => ({
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
      SUPABASE_PUBLISHABLE_KEY: "sb_publishable_synthetic",
    },
    async (input) => {
      const url = new URL(String(input));
      const limit = Number(url.searchParams.get("limit"));
      const offset = Number(url.searchParams.get("offset") ?? 0);
      const page = rows.slice(offset, offset + limit);
      return new Response(JSON.stringify(page), {
        headers: {
          "content-range": page.length
            ? `${offset}-${offset + page.length - 1}/${rows.length}`
            : `*/${rows.length}`,
        },
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
        SUPABASE_PUBLISHABLE_KEY: "sb_publishable_synthetic",
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
      SUPABASE_PUBLISHABLE_KEY: "sb_publishable_synthetic",
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
      SUPABASE_PUBLISHABLE_KEY: "sb_publishable_synthetic",
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

await probe("AUD-28-overfilled-page", "1;2", async () => {
  const rows = [
    item,
    {
      ...item,
      id: "03b447a0-930f-43f9-a51f-5fce910bfc4a",
      sku: "93586",
      slug: "other-item",
    },
  ];
  const api = load(
    "src/lib/site-database.ts",
    activeEnv,
    async () =>
      new Response(JSON.stringify(rows), {
        headers: { "content-range": "0-1/2" },
      }),
  );
  const page = await api.getSiteCatalogPage({ pageSize: 1 });
  return `${page.items.length};${page.total}`;
});

await probe("AUD-32-category-filter-drift", 0, async () => {
  const api = load(
    "src/lib/site-database.ts",
    activeEnv,
    async () =>
      new Response(JSON.stringify([item]), {
        headers: { "content-range": "0-0/1" },
      }),
  );
  return (await api.getSiteCatalogPage({ category: "Escrita" })).total;
});

await probe("AUD-37-public-catalog-hard-limit", true, async () => {
  const rows = Array.from({ length: 500 }, (_, index) => ({
    ...item,
    id: `10000000-0000-4000-8000-${String(index).padStart(12, "0")}`,
    sku: `LIMIT${index}`,
    slug: `limit-${index}`,
  }));
  const api = load(
    "src/lib/site-database.ts",
    activeEnv,
    async () =>
      new Response(JSON.stringify(rows), {
        headers: { "content-range": "0-499/10001" },
      }),
  );
  try {
    await api.getSiteCatalogPage();
    return false;
  } catch {
    return true;
  }
});

await probe("AUD-38-total-change-during-pagination", true, async () => {
  const rows = Array.from({ length: 501 }, (_, index) => ({
    ...item,
    id: `20000000-0000-4000-8000-${String(index).padStart(12, "0")}`,
    sku: `DRIFT${index}`,
    slug: `drift-${index}`,
  }));
  const api = load("src/lib/site-database.ts", activeEnv, async (input) => {
    const offset = Number(new URL(String(input)).searchParams.get("offset"));
    const page = rows.slice(offset, offset + 500);
    const total = offset === 0 ? 501 : 502;
    return new Response(JSON.stringify(page), {
      headers: {
        "content-range": `${offset}-${offset + page.length - 1}/${total}`,
      },
    });
  });
  try {
    await api.getSiteCatalogPage();
    return false;
  } catch {
    return true;
  }
});

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
            "/record_premium_briefing_delivery_v2",
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
      if (url.pathname.endsWith("/record_premium_briefing_delivery_v2")) {
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
        SUPABASE_PUBLISHABLE_KEY: "sb_publishable_synthetic",
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

for (const host of [
  "doufsxqlfjyuvxuezpln.supabase.co",
  "doufsxqlfjyuvxuezpln.functions.supabase.co",
  "db.doufsxqlfjyuvxuezpln.supabase.co",
]) {
  await probe(
    `CAT-READONLY-reject-receiver-${host}`,
    "false;503;0",
    async () => {
      let forbiddenCalls = 0;
      const harness = deliveryHarness();
      const api = load(
        "src/app/api/briefings/route.ts",
        {
          ...activeEnv,
          BRIEFING_WEBHOOK_URL: `https://${host}/rest/v1/rpc/synthetic`,
        },
        async (input, init = {}) => {
          if (
            new URL(String(input)).hostname !== `${project}.supabase.co` ||
            init.method === "POST"
          )
            forbiddenCalls++;
          return harness.fetcher(input, init);
        },
      );
      const capability = await api.GET().json();
      const response = await api.POST(request("source-read-only-0001"));
      return `${capability.configured};${response.status};${forbiddenCalls}`;
    },
  );
}

await probe(
  "CAT-READONLY-reject-operational-persistence",
  "503;0",
  async () => {
    let calls = 0;
    const api = load(
      "src/app/api/briefings/route.ts",
      {
        ...activeEnv,
        SUPABASE_URL: "https://doufsxqlfjyuvxuezpln.supabase.co",
      },
      async () => {
        calls++;
        return Response.json({});
      },
    );
    const response = await api.POST(request("source-no-persistence-0001"));
    return `${response.status};${calls}`;
  },
);

await probe("CAT-READONLY-no-write-redirects", true, async () => {
  const harness = deliveryHarness();
  const writes = [];
  const api = load(
    "src/app/api/briefings/route.ts",
    activeEnv,
    async (input, init = {}) => {
      if (init.method === "POST") writes.push(init);
      return harness.fetcher(input, init);
    },
  );
  const response = await api.POST(request("source-no-redirect-0001"));
  return (
    response.status === 201 &&
    writes.length > 1 &&
    writes.every((init) => init.redirect === "error")
  );
});

await probe(
  "AUD-39-catalog-read-redirects-disabled",
  "GET:error,GET:error",
  async () => {
    const requests = [];
    const api = load(
      "src/lib/site-database.ts",
      activeEnv,
      async (_input, init) => {
        requests.push(`${init.method}:${init.redirect}`);
        return new Response(JSON.stringify([item]), {
          headers: { "content-range": "0-0/1" },
        });
      },
    );
    await api.getSiteCatalogPage();
    await api.getSiteProductBySlug(item.slug);
    return requests.join(",");
  },
);

await probe("AUD-40-approved-webhook-host", true, async () => {
  const api = load("src/lib/briefing-delivery-config.ts", {
    ...activeEnv,
    NODE_ENV: "production",
    BRIEFING_WEBHOOK_URL: "https://crm.example.com/v1/briefings?tenant=promo",
    BRIEFING_WEBHOOK_ALLOWED_HOSTS: "crm.example.com",
  });
  return (
    api.briefingDeliveryConfig()?.destination ===
    "https://crm.example.com/v1/briefings?tenant=promo"
  );
});

await probe("AUD-41-webhook-ssrf-destinations-rejected", true, async () => {
  const unsafe = [
    ["https://127.0.0.1/hook", "127.0.0.1"],
    ["https://2130706433/hook", "2130706433"],
    ["https://localhost/hook", "localhost"],
    ["https://receiver.local/hook", "receiver.local"],
    ["https://crm.example.com.evil.test/hook", "crm.example.com"],
    ["https://crm.example.com:8443/hook", "crm.example.com"],
    ["https://crm.example.com/hook#token", "crm.example.com"],
    ["https://user:password@crm.example.com/hook", "crm.example.com"],
    ["https://crm.example.com/hook", ""],
    ["http://user:password@localhost:3999/hook", "", "development"],
    ["http://localhost:3999/hook#token", "", "development"],
  ];
  return unsafe.every(([destination, allowed, nodeEnv = "production"]) => {
    const api = load("src/lib/briefing-delivery-config.ts", {
      ...activeEnv,
      NODE_ENV: nodeEnv,
      BRIEFING_WEBHOOK_URL: destination,
      BRIEFING_WEBHOOK_ALLOWED_HOSTS: allowed,
    });
    return api.briefingDeliveryConfig() === null;
  });
});

await probe("AUD-42-strict-json-content-type", "415,415,201", async () => {
  const harness = deliveryHarness();
  const api = load(
    "src/app/api/briefings/route.ts",
    activeEnv,
    harness.fetcher,
  );
  const responses = await Promise.all([
    api.POST(
      request("audit-content-type-0001", payload, {
        "Content-Type": "text/plain; application/json",
      }),
    ),
    api.POST(
      request("audit-content-type-0002", payload, {
        "Content-Type": "application/json-patch+json",
      }),
    ),
    api.POST(
      request("audit-content-type-0003", payload, {
        "Content-Type": "Application/JSON; charset=utf-8",
      }),
    ),
  ]);
  return responses.map((response) => response.status).join(",");
});

await probe("AUD-43-empty-selection-rejected", "422;0", async () => {
  const harness = deliveryHarness();
  const api = load(
    "src/app/api/briefings/route.ts",
    activeEnv,
    harness.fetcher,
  );
  const response = await api.POST(
    request("audit-empty-items-0001", { ...payload, items: [] }),
  );
  return `${response.status};${harness.webhookCalls()}`;
});

await probe(
  "AUD-44-claim-protocol-mismatch-fails-closed",
  "503;0",
  async () => {
    const harness = deliveryHarness();
    const api = load(
      "src/app/api/briefings/route.ts",
      activeEnv,
      async (input, init = {}) => {
        const response = await harness.fetcher(input, init);
        if (
          new URL(String(input)).pathname.endsWith(
            "/claim_premium_briefing_delivery_v2",
          )
        ) {
          const [claim] = await response.json();
          return Response.json([{ ...claim, protocol: "PB-OTHERPROTO01" }]);
        }
        return response;
      },
    );
    const response = await api.POST(request("audit-claim-mismatch-0001"));
    return `${response.status};${harness.webhookCalls()}`;
  },
);

await probe(
  "AUD-45-stale-lease-cannot-finalize-new-attempt",
  "503,200;2;delivered",
  async () => {
    const harness = deliveryHarness();
    const key = "audit-lease-fence-0001";
    let webhookCalls = 0;
    let releaseFirst;
    let notifyFirst;
    const firstStarted = new Promise((resolve) => {
      notifyFirst = resolve;
    });
    const firstGate = new Promise((resolve) => {
      releaseFirst = resolve;
    });
    const api = load(
      "src/app/api/briefings/route.ts",
      activeEnv,
      async (input, init = {}) => {
        if (new URL(String(input)).hostname === "localhost") {
          webhookCalls += 1;
          if (webhookCalls === 1) {
            notifyFirst();
            await firstGate;
          }
          return Response.json({ accepted: true });
        }
        return harness.fetcher(input, init);
      },
    );
    const attemptA = api.POST(request(key));
    await firstStarted;
    harness.expireLease(key);
    const attemptB = await api.POST(request(key));
    releaseFirst();
    const lateAttemptA = await attemptA;
    return `${lateAttemptA.status},${attemptB.status};${webhookCalls};${harness.deliveryStatus(key)}`;
  },
);

await probe(
  "AUD-46-catalog-parameter-cache-bypass-rejected",
  "400,400;0",
  async () => {
    let databaseCalls = 0;
    const api = load("src/app/api/catalog/route.ts", activeEnv, async () => {
      databaseCalls += 1;
      return new Response(JSON.stringify([item]), {
        headers: { "content-range": "0-0/1" },
      });
    });
    const unknown = await api.GET(
      new NextRequest("http://localhost:3111/api/catalog?cache-bust=random"),
    );
    const repeated = await api.GET(
      new NextRequest("http://localhost:3111/api/catalog?page=1&page=2"),
    );
    return `${unknown.status},${repeated.status};${databaseCalls}`;
  },
);

await probe("AUD-47-database-key-capabilities-fail-closed", true, async () => {
  let calls = 0;
  for (const key of ["sb_secret_synthetic", "eyJlegacy", "arbitrary"]) {
    const api = load(
      "src/lib/site-database.ts",
      { ...activeEnv, SUPABASE_PUBLISHABLE_KEY: key },
      async () => {
        calls += 1;
        return Response.json([]);
      },
    );
    try {
      await api.getSiteCatalogPage();
      return false;
    } catch {
      // Invalid public capabilities must fail before fetch.
    }
  }
  const delivery = load("src/lib/briefing-delivery-config.ts", {
    ...activeEnv,
    ["SUPABASE" + "_SECRET_KEY"]: "sb_publishable_synthetic",
  });
  return calls === 0 && delivery.briefingDeliveryConfig() === null;
});

await probe("AUD-48-control-characters-rejected", true, async () => {
  const api = load("src/lib/briefing.ts");
  const invalid = [
    { ...payload, name: "Pessoa\u0000Sintética" },
    { ...payload, company: "Empresa\nInjetada" },
    { ...payload, occasion: "Evento\u001fPrivado" },
    { ...payload, phone: "11999\n998888", contactChannel: "phone" },
    { ...payload, message: "Texto\u0000oculto" },
  ];
  const multiline = api.parseBriefingInput({
    ...payload,
    message: "Linha um\nLinha dois",
  });
  return (
    invalid.every((candidate) => !api.parseBriefingInput(candidate).ok) &&
    multiline.ok
  );
});

await probe(
  "AUD-49-app-before-database-fails-before-webhook",
  "503;0",
  async () => {
    const harness = deliveryHarness();
    const api = load(
      "src/app/api/briefings/route.ts",
      activeEnv,
      async (input, init = {}) => {
        if (
          new URL(String(input)).pathname.endsWith(
            "/claim_premium_briefing_delivery_v2",
          )
        )
          return new Response("missing RPC", { status: 404 });
        return harness.fetcher(input, init);
      },
    );
    const response = await api.POST(request("audit-app-first-0001"));
    return `${response.status};${harness.webhookCalls()}`;
  },
);

await probe(
  "AUD-50-database-before-app-fails-before-webhook",
  "503;0;1",
  async () => {
    const harness = deliveryHarness();
    let oldRpcCalls = 0;
    const api = load(
      "src/app/api/briefings/route.ts",
      activeEnv,
      async (input, init = {}) => {
        const path = new URL(String(input)).pathname;
        if (path.endsWith("/claim_premium_briefing_delivery")) {
          oldRpcCalls += 1;
          return new Response("removed RPC", { status: 404 });
        }
        return harness.fetcher(input, init);
      },
      (source, file) =>
        file === "src/app/api/briefings/route.ts"
          ? source.replaceAll(
              "_premium_briefing_delivery_v2",
              "_premium_briefing_delivery",
            )
          : source,
    );
    const response = await api.POST(request("audit-database-first-0001"));
    return `${response.status};${harness.webhookCalls()};${oldRpcCalls}`;
  },
);

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
