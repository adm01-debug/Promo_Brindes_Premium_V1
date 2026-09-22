const { chromium } = require(require.resolve('@playwright/test', { paths: [process.cwd()] }));
const { default: AxeBuilder } = require(require.resolve('@axe-core/playwright', { paths: [process.cwd()] }));
const fs = require('node:fs');
const out = process.env.AUDIT_OUTPUT || '/tmp/promo-brindes-v1-browser';
fs.mkdirSync(out, { recursive: true });
(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  await context.route('**/*', route => ['GET', 'HEAD'].includes(route.request().method()) ? route.continue() : route.abort());
  const results = [];
  for (const [label, pathname, width] of [
    ['home-desktop', '/', 1440], ['catalog-desktop', '/catalogo', 1440],
    ['library', '/catalogos', 1440], ['quote', '/orcamento', 1440],
    ['account', '/entrar', 1440], ['privacy', '/privacidade', 1440],
    ['home-mobile', '/', 390], ['catalog-mobile', '/catalogo', 390],
  ]) {
    const page = await context.newPage();
    await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message.slice(0, 180)));
    try {
      const response = await page.goto(`https://promo-brindes-v1.vercel.app${pathname}`, { waitUntil: 'networkidle', timeout: 30000 });
      await page.screenshot({ path: `${out}/${label}.png`, fullPage: false });
      const content = await page.evaluate(() => ({
        title: document.title,
        h1: [...document.querySelectorAll('h1')].map(e => e.textContent),
        h2: [...document.querySelectorAll('h2')].map(e => e.textContent),
        horizontalOverflow: document.documentElement.scrollWidth > innerWidth,
        brokenImages: [...document.images].filter(e => e.complete && e.naturalWidth === 0).length,
        productLinks: [...document.querySelectorAll('a[href^="/produto/"]')].map(e => e.getAttribute('href')).slice(0, 3),
        text: document.querySelector('main')?.innerText.slice(0, 2600),
      }));
      let violations;
      if (['home-desktop', 'catalog-mobile', 'account', 'quote'].includes(label)) {
        const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
        violations = axe.violations.map(v => ({ id: v.id, impact: v.impact, count: v.nodes.length, targets: v.nodes.slice(0, 3).map(n => n.target) }));
      }
      results.push({ label, pathname, status: response.status(), ...content, errors, violations });
    } catch (error) { results.push({ label, pathname, error: error.message.slice(0, 220) }); }
    await page.close();
  }
  fs.writeFileSync(`${out}/results.json`, JSON.stringify({ testedAt: new Date().toISOString(), writesBlocked: true, results }, null, 2));
  console.log(JSON.stringify(results.map(({ label, status, error, h1, horizontalOverflow, brokenImages, violations }) => ({ label, status, error, h1, horizontalOverflow, brokenImages, violations })), null, 2));
  await browser.close();
})().catch(e => { console.error(e.message); process.exitCode = 1; });
