// Auditoria local: compila apenas quatro módulos puros do V4. Não carrega .env.
// Uso: node probe.mjs /caminho/Promo_Gifts_V4 > probe-results.json
import { readFile, writeFile, mkdtemp, rm } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';

const source = resolve(process.argv[2]);
const requireSource = createRequire(join(source, 'package.json'));
const ts = requireSource('typescript');
const temporary = await mkdtemp(join(tmpdir(), 'super-filtro-pure-'));
const files = {
  'pages/filters/applyProductFilters': 'pipeline',
  'utils/product-sorting': 'sort',
  'lib/products/kit-detection': 'kit',
  'lib/products/stock-status': 'stock',
};
const hashes = {};
try {
  for (const [path, output] of Object.entries(files)) {
    const code = await readFile(join(source, 'src', `${path}.ts`), 'utf8');
    hashes[path] = createHash('sha256').update(code).digest('hex');
    let js = ts.transpileModule(code, { compilerOptions: {
      target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022,
    } }).outputText;
    for (const [dependency, name] of Object.entries(files)) {
      js = js.replaceAll(`@/${dependency}`, `./${name}.mjs`);
    }
    // Nenhum import de runtime fora dos quatro módulos puros é permitido.
    assert(!/from\s+['"](?!\.\/)/.test(js), `Import inesperado: ${path}`);
    await writeFile(join(temporary, `${output}.mjs`), js);
  }
  const { applyProductFilters } = await import(pathToFileURL(join(temporary, 'pipeline.mjs')));
  const defaultsCode = await readFile(join(source, 'src/components/filters/filter-panel/types.ts'), 'utf8');
  hashes.defaults = createHash('sha256').update(defaultsCode).digest('hex');
  const ast = ts.createSourceFile('defaults.ts', defaultsCode, ts.ScriptTarget.Latest, true);
  let initializer;
  for (const statement of ast.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    for (const declaration of statement.declarationList.declarations) {
      if (declaration.name.getText(ast) === 'defaultFilters') initializer = declaration.initializer.getText(ast);
    }
  }
  assert(initializer, 'defaultFilters ausente');
  await writeFile(join(temporary, 'defaults.mjs'), `export default ${initializer};`);
  const { default: defaults } = await import(pathToFileURL(join(temporary, 'defaults.mjs')));
  const product = (id, extra = {}) => ({
    id, name: id, sku: id, description: '', price: 50, stock: 0,
    materials: [], variations: [], gender: '',
    tags: { publicoAlvo: [], datasComemorativas: [], endomarketing: [], ramo: [], nicho: [] },
    ...extra,
  });
  const context = {
    hasFuzzySearch: false, fuzzySearchResults: [], techniquesDataAvailable: false,
    hasColorFilter: false, colorFilteredProductIds: new Set(), isLoadingColorFilter: false,
    hasCategoryFilter: false, categoryFilteredProductIds: new Set(), isLoadingCategoryFilter: false,
    hasMaterialFilter: false, materialFilteredProductIds: new Set(), isLoadingMaterialFilter: false,
  };
  const cases = [];
  const run = (id, description, products, filter, extraContext, expected) => {
    const result = applyProductFilters(products, { ...structuredClone(defaults), ...filter }, 'name', { ...context, ...extraContext });
    const actual = result.map(p => p.id);
    assert.deepEqual(actual, expected, id);
    cases.push({ id, description, expected, actual, verified: true });
  };
  const pair = [product('a'), product('b')];
  run('P01', 'Categoria ativa com erro e nenhum ID preserva produtos sem confirmação de categoria', pair,
    { categories: ['cat-x'] }, { hasCategoryFilter: true, categoryFilterError: new Error('offline') }, ['a', 'b']);
  run('P02', 'Categoria ativa resolvida sem IDs retorna zero', pair,
    { categories: ['cat-x'] }, { hasCategoryFilter: true }, []);
  run('P03', 'Técnica selecionada sem dados não restringe o resultado', pair,
    { techniques: ['laser'] }, {}, ['a', 'b']);
  run('P04', 'Com dados parciais de técnicas, produto desconhecido permanece no resultado',
    [product('a'), product('b', { metadata: { techniques: ['laser'] } }), product('c', { metadata: { techniques: ['silk'] } })],
    { techniques: ['laser'] }, { techniquesDataAvailable: true }, ['a', 'b']);
  run('P05', 'Material textual sem hidratação de materials não restringe o resultado', pair,
    { materiais: ['inox'] }, {}, ['a', 'b']);
  run('P06', 'Cor selecionada com estoque agregado de 200 passa mínimo de 100 antes do enriquecimento por cor',
    [product('a', { stock: 200 })], { colorVariations: ['vermelho'], minStock: 100 },
    { hasColorFilter: true, colorFilteredProductIds: new Set(['a']) }, ['a']);
  run('P07', 'Estoque mínimo recusa Infinity', [product('a', { stock: Infinity })], { minStock: 100 }, {}, []);
  run('P08', 'OR entre valores de público e AND com personalizável',
    [product('a', { hasPersonalization: true, tags: { publicoAlvo: ['executivo'] } }),
      product('b', { hasPersonalization: false, tags: { publicoAlvo: ['colaborador'] } }),
      product('c', { hasPersonalization: true, tags: { publicoAlvo: ['colaborador'] } })],
    { publicoAlvo: ['executivo', 'colaborador'], hasPersonalization: true }, {}, ['a', 'c']);
  run('P09', 'Busca legada de um caractere não normaliza acento',
    [product('a', { name: 'Á', sku: '' })], { search: 'a' }, {}, []);
  run('P10', 'Preço não finito atravessa comparações numéricas do pipeline isolado',
    [product('a', { price: NaN })], { priceRange: [10, 100] }, {}, ['a']);
  console.log(JSON.stringify({
    sourceCommit: 'e3ed6c5dba080bc9601a42d99e2fc5e00e319ad6',
    scope: 'Comportamentos do pipeline puro, com fixtures sintéticas. Não comprova ocorrência em produção. P06 testa a etapa anterior ao enriquecimento; a cor vermelha com estoque 10 é cenário de risco descrito no relatório.',
    sourceHashes: hashes, cases,
  }, null, 2));
} finally {
  await rm(temporary, { recursive: true, force: true });
}
