# Contrato público de catálogo v1

Status: implementado para a tabela pública curada do projeto da vitrine `whwloseshzraipljisqo`, com snapshot editorial apenas como fallback offline. Este contrato não autoriza acesso direto do navegador a tabelas internas, à aplicação comercial ou a campos de custo.

`GET /api/catalog` entrega uma projeção editorial versionada. A resposta carrega `X-Catalog-Contract-Version: 2026-09-21`. Consultas gerais usam cache compartilhado de cinco minutos, com `stale-while-revalidate` de dez minutos. A consulta por `ids` usa `Cache-Control: no-store` e lê a fonte sem cache para conferir a seleção imediatamente antes do briefing.

## Parâmetros

| Parâmetro  | Regra                                                                    |
| ---------- | ------------------------------------------------------------------------ |
| `q`        | Texto de até 100 caracteres; busca normalizada sem distinção de acento em nome, nome original, SKU e categoria. |
| `category` | `Todos`, `Kits & experiências`, `Escrita`, `Lifestyle` ou `Viagem`.      |
| `page`     | Inteiro positivo; padrão `1`. Acima do total, retorna a última página publicada. |
| `pageSize` | Inteiro positivo entre `1` e `24`; padrão `12`.                          |
| `sort`     | `curadoria` (padrão) ou `nome`, ambos com desempate determinístico por ID.   |
| `ids`      | Até 24 UUIDs públicos separados por vírgula; consulta usada para conferir seleção sem cache. |

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

Parâmetro fora da forma pública retorna `400` com `INVALID_CATALOG_QUERY` e não é silenciosamente convertido em outra busca. Uma consulta válida sem peças retorna `200` e `items: []`. Falha ou timeout da fonte canônica retorna `503 CATALOG_UNAVAILABLE` com um estado recuperável na interface, jamais uma lista vazia tratada como sucesso.

Quando a fonte responde `416` para uma página além do total e informa a contagem exata no cabeçalho `Content-Range`, o servidor consulta a última página válida. Um `416` sem essa contagem continua sendo tratado como indisponibilidade, para não inventar resultados. Uma resposta `200` sem contagem exata ou com intervalo incompatível também retorna `503`; o tamanho da página não é uma contagem total válida.

## Limite atual e migração segura

A rota lê `premium_catalog_items` do banco dedicado à vitrine quando `SUPABASE_URL`, `SUPABASE_PROJECT_REF` e a chave publicável estão configurados. A consulta usa lista explícita de colunas, limite de 24, contagem e offset na fonte, somente itens publicados e a coluna gerada interna `search_text` para filtrar sem acento; essa coluna não faz parte da resposta. Erro de rede ou violação do formato retorna `503 CATALOG_UNAVAILABLE`. Sem configuração, a rota usa o snapshot local. A fonte operacional original `v_products_public` pertence ao outro projeto, `doufsxqlfjyuvxuezpln`, e não é modificada por estas migrations.
