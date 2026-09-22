# Biblioteca de catálogos premium

Implementada em 22/09/2026 a partir da funcionalidade solicitada pelo usuário no [Promo Brindes V1](https://github.com/adm01-debug/Promo_Brindes_V1/blob/203a4a7/src/pages/CatalogsPage.tsx). A URL de referência na Vercel redirecionou ao login; a análise funcional usou `CatalogsPage.tsx` e `catalogLibrary.ts` na revisão `203a4a7`. O layout, os textos e os componentes desta entrega foram escritos para o premium, com os ativos locais já existentes.

## O que foi entregue

- [x] `/catalogos` com seis coleções, capas editoriais em HTML/CSS, cores preto, champanhe, marfim, verde escuro e vinho.
- [x] Busca por termos, aliases e ocasião, sem distinção de acentos ou caixa; filtro por tema.
- [x] URL compartilhável por busca/tema, restauração ao voltar/avançar e limpeza de filtros.
- [x] `/catalogos/[slug]` com introdução própria, data editorial, produtos publicados e links para suas fichas.
- [x] Continuidade da ficha de produto à seleção e ao briefing existentes.
- [x] Compartilhamento nativo, cópia para clipboard e link selecionável quando o navegador negar acesso. Cancelamento nativo não copia o link automaticamente.
- [x] Acesso pelos menus desktop/mobile e rodapé da home; retorno à biblioteca nas coleções.
- [x] HTML inicial com conteúdo e links, metadata e canonical por rota, sitemap condicionado à configuração de lançamento. A prévia continua `noindex`.
- [x] Estados distintos para busca sem resultados, coleção sem produtos publicados, indisponibilidade do banco e imagem ausente.
- [x] Navegação responsiva, foco visível, rótulos de formulário e mensagens de estado acessíveis.

| Coleção | Rota | Referências editoriais |
| --- | --- | --- |
| Um começo com significado | `/catalogos/boas-vindas` | Caderno, kit executivo e garrafa |
| Relações que permanecem | `/catalogos/relacoes-que-permanecem` | Café, chá e caneta |
| À altura de uma conquista | `/catalogos/conquistas-memoraveis` | Mochila, kit executivo e gourmet |
| A arte de receber | `/catalogos/arte-de-receber` | Chá, café e gourmet |
| Ideias merecem presença | `/catalogos/escrita-com-presenca` | Caneta e caderno |
| Para novos destinos | `/catalogos/novos-destinos` | Mochila e garrafa |

São **coleções online**. Não há arquivo PDF ou revista externa disponível nesta entrega; nenhum botão promete baixar um arquivo inexistente. A coleção organiza referências por contexto e não representa um kit comercial fechado. Conteúdo, fotos, alegações, disponibilidade, preços e condições continuam sujeitos aos controles editoriais e comerciais existentes.

## Dados e atualização

`src/lib/catalog-library.ts` define textos, temas e vínculos por ID canônico, sem duplicar cadastro ou SKU. `src/lib/catalog-library-data.ts` faz uma consulta agrupada da projeção pública `premium_catalog_items`, em `whwloseshzraipljisqo`, pela função de leitura já usada pelo site. Capas, contagens e páginas usam somente os produtos devolvidos como publicados. Não se consulta a origem operacional diretamente nesta funcionalidade.

Não foram criadas migrations nem feitas gravações em nenhum banco para implementar os catálogos. A regra de somente leitura do banco central `doufsxqlfjyuvxuezpln` foi preservada.

A consulta de produtos mantém cache de até cinco minutos. A biblioteca é renderizada no servidor com os filtros da URL; as páginas de coleção usam revalidação de cinco minutos. Sem configuração de banco, vale o fallback de prévia existente. Com configuração e falha, não se substituem os dados por um snapshot silencioso.

Coleções suportam até 24 IDs únicos por leitura. Uma resposta truncada ou com mais de uma página é recusada para não exibir contagem incompleta. A ampliação além dessa janela exige paginação adicional do carregador. Quando uma peça é despublicada, ela deixa de compor a capa e a seleção na próxima revalidação. Se todas saírem, a página explica que a coleção está em atualização.

## Verificação reproduzível

```bash
npm run test:catalog-library
npm run typecheck
npm run build
npm run check:performance-budget
npm run check:public-secrets
npm run check:plan
npm run test:e2e
```

Os onze testes isolados verificam IDs, busca, ordenação editorial, retirada de publicação, erro/vazio, contagens truncadas e limites antes da consulta. Os testes em `tests/catalogs.spec.ts` exercitam HTML, rotas, busca, histórico, compartilhamento, fallback, seleção entre páginas, mobile de 390 px, reflow de 320 px e acessibilidade com axe. Simulações não alteram registros reais e os compartilhamentos são interceptados.

Execução local concluída: **141 testes de navegador aprovados**, incluindo os 36 cenários dos catálogos nos três motores (Chromium, Firefox e WebKit); **11 testes de dados da biblioteca**, **35 testes da fronteira entre bancos** e **41 cenários de regressão** aprovados. Build, TypeScript, orçamento de assets, verificação de segredos e consistência do plano também passaram. A [matriz visual](audit/catalog-library-browser.json) não registrou overflow nas larguras examinadas nem erro JavaScript nas páginas visitadas.

Capturas: [desktop](screenshots/catalogos-desktop.png), [mobile](screenshots/catalogos-mobile.png) e [coleção](screenshots/catalogo-colecao-desktop.png).

O item `APV1-06` tem implementação técnica entregue. A taxonomia e os vínculos da etapa 053 estão implementados; a etapa 157 permanece parcial porque os textos de abertura das coleções não substituem guias completos de técnica e planejamento com participação comercial. Aprovação editorial das oito peças e lançamento comercial continuam pendentes conforme os registros próprios.
