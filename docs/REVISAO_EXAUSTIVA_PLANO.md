# Revisão exaustiva do plano de 200 etapas

Revisão: **22/09/2026**, identificador `2026-09-22-audit-1`. Código base examinado: `0e6d5d0793e9b50d3ece235d7b1a00394d28b18a`. Projeto: **Promo_Brindes_Premium_V1**. A referência histórica de `Promo_Gifts_V4` continua sendo a auditoria dirigida do commit `44857d5`.

**Não implementamos todas as melhorias.** Há **82 etapas com o próprio critério comprovado, 66 parciais e 52 sem entrega comprovada**. São **118 etapas abertas**, das quais **89 são P0**. O site tem catálogo curado, paginação e ordenação na fonte, persistência idempotente pronta e download de briefing; a jornada comercial integrada e o lançamento permanecem incompletos.

Esses números contam critérios do plano, não esforço restante ou porcentagem de prontidão comercial. Entrevistas, licenças, homologações e monitoramento têm peso diferente de um componente visual. A conclusão de uma entrega isolada não libera suas dependências nem os gates de lançamento.

## Método e cobertura

- Foram lidos os **200 títulos, ações, critérios, dependências e estados anteriores**. Cada etapa recebeu uma constatação individual, referências e próxima ação em [`src/lib/plan.json`](../src/lib/plan.json).
- Foram confrontados componentes, rotas, helpers, configurações, migration, scripts, três arquivos de testes e documentação de pesquisa/arquitetura/validação. Não se atribuiu conclusão apenas à existência de um arquivo.
- O grafo local orientou o levantamento de relações; arquivos atuais prevaleceram quando houve alteração posterior à extração. Não se confundiu esse grafo com o artefato histórico do aplicativo comercial.
- Foram executados 27 cenários sintéticos em módulos TypeScript e cinco em Chromium local. Os sintéticos confirmam idempotência concorrente, conflito de payload, limite de corpo com cancelamento do fluxo, data, paginação, contagem exata, consulta por IDs sem cache, allowlist de host e limite compartilhado entre instâncias; os cinco de browser verificam as correções de jornada. Não são uma certificação de produção.
- O PostgreSQL da vitrine foi consultado para conferir migrations, contagens, RLS e privilégios. As funções de entrega foram exercitadas dentro de uma transação revertida; nenhum dado comercial foi mantido e nenhuma mensagem foi enviada.
- Referências externas e estudos de mercado foram avaliados como evidência documental histórica de 20/09; não houve nova pesquisa de mercado, entrevistas ou auditoria administrativa do banco operacional nesta revisão.

A matriz integral está no [checklist de 200 etapas](PLANO_200_ETAPAS.md) e no [CSV](PLANO_200_ETAPAS.csv). O painel `/planejamento` permite filtrar os três estados auditados, consultar lacunas e exportar o acompanhamento.

## Resultado por fase

| Fase | Critério comprovado | Parcial | Sem entrega comprovada |
|---|---:|---:|---:|
| 01 · Diagnóstico e patrimônio existente | 9 | 0 | 1 |
| 02 · Pesquisa de mercado e evidências de UX | 10 | 0 | 0 |
| 03 · Posicionamento, descoberta e mensuração | 1 | 7 | 2 |
| 04 · Identidade, direção de arte e voz | 7 | 2 | 1 |
| 05 · Curadoria e qualidade do catálogo | 3 | 5 | 2 |
| 06 · Arquitetura de informação e jornadas | 4 | 5 | 1 |
| 07 · Sistema de design e componentes | 7 | 3 | 0 |
| 08 · Página inicial e narrativa de marca | 8 | 1 | 1 |
| 09 · Busca, filtros e descoberta | 7 | 0 | 3 |
| 10 · Página de produto e confiança | 2 | 5 | 3 |
| 11 · Personalização e montagem de kits | 0 | 2 | 8 |
| 12 · Seleção, briefing e conversão | 5 | 3 | 2 |
| 13 · Contrato público e integração de catálogo | 4 | 6 | 0 |
| 14 · Passagem para o comercial e CRM | 1 | 3 | 6 |
| 15 · Segurança, privacidade e governança | 0 | 7 | 3 |
| 16 · Conteúdo, SEO e descoberta orgânica | 1 | 6 | 3 |
| 17 · Desempenho e confiabilidade | 7 | 0 | 3 |
| 18 · Acessibilidade e inclusão | 3 | 6 | 1 |
| 19 · Qualidade, homologação e piloto | 3 | 3 | 4 |
| 20 · Lançamento, operação e evolução | 0 | 2 | 8 |
| **Total** | **82** | **66** | **52** |

