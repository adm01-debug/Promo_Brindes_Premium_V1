# Contrato público de catálogo v1

Status: implementado para o snapshot editorial e, quando configurado, para a tabela pública curada do projeto da vitrine `whwloseshzraipljisqo`. Este contrato não autoriza acesso direto do navegador a tabelas internas, à aplicação comercial ou a campos de custo.

`GET /api/catalog` entrega uma projeção editorial versionada. A resposta carrega `X-Catalog-Contract-Version: 2026-09-21` e usa cache compartilhado de cinco minutos, com `stale-while-revalidate` de dez minutos.

## Parâmetros

| Parâmetro  | Regra                                                                    |
| ---------- | ------------------------------------------------------------------------ |
| `q`        | Texto de até 100 caracteres; busca nome, nome original, SKU e categoria. |
| `category` | `Todos`, `Kits & experiências`, `Escrita`, `Lifestyle` ou `Viagem`.      |
| `page`     | Inteiro positivo; padrão `1`.                                            |
| `pageSize` | Inteiro positivo entre `1` e `24`; padrão `12`.                          |
| `sort`     | `curadoria` (padrão) ou `nome`, com ordenação determinística por nome.   |

## Resposta de sucesso ou vazia

```json
{
  "contractVersion": "2026-09-21",
  "items": [],
  "page": 1,
  "pageSize": 12,
  "total": 0,
  "totalPages": 1,
  "query": "inexistente",
  "category": "Todos",
  "sort": "curadoria"
}
```

Cada item pode conter somente `id`, `sku`, `slug`, `name`, `originalName`, `category`, `tagline`, `description`, `image`, `minimum`, `personalizable` e `sourceDate`, pois essa é a projeção do snapshot. Custo, margem, fornecedor, regras de desconto, estoque, dados de compradores e identificadores operacionais não pertencem ao contrato.

## Erros e indisponibilidade

Parâmetro fora da forma pública retorna `400` com `INVALID_CATALOG_QUERY` e não é silenciosamente convertido em outra busca. Uma consulta válida sem peças retorna `200` e `items: []`. O snapshot local não tem upstream para ficar indisponível; quando a fonte canônica for conectada, falha ou timeout devem retornar `503 CATALOG_UNAVAILABLE` com um estado recuperável na interface, jamais uma lista vazia tratada como sucesso.

## Limite atual e migração segura

A rota lê `premium_catalog_items` do banco dedicado à vitrine quando `SUPABASE_URL`, `SUPABASE_PROJECT_REF` e a chave publicável estão configurados. A consulta usa uma lista explícita de colunas, limite de 24 e apenas itens publicados; erro de rede, resposta vazia inesperada ou violação do formato retorna `503 CATALOG_UNAVAILABLE`. Sem configuração, a rota usa o snapshot local. A fonte operacional original `v_products_public` pertence ao outro projeto, `doufsxqlfjyuvxuezpln`, e não é modificada por esta migration.
