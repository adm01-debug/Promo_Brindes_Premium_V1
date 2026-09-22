import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFile } from "node:fs/promises";

test("busca por SKU, recuperação de resultado vazio e filtro por categoria", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Buscar presentes", exact: true })
    .click();
  await page.getByLabel("Nome, categoria ou código do produto").fill("08255");
  await page
    .getByRole("button", { name: "Ver resultados", exact: true })
    .click();
  await expect(page.locator(".product-card")).toHaveCount(1);
  await expect(page.locator(".product-card h3")).toHaveText("Kit executivo");
  await page
    .getByRole("button", { name: "Buscar presentes", exact: true })
    .click();
  await page
    .getByLabel("Nome, categoria ou código do produto")
    .fill("inexistente-000");
  await page
    .getByRole("button", { name: "Ver resultados", exact: true })
    .click();
  await expect(
    page.getByText("Vamos encontrar outra possibilidade."),
  ).toBeVisible();
  await page.getByRole("button", { name: "Explorar todas as peças" }).click();
  await page.getByRole("button", { name: "Escrita", exact: true }).click();
  await expect(page.locator(".product-card")).toHaveCount(2);
});

test("ordenação pública é acionável e compartilhável", async ({ page }) => {
  await page.goto("/");
  const sort = page.locator(".catalog-sort select");
  await sort.selectOption("nome");
  await expect(sort).toHaveValue("nome");
  await expect(page).toHaveURL(/sort=nome/);
  await expect(page.locator(".product-card").first()).toBeVisible();
});

test("histórico restaura a consulta compartilhável", async ({ page }) => {
  await page.goto("/?q=08255");
  await expect(page.locator(".product-card")).toHaveCount(1);
  await page.getByRole("button", { name: "Limpar" }).click();
  await expect(page).not.toHaveURL(/q=08255/);
  await page.goBack();
  await expect(page).toHaveURL(/q=08255/);
  await expect(page.locator(".product-card")).toHaveCount(1);
});

test("resposta atrasada não substitui o filtro mais recente", async ({
  page,
}) => {
  let releaseSlowRequest!: () => void;
  let slowRequestStarted!: () => void;
  const slowRequestGate = new Promise<void>((resolve) => {
    releaseSlowRequest = resolve;
  });
  const slowRequest = new Promise<void>((resolve) => {
    slowRequestStarted = resolve;
  });
  await page.route(/\/api\/catalog\?/, async (route) => {
    const category = new URL(route.request().url()).searchParams.get(
      "category",
    );
    if (category !== "Escrita") {
      await route.continue();
      return;
    }
    const response = await route.fetch();
    slowRequestStarted();
    await slowRequestGate;
    await route.fulfill({ response }).catch(() => undefined);
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Escrita", exact: true }).click();
  await slowRequest;
  await page.getByRole("button", { name: "Viagem", exact: true }).click();
  await expect(page.locator(".product-card h3")).toHaveText([
    "Mochila executive 22 L",
  ]);
  releaseSlowRequest();
  await expect(page).toHaveURL(/categoria=Viagem/);
  await expect(page.locator(".product-card h3")).toHaveText([
    "Mochila executive 22 L",
  ]);
});

test("falha da curadoria preserva o contexto e permite recuperar", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", {
      name: "Adicionar Kit executivo à seleção",
      exact: true,
    })
    .click();
  await page.route(/\/api\/catalog\?/, (route) =>
    route.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({ error: "CATALOG_UNAVAILABLE" }),
    }),
  );
  await page.getByRole("button", { name: "Escrita", exact: true }).click();
  await expect(
    page.getByRole("heading", {
      name: "Não foi possível consultar a curadoria agora.",
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Minha seleção, 1 produtos" }),
  ).toBeVisible();
  await page.unroute(/\/api\/catalog\?/);
  await page.getByRole("button", { name: "Tentar novamente" }).click();
  await expect(page.locator(".product-card")).toHaveCount(2);
});

