# Auditoria comparativa — Promo Brindes V1 → Premium

Data: **22/09/2026**. Referência examinada: [`Promo_Brindes_V1@b211c2b`](https://github.com/adm01-debug/Promo_Brindes_V1/tree/b211c2ba11b47c212166db7786a9703e2cfd0329). Base premium: `7489e171d8beefeacc07eab60c0397655951671d`.

**O maior patrimônio reutilizável do V1 está na jornada de decisão e na operação do atendimento.** A vitrine premium deve absorver briefing estruturado, comparação, colaboração e rastreabilidade, preservando sua curadoria, arquitetura e linguagem. A aparência do V1 atende a outra proposta: comunicação expressiva para campanhas, exploração ampla e referências rápidas. Copiar essa aparência ou publicar todo o catálogo enfraqueceria o posicionamento premium.

O retrato original deste documento é uma auditoria e um backlog de aproveitamento. Ele não transforma funcionalidades observadas em critérios concluídos do plano premium. A revisão vigente registra **84 critérios comprovados, 68 parciais e 48 pendentes**. Cada recomendação abaixo mantém seu próprio critério de implementação e validação.

**Atualização posterior à auditoria:** o item `APV1-01` recebeu [implementação técnica parcial e simulações](audit/2026-09-22-briefing-structured.md); `APV1-23` recebeu [testes SQL isolados](audit/2026-09-22-database-contracts.md); `APV1-02` ganhou um [registro de aprovação editorial](editorial/README.md). Os requisitos de homologação comercial, conteúdo e operação continuam abertos; o retrato e os testes desta auditoria permanecem datados do commit de referência acima.

## 1. Método, cobertura e limites

Foram inventariados **424 arquivos versionados**, incluindo 104 em `src`, 22 em `api`, 164 em `docs` e 62 em `site-supabase`. Há **44 migrations e 17 arquivos pgTAP**. O Graphify foi usado como mapa estrutural: 231 arquivos de código, 1.497 nós, 2.942 relações e 172 comunidades. O grafo não é prova de comportamento; as conclusões foram conferidas nos arquivos e em testes dirigidos. A extração foi local, apenas de código, sem chamadas a modelos ou exportação do repositório; não houve consumo de tokens de extração semântica. Isso não mede o custo total desta análise.

O exame abrangeu descoberta, catálogo, produto, seleção, briefing, compartilhamento, autenticação, histórico, propostas, notificações, retenção, segurança, SEO, desempenho, acessibilidade, CI e documentação. Foi uma inspeção dirigida por fluxos e riscos, não uma prova formal de cada linha dos 424 arquivos.

| Verificação | Resultado | O que comprova / limite |
|---|---|---|
| Instalação pelo lockfile; Node 22.13.1 | Executada | Scripts de instalação desabilitados; sem modificar dependências |
| Lint, TypeScript, ledger, build e orçamento de assets | Aprovados | Consistência e limites definidos pelo próprio V1 |
| Suíte unitária/API original | **247 testes, 41 arquivos, aprovados** | Muitos provedores e bancos são simulados |
| Testes Node de ferramentas/segurança | **33 aprovados** | Nomes de migrations, catálogo de erros, geração de JWT, comparação de segredos e consulta SQL protegida |
| Playwright original | **154 aprovados, 14 ignorados, 168 combinações** | Chromium desktop/mobile, Firefox e WebKit; skips condicionados a viewport ou motor; APIs simuladas |
| Sondas adicionais independentes | **3 comportamentos de risco + 1 controle reproduzidos** | O teste passar significa reproduzir o problema, não corrigi-lo |
| Navegação pública | Home, catálogo, biblioteca, orçamento, acesso, privacidade e produto | Apenas leitura; requisições diferentes de GET/HEAD bloqueadas |
| Axe | Seis superfícies amostradas: cinco sem violações selecionadas; uma falha na galeria do produto | `aria-required-children` no produto com múltiplas fotos; não é certificação integral |
| CI remoto no commit examinado | Quality, banco isolado, Graphify e CodeQL verdes | Banco local reconstruído na CI; não comprova migration em produção |
| Banco remoto V1, CRM, e-mail, WhatsApp, conta real | **Não homologados nesta auditoria** | Nenhuma gravação, mensagem ou criação de conta real |

As capturas públicas representam o deploy observado na data, que pode diferir do commit clonado. Não foi comprovada equivalência entre o SHA do deploy e o SHA do GitHub. As referências de código ficam fixadas no commit; os JSONs de navegador registram a observação pública separadamente.

Artefatos: [manifesto e resultados](audit/comparativo-v1-20260922/manifest.json), [navegação pública](audit/comparativo-v1-20260922/browser.json), [produto e briefing](audit/comparativo-v1-20260922/product-quote.json), [sondas reproduzíveis](audit/comparativo-v1-20260922/comparative-gaps.audit.test.ts.txt), [backlog em CSV](BACKLOG_APROVEITAMENTO_V1.csv). Instruções de reprodução estão no [README das evidências](audit/comparativo-v1-20260922/README.md).

## 2. Públicos diferentes, necessidades parcialmente compartilhadas

| Dimensão | V1 observado | Direção recomendada para o premium |
|---|---|---|
| Proposta | Explorar ideias e montar campanhas | Escolher presentes que representem a marca com segurança |
| Linguagem | Radar, drop, vibe, moodboard | Curadoria, ocasião, acabamento, personalização, proposta |
| Direção visual | Verde, azul, lima, tipografia de impacto e adesivos | Preto, champanhe e marfim; fotografia criteriosa, contraste e respiro |
| Oferta | Catálogo amplo; 7.665 resultados na leitura pública | Oito peças publicadas na última auditoria premium; expandir por qualidade editorial |
| Descoberta | Muitas categorias, filtros e atalhos | Poucas entradas claras por ocasião, destinatário e intenção |
| Decisão | Exploração e comparação de possibilidades | Justificativa da escolha, adequação ao destinatário e qualidade comprovável |
| Atendimento | Primeiro orçamento sem conta; histórico depois | Preservar entrada sem conta; oferecer acompanhamento quando houver operação real |
| Confiança | Contexto de campanha, proposta e comunicação | Materiais, detalhes, embalagem, prova de personalização e responsável comercial |

Essas são interpretações de posicionamento e do produto observado, não resultados de entrevistas com os dois públicos. Validar com compradores e vendedores continua necessário.

**Exemplo de adaptação:** em vez de “Qual a vibe da campanha?”, perguntar “Quem receberá o presente?” e “O que sua marca quer comunicar?”. Em vez de “premium” como filtro genérico, oferecer “Relacionamento com clientes”, “Reconhecimento” e “Boas-vindas à liderança”, com produtos realmente elegíveis e justificativa editorial.

Luxo precisa aparecer também no serviço: promessa clara, poucos passos, informações verificadas e continuidade no atendimento. Adicionar dourado ou uma animação não resolve incerteza sobre prazo, acabamento ou responsabilidade.

## 3. Comparação funcional

| Frente | Patrimônio identificado no V1 | Situação/oportunidade premium | Decisão |
|---|---|---|---|
| Descoberta guiada | `CampaignFinder`, quatro escolhas puláveis | Busca existe; curadoria por contexto incompleta | Adaptar com regras editoriais |
| Busca | Sinônimos, termos compostos, correção controlada | Busca básica funcional | Reutilizar lógica pura, ajustar vocabulário |
| Facetas | Categoria, cor, material e perfil na URL | Atributos comerciais incompletos | Preparar contrato antes de filtros |
| Biblioteca | Dez coleções online; formato identificado | Coleções iniciais sem biblioteca completa | Adaptar editorialmente |
| Produto | Galeria, zoom, variantes e relacionados | Foto única e ficha básica | Prioridade alta para conteúdo real |
| Comparação | Até três produtos, diferenças destacadas | Ausente | Nova ficha de decisão, enxuta |
| Briefing | Verba e escopo, evento, recebimento, flexibilidade, canal, logo | Ocasião, data, orçamento e mensagem menos estruturados | Primeiro aproveitamento recomendado |
| Aprovação interna | Compartilhar seleção; opção principal/alternativa | Download local; colaboração ausente | Links revogáveis, sem dados do comprador |
| Continuidade | Rascunho em sessão por até 24h | Rascunho em memória | Decidir retenção antes de portar |
| Histórico | Conta opcional, e-mail confirmado, solicitações anteriores | Ausente | Depois de CRM e identidade definidos |
| Propostas | Documento privado com URL assinada | Ausente | Corrigir separação de credenciais antes de reutilizar |
| Recompra | Recupera itens e revalida catálogo | Ausente | Depois do histórico; nunca copiar preço/prazo antigo |
| Confirmação | Outbox transacional e status por canal | Entrega comercial parcial | Adaptar padrão; separar CRM de notificações |
| Falhas | Lease, tentativas, atraso, webhooks e saúde da fila | Estado incerto preservado; conciliação operacional pendente | Reutilizar conceitos e cenários |
| Segurança de dados | RLS, isolamento por usuário, RPCs, papel limitado | RLS/contratos presentes; operação ainda parcial | Projetar permissões por caso de uso |
| Retenção | Exclusão de arquivos e registros, runbooks | Processo ainda incompleto | Implementar depois de política definida |
| Métricas | Eventos tipados e limpeza de URLs no Analytics | Instrumentação produtiva pendente | Adaptar whitelist e revisar todos os SDKs |
| SEO | Metadados/JSON-LD via shell; conteúdo React no cliente | HTML inicial por Next/servidor | Preservar SSR premium |
| Desempenho | Limites de assets; rotas lazy | Orçamento por rota e fontes já existe | Preservar limite; evitar auth/animação global |
| Banco/CI | Reset isolado, pgTAP, concorrência, tipos/documentos gerados | Contratos e E2E; cobertura SQL ampliável | Forte candidato de engenharia |

“Reutilizar” significa extrair regras e testes, com contrato e revisão próprios. Os componentes React/Vite, rotas serverless e migrations não são intercambiáveis diretamente com Next e o schema premium.

## 4. Problemas que não devem ser importados

### V1-G01 — Pedido já salvo pode parecer rejeitado após retirada do produto

**Evidência reproduzida, prioridade P0 antes de reutilizar o envio.** Primeira submissão simulada retorna `201`; o produto é retirado; o mesmo pedido com a mesma chave retorna `422`, sem chegar à consulta de duplicidade no banco. O comprador pode entender que precisa enviar novamente, apesar de o pedido já existir.

Origem: [`leadHandler.ts:105`](https://github.com/adm01-debug/Promo_Brindes_V1/blob/b211c2ba11b47c212166db7786a9703e2cfd0329/api/_lib/leadHandler.ts#L105) reconcilia o catálogo antes da persistência. Recomendação: reconhecer pedido existente pela intenção normalizada antes da validação de uma nova submissão; preservar protocolo e estado sem reenviar automaticamente. **O premium já possui esse tratamento** em `src/app/api/briefings/route.ts`; mantê-lo como gate ao integrar novos campos.

### V1-G02 — Alteração editorial provoca conflito no reenvio idêntico

**Evidência reproduzida, P0 no mesmo fluxo.** A primeira submissão retorna `201`; muda apenas a imagem do produto na fonte; o reenvio retorna `409`. A intenção do comprador não mudou, mas o hash inclui dados derivados do catálogo.

Origem: [`siteDatabase.ts:83`](https://github.com/adm01-debug/Promo_Brindes_V1/blob/b211c2ba11b47c212166db7786a9703e2cfd0329/api/_lib/siteDatabase.ts#L83) e comparação de hash na [migration do pedido](https://github.com/adm01-debug/Promo_Brindes_V1/blob/b211c2ba11b47c212166db7786a9703e2cfd0329/site-supabase/supabase/migrations/20260910140000_preserve_item_decision_group.sql). O teste simula a resposta do banco de acordo com essa comparação SQL; não executa o PostgreSQL remoto. Separar intenção estável de snapshot comercial. Quantidade ou produto alterado continua exigindo conflito/novo pedido; imagem editorial alterada não deve impedir recuperar um protocolo existente.

### V1-G03 — Credencial limitada de banco também usada para assinar PDF

**Escolha da credencial reproduzida; falha real no Storage não homologada. P0 antes do corte de credenciais ou adoção do portal.** Com `SITE_SUPABASE_SERVICE_JWT` configurada para `site_api`, a assinatura do PDF usa esse JWT, mesmo havendo credencial de Storage separada. O runbook informa que `site_api` não tem acesso ao schema `storage`.

Referências: [`customer-proposals.ts:102`](https://github.com/adm01-debug/Promo_Brindes_V1/blob/b211c2ba11b47c212166db7786a9703e2cfd0329/api/customer-proposals.ts#L102), [`siteDatabase.ts:55`](https://github.com/adm01-debug/Promo_Brindes_V1/blob/b211c2ba11b47c212166db7786a9703e2cfd0329/api/_lib/siteDatabase.ts#L55) e [runbook do corte](https://github.com/adm01-debug/Promo_Brindes_V1/blob/b211c2ba11b47c212166db7786a9703e2cfd0329/docs/RUNBOOK_SITE_API_CUTOVER.md#L62). A sonda prova o cabeçalho usado, não uma indisponibilidade em produção. Separar credenciais por capacidade e testar um PDF autorizado e outro de terceiro no ambiente isolado antes de ativar.

### V1-G04 — “Premium” é mapeado para destaque, sem critério de qualidade

**Confirmado em código, P1 editorial.** Em [`campaignPresets.ts:125`](https://github.com/adm01-debug/Promo_Brindes_V1/blob/b211c2ba11b47c212166db7786a9703e2cfd0329/src/lib/campaignPresets.ts#L125), escolhas de público/ocasião/estilo premium podem virar `profile: featured`. Destaque é uma posição editorial, não uma comprovação de acabamento. Para o premium, exigir elegibilidade, material, personalização, embalagem, qualidade de imagem e texto revisado. Se faltarem dados, indicar necessidade de curadoria humana.

### V1-G05 — Texto automático e atributos insuficientes para promessa premium

**Confirmado em código e amostra pública, P1 de conteúdo.** `mapProductRow` prioriza `ai_summary`/`ai_description`; não há aprovação editorial explícita no payload público examinado. A página observada exibe “Amplifiador premium” e descrições com alegações ambientais genéricas. Isso não prova que as alegações sejam falsas; demonstra necessidade de revisão e evidência específica antes de publicá-las como diferenciais.

Referência: [`catalog.ts:204`](https://github.com/adm01-debug/Promo_Brindes_V1/blob/b211c2ba11b47c212166db7786a9703e2cfd0329/src/lib/catalog.ts#L204). Aprovador, data da revisão, fonte dos atributos e direito de uso de cada imagem devem fazer parte da publicação premium. Quantidade desconhecida não deve aparecer como mínimo comercial de uma unidade.

### V1-G06 — Catálogo móvel demora a mostrar o primeiro produto

**Observação de layout, não violação WCAG.** Na captura de 390 × 844, introdução, busca, sugestões e controles ocupam a primeira tela; o card fica abaixo. No premium, reduzir o bloco introdutório do catálogo, manter filtros em painel e testar a visibilidade do primeiro resultado. A home pode dedicar espaço à marca; a página de busca deve priorizar a tarefa.

Evidência: [captura do catálogo móvel](audit/comparativo-v1-20260922/catalog-mobile.png). Validar com tarefas reais e tamanho de fonte aumentado; não fixar alturas que cortem conteúdo para cumprir uma métrica visual.

### V1-G07 — Autenticação e animação aumentam custo fora da área do cliente

**Confirmado no build e imports; impacto em usuários não medido.** O provider de autenticação envolve toda a aplicação. O build contém chunk do cliente Supabase de aproximadamente 215 kB e GSAP de 69,6 kB, antes de compressão. O orçamento original passa, mas isso não demonstra rapidez em rede móvel.

Referência: [`App.tsx`](https://github.com/adm01-debug/Promo_Brindes_V1/blob/b211c2ba11b47c212166db7786a9703e2cfd0329/src/App.tsx). No premium, carregar autenticação na área que a utiliza; manter interações simples e orçamento por rota. Não comparar esses valores brutos com métricas gzip/SSR de outra arquitetura como se fossem equivalentes.

### V1-G08 — Proteção de URLs precisa cobrir todos os instrumentos

**Assimetria confirmada em código; vazamento não demonstrado.** `Analytics` recebe `redactAnalyticsUrl`; `SpeedInsights` é montado sem `beforeSend` em [`App.tsx:78`](https://github.com/adm01-debug/Promo_Brindes_V1/blob/b211c2ba11b47c212166db7786a9703e2cfd0329/src/App.tsx#L78). Antes de aproveitar a instrumentação, interceptar os eventos dos dois SDKs com URLs sintéticas de conta, token e busca; verificar o que efetivamente sai. A correção necessária depende do payload observado. Não transportar identificadores privados para métricas.

### V1-G09 — Fallbacks de catálogo podem esconder configuração e contagem incorretas

**Confirmado em código.** `resolveSupabaseUrl` recai no host canônico e `parseContentRange` aceita valor alternativo quando falta uma contagem válida. Isso é diferente dos controles premium que rejeitam host incorreto e contrato inconsistente. Preservar a validação estrita da vitrine: indisponibilidade não deve virar “zero produtos”, nem erro de configuração virar acesso silencioso a outro banco.

Referências: [`catalog.ts:9`](https://github.com/adm01-debug/Promo_Brindes_V1/blob/b211c2ba11b47c212166db7786a9703e2cfd0329/src/lib/catalog.ts#L9) e [`catalog.ts:254`](https://github.com/adm01-debug/Promo_Brindes_V1/blob/b211c2ba11b47c212166db7786a9703e2cfd0329/src/lib/catalog.ts#L254).

### V1-G10 — Semântica da galeria falha com várias imagens

**Reproduzido na página pública e confirmado em código, P1 antes de portar a galeria.** O Axe sinalizou `aria-required-children`, com impacto classificado pela ferramenta como `critical`, em `.product-gallery__thumbs`. O contêiner tem `role="list"`, mas seus filhos diretos são botões sem itens de lista. O impacto da ferramenta não significa indisponibilidade do site.

Referência: [`ProductPage.tsx:188`](https://github.com/adm01-debug/Promo_Brindes_V1/blob/b211c2ba11b47c212166db7786a9703e2cfd0329/src/pages/ProductPage.tsx#L188) e [resultado público](audit/comparativo-v1-20260922/product-quote.json). Usar lista semântica com itens contendo os botões ou grupo de controles corretamente nomeado; preservar estado selecionado e teclado. Acrescentar fixture com pelo menos duas imagens e Axe na ficha completa. A suíte original verde não cobria esse resultado. O orçamento preenchido, inspecionado depois de selecionar localmente o produto, não apresentou violações nas regras selecionadas.

## 5. Arquitetura que deve ser preservada

| Projeto | Função observada/definida | Regra para aproveitamento |
|---|---|---|
| `doufsxqlfjyuvxuezpln` | Catálogo operacional canônico | Consumir somente projeção pública autorizada; não instalar módulos de site no operacional |
| `xlzmclcjdncjfdrjxclt` | Banco de leads/portal configurado no V1 | Fonte de referência de schema; não é o banco premium |
| `whwloseshzraipljisqo` | Banco oficial da vitrine premium | Publicação curada e persistência premium; migrations próprias e revisadas |

Fluxo pretendido: **catálogo operacional → publicação curada premium → seleção/briefing premium → receptor comercial homologado → vendedor responsável**. Uma eventual confirmação por e-mail/WhatsApp é um ramo paralelo desse fluxo. Ela informa o comprador; não substitui a criação da oportunidade.

Reaproveitar primeiro funções puras, contratos, estados e cenários de teste. Para recursos persistentes, desenhar migration aditiva para o schema premium e validar em banco isolado. Não copiar as 44 migrations em bloco: nomes, tabelas, papéis, Auth, Storage, retenção e ownership são específicos do V1.

A eventual unificação de contas entre sites exige decisão explícita de identidade e acesso. A posse do mesmo e-mail não autoriza automaticamente compartilhar histórico de toda uma empresa. O portal V1 associa solicitações anteriores sem titular ao e-mail confirmado; contas genéricas e mudanças de responsável precisam de regras comerciais próprias.

## 6. Aproveitamentos prioritários e critérios de conclusão

O [backlog completo em CSV](BACKLOG_APROVEITAMENTO_V1.csv) e sua [fonte JSON](audit/comparativo-v1-20260922/backlog.json) contêm **32 recomendações**, com origem, lacuna premium, adaptação, prioridade, etapas relacionadas, dependências, responsável sugerido e aceitação. Os IDs `APV1` não substituem nem aumentam silenciosamente o plano de 200 etapas. Algumas funções são extensões propostas de escopo.

### A. Briefing que reduz perguntas de retorno

Acrescentar investimento por presente ou total, quantidade/destinatários, data do evento, data desejada de recebimento, flexibilidade, canal de retorno e situação do logo. O V1 já modela parte importante disso em [`quoteBriefing.ts`](https://github.com/adm01-debug/Promo_Brindes_V1/blob/b211c2ba11b47c212166db7786a9703e2cfd0329/src/lib/quoteBriefing.ts). As faixas de preço do V1 não devem ser copiadas; precisam refletir a oferta premium e aceitar “a definir”.

- [ ] Campos opcionais e progressivos; explicar apenas o necessário.
- [ ] Validar data de recebimento versus evento, calendário, escopo do orçamento e payload no servidor.
- [ ] Preservar preenchimento ao voltar e sob erro de rede; manter a mesma chave para a mesma intenção.
- [ ] Atualizar versão do contrato, exportação e receptor juntos; testar payload antigo e novo.
- [ ] Vendedor recebe informação legível e confirma que consegue iniciar a proposta sem reconstruir o pedido.

### B. Produto com evidências de qualidade

Adaptar galeria, variantes e comparação para mostrar acabamento, textura, proporção, embalagem e técnicas compatíveis. “Sua marca aqui” é uma simulação conceitual, nunca aprovação de produção. O premium precisa distinguir imagem ilustrativa, foto do produto e prova aprovada.

- [ ] Dados revisados por SKU: material, dimensões, capacidade quando aplicável, mínimo conhecido, embalagem e personalização.
- [ ] Fotografias com direito de uso e identificação de variação; ampliação acessível e navegação por teclado.
- [ ] Variação pertence ao produto e continua publicada no envio.
- [ ] Comparar até três peças com diferenças relevantes e “a confirmar” para dados ausentes.
- [ ] Não prometer estoque, preço ou prazo calculado sem fonte comercial validada.

### C. Seleção que outras pessoas podem aprovar

O V1 possui seleção compartilhada e versão persistente revogável. Adaptar para aprovação por diretoria/compras, exibindo peças e quantidades, opção principal e alternativa, e data de atualização. Evitar nome do cliente, contato, observações livres e dados de orçamento em um link público.

- [ ] Link opaco, com expiração e revogação; token de gestão separado do token de leitura.
- [ ] Revalidar publicação ao abrir; item retirado fica claramente indisponível.
- [ ] Link expirado/revogado não revela seleção; abuso limitado no servidor.
- [ ] Impressão/PDF contém seleção e ressalvas corretas; não se apresenta como proposta comercial aprovada.
- [ ] Link público de referências não se confunde com proposta privada autenticada.

### D. Atendimento com responsabilidade e recuperação

Adaptar a outbox, reserva de trabalho, tentativas limitadas, histórico de eventos e alertas. O V1 demonstra padrões úteis em [`notifications.ts`](https://github.com/adm01-debug/Promo_Brindes_V1/blob/b211c2ba11b47c212166db7786a9703e2cfd0329/api/notifications.ts); o alvo premium prioritário é entregar a oportunidade ao receptor homologado com idempotência e conciliação.

- [ ] Cada protocolo corresponde a um pedido; CRM devolve identificação consultável e responsável.
- [ ] Diferenciar salvo, pendente de entrega, entregue ao CRM, em atendimento e falha que exige intervenção.
- [ ] Resposta perdida depois do aceite não cria segunda oportunidade.
- [ ] Tentativas têm teto, atraso e responsável quando esgotadas; observabilidade não guarda PII desnecessária.
- [ ] A operação consegue consultar e reconciliar um caso incerto sem “reenviar para ver se funciona”.
- [ ] Notificação aceita pelo provedor, entregue ao destinatário e lida são eventos distintos; não anunciar leitura sem evidência.

### E. Continuidade e portal, na ordem correta

Histórico, propostas privadas, ajustes e recompra têm valor, mas dependem de CRM, autenticação, ownership e política de retenção. Não devem preceder a conclusão do fluxo principal. O cliente pode solicitar a primeira proposta sem criar senha.

- [ ] E-mail confirmado e isolamento entre dois usuários testado no banco, API e interface.
- [ ] Download privado exige autorização atual, expira e não aparece em logs/telemetria.
- [ ] Sessão encerrada limpa dados pessoais; nenhuma tela mantém o orçamento da conta/rota anterior.
- [ ] Recompra cria nova intenção validada; não reutiliza promessa comercial vencida.
- [ ] Rascunho em sessão só é adotado com duração e comunicação definidas; manter memória enquanto isso.

## 7. Simulações obrigatórias antes de implementar ou ativar

| Cenário | Resultado exigido no premium |
|---|---|
| Comprador ainda não sabe a verba | Pode avançar; atendimento recebe “a definir”, sem preço inventado |
| Investimento informado sem escopo | Solicitar por presente/total; não interpretar silenciosamente |
| Recebimento posterior ao evento | Erro junto ao campo, preservando os demais dados |
| Voltar, fechar modal, reabrir | Rascunho permanece conforme política escolhida |
| Item retirado antes da primeira submissão | Bloquear envio e explicar revisão da seleção |
| Item retirado depois de pedido salvo | Recuperar protocolo e estado existente; não criar outro pedido |
| Só imagem/nome editorial mudou | Mesma intenção recupera pedido existente |
| Mesma chave, quantidade diferente | Conflito explícito; nenhuma alteração silenciosa |
| Dois envios simultâneos | Uma oportunidade e um protocolo; reserva atômica |
| CRM aceita, resposta se perde | Consultar por chave/protocolo antes de decidir reenvio |
| Provedor retorna 429/timeout/5xx | Espera limitada, tentativa rastreável, sem bloquear navegação |
| Webhook duplicado ou fora de ordem | Sem duplicação nem regressão indevida de estado |
| Vendedor responsável indisponível | Regra de cobertura/escalonamento; pedido não desaparece |
| Link compartilhado expirado/revogado | Conteúdo indisponível; gestão continua separada |
| Cliente A tenta documento de B | Acesso negado em todas as camadas |
| Corte de credencial para papel limitado | RPC e Storage validados separadamente |
| Logo inválido, grande ou malicioso | Recusa segura, sem conteúdo ativo público |
| Armazenamento do navegador bloqueado | Fluxo essencial continua utilizável |
| Teclado, zoom, redução de movimento | Sem perda de conteúdo, foco ou tarefa |
| URL com token/parâmetro privado | Nenhum instrumento envia o valor a terceiros |
| Falha de exclusão do arquivo | Operação fica rastreável; não declarar eliminação completa |
| Rollback de aplicação após migration | Versão anterior continua operando ou há procedimento testado |

Os quatro testes novos desta auditoria cobrem apenas os três riscos técnicos descritos e o controle de reenvio. A tabela acima é aceitação futura, não uma lista de cenários todos executados.

## 8. Sequência de execução proposta

**Onda 1 — contrato, conteúdo e briefing.** Aprovar atributos editoriais e campos comerciais; implementar briefing estruturado, dados de produto e testes de compatibilidade. Preparar receptor, responsável e cenários de reenvio. Resultado: seleção com informações suficientes para o vendedor trabalhar. Não depende de portal.

**Onda 2 — decisão e colaboração.** Descoberta guiada, sinônimos, galeria, variantes, comparação, seleção compartilhada e apresentação imprimível. Só publicar filtros com dados consistentes; só ligar links persistentes depois dos testes de expiração/revogação. Resultado: comprador consegue escolher e obter aprovação interna.

**Onda 3 — operação comprovada.** CRM, distribuição, confirmação, fila, conciliação, segurança de arquivos, retenção e métricas. Ambiente isolado com destinatários sintéticos; piloto com vendedores; exercícios de falha e recuperação. Resultado: cada pedido tem destino e dono verificáveis.

**Onda 4 — recorrência e evolução.** Portal opcional, proposta privada, ajuste/recompra, conteúdo por intenção e calendário seletivo. Medir uso real antes de acrescentar complexidade. Resultado: continuidade útil sem prejudicar a primeira conversão.

As ondas expressam dependências, não cronograma contratado. Algumas atividades de conteúdo e contrato podem avançar em paralelo; nenhuma muda a necessidade de homologar o fluxo comercial.

## 9. Métricas e validação com pessoas

Medir busca → produto → seleção → briefing iniciado → pedido persistido → CRM confirmado → primeiro atendimento → proposta enviada. Separar abandono de erro técnico e ausência de estoque/dado. Instrumentar sem texto livre, e-mail, telefone, token ou protocolo em ferramentas de audiência.

Antes de fixar metas numéricas, obter baseline. Indicadores prioritários: conclusão de briefing; campos que geram perguntas adicionais; tempo até primeira ação do vendedor; pendências além do SLA; taxa de pedidos duplicados; seleções compartilhadas que geram pedido; performance de campo. Não usar quantidade de páginas ou tamanho do catálogo como substituto de sucesso comercial.

Piloto sugerido: vendedores de perfis diferentes executam os mesmos briefings sintéticos, incluindo urgência, verba incerta e item indisponível; compradores representativos escolhem e compartilham uma seleção. Registrar onde hesitam, o que precisam perguntar e se compreendem as promessas. Quantidade de participantes e meta comercial devem ser definidas com o time; o piloto ainda não foi feito.

## 10. O que preservar e o que evitar

Preservar no premium: curadoria publicada, contrato público restrito, allowlist do banco, SSR, distinção entre erro e catálogo vazio, revalidação antes de nova submissão, protocolo recuperável, hash de intenção estável e orçamento de desempenho.

Evitar: importar 7.665 itens sem curadoria; chamar destaque de luxo; copiar faixas de investimento incompatíveis; animação ostensiva em todas as seções; catálogo com navegação excessiva; autenticação obrigatória; promessas automáticas de prazo/estoque; claims ambientais sem revisão; portabilidade presumida de imagens e componentes. O V1 possui [créditos de terceiros](https://github.com/adm01-debug/Promo_Brindes_V1/blob/b211c2ba11b47c212166db7786a9703e2cfd0329/THIRD_PARTY_NOTICES.md); preservar atribuição e verificar termos antes de reaproveitar código ou assets. Serem projetos da mesma empresa não demonstra, por si só, o direito de republicar material de terceiros.

## 11. Checklist de encerramento desta auditoria

- [x] Repositório e commit identificados; clone separado do premium.
- [x] Mapa estrutural consultado e fontes críticas verificadas.
- [x] Jornadas, componentes, APIs, migrations, testes e CI comparados.
- [x] Build, tipos, lint, testes e orçamento do V1 executados.
- [x] Navegação pública e capturas realizadas sem envios comerciais.
- [x] Três riscos técnicos examinados com sondas independentes e limites explícitos.
- [x] Oportunidades adaptadas ao público premium e priorizadas.
- [x] Backlog com dependências, etapas e aceitação produzido.
- [x] Conclusão da análise separada da implementação das recomendações.
- [ ] Implementar os itens aceitos do backlog e validar seus próprios critérios.
- [ ] Homologar integrações, dados, direitos e operação com responsáveis reais.

**Recomendação de início:** briefing estruturado + ficha de produto comprovável + fluxo comercial rastreável. Comparação e compartilhamento vêm em seguida. Essa ordem atende a decisão do comprador e a capacidade do vendedor de cumprir a promessa premium.
