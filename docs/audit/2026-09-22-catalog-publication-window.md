# Vigência e retirada do catálogo público

Data: 22/09/2026  
Banco alterado: somente o projeto Premium `whwloseshzraipljisqo`.

## Resultado

A publicação deixou de depender apenas do booleano `published`. Cada peça pode ter `published_from` e `published_until`; limites nulos mantêm vigência aberta. A policy RLS, a consulta pública geral, a ficha permanente, as coleções, o sitemap, a conferência editorial e a validação sem cache do briefing exigem simultaneamente:

1. `published = true`;
2. `published_from` ausente ou já alcançado;
3. `published_until` ausente ou ainda futuro.

O término é exclusivo. Quando `published_until` é igual ao instante da consulta, a peça já está fora da publicação. Um intervalo com término anterior ou igual ao início é recusado por constraint.

## Cache e SLA

As superfícies públicas de descoberta foram reduzidas de cinco para **um minuto**. A API responde `public, s-maxage=60, must-revalidate`, sem `stale-while-revalidate`; home, ficha, coleção e sitemap revalidam em 60 segundos. Assim, uma retirada administrativa ou o fim de uma vigência deixa as superfícies cacheadas dentro do SLA editorial de 60 segundos. Consultas por IDs e o `POST /api/briefings` continuam com `no-store`, portanto a decisão de enviar ou baixar um briefing usa a publicação vigente naquele instante.

Esse SLA cobre a propagação controlada pela aplicação e pelo cache declarado. Um CDN externo adicionado no futuro precisa preservar `must-revalidate` ou adotar invalidação explícita; caso contrário, o critério deve ser reaberto.

## Banco e implantação

A migration `20260922221500_add_catalog_publication_window.sql` foi aplicada primeiro porque é retrocompatível com o runtime anterior. Os oito registros existentes ficaram com os dois limites nulos. A validação remota confirmou uma migration registrada, duas colunas, constraint, índice, policy temporal, oito registros, zero registros com limite e oito registros visíveis para `anon`. O dry-run posterior não encontrou migration pendente. O banco operacional `doufsxqlfjyuvxuezpln` não recebeu escrita, migration ou mudança de permissão.

O sincronizador não envia os campos de vigência em seu `upsert`; portanto, uma agenda definida no banco Premium é preservada. Uma peça com `published=false` continua bloqueando a sincronização para que uma decisão manual de retirada não seja revertida.

## Testes e simulações

| Cenário                               | Resultado                                             |
| ------------------------------------- | ----------------------------------------------------- |
| Peça sem limites e publicada          | visível                                               |
| Peça não publicada                    | invisível                                             |
| Início futuro                         | invisível                                             |
| Término passado                       | invisível                                             |
| Janela atual                          | visível                                               |
| Término anterior ao início            | recusado com `23514`                                  |
| Leitura como `anon` e `authenticated` | somente as duas peças vigentes                        |
| Consulta geral e ficha                | filtro PostgREST temporal exato e revalidação de 60 s |
| Seleção/briefing                      | `no-store`, mantendo rejeição imediata                |

Evidência reproduzível:

- `supabase test db --local`: **64/64** contratos pgTAP;
- `supabase db lint --local --level warning --fail-on warning`: zero alertas;
- `node scripts/audit-plan-scenarios.mjs`: **57/57** cenários;
- `npm run check:editorial:live`: oito produtos e 12 campos por peça iguais ao snapshot;
- `npm run db:migrate -- --dry-run`: banco remoto atualizado, sem migration pendente.

## Produção validada

O runtime foi publicado pelo commit técnico `37b278a3a8e167bc6fdadc0e34d93f6b2fddb9c1` no deployment Vercel `dpl_AquMsZCasrt5mME84puAJ628Mmco`, com URL imutável `https://promo-brindes-premium-v1-iwt72z78c-juca1.vercel.app` e alias `https://promo-brindes-premium-v1.vercel.app`. O GitHub registrou o deployment de produção `6601902320` para o mesmo SHA.

- [Banco isolado 35791611794](https://github.com/adm01-debug/Promo_Brindes_Premium_V1/actions/runs/35791611794): aprovado em 1m46s, com rebuild de onze migrations, 64 contratos pgTAP, concorrência e lint sem alertas.
- [Qualidade 35791611910](https://github.com/adm01-debug/Promo_Brindes_Premium_V1/actions/runs/35791611910): aprovado em 4m14s, com tipos, plano, build, 57 cenários, 70 contratos unitários e 213 execuções E2E.
- Smoke autenticado: catálogo `200`, contrato `2026-09-22.2`, oito itens, fonte `site-database`; briefing `configured:false`; home e ficha `200`; CSP, HSTS, `nosniff`, `DENY` e `X-Robots-Tag: noindex, nofollow` presentes.
- Cache real na mesma URL: primeiro `MISS`, depois `HIT` com `age: 35`, seguido de novo `MISS` e `age: 0` depois do vencimento. O segundo `MISS` trouxe outro `X-Request-Id`, provando nova execução após o SLA.
- Logs do deployment: seis eventos inspecionados, zero `5xx` e zero correspondência para secret, URL PostgreSQL, bearer, e-mail ou telefone.
