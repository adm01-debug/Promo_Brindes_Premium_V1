# Auditoria de release, produção e rollback

Data: **22/09/2026**. Escopo: GitHub Actions, integração GitHub/Vercel, ambiente publicado, logs de runtime, configuração de produção e retorno seguro à versão anterior. Nenhum segredo é reproduzido neste relatório.

## Estado comprovado

| Gate                    | Evidência                                                                                                                                             | Resultado                                                                                                                                                                                                                                                        |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Vínculo commit → deploy | Deployment GitHub `6600844910`, deploy Vercel `dpl_Fg4riGNHkhoCvu6WcrQvCwSwyKGS` e URL imutável `promo-brindes-premium-v1-efn7x0svh-juca1.vercel.app` | Os três apontam para `9f79e7d9064126f85ed0b8ef23bb053ca3e66b69`; o alias público aponta para esse deploy.                                                                                                                                                        |
| Banco isolado           | GitHub Actions `35785186434`                                                                                                                          | Aprovado, incluindo rebuild, pgTAP e lint.                                                                                                                                                                                                                       |
| Qualidade               | GitHub Actions `35785186458`                                                                                                                          | Falhou em 1 de 201 execuções: timeout Firefox no teste que acumulava reflow e menu móvel.                                                                                                                                                                        |
| Reprodução do flake     | Firefox local, `CI=true`, um worker                                                                                                                   | A tentativa de paralelizar quatro páginas também falhou. A correção divide os quatro pares rota/largura e a jornada do menu em testes independentes, aguardando um efeito observável da hidratação. Passou 15/15 em três repetições e o menu passou 5/5 isolado. |
| Catálogo online         | Sonda autenticada no deploy imutável                                                                                                                  | HTTP 200, contrato `2026-09-22.2`, oito itens publicados, `X-Catalog-Source: site-database`, UUID em `X-Request-Id` e `Server-Timing`.                                                                                                                           |
| Privacidade operacional | `GET /api/briefings`                                                                                                                                  | HTTP 200, `Cache-Control: no-store` e `configured:false`; receptor comercial permanece desligado.                                                                                                                                                                |
| Indexação               | `/robots.txt` e `/sitemap.xml`                                                                                                                        | Bloqueio integral por robots e sitemap sem URLs.                                                                                                                                                                                                                 |
| Headers                 | Home e APIs                                                                                                                                           | CSP, HSTS da plataforma, `nosniff`, `DENY`, Referrer Policy, Permissions Policy e `X-Robots-Tag: noindex` presentes.                                                                                                                                             |
| Logs                    | 11 requisições do deploy examinadas                                                                                                                   | Zero 5xx; zero segredo local exato, token secreto, URL PostgreSQL com senha, bearer, e-mail, telefone ou payload de contato nos campos de mensagem. A amostra é pequena e não substitui monitor contínuo.                                                        |

As variáveis canônicas usadas pela aplicação existem em `production` e `preview`. Credenciais `CATALOG_SOURCE_SUPABASE_*`, webhook, allowlist do receptor e cabeçalho de IP não estão no runtime Vercel. Isso mantém a origem operacional fora do site e a entrega comercial desligada. A Vercel não permite baixar o valor de variáveis marcadas como sensíveis; a conferência de comportamento foi feita pelo fail-closed e pelo cabeçalho online `X-Catalog-Source: site-database`.

Há variáveis legadas da integração Supabase/Postgres somente em produção. Uma busca no repositório não encontrou consumo desses nomes pela aplicação. Elas não causaram o comportamento observado, mas devem ser inventariadas com o proprietário da integração antes de uma remoção futura.

## Falha de governança encontrada

A branch `main` não possui branch protection nem ruleset. A Vercel marcou o deployment como sucesso e publicou o alias antes de o check de qualidade terminar com falha. Portanto, hoje um build válido pode chegar ao ambiente `production` mesmo com Quality ou Database reprovado.

O gate de lançamento permanece aberto até exigir os checks `verify` e `test` antes de promover o alias de produção. Isso pode ser resolvido com branch protection e pull request obrigatório, ou separando build de preview e promoção manual/automatizada condicionada aos dois checks. O ambiente atual continua protegido, não indexável e sem entrega comercial, o que reduz o impacto enquanto esse gate não existe.

O projeto também está em uma única região Vercel (`iad1`) e sem failover configurado. Não há monitor de 5xx, latência, catálogo ou briefing efetivamente conectado; [os limiares e responsáveis](../OBSERVABILIDADE_E_ALERTAS.md) estão definidos, mas ainda precisam ser provisionados e ensaiados.

## Runbook de publicação

1. Confirmar árvore limpa, SHA candidata e dois checks verdes no mesmo SHA: `Quality gates / verify` e `Isolated database contracts / test`.
2. Executar o dry-run das migrations exclusivamente contra o projeto Premium e manter a origem operacional em GET-only.
3. Publicar o runtime com entrega comercial desligada. Para a migration de fencing, o runtime novo e o schema novo podem coexistir durante o rollout porque nenhuma RPC de entrega é chamada enquanto `BRIEFING_DELIVERY_ENABLED=false`.
4. Confirmar que deployment GitHub, URL imutável Vercel e alias apontam para o SHA candidato.
5. Repetir o smoke em URL imutável e alias: home, catálogo, seleção por IDs sem cache, briefing desativado, robots, sitemap, CSP e ausência de 5xx.
6. Examinar logs sem imprimir conteúdo sensível. Bloquear a promoção se houver segredo, PII, `X-Catalog-Source` diferente de `site-database`, contrato divergente ou erro 5xx.
7. Manter CRM/webhook desligado até homologação do receptor, conciliação, proxy/IP e monitoramento.

## Runbook de rollback

O último commit com os dois workflows verdes antes desta auditoria é `41f2af983e5922b9da6de53acc89f521e60b93ce`, materializado no deploy imutável `promo-brindes-premium-v1-qrfhbbt7y-juca1.vercel.app`. Antes de qualquer rollback, verificar que essa URL ainda retorna catálogo da base Premium e continua com entrega comercial desativada.

1. Declarar incidente e registrar SHA atual, deployment ID, horário, sintoma e request IDs sem dados pessoais.
2. Se a regressão estiver no runtime, usar `vercel rollback <deployment-id-ou-url> --yes` para retornar ao deploy aprovado e aguardar o término da operação.
3. Confirmar o alias, o SHA e todo o smoke do passo 5. Monitorar 5xx e latência por ao menos uma janela completa do alerta.
4. Não reverter migration SQL automaticamente. Criar uma migration corretiva forward-only, testada por reset local, pgTAP e lint.
5. A migration de fencing remove as RPCs antigas. Um runtime anterior só é seguro depois dela enquanto a entrega comercial permanecer desligada. Não habilitar webhook em uma versão antiga; recuperar a versão compatível com RPCs `_v2` antes de qualquer piloto.
6. Encerrar o incidente somente depois de documentar causa, impacto, recuperação e prevenção.

Nenhum rollback foi executado nesta auditoria: o ambiente online respondeu corretamente, e a falha encontrada estava no determinismo do teste e na ausência de gate de promoção.
