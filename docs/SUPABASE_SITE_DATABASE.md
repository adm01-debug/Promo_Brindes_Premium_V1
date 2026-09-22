# Banco oficial da vitrine premium

Verificado em 22/09/2026. Projeto da **vitrine premium**: `whwloseshzraipljisqo` (`https://whwloseshzraipljisqo.supabase.co`). O projeto `doufsxqlfjyuvxuezpln` continua sendo a fonte operacional do aplicativo comercial `Promo_Gifts_V4`, da qual veio a amostra editorial original. Não foi alterado.

## Configuração local

O arquivo `.env.local`, ignorado pelo Git e com permissão `0600`, contém URL, chave publicável, chave de servidor, JWKS, host do pooler e senha do banco fornecidos para este projeto. `.env.example` contém somente nomes e referências públicas. Nunca colocar a chave `sb_secret_...` no código do navegador ou no Git.

As variáveis separadas `CATALOG_SOURCE_SUPABASE_URL` e `CATALOG_SOURCE_SUPABASE_PUBLISHABLE_KEY` configuram a origem operacional em **somente leitura**. A chave secreta da origem não é armazenada nem usada. O cliente da origem só faz GET na view `v_products_public`; não expõe método, caminho ou corpo configurável. Os detalhes e a verificação estão em [CATALOGO_ORIGEM_SOMENTE_LEITURA.md](CATALOGO_ORIGEM_SOMENTE_LEITURA.md).

A conexão PostgreSQL direta fornecida resolve apenas para IPv6 neste ambiente; foi usado o pooler de sessão `aws-0-us-east-2.pooler.supabase.com:5432`, com TLS. A região `us-east-2` foi conferida antes de conectar. `supabase init` criou `supabase/config.toml`. `supabase link --project-ref whwloseshzraipljisqo` foi tentado, mas a conta atualmente autenticada na CLI recebeu `403` de privilégio na Management API. A migration foi executada com `supabase db push --db-url` para o mesmo projeto confirmado por conexão PostgreSQL; o vínculo de gerenciamento da CLI continua pendente até a conta ter acesso ao projeto.

## Migrations aplicadas e pendente

`supabase/migrations/20260922110900_create_premium_site_core.sql` cria:

- `public.premium_catalog_items`: 8 peças curadas, IDs/SKUs originais, ordem editorial, publicação explícita, quantidades mínimas e mídia local. RLS permite somente leitura dos publicados para `anon` e `authenticated`.
- `public.premium_briefings`: estrutura privada para contato, projeto, itens, protocolo e chave de idempotência única. RLS está ligado, sem policy para `anon` ou `authenticated`; nenhum briefing comercial foi criado.

As migrations `20260922120000_persist_idempotent_briefings.sql`, `20260922123000_claim_briefing_delivery.sql`, `20260922124000_fix_delivery_claim_ambiguity.sql` e `20260922125000_fix_delivery_record_ambiguity.sql` acrescentam estado de entrega, tentativas, lease de dois minutos e funções `SECURITY DEFINER` para persistir, reservar e finalizar a entrega. `20260922130000_add_normalized_catalog_search.sql` acrescenta busca normalizada gerada e indexada ao catálogo. `20260922142000_add_briefing_rate_limit.sql` cria a janela móvel compartilhada de cinco tentativas por dez minutos e a função de limpeza; `20260922143000_schedule_rate_limit_retention.sql` habilita `pg_cron` e agenda a limpeza a cada cinco minutos. `20260922150000_lookup_briefing_intent.sql` instala a recuperação do protocolo por chave/hash da intenção normalizada, exigindo zero linhas legadas antes da mudança de semântica. As funções são revogadas de `public`, `anon` e `authenticated`, e concedidas apenas a `service_role`.

`20260922152000_fence_delivery_leases.sql` está validada localmente e pendente no remoto. Ela troca as RPCs de entrega pelas versões `_v2`, cerca cada tentativa com um token UUID, esvazia o `search_path` das funções elevadas, espelha o contrato público em constraints, torna SKU único sem diferenciar caixa e mantém `updated_at` correto por trigger. O preflight remoto encontrou oito itens compatíveis e nenhum briefing ou lease em voo. A evidência completa e a ordem de implantação estão na [auditoria de hardening do banco](audit/2026-09-22-database-hardening.md).

Os comandos reproduzíveis são `npm run db:migrate -- --dry-run`, `npm run db:migrate` e `npm run db:sync-catalog`. O sincronizador primeiro confere os oito IDs, atividade, SKUs, nomes originais, mínimos e personalização na origem operacional usando a chave publishable. Divergência, resposta incompleta ou indisponibilidade interrompe a execução antes de qualquer gravação. Depois verifica a publicação no destino e importa os oito registros de `src/lib/products.json` exclusivamente no banco premium, usando sua chave de servidor. `npm run db:sync-catalog -- --dry-run` valida esse caminho sem escrever. A rota `GET /api/catalog`, a home, as fichas permanentes e a validação do briefing leem a projeção pública paginada quando o ambiente está configurado e respondem uma indisponibilidade explícita em falhas do upstream. Sem configuração, o snapshot local permanece somente como fallback de prévia e testes offline.

## Verificação pós-migration

| Verificação                          | Resultado                                                                                                                                        |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Ensaio da SQL em transação revertida | Passou; 0 objetos residuais após rollback                                                                                                        |
| Histórico remoto                     | Versões `20260922110900` até `20260922150000` registradas; dry-run aponta somente `20260922152000` pendente                                      |
| Catálogo                             | 8 registros, 8 publicados, 8 SKUs distintos                                                                                                      |
| Briefings                            | 0 registros comerciais; teste de funções executado em transação revertida                                                                        |
| RLS                                  | Ativo nas três tabelas do domínio Premium                                                                                                        |
| Funções de entrega                   | Alvo local `_v2`: 1 vencedor em 8 claims; token antigo bloqueado; finalização atual aprovada                                                     |
| Consulta por protocolo               | Chave de serviço: `200 []` para chave ausente; chave pública: `401`; correspondência/conflito aprovados em transação revertida, contagem final 0 |
| Limite compartilhado                 | Cinco tentativas aceitas e sexta bloqueada; retorno REST booleano confirmado; `anon` sem EXECUTE/SELECT                                          |
| Retenção                             | Limpeza de linha antiga aprovada em rollback; job ativo a cada cinco minutos, primeiro disparo remoto com `succeeded`                            |

O formulário continua em download local porque `BRIEFING_DELIVERY_ENABLED=false`. A tabela privada e a capacidade técnica não equivalem a entrega a vendedores ou integração com CRM. O contato só deve passar a ser persistido após definir política de privacidade, retenção, operador, atendimento comercial e receptor homologado.
