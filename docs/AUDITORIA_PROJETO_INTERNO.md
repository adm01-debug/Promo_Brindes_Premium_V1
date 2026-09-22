# Auditoria dirigida — Promo_Gifts_V4

Data: **20/09/2026**. Repositório: [adm01-debug/Promo_Gifts_V4](https://github.com/adm01-debug/Promo_Gifts_V4). Referência examinada: **44857d5**, último commit da cópia obtida, de 17/09/2026. A cópia de análise ficou fora do novo projeto; nenhum arquivo do sistema comercial foi alterado.

Esta é uma análise de arquitetura, caminhos de código e adequação à nova vitrine. Não é certificação de segurança, varredura integral dos 8.319 arquivos, auditoria SQL administrativa ou teste de todos os módulos autenticados. O produto interno não foi aberto com sessão de vendedor; as conclusões sobre sua interface vêm do código, não de observação de uso real.

## 1. Inventário e evidências

`git ls-files` na revisão acima retornou **8.319 arquivos**. Principais diretórios: `supabase` 3.266; `src` 2.599; `tests` 739; `e2e` 697; `docs` 409; `scripts` 224; `.github` 131. Contagens são de arquivos versionados, não de módulos únicos nem de linhas executáveis.

Stack declarada e confirmada nas dependências: React 19, TypeScript, Vite 8, Tailwind, shadcn/Radix, TanStack Query, Zustand, Supabase, testes Vitest e Playwright. Existem módulos de catálogo, filtros, produto, variantes, personalização, preços, kits, propostas, revistas, CRM, BI, mockups e IA. Sua presença no código não confirma que todos os serviços estejam configurados e operantes em produção.

### Artefatos de grafo

O repositório contém `graphify-out/GRAPH_REPORT.md` e `manifest.json`, mas **não contém `graph.json`**. A tentativa de `graphify query` informou ausência desse arquivo. O relatório existente é de 13/09/2026, construído no commit `89292143`, portanto anterior ao código examinado. Ele relata 36.111 nós e 44.003 arestas; esses valores são históricos do artefato, não um grafo regenerado nesta sessão. O relatório serviu para orientação; relações importantes foram verificadas nos arquivos atuais.

### Caminhos examinados

Todos os links apontam para a revisão fixa, evitando confundir mudanças posteriores:

| Evidência | O que foi verificado |
|---|---|
| [AGENTS.md](https://github.com/adm01-debug/Promo_Gifts_V4/blob/44857d5/AGENTS.md) | Invariantes do projeto canônico, tipos e restrições para mudanças de banco |
| [README.md](https://github.com/adm01-debug/Promo_Gifts_V4/blob/44857d5/README.md) | Escopo, stack e arquitetura declarada |
| [package.json](https://github.com/adm01-debug/Promo_Gifts_V4/blob/44857d5/package.json) | Dependências e ferramentas |
| [SUPABASE_CONNECTION.md](https://github.com/adm01-debug/Promo_Gifts_V4/blob/44857d5/SUPABASE_CONNECTION.md) | Referência canônica e projeto legado |
| [client.ts](https://github.com/adm01-debug/Promo_Gifts_V4/blob/44857d5/src/integrations/supabase/client.ts) | Host canônico, proteção de configuração e tratamento de 401 |
| [gold-relations.ts](https://github.com/adm01-debug/Promo_Gifts_V4/blob/44857d5/src/integrations/supabase/gold-relations.ts) | Aliases Gold e interfaces para leitura |
| [AppRoutes.tsx](https://github.com/adm01-debug/Promo_Gifts_V4/blob/44857d5/src/routes/AppRoutes.tsx) | Composição de rotas e layout protegido |
| [public-routes.tsx](https://github.com/adm01-debug/Promo_Gifts_V4/blob/44857d5/src/routes/public-routes.tsx) | Autenticação, páginas legais e revista por token |
| [client-routes.tsx](https://github.com/adm01-debug/Promo_Gifts_V4/blob/44857d5/src/routes/client-routes.tsx) | Home, CRM e separação do 404 público |
| [product-routes.tsx](https://github.com/adm01-debug/Promo_Gifts_V4/blob/44857d5/src/routes/product-routes.tsx) | Catálogo, detalhes, favoritos, coleções e carrinhos protegidos |
| [quote-routes.tsx](https://github.com/adm01-debug/Promo_Gifts_V4/blob/44857d5/src/routes/quote-routes.tsx) | Orçamentos, edição e visualização sob autenticação |
| [Index.tsx](https://github.com/adm01-debug/Promo_Gifts_V4/blob/44857d5/src/pages/Index.tsx) | Composição do catálogo, filtros, comparação, seleção e SEO |
| [ProductCard.tsx](https://github.com/adm01-debug/Promo_Gifts_V4/blob/44857d5/src/components/products/ProductCard.tsx) | Dependências e abstração de cartão de produto |
| [productService.ts](https://github.com/adm01-debug/Promo_Gifts_V4/blob/44857d5/src/services/productService.ts) | Ordenação, mapeamento e filtragem adicional de preço e estoque |
| [products-lightweight.ts](https://github.com/adm01-debug/Promo_Gifts_V4/blob/44857d5/src/lib/external-db/products-lightweight.ts) | Projeção, paginação e carregamento amplo opcional |
| [postgrest.ts](https://github.com/adm01-debug/Promo_Gifts_V4/blob/44857d5/src/lib/db/postgrest.ts) | Leitura via Gold, escrita na base e compatibilidade de aliases |
| [product-catalog.ts](https://github.com/adm01-debug/Promo_Gifts_V4/blob/44857d5/src/types/product-catalog.ts) | Campos do modelo consumido pelo catálogo |
| [quoteService.ts](https://github.com/adm01-debug/Promo_Gifts_V4/blob/44857d5/src/services/quoteService.ts) | Criação transacional e fluxo de aprovação de desconto |
| [quoteTypes.ts](https://github.com/adm01-debug/Promo_Gifts_V4/blob/44857d5/src/hooks/quotes/quoteTypes.ts) | Identidade dos itens e atributos de personalização |
| [price-response.adapter.ts](https://github.com/adm01-debug/Promo_Gifts_V4/blob/44857d5/src/lib/personalization/adapters/price-response.adapter.ts) | Compatibilidade de respostas e distinção de custo, markup e margem |
| [public-views-columns.json](https://github.com/adm01-debug/Promo_Gifts_V4/blob/44857d5/.security/public-views-columns.json) | Contrato de colunas e máscaras, inclusive custo nulo |
| [SCHEMA_REFERENCE.md](https://github.com/adm01-debug/Promo_Gifts_V4/blob/44857d5/docs/SCHEMA_REFERENCE.md) | Fotografia documental do banco datada de 16/09/2026 |
| [E16 — views públicas](https://github.com/adm01-debug/Promo_Gifts_V4/blob/44857d5/docs/E16_VIEWS_PUBLIC_SECDEF_2026-09-16.md) | Análise documental das oito views definer e drift de colunas |
| [Contratos](https://github.com/adm01-debug/Promo_Gifts_V4/blob/44857d5/docs/contracts/README.md) | Versionamento e formato de erros das Edge Functions |
| [PERFORMANCE_AUDIT.md](https://github.com/adm01-debug/Promo_Gifts_V4/blob/44857d5/docs/PERFORMANCE_AUDIT.md) | Métricas históricas e metodologia declarada |

Também foram feitas buscas dirigidas por endpoints de revistas, sincronização de propostas, upload, rate limit, testes de concorrência e regras de desconto. Resultados de busca identificam caminhos; não constituem uma revisão completa de todas as funções encontradas.

## 2. Conclusão de arquitetura

O sistema é um **instrumento de trabalho comercial**, com capacidades que devem ser reaproveitadas através de contratos. A oportunidade é construir um frontend público próprio, leve e orientado ao comprador. Copiar o backoffice inteiro traria um volume de interações, dependências e dados desnecessário para a decisão pública.

O modelo Bronze → Silver → Gold já define a direção adequada: a vitrine utiliza dados Gold publicáveis; não usa landing de fornecedores, raw payloads ou padronização intermediária. A criação de proposta continua no processo comercial autorizado, respeitando preço, desconto e propriedade.

## 3. Achados, riscos e ações

Tipos: **C** = verificado no código; **D** = declarado em documento; **L** = leitura ao vivo nesta sessão; **H** = hipótese de risco a validar. Prioridades representam relevância para o lançamento da nova vitrine, não uma classificação de incidente existente.

| ID | Evidência / achado | Implicação para a vitrine | Ação |
|---|---|---|---|
| A01 · C · P0 | `/produtos`, detalhes e propostas estão sob `ProtectedRoute`. | O catálogo interno não é a experiência pública desejada. | Criar rotas públicas em aplicação própria e manter fronteiras existentes. |
| A02 · C · P0 | `client.ts` fixa `doufsxqlfjyuvxuezpln` e documenta incidente de projeto incorreto. | Apontar ao banco errado quebra autenticação e dados. | Validar host exato e configurar a integração explicitamente. |
| A03 · C · P0 | `GOLD_READ_ALIASES` redireciona `products` e `suppliers` para views públicas. | Leitura da base não é equivalente ao contrato seguro. | Usar projeção pública revisada; evitar `select=*`. |
| A04 · C/D · P0 | `cost_price` consta em contrato, mas deve ser mascarado com NULL. | Nome de coluna por si só não prova vazamento. | Testar o valor e restringir o DTO; não afirmar vazamento não observado. |
| A05 · D · P0 | Documento E16 registra superfície fiscal/integracional ainda em discussão (`ncm_*`, `bitrix_product_id`). | O site não precisa herdar esses campos. | Remover da projeção da aplicação e tratar mudanças de view no processo próprio. |
| A06 · D · P0 | Oito views usam contexto do proprietário como decisão arquitetural documentada. | Trocar indiscriminadamente para invoker pode quebrar acesso e mascaramento. | Revalidar grants e definição por pg_catalog antes de qualquer alteração. |
| A07 · C · P0 | DTO interno de preços inclui custo, markup e margem. | Serialização do objeto interno inteiro exporia informação comercial. | Criar resposta pública somente com condições comerciais aprovadas. |
| A08 · C · P0 | `quoteService.createQuote` usa RPC transacional, inclusive aprovação de desconto. | Inserir quote e itens isoladamente reimplementaria regras críticas. | Reutilizar o caminho autorizado após converter briefing em oportunidade. |
| A09 · C/H · P1 | `products-lightweight` pode iniciar quatro páginas de 500 e carregar até 15 mil itens se não houver limite. | Esse modo seria caro para uma vitrine; não foi afirmado que a home atual sempre o usa. | Paginação e filtragem de servidor com limite explícito. |
| A10 · C/H · P1 | Parte dos filtros de preço/categoria é aplicada após o fetch no serviço examinado. | Em conjunto paginado, resultados podem ficar incompletos se transportados sem revisão. | Fazer filtro/contagem na mesma consulta pública e testar paginação. |
| A11 · C · P1 | Há aliases EN/PT e contratos versionados de preço. | Acoplamento direto à forma antiga aumenta risco de regressão. | Usar adaptador pequeno, testado e com versão explícita. |
| A12 · C/D · P1 | Há tratamento de timeouts, fallback e depreciação de bridge. | Camadas legadas coexistem. | Escolher um caminho canônico de leitura, observável e limitado. |
| A13 · C · P1 | Catálogo contém comparação, seleção, fornecedores e ferramentas de venda. | Densidade apropriada ao vendedor pode dificultar a entrada do comprador. | Reaproveitar regras e dados; desenhar apresentação pública independente. |
| A14 · C · P1 | Revista pública utiliza token; orçamento convencional continua protegido. | “Link compartilhável” e “rota pública” não são sinônimos. | Especificar autenticação, expiração e escopo por fluxo. |
| A15 · D · P1 | README fala em 6.100+ produtos; copy em `Index.tsx` fala em 15.000. | Números de marketing divergem no próprio código/documentação. | Contar catálogo elegível ou evitar a alegação na vitrine. |
| A16 · D · P1 | Performance documentada em abril cita arquitetura de bridge anterior. | Latência histórica não comprova o desempenho atual. | Medir a nova implementação; não reutilizar p95 como garantia. |
| A17 · D · P1 | Snapshot de setembro registra 383 tabelas base e 940 policies. | Há patrimônio substancial e drift histórico. | Não reconstruir schema com base em lista PostgREST. |
| A18 · D · P0 | AGENTS exige aprovação do PO para alterações de schema canônico. | Integração não autoriza automaticamente DDL ampla. | Preparar desenho e migrations para revisão, sem executar nesta entrega. |
| A19 · L · P0 | GET limitado em `v_products_public` do host informado retornou HTTP 200. | Há caminho real de leitura disponível. | A amostra apoia o conceito; integração contínua precisa contrato e frescor. |
| A20 · L · P0 | Sete URLs principais da amostra retornaram HTTP 403 neste ambiente. | Mídia poderia falhar independentemente do catálogo responder. | Investigar CDN e manter fallback, sem atribuir a causa sem evidência. |
| A21 · L · P1 | Oito URLs alternativas de fornecedor foram obtidas com sucesso. | A prévia pode usar fotografia real e verificar correspondência por SKU. | Otimizar cópias locais e confirmar direitos antes da publicação. |
| A22 · L · P0 | Exemplo SKU `18549A`: título contém 250 ml e descrição 275 ml. | Capacidade inconsistente compromete confiança e cotação. | Não promover o item antes de verificar ficha técnica. |
| A23 · L · P0 | SKU `08255` traz materiais de couro legítimo e sintético na mesma lista. | Não é seguro transformá-lo em alegação “couro legítimo premium”. | Usar texto neutro na prévia e validar material antes do lançamento. |
| A24 · L/H · P1 | Preços observados variam amplamente e alguns conjuntos parecem desproporcionais. | Pode haver informação sem contexto ou classificação inadequada; erro não foi provado. | Reconciliar faixas e condições; a prévia usa “sob consulta”. |
| A25 · D/C · P1 | Grande quantidade de testes e quality gates existe no projeto. | Há mecanismos aproveitáveis, mas contagem não mede cobertura nem aprovação atual. | Preservar invariantes e executar os checks pertinentes na integração. |
| A26 · H · P0 | Envio público de briefing para CRM não foi validado nesta auditoria. | Uma tela de sucesso isolada não assegura recebimento comercial. | Implementar persistência, idempotência, protocolo e conciliação antes de abrir. |

## 4. Supabase: o que foi e o que não foi verificado

A URL canônica usada para consultas de produtos foi `https://doufsxqlfjyuvxuezpln.supabase.co`. Usou-se apenas a chave **anon pública** já presente no cliente do repositório, em memória no script de leitura. Nenhuma chave foi copiada para os documentos ou o novo frontend.

Consultas limitadas: 40 linhas candidatas por tipo de produto; 12 cadernos; 8 registros para URLs alternativas. Há sobreposição entre as amostras: não somar esses números como quantidade de produtos únicos auditados. Projeções não incluem contatos, pedidos, usuários, custos ou credenciais. Preços de venda observados são fotografias de consulta, não propostas comerciais.

Arquivos de evidência: [`audit/catalog-sample.json`](audit/catalog-sample.json), [`audit/notebook-sample.json`](audit/notebook-sample.json), [`audit/media-sample.json`](audit/media-sample.json), [`audit/media-check.json`](audit/media-check.json).

Os conectores administrativos disponíveis foram verificados para identificar o destino. Um retornou 401; outro era self-hosted PG15; o conector chamado “produção” identifica outro projeto, Promo Finance. Uma consulta limitada a metadados nesse último retornou contagens incompatíveis; **esses resultados foram descartados e não são atribuídos ao projeto informado**. Não houve uso dessas conexões para buscar registros operacionais, dados pessoais ou modificar bancos. Uma auditoria administrativa atual do canônico permanece pendente.

Por instrução do repositório, auditoria de esquema deve usar `pg_catalog`. A leitura via PostgREST feita aqui é **validação de dados públicos**, não inventário de tabelas, políticas ou grants. O documento de esquema de 16/09/2026 foi tratado como evidência documental datada.

## 5. O que reaproveitar

- Identidades estáveis de produtos, variantes e SKUs.
- Camada Gold e contratos de leitura pública, depois de revisar a projeção necessária.
- Fotografias e alternativas autorizadas, preservando rastreabilidade por produto.
- Técnicas e áreas de personalização realmente elegíveis.
- Motor de preço, faixas e regras de desconto, executados no contexto autorizado.
- Serviços transacionais de proposta e aprovação.
- Padrões existentes de versionamento, erros, rate limit e observabilidade, adaptados ao público.
- Testes de contrato e invariantes de projeto canônico.

## 6. O que precisa de uma camada nova

Publicação editorial premium, URLs públicas, templates de conteúdo, DTO enxuto, cache adequado, busca pública paginada, fluxo de briefing sem cadastro, protocolo, proteção contra abuso, transferência confiável ao CRM, política de privacidade fiel, consentimento quando aplicável e observabilidade própria do funil.

A existência de uma tabela ou serviço com nome semelhante não prova que atende ao caso. Antes de criar tabelas, conferir o inventário vivo correto e procurar capacidades existentes. O modelo da nova aplicação deve referenciar o catálogo, não criar outra fonte concorrente de preço ou disponibilidade.

## 7. Próximas verificações de maior valor

Primeiro: validar fotos e dados dos SKUs elegíveis, confirmar o processo de recebimento com três vendedores e revisar a projeção pública real. Depois: testar acesso anônimo, mínimos/variantes, orçamento transacional e idempotência no staging. Por fim: observar tarefas reais de compradores, desempenho e acessibilidade, registrar o que falta e decidir o lançamento.
