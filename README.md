# Promo Brindes Premium

Uma prévia funcional de site de presentes corporativos em preto, champanhe e marfim, acompanhada de pesquisa, auditoria do sistema comercial e plano de **200 etapas**.

## Abrir localmente

```bash
npm ci
npm run dev -- --port 3100
```

- Vitrine: <http://localhost:3100>
- Plano interativo: <http://localhost:3100/planejamento>
- Privacidade da prévia: <http://localhost:3100/privacidade>

Para versão compilada: `npm run build`, seguido de `npm run start -- --port 3100`.

Node 22.12+ ou 24 LTS recomendado. O projeto usa Next.js 16, React 19 e TypeScript. Dependências estão fixadas pelo `package-lock.json`; fontes e imagens são locais.

## O que funciona

- Home responsiva, coleções, personalização, processo e FAQ.
- Biblioteca `/catalogos` com seis coleções, busca por ocasião, filtros por tema, compartilhamento e páginas próprias com produtos publicados.
- Oito produtos reais, com IDs e SKUs consultados no sistema comercial em 20/09/2026 e sincronizados no banco dedicado da vitrine em 22/09/2026.
- Busca por nome/SKU/categoria, filtros, favoritos e seleção persistente.
- Detalhe rápido, quantidades com mínimo cadastrado e remoção de itens.
- Briefing com validação e download de arquivo local.
- Plano interativo com 200 etapas, filtros, progresso local e exportação Markdown.
- Revisão individual das 200 etapas: **83 critérios comprovados no escopo, 66 entregas parciais e 51 sem entrega comprovada**. O painel distingue a auditoria das marcações pessoais.
- Páginas permanentes de produto, metadados por peça e infraestrutura de sitemap/robots preparada para lançamento autorizado.
- Contrato público do catálogo lido diretamente do Supabase da vitrine, com paginação e validação no servidor; briefing com persistência idempotente e reserva atômica de entrega, mantido desligado até existir receptor comercial homologado.

## Limites desta entrega

Nesta instalação, a versão **não envia leads, não registra propostas e não reserva estoque**. O formulário gera um arquivo no navegador e informa isso explicitamente. O endpoint de briefing só habilita entrega quando `BRIEFING_DELIVERY_ENABLED=true`, há um receptor HTTPS aprovado em `BRIEFING_WEBHOOK_URL`, banco dedicado configurado e cabeçalho de IP confiável declarado em `PROMO_PREMIUM_CLIENT_IP_HEADER`; sem essas condições, ele responde indisponibilidade e a interface permanece em download local. A curadoria contém oito peças sincronizadas no banco da vitrine, que alimenta home, fichas e validação de briefing. Valores, condições e disponibilidade devem ser confirmados pelo comercial.

A imagem de campanha foi gerada por IA e é conceitual. Os cards usam fotografias reais de fornecedor; direitos de publicação comercial devem ser confirmados. Não foram alterados schema, policies, dados ou serviços do sistema comercial. O site está `noindex` e não foi publicado remotamente.

O planejamento é uma ferramenta desta prévia. Antes de lançar a vitrine pública, mover `/planejamento` para ambiente interno ou protegê-lo com autenticação apropriada. `noindex` não é controle de acesso.

## Documentação