## Correções do acompanhamento

O registro anterior mostrava **63 concluídas e 137 pendentes**. A revisão não mudou os 200 objetivos para obter um resultado melhor:

| Etapa reaberta | Motivo |
|---|---|
| 061 · Tokens | Cores e fontes centralizadas; espaçamentos, bordas e raios ainda usam valores espalhados. |
| 069 · Biblioteca | Há inventário descritivo, mas faltam exemplos reproduzíveis e variantes completas. |

As regressões inicialmente encontradas nas etapas **056, 068, 087, 089, 114, 127, 134, 168 e 178** foram corrigidas. A revalidação cobre envelope de seleção, reduced motion, ordenação e paginação na fonte, rascunho em memória, fonte única publicada, chave/hash com lease atômica e distinção entre vazio e indisponibilidade. A revalidação posterior acrescentou histórico de navegação, fallback de mídia para 403 e o gate de JavaScript, fontes e chunks do build.

Nove critérios próprios já atendidos tecnicamente apareciam como pendentes: **051, 054, 055, 092, 122, 153, 162, 163 e 179**. A classificação revisada reconhece essas entregas isoladas e passa a mostrar suas dependências separadamente. Foram verificadas evidências de mapa, jornada sem conta, natureza consultiva, páginas permanentes, host, HTML inicial, imagens e varredura automatizada. Não são nove funções novas criadas nesta revisão; também não aprovam indexação, integração viva, LCP de campo ou conformidade integral de acessibilidade.

A etapa **166** passou de parcial para concluída no próprio critério após [três rodadas móveis reproduzíveis](audit/2026-09-22-lighthouse-repeat.md), com configuração e relatórios completos. O LCP mediano de 2,612 s ainda excede a meta de 2,5 s; medição concluída não significa desempenho aprovado para lançamento nem p75 de usuários.

O critério 004 foi atualizado para a decisão posterior do usuário: banco **da vitrine** `whwloseshzraipljisqo`, banco **operacional** `doufsxqlfjyuvxuezpln`. O critério 006 explicita a qual repositório se refere a ausência histórica de `graph.json`.

As etapas **051, 062–067, 072, 092, 115 e 179** têm critério próprio comprovado e ao menos uma dependência direta aberta. O painel e os exports mostram os estados das dependências. A checagem estrutural passou a distinguir conclusão isolada de prontidão integrada; ela continua validando IDs, ciclos e referências e agora compara integralmente JSON, Markdown e CSV.

Marcações pessoais não mudam o status auditado, os filtros ou o progresso comprovado. O armazenamento local identifica a revisão e guarda somente desvios; uma marcação antiga não volta a fechar automaticamente uma etapa reaberta.

## Defeitos reproduzidos

Os endpoints foram carregados com `fetch` simulado e as interações de envio foram interceptadas no navegador. O destino comercial real permaneceu desconfigurado. A tabela registra a reprodução inicial e a evidência atual da correção; prioridade é a urgência para completar a frente afetada, não uma afirmação de incidente em produção.

