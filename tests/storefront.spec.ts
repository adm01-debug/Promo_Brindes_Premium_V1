import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFile } from "node:fs/promises";

async function openFilledBriefing(page: Page) {
  await page.goto("/");
  await page
    .getByRole("button", {
      name: "Adicionar Kit executivo à seleção",
      exact: true,
    })
    .click();
  await page.getByRole("button", { name: "Minha seleção, 1 produtos" }).click();
  await page.getByRole("button", { name: "Preparar meu briefing" }).click();
  await page.getByLabel("Seu nome", { exact: true }).fill("Pessoa de teste");
  await page.getByLabel("Empresa", { exact: true }).fill("Empresa de teste");
  await page
    .getByLabel("E-mail corporativo", { exact: true })
    .fill("teste@example.com");
}

async function auditInteractionTargets(page: Page) {
  const failures = await page
    .locator(
      "button, input, select, textarea, summary, a.button, a.text-button, a.icon-button",
    )
    .evaluateAll((elements) =>
      elements.flatMap((element) => {
        const rect = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        if (
          rect.width === 0 ||
          rect.height === 0 ||
          style.visibility === "hidden" ||
          style.display === "none"
        )
          return [];
        return rect.width >= 24 && rect.height >= 24
          ? []
          : [
              `${element.tagName.toLowerCase()}[${(element.getAttribute("aria-label") || element.textContent || "sem nome").trim().slice(0, 40)}]=${Math.round(rect.width)}x${Math.round(rect.height)}`,
            ];
      }),
    );
  expect(failures).toEqual([]);
}

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
  await expect(page.locator(".product-card")).toHaveCount(8);
  await page.getByRole("button", { name: "Escrita", exact: true }).click();
  await expect(page).toHaveURL(/categoria=Escrita/);
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

test("painel combina ocasião, tipo e quantidade e oferece remoção individual", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Buscar presentes", exact: true })
    .click();
  const dialog = page.getByRole("dialog", { name: "Filtrar curadoria" });
  await dialog.getByText("Um começo com significado", { exact: true }).click();
  await dialog.getByRole("button", { name: /^Escrita/ }).click();
  await dialog.getByLabel("Quantidade desejada").fill("1");
  await dialog.getByRole("button", { name: "Aplicar", exact: true }).click();
  await expect(
    dialog.getByRole("button", { name: "Ver 1 peça", exact: true }),
  ).toBeEnabled();
  await dialog.getByRole("button", { name: "Ver 1 peça", exact: true }).click();

  await expect(page).toHaveURL(/categoria=Escrita/);
  await expect(page).toHaveURL(/ocasiao=boas-vindas/);
  await expect(page).toHaveURL(/quantidade=1/);
  await expect(page.locator(".product-card h3")).toHaveText(
    "Caderno A5 em PET reciclado",
  );

  await page
    .getByRole("button", { name: "Remover ocasião Um começo com significado" })
    .click();
  await expect(page).not.toHaveURL(/ocasiao=/);
  await expect(page.locator(".product-card")).toHaveCount(2);
});

test("URL restaura múltiplas ocasiões, mínimo e sugestão explícita", async ({
  page,
}) => {
  await page.goto(
    "/?ocasiao=boas-vindas,novos-destinos&quantidade=1&q=caderna",
  );
  await expect(page).toHaveURL(/ocasiao=boas-vindas%2Cnovos-destinos/);
  await expect(page.locator(".catalog-suggestion")).toContainText(
    "Nenhuma correspondência exata",
  );
  await expect(page.locator(".product-card h3")).toHaveText(
    "Caderno A5 em PET reciclado",
  );
  await page
    .getByRole("button", { name: "Buscar presentes", exact: true })
    .click();
  const dialog = page.getByRole("dialog", { name: "Filtrar curadoria" });
  await expect(
    dialog.getByRole("checkbox", { name: /Um começo com significado/ }),
  ).toBeChecked();
  await expect(
    dialog.getByRole("checkbox", { name: /Para novos destinos/ }),
  ).toBeChecked();
  await expect(dialog.getByLabel("Quantidade desejada")).toHaveValue("1");
});

