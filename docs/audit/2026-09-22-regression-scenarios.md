# Cenários de regressão da vitrine — 22/09/2026

| Cenário | Falha reproduzida / risco | Resultado após correção | Evidência |
|---|---|---|---|
| Dois filtros em sequência, primeira resposta atrasada | Resposta antiga podia sobrescrever a peça e a URL do filtro novo | Requisição anterior é cancelada; só a resposta da intenção mais recente altera catálogo e URL | `tests/storefront.spec.ts`, caso “resposta atrasada” |
| Link direto com `page=999&pageSize=3` | API pública respondia `503` porque PostgREST retorna `416` e `Content-Range: */8` | API consulta a última página válida e retorna `200`, página 3, duas peças | `tests/public-api.spec.ts`, caso “página acima do total” |
| Resposta `200` de briefing sem protocolo | Interface podia exibir confirmação sem registro identificável | Formulário permanece editável e informa que não confirmou o protocolo | `tests/storefront.spec.ts`, caso “resposta sem protocolo” |
| Flag de indexação ligada com URL HTTP local | `robots.txt` podia liberar o índice sem domínio comercial | Build manteve `Disallow: /` e sitemap vazio | Build local com `PROMO_PREMIUM_INDEXABLE=true` e URL `http://localhost:3100` |
| Configuração HTTPS sintética com catálogo da vitrine | Sitemap estático podia listar peças retiradas; plano interno ainda era acessível | Build local gerou nove URLs (home e oito peças publicadas), excluiu planejamento e registrou status 404 na rota | Build local com URL sintética `https://vitrine.simulacao.com.br`; artefatos `.next/server/app/robots.txt.body`, `sitemap.xml.body` e `planejamento.meta` |
| Push e pull request | Gates dependiam de execução manual | Workflow versionado executa instalação limpa, tipos, plano, build, scanner, orçamento, cenários e Chromium | `.github/workflows/quality.yml`; `actionlint` local passou e o [run remoto 35738493096](https://github.com/adm01-debug/Promo_Brindes_Premium_V1/actions/runs/35738493096) concluiu todos os passos com sucesso. |

O domínio da simulação é apenas um valor de teste em build local. Sintaxe HTTPS não demonstra posse do domínio, licença de mídia, aceite jurídico, integração com CRM ou liberação comercial. O modo de entrega comercial continua desativado no ambiente local.
