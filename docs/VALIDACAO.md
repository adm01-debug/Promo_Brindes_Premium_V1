# Validação da prévia

Data: 23/09/2026. Escopo: aplicação local compilada, oito produtos publicados no banco da vitrine, catálogo público versionado, briefing com contrato de entrega e painel de planejamento. As evidências não certificam a integração futura, a qualidade de todo o catálogo nem a conformidade integral WCAG.

## Revisão posterior dos critérios

A [revisão individual das 200 etapas](REVISAO_EXAUSTIVA_PLANO.md) registra **116 critérios comprovados no próprio escopo, 41 entregas parciais e 43 sem entrega comprovada**. Sessenta e um cenários sintéticos passam para concorrência idempotente, conflito de payload, corpo sem `Content-Length`, data inválida, paginação em múltiplos lotes, limite de catálogo, mudança de total, contagem exata da fonte, IDs sem cache, vigência editorial, drift de campos, allowlist/SSRF, redirects, parâmetros de cache, validação RPC, fencing de leases e incompatibilidade temporária entre versões do banco e da aplicação. O controle de publicação acrescenta 16 contratos para dry-run, janela, destino Premium, confirmação por SKU e concorrência. As sondas de browser cobrem expiração iniciada na ficha, retorno do formulário e movimento reduzido. A suíte também reproduz retorno 503 da curadoria e 403 de mídia, preservando a seleção e exibindo fallback. Os resultados brutos estão em `audit/plan-scenarios.json` e `audit/plan-browser-scenarios.json`. `npm run check:governance` confirma que a prévia continua sem coleta, indexação, analytics, upload, preço público ou expansão e exige treze gates para reavaliar o release.

Os gates comerciais permanecem documentados como abertos. Esta revisão corrigiu os defeitos técnicos listados, atualizou as verificações e o painel, mas não habilitou entrega comercial nem integrou CRM. O painel separa situação auditada de marcação pessoal e não reaplica automaticamente a conclusão de uma revisão antiga.

## Resultados funcionais

**213 execuções E2E locais: 71 jornadas em cada Chromium, Firefox e WebKit** cobrem os fluxos da prévia e a auditoria do plano. A suíte garante que marcação local não altera o status auditado e que revisão antiga não mascara uma etapa ainda parcial. Os cenários incluem:

