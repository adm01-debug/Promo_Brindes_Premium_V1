import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("biblioteca chega no HTML com coleções reais e navegação pela home", async ({
  page,
  request,
}) => {
  const response = await request.get("/catalogos");
  expect(response.status()).toBe(200);
  const html = await response.text();
  expect(html).toContain("Para cada intenção");
  expect(html).toContain("/catalogos/boas-vindas");
  expect(html).toContain('rel="canonical"');
  expect(html).not.toContain("sb_secret_");
  expect(html).not.toContain("cost_price");
  await page.goto("/");
  await page
    .getByRole("navigation", { name: "Navegação principal", exact: true })
    .getByRole("link", { name: "Catálogos" })
    .click();
  await expect(page).toHaveURL(/\/catalogos$/);
  await expect(page.locator(".library-card")).toHaveCount(6);
  await expect(
    page.locator(".library-card-meta").filter({ hasText: "Coleção online" }),
  ).toHaveCount(6);
});

test("busca sem acentos, temas, URL e histórico preservam a intenção", async ({
  page,
}) => {
  await page.goto("/catalogos");
  await page.getByRole("button", { name: "Pessoas & conquistas" }).click();
  await expect(page).toHaveURL(/tema=pessoas/);
  await expect(page.locator(".library-card")).toHaveCount(2);
  await page.getByLabel("Qual é a ocasião?").fill("premiacao");
  await page.getByRole("button", { name: "Buscar", exact: true }).click();
  await expect(page.locator(".library-card")).toHaveCount(1);
  await expect(page.locator(".library-card h3")).toHaveText(
    "À altura de uma conquista",
  );
  await page.goBack();
  await expect(page.locator(".library-card")).toHaveCount(2);
  await expect(page.getByLabel("Qual é a ocasião?")).toHaveValue("");
  await page.goForward();
  await expect(page.getByLabel("Qual é a ocasião?")).toHaveValue("premiacao");
  await page.reload();
  await expect(page.locator(".library-card")).toHaveCount(1);
});

test("busca vazia de resultados permite limpar todos os filtros", async ({
  page,
}) => {
  await page.goto("/catalogos?q=viagem&tema=pessoas");
  await expect(page.locator(".library-card")).toHaveCount(0);
  await expect(
    page.getByText("Nenhum catálogo corresponde a essa combinação.", {
      exact: false,
    }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Ver todos os catálogos" }).click();
  await expect(page).toHaveURL(/\/catalogos$/);
  await expect(page.locator(".library-card")).toHaveCount(6);
});

test("tema desconhecido não elimina a biblioteca e busca limita entrada", async ({
  page,
}) => {
  await page.goto("/catalogos?tema=inexistente&q=CAF%C3%89");
  await expect(
    page.getByRole("button", { name: "Todos os catálogos", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".library-card")).toHaveCount(1);
  await expect(page.getByLabel("Qual é a ocasião?")).toHaveAttribute(
    "maxlength",
    "80",
  );
});

test("todos os catálogos abrem páginas com produtos publicados", async ({
  page,
  request,
}) => {
  await page.goto("/catalogos");
  const links = await page
    .locator(".library-card-cover")
    .evaluateAll((elements) =>
      elements.map((element) => element.getAttribute("href")!),
    );
  for (const link of links) {
    const response = await request.get(link);
    expect(response.status()).toBe(200);
    expect((await response.text()).replace(/<!--[\s\S]*?-->/g, "")).toContain(
      "peças publicadas nesta seleção",
    );
  }
  const missing = await request.get("/catalogos/nao-existe");
  expect(missing.status()).toBe(404);
});

test("coleção permite chegar à ficha e incluir a peça no projeto", async ({
  page,
}) => {
  await page.goto("/catalogos/boas-vindas");
  await expect(page.locator(".collection-product")).toHaveCount(3);
  await page.getByRole("link", { name: "Conhecer a peça" }).first().click();
  await expect(page).toHaveURL(/\/produtos\//);
  await page.getByRole("button", { name: "Incluir no meu projeto" }).click();
  await expect(
    page.getByRole("button", { name: "Incluído na seleção" }),
  ).toBeVisible();
  await expect
    .poll(() =>
      page.evaluate(() => {
        const raw = localStorage.getItem("promo-premium-selection-v1");
        if (!raw) return 0;
        const value: unknown = JSON.parse(raw);
        if (!value || typeof value !== "object" || !("items" in value))
          return 0;
        return Object.keys((value as { items: object }).items).length;
      }),
    )
    .toBe(1);
  await page.getByRole("link", { name: "Ver toda a curadoria" }).click();
  await expect(
    page.getByRole("button", { name: "Minha seleção, 1 produtos" }),
  ).toBeVisible();
});

test("compartilhamento copia o endereço da coleção", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "share", {
      value: undefined,
      configurable: true,
    });
    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: async (text: string) => {
          document.documentElement.dataset.sharedLink = text;
        },
      },
      configurable: true,
    });
  });
  await page.goto("/catalogos");
  const card = page.locator(".library-card").first();
  await card
    .getByRole("button", { name: "Compartilhar Um começo com significado" })
    .click();
  await expect(card.getByRole("status")).toContainText("Link copiado");
  await expect(page.locator("html")).toHaveAttribute(
    "data-shared-link",
    /\/catalogos\/boas-vindas$/,
  );
});

