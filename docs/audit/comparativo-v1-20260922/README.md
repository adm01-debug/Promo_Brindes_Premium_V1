# Evidências da comparação de 22/09/2026

Veja o [relatório](../../AUDITORIA_COMPARATIVA_PROMO_BRINDES_V1.md) antes de interpretar os resultados. O `manifest.json` fixa os commits examinados e hashes SHA-256 dos artefatos. A observação do site público não comprova equivalência do deploy com o commit.

## Reproduzir a base

Em um clone separado de `https://github.com/adm01-debug/Promo_Brindes_V1`, faça checkout de `b211c2ba11b47c212166db7786a9703e2cfd0329`. Use Node 22.13.1. Nenhum segredo ou arquivo `.env` real é necessário para os testes simulados.

```bash
npm ci --ignore-scripts --no-audit --no-fund
npm run lint
npm run typecheck
npm test
npm run ledger:check
npm run build
npm run check:performance-budget
npx playwright test --reporter=line
```

Os navegadores Playwright precisam estar instalados. A sequência acima corresponde à base original de 247 testes e à matriz de 154 cenários aprovados/14 ignorados; execute antes de adicionar a sonda extra. A CI de banco isolado foi consultada no GitHub, não executada contra o Supabase remoto.

Também foram executados 33 testes Node, registrados em `node-tests.log`:

```bash
node --test tests/validate-migration-names.node.mjs tests/validate-error-catalog.node.mjs tests/generate-site-api-jwt.node.mjs tests/timing-safe-secret-comparisons.node.mjs tests/supabase-db-query.node.mjs
```

## Reproduzir as três sondas de risco e o controle

Copie `comparative-gaps.audit.test.ts.txt` desta pasta para `tests/api/comparative-gaps.audit.test.ts` do clone. O caminho de destino é necessário para os imports relativos. Então execute:

```bash
npx vitest run tests/api/comparative-gaps.audit.test.ts --reporter=verbose
```

**Quatro testes verdes significam que os comportamentos observados foram reproduzidos. Não significam quatro correções.** As sondas de retirada/alteração editorial simulam o catálogo e a resposta do RPC; a terceira verifica qual credencial o código escolhe para Storage, sem confirmar uma falha real do provedor. O controle confirma reenvio sem alteração de intenção ou catálogo.

Todos os endereços pessoais, tokens e IDs nos testes são sintéticos. As requisições dos handlers são interceptadas com `vi.stubGlobal('fetch', ...)`; nenhuma chega a banco, CRM ou provedor externo. Não integrar esses testes como aceitação desejada: após uma correção, devem passar a esperar o comportamento correto, com testes SQL de apoio.

## Reproduzir observação pública

Execute `browser-audit.cjs` a partir da raiz do clone, onde estão as dependências Playwright e Axe. O script usa somente páginas públicas e bloqueia métodos diferentes de GET/HEAD. `AUDIT_OUTPUT` opcional escolhe a pasta de resultados; por padrão usa `/tmp/promo-brindes-v1-browser`.

```bash
node /caminho/para/browser-audit.cjs
```

`browser.json` guarda oito combinações de rota/viewport. `product-quote.json` acrescenta a ficha `/produto/agenda-diaria-2026-02469` em 390 × 844 e o orçamento preenchido após clicar em “Adicionar à minha seleção”, somente no navegador local. Não houve envio do formulário. O script `product-quote-audit.cjs` reproduz essa inspeção adicional.

As strings `innerText`/`textContent` nos resultados são observações do DOM, não transcrições da árvore de acessibilidade. A duplicação visual oculta do título animado não foi classificada como defeito de leitura. A falha de ARIA da galeria foi identificada pelo Axe e conferida na fonte.

Os arquivos `.log` preservam saídas originais de build/testes, podendo conter cores ANSI, caminhos temporários, IDs sintéticos e tempos variáveis. Não contêm credenciais reais. `backlog.json` é a fonte do CSV. Atualizações posteriores marcaram `APV1-01`, `APV1-02` e `APV1-23` como implementações técnicas parciais; os demais itens seguem como recomendações. O estado real do plano premium permanece em `src/lib/plan.json`.
