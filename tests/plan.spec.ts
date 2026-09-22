import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
import AxeBuilder from "@axe-core/playwright";
import plan from "../src/lib/plan.json";

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
  expect(text).toContain("Situação auditada: Parcial");
  expect(text).toContain("Próxima ação:");
});

test("marcação local não altera auditoria e revisão antiga não mascara etapas reabertas", async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem("promo-premium-plan-v1", JSON.stringify({ 61: true }));
    localStorage.setItem(
      "promo-premium-plan-v2",
      JSON.stringify({ review: "revisao-antiga", overrides: { 61: true } }),
    );
  });
  await page.goto("/planejamento");
  const audited = plan.tasks.filter((t) => t.status === "done").length;
  const partial = plan.tasks.filter((t) => t.status === "partial").length;
  const progress = page.getByRole("progressbar");
  await expect(progress).toHaveAttribute("value", String(audited));
  await page
    .getByRole("combobox", { name: "Filtrar status", exact: true })
    .selectOption("partial");
  await expect(page.getByRole("checkbox")).toHaveCount(partial);
  const reopened = page.getByRole("checkbox", { name: /Concluir etapa 61:/ });
  await expect(reopened).not.toBeChecked();
  await reopened.check();
  await expect(progress).toHaveAttribute("value", String(audited));
  await expect(page.getByRole("checkbox")).toHaveCount(partial);
  await expect(page.getByTestId("local-plan-progress")).toContainText(
    `${audited + 1}/200`,
  );
  await page
    .getByRole("button", { name: "Restaurar acompanhamento da auditoria" })
    .click();
  await expect(reopened).not.toBeChecked();
  await expect(page.getByTestId("local-plan-progress")).toContainText(
    `${audited}/200`,
  );
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
