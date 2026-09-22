// Reexecuta as simulações com dependências já instaladas no checkout V4.
// Não instala pacotes, não lê .env e não conecta a banco de dados.
import { execFileSync } from 'node:child_process';
import { mkdtemp, writeFile, copyFile, symlink, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

assert(process.argv[2], 'Informe o caminho do checkout Promo_Gifts_V4');
const source = resolve(process.argv[2]);
const output = dirname(fileURLToPath(import.meta.url));
const commit = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: source, encoding: 'utf8' }).trim();
assert.equal(commit, 'e3ed6c5dba080bc9601a42d99e2fc5e00e319ad6', 'O checkout deve corresponder à versão auditada');
const temp = await mkdtemp(join(tmpdir(), 'super-filtro-audit-'));
try {
  const setup = join(temp, 'block-network.mjs');
  await writeFile(setup, `import http from 'node:http';
import https from 'node:https';
import net from 'node:net';
const blocked = () => { throw new Error('Network disabled in Super Filtro local audit'); };
globalThis.fetch = blocked;
http.request = http.get = https.request = https.get = blocked;
net.connect = net.createConnection = net.Socket.prototype.connect = blocked;
`);
  await symlink(join(source, 'node_modules'), join(temp, 'node_modules'), 'dir');
  await copyFile(join(output, 'material-state.test.ts.txt'), join(temp, 'material-state.test.ts'));
  const alias = { find: '@', replacement: join(source, 'src') };
  for (const suite of [
    {
      name: 'simulation', root: source, environment: 'node',
      include: ['src/pages/filters/__tests__/applyProductFilters.simulation.test.ts'],
      aliases: [{ find: '@/components/filters/FilterPanel', replacement: join(source, 'src/components/filters/filter-panel/types.ts') }, alias],
    },
    { name: 'material-state', root: temp, environment: 'jsdom', include: ['material-state.test.ts'], aliases: [alias] },
  ]) {
    const config = {
      root: suite.root, envDir: false, cacheDir: join(temp, `cache-${suite.name}`),
      resolve: { alias: suite.aliases },
      test: { environment: suite.environment, include: suite.include, setupFiles: [setup],
        maxWorkers: 1, retry: 0, reporters: ['default', 'json'],
        outputFile: { json: join(output, `${suite.name}-results.json`) } },
    };
    const configPath = join(temp, `${suite.name}.config.mjs`);
    await writeFile(configPath, `export default ${JSON.stringify(config)};`);
    execFileSync(join(source, 'node_modules/.bin/vitest'), ['run', '--config', configPath], {
      cwd: temp, stdio: 'inherit', env: { ...process.env, TZ: 'America/Sao_Paulo' },
    });
  }
  const probes = execFileSync(process.execPath, [join(output, 'probe.mjs'), source], { encoding: 'utf8' });
  await writeFile(join(output, 'probe-results.json'), probes);
  await writeFile(join(output, 'execution.json'), JSON.stringify({
    timestamp: new Date().toISOString(), commit, node: process.version,
    suiteTests: 124, hookReproductions: 2, pipelineProbes: 10,
    databaseAccess: false, environmentFilesLoaded: false,
    isolation: 'Pure pipeline, mocked hook dependencies, blocked Node HTTP/HTTPS/net/fetch in Vitest. No production E2E.',
  }, null, 2) + '\n');
} finally {
  await rm(temp, { recursive: true, force: true });
}
