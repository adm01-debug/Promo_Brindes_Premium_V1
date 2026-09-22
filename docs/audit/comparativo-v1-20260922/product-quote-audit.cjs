// Run from the donor clone root. No form submission; all remote writes blocked.
const { chromium } = require(require.resolve('@playwright/test', { paths: [process.cwd()] }));
const { default: AxeBuilder } = require(require.resolve('@axe-core/playwright', { paths: [process.cwd()] }));
const fs = require('node:fs');
const out = process.env.AUDIT_OUTPUT || '/tmp/promo-brindes-v1-browser';
fs.mkdirSync(out, { recursive: true });

(async () => {
  const browser = await chromium.launch();
  try {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    await context.route('**/*', route => ['GET', 'HEAD'].includes(route.request().method()) ? route.continue() : route.abort());
    const page = await context.newPage();
    const results = [];
    await page.goto('https://promo-brindes-v1.vercel.app/produto/agenda-diaria-2026-02469', { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: 'Adicionar à minha seleção', exact: true }).waitFor();
    for (const label of ['product-mobile', 'quote-populated-mobile']) {
      if (label.startsWith('quote')) {
        await page.getByRole('button', { name: 'Adicionar à minha seleção', exact: true }).click();
        await page.goto('https://promo-brindes-v1.vercel.app/orcamento', { waitUntil: 'networkidle' });
      }
      await page.screenshot({ path: `${out}/${label}.png`, fullPage: true });
      const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
      results.push({
        label, url: page.url(), text: await page.locator('main').innerText(),
        horizontalOverflow: await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
        violations: axe.violations.map(v => ({ id: v.id, impact: v.impact, targets: v.nodes.map(n => n.target) })),
      });
    }
    fs.writeFileSync(`${out}/product-quote.json`, JSON.stringify({ testedAt: new Date().toISOString(), writesBlocked: true, results }, null, 2));
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error.message); process.exitCode = 1; });
