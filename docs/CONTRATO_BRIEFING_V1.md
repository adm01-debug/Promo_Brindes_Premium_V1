# Contrato de briefing v1

Status: a entrega é implementada, durável e **desligada por padrão**. A interface só deixa o modo de download local quando `BRIEFING_DELIVERY_ENABLED=true`, há um receptor HTTPS aprovado em `BRIEFING_WEBHOOK_URL`, um cabeçalho de IP de proxy confiável em `PROMO_PREMIUM_CLIENT_IP_HEADER` e as credenciais do banco dedicado estão completas. Ter uma URL por si só não inicia coleta de contato.

O servidor grava primeiro o briefing privado no Supabase da vitrine usando a chave de idempotência e um hash do conteúdo comercial. Em seguida, uma reserva atômica de dois minutos permite apenas uma chamada concorrente ao receptor. Erro ou timeout preserva o protocolo como pendente para nova tentativa com a mesma chave. A ativação continua bloqueada até haver política de privacidade, retenção, responsável comercial e integração homologada.

## Entrada

`POST /api/briefings` requer `Content-Type: application/json`, origem igual a `PROMO_PREMIUM_SITE_ORIGIN` (ou à própria origem quando a variável não existe) e cabeçalho `Idempotency-Key` com 16 a 128 caracteres alfanuméricos, `_` ou `-`.

```json
{
  "name": "Nome da pessoa",
  "company": "Empresa",
  "email": "contato@empresa.com",
  "occasion": "Relacionamento com clientes",
  "date": "2026-12-01",
  "budget": "R$ 100 a R$ 250",
  "message": "Observações de personalização",
  "items": [{ "productId": "uuid-canônico", "quantity": 5 }]
}
```

O corpo é limitado a 16 KiB medidos nos bytes recebidos. O servidor rejeita datas inexistentes, textos acima do limite e quantidades abaixo do mínimo publicado. SKU, preço, fornecedor, estoque e regras enviados pelo navegador são ignorados: os dados de item são resolvidos novamente no catálogo publicado.

## Saídas

| Estado | Resposta |
| --- | --- |
| Receptor confirmou uma nova entrega | `201` com `protocol` e `duplicate:false`. |
| Repetição após entrega concluída | `200` com o mesmo `protocol` e `duplicate:true`. |
| Outra solicitação usa a mesma chave durante a reserva | `202` com o mesmo `protocol`, `duplicate:true` e `pending:true`. |
| Mesma chave com conteúdo diferente | `409 IDEMPOTENCY_PAYLOAD_CONFLICT`. |
| Receptor falha ou expira | `503 BRIEFING_PENDING` com protocolo para acompanhamento. |
| Entrada inválida | `422 INVALID_BRIEFING`. |
| Chave ausente ou inválida | `400 IDEMPOTENCY_KEY_REQUIRED`. |
| Origem não autorizada | `403 ORIGIN_REJECTED`. |
| Corpo que não é JSON | `415 JSON_REQUIRED`. |
| Corpo acima de 16 KiB | `413 PAYLOAD_TOO_LARGE`. |
| Mais de cinco tentativas por endereço em dez minutos | `429 RATE_LIMITED`. |
| Proxy não fornece um único endereço IP válido | `503 CLIENT_ADDRESS_UNAVAILABLE`. |
| Limite distribuído indisponível | `503 RATE_LIMIT_UNAVAILABLE`. |
| Entrega não ativada ou receptor inválido | `503 DESTINATION_UNAVAILABLE`. |

## Persistência e operação

As migrations `20260922120000` a `20260922125000` criam o estado de entrega, a chave única, hash, contagem de tentativas, reserva com expiração e as funções privadas `persist_premium_briefing`, `claim_premium_briefing_delivery` e `record_premium_briefing_delivery`. A migration `20260922130000` adiciona busca normalizada ao catálogo publicado. `20260922142000` adiciona janela móvel compartilhada no PostgreSQL; `20260922143000` agenda uma limpeza a cada cinco minutos, removendo até 500 identidades sem uso há mais de uma hora por execução. As funções só podem ser chamadas por `service_role`; `anon` e `authenticated` não recebem acesso.

Com a entrega ativa, o servidor aceita apenas `x-vercel-forwarded-for`, `cf-connecting-ip` ou `x-real-ip`, conforme o valor explícito de `PROMO_PREMIUM_CLIENT_IP_HEADER`. O proxy escolhido precisa **sobrescrever**, e não repassar, esse cabeçalho; um valor ausente, inválido ou com múltiplos endereços bloqueia o envio. O IP é convertido em HMAC com a chave de servidor antes de chegar ao banco. Sem entrega, há apenas um limite local de prévia. Antes da abertura pública, infraestrutura e segurança devem verificar o cabeçalho no proxy real, WAF, alertas, retenção aprovada e runbook de conciliação. O webhook é uma porta de adaptação e não cria automaticamente proposta, preço, reserva ou tarefa no CRM. A aprovação e o teste ponta a ponta com o destino comercial permanecem requisitos de lançamento.