test("painel móvel mantém controles e ação final visíveis", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page
    .getByRole("button", { name: "Buscar presentes", exact: true })
    .click();
  const dialog = page.getByRole("dialog", { name: "Filtrar curadoria" });
  await expect(dialog).toBeVisible();
  await expect(
    dialog.getByLabel("Nome, categoria ou código do produto"),
  ).toBeVisible();
  await expect(
    dialog.getByRole("button", { name: /^Ver 8 peças$/ }),
  ).toBeVisible();
  const box = await dialog.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(390);
});

test("Voltar e Avançar restauram as novas facetas", async ({ page }) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Buscar presentes", exact: true })
    .click();
  const dialog = page.getByRole("dialog", { name: "Filtrar curadoria" });
  await dialog.getByText("Um começo com significado", { exact: true }).click();
  await expect(page).toHaveURL(/ocasiao=boas-vindas/);
  await dialog.getByRole("button", { name: /^Escrita/ }).click();
  await expect(page).toHaveURL(/categoria=Escrita/);

  await page.goBack();
  await expect(page).toHaveURL(/ocasiao=boas-vindas/);
  await expect(page).not.toHaveURL(/categoria=Escrita/);
  await expect(dialog.getByRole("button", { name: /^Todos/ })).toHaveAttribute(
    "aria-pressed",
    "true",
  );

  await page.goForward();
  await expect(page).toHaveURL(/categoria=Escrita/);
  await expect(
    dialog.getByRole("button", { name: /^Escrita/ }),
  ).toHaveAttribute("aria-pressed", "true");
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

test("categoria escolhida durante recuperação substitui a resposta anterior", async ({
  page,
}) => {
  let releaseRecovery!: () => void;
  let recoveryStarted!: () => void;
  const release = new Promise<void>((resolve) => (releaseRecovery = resolve));
  const started = new Promise<void>((resolve) => (recoveryStarted = resolve));
  await page.route(/\/api\/catalog\?/, async (route) => {
    const url = new URL(route.request().url());
    if (url.searchParams.has("category")) {
      await route.continue();
      return;
    }
    const response = await route.fetch();
    recoveryStarted();
    await release;
    await route.fulfill({ response }).catch(() => undefined);
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Todos", exact: true }).click();
  await started;
  await page.getByRole("button", { name: "Escrita", exact: true }).click();
  await expect(page).toHaveURL(/categoria=Escrita/);
  await expect(page.locator(".product-card")).toHaveCount(2);
  releaseRecovery();
  await expect(page.locator(".product-card")).toHaveCount(2);
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

test("briefing estruturado preserva dados e exporta escopo correto", async ({
  page,
}) => {
  await openFilledBriefing(page);
  await page.getByLabel("Quando precisa receber?").fill("2026-12-01");
  await page.getByLabel("Data do evento").fill("2026-11-30");
  await page
    .getByRole("button", { name: "Baixar meu briefing", exact: true })
    .click();
  await expect(
    page.getByText("A data de recebimento não pode ser posterior à do evento."),
  ).toBeVisible();
  await page.getByLabel("Data do evento").fill("2026-12-10");
  await page.getByLabel("Esse valor é para").selectOption("total");
  await page.getByLabel("Investimento considerado").fill("R$ 15.000");
  await page.getByLabel("Flexibilidade de recebimento").selectOption("fixed");
  await page.getByLabel("Como prefere o retorno?").selectOption("whatsapp");
  await page.getByRole("textbox", { name: /^Telefone/ }).fill("11999998888");
  await page.getByLabel("Sua identidade visual").selectOption("ready");
  await page.getByRole("button", { name: "Voltar", exact: true }).click();
  await page
    .getByRole("button", { name: "Preparar meu briefing", exact: true })
    .click();
  await expect(page.getByLabel("Investimento considerado")).toHaveValue(
    "R$ 15.000",
  );
  const downloadPromise = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Baixar meu briefing", exact: true })
    .click();
  const download = await downloadPromise;
  const body = await readFile((await download.path())!, "utf8");
  expect(body).toContain("Investimento total da ação: R$ 15.000");
  expect(body).toContain("Data do evento: 2026-12-10");
  expect(body).toContain("Canal de retorno: WhatsApp");
  expect(body).toContain("Identidade visual: logo pronto");
  expect(body).toContain("Telefone: 11999998888");
});

test("peça retirada depois da seleção bloqueia briefing desatualizado", async ({
  page,
}) => {
  await openFilledBriefing(page);
  const id = "0144f10f-c311-47eb-afd6-14b9ebef35b6";
  const current = await (
    await page.request.get(`/api/catalog?ids=${id}&pageSize=24`)
  ).json();
  await page.route(/\/api\/catalog\?ids=/, (route) =>
    route.fulfill({ json: { ...current, items: [], total: 0 } }),
  );
  let downloads = 0;
  page.on("download", () => downloads++);
  await page.getByRole("button", { name: "Baixar meu briefing" }).click();
  await expect(
    page.getByText(
      "Uma peça saiu da curadoria e foi removida. Revise sua seleção antes de continuar.",
    ),
  ).toBeVisible();
  await expect(page.getByText("Ainda está buscando inspiração?")).toBeVisible();
  expect(downloads).toBe(0);
});

test("mínimo atualizado exige revisão antes do briefing", async ({ page }) => {
  await openFilledBriefing(page);
  const id = "0144f10f-c311-47eb-afd6-14b9ebef35b6";
  const current = await (
    await page.request.get(`/api/catalog?ids=${id}&pageSize=24`)
  ).json();
  await page.route(/\/api\/catalog\?ids=/, (route) =>
    route.fulfill({
      json: {
        ...current,
        items: [{ ...current.items[0], minimum: 10 }],
      },
    }),
  );
  await page.getByRole("button", { name: "Baixar meu briefing" }).click();
  await expect(
    page.getByText(
      "O mínimo de uma peça mudou. Ajustamos a quantidade; revise antes de continuar.",
    ),
  ).toBeVisible();
  await expect(
    page.getByLabel("Quantidade de Kit executivo", { exact: true }),
  ).toHaveValue("10");
});

test("fonte indisponível impede exportar seleção sem conferência", async ({
  page,
}) => {
  await openFilledBriefing(page);
  await page.route(/\/api\/catalog\?ids=/, (route) =>
    route.fulfill({ status: 503, json: { error: "CATALOG_UNAVAILABLE" } }),
  );
  await page.getByRole("button", { name: "Baixar meu briefing" }).click();
  await expect(
    page.getByText(
      "Não foi possível conferir sua seleção no catálogo agora. Tente novamente antes de preparar o briefing.",
    ),
  ).toBeVisible();
  await expect(page.getByText("Seu briefing está pronto.")).toHaveCount(0);
});

test("seleção alterada durante conferência não exporta intenção antiga", async ({
  page,
}) => {
  await openFilledBriefing(page);
  const id = "0144f10f-c311-47eb-afd6-14b9ebef35b6";
  const current = await (
    await page.request.get(`/api/catalog?ids=${id}&pageSize=24`)
  ).json();
  let requestStarted!: () => void;
  let releaseResponse!: () => void;
  const started = new Promise<void>((resolve) => (requestStarted = resolve));
  const release = new Promise<void>((resolve) => (releaseResponse = resolve));
  await page.route(/\/api\/catalog\?ids=/, async (route) => {
    requestStarted();
    await release;
    await route.fulfill({ json: current });
  });
  let downloads = 0;
  page.on("download", () => downloads++);
  await page.getByRole("button", { name: "Baixar meu briefing" }).click();
  await started;
  await page.getByRole("button", { name: "Voltar", exact: true }).click();
  await page.getByRole("button", { name: "Limpar toda a seleção" }).click();
  releaseResponse();
  await expect(
    page.getByText("Sua seleção mudou durante a conferência. Tente novamente."),
  ).toBeVisible();
  expect(downloads).toBe(0);
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
  const configured = page.waitForResponse(
    (response) =>
      response.url().endsWith("/api/briefings") &&
      response.request().method() === "GET",
  );
  await openFilledBriefing(page);
  await configured;
  await expect(
    page.getByText(
      "Ao enviar, seus dados seguem ao canal comercial configurado para esta solicitação. A confirmação só aparece após a resposta do servidor.",
    ),
  ).toBeVisible();
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

test("templates públicos mantêm landmarks, H1 único e reflow em 320 px", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 720 });
  for (const path of [
    "/",
    "/catalogos",
    "/catalogos/boas-vindas",
    "/produtos/kit-executivo-2-pecas-08255",
    "/privacidade",
  ]) {
    await page.goto(path);
    await expect(page.locator("main")).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    const contentSemantics = await page.evaluate(() => {
      const headingLevels = [
        ...document.querySelectorAll("h1,h2,h3,h4,h5,h6"),
      ].map((heading) => Number(heading.tagName.slice(1)));
      const headingJumps = headingLevels.filter(
        (level, index) => index > 0 && level > headingLevels[index - 1] + 1,
      );
      const imageFailures = [...document.images].flatMap((image) => {
        if (!image.hasAttribute("alt")) return ["alt ausente"];
        if (
          image.alt === "" &&
          !image.closest(
            'a[aria-label], button[aria-label], [aria-hidden="true"]',
          )
        )
          return ["alt vazio fora de controle nomeado"];
        return [];
      });
      return { headingLevels, headingJumps, imageFailures };
    });
    expect(contentSemantics.headingLevels[0], path).toBe(1);
    expect(contentSemantics.headingJumps, path).toEqual([]);
    expect(contentSemantics.imageFailures, path).toEqual([]);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
      path,
    ).toBe(true);
  }
});

const interactionTargetRoutes = [
  { label: "home e diálogos", path: "/", dialogs: true },
  { label: "biblioteca de catálogos", path: "/catalogos" },
  { label: "coleção editorial", path: "/catalogos/boas-vindas" },
  {
    label: "ficha de produto",
    path: "/produtos/kit-executivo-2-pecas-08255",
  },
  { label: "privacidade", path: "/privacidade" },
] as const;

for (const route of interactionTargetRoutes) {
  test(`ações principais atendem alvo mínimo WCAG em ${route.label}`, async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(route.path);
    await auditInteractionTargets(page);

    if ("dialogs" in route && route.dialogs) {
      await page.getByRole("button", { name: "Buscar presentes" }).click();
      await auditInteractionTargets(page);
      await page.keyboard.press("Escape");
      await page
        .getByRole("button", { name: "Minha seleção, 0 produtos" })
        .click();
      await auditInteractionTargets(page);
      expect(
        await page
          .locator(".button")
          .first()
          .evaluate((element) => getComputedStyle(element).transitionDuration),
      ).toMatch(/^(0s|0\.001s)(, (0s|0\.001s))*$/);
    }
  });
}

test("teclado abre, opera e fecha o super filtro com foco restaurado", async ({
  page,
}) => {
  await page.goto("/");
  const trigger = page.getByRole("button", { name: "Buscar presentes" });
  await trigger.focus();
  await page.keyboard.press("Enter");
  const dialog = page.getByRole("dialog", { name: "Filtrar curadoria" });
  await expect(dialog).toBeVisible();
  const search = dialog.getByLabel("Nome, categoria ou código do produto");
  await search.focus();
  await page.keyboard.type("08255");
  await expect(search).toHaveValue("08255");
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test("jornada essencial pode ser concluída somente com comandos de teclado", async ({
  page,
}) => {
  await page.goto("/");
  const filterTrigger = page.getByRole("button", { name: "Buscar presentes" });
  await filterTrigger.focus();
  await page.keyboard.press("Enter");
  const dialog = page.getByRole("dialog", { name: "Filtrar curadoria" });
  const quantity = dialog.getByLabel("Quantidade desejada");
  await quantity.focus();
  await page.keyboard.type("5");
  await page.keyboard.press("Enter");
  const search = dialog.getByLabel("Nome, categoria ou código do produto");
  await search.focus();
  await page.keyboard.type("08255");
  await page.keyboard.press("Enter");
  await expect(dialog).toHaveCount(0);
  await expect(page.locator(".product-card h3")).toHaveText("Kit executivo");

  const favorite = page.locator(".product-card .favorite-button");
  await favorite.focus();
  await page.keyboard.press("Enter");
  await expect(favorite).toHaveAttribute("aria-pressed", "true");
  const add = page.getByRole("button", {
    name: "Adicionar Kit executivo à seleção",
  });
  await add.focus();
  await page.keyboard.press("Enter");
  const selection = page.getByRole("button", {
    name: "Minha seleção, 1 produtos",
  });
  await selection.focus();
  await page.keyboard.press("Enter");
  const project = page.getByRole("dialog", { name: "Seu projeto" });
  await expect(project).toBeVisible();
  const continueButton = project.getByRole("button", {
    name: "Preparar meu briefing",
  });
  await continueButton.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByLabel("Seu nome", { exact: true })).toBeVisible();
});

test("validação nativa leva o foco ao primeiro campo obrigatório e permite correção", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Minha seleção, 0 produtos" }).click();
  await page.getByRole("button", { name: "Preparar meu briefing" }).click();
  await page.getByRole("button", { name: "Baixar meu briefing" }).click();
  const name = page.getByLabel("Seu nome", { exact: true });
  await expect(name).toBeFocused();
  await expect(name).toHaveAttribute("aria-invalid", "true");
  await expect(name).toHaveAttribute(
    "aria-errormessage",
    "briefing-name-error",
  );
  await expect(page.locator(".form-error-summary")).toContainText(
    "Revise os campos indicados",
  );
  await expect(page.locator("#briefing-name-error")).toHaveText(
    "Informe seu nome.",
  );
  await name.fill("Pessoa de teste");
  await expect(name).toHaveAttribute("aria-invalid", "false");
  await page.getByRole("button", { name: "Baixar meu briefing" }).click();
  await expect(page.getByLabel("Empresa", { exact: true })).toBeFocused();
});

test("rede lenta mantém contexto, anuncia progresso e conclui sem sucesso fictício", async ({
  page,
}) => {
  await page.route(/\/api\/catalog\?/, async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 650));
    await route.continue();
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Escrita", exact: true }).click();
  await expect(page.locator(".catalog-loading")).toContainText(
    "Atualizando curadoria",
  );
  await expect(page.locator(".product-card h3")).toHaveText([
    "Caderno A5 em PET reciclado",
    "Caneta touch em alumínio",
  ]);
  await expect(page).toHaveURL(/categoria=Escrita/);
  await expect(page.getByText("Seu briefing está pronto.")).toHaveCount(0);
});

test("jornada pública não instala cookies nem chama terceiros", async ({
  page,
  context,
}) => {
  const foreignHosts = new Set<string>();
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (url.protocol.startsWith("http") && url.host !== "localhost:3107")
      foreignHosts.add(url.host);
  });
  await page.goto("/");
  await page.locator(".product-card .favorite-button").first().click();
  await page
    .getByRole("button", {
      name: "Adicionar Kit executivo à seleção",
      exact: true,
    })
    .click();
  await expect(
    page.getByRole("button", { name: "Minha seleção, 1 produtos" }),
  ).toBeVisible();
  const storage = await page.evaluate(() =>
    Object.fromEntries(
      Object.keys(localStorage).map((key) => [key, localStorage.getItem(key)]),
    ),
  );
  expect(Object.keys(storage).sort()).toEqual([
    "promo-premium-favorites-v1",
    "promo-premium-selection-v1",
  ]);
  expect(JSON.stringify(storage)).not.toMatch(/@|telefone|phone|email/i);
  expect(await context.cookies()).toEqual([]);
  expect([...foreignHosts]).toEqual([]);
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

test("axe: painel de filtros sem violações automatizadas", async ({ page }) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Buscar presentes", exact: true })
    .click();
  const result = await new AxeBuilder({ page })
    .include(".catalog-filter-modal")
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