| ID | Prioridade e etapas | Cenário e resultado observado | Condição para encerrar |
|---|---|---|---|
| AUD-01 | P0 antes de ativar envio · 117, 134 | A reprodução inicial duplicava webhook sob concorrência. O cenário atual retorna `201` e `202`, com uma chamada externa. | Persistência/hash e lease já implementados; exercer contra CRM homologado antes de ativar. |
| AUD-02 | P0 antes de ativar envio · 134 | A reprodução inicial aceitava conteúdo divergente. O cenário atual retorna `409`. | Manter contrato e testar adaptador comercial. |
| AUD-03 | P0 antes de ativar envio · 144 | O limite dependia de `Content-Length`. O cenário atual mede bytes e retorna `413`; o limite distribuído também foi instalado no banco. | Validar cabeçalho de IP e WAF no proxy real antes de produção. |
| AUD-04 | P1 · 117, 118 | URL inválida aparecia configurada. A capacidade e o POST agora usam a mesma validação; localhost só é aceito no desenvolvimento. | Definir receptor e política aprovados. |
| AUD-05 | P1 · 144 | Sufixo de data era truncado. A entrada integral agora é rejeitada. | Definir regras comerciais de data além do calendário. |
| AUD-06 | P0 antes de ampliar catálogo · 089, 127 | Fonte de 30 registros era truncada. O cenário atual confirma total 30 com paginação/contagem na fonte. | Testar expansão de curadoria com dados aprovados. |
| AUD-09 | P1 · 056 | Ficha gravava seleção sem validade. A mesma serialização com `savedAt` é usada nas duas rotas. | Manter teste entre rotas. |
| AUD-10 | P1 · 088 | Limpeza mantinha `q` na URL. Busca, categoria, página e ordenação agora registram histórico; voltar restaura a consulta na fonte. | Incluir futuras facetas no mesmo contrato de URL. |
| AUD-11 | P0 antes de ativar envio · 117, 134 | Retry criava chave nova. A chave permanece estável para a mesma intenção. | Exercer resposta perdida e CRM homologado. |
| AUD-12 | P1 · 114, 177 | Voltar apagava contato. Rascunho controlado em memória preserva os campos sem localStorage. | Revalidar ao mudar os campos. |
| AUD-13 | P1 · 068, 178 | Rolagem ignorava reduced motion. A sonda atual não observa animação intermediária. | Incluir novas animações na sonda. |
| AUD-21–22 | P0 antes de ativar envio · 117, 128 | O POST podia ler produto retirado ou mínimo antigo pelo cache. Agora consulta a publicação sem cache e rejeita a intenção desatualizada. | Testar em staging com publicação e CRM homologados. |
| AUD-23–29, 32 | P0 antes de ampliar catálogo · 127, 130 | Drift de slug, data, mídia, duplicata, filtro, paginação e correspondência de ficha passa a falhar explicitamente. | Homologar contrato editorial completo, variantes e staging. |
| AUD-30–31 | P0 antes de ativar envio · 118, 139 | Aceite do receptor seguido de falha no banco não é marcado como rejeição; falha real do receptor continua registrada. | Exigir idempotência do CRM e conciliação por protocolo. |

Os controles **AUD-07 e AUD-08 passam**: projeto operacional e host semelhante são rejeitados antes da leitura do catálogo.

A validação passa em build, TypeScript, checagem integral do plano, orçamento de imagens, JavaScript, fontes e chunks, 27 cenários sintéticos, cinco sondas de browser e 102 testes E2E em Chromium, Firefox e WebKit local. A cobertura inclui API 503, offline, mídia 403, resposta atrasada, página fora do intervalo, protocolo ausente, seleção retirada ou com mínimo alterado antes do briefing e limite compartilhado simulado entre instâncias. Os gates externos continuam abertos; uma suíte verde não homologa CRM, operação ou lançamento.

O painel atualizado também foi inspecionado em **390 e 1440 pixels**, com filtro de parciais e critério expandido: sem overflow horizontal e sem violações nas regras axe selecionadas. [Registro da inspeção](audit/plan-dashboard-check.json).

Resultados brutos: [módulos isolados](audit/plan-scenarios.json), [navegador](audit/plan-browser-scenarios.json), [cenários adicionais](audit/2026-09-22-regression-scenarios.md), [conferência pré-briefing](audit/2026-09-22-selection-freshness.md) e [drift/entrega no servidor](audit/2026-09-22-server-catalog-and-delivery.md). Reprodutores: `node scripts/audit-plan-scenarios.mjs`, `npm run test:e2e` e, com build servido na porta 3111, `node scripts/audit-plan-browser.mjs`. Eles são gates de regressão local, não certificação de CRM, privacidade ou operação.

## Lacunas adicionais comprovadas por inspeção

