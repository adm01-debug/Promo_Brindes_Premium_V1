# Limite compartilhado do briefing — 22/09/2026

Escopo: projeto da vitrine `whwloseshzraipljisqo`. A entrega comercial segue desativada; nenhum lead foi criado nem enviado.

## Falhas simuladas antes da mudança

- Duas instâncias da aplicação tinham mapas de tentativas independentes, permitindo mais de cinco chamadas ao alternar entre elas.
- `x-forwarded-for` podia ser lido sem contrato explícito com o proxy.
- Reiniciar uma instância apagava a janela de tentativas.

## Controle implementado

- `20260922142000_add_briefing_rate_limit.sql` guarda somente HMAC SHA-256 do endereço IP e até cinco timestamps recentes por identidade. A função trava a linha com `FOR UPDATE`, preservando uma janela móvel de dez minutos entre instâncias.
- A entrega habilitada exige `PROMO_PREMIUM_CLIENT_IP_HEADER` igual a `x-vercel-forwarded-for`, `cf-connecting-ip` ou `x-real-ip`; aceita somente um endereço IP válido. Falta de endereço ou falha no RPC resulta em `503`, sem persistir briefing.
- A função e a tabela são privadas para `service_role`; `anon` não tem `EXECUTE` nem `SELECT`.
- `20260922143000_schedule_rate_limit_retention.sql` ativa `pg_cron` e agenda, a cada cinco minutos, a remoção de até 500 identidades sem uso há mais de uma hora.

## Evidência executada

| Cenário | Resultado |
| --- | --- |
| Módulos sintéticos alternando duas instâncias | Cinco respostas `422` após consumir o limite, sexta `429`; os `422` indicam que a entrada foi rejeitada após o controle compartilhado. |
| Corpo em fluxo acima de 16 KiB | `413` e cancelamento da leitura ao cruzar o teto. |
| Cabeçalho com cadeia de IPs não confiável | `503 CLIENT_ADDRESS_UNAVAILABLE`. |
| Banco canônico em transação revertida | Cinco chamadas retornaram `true`, sexta `false`; a transação foi revertida. |
| Privilégios do banco | `anon`: sem execução da função e sem leitura da tabela; `service_role`: execução concedida. |
| REST do Supabase | `200` com corpo booleano `true` para identidade sintética; linha de teste removida. |
| Retenção em transação revertida | Uma linha com duas horas de inatividade foi removida; a transação foi revertida. |
| Job de retenção | `cron.job` contém o job ativo `promo-premium-prune-rate-limits` em `*/5 * * * *`; o primeiro disparo remoto terminou com `succeeded`. |

O cabeçalho sobrescrito pelo proxy, a resistência com réplicas publicadas e o WAF ainda precisam de evidência em staging. A função no banco compartilha estado; a infraestrutura pode impor limites adicionais antes da aplicação. Esta validação não ativa coleta de dados nem homologa o CRM.

Referências técnicas: [PostgreSQL `FOR UPDATE`](https://www.postgresql.org/docs/current/explicit-locking.html), [funções e privilégios no Supabase](https://supabase.com/docs/guides/database/functions) e [Supabase Cron](https://supabase.com/docs/guides/cron).