1. Busca por SKU, resultado vazio, limpeza e filtro de categoria.
2. Favoritos e seleção após recarregar, mínimo de quantidade e remoção.
3. Formulário obrigatório, download com ID/SKU/quantidade corretos, ausência de POST e ausência de contato no localStorage.
4. Contenção de foco em diálogo, Escape e restauração do foco no acionador.
5. Recuperação de seleção e favoritos locais inválidos.
6. Menu e detalhe em mobile, sem overflow da página/diálogo testado.
7. Varredura axe da home e formulário do briefing.
8. Exatamente 200 checkboxes no plano, filtro, persistência e exportação com 200 etapas.
9. Varredura axe do plano filtrado e privacidade; resposta HTTP 404 para rota inexistente.
10. Contrato do endpoint `/api/catalog`: paginação, ordenação, busca sem acento, cabeçalho de versão e ausência de campos sensíveis.
11. Endpoint de briefing sem destino configurado, chave de idempotência obrigatória, origem forjada rejeitada e data de calendário inválida rejeitada.
12. Rota permanente de produto renderizada no servidor, seleção local e acessibilidade automática do detalhe.
13. Bloqueio de indexação na prévia por `robots.txt` e sitemap vazio.
14. Cabeçalho CSP e busca que preserva estado compartilhável na URL.
15. Rejeição de parâmetro inválido e paginação ordenada sem SKU repetido.
16. Expiração em 14 dias e limpeza explícita da seleção local.
17. Reflow operável em 320 CSS pixels e abertura da seleção nessa largura.
18. Proposta e link de produto no HTML inicial; canonical e JSON-LD de produto sem `Offer` fictício.
19. Três estados auditados, exportação das constatações e próximas ações, progresso comprovado imutável por checkbox e descarte de marcações de revisão antiga.
20. Voltar do navegador restaura busca, categoria, página e ordenação pela URL.
21. Indisponibilidade `503` da curadoria mantém a seleção e permite nova consulta.
22. Resposta `403` da mídia mostra alternativa acessível e mantém o detalhe da peça utilizável.
23. SKU removido da curadoria é retirado da seleção com explicação visível, sem descartar a seleção por falha de rede.
24. Offline de navegador preserva a seleção, explica a indisponibilidade e recupera a curadoria após reconexão.
25. Resposta atrasada de categoria anterior não substitui o filtro mais recente.
26. Página acima do total retorna a última página publicada, sem transformar `416` da fonte em `503` público.
27. Resposta `200` sem protocolo válido não confirma o envio comercial.
28. A consulta por IDs selecionados informa `Cache-Control: no-store`.
29. Produto despublicado depois da seleção não entra no briefing; o usuário volta para revisar.
30. Quantidade mínima alterada ajusta a seleção e exige revisão antes do briefing.
31. Falha da consulta de conferência impede exportar um briefing de peças cuja situação é desconhecida.
32. Alterar a seleção enquanto a conferência está pendente impede exportar a intenção anterior.
33. Categoria escolhida durante a recuperação substitui a resposta anterior, mesmo quando esta chega depois.
34. Ocasiões em OR e categoria, personalização e quantidade em AND retornam IDs e total esperados.
35. Facetas contextuais excluem a própria dimensão e preservam as demais antes da paginação.
36. Aliases editoriais e correção de um caractere funcionam com sugestão visível, sem ampliar uma busca exata por alias de coleção.
37. Parâmetros de ocasião, personalização e quantidade inválidos são rejeitados e não podem acompanhar consulta por IDs.
38. Painel combina filtros, exibe contagens, remove uma ocasião individual e fecha com o total atualizado.
39. URL restaura múltiplas ocasiões, quantidade, busca corrigida, Voltar e Avançar.
40. Painel em 390 × 844 permanece dentro da viewport com ação final visível.
41. Painel de filtros passa a varredura axe automatizada nas regras A/AA selecionadas.
42. Envelope, produto e facetas do catálogo têm chaves exatas; resposta expõe request ID e tempo de servidor sem dados pessoais.
43. Ficha recomenda apenas peças publicadas da mesma coleção e nunca recomenda a própria peça.
44. Home, biblioteca, coleção e produto têm títulos únicos, description, canonical, Open Graph e Twitter sem placeholder.
45. Todos os templates públicos têm um `main`, um H1 e reflow sem overflow em 320 CSS px.
46. Controles essenciais visíveis atendem 24 px; ações principais usam meta de 44 px e movimento reduzido zera transições.
47. Jornada por teclado cobre filtro, quantidade, busca, favoritos, seleção, briefing, Escape e restauração de foco.
48. Erros de briefing são anunciados, associados ao campo, focados em ordem e corrigidos sem apagar valores válidos.
49. A jornada pública não instala cookies, não chama hosts de terceiros e grava somente IDs/quantidades nas duas chaves locais permitidas.

Comandos: `npm run build`, `npm run typecheck`, `npm run check:plan`, `npm run check:public-secrets`, `npm run check:performance-budget` e `npm run test:e2e`. A suíte usa servidor de produção na porta 3107, sem reutilizar processo estranho. A porta 3000 já servia outro aplicativo neste ambiente; o teste inicial foi descartado e a configuração foi corrigida.

