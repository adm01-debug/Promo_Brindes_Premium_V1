# Contrato de briefing v1

Status: endpoint implementado, receptor comercial não configurado. O banco dedicado da vitrine já possui a tabela privada `premium_briefings`, mas esta prévia não escreve nela. Enquanto `BRIEFING_WEBHOOK_URL` estiver vazio, a interface mantém download local e `POST /api/briefings` responde `503 DESTINATION_UNAVAILABLE`; ela não simula sucesso.

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

O servidor ignora qualquer SKU, preço, fornecedor, status de estoque ou regra comercial que o navegador tente fornecer. Ele resolve SKU e quantidade mínima apenas a partir do catálogo público carregado no servidor.

## Saídas

| Estado                                               | Resposta                                         |
| ---------------------------------------------------- | ------------------------------------------------ |
| Receptor confirmou                                   | `201` com `protocol` e `duplicate:false`.        |
| Mesma chave no processo                              | `200` com o mesmo `protocol` e `duplicate:true`. |
| Entrada inválida                                     | `422 INVALID_BRIEFING`.                          |
| Chave ausente ou inválida                            | `400 IDEMPOTENCY_KEY_REQUIRED`.                  |
| Origem não autorizada                                | `403 ORIGIN_REJECTED`.                           |
| Corpo que não é JSON                                 | `415 JSON_REQUIRED`.                             |
| Corpo acima de 16 KiB                                | `413 PAYLOAD_TOO_LARGE`.                         |
| Mais de cinco tentativas por endereço em dez minutos | `429 RATE_LIMITED`.                              |
| Receptor não configurado                             | `503 DESTINATION_UNAVAILABLE`.                   |
| Timeout ou erro do receptor                          | `502 DESTINATION_FAILED`.                        |

## Limite deliberado antes de produção

O receptor deve usar HTTPS, exceto `localhost` em desenvolvimento. O rate limit e a deduplicação atuais vivem na memória do processo. Eles evitam erro de interface e repetição durante uma instância da prévia, mas não são armazenamento transacional entre réplicas ou reinicializações. Antes de habilitar o receptor, trocar os dois por persistência idempotente no sistema canônico aprovado, registrar tentativas sem conteúdo sensível, definir conciliação e validar a passagem ao CRM com vendedores. O webhook é uma porta de adaptação; não substitui a criação transacional de proposta do projeto comercial.
