# Contrato público de catálogo v1

Status: implementado para a tabela pública curada do projeto da vitrine `whwloseshzraipljisqo`, com snapshot editorial apenas como fallback offline. Este contrato não autoriza acesso direto do navegador a tabelas internas, à aplicação comercial ou a campos de custo.

`GET /api/catalog` entrega uma projeção editorial versionada. A resposta carrega `X-Catalog-Contract-Version: 2026-09-22.2`. Consultas gerais usam cache compartilhado de um minuto com `must-revalidate`. A consulta por `ids` usa `Cache-Control: no-store` e lê a fonte sem cache para conferir a seleção imediatamente antes do briefing.

A semântica é **OR entre ocasiões** e **AND entre dimensões**. Exemplo: `occasion=boas-vindas,novos-destinos&category=Escrita&quantity=100` aceita uma das duas ocasiões, exige categoria Escrita e exige mínimo cadastrado menor ou igual a 100. Quantidade representa compatibilidade com o pedido mínimo; não representa estoque.

## Parâmetros

| Parâmetro        | Regra                                                                                                                                                                                                                                |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `q`              | Texto de até 100 caracteres; busca normalizada sem distinção de acento em nome, nome original, SKU, categoria e contexto editorial. Uma correção de um caractere só é usada após zero resultado exato e aparece em `suggestedQuery`. |
| `category`       | `Todos`, `Kits & experiências`, `Escrita`, `Lifestyle` ou `Viagem`.                                                                                                                                                                  |
| `occasion`       | Até seis slugs únicos das coleções públicas, separados por vírgula. Slug vazio, repetido ou desconhecido é inválido.                                                                                                                 |
| `personalizable` | Apenas `1`, quando informado. Inclui somente produtos com confirmação positiva no campo público.                                                                                                                                     |
| `quantity`       | Inteiro de `1` a `10000`. Inclui produtos cujo `minimum <= quantity`; não confirma disponibilidade.                                                                                                                                  |
| `page`           | Inteiro positivo; padrão `1`. Acima do total, retorna a última página publicada.                                                                                                                                                     |
| `pageSize`       | Inteiro positivo entre `1` e `24`; padrão `12`.                                                                                                                                                                                      |
| `sort`           | `curadoria` (padrão) ou `nome`, ambos com desempate determinístico por ID.                                                                                                                                                           |
| `ids`            | Até 24 UUIDs públicos separados por vírgula; consulta usada para conferir seleção sem cache. Não pode ser combinada com filtros de descoberta.                                                                                       |

## Resposta de sucesso ou vazia

```json
{
  "contractVersion": "2026-09-22.2",
  "items": [],
  "page": 1,
  "pageSize": 12,
  "total": 0,
  "totalPages": 1,
  "query": "inexistente",
  "category": "Todos",
  "sort": "curadoria",
  "occasions": [],
  "personalizable": false,
  "quantity": null,
  "suggestedQuery": null,
  "facets": {
    "categories": {
      "Todos": 0,
      "Kits & experiências": 0,
      "Escrita": 0,
      "Lifestyle": 0,
      "Viagem": 0
    },
    "occasions": {
      "boas-vindas": 0,
      "relacoes-que-permanecem": 0,
      "conquistas-memoraveis": 0,
      "arte-de-receber": 0,
      "escrita-com-presenca": 0,
      "novos-destinos": 0
    },
    "personalizable": 0
  }
}
```

As facetas são contextuais: cada grupo é contado aplicando busca e as demais dimensões, mas removendo temporariamente sua própria dimensão. A contagem ocorre antes da paginação e usa produtos únicos. Assim, uma opção informa quantos resultados restariam se escolhida no contexto atual.

Cada item pode conter somente `id`, `sku`, `slug`, `name`, `originalName`, `category`, `tagline`, `description`, `image`, `minimum`, `personalizable` e `sourceDate`, pois essa é a projeção do snapshot. Custo, margem, fornecedor, regras de desconto, estoque, dados de compradores e identificadores operacionais não pertencem ao contrato.

## Erros e indisponibilidade

Parâmetro fora da forma pública retorna `400` com `INVALID_CATALOG_QUERY` e não é silenciosamente convertido em outra busca. Uma consulta válida sem peças retorna `200` e `items: []`. Falha ou timeout da fonte canônica retorna `503 CATALOG_UNAVAILABLE` com um estado recuperável na interface, jamais uma lista vazia tratada como sucesso.

Uma resposta da fonte sem contagem exata ou com intervalo incompatível retorna `503`; o tamanho da página não é usado como contagem total. UUID, slug, data e caminho de mídia precisam ser válidos. Duplicatas, itens não solicitados, mudança de total durante a leitura e catálogo acima do limite auditado também são tratados como drift da fonte. A ficha permanente rejeita resposta cujo slug difere do endereço pedido.

## Limite atual e migração segura

A rota lê `premium_catalog_items` do banco dedicado à vitrine quando `SUPABASE_URL`, `SUPABASE_PROJECT_REF` e a chave publicável estão configurados. O servidor lê somente itens com `published=true` e dentro da janela opcional `published_from`/`published_until`, além de uma allowlist de 12 campos públicos, em páginas de 500, com contagem exata, cache de um minuto e limite auditado de 10.000 itens. Ele calcula busca, resultados e facetas sobre a mesma projeção completa e envia ao navegador apenas a página solicitada, de no máximo 24 itens. Consultas por IDs pulam o cache. Erro de rede ou violação do formato retorna `503 CATALOG_UNAVAILABLE`. Sem configuração, a rota usa o snapshot local. A fonte operacional original `v_products_public` pertence ao outro projeto, `doufsxqlfjyuvxuezpln`, e continua somente leitura.

O desenho atual é adequado à curadoria pequena e mantém as contagens exatas. Antes de aproximar o volume do limite, medir bytes e latência em cache frio e mover filtragem/agregação para uma função ou view no banco premium se os objetivos de desempenho deixarem de ser atendidos.