test("modo offline explica a falha e recupera a curadoria após reconexão", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", {
      name: "Adicionar Kit executivo à seleção",
      exact: true,
    })
    .click();
  await page.context().setOffline(true);
  await page.getByRole("button", { name: "Escrita", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Você está sem conexão no momento." }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Minha seleção, 1 produtos" }),
  ).toBeVisible();
  await page.context().setOffline(false);
  await page.getByRole("button", { name: "Tentar novamente" }).click();
  await expect(page.locator(".product-card")).toHaveCount(2);
});

test("imagem indisponível mostra fallback sem quebrar a peça", async ({
  page,
}) => {
  await page.route(/executivo\.webp/, (route) =>
    route.fulfill({ status: 403 }),
  );
  await page.goto("/");
  await expect(
    page.getByRole("img", {
      name: "Imagem de Kit executivo temporariamente indisponível",
    }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Conhecer Kit executivo", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
});

test("favoritos e seleção persistem, mínimo é respeitado e remoção funciona", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", {
      name: "Adicionar Kit executivo aos favoritos",
      exact: true,
    })
    .click();
  await page
    .getByRole("button", {
      name: "Adicionar Kit executivo à seleção",
      exact: true,
    })
    .click();
  await page.reload();
  await page.getByRole("button", { name: "Minha seleção, 1 produtos" }).click();
  const qty = page.getByLabel("Quantidade de Kit executivo", { exact: true });
  await expect(qty).toHaveValue("5");
  await expect(
    page.getByRole("button", { name: "Diminuir quantidade de Kit executivo" }),
  ).toBeDisabled();
  await qty.fill("50");
  await page
    .getByRole("button", { name: "Aumentar quantidade de Kit executivo" })
    .click();
  await expect(qty).toHaveValue("51");
  await page.getByRole("button", { name: "Remover", exact: true }).click();
  await expect(page.getByText("Ainda está buscando inspiração?")).toBeVisible();
  await page
    .getByRole("button", { name: "Fechar janela", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Ver favoritos", exact: true })
    .click();
  await expect(page.locator(".product-card")).toHaveCount(1);
});

test("briefing exporta dados reais e não envia formulário a serviço remoto", async ({
  page,
}) => {
  const posts: string[] = [];
  page.on("request", (req) => {
    if (req.method() === "POST") posts.push(req.url());
  });
  await page.goto("/");
  await page
    .getByRole("button", {
      name: "Adicionar Kit executivo à seleção",
      exact: true,
    })
    .click();
  await page.getByRole("button", { name: "Minha seleção, 1 produtos" }).click();
  await page
    .getByRole("button", { name: "Preparar meu briefing", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Baixar meu briefing", exact: true })
    .click();
  await expect(page.getByLabel("Seu nome", { exact: true })).toBeFocused();
  await page.getByLabel("Seu nome", { exact: true }).fill("Pessoa de teste");
  await page.getByLabel("Empresa", { exact: true }).fill("Empresa de teste");
  await page
    .getByLabel("E-mail corporativo", { exact: true })
    .fill("teste@example.com");
  const downloadPromise = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Baixar meu briefing", exact: true })
    .click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("briefing-promo-premium.txt");
  const body = await readFile((await download.path())!, "utf8");
  expect(body).toContain("SKU 08255");
  expect(body).toContain("5 unidades");
  expect(body).toContain("0144f10f-c311-47eb-afd6-14b9ebef35b6");
  expect(body).toContain("não foi enviado");
  await expect(
    page.getByText("Seu briefing está pronto.", { exact: true }),
  ).toBeVisible();
  expect(posts).toEqual([]);
  const local = await page.evaluate(() => JSON.stringify(localStorage));
  expect(local).not.toContain("teste@example.com");
});

test("resposta sem protocolo não confirma envio comercial", async ({
  page,
}) => {
  await page.route("**/api/briefings", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body:
        route.request().method() === "GET"
          ? JSON.stringify({ configured: true })
          : "{}",
    }),
  );
  await page.goto("/");
  await page.getByRole("button", { name: "Minha seleção, 0 produtos" }).click();
  await expect(
    page.getByText(
      "O envio registra uma solicitação para análise comercial. Não é um pedido nem reserva estoque.",
    ),
  ).toBeVisible();
  await page.getByRole("button", { name: "Preparar meu briefing" }).click();
  await page.getByLabel("Seu nome", { exact: true }).fill("Pessoa de teste");
  await page.getByLabel("Empresa", { exact: true }).fill("Empresa de teste");
  await page
    .getByLabel("E-mail corporativo", { exact: true })
    .fill("teste@example.com");
  await page.getByRole("button", { name: "Enviar ao comercial" }).click();
  await expect(
    page.getByText("Não foi possível confirmar o protocolo. Tente novamente."),
  ).toBeVisible();
  await expect(page.getByLabel("Seu nome", { exact: true })).toHaveValue(
    "Pessoa de teste",
  );
  await expect(page.getByText("Seu briefing está pronto.")).toHaveCount(0);
});

test("diálogo contém foco e Escape restaura o acionador", async ({ page }) => {
  await page.goto("/");
  const trigger = page.getByRole("button", {
    name: "Conhecer Kit executivo",
    exact: true,
  });
  await trigger.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  for (let i = 0; i < 8; i++) {
    await page.keyboard.press("Tab");
    expect(
      await page.evaluate(() => !!document.activeElement?.closest("dialog")),
    ).toBe(true);
  }
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test("dados locais inválidos não corrompem seleção", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      "promo-premium-selection-v1",
      '{"unknown":10,"0144f10f-c311-47eb-afd6-14b9ebef35b6":-50}',
    );
    localStorage.setItem("promo-premium-favorites-v1", "not-json");
  });
  await page.goto("/");
  await expect(
    page.getByRole("button", { name: "Minha seleção, 0 produtos" }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

test("peça removida da curadoria é explicada e retirada da seleção", async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      "promo-premium-selection-v1",
      JSON.stringify({
        version: 1,
        savedAt: Date.now(),
        items: { "11111111-1111-4111-8111-111111111111": 1 },
      }),
    );
  });
  await page.goto("/");
  await expect(
    page.getByText(
      "Uma peça da sua seleção não está mais disponível e foi removida.",
    ),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Minha seleção, 0 produtos" }),
  ).toBeVisible();
});