- [Auditoria do Super Filtro V4: padrões, riscos, simulações e adaptação premium](docs/AUDITORIA_SUPER_FILTRO.md)
- [Backlog do Super Filtro: 30 recomendações com critérios de aceite](docs/BACKLOG_SUPER_FILTRO.csv)
- [Biblioteca de catálogos premium: funcionalidades, dados e verificação](docs/CATALOGOS.md)
- [Auditoria comparativa do Promo Brindes V1: oportunidades, riscos e 32 recomendações](docs/AUDITORIA_COMPARATIVA_PROMO_BRINDES_V1.md)
- [Backlog de aproveitamento do V1 em CSV](docs/BACKLOG_APROVEITAMENTO_V1.csv)
- [Evolução técnica do briefing estruturado e simulações](docs/audit/2026-09-22-briefing-structured.md)
- [Testes SQL isolados de permissões e idempotência](docs/audit/2026-09-22-database-contracts.md)
- [Registro de aprovação editorial dos oito produtos](docs/editorial/README.md)
- [Revisão exaustiva das 200 etapas, lacunas e prioridades](docs/REVISAO_EXAUSTIVA_PLANO.md)
- [Pesquisa, posicionamento e referências](docs/ESTRATEGIA_E_PESQUISA.md)
- [Auditoria dirigida de Promo_Gifts_V4](docs/AUDITORIA_PROJETO_INTERNO.md)
- [Verificação ao vivo do catálogo canônico](docs/audit/CANONICAL_CATALOG_LIVE_CHECK_2026-09-22.md)
- [Banco dedicado da vitrine premium](docs/SUPABASE_SITE_DATABASE.md)
- [Arquitetura e integração comercial](docs/ARQUITETURA_E_INTEGRACAO.md)
- [Contrato público de catálogo v1](docs/CONTRATO_CATALOGO_PUBLICO_V1.md)
- [Contrato de briefing v1](docs/CONTRATO_BRIEFING_V1.md)
- [Simulação de cenários e gaps](docs/ANALISE_DE_CENARIOS_E_GAPS.md)
- [Arquitetura da informação e fluxos](docs/ARQUITETURA_INFORMACAO_E_FLUXOS.md)
- [Modelo de ameaças da prévia](docs/MODELO_DE_AMEACAS_PREVIA.md)
- [Orçamento de desempenho](docs/ORCAMENTO_DESEMPENHO.md)
- [Design system e direção de arte](docs/DESIGN_SYSTEM.md)
- [Plano de 200 etapas com checklists](docs/PLANO_200_ETAPAS.md)
- [Plano em CSV](docs/PLANO_200_ETAPAS.csv)
- [Validação e limitações](docs/VALIDACAO.md)
- [Captura desktop](docs/screenshots/home-desktop.png)
- [Captura mobile](docs/screenshots/home-mobile.png)
- [Prompt e origem da imagem gerada](docs/IMAGE_PROMPT.txt)

## Comandos de verificação

```bash
npm run typecheck
npm run build
npm run check:plan
npm run check:public-secrets
npm run check:performance-budget
npm run test:e2e
```

Copie `.env.example` apenas para configurar um ambiente autorizado. `PROMO_PREMIUM_INDEXABLE` permanece `false` até o domínio, conteúdo, privacidade e operação passarem pelos gates de lançamento.

Para o banco dedicado da vitrine, preencha `.env.local` com as credenciais do projeto correto e use `npm run db:migrate -- --dry-run`, `npm run db:migrate` e `npm run db:sync-catalog`. O procedimento, as permissões e a validação do projeto atual estão em [SUPABASE_SITE_DATABASE.md](docs/SUPABASE_SITE_DATABASE.md).

O catálogo central `doufsxqlfjyuvxuezpln` é **somente leitura** para este projeto. Configure sua URL e chave publishable em `CATALOG_SOURCE_SUPABASE_*`; `SUPABASE_*` continua apontando exclusivamente ao banco premium. `npm run check:catalog-source` confere os oito produtos por GET na view `v_products_public`. `npm run db:sync-catalog -- --dry-run` também verifica o destino sem gravar. A sincronização efetiva grava somente no banco premium e para se houver divergência na origem ou despublicação no destino. Não há atualização automática; o fluxo e os limites estão em [CATALOGO_ORIGEM_SOMENTE_LEITURA.md](docs/CATALOGO_ORIGEM_SOMENTE_LEITURA.md).

Os testes iniciam o servidor de produção na porta 3107, que deve estar livre. Execute o build antes dos testes. Se necessário, instale o navegador com `npx playwright install chromium`.

O workflow [quality.yml](.github/workflows/quality.yml) executa os gates em push e pull request, com instalação limpa e Chromium, Firefox e WebKit. A configuração de indexação só entra em vigor com URL HTTPS de domínio e catálogo da vitrine configurado; a posse do domínio e os demais gates comerciais ainda exigem validação antes do lançamento.

O plano tem fonte única em `src/lib/plan.json`, com constatação, evidências e próxima ação por etapa. Após atualizar status/evidências, execute `node scripts/generate-plan.mjs` e `npm run check:plan`. O check confere também igualdade completa de Markdown/CSV com a fonte. Os checkboxes salvam acompanhamento local separado e identificado pela revisão; não alteram o status auditado. Dependências abertas continuam bloqueando prontidão integrada mesmo quando uma entrega isolada atende ao próprio critério.

## Estrutura

```text
src/app/                 Rotas, metadados, estilos e páginas estáticas
src/components/          Vitrine, diálogo e painel de planejamento
src/lib/products.json    Seleção pública com proveniência por SKU
src/lib/plan.json        Fonte estruturada das 200 etapas
supabase/migrations/     Schema versionado do banco dedicado à vitrine
docs/                    Pesquisa, auditoria, contratos, plano e evidências
public/images/           Hero conceitual e fotos locais dos produtos
scripts/                 Geração e validação dos checklists
tests/                   Fluxos E2E e verificações de acessibilidade
```