| Lacuna | Evidência | Etapas e efeito |
|---|---|---|
| Facetas futuras de busca | Busca, categoria, página e ordenação sincronizam URL e histórico. | 088 está concluída; incluir novas facetas no contrato de URL ao criá-las. |
| Facetas comerciais incompletas | UI oferece ordenação e paginação na fonte, com ID como desempate; atributos comerciais ainda não estão aprovados para facetas combináveis. | 085–086 e 090: projetar e testar relevância/facetas com dados e compradores. |
| Passagem comercial sem homologação | O protocolo é persistido e a entrega é reservada, mas não há receptor/CRM configurado. | 117–118, 139, 184: falta contrato vivo, conciliação operacional e aceite de vendedores. |
| Controle de abuso em produção | A entrega configurada usa janela móvel atômica no PostgreSQL e HMAC do IP; sem cabeçalho declarado ou IP válido, falha fechado. A prévia desligada não grava contatos nem usa a janela. | 144: homologar que o proxy real sobrescreve o cabeçalho, validar WAF/múltiplas réplicas e acompanhar o cron de retenção. |
| Retorno do CRM ainda não homologado | Cliente rejeita `2xx` sem protocolo válido e mantém o formulário; não há receptor comercial aprovado para testar confirmação real. | 117–118: homologar contrato, erro e conciliação do receptor. |
| Aceite remoto sem confirmação local | Uma resposta 2xx do receptor seguida de falha do banco preserva estado incerto; após expirar a reserva, retry ainda pode reenviar. | 118, 139: receptor deve honrar chave de idempotência e permitir conciliação por protocolo antes de ativar entrega. |
| Logs publicados ainda não inspecionados | Scanner cobre código público, scripts e build estático; não existe infraestrutura publicada com logs completos para revisar. | 143: incluir inspeção de logs no ambiente comercial. |
| Domínio e SEO comercial sem aprovação | Canonical é específico por rota; a indexação exige URL HTTPS e catálogo configurado, e o sitemap lê itens publicados. A posse do domínio e redirects não foram homologados. | 152–156: aprovar domínio, slugs finais, redirects e conteúdo. |
| Planejamento acessível na prévia | `/planejamento` continua acessível sem autenticação na prévia; configuração indexável retorna 404 para a rota. | 191, 194: manter o painel em ambiente interno ao expor a vitrine comercial. |
| Deploy comercial ainda ausente | CI versionado executa os gates em push/PR; staging, domínio, release reversível e monitoramento não estão configurados. | 185, 191–195: executar pipeline remoto e preparar ambientes e operação. |
| Medição de experiência | Gate mede imagens, fontes WOFF2, JavaScript gzip e chunks por rota; três rodadas móveis registram LCP 2,259–3,121 s, mediana 2,612 s. | 166 tem critério de medição comprovado; otimizar LCP, medir campo e instrumentar alertas nas etapas seguintes. |

Essas lacunas ainda exigem decisões, ambiente e evidências próprias. As correções técnicas reproduzidas nesta rodada constam no registro de cenários adicionais.

## Funções sugeridas ainda ausentes ou incompletas

| Frente | O que funciona hoje | O que falta para a função desejada |
|---|---|---|
| Descoberta | Busca, quatro categorias, favoritos, ordenação e paginação consultam oito peças publicadas na fonte. | Atributos comerciais, facetas combináveis, sinônimos e relevância validada com compradores. |
| Produto | Modal e ficha permanente com uma foto, descrição, SKU e mínimo cadastrado. | Galeria, variantes, ficha revisada, condições contextualizadas e recomendações elegíveis. |
| Personalização e kits | Conteúdo explicativo e observações livres. | Técnicas/áreas por SKU, upload seguro, simulação, prova final, kit estruturado, embalagem, cartão e cálculo. |
| Conversão | Seleção, download local e entrega opcional persistida/idempotente. | CRM homologado, confirmação comercial, atendimento e conciliação efetiva. |
| Operação | Schema privado preparado e código publicado no GitHub. | Dono do lead, qualificação aprovada, distribuição, orçamento transacional, estados, SLA, fila e conciliação. |
| Conteúdo/SEO | Home editorial, metadados iniciais, robots e sitemap condicionais. | Direitos, conteúdo aprovado, guias, redirects/canonical completos, domínio e Search Console. |
| Qualidade | CI de build/tipos/checks, matriz E2E Chromium/Firefox/WebKit e axe em cenários representativos. | Aparelhos reais, Safari instalado, leitores de tela, carga, rede limitada e pilotos. |
| Governança | Papéis sugeridos e avisos de prévia. | Pessoas responsáveis, controlador/canais reais, política comercial, retenção e processo de direitos. |
| Crescimento | Métricas propostas em documento. | Instrumentação aprovada, baseline real, monitoramento, experimentos e revisão periódica. |

