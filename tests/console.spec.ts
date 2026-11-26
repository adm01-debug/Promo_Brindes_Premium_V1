import { expect, test } from "@playwright/test";

const token = "console-e2e-token-0000000000000001";
const sessionCookie = "promo_operacoes";

test("o console recusa leitura e gravação sem sessão", async ({ request }) => {
  const read = await request.get("/api/operacoes/dados?escopo=situacao");
  expect(read.status()).toBe(401);
  const write = await request.post("/api/operacoes/acoes", {
    data: { acao: "limites-limpar" },
  });
  expect(write.status()).toBe(401);
});

test("sem sessão a tela mostra apenas a entrada", async ({ page }) => {
  await page.goto("/operacoes");
  await expect(
    page.getByRole("heading", { name: "Console de operação" }),
  ).toBeVisible();
  await expect(page.getByLabel("Token de acesso")).toBeVisible();
  await expect(page.getByRole("tab", { name: "Catálogo" })).toHaveCount(0);
});

test("token errado é recusado e não cria sessão", async ({ page }) => {
  await page.goto("/operacoes");
  await page.getByLabel("Token de acesso").fill("token-errado-0000000000000000000");
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page.locator("p.console-feedback").first()).toHaveText(
    "Token incorreto.",
  );
  const cookies = await page.context().cookies();
  expect(cookies.some((cookie) => cookie.name === sessionCookie)).toBe(false);
});

test("o token correto abre a sessão e as abas carregam", async ({ page }) => {
  await page.goto("/operacoes");
  await page.getByLabel("Token de acesso").fill(token);
  await page.getByRole("button", { name: "Entrar" }).click();
  const situacao = page.getByRole("tab", { name: "Situação" });
  await expect(situacao).toHaveAttribute("aria-selected", "true");
  const cookies = await page.context().cookies();
  const session = cookies.find((cookie) => cookie.name === sessionCookie);
  expect(session?.httpOnly).toBe(true);

  await page.getByRole("tab", { name: "Catálogo" }).click();
  await expect(page.getByRole("tab", { name: "Catálogo" })).toHaveAttribute(
    "aria-selected",
    "true",
  );

  const unknown = await page.request.get("/api/operacoes/dados?escopo=segredo");
  expect(unknown.status()).toBe(400);

  const catalog = await page.request.get("/api/operacoes/dados?escopo=catalogo");
  if (catalog.status() === 503) {
    // CI runs without premium database credentials, so the console must degrade
    // with an explicit message instead of showing empty data as if it were real.
    expect((await catalog.json()).mensagem).toContain("não está configurado");
    await expect(
      page.locator('p.console-note[role="alert"]').first(),
    ).toContainText("banco premium");
  } else {
    expect(catalog.status()).toBe(200);
    const catalogBody = await catalog.json();
    expect(catalogBody.escopo).toBe("catalogo");
    expect(Array.isArray(catalogBody.dados)).toBe(true);

    const limits = await page.request.get("/api/operacoes/dados?escopo=limites");
    expect(limits.status()).toBe(200);
    const limitsBody = await limits.json();
    expect(limitsBody.escopo).toBe("limites");
    expect(Array.isArray(limitsBody.dados)).toBe(true);

    await page.getByRole("tab", { name: "Situação" }).click();
    await expect(
      page.getByRole("heading", { name: "Envio ao comercial" }),
    ).toBeVisible();
  }

  await page.getByRole("button", { name: "Sair" }).click();
  await expect(page.getByLabel("Token de acesso")).toBeVisible();
});