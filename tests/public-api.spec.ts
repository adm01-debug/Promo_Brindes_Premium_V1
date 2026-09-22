import { expect, test } from "@playwright/test";

test("catálogo público pagina, preserva o contrato e não expõe campos internos", async ({
  request,
}) => {
  const response = await request.get(
    "/api/catalog?q=08255&page=1&pageSize=1&sort=nome",
  );
  expect(response.status()).toBe(200);
  expect(response.headers()["x-catalog-contract-version"]).toBe("2026-09-21");
  expect(response.headers()["cache-control"]).toContain("s-maxage=300");
  const body = await response.json();
  expect(body).toMatchObject({
    contractVersion: "2026-09-21",
    page: 1,
    pageSize: 1,
    total: 1,
    totalPages: 1,
  });
  expect(body.items[0]).toMatchObject({ sku: "08255", name: "Kit executivo" });
  for (const forbidden of [
    "cost_price",
    "supplier_id",
    "stock_quantity",
    "sale_price",
    "discount",
  ])
    expect(body.items[0]).not.toHaveProperty(forbidden);
});

test("catálogo rejeita parâmetros inválidos e pagina a ordenação sem repetir SKU", async ({
  request,
}) => {
  const invalid = await request.get(
    "/api/catalog?category=Interno&pageSize=99",
  );
  expect(invalid.status()).toBe(400);
  expect(await invalid.json()).toMatchObject({
    error: "INVALID_CATALOG_QUERY",
  });

  const seen = new Set<string>();
  for (let page = 1; page <= 3; page++) {
    const response = await request.get(
      `/api/catalog?sort=nome&page=${page}&pageSize=3`,
    );
    expect(response.status()).toBe(200);
    const body = await response.json();
    for (const item of body.items) {
      expect(seen.has(item.sku)).toBe(false);
      seen.add(item.sku);
    }
  }
  expect(seen.size).toBe(8);
});

test("endpoint de briefing falha de forma explícita sem destinatário comercial", async ({
  request,
}) => {
  const capability = await request.get("/api/briefings");
  expect(capability.status()).toBe(200);
  expect(await capability.json()).toEqual({ configured: false });

  const missingKey = await request.post("/api/briefings", {
    data: {},
  });
  expect(missingKey.status()).toBe(400);

  const unavailable = await request.post("/api/briefings", {
    headers: { "Idempotency-Key": "briefing-e2e-key-0001" },
    data: {
      name: "Pessoa de teste",
      company: "Empresa de teste",
      email: "teste@example.com",
      occasion: "Relacionamento com clientes",
      items: [
        {
          productId: "0144f10f-c311-47eb-afd6-14b9ebef35b6",
          quantity: 5,
        },
      ],
    },
  });
  expect(unavailable.status()).toBe(503);
  expect(await unavailable.json()).toEqual({
    error: "DESTINATION_UNAVAILABLE",
  });

  const forgedOrigin = await request.post("/api/briefings", {
    headers: {
      "Content-Type": "application/json",
      Origin: "https://origem-nao-autorizada.example",
      "Idempotency-Key": "briefing-e2e-key-0002",
    },
    data: {},
  });
  expect(forgedOrigin.status()).toBe(403);

  const impossibleDate = await request.post("/api/briefings", {
    headers: {
      "Idempotency-Key": "briefing-e2e-key-0003",
    },
    data: {
      name: "Pessoa de teste",
      company: "Empresa de teste",
      email: "teste@example.com",
      occasion: "Relacionamento com clientes",
      date: "2026-02-31",
      items: [],
    },
  });
  expect(impossibleDate.status()).toBe(422);
});

test("página de produto é acessível diretamente e a prévia permanece bloqueada para índice", async ({
  page,
  request,
}) => {
  const slug = "kit-executivo-2-pecas-08255";
  const product = await request.get(`/produtos/${slug}`);
  expect(product.status()).toBe(200);
  const productHtml = await product.text();
  expect(productHtml).toContain("Kit executivo");
  expect(productHtml).toContain('rel="canonical"');
  expect(productHtml).toContain("application/ld+json");
  expect(productHtml).toContain('"sku":"08255"');
  expect(productHtml).not.toContain('"offers"');

  await page.goto(`/produtos/${slug}`);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Kit executivo",
  );
  await page.getByRole("button", { name: "Incluir no meu projeto" }).click();
  await expect(
    page.getByRole("button", { name: "Incluído na seleção" }),
  ).toBeVisible();

  const robots = await request.get("/robots.txt");
  expect(await robots.text()).toContain("Disallow: /");
  const sitemap = await request.get("/sitemap.xml");
  expect(await sitemap.text()).not.toContain(`/produtos/${slug}`);
  expect(
    (await request.get("/")).headers()["content-security-policy"],
  ).toContain("frame-ancestors 'none'");
});

test("consulta compartilhável abre a curadoria filtrada", async ({ page }) => {
  await page.goto("/?q=08255");
  await expect(page.locator(".product-card")).toHaveCount(1);
  await expect(page.locator(".product-card h3")).toHaveText("Kit executivo");
  await expect(page).toHaveURL(/\?q=08255/);
});

test("home entrega proposta e links úteis no HTML inicial", async ({
  request,
}) => {
  const response = await request.get("/");
  const html = await response.text();
  expect(response.status()).toBe(200);
  expect(html).toContain("Alguns presentes");
  expect(html).toContain("/produtos/kit-executivo-2-pecas-08255");
});
