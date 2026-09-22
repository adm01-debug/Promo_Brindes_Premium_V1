# Validação da prévia

Data: 22/09/2026. Escopo: aplicação local compilada, oito produtos de snapshot, catálogo público versionado, briefing com contrato de entrega e painel de planejamento. As evidências não certificam a integração futura, a qualidade de todo o catálogo nem a conformidade integral WCAG.

## Resultados funcionais

**18 testes E2E passaram em Chromium** na rodada final (6,7 segundos de execução da suíte). A suíte cobre:

1. Busca por SKU, resultado vazio, limpeza e filtro de categoria.
2. Favoritos e seleção após recarregar, mínimo de quantidade e remoção.
3. Formulário obrigatório, download com ID/SKU/quantidade corretos, ausência de POST e ausência de contato no localStorage.
4. Contenção de foco em diálogo, Escape e restauração do foco no acionador.
5. Recuperação de seleção e favoritos locais inválidos.
6. Menu e detalhe em mobile, sem overflow da página/diálogo testado.
7. Varredura axe da home e formulário do briefing.
8. Exatamente 200 checkboxes no plano, filtro, persistência e exportação com 200 etapas.
9. Varredura axe do plano filtrado e privacidade; resposta HTTP 404 para rota inexistente.
10. Contrato do endpoint `/api/catalog`: paginação, cabeçalho de versão e ausência de campos sensíveis.
11. Endpoint de briefing sem destino configurado, chave de idempotência obrigatória, origem forjada rejeitada e data de calendário inválida rejeitada.
12. Rota permanente de produto renderizada no servidor, seleção local e acessibilidade automática do detalhe.
13. Bloqueio de indexação na prévia por `robots.txt` e sitemap vazio.
14. Cabeçalho CSP e busca que preserva estado compartilhável na URL.
15. Rejeição de parâmetro inválido e paginação ordenada sem SKU repetido.
16. Expiração em 14 dias e limpeza explícita da seleção local.
17. Reflow operável em 320 CSS pixels e abertura da seleção nessa largura.
18. Proposta e link de produto no HTML inicial; canonical e JSON-LD de produto sem `Offer` fictício.

Comandos: `npm run build`, `npm run typecheck`, `npm run check:plan`, `npm run check:public-secrets`, `npm run check:performance-budget` e `npm run test:e2e`. A suíte usa servidor de produção na porta 3107, sem reutilizar processo estranho. A porta 3000 já servia outro aplicativo neste ambiente; o teste inicial foi descartado e a configuração foi corrigida.

O teste de teclado encontrou que o diálogo nativo permitia a sequência de Tab sair do ciclo esperado. Foi adicionado tratamento explícito das extremidades, mantendo Escape, inert nativo e restauração de foco. O teste de filtro do plano também foi corrigido para consultar o combobox pelo nome acessível, em vez de considerar todo o texto das opções como label.

## Layout e recursos

Revisão em **360, 390, 768 e 1440 pixels** no Chromium: sem overflow horizontal; imagens carregadas; nenhum erro JavaScript registrado na navegação de inspeção. Evidência: [`audit/responsive-check.json`](audit/responsive-check.json).

Capturas revisadas: [desktop](screenshots/home-desktop.png), [mobile](screenshots/home-mobile.png), [primeira dobra desktop](screenshots/hero-desktop.png), [primeira dobra mobile](screenshots/hero-mobile.png), [plano desktop](screenshots/plan-desktop.png) e [plano mobile](screenshots/plan-mobile.png).

As fotos locais foram decodificadas e convertidas para WebP; a imagem conceitual principal foi reduzida de aproximadamente 2,2 MB em PNG para aproximadamente 144 KB em WebP, antes das variantes de tamanho servidas pelo Next. O PNG de trabalho foi movido para `design-assets/`, fora do diretório servido. O orçamento automatizado aprovou as nove imagens de entrega: hero com 145.116 bytes e catálogo inteiro com 195.366 bytes. A navegação não depende do CDN que respondeu 403 na amostra.

## Acessibilidade

Nas telas cobertas pela suíte, o axe não apontou violações nas regras selecionadas de WCAG A/AA, 2.1 AA e 2.2 AA. Foram implementados idioma, landmarks, link de salto, headings, labels, nomes de botões, feedback em região de status, foco visível, diálogo e preferência por movimento reduzido.

Isso **não é declaração de conformidade integral**. Permanecem revisão manual extensa de contraste sobre fotografia, zoom de 200/400%, tarefas completas com leitores de tela, diferentes navegadores e pessoas que utilizam tecnologia assistiva. Essas etapas continuam abertas no plano.

## Conteúdo e integração

Catálogo consultado no host correto por leitura pública limitada, com IDs/SKUs preservados. Não foram atualizados produto, cliente, pedido, policy ou schema. Fotos de fornecedor não equivalem a autorização legal de publicação comercial; essa validação está pendente.

O briefing preserva o download local quando não há destino configurado. O endpoint preparado para entrega valida origem, tipo e tamanho do corpo, calendário, mínimo por item, chave de idempotência e limite de requisições; ele resolve SKU e quantidade no servidor, portanto ignora preço ou fornecedor forjados pelo navegador. Sem `BRIEFING_WEBHOOK_URL` válido, não há transferência de dados nem teste de entrega a CRM. A memória de idempotência e rate limit é intencionalmente local ao processo: produção exige persistência compartilhada e uma integração comercial aprovada. Valores são sob consulta; não há preço garantido, reserva, pagamento, prazo confirmado ou amostra de arte aprovada. O frontend não possui chave Supabase ou segredos de integração.

## Integridade do plano

`npm run check:plan` verifica 200 IDs únicos e sequenciais, 20 fases, 10 etapas por fase, títulos únicos, critérios e responsáveis preenchidos, evidência existente para toda conclusão, referências válidas, ausência de ciclos e 200 checkboxes no Markdown. CSV e Markdown são gerados da mesma fonte JSON.

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

**O LCP desta coleta ainda excede a meta de 2,5 s.** A etapa de desempenho permanece aberta para otimização e medição repetida sob condições controladas. Score alto não substitui o critério de experiência. Esta é uma observação local, não mediana de várias rodadas nem p75 de usuários reais; Lighthouse usa TBT, não mede o INP de campo de uma população. Acessibilidade 100 na automação também não equivale a conformidade integral.

Uma repetição em 22/09/2026 foi descartada sem gerar relatório: o Chrome para Windows, iniciado via WSL, recebeu um diretório de perfil malformado (`undefined:/Users/...`) e não expôs a porta DevTools para o Lighthouse. Não há nova pontuação a reportar; a coleta estável de 20/09 continua sendo a última referência local válida. O problema é do ambiente de medição, não uma conclusão sobre a aplicação.

A coleta identificou divergência entre nomes acessíveis e texto visível em dois controles, corrigida no código. A coleta final confirma esses controles sem o apontamento. A prioridade de carregamento do hero e os tamanhos responsivos de imagens também foram ajustados. A ausência de indexação será revista somente no lançamento comercial, preservando a proteção contra indexação da prévia.

## Limitações para lançamento

Faltam integração viva e governança editorial, aprovação de marca/mídia/conteúdo, preço e disponibilidade contextualizados, persistência de briefing, validação no CRM, privacidade comercial, domínio, monitoramento em produção, métricas de campo, testes com compradores e QA multiplataforma. O painel de planejamento deve ficar em ambiente interno antes de abrir a vitrine pública.