O workflow de CI executa instalação limpa, esses gates, cenários isolados e a matriz Chromium/Firefox/WebKit com um worker em push e pull request. No ciclo de 23/09, os runs remotos `35850222515` e `35850222551` aprovaram respectivamente qualidade e banco no SHA `e2b7c10f4fb295524b11107f47316473c40e553e`; a `main` passou então a exigir PR e ambos os checks. `actionlint` validou a sintaxe localmente; tipos, plano, build, 57 cenários, 86 contratos e as 213 execuções E2E passaram no [run remoto 35793370735](https://github.com/adm01-debug/Promo_Brindes_Premium_V1/actions/runs/35793370735). O rebuild com onze migrations, 64 contratos pgTAP, concorrência e lint passou no [run 35793370707](https://github.com/adm01-debug/Promo_Brindes_Premium_V1/actions/runs/35793370707). [Matriz e correções](audit/2026-09-22-browser-matrix.md); [conferência pré-briefing](audit/2026-09-22-selection-freshness.md); [vigência e cache em produção](audit/2026-09-22-catalog-publication-window.md); [controle da operação editorial](audit/2026-09-22-editorial-publication-control.md); [ambiente Vercel e catálogo canônico](audit/2026-09-22-production-environment.md).

O teste de teclado encontrou que o diálogo nativo permitia a sequência de Tab sair do ciclo esperado e que um campo de busca podia consumir `Escape`. Foi adicionado tratamento explícito das extremidades e de `Escape`, mantendo inert nativo e restauração de foco. A jornada essencial agora também é exercitada por teclado. O teste de filtro do plano consulta o combobox pelo nome acessível, em vez de considerar todo o texto das opções como label.

## Layout e recursos

Revisão em **360, 390, 768 e 1440 pixels** no Chromium: sem overflow horizontal; imagens carregadas; nenhum erro JavaScript registrado na navegação de inspeção. Evidência: [`audit/responsive-check.json`](audit/responsive-check.json).

Capturas revisadas: [desktop](screenshots/home-desktop.png), [mobile](screenshots/home-mobile.png), [primeira dobra desktop](screenshots/hero-desktop.png), [primeira dobra mobile](screenshots/hero-mobile.png), [Super Filtro desktop](screenshots/super-filtro-desktop.png), [Super Filtro mobile](screenshots/super-filtro-mobile.png), [plano desktop](screenshots/plan-desktop.png) e [plano mobile](screenshots/plan-mobile.png).

As fotos locais foram decodificadas e convertidas para WebP; a imagem conceitual principal foi reduzida de aproximadamente 2,2 MB em PNG para aproximadamente 144 KB em WebP, antes das variantes de tamanho servidas pelo Next. O PNG de trabalho foi movido para `design-assets/`, fora do diretório servido. O orçamento automatizado aprovou as nove imagens de entrega: hero com 145.116 bytes e catálogo inteiro com 195.366 bytes. A navegação não depende do CDN que respondeu 403 na amostra; se uma imagem falhar, a peça mostra alternativa visível e acessível.

## Acessibilidade

Nas telas cobertas pela suíte, o axe não apontou violações nas regras selecionadas de WCAG A/AA, 2.1 AA e 2.2 AA. Foram implementados idioma, landmarks, link de salto, headings, labels, nomes de botões, feedback em região de status, foco visível, diálogo e preferência por movimento reduzido.

Isso **não é declaração de conformidade integral**. O gate matemático cobre 25 pares e a auditoria amostra o fundo real da fotografia do hero em desktop e mobile; os testes cobrem reflow equivalente a 400% em 1280 px, alvos e erros associados. Permanecem leitores de tela e validação com pessoas que utilizam tecnologia assistiva no ambiente final.

## Conteúdo e integração

Catálogo de origem consultado por leitura pública limitada, com IDs/SKUs preservados. Em 22/09/2026, os oito produtos foram sincronizados no banco dedicado à vitrine e as migrations chegaram à versão `20260923071500`, incluindo fencing de entrega, constraints e janela temporal do catálogo. Nenhum produto, cliente, pedido, policy ou schema do banco operacional de Promo_Gifts_V4 foi alterado. As verificações do novo banco estão em [SUPABASE_SITE_DATABASE.md](SUPABASE_SITE_DATABASE.md). Fotos de fornecedor não equivalem a autorização legal de publicação comercial; essa validação está pendente.

O briefing preserva o download local quando a entrega não está explicitamente ativada. O endpoint valida origem, tipo e tamanho do corpo, calendário, seleção não vazia, mínimo por item, chave de idempotência e limite de requisições; ele resolve SKU e quantidade no servidor, portanto ignora preço ou fornecedor forjados pelo navegador. Quando ativado, usa limite distribuído no banco e HMAC do endereço entregue por proxy configurado, persiste chave/hash e cerca cada reserva com um token que impede uma resposta antiga de finalizar um lease novo. Sem `BRIEFING_DELIVERY_ENABLED=true`, `BRIEFING_WEBHOOK_URL` válido, hostname exato em `BRIEFING_WEBHOOK_ALLOWED_HOSTS` e `PROMO_PREMIUM_CLIENT_IP_HEADER` confiável, não há transferência de dados nem teste de entrega a CRM. Produção ainda exige validar proxy, egress/DNS, WAF e conciliação reais e homologar a integração comercial. O token de lease evita sobrescrita concorrente, mas um timeout após aceite remoto continua exigindo `Idempotency-Key` no receptor e conciliação por protocolo. Valores são sob consulta; não há preço garantido, reserva, pagamento, prazo confirmado ou amostra de arte aprovada. O frontend não possui chave Supabase ou segredos de integração.

## Integridade do plano

`npm run check:plan` verifica 200 IDs únicos e sequenciais, 20 fases, 10 etapas por fase, títulos únicos, critérios e responsáveis preenchidos, revisão individual em todas as etapas, referências existentes, ausência de ciclos e igualdade integral dos exports com o JSON. Conclusão isolada e dependências abertas são exibidas separadamente. A checagem não certifica o conteúdo de uma evidência apenas por encontrar seu arquivo.

Marcações no painel web representam acompanhamento local. Um checkbox manual não produz evidência técnica nem altera automaticamente o status do documento versionado.

## Dependências e compilação

Compilação de produção e TypeScript passaram. A consulta `npm audit --omit=dev` retornou **0 vulnerabilidades conhecidas** no momento da execução; isso não é garantia contra falhas desconhecidas ou problemas de lógica.

## Medição local de desempenho

Lighthouse **13.5.0**, preset móvel padrão, com throttling simulado, em `http://localhost:3100`, sobre build de produção estável; coleta final em **20/09/2026 às 19:02 UTC**. Arquivo completo: [`audit/lighthouse-mobile.json`](audit/lighthouse-mobile.json). Sem erros de console e sem avisos de execução na coleta final.

| Métrica / categoria       | Resultado da coleta local                                      |
| ------------------------- | -------------------------------------------------------------- |
| Performance               | 94/100                                                         |
| Acessibilidade automática | 100/100                                                        |
| Boas práticas             | 100/100                                                        |
| SEO                       | 63/100; a prévia está deliberadamente bloqueada para indexação |
| Largest Contentful Paint  | 3,0 s                                                          |
| Total Blocking Time       | 20 ms                                                          |
| Cumulative Layout Shift   | 0                                                              |

**O LCP desta coleta excede a meta de 2,5 s.** Score alto não substitui o critério de experiência. Esta é uma observação local, não p75 de usuários reais; Lighthouse usa TBT, não mede o INP de campo de uma população. Acessibilidade 100 na automação também não equivale a conformidade integral.

Uma tentativa anterior em 22/09/2026 foi descartada sem gerar relatório: o Chrome para Windows, iniciado via WSL, recebeu um diretório de perfil malformado (`undefined:/Users/...`) e não expôs a porta DevTools. Depois, o Chromium Linux do Playwright permitiu [três rodadas sequenciais reproduzíveis](audit/2026-09-22-lighthouse-repeat.md), com os relatórios completos preservados: LCP **2,259 s, 2,612 s e 3,121 s**, mediana **2,612 s**. A medição repetida da etapa 166 foi concluída no próprio critério; o LCP ainda não atende à meta de modo estável, e não há p75 de campo.

A coleta identificou divergência entre nomes acessíveis e texto visível em dois controles, corrigida no código. A coleta final confirma esses controles sem o apontamento. A prioridade de carregamento do hero e os tamanhos responsivos de imagens também foram ajustados. A ausência de indexação será revista somente no lançamento comercial, preservando a proteção contra indexação da prévia.

## Limitações para lançamento

Faltam integração viva e governança editorial, aprovação de marca/mídia/conteúdo, preço e disponibilidade contextualizados, validação no CRM, privacidade comercial, domínio, monitoramento em produção, métricas de campo, testes com compradores e QA multiplataforma. A rota de planejamento exige opt-in local e retorna 404 em qualquer ambiente implantado na Vercel. Seus dados não integram o JavaScript público.
