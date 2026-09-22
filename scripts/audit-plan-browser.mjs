// Diagnostic browser probes against a local production build. Delivery is intercepted.
import { chromium } from "@playwright/test";
import { writeFileSync } from "node:fs";

const origin = process.env.AUDIT_ORIGIN || "http://localhost:3111";
if (!/^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin))
  throw new Error("Local origin required");
const browser = await chromium.launch();
const results = [];
async function probe(id, expected, run, options = {}) {
  const context = await browser.newContext(options);
  try {
    const observed = await run(await context.newPage());
    results.push({ id, expected, observed, passed: observed === expected });
  } finally {
    await context.close();
  }
}
try {
  await probe("AUD-09-product-selection-expiry", true, async (page) => {
    await page.goto(`${origin}/produtos/kit-executivo-2-pecas-08255`);
    await page.getByRole("button", { name: "Incluir no meu projeto" }).click();
    await page.getByRole("button", { name: "Incluído na seleção" }).waitFor();
    return page.evaluate(
      () =>
        typeof JSON.parse(localStorage.getItem("promo-premium-selection-v1"))
          .savedAt === "number",
    );
  });
  await probe("AUD-10-clear-search-url", false, async (page) => {
    await page.goto(`${origin}/?q=caderno`);
    await page
      .locator(".active-filters")
      .getByRole("button", { name: "Limpar" })
      .click();
    return new URL(page.url()).searchParams.has("q");
  });
  await probe("AUD-11-browser-retry-key", true, async (page) => {
    const keys = [];
    await page.route("**/api/briefings", async (route) => {
      if (route.request().method() === "GET")
        return route.fulfill({ json: { configured: true } });
      keys.push(route.request().headers()["idempotency-key"]);
      await route.fulfill({
        status: 502,
        json: { error: "DESTINATION_FAILED" },
      });
    });
    await page.goto(origin);
    await page.getByRole("button", { name: /Minha seleção,/ }).click();
    await page.getByRole("button", { name: "Preparar meu briefing" }).click();
    await page.getByLabel("Seu nome", { exact: true }).fill("Teste local");
    await page.getByLabel("Empresa", { exact: true }).fill("Empresa sintética");
    await page.getByLabel("E-mail corporativo").fill("teste@example.com");
    const submit = page.getByRole("button", {
      name: "Enviar ao comercial",
      exact: true,
    });
    await submit.click();
    await page
      .getByRole("status")
      .filter({ hasText: "Não foi possível enviar" })
      .waitFor();
    const secondResponse = page.waitForResponse(
      (r) =>
        r.url().endsWith("/api/briefings") && r.request().method() === "POST",
    );
    await submit.click();
    await secondResponse;
    if (keys.length !== 2)
      throw new Error("Expected two intercepted delivery attempts");
    return keys[0] === keys[1];
  });
  await probe(
    "AUD-12-form-back-preserves-contact",
    "Teste local",
    async (page) => {
      await page.goto(origin);
      await page.getByRole("button", { name: /Minha seleção,/ }).click();
      await page.getByRole("button", { name: "Preparar meu briefing" }).click();
      await page.getByLabel("Seu nome", { exact: true }).fill("Teste local");
      await page.getByRole("button", { name: "Voltar", exact: true }).click();
      await page.getByRole("button", { name: "Preparar meu briefing" }).click();
      return page.getByLabel("Seu nome", { exact: true }).inputValue();
    },
  );
  await probe(
    "AUD-13-reduced-motion-explicit-scroll",
    false,
    async (page) => {
      await page.goto(origin);
      await page
        .getByRole("button", { name: /Gestos de reconhecimento/ })
        .waitFor();
      return page.evaluate(async () => {
        window.scrollTo({ top: 0, behavior: "instant" });
        document.querySelector(".collection-card").click();
        const positions = [];
        for (let i = 0; i < 12; i++) {
          await new Promise((resolve) => setTimeout(resolve, 30));
          positions.push(Math.round(window.scrollY));
        }
        return new Set(positions).size > 2;
      });
    },
    { reducedMotion: "reduce" },
  );
} finally {
  await browser.close();
}
const report = {
  generatedAt: new Date().toISOString(),
  scope: "Local Chromium; synthetic data; mocked delivery; no remote writes",
  results,
};
writeFileSync(
  "docs/audit/plan-browser-scenarios.json",
  JSON.stringify(report, null, 2) + "\n",
);
console.log(JSON.stringify(report, null, 2));
if (results.some((result) => !result.passed)) process.exit(1);