## Banco e repositório

O banco oficial **da vitrine** confirmou **8 produtos publicados**, **0 briefings comerciais**, migrations até `20260922143000`, RLS nas tabelas da aplicação e ausência de privilégios anônimos de escrita. `anon` não tem SELECT em briefings ou limites. A persistência, reserva concorrente e finalização foram exercitadas em transação revertida; o limite compartilhado aceitou cinco chamadas, bloqueou a sexta e expôs um retorno REST booleano. Evidências: [consulta de auditoria](audit/plan-database-check.json) e [controle de abuso](audit/2026-09-22-rate-limit.md).

Isso comprova schema, dados da curadoria, consumo dinâmico nas jornadas públicas e persistência técnica pronta. Não comprova integração no CRM. A conta da CLI continua sem permissão de Management API para `supabase link`; as migrations foram aplicadas por conexão PostgreSQL autorizada. O banco operacional `doufsxqlfjyuvxuezpln` não recebeu alterações nesta revisão.

Também foi feita comparação exata da chave de servidor e senha atuais contra arquivos candidatos ao Git e os arquivos públicos de `.next/static`: **zero ocorrências**, sem registrar valores. [Evidência da inspeção](audit/plan-secret-scan.json). O scanner automatizado agora cobre código, scripts e build estático; logs operacionais completos ainda não existem para auditoria, por isso a etapa 143 permanece parcial.

O código anterior está sincronizado no GitHub e as migrations do banco dedicado estão atualizadas. As correções desta rodada não exigem nova migration. Publicação do código no GitHub não significa hospedagem do site em domínio de produção.

## Gates e sequência recomendada

| Gate | Situação | Evidência ainda necessária |
|---|---|---|
| G1 · Direção | Aberto | Observação, entrevistas, identidade e MVP aprovados. |
| G2 · Conteúdo | Aberto | Materiais, mínimos, condições, direitos e manutenção editorial. |
| G3 · Experiência | Aberto | Correções de jornada, descoberta/produto completos e validação com compradores. |
| G4 · Operação | Aberto | Persistência idempotente, CRM, segurança e fluxo comercial testado. |
| G5 · Qualidade | Aberto | Desempenho, matriz de ambientes, acessibilidade manual e pilotos. |
| G6 · Lançamento | Aberto | Domínio, release reversível, equipe, smoke e monitoramento real. |

1. **Correções técnicas independentes:** validade da seleção, URL/voltar, rascunho em memória, movimento reduzido, limite real de corpo e validação integral. Encerrar com testes que reproduzam os defeitos acima.
2. **Fonte única publicada:** unificar home, ficha, seleção e validação no catálogo; adicionar paginação/contagem na fonte, estado vazio correto e retirada dentro do SLA. Testar mais de 24 itens e alteração de publicação em ambiente isolado.
3. **Decisões comerciais e de dados:** definir receptor, donos, campos, política, retenção e condições por SKU. Essas decisões podem avançar enquanto as correções técnicas são feitas.
4. **Persistência e passagem ao comercial:** chave estável, hash, aquisição atômica, fila/outbox, confirmação e conciliação. Testar simultaneidade, duas instâncias, reinício, resposta perdida e payload conflitante antes de habilitar envio real.
5. **Amplitude de produto:** variantes, mídia, filtros e personalização conforme dados aprovados. Kit/configurador é P1 no plano; eventual adiamento exige decisão explícita de escopo, não marcação como entregue.
6. **Homologação e publicação:** metadados/domínio, acesso ao planejamento, CI, testes de navegadores/rede/acessibilidade, laboratório repetido, piloto, release e rollback. Somente após esses gates, acompanhar o funil e as primeiras 48 horas.

Para encerrar uma etapa, anexar evidência do seu aceite, corrigir a constatação, registrar a revisão e regenerar o plano. Marcar uma caixa no navegador não executa nem valida a melhoria.
