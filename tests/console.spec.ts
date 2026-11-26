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
test("o console qualifica e encerra um lead pela tela", async ({ page }) => {
  // A lista responde com a situação que o banco teria depois da última gravação,
  // então o teste prova que a tela reflete o que foi registrado.
  let situacao = "received";
  const briefing = {
    id: "11111111-1111-4111-8111-111111111111",
    protocol: "PB-AAAAAAAAAAAA",
    contact_name: "Ana",
    company: "ACME",
    email: "ana@acme.test",
    occasion: "Corporativo",
    desired_date: null,
    budget: null,
    message: null,
    items: [{ sku: "CANETA-A", quantity: 100 }],
    created_at: "2026-11-26T10:00:00.000Z",
    delivery_status: "pending",
    delivery_attempts: 0,
    last_delivery_error: null,
    delivered_at: null,
  };

  await page.goto("/operacoes");
  await page.getByLabel("Token de acesso").fill(token);
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page.getByRole("tab", { name: "Leads" })).toBeVisible();

  // Only after the real login do the leads and actions get stubbed, so the test
  // runs identically with or without premium database credentials in CI.
  await page.route("**/api/operacoes/dados**", async (route) => {
    const escopo =
      new URL(route.request().url()).searchParams.get("escopo") ?? "situacao";
    const dados = escopo === "briefings" ? [{ ...briefing, status: situacao }] : [];
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ escopo, dados }),
    });
  });
  let enviado: unknown = null;
  await page.route("**/api/operacoes/acoes", async (route) => {
    enviado = route.request().postDataJSON();
    const pedido = enviado as { acao?: string; status?: string };
    if (pedido?.acao === "briefing-status" && pedido.status)
      situacao = pedido.status;
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ mensagem: "Situação atualizada." }),
    });
  });

  await page.getByRole("tab", { name: "Leads" }).click();
  const seletor = page.getByLabel("Situação do lead PB-AAAAAAAAAAAA", {
    exact: true,
  });
  await expect(seletor).toHaveValue("received");
  const gravar = page.getByRole("button", {
    name: "Gravar situação do lead PB-AAAAAAAAAAAA",
  });
  await expect(gravar).toBeDisabled();
  await seletor.selectOption("qualified");
  await expect(gravar).toBeEnabled();
  await expect.poll(() => enviado).toBeNull();
  await gravar.click();
  await expect
    .poll(() => enviado)
    .toEqual({
      acao: "briefing-status",
      id: briefing.id,
      status: "qualified",
    });
  // Depois de gravar, a lista é recarregada: a situação exibida é a que o banco
  // guardou e o botão volta ao estado de espera.
  await expect(seletor).toHaveValue("qualified");
  await expect(gravar).toBeDisabled();
  await expect(page.getByText("Situação atualizada.")).toBeVisible();
  // Navegar pelas opções do seletor fechado (setas do teclado) não pode gravar
  // nada: só o botão envia.
  await seletor.focus();
  await page.keyboard.press("ArrowDown");
  await expect(seletor).toHaveValue("closed");
  await expect
    .poll(() => enviado)
    .toEqual({
      acao: "briefing-status",
      id: briefing.id,
      status: "qualified",
    });
  await gravar.click();
  await expect
    .poll(() => enviado)
    .toEqual({
      acao: "briefing-status",
      id: briefing.id,
      status: "closed",
    });
  await expect(seletor).toHaveValue("closed");
  await expect(gravar).toBeDisabled();
});

test("o console grava a ficha técnica e libera um contato bloqueado", async ({
  page,
}) => {
  const item = {
    id: "22222222-2222-4222-8222-222222222222",
    sku: "CANETA-A",
    slug: "caneta-a",
    name: "Caneta A",
    category: "Escritório",
    minimum: 50,
    personalizable: true,
    editorial_order: 1,
    published: true,
    published_from: null,
    published_until: null,
    materials: [],
    dimensions: null,
    weight_g: null,
    packaging: null,
    source_date: "2026-11-26",
    updated_at: "2026-11-26T10:01:34.413148+00:00",
  };
  const contato = "b".repeat(16);

  await page.goto("/operacoes");
  await page.getByLabel("Token de acesso").fill(token);
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page.getByRole("tab", { name: "Catálogo" })).toBeVisible();

  await page.route("**/api/operacoes/dados**", async (route) => {
    const escopo =
      new URL(route.request().url()).searchParams.get("escopo") ?? "situacao";
    const dados = escopo === "catalogo" ? [item] : [];
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ escopo, dados }),
    });
  });
  await page.route("**/api/operacoes/dados?escopo=limites", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        escopo: "limites",
        dados: [
          {
            client_hash: "b".repeat(64),
            attempts: 5,
            updated_at: "2026-11-26T10:00:00.000Z",
          },
        ],
      }),
    });
  });
  let enviado: unknown = null;
  await page.route("**/api/operacoes/acoes", async (route) => {
    enviado = route.request().postDataJSON();
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ mensagem: "Gravado." }),
    });
  });

  await page.getByRole("tab", { name: "Catálogo" }).click();
  await page.getByRole("button", { name: "Editar ficha" }).click();
  await page.getByLabel("Materiais (um por linha, até 5)").fill("Papel kraft");
  await page.getByLabel("Medidas").fill("10 x 2 x 2 cm");
  await page.getByLabel("Peso em gramas").fill("35");
  await page.getByLabel("Embalagem").fill("Sacola");
  await page.getByRole("button", { name: "Salvar ficha" }).click();
  await expect
    .poll(() => enviado)
    .toEqual({
      acao: "catalogo-ficha",
      id: item.id,
      materials: ["Papel kraft"],
      dimensions: "10 x 2 x 2 cm",
      weightG: "35",
      packaging: "Sacola",
      expectedUpdatedAt: "2026-11-26T10:01:34.413148+00:00",
    });

  await page.getByRole("tab", { name: "Limites" }).click();
  await page.getByRole("button", { name: `Liberar contato ${contato}` }).click();
  await expect
    .poll(() => enviado)
    .toEqual({ acao: "limites-liberar", clientHash: "b".repeat(64) });
});