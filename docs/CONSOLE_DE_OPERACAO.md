# Console de operação (/operacoes)

Área interna do dono do site para operar o banco premium sem linha de comando:
catálogo, ficha técnica, publicação, leads e limites de envio.

## Como ligar

O console fica invisível (404 na página e nas rotas) até estas duas variáveis
existirem no ambiente:

| Variável | Regra |
| --- | --- |
| `PROMO_PREMIUM_CONSOLE_ENABLED` | precisa ser exatamente `true` |
| `PROMO_PREMIUM_CONSOLE_TOKEN` | 32 caracteres ou mais, sem espaços |

Sem elas, `/operacoes` e `/api/operacoes/*` respondem 404, igual a uma rota
inexistente. O token é digitado uma vez e trocado por um cookie de sessão
`HttpOnly`, `SameSite=Strict`, com validade de 8 horas, assinado por
HMAC-SHA256 com o próprio token. O cookie nunca vai para o cliente em texto
legível e não pode ser forjado sem o token.

As rotas também recusam requisição de outra origem e exigem o cookie de sessão
em toda leitura e gravação.

## O que cada aba faz

**Situação** — conectividade do banco premium, estado real do envio ao
comercial (com a lista de variáveis que faltam), contagem de peças, publicadas,
leads na fila, leads com falha e limites ativos.

**Catálogo** — lista todas as peças com ordem editorial, situação de publicação
e janela. Permite:

- editar a ficha técnica (materiais, medidas, peso em gramas e embalagem) com
  as mesmas regras do banco (até 5 materiais, medidas 2..80, embalagem 2..120,
  peso 1..100000 g) e conferência do que voltou gravado;
- aplicar publicação (no ar/fora do ar + janela) exigindo a digitação do SKU,
  com concorrência otimista por `updated_at`: se alguém alterou a peça depois
  que a tela carregou, a gravação é recusada em vez de sobrescrever.

**Leads** — últimos 200 briefings com contato, ocasião, peças, situação da
entrega, número de tentativas e último erro. Cada lead traz o seletor de
situação do funil (`recebido` → `qualificado` → `encerrado`), que era o único
estado do banco sem tela. Leads em `failed` (ou presos em `delivering`) podem
voltar para a fila (`pending`). O reenvio real depende do receptor comercial
configurado: o console não inventa um payload que o banco não guarda.

**Limites** — janelas de rate limit por contato (hash) e limpeza manual. A
limpeza automática já roda a cada 5 minutos pelo `pg_cron`.

## O que o console não faz

- Não envia lead ao comercial por conta própria: sem `BRIEFING_DELIVERY_ENABLED`
  e o receptor configurado, nenhum lead novo entra no banco e a aba mostra o
  motivo exato.
- Não reordena o catálogo: `editorial_order` é único no banco e reordenar exige
  função transacional nova (DDL), fora do escopo deste console.
- Não expõe segredo, chave ou token: as respostas trazem somente estado,
  contagens e conteúdo editorial.

## Verificação

```bash
npm run test:console-operations   # regras de token, sessão e ficha técnica
npm run test:e2e -- tests/console.spec.ts   # gate, login e sessão reais
```

## Cobertura: banco premium x tela

Inventário conferido por consulta direta ao projeto `whwloseshzraipljisqo` em 26/11/2026: 3 tabelas, 7 funções, 1 trigger, 1 política de RLS, 1 job de cron, nenhuma view ou materialized view.

| Objeto do banco | Quem usa | Onde o dono vê ou decide |
| --- | --- | --- |
| `premium_briefings` (21 colunas) | `POST /api/briefings` | aba **Leads** (contato, ocasião, peças, entrega, tentativas, erro) |
| `premium_briefings.status` | só a aba Leads grava | seletor **Situação do lead** (recebido/qualificado/encerrado) |
| `premium_briefings.delivery_*` | funções de claim/record | aba **Leads** + botão **Voltar para a fila** |
| `premium_briefing_rate_limits` | `allow_premium_briefing_attempt` | aba **Limites** + botão **Limpar janelas** |
| `premium_catalog_items.published*` | `getSiteCatalogPage` | aba **Catálogo** → **Publicação** (exige digitar o SKU) |
| `premium_catalog_items` ficha (materials, dimensions, weight_g, packaging) | `/api/catalog` e ficha da vitrine | aba **Catálogo** → **Ficha técnica** |
| `premium_catalog_items` editorial (name, slug, tagline, description, image_path, minimum, personalizable, category, editorial_order) | `src/lib/products.json` + sync | fora da tela de propósito: é curadoria versionada e o sync sobrescreve — editar no banco criaria um valor que o próximo ciclo apaga |
| `premium_catalog_items.search_text` | busca pública | vitrine (derivado no sync; não é campo de operação) |
| `set_premium_catalog_updated_at` (trigger) | automático | indireto: `updated_at` aparece nas linhas do Catálogo e protege a concorrência da publicação |
| `prune_premium_briefing_rate_limits` | cron `*/5 * * * *` + aba Limites | aba **Limites** mostra o resíduo antes/depois da limpeza |
| política `premium_catalog_public_read` | leitura anônima da vitrine | vitrine pública (só itens publicados e dentro da janela) |
| replicação gestão→premium | `.github/workflows/catalog-source-guard.yml` (cron 11:17 UTC + guard diário) | supervisionada pelo CI: o job falha quando o catálogo curado divergir da gestão. O botão "replicar agora" fica fora do console de propósito, para não expor no runtime web a chave de leitura da base de gestão |

Consequência prática do item acima: se a replicação falhar, o aviso vem do GitHub Actions, não da tela. Quem quiser o botão dentro do console precisa aceitar que a chave de leitura da gestão passe a existir no runtime do site.