test("sem clipboard o link fica disponível para cópia manual", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "share", {
      value: undefined,
      configurable: true,
    });
    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: async () => {
          throw new Error("denied");
        },
      },
      configurable: true,
    });
  });
  await page.goto("/catalogos/boas-vindas");
  await page
    .getByRole("button", { name: "Compartilhar Um começo com significado" })
    .click();
  await expect(
    page.getByLabel("Link de Um começo com significado"),
  ).toHaveValue(/\/catalogos\/boas-vindas$/);
  await expect(page.getByRole("status")).toContainText("Copie o link abaixo");
});

test("cancelar compartilhamento nativo não copia sem intenção", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "share", {
      value: async () => {
        throw new DOMException("cancelled", "AbortError");
      },
      configurable: true,
    });
    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: async () => {
          document.documentElement.dataset.unwantedCopy = "true";
        },
      },
      configurable: true,
    });
  });
  await page.goto("/catalogos/boas-vindas");
  const button = page.getByRole("button", {
    name: "Compartilhar Um começo com significado",
  });
  await button.click();
  await expect(button).toBeEnabled();
  await expect(page.locator("html")).not.toHaveAttribute("data-unwanted-copy");
  await expect(page.getByRole("status")).toBeEmpty();
});

test("imagens indisponíveis preservam acesso às peças", async ({ page }) => {
  await page.route("**/_next/image?**", (route) =>
    route.fulfill({ status: 404, body: "missing" }),
  );
  await page.goto("/catalogos/boas-vindas");
  await page.locator(".collection-products").scrollIntoViewIfNeeded();
  await expect(
    page.locator(".collection-image-fallback").first(),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Conhecer a peça" })).toHaveCount(
    3,
  );
});

for (const width of [390, 320]) {
  for (const path of ["/catalogos", "/catalogos/boas-vindas"]) {
    test(`${path} não cria rolagem horizontal em ${width}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 844 });
      await page.goto(path);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true);
    });
  }
}

test("menu móvel abre a biblioteca de catálogos", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.waitForFunction(
    () => localStorage.getItem("promo-premium-selection-v1") !== null,
  );
  await page.getByRole("button", { name: "Abrir menu" }).click();
  await page
    .getByRole("navigation", { name: "Menu móvel" })
    .getByRole("link", { name: "Catálogos" })
    .click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Para cada intenção",
  );
});

test("biblioteca e coleção passam auditoria automatizada de acessibilidade", async ({
  page,
}) => {
  for (const path of ["/catalogos", "/catalogos/boas-vindas"]) {
    await page.goto(path);
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(result.violations).toEqual([]);
  }
});
