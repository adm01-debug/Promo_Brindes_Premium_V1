# Auditoria independente do banco Premium

Data: **22/09/2026**. Escopo: migrations, rebuild isolado, pgTAP, RLS, grants, funções elevadas, idempotência, concorrência, constraints, índices, aderência ao runtime e implantação segura.

O projeto operacional `doufsxqlfjyuvxuezpln` permaneceu estritamente somente leitura e não foi usado nos testes de banco. Todos os testes de mutação ocorreram no PostgreSQL local descartável. O projeto Premium `whwloseshzraipljisqo` recebeu apenas consultas de preflight; nenhuma migration ou linha foi alterada remotamente durante esta auditoria.

## Preflight remoto, somente leitura

Antes da migration nova, o Premium tinha as migrations até `20260922150000`, oito itens publicados, zero briefings e zero entregas em voo. Não havia colisão de SKU ao comparar `lower(sku)`. As oito linhas atendiam aos limites, trim e formatos finais; os maiores comprimentos observados foram, respectivamente, `8, 87, 27, 88, 39, 201 e 22` para SKU, slug, nome, nome original, tagline, descrição e caminho de imagem.

O preflight também confirmou RLS e ACL: `anon` podia selecionar o catálogo sujeito à policy de publicação e não podia selecionar briefings. Quatro funções `SECURITY DEFINER` antigas ainda usavam `search_path=public`; a migration nova corrige isso.

## Falhas encontradas e correções

1. **Lease sem fencing.** O finalizador recebia apenas a chave de idempotência. Depois da expiração e reaquisição, uma resposta atrasada podia alterar a tentativa mais nova. A migration `20260922152000_fence_delivery_leases.sql` adiciona um token UUID opaco por aquisição. Somente o token atual finaliza a linha.
2. **Rollout incompatível podia enviar antes de falhar.** As RPCs novas têm sufixo `_v2` e as versões antigas são removidas. Tanto app-novo/banco-antigo quanto banco-novo/app-antigo falham na claim, antes do webhook.
3. **Resolução de objetos em função elevada.** Todas as seis funções `SECURITY DEFINER` terminam com `search_path=''` e relações qualificadas. Seus ACLs permitem execução apenas a `service_role`; `anon`, `authenticated` e `PUBLIC` não têm execução.
4. **Contrato do catálogo existia apenas na aplicação.** Sete constraints agora espelham trim, limites e formatos públicos. Um índice único em `lower(sku)` impede colisões apenas por caixa.
5. **`updated_at` ficava obsoleto nos upserts.** Um trigger atualiza o campo em qualquer `UPDATE`, inclusive pela API REST.

## Evidência reproduzível

| Verificação                                                  | Resultado                                                                                                                    |
| ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| `supabase db reset --local`                                  | schema reconstruído do zero com dez migrations                                                                               |
| segundo reset + dumps antes/depois                           | dumps idênticos, SHA-256 `b9c159b092246966441dd61cd8231669cf2f7f480e6e7e567d9eee34556d68c0`                                  |
| `supabase test db --local`                                   | **58/58** contratos pgTAP aprovados                                                                                          |
| `npm run test:database-concurrency`                          | uma claim vencedora entre oito; token antigo atualizou zero linhas; limite distribuiu 5 permissões e 5 recusas               |
| `supabase db lint --local --level warning --fail-on warning` | zero alertas                                                                                                                 |
| `node scripts/audit-plan-scenarios.mjs`                      | **55/55** cenários isolados aprovados, incluindo lease antiga, divergência de protocolo e as duas ordens parciais de rollout |
| `npm run check:public-secrets`                               | aprovado                                                                                                                     |
| `npm run db:migrate -- --dry-run`                            | somente `20260922152000_fence_delivery_leases.sql` pendente; nenhuma escrita                                                 |

Os testes também executam RLS como `anon` e `authenticated`, provam que uma linha não publicada não é visível, verificam ACLs das RPCs, deduplicação por chave/hash, conflito de payload, rotação do token, bloqueio de finalizador atrasado, limpeza do lease, janela de rate limit, constraints validadas, índice case-insensitive e avanço automático de `updated_at`.

## Implantação e rollback

A entrega comercial deve permanecer desligada. A ordem segura é: publicar o runtime que chama as RPCs `_v2`, aplicar a migration no Premium, repetir pgTAP/lint e validar o runtime ainda desligado. Nas duas ordens parciais, a claim falha antes de qualquer chamada externa.

Não se deve restaurar as RPCs sem token para fazer rollback. Se o aplicativo precisar voltar depois da migration, mantenha `BRIEFING_DELIVERY_ENABLED=false` e faça roll-forward para uma versão compatível com `_v2`. A migration converte qualquer lease legado em `failed` para conciliação; o preflight encontrou zero linhas em voo.

## Gaps que dependem de decisão ou ambiente externo

- A migration está validada e pendente no Premium remoto; esta auditoria não alterou produção.
- Receptor/CRM, idempotência do receptor, conciliação operacional e teste de staging continuam sem homologação.
- A retenção e eliminação de briefings com dados pessoais dependem de prazo aprovado, controlador e procedimento operacional.
- Backup, PITR, alertas, restrições de rede e restauração real dependem das configurações do projeto Supabase e não foram demonstrados por código.
- `search_text` e seu índice ainda não participam da consulta atual, que carrega a projeção limitada e calcula resultados/facetas no servidor Next.js. É dívida de eficiência, não divergência de resultado no catálogo atual.
