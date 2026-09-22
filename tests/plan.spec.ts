import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
import AxeBuilder from "@axe-core/playwright";

test("plano tem 200 etapas, filtros, persistência e exportação", async ({
  page,
}) => {
  await page.goto("/planejamento");
  await expect(page.getByRole("checkbox")).toHaveCount(200);
  await page
    .getByLabel("Buscar etapa", { exact: true })
    .fill("Entrevistar compradores");
  await expect(page.getByRole("checkbox")).toHaveCount(1);
  const checkbox = page.getByRole("checkbox", { name: /Concluir etapa 23:/ });
  await checkbox.check();
  await page.reload();
  await expect(
    page.getByRole("checkbox", { name: /Concluir etapa 23:/ }),
  ).toBeChecked();
  await page
    .getByRole("combobox", { name: "Filtrar fase", exact: true })
    .selectOption("20");
  await expect(page.getByRole("checkbox")).toHaveCount(10);
  const wait = page.waitForEvent("download");
  await page.getByRole("button", { name: "Exportar checklist" }).click();
  const download = await wait;
  const text = await readFile((await download.path())!, "utf8");
  expect(text.match(/^- \[[ x]\] \*\*\d{3}\./gm) || []).toHaveLength(200);
});

test("plano e privacidade têm semântica acessível e rota desconhecida tem 404", async ({
  page,
}) => {
  await page.goto("/planejamento");
  await page
    .getByRole("combobox", { name: "Filtrar fase", exact: true })
    .selectOption("1");
  let scan = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(scan.violations).toEqual([]);
  await page.goto("/privacidade");
  scan = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(scan.violations).toEqual([]);
  const response = await page.goto("/pagina-inexistente");
  expect(response?.status()).toBe(404);
});