test("seleção local expira e pode ser apagada explicitamente", async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      "promo-premium-selection-v1",
      JSON.stringify({
        version: 1,
        savedAt: Date.now() - 15 * 24 * 60 * 60 * 1000,
        items: { "0144f10f-c311-47eb-afd6-14b9ebef35b6": 5 },
      }),
    );
  });
  await page.goto("/");
  await expect(
    page.getByRole("button", { name: "Minha seleção, 0 produtos" }),
  ).toBeVisible();

  await page
    .getByRole("button", {
      name: "Adicionar Kit executivo à seleção",
      exact: true,
    })
    .click();
  await page.getByRole("button", { name: "Minha seleção, 1 produtos" }).click();
  await page.getByRole("button", { name: "Limpar toda a seleção" }).click();
  await expect(page.getByText("Ainda está buscando inspiração?")).toBeVisible();
});

test("mobile mantém conteúdo sem overflow e navegação funcional", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Abrir menu" }).click();
  await page
    .getByRole("navigation", { name: "Menu móvel" })
    .getByRole("button", { name: "A curadoria" })
    .click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  const curationHeading = page.getByRole("heading", {
    name: "O extraordinário está na escolha.",
  });
  await expect(curationHeading).toBeInViewport();
  await expect(curationHeading).toBeFocused();
  await page
    .getByRole("button", { name: "Conhecer Kit executivo", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
  expect(
    await page
      .getByRole("dialog")
      .evaluate((el) => el.scrollWidth <= el.clientWidth),
  ).toBe(true);
});

test("layout permanece operável na largura equivalente a reflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto("/");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Minha seleção, 0 produtos" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
});

test("axe: home e diálogo de projeto sem violações automatizadas", async ({
  page,
}) => {
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  let result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(result.violations).toEqual([]);
  await page.getByRole("button", { name: "Minha seleção, 0 produtos" }).click();
  await page
    .getByRole("button", { name: "Preparar meu briefing", exact: true })
    .click();
  result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(result.violations).toEqual([]);
});

test("axe: página permanente de produto sem violações automatizadas", async ({
  page,
}) => {
  await page.goto("/produtos/kit-executivo-2-pecas-08255");
  await page.evaluate(() => document.fonts.ready);
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(result.violations).toEqual([]);
});
