# Verificação ao vivo do catálogo canônico

> Atualização posterior em 22/09/2026: este registro descreve a leitura inicial do banco operacional. As migrations `20260922110900` até `20260922130000` foram aplicadas depois, somente no banco dedicado da vitrine `whwloseshzraipljisqo`; o banco operacional não foi alterado. O estado atual está em [SUPABASE_SITE_DATABASE.md](../SUPABASE_SITE_DATABASE.md).

Data: 22/09/2026. Alvo confirmado: `doufsxqlfjyuvxuezpln`.

Foi feita uma leitura limitada da view pública `v_products_public`, autenticada pela chave anônima pública já distribuída pelo cliente do projeto comercial. Nenhuma chave foi registrada neste repositório, nenhum dado foi alterado e nenhuma consulta usou `select=*`.

| Verificação | Resultado |
|---|---|
| Host canônico | `https://doufsxqlfjyuvxuezpln.supabase.co` respondeu à API REST com a referência de projeto correta. |
| Snapshot | Os 8 IDs usados na vitrine retornaram 8 linhas; todos pertencem à solicitação. |
| Projeção | A resposta solicitada continha somente `id`, `sku` e `name`. |
| Campo de custo | A view aceita a coluna `cost_price`, mas os 8 valores retornados foram `null`; nenhum valor de custo foi exposto. |

Esta é uma validação de contrato público e não uma auditoria de schema. Sem credencial administrativa, não foram consultados `pg_catalog`, policies, grants, triggers, migrations ou dados internos. As mudanças da vitrine são aplicação, ativos e documentação locais: não criam tabela, view, função, Edge Function ou dado canônico. Portanto, nenhuma migration foi aplicada ao banco de produção nesta entrega.
