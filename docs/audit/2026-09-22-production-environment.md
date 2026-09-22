# Validação do ambiente Vercel e catálogo canônico

Data: 22/09/2026. Commit: `41f2af983e5922b9da6de53acc89f521e60b93ce`. Deploy validado: `dpl_2mLEEwcGQPdqJP1cGdpVm7V9wGSn`, alvo `production`, estado `Ready` e alias `https://promo-brindes-premium-v1.vercel.app`.

## Falha encontrada e correção

A primeira sonda autenticada encontrou `X-Catalog-Source: snapshot`: as variáveis existentes na Vercel não representavam os valores aprovados do projeto Premium. As variáveis usadas pela aplicação foram substituídas, como valores sensíveis, nos ambientes `production` e `preview`; o webhook e o cabeçalho de IP foram removidos enquanto a entrega comercial está desligada. O banco operacional não foi configurado no runtime público e continua restrito ao sincronizador local somente leitura.

Um redeploy do mesmo commit foi criado após a correção. Nenhum valor de variável, token ou credencial foi registrado neste documento.

Como defesa contra recorrência, o runtime rejeita configuração ausente em `VERCEL_ENV=preview` ou `production`; o snapshot continua disponível somente no desenvolvimento e CI local. Assim, uma variável removida ou não aplicada resulta em indisponibilidade explícita, em vez de publicar silenciosamente uma cópia local.

## Resultado observado no artefato online

| Verificação                          | Resultado                                                                               |
| ------------------------------------ | --------------------------------------------------------------------------------------- |
| Estado do deploy                     | `Ready` em produção                                                                     |
| `GET /api/catalog?page=1&pageSize=1` | HTTP 200                                                                                |
| Origem declarada                     | `X-Catalog-Source: site-database`                                                       |
| Contrato                             | `2026-09-22.2`                                                                          |
| Catálogo                             | 8 publicados; uma linha na página solicitada                                            |
| Correlação                           | `X-Request-Id` UUID e `Server-Timing` presentes                                         |
| Home                                 | um H1 e catálogo renderizado no HTML                                                    |
| Ficha                                | JSON-LD e três recomendações contextuais renderizadas                                   |
| Privacidade                          | modo local informa que os campos não são transmitidos                                   |
| Indexação                            | `robots.txt` bloqueia todo o site                                                       |
| Entrega comercial                    | `BRIEFING_DELIVERY_ENABLED=false`; webhook ausente                                      |
| Logs                                 | build e cinco entradas de runtime examinados; zero segredo exato e zero padrão sensível |

O endpoint protegido foi acessado com o bypass temporário administrado pela própria CLI da Vercel; o valor do bypass não foi impresso nem persistido no repositório. O deploy continua protegido por SSO e sem domínio comercial. Staging independente, domínio final, CRM homologado, monitoramento ativo e ensaio de rollback continuam gates de lançamento.

## Evidência relacionada

- GitHub Actions de qualidade: `35782380054`, aprovado com 198 execuções E2E.
- GitHub Actions de banco isolado: `35782380065`, aprovado com rebuild das migrações, pgTAP e lint.
- `npm run db:migrate -- --dry-run`: banco Premium remoto sem migrações pendentes.
- `npm run check:catalog-source`: oito produtos conferidos por GET no banco operacional, sem escrita.
- `npm run db:sync-catalog -- --dry-run`: origem e destino conferidos, sem escrita.
