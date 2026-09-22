// Diagnostic probes, not acceptance tests. Known failures remain visible in the report.
// TypeScript modules run with synthetic data and a stubbed fetch: no remote writes.
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
const payload = {
  name: "Pessoa sintética",
  company: "Empresa de teste",
  email: "teste@example.com",
  occasion: "Auditoria local",
  items: [],
};
function request(key, body = payload, headers = {}) {
  return new NextRequest("http://localhost:3111/api/briefings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Idempotency-Key": key,
      ...headers,
    },
    body: JSON.stringify(body),
  });
}
await probe("AUD-01-concurrent-idempotency", 1, async () => {
  let calls = 0;
  const api = load(
    "src/app/api/briefings/route.ts",
    { BRIEFING_WEBHOOK_URL: "http://localhost:3999/mock" },
    async () => {
      calls++;
      await new Promise((resolve) => setTimeout(resolve, 30));
      return new Response("{}", { status: 200 });
    },
  );
  const responses = await Promise.all([
    api.POST(request("audit-concurrent-0001")),
    api.POST(request("audit-concurrent-0001")),
  ]);
  assert.ok(responses.every((r) => r.status === 201 || r.status === 200));
  return calls;
});
await probe("AUD-02-key-payload-conflict", 409, async () => {
  const api = load("src/app/api/briefings/route.ts", {
    BRIEFING_WEBHOOK_URL: "http://localhost:3999/mock",
  });
  assert.equal((await api.POST(request("audit-conflict-0001"))).status, 201);
  return (
    await api.POST(
      request("audit-conflict-0001", { ...payload, company: "Outra empresa" }),
    )
  ).status;
});
await probe("AUD-03-body-without-content-length", 413, async () => {
  const api = load("src/app/api/briefings/route.ts", {
    BRIEFING_WEBHOOK_URL: "http://localhost:3999/mock",
  });
  return (
    await api.POST(
      request("audit-large-body-0001", {
        ...payload,
        unexpected: "x".repeat(20000),
      }),
    )
  ).status;
});
await probe("AUD-04-invalid-destination-capability", false, async () => {
  const api = load("src/app/api/briefings/route.ts", {
    BRIEFING_WEBHOOK_URL: "not-a-url",
  });
  return (await api.GET().json()).configured;
});
await probe("AUD-05-invalid-date-suffix", false, async () => {
  const api = load("src/lib/briefing.ts");
  return api.validateBriefing({ ...payload, date: "2026-12-01invalid" }).ok;
});
await probe("AUD-06-source-pagination-truncation", 30, async () => {
  const rows = Array.from({ length: 30 }, (_, i) => ({
    id: `00000000-0000-4000-8000-${String(i).padStart(12, "0")}`,
    sku: `AUD${i}`,
    slug: `aud-${i}`,
    name: `Auditoria ${i}`,
    original_name: `Auditoria ${i}`,
    category: "Escrita",
    tagline: "Teste",
    description: "Teste",
    image_path: "/images/caderno.webp",
    minimum: 1,
    personalizable: true,
    source_date: "2026-09-22",
  }));
  const api = load(
    "src/lib/site-database.ts",
    {
      SUPABASE_PROJECT_REF: project,
      SUPABASE_URL: `https://${project}.supabase.co`,
      SUPABASE_PUBLISHABLE_KEY: "synthetic",
    },
    async (url) =>
      new Response(
        JSON.stringify(
          rows.slice(0, Number(new URL(url).searchParams.get("limit"))),
        ),
      ),
  );
  return (await api.getSiteCatalog()).length;
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
        return new Response("[]");
      },
    );
    try {
      await api.getSiteCatalog();
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
  passed: results.filter((r) => r.passed).length,
  failed: results.filter((r) => !r.passed).length,
};
writeFileSync(
  "docs/audit/plan-scenarios.json",
  JSON.stringify(report, null, 2) + "\n",
);
console.log(JSON.stringify(report, null, 2));
// A diagnostic report can succeed while finding defects; do not use it as a release gate.
