# Banco oficial da vitrine premium

Verificado em 22/09/2026. Projeto da **vitrine premium**: `whwloseshzraipljisqo` (`https://whwloseshzraipljisqo.supabase.co`). O projeto `doufsxqlfjyuvxuezpln` continua sendo a fonte operacional do aplicativo comercial `Promo_Gifts_V4`, da qual veio a amostra editorial original. Não foi alterado.

## Configuração local

O arquivo `.env.local`, ignorado pelo Git e com permissão `0600`, contém URL, chave publicável, chave de servidor, JWKS, host do pooler e senha do banco fornecidos para este projeto. `.env.example` contém somente nomes e referências públicas. Nunca colocar a chave `sb_secret_...` no código do navegador ou no Git.

A conexão PostgreSQL direta fornecida resolve apenas para IPv6 neste ambiente; foi usado o pooler de sessão `aws-0-us-east-2.pooler.supabase.com:5432`, com TLS. A região `us-east-2` foi conferida antes de conectar. `supabase init` criou `supabase/config.toml`. `supabase link --project-ref whwloseshzraipljisqo` foi tentado, mas a conta atualmente autenticada na CLI recebeu `403` de privilégio na Management API. A migration foi executada com `supabase db push --db-url` para o mesmo projeto confirmado por conexão PostgreSQL; o vínculo de gerenciamento da CLI continua pendente até a conta ter acesso ao projeto.

## Migration aplicada

`supabase/migrations/20260922110900_create_premium_site_core.sql` cria:

- `public.premium_catalog_items`: 8 peças curadas, IDs/SKUs originais, ordem editorial, publicação explícita, quantidades mínimas e mídia local. RLS permite somente leitura dos publicados para `anon` e `authenticated`.
- `public.premium_briefings`: estrutura preparada para contato, projeto, itens, protocolo e chave de idempotência única. RLS está ligado, sem policy para `anon` ou `authenticated`; nenhum briefing foi criado.

Os comandos reproduzíveis são `npm run db:migrate -- --dry-run`, `npm run db:migrate` e `npm run db:sync-catalog`. O sincronizador usa a chave de servidor apenas no processo local e importa exatamente os oito registros de `src/lib/products.json`. A rota `GET /api/catalog` lê a projeção pública do novo banco quando o ambiente está configurado e responde `503 CATALOG_UNAVAILABLE` em falhas do upstream. Sem configuração, mantém o snapshot local para prévias e testes offline. A página inicial e as fichas permanentes ainda usam o snapshot editorial versionado; mudanças de catálogo além dessas oito peças exigem revisão de conteúdo e atualização dessas páginas.

## Verificação pós-migration

| Verificação                          | Resultado                                                                     |
| ------------------------------------ | ----------------------------------------------------------------------------- |
| Ensaio da SQL em transação revertida | Passou; 0 objetos residuais após rollback                                     |
| Histórico remoto                     | Versão `20260922110900` registrada em `supabase_migrations.schema_migrations` |
| Catálogo                             | 8 registros, 8 publicados, 8 SKUs distintos                                   |
| Briefings                            | 0 registros                                                                   |
| RLS                                  | Ativo nas duas tabelas                                                        |
| Chave pública                        | `GET` do catálogo `200`, 8 itens; `GET` de briefings `401`                    |
| Chave de servidor                    | `GET` de briefings `200`, 0 itens                                             |

O formulário continua em download local porque `BRIEFING_WEBHOOK_URL` está vazio. A tabela preparada não equivale a entrega a vendedores ou integração com CRM. O contato só deve passar a ser persistido após definir política de privacidade, retenção, operador e atendimento comercial.
