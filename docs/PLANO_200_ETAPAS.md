# Promo Brindes Premium — plano de 200 etapas

Referência: **2026-09-22** · **20 fases × 10 etapas = 200 etapas**.

Status auditado: **81 concluídas no próprio escopo; 67 parciais; 52 sem entrega comprovada**. São 119 etapas abertas. Conclusão isolada não representa aprovação comercial, integração em produção ou lançamento.

Revisão do código base: `0e6d5d0793e9b50d3ece235d7b1a00394d28b18a`. [Relatório e prioridades](REVISAO_EXAUSTIVA_PLANO.md).

## Como utilizar

- `[x]`: critério próprio comprovado no escopo explicitado, com evidência; dependências abertas ainda impedem prontidão integrada.
- `[ ]` + **Parcial**: existe implementação ou artefato, mas falta parte do aceite ou há defeito reproduzido.
- `[ ]` + **Sem entrega comprovada**: função, atividade ou validação exigida ainda não tem evidência de execução.
- Evidência pode demonstrar uma lacuna. Um arquivo existente não comprova sozinho que o critério foi atendido.
- P0: necessário para a prontidão da frente correspondente. P1: evolução que pode ser negociada após o núcleo consultivo, conforme aceite do negócio.
- Responsáveis são papéis sugeridos, não pessoas já designadas.
- Janelas de semanas são estimativas relativas ao início aprovado, com trabalho em frentes paralelas; não são promessa de prazo. Fases fora da ordem numérica podem se apoiar entre si.
- Dependências representam prontidão integrada. A auditoria atesta o critério próprio de cada entrega e mantém bloqueios visíveis, inclusive quando uma entrega isolada funciona.
- A página `/planejamento` permite filtros, marcação local e exportação. Suas alterações não mudam este arquivo de referência.
- Este plano cobre a solução desejada. A prévia entregue usa oito produtos reais e exporta um briefing; ainda não registra leads no CRM.

## Portões de conclusão

| Gate | Critério | Etapas de referência |
|---|---|---|
| G1 · Direção | Pesquisa, posicionamento e escopo validados | 001–040 |
| G2 · Conteúdo | Dados, direitos e informações de compra aprovados | 041–060, 151–160 |
| G3 · Experiência | Descoberta, detalhes e briefing compreensíveis e funcionais | 061–120 |
| G4 · Operação | Contrato público, envio idempotente e continuidade no comercial | 121–150 |
| G5 · Qualidade | Desempenho, acessibilidade, testes e piloto aprovados | 161–190 |
| G6 · Lançamento | Release reversível, operação e monitoramento ativos | 191–200 |

## Visão das fases

| Fase | Escopo | Janela indicativa | Responsável sugerido |
|---|---|---|---|
| 01 | Diagnóstico e patrimônio existente | Semanas 1–2 | Estratégia + arquitetura |
| 02 | Pesquisa de mercado e evidências de UX | Semanas 1–2 | Pesquisa + UX |
| 03 | Posicionamento, descoberta e mensuração | Semanas 2–3 | Estratégia + comercial |
| 04 | Identidade, direção de arte e voz | Semanas 2–4 | Direção de arte + conteúdo |
| 05 | Curadoria e qualidade do catálogo | Semanas 3–5 | Conteúdo + dados + comercial |
| 06 | Arquitetura de informação e jornadas | Semanas 3–5 | UX + conteúdo |
| 07 | Sistema de design e componentes | Semanas 4–6 | Design de produto + frontend |
| 08 | Página inicial e narrativa de marca | Semanas 4–6 | Design + frontend + conteúdo |
| 09 | Busca, filtros e descoberta | Semanas 5–7 | UX + frontend + backend |
| 10 | Página de produto e confiança | Semanas 5–7 | UX + conteúdo + frontend |
| 11 | Personalização e montagem de kits | Semanas 6–8 | Produto + operação + frontend |
| 12 | Seleção, briefing e conversão | Semanas 5–8 | UX + frontend + comercial |
| 13 | Contrato público e integração de catálogo | Semanas 4–8 | Arquitetura + backend + dados |
| 14 | Passagem para o comercial e CRM | Semanas 7–9 | Backend + comercial + operações |
| 15 | Segurança, privacidade e governança | Semanas 6–10 | Segurança + jurídico + backend |
| 16 | Conteúdo, SEO e descoberta orgânica | Semanas 6–10 | Conteúdo + SEO + frontend |
| 17 | Desempenho e confiabilidade | Semanas 7–10 | Frontend + SRE + backend |
| 18 | Acessibilidade e inclusão | Semanas 8–10 | QA acessibilidade + frontend |
| 19 | Qualidade, homologação e piloto | Semanas 9–11 | QA + produto + comercial |
| 20 | Lançamento, operação e evolução | Semanas 11–12+ | PO + operações + crescimento |

## Fase 01 — Diagnóstico e patrimônio existente

**Responsável:** Estratégia + arquitetura · **Prioridade:** P0 · **Janela:** semanas 1–2.

**Articulação:** frente inicial.

- [x] **001. Registrar objetivo e fronteiras.** Documentar vitrine pública premium, relação com o comercial e escopo desta prévia.
  - **Situação auditada:** Concluída no escopo.
  - **Aceite:** Documento distingue protótipo, integração futura e lançamento comercial.
  - **Constatação:** Objetivo, escopo consultivo e limites de prévia estão documentados.
  - **Evidências e referências:** `docs/ESTRATEGIA_E_PESQUISA.md`.
  - **Próxima ação:** Nenhuma ação para este critério documental.

- [x] **002. Fixar a referência do repositório.** Registrar branch, hash e data do código examinado.
  - **Situação auditada:** Concluída no escopo.
  - **Aceite:** Auditoria aponta o commit 44857d5 e links reproduzíveis.
  - **Constatação:** Auditoria fixa o commit 44857d5 do aplicativo comercial e caminhos reproduzíveis.
  - **Evidências e referências:** `docs/AUDITORIA_PROJETO_INTERNO.md`.
  - **Próxima ação:** Preservar a revisão histórica; não confundir com o commit da vitrine.
  - **Dependências:** 001 (Concluída no escopo).

- [x] **003. Inventariar o projeto.** Contabilizar arquivos por diretório e localizar módulos de catálogo, propostas, imagens e personalização.
  - **Situação auditada:** Concluída no escopo.
  - **Aceite:** Inventário reproduzível inclui 8.319 arquivos versionados sem presumir leitura integral.
  - **Constatação:** Inventário histórico registra 8.319 arquivos e explicita a leitura dirigida.
  - **Evidências e referências:** `docs/AUDITORIA_PROJETO_INTERNO.md`.
  - **Próxima ação:** Repetir inventário se houver nova auditoria do aplicativo comercial.
  - **Dependências:** 002 (Concluída no escopo).

- [x] **004. Confirmar o Supabase canônico.** Distinguir a fonte operacional de Promo_Gifts_V4 do banco oficial da vitrine informado posteriormente pelo usuário.
  - **Situação auditada:** Concluída no escopo.
  - **Aceite:** Arquitetura e configuração identificam doufsxqlfjyuvxuezpln como operacional e whwloseshzraipljisqo como banco oficial da vitrine, sem troca implícita de destinos.
  - **Constatação:** Identidade de cada banco está documentada; a API confirmou whwloseshzraipljisqo para a vitrine.
  - **Evidências e referências:** `docs/ARQUITETURA_E_INTEGRACAO.md`, `docs/audit/plan-database-check.json`.
  - **Próxima ação:** Manter a distinção entre banco da vitrine e banco operacional doufsxqlfjyuvxuezpln.
  - **Dependências:** 002 (Concluída no escopo).

- [x] **005. Mapear fronteiras de autenticação.** Ler composição de rotas e identificar catálogo, propostas e revista pública.
  - **Situação auditada:** Concluída no escopo.
  - **Aceite:** Mapa mostra rotas protegidas e públicas com referências aos arquivos.
  - **Constatação:** Rotas públicas e protegidas do comercial estão mapeadas na revisão fixa.
  - **Evidências e referências:** `docs/AUDITORIA_PROJETO_INTERNO.md`.
  - **Próxima ação:** Revalidar o mapa antes de integrar uma nova revisão do comercial.
  - **Dependências:** 002 (Concluída no escopo).

- [x] **006. Qualificar o grafo disponível.** Checar artefatos graphify e a revisão que originou o relatório existente.
  - **Situação auditada:** Concluída no escopo.
  - **Aceite:** Auditoria histórica explicita a ausência de graph.json no comercial e a data anterior do seu relatório; o grafo local da vitrine é tratado separadamente.
  - **Constatação:** A ausência de graph.json refere-se ao repositório comercial na auditoria original; a vitrine tem grafo próprio.
  - **Evidências e referências:** `docs/AUDITORIA_PROJETO_INTERNO.md`.
  - **Próxima ação:** Usar o grafo como orientação e conferir fontes alteradas depois da extração.
  - **Dependências:** 002 (Concluída no escopo).

- [x] **007. Validar leitura pública pontual.** Consultar uma projeção limitada de produtos sem escrita e guardar a amostra permitida.
  - **Situação auditada:** Concluída no escopo.
  - **Aceite:** Respostas HTTP e campos selecionados são registrados sem chaves ou dados pessoais.
  - **Constatação:** Amostra pública e verificação posterior preservam IDs e campos limitados sem escrita.
  - **Evidências e referências:** `docs/audit/catalog-sample.json`, `docs/audit/CANONICAL_CATALOG_LIVE_CHECK_2026-09-22.md`.
  - **Próxima ação:** Não extrapolar leitura de oito registros para auditoria administrativa integral.
  - **Dependências:** 004 (Concluída no escopo).

- [ ] **008. Observar o comercial em uso.** Acompanhar representantes em catálogo, kit, simulação e proposta no ambiente autorizado.
  - **Situação auditada:** Sem entrega comprovada.
  - **Aceite:** Ao menos três sessões de tarefas reais são registradas com tempos, erros e necessidades.
  - **Constatação:** Não há registros das três sessões de uso real com representantes.
  - **Evidências e referências:** `docs/AUDITORIA_PROJETO_INTERNO.md`.
  - **Próxima ação:** Agendar três sessões autorizadas e registrar tempos, erros e necessidades.

- [x] **009. Inspecionar qualidade da amostra.** Confrontar nomes, descrições, fotos, mínimos e materiais das peças examinadas.
  - **Situação auditada:** Concluída no escopo.
  - **Aceite:** Registro diferencia inconsistências verificadas de hipóteses que precisam de validação.
  - **Constatação:** Auditoria da amostra identifica conflitos de materiais e mídia e separa hipóteses.
  - **Evidências e referências:** `docs/AUDITORIA_PROJETO_INTERNO.md`.
  - **Próxima ação:** Manter os conflitos nas etapas de revisão por SKU.
  - **Dependências:** 007 (Concluída no escopo).

- [x] **010. Consolidar achados e limites.** Produzir matriz de riscos com evidências, impacto e próxima ação.
  - **Situação auditada:** Concluída no escopo.
  - **Aceite:** Cada achado tem origem documental, código, leitura ao vivo ou hipótese claramente identificada.
  - **Constatação:** Achados têm fonte, impacto e ação proposta; limites de acesso estão explícitos.
  - **Evidências e referências:** `docs/AUDITORIA_PROJETO_INTERNO.md`.
  - **Próxima ação:** Atualizar achados se o escopo do comercial mudar.
  - **Dependências:** 003 (Concluída no escopo), 004 (Concluída no escopo), 005 (Concluída no escopo), 006 (Concluída no escopo), 007 (Concluída no escopo), 009 (Concluída no escopo).


## Fase 02 — Pesquisa de mercado e evidências de UX

**Responsável:** Pesquisa + UX · **Prioridade:** P0 · **Janela:** semanas 1–2.

**Articulação:** fase 01.

- [x] **011. Pesquisar compra corporativa de luxo.** Comparar os serviços corporativos de Smythson, Burberry e Tiffany.
  - **Situação auditada:** Concluída no escopo.
  - **Aceite:** Matriz cita fontes primárias e explica a aplicação ao contexto B2B brasileiro.
  - **Constatação:** Matriz histórica cita Smythson, Burberry e Tiffany e limita a aplicação ao contexto próprio.
  - **Evidências e referências:** `docs/ESTRATEGIA_E_PESQUISA.md`.
  - **Próxima ação:** Preservar referências e validar serviço próprio antes de prometer equivalência.

- [x] **012. Pesquisar personalização.** Examinar apresentação de gravação e escolhas de personalização na Montblanc.
  - **Situação auditada:** Concluída no escopo.
  - **Aceite:** Diretrizes distinguem inspiração de promessa operacional da Promo.
  - **Constatação:** Pesquisa documental de personalização está registrada com limites por produto.
  - **Evidências e referências:** `docs/ESTRATEGIA_E_PESQUISA.md`.
  - **Próxima ação:** Nenhuma ação para este critério de pesquisa documental.

- [x] **013. Pesquisar linguagem de produto.** Analisar narrativa de design e produto na Bang & Olufsen.
  - **Situação auditada:** Concluída no escopo.
  - **Aceite:** Decisões editoriais são apresentadas como interpretação, sem copiar identidade ou conteúdo.
  - **Constatação:** Direção de linguagem de produto está identificada como interpretação criativa.
  - **Evidências e referências:** `docs/ESTRATEGIA_E_PESQUISA.md`.
  - **Próxima ação:** Nenhuma ação para este critério de pesquisa documental.

- [x] **014. Pesquisar concorrência brasileira.** Inspecionar navegação, cotação e categorias na Luminati.
  - **Situação auditada:** Concluída no escopo.
  - **Aceite:** São registrados padrões observáveis e oportunidades de diferenciação sem números de desempenho inventados.
  - **Constatação:** Padrões observados na Luminati estão registrados sem métricas inventadas.
  - **Evidências e referências:** `docs/ESTRATEGIA_E_PESQUISA.md`.
  - **Próxima ação:** Nenhuma ação para este critério de pesquisa documental.

- [x] **015. Revisar pesquisa de luxo e usabilidade.** Confrontar recomendações de NN/g sobre luxo, clareza e atendimento.
  - **Situação auditada:** Concluída no escopo.
  - **Aceite:** Relatório conecta achados a navegação, leitura de conteúdo e contato consultivo.
  - **Constatação:** Referências NN/g estão ligadas a clareza, navegação e atendimento consultivo.
  - **Evidências e referências:** `docs/ESTRATEGIA_E_PESQUISA.md`.
  - **Próxima ação:** Nenhuma ação para este critério documental; teste de usuários segue separado.

- [x] **016. Revisar descoberta de produtos.** Aplicar pesquisa Baymard de busca, filtros e listas de produtos.
  - **Situação auditada:** Concluída no escopo.
  - **Aceite:** Critérios cobrem estado aplicado, zero resultados e informações comparáveis.
  - **Constatação:** Diretrizes de descoberta incluem filtros aplicados, vazio e comparação.
  - **Evidências e referências:** `docs/ESTRATEGIA_E_PESQUISA.md`.
  - **Próxima ação:** Validar implementação completa nas etapas 85–90.

- [x] **017. Revisar acessibilidade oficial.** Consultar WCAG 2.2, contraste, foco e tamanho de alvos.
  - **Situação auditada:** Concluída no escopo.
  - **Aceite:** Requisitos AA são diferenciados da meta interna mais confortável de 44 pixels.
  - **Constatação:** Documento diferencia AA e preferência interna de alvos de 44 pixels.
  - **Evidências e referências:** `docs/ESTRATEGIA_E_PESQUISA.md`.
  - **Próxima ação:** Executar auditorias específicas antes de declarar conformidade.

- [x] **018. Revisar desempenho oficial.** Consultar Google Web Vitals e distinguir laboratório de campo.
  - **Situação auditada:** Concluída no escopo.
  - **Aceite:** Metas LCP ≤2,5 s, INP ≤200 ms e CLS ≤0,1 usam percentil 75 e segmentação.
  - **Constatação:** Metas de Web Vitals distinguem p75 de campo e laboratório.
  - **Evidências e referências:** `docs/ESTRATEGIA_E_PESQUISA.md`.
  - **Próxima ação:** Medir campo somente com ambiente e amostra adequados.

- [x] **019. Revisar SEO e segurança de dados.** Consultar Google Search Central e documentação oficial Supabase.
  - **Situação auditada:** Concluída no escopo.
  - **Aceite:** Estratégia fundamenta URLs, renderização, RLS e projeção mínima de dados.
  - **Constatação:** Pesquisa histórica cita documentação oficial de URLs, renderização e RLS.
  - **Evidências e referências:** `docs/ESTRATEGIA_E_PESQUISA.md`.
  - **Próxima ação:** Aplicação e permissões reais continuam sujeitas aos gates próprios.

- [x] **020. Construir matriz de decisões.** Relacionar cada referência a uma decisão, um risco e uma validação.
  - **Situação auditada:** Concluída no escopo.
  - **Aceite:** Documento contém links, data de acesso e páginas indisponíveis sem fingir inspeção.
  - **Constatação:** Matriz inclui fontes, data e tentativas sem conteúdo suficiente.
  - **Evidências e referências:** `docs/ESTRATEGIA_E_PESQUISA.md`.
  - **Próxima ação:** Nenhuma ação para este critério documental.
  - **Dependências:** 011 (Concluída no escopo), 012 (Concluída no escopo), 013 (Concluída no escopo), 014 (Concluída no escopo), 015 (Concluída no escopo), 016 (Concluída no escopo), 017 (Concluída no escopo), 018 (Concluída no escopo), 019 (Concluída no escopo).


## Fase 03 — Posicionamento, descoberta e mensuração

**Responsável:** Estratégia + comercial · **Prioridade:** P0 · **Janela:** semanas 2–3.

**Articulação:** fase 01, fase 02.

- [x] **021. Definir hipótese de posicionamento.** Propor presentes com intenção, curadoria e cuidado como centro do valor.
  - **Situação auditada:** Concluída no escopo.
  - **Aceite:** Uma frase de posicionamento e limites de promessa estão documentados.
  - **Constatação:** Posicionamento está explicitamente tratado como hipótese e limita promessas.
  - **Evidências e referências:** `docs/ESTRATEGIA_E_PESQUISA.md`.
  - **Próxima ação:** Validar hipótese nas entrevistas e no piloto.
  - **Dependências:** 020 (Concluída no escopo).

- [ ] **022. Definir segmentos prioritários.** Separar RH, marketing, compras, agências e relacionamento executivo.
  - **Situação auditada:** Parcial.
  - **Aceite:** Cada segmento tem ocasião, ticket a investigar e contexto de decisão.
  - **Constatação:** Cinco segmentos hipotéticos estão descritos; faltam prioridade e ticket a investigar por segmento.
  - **Evidências e referências:** `docs/ESTRATEGIA_E_PESQUISA.md`.
  - **Próxima ação:** Completar contexto, faixa a investigar e prioridade comercial.
  - **Dependências:** 021 (Concluída no escopo).

- [ ] **023. Entrevistar compradores.** Realizar entrevistas sobre compras anteriores, dificuldades e critérios de aprovação.
  - **Situação auditada:** Sem entrega comprovada.
  - **Aceite:** Pelo menos seis entrevistas fornecem evidências, sem tratar personas hipotéticas como pesquisa.
  - **Constatação:** Nenhuma das seis entrevistas com compradores foi realizada ou anexada.
  - **Evidências e referências:** `docs/ESTRATEGIA_E_PESQUISA.md`.
  - **Próxima ação:** Recrutar compradores e registrar evidências e síntese.
  - **Dependências:** 022 (Parcial).

- [ ] **024. Entrevistar vendedores.** Identificar informações indispensáveis para transformar interesse em proposta.
  - **Situação auditada:** Sem entrega comprovada.
  - **Aceite:** Vendedores validam campos, objeções recorrentes e etapas de qualificação.
  - **Constatação:** Campos foram propostos tecnicamente sem validação de vendedores.
  - **Evidências e referências:** `docs/ESTRATEGIA_E_PESQUISA.md`.
  - **Próxima ação:** Entrevistar vendedores e aprovar campos e objeções.
  - **Dependências:** 005 (Concluída no escopo).

- [ ] **025. Mapear a jornada atual.** Descrever descoberta, seleção, briefing, orçamento, amostra, aprovação e entrega.
  - **Situação auditada:** Parcial.
  - **Aceite:** Mapa identifica pontos de espera, donos e falhas de contexto.
  - **Constatação:** Há jornada recomendada; não há mapa observado da operação com esperas e responsáveis.
  - **Evidências e referências:** `docs/ESTRATEGIA_E_PESQUISA.md`, `docs/ARQUITETURA_E_INTEGRACAO.md`.
  - **Próxima ação:** Mapear a jornada atual com compradores e vendedores.
  - **Dependências:** 023 (Sem entrega comprovada), 024 (Sem entrega comprovada).

- [ ] **026. Priorizar ocasiões.** Avaliar onboarding, reconhecimento, fim de ano, relacionamento e eventos.
  - **Situação auditada:** Parcial.
  - **Aceite:** Prioridade é aprovada usando demanda comercial e disponibilidade reais.
  - **Constatação:** Ocasiões aparecem no formulário, sem priorização por demanda e capacidade.
  - **Evidências e referências:** `src/components/Storefront.tsx`, `docs/ESTRATEGIA_E_PESQUISA.md`.
  - **Próxima ação:** Aprovar prioridade usando dados comerciais e disponibilidade.
  - **Dependências:** 025 (Parcial).

- [ ] **027. Definir oferta de entrada.** Selecionar um escopo inicial de produtos e serviços que a operação pode cumprir.
  - **Situação auditada:** Parcial.
  - **Aceite:** Critérios de inclusão excluem itens sem informações, imagem ou condições confiáveis.
  - **Constatação:** Oito peças formam uma amostra, sem oferta inicial homologada pela operação.
  - **Evidências e referências:** `src/lib/products.json`, `docs/ESTRATEGIA_E_PESQUISA.md`.
  - **Próxima ação:** Validar escopo de produtos e serviços entregáveis e exclusões.
  - **Dependências:** 026 (Parcial).

- [ ] **028. Definir métricas de negócio.** Estabelecer briefing qualificado, proposta emitida e receita como resultados do funil.
  - **Situação auditada:** Parcial.
  - **Aceite:** Cada KPI tem fórmula, fonte, janela, responsável e baseline ainda a medir.
  - **Constatação:** KPIs e fórmulas estão propostos; faltam fontes operacionais, janelas e donos.
  - **Evidências e referências:** `docs/ESTRATEGIA_E_PESQUISA.md`.
  - **Próxima ação:** Definir medição, responsáveis e baseline para cada KPI.
  - **Dependências:** 025 (Parcial).

- [ ] **029. Priorizar hipóteses de conversão.** Listar hipóteses de impacto para busca, preço e atendimento consultivo.
  - **Situação auditada:** Parcial.
  - **Aceite:** Backlog separa evidência de opinião e inclui método de avaliação.
  - **Constatação:** Existem recomendações de conversão, sem backlog de hipóteses priorizado e método por item.
  - **Evidências e referências:** `docs/ESTRATEGIA_E_PESQUISA.md`.
  - **Próxima ação:** Formalizar hipóteses com evidência, impacto esperado e método de avaliação.
  - **Dependências:** 028 (Parcial).

- [ ] **030. Validar o escopo do MVP.** Alinhar funcionalidades do primeiro lançamento com operação e capacidade.
  - **Situação auditada:** Parcial.
  - **Aceite:** PO e comercial aprovam uma lista de entrada e saída do MVP.
  - **Constatação:** MVP consultivo é recomendado, mas não há aceite documentado de PO e comercial.
  - **Evidências e referências:** `docs/ESTRATEGIA_E_PESQUISA.md`, `README.md`.
  - **Próxima ação:** Aprovar escopo de entrada e saída e responsáveis.
  - **Dependências:** 027 (Parcial), 029 (Parcial).


## Fase 04 — Identidade, direção de arte e voz

**Responsável:** Direção de arte + conteúdo · **Prioridade:** P0 · **Janela:** semanas 2–4.

**Articulação:** fase 02, fase 03.

- [x] **031. Propor a assinatura premium.** Criar aplicação de Promo Brindes com assinatura Premium Collection.
  - **Situação auditada:** Concluída no escopo.
  - **Aceite:** Marca conceitual mantém o nome existente e não pressupõe registro ou aprovação final.
  - **Constatação:** Assinatura Premium Collection é aplicada como conceito de marca.
  - **Evidências e referências:** `src/components/Storefront.tsx`, `docs/DESIGN_SYSTEM.md`.
  - **Próxima ação:** Nenhuma ação para a assinatura conceitual.
  - **Dependências:** 021 (Concluída no escopo).

- [x] **032. Definir paleta semântica.** Especificar obsidiana, champanhe, marfim e superfícies auxiliares.
  - **Situação auditada:** Concluída no escopo.
  - **Aceite:** Tokens CSS têm função definida e pares de contraste verificáveis.
  - **Constatação:** Cores centrais e funções visuais estão definidas em CSS e guia.
  - **Evidências e referências:** `src/app/globals.css`, `docs/DESIGN_SYSTEM.md`.
  - **Próxima ação:** Auditoria completa de contraste permanece na etapa 172.
  - **Dependências:** 031 (Concluída no escopo).

- [x] **033. Definir sistema tipográfico.** Combinar Cormorant Garamond em títulos e Manrope em interface.
  - **Situação auditada:** Concluída no escopo.
  - **Aceite:** Fontes são locais e pesos usados estão documentados.
  - **Constatação:** Famílias e seis imports de pesos/estilo locais estão definidos.
  - **Evidências e referências:** `src/app/layout.tsx`, `docs/DESIGN_SYSTEM.md`.
  - **Próxima ação:** Nenhuma ação para este critério de sistema tipográfico.
  - **Dependências:** 031 (Concluída no escopo).

- [x] **034. Definir voz editorial.** Escrever tom, vocabulário, mensagens de ação e expressões proibidas.
  - **Situação auditada:** Concluída no escopo.
  - **Aceite:** Guia privilegia clareza e evita superlativos, urgência e certificações sem evidência.
  - **Constatação:** Guia documenta voz, CTAs, limites e alegações a evitar.
  - **Evidências e referências:** `docs/DESIGN_SYSTEM.md`.
  - **Próxima ação:** Submeter voz final à validação de marca.
  - **Dependências:** 021 (Concluída no escopo).

- [x] **035. Definir gramática fotográfica.** Especificar iluminação, materiais, enquadramento e fundo por tipo de imagem.
  - **Situação auditada:** Concluída no escopo.
  - **Aceite:** Brief separa fotografia de produto e composição conceitual de campanha.
  - **Constatação:** Brief diferencia fotos fiéis ao SKU de composições conceituais.
  - **Evidências e referências:** `docs/DESIGN_SYSTEM.md`.
  - **Próxima ação:** Nenhuma ação para este critério de direção fotográfica.
  - **Dependências:** 011 (Concluída no escopo).

- [x] **036. Criar imagem conceitual principal.** Gerar composição exclusiva de caixa preta e presentes com detalhes champanhe.
  - **Situação auditada:** Concluída no escopo.
  - **Aceite:** Arquivo e prompt são preservados e a imagem não é atribuída a um SKU real.
  - **Constatação:** Hero WebP e prompt existem; interface identifica composição conceitual.
  - **Evidências e referências:** `public/images/hero-gifting.webp`, `docs/DESIGN_SYSTEM.md`.
  - **Próxima ação:** Manter identificação ao reutilizar a imagem.
  - **Dependências:** 035 (Concluída no escopo).

- [ ] **037. Definir direção para embalagens.** Desenhar opções de apresentação sujeitas a fornecedor e aprovação operacional.
  - **Situação auditada:** Parcial.
  - **Aceite:** Moodboard identifica acabamentos sugeridos e os ainda não disponíveis.
  - **Constatação:** Há referência conceitual de caixa e acabamentos, sem moodboard de opções disponíveis.
  - **Evidências e referências:** `docs/DESIGN_SYSTEM.md`.
  - **Próxima ação:** Produzir opções e validar materiais e disponibilidade com fornecedores.
  - **Dependências:** 035 (Concluída no escopo).

- [x] **038. Definir ícones e ornamentação.** Estabelecer família de ícones, espessura e uso limitado de detalhes decorativos.
  - **Situação auditada:** Concluída no escopo.
  - **Aceite:** Interface utiliza uma família coerente com nomes acessíveis nos controles.
  - **Constatação:** Interface usa Lucide com nomes acessíveis nos controles examinados.
  - **Evidências e referências:** `src/components/Storefront.tsx`.
  - **Próxima ação:** Nenhuma ação para a família de ícones desta prévia.
  - **Dependências:** 031 (Concluída no escopo).

- [ ] **039. Validar identidade com público.** Comparar duas direções com compradores do público prioritário.
  - **Situação auditada:** Sem entrega comprovada.
  - **Aceite:** Resultado registra percepção, confiança e compreensão sem perguntar só preferência estética.
  - **Constatação:** Não há comparação de duas direções com compradores.
  - **Evidências e referências:** `docs/ESTRATEGIA_E_PESQUISA.md`.
  - **Próxima ação:** Executar avaliação de compreensão, confiança e percepção.
  - **Dependências:** 031 (Concluída no escopo), 032 (Concluída no escopo), 033 (Concluída no escopo), 035 (Concluída no escopo).

- [ ] **040. Fechar guia de marca digital.** Documentar componentes, fotografia, voz e exemplos aprovados.
  - **Situação auditada:** Parcial.
  - **Aceite:** Guia passa pela marca e pelo comercial antes de aplicação definitiva.
  - **Constatação:** Guia conceitual existe; aprovação de marca e comercial não está registrada.
  - **Evidências e referências:** `docs/DESIGN_SYSTEM.md`.
  - **Próxima ação:** Consolidar exemplos aprovados após a etapa 39.
  - **Dependências:** 039 (Sem entrega comprovada).


## Fase 05 — Curadoria e qualidade do catálogo

**Responsável:** Conteúdo + dados + comercial · **Prioridade:** P0 · **Janela:** semanas 3–5.

**Articulação:** fase 01, fase 03.

- [ ] **041. Criar critérios da seleção premium.** Definir valor percebido, utilidade, acabamento e viabilidade como critérios.
  - **Situação auditada:** Parcial.
  - **Aceite:** Cada produto candidato recebe justificativa e status de validação comercial.
  - **Constatação:** Valor percebido e utilidade são diretrizes gerais; faltam fichas de avaliação por candidato.
  - **Evidências e referências:** `docs/ESTRATEGIA_E_PESQUISA.md`, `src/lib/products.json`.
  - **Próxima ação:** Pontuar cada produto e registrar validação comercial.
  - **Dependências:** 027 (Parcial).

- [x] **042. Selecionar peças iniciais reais.** Usar produtos identificáveis do catálogo para a prévia.
  - **Situação auditada:** Concluída no escopo.
  - **Aceite:** Oito produtos preservam IDs, SKUs e nomes técnicos de origem.
  - **Constatação:** Oito IDs, SKUs e nomes originais estão preservados e sincronizados.
  - **Evidências e referências:** `src/lib/products.json`, `docs/audit/plan-database-check.json`.
  - **Próxima ação:** Nenhuma ação para a seleção da amostra.
  - **Dependências:** 007 (Concluída no escopo).

- [ ] **043. Revisar materiais por SKU.** Comparar materiais estruturados com descrição e ficha do fornecedor.
  - **Situação auditada:** Parcial.
  - **Aceite:** Conflitos de couro, PET, plástico ou capacidade ficam resolvidos antes de publicação.
  - **Constatação:** Conflitos de materiais foram identificados; descrições ainda dependem de confirmação.
  - **Evidências e referências:** `docs/AUDITORIA_PROJETO_INTERNO.md`, `src/lib/products.json`.
  - **Próxima ação:** Resolver divergências com ficha e fornecedor por SKU.
  - **Dependências:** 042 (Concluída no escopo).

- [ ] **044. Revisar capacidades e dimensões.** Uniformizar ml, litros, centímetros e peso sem inventar especificações.
  - **Situação auditada:** Parcial.
  - **Aceite:** Produto, variante e imagem exibem a mesma capacidade e versão.
  - **Constatação:** Capacidades constam de textos de origem; não existe homologação de dimensões e variantes.
  - **Evidências e referências:** `src/lib/products.json`, `docs/AUDITORIA_PROJETO_INTERNO.md`.
  - **Próxima ação:** Normalizar unidades e confirmar versão de cada peça.
  - **Dependências:** 042 (Concluída no escopo).

- [ ] **045. Definir quantidades mínimas reais.** Distinguir mínimo comercial, embalagem múltipla e mínimo de personalização.
  - **Situação auditada:** Parcial.
  - **Aceite:** Contrato explicita cada restrição e o front valida combinações corretamente.
  - **Constatação:** Mínimo cadastrado é aplicado na UI; mínimos de gravação, embalagem e múltiplos não são modelados.
  - **Evidências e referências:** `src/lib/catalog.ts`, `src/components/Storefront.tsx`.
  - **Próxima ação:** Confirmar regras e implementar restrições combinadas.
  - **Dependências:** 042 (Concluída no escopo), 024 (Sem entrega comprovada).

- [ ] **046. Revalidar preços e faixas.** Conferir venda, quantidade, gravação, impostos, validade e frete.
  - **Situação auditada:** Parcial.
  - **Aceite:** Toda oferta pública informa sua base; preço sem contexto permanece sob consulta.
  - **Constatação:** A UI mantém valores sob consulta, mas não existe tabela de faixas e condições aprovada.
  - **Evidências e referências:** `src/components/Storefront.tsx`, `src/app/produtos/[slug]/page.tsx`.
  - **Próxima ação:** Validar composição, quantidade, impostos, frete e validade.
  - **Dependências:** 042 (Concluída no escopo), 024 (Sem entrega comprovada).

- [x] **047. Verificar mídia por amostragem.** Testar URLs principais e alternativas das peças escolhidas.
  - **Situação auditada:** Concluída no escopo.
  - **Aceite:** 403 das imagens principais e sucesso das alternativas ficam registrados sem generalizar ao catálogo inteiro.
  - **Constatação:** Amostra registra falha de mídia principal e alternativas disponíveis.
  - **Evidências e referências:** `docs/audit/media-check.json`.
  - **Próxima ação:** Nenhuma ação para a verificação histórica por amostragem.
  - **Dependências:** 007 (Concluída no escopo).

- [x] **048. Preparar ativos para a prévia.** Obter fotos reais pela alternativa já cadastrada e otimizar cópias locais.
  - **Situação auditada:** Concluída no escopo.
  - **Aceite:** Oito imagens locais carregam e correspondem aos respectivos SKUs.
  - **Constatação:** Oito fotos locais otimizadas estão presentes e carregam nos testes.
  - **Evidências e referências:** `public/images/`, `docs/audit/responsive-check.json`.
  - **Próxima ação:** Licenciamento comercial continua pendente na etapa 49.
  - **Dependências:** 047 (Concluída no escopo).

- [ ] **049. Obter direitos de publicação.** Validar autorização de uso das fotos, marcas de terceiros e evidências de sustentabilidade.
  - **Situação auditada:** Sem entrega comprovada.
  - **Aceite:** Registro de licenças e comprovações acompanha os ativos do lançamento.
  - **Constatação:** Não há registro de licenças de fotos, marcas ou comprovações de sustentabilidade.
  - **Evidências e referências:** `docs/DESIGN_SYSTEM.md`.
  - **Próxima ação:** Obter e anexar direitos e comprovações por ativo.
  - **Dependências:** 048 (Concluída no escopo).

- [ ] **050. Definir manutenção editorial.** Atribuir responsável por dados, imagens e expiração de coleções.
  - **Situação auditada:** Sem entrega comprovada.
  - **Aceite:** SLA interno e processo de retirada de conteúdo incorreto estão acordados.
  - **Constatação:** Não há responsável editorial nomeado nem SLA acordado de retirada.
  - **Evidências e referências:** `docs/ARQUITETURA_E_INTEGRACAO.md`.
  - **Próxima ação:** Designar responsáveis e aprovar revisão e retirada.
  - **Dependências:** 043 (Parcial), 044 (Parcial), 045 (Parcial), 046 (Parcial), 049 (Sem entrega comprovada).


## Fase 06 — Arquitetura de informação e jornadas

**Responsável:** UX + conteúdo · **Prioridade:** P0 · **Janela:** semanas 3–5.

**Articulação:** fase 03, fase 05.

- [x] **051. Projetar sitemap público.** Mapear início, coleções, produtos, projeto, conteúdo e páginas institucionais.
  - **Situação auditada:** Concluída no escopo.
  - **Aceite:** Sitemap diferencia rotas MVP, futuras e privadas.
  - **Constatação:** Mapa documenta rotas da prévia, futuras, estados locais e planejamento interno.
  - **Evidências e referências:** `docs/ARQUITETURA_INFORMACAO_E_FLUXOS.md`.
  - **Próxima ação:** Revisar mapa após aprovação do escopo comercial.
  - **Dependências:** 030 (Parcial).

- [ ] **052. Definir nomes de navegação.** Usar rótulos compreensíveis para compradores, com linguagem premium nos conteúdos.
  - **Situação auditada:** Parcial.
  - **Aceite:** Tree test confirma que usuários encontram categoria e pedido de orçamento.
  - **Constatação:** Rótulos de navegação existem, sem tree test com compradores.
  - **Evidências e referências:** `docs/ARQUITETURA_INFORMACAO_E_FLUXOS.md`, `src/components/Storefront.tsx`.
  - **Próxima ação:** Testar localização de categoria e orçamento.
  - **Dependências:** 051 (Concluída no escopo).

- [ ] **053. Definir taxonomia de ocasiões.** Relacionar cada ocasião a coleções e produtos elegíveis.
  - **Situação auditada:** Parcial.
  - **Aceite:** Uma ocasião não duplica o cadastro do produto nem altera seu SKU.
  - **Constatação:** Ocasiões são opções do briefing; relação de elegibilidade com produtos não existe.
  - **Evidências e referências:** `src/components/Storefront.tsx`, `docs/ARQUITETURA_INFORMACAO_E_FLUXOS.md`.
  - **Próxima ação:** Definir taxonomia e vínculos estáveis sem duplicar SKU.
  - **Dependências:** 026 (Parcial).

- [x] **054. Definir jornada sem cadastro.** Permitir explorar, favoritar e iniciar briefing antes de autenticação.
  - **Situação auditada:** Concluída no escopo.
  - **Aceite:** Roteiro de teste chega ao briefing sem conta obrigatória.
  - **Constatação:** Navegação, favoritos e briefing funcionam sem autenticação nos E2E.
  - **Evidências e referências:** `tests/storefront.spec.ts`, `docs/ARQUITETURA_INFORMACAO_E_FLUXOS.md`.
  - **Próxima ação:** Nenhuma ação para a jornada sem conta da prévia.
  - **Dependências:** 051 (Concluída no escopo).

- [x] **055. Definir fluxo de seleção.** Separar lista de interesse de pedido confirmado e reserva de estoque.
  - **Situação auditada:** Concluída no escopo.
  - **Aceite:** Textos e estados deixam clara a natureza consultiva de cada etapa.
  - **Constatação:** Textos separam seleção, intenção, proposta e reserva de estoque.
  - **Evidências e referências:** `src/components/Storefront.tsx`, `tests/storefront.spec.ts`.
  - **Próxima ação:** Manter distinção ao ativar a integração comercial.
  - **Dependências:** 054 (Concluída no escopo).

- [x] **056. Definir jornada de retorno.** Desenhar retomada de seleção, validade e dados que podem ser persistidos.
  - **Situação auditada:** Concluída no escopo.
  - **Aceite:** Política cobre dispositivo compartilhado, expiração e limpeza da seleção.
  - **Constatação:** Home e ficha permanente usam o mesmo envelope com savedAt; a validade e a limpeza preservam apenas IDs e quantidades.
  - **Evidências e referências:** `src/components/ProductDetailActions.tsx`, `src/lib/catalog.ts`, `docs/audit/plan-browser-scenarios.json`.
  - **Próxima ação:** Manter o teste de expiração entre rotas ao alterar o armazenamento local.
  - **Dependências:** 055 (Concluída no escopo).

- [ ] **057. Definir jornada móvel.** Priorizar busca, seleção e briefing em telas pequenas.
  - **Situação auditada:** Parcial.
  - **Aceite:** Protótipo cobre 360 pixels e teclado virtual sem perder ações principais.
  - **Constatação:** Há testes móveis em Chromium; teclado virtual real não foi exercitado.
  - **Evidências e referências:** `tests/storefront.spec.ts`, `docs/audit/responsive-check.json`.
  - **Próxima ação:** Validar preenchimento e ações com teclado virtual em aparelhos reais.
  - **Dependências:** 054 (Concluída no escopo).

- [ ] **058. Definir estados excepcionais.** Mapear vazio, erro, offline, SKU removido e conteúdo expirado.
  - **Situação auditada:** Parcial.
  - **Aceite:** Cada estado tem mensagem útil e caminho de recuperação.
  - **Constatação:** Vazio, armazenamento inválido, indisponibilidade da API, offline e SKU removido têm mensagem e recuperação sem perder a seleção; expiração de conteúdo canônico ainda não está completa.
  - **Evidências e referências:** `docs/ARQUITETURA_INFORMACAO_E_FLUXOS.md`, `src/components/Storefront.tsx`, `src/lib/site-database.ts`, `tests/storefront.spec.ts`.
  - **Próxima ação:** Definir e testar expiração da curadoria publicada.
  - **Dependências:** 054 (Concluída no escopo).

- [ ] **059. Validar arquitetura com compradores.** Aplicar teste de árvore ou tarefas de localização no sitemap.
  - **Situação auditada:** Sem entrega comprovada.
  - **Aceite:** Resultados documentam sucesso por tarefa e mudanças necessárias.
  - **Constatação:** Não há teste de árvore ou localização com compradores.
  - **Evidências e referências:** `docs/ARQUITETURA_INFORMACAO_E_FLUXOS.md`.
  - **Próxima ação:** Executar tarefas e registrar taxa de sucesso e alterações.
  - **Dependências:** 052 (Parcial), 053 (Parcial).

- [ ] **060. Documentar fluxos aprovados.** Produzir wireflows que liguem ações públicas ao atendimento comercial.
  - **Situação auditada:** Parcial.
  - **Aceite:** Cada transição tem entrada, saída, erro e responsável.
  - **Constatação:** Fluxos da prévia estão escritos; faltam wireflows aprovados com dono e erro por transição.
  - **Evidências e referências:** `docs/ARQUITETURA_INFORMACAO_E_FLUXOS.md`, `docs/ARQUITETURA_E_INTEGRACAO.md`.
  - **Próxima ação:** Completar fluxos integrados e aprová-los com comercial.
  - **Dependências:** 059 (Sem entrega comprovada).


## Fase 07 — Sistema de design e componentes

**Responsável:** Design de produto + frontend · **Prioridade:** P0 · **Janela:** semanas 4–6.

**Articulação:** fase 04, fase 06.

- [ ] **061. Implementar tokens de interface.** Codificar cores, tipografia, espaçamento, bordas e superfícies.
  - **Situação auditada:** Parcial.
  - **Aceite:** Tokens usados na prévia estão centralizados e nomeados por função.
  - **Constatação:** Cores e fontes usam variáveis; espaçamento, bordas e raios permanecem majoritariamente literais.
  - **Evidências e referências:** `src/app/globals.css`, `docs/DESIGN_SYSTEM.md`.
  - **Próxima ação:** Completar tokens semânticos e aplicar nos componentes.
  - **Dependências:** 032 (Concluída no escopo), 033 (Concluída no escopo).

- [x] **062. Definir grade responsiva.** Construir limites de largura, margens e quebra de colunas.
  - **Situação auditada:** Concluída no escopo.
  - **Aceite:** Sem rolagem horizontal em 360, 390, 768 e 1440 pixels.
  - **Constatação:** Evidência de 360, 390, 768 e 1440 pixels sem overflow está preservada.
  - **Evidências e referências:** `docs/audit/responsive-check.json`, `tests/storefront.spec.ts`.
  - **Próxima ação:** Repetir ao alterar layouts; não equivale a QA de todos os navegadores.
  - **Dependências:** 061 (Parcial).

- [x] **063. Implementar botões e links.** Criar ações primárias, secundárias e ícones com hierarquia consistente.
  - **Situação auditada:** Concluída no escopo.
  - **Aceite:** Hover, foco, disabled e nomes acessíveis ficam inspecionados.
  - **Constatação:** Estados de hover, foco, disabled e nomes estão presentes e cobertos nos controles principais.
  - **Evidências e referências:** `src/app/globals.css`, `tests/storefront.spec.ts`.
  - **Próxima ação:** Manter revisão de novos controles.
  - **Dependências:** 061 (Parcial).

- [x] **064. Implementar cartão de produto.** Combinar imagem, categoria, título, favorito e adicionar à seleção.
  - **Situação auditada:** Concluída no escopo.
  - **Aceite:** Ações são independentes, acessíveis e não abrem destinos inesperados.
  - **Constatação:** Card separa detalhe, favorito e seleção; E2E exercitam ações.
  - **Evidências e referências:** `src/components/Storefront.tsx`, `tests/storefront.spec.ts`.
  - **Próxima ação:** Nenhuma ação para o card da prévia.
  - **Dependências:** 042 (Concluída no escopo), 061 (Parcial).

- [x] **065. Implementar diálogos acessíveis.** Usar modal com Escape, contenção de foco e restauração do foco.
  - **Situação auditada:** Concluída no escopo.
  - **Aceite:** Testes de teclado comprovam abertura, fechamento e retorno ao acionador.
  - **Constatação:** Diálogo contém foco e restaura acionador nos casos exercitados.
  - **Evidências e referências:** `src/components/Modal.tsx`, `tests/storefront.spec.ts`.
  - **Próxima ação:** Ampliar cobertura de tecnologias assistivas nas etapas 173–180.
  - **Dependências:** 061 (Parcial).

- [x] **066. Implementar controles de formulário.** Padronizar labels, ajuda, validação e estados de campos.
  - **Situação auditada:** Concluída no escopo.
  - **Aceite:** Erros podem ser identificados sem depender apenas de cor.
  - **Constatação:** Labels, obrigatoriedade e validação nativa identificam erros sem depender só de cor.
  - **Evidências e referências:** `src/components/Storefront.tsx`, `tests/storefront.spec.ts`.
  - **Próxima ação:** Validação com leitor de tela permanece na etapa 177.
  - **Dependências:** 061 (Parcial).

- [x] **067. Implementar feedback de interação.** Adicionar mensagens de adição e estados de download.
  - **Situação auditada:** Concluída no escopo.
  - **Aceite:** Feedback é anunciado por tecnologia assistiva sem capturar foco.
  - **Constatação:** Toast usa região de status e feedback não captura foco.
  - **Evidências e referências:** `src/components/Storefront.tsx`, `tests/storefront.spec.ts`.
  - **Próxima ação:** Validar anúncios com leitores reais antes do lançamento.
  - **Dependências:** 061 (Parcial).

- [x] **068. Especificar movimento.** Limitar animações a feedback e transições discretas.
  - **Situação auditada:** Concluída no escopo.
  - **Aceite:** Preferência de movimento reduzido desativa transições e rolagem suave.
  - **Constatação:** CSS e scrollIntoView consultam prefers-reduced-motion; a rolagem explícita passa a ser instantânea quando necessário.
  - **Evidências e referências:** `src/app/globals.css`, `src/components/Storefront.tsx`, `docs/audit/plan-browser-scenarios.json`.
  - **Próxima ação:** Reexecutar a sonda de movimento ao criar novas transições controladas por JavaScript.
  - **Dependências:** 061 (Parcial).

- [ ] **069. Catalogar componentes.** Criar documentação de variantes, exemplos e decisões de uso.
  - **Situação auditada:** Parcial.
  - **Aceite:** Biblioteca permite reproduzir todas as páginas MVP sem improvisos.
  - **Constatação:** Inventário descritivo existe; faltam exemplos reproduzíveis e variantes completas da biblioteca.
  - **Evidências e referências:** `docs/ARQUITETURA_INFORMACAO_E_FLUXOS.md`, `docs/DESIGN_SYSTEM.md`.
  - **Próxima ação:** Documentar estados e exemplos de todos os templates e componentes.
  - **Dependências:** 061 (Parcial), 062 (Concluída no escopo), 063 (Concluída no escopo), 064 (Concluída no escopo), 065 (Concluída no escopo), 066 (Concluída no escopo), 067 (Concluída no escopo), 068 (Concluída no escopo).

- [ ] **070. Revisar consistência transversal.** Inspecionar tipografia, densidade, ícones e espaçamento entre páginas.
  - **Situação auditada:** Parcial.
  - **Aceite:** Desvios do sistema de design são corrigidos ou justificados.
  - **Constatação:** Há revisão e capturas de algumas telas; não há inventário transversal de desvios da revisão atual.
  - **Evidências e referências:** `docs/VALIDACAO.md`, `docs/DESIGN_SYSTEM.md`.
  - **Próxima ação:** Comparar todas as rotas e estados com o sistema visual.
  - **Dependências:** 069 (Parcial).


## Fase 08 — Página inicial e narrativa de marca

**Responsável:** Design + frontend + conteúdo · **Prioridade:** P0 · **Janela:** semanas 4–6.

**Articulação:** fase 04, fase 05, fase 07.

- [x] **071. Construir cabeçalho público.** Organizar marca, navegação, busca e seleção em desktop e mobile.
  - **Situação auditada:** Concluída no escopo.
  - **Aceite:** Todos os destinos e controles realizam a ação indicada.
  - **Constatação:** Cabeçalho e menu executam navegação, busca, favoritos e seleção na prévia.
  - **Evidências e referências:** `src/components/Storefront.tsx`, `tests/storefront.spec.ts`.
  - **Próxima ação:** Nenhuma ação para o cabeçalho no escopo atual.
  - **Dependências:** 063 (Concluída no escopo).

- [x] **072. Construir hero editorial.** Aplicar conceito visual preto e champanhe com proposta clara.
  - **Situação auditada:** Concluída no escopo.
  - **Aceite:** Título legível, imagem principal priorizada e CTA visível em telas testadas.
  - **Constatação:** Hero prioriza imagem, mantém título e CTAs e tem evidência responsiva.
  - **Evidências e referências:** `src/components/Storefront.tsx`, `docs/audit/responsive-check.json`.
  - **Próxima ação:** Desempenho global permanece separado da implementação visual.
  - **Dependências:** 036 (Concluída no escopo), 061 (Parcial).

- [x] **073. Construir proposta de valor.** Apresentar curadoria, identidade e projeto sem promessas operacionais não verificadas.
  - **Situação auditada:** Concluída no escopo.
  - **Aceite:** Textos da faixa de valor são sustentáveis pelo serviço proposto.
  - **Constatação:** Proposta de valor é apresentada sem selos, números ou garantias operacionais inventadas.
  - **Evidências e referências:** `src/components/Storefront.tsx`.
  - **Próxima ação:** Aprovar promessa de serviço com operação.
  - **Dependências:** 021 (Concluída no escopo).

- [x] **074. Construir curadoria em destaque.** Exibir seleção curta com continuidade para mais produtos.
  - **Situação auditada:** Concluída no escopo.
  - **Aceite:** Quatro peças iniciais e expansão para oito funcionam na prévia.
  - **Constatação:** Curadoria expande de quatro para oito peças locais.
  - **Evidências e referências:** `src/components/Storefront.tsx`, `tests/storefront.spec.ts`.
  - **Próxima ação:** Integração dinâmica permanece nas etapas 127–128.
  - **Dependências:** 042 (Concluída no escopo), 048 (Concluída no escopo), 064 (Concluída no escopo).

- [x] **075. Construir coleções editoriais.** Criar entradas por contexto de presente com imagens e narrativa.
  - **Situação auditada:** Concluída no escopo.
  - **Aceite:** Cliques conduzem à seleção correspondente com filtro aplicado.
  - **Constatação:** Coleções acionam categorias correspondentes mantendo IDs.
  - **Evidências e referências:** `src/components/Storefront.tsx`.
  - **Próxima ação:** Taxonomia real por ocasião permanece na etapa 53.
  - **Dependências:** 042 (Concluída no escopo), 048 (Concluída no escopo).

- [x] **076. Construir seção de personalização.** Explicar peça, identidade e apresentação com fotografia e texto.
  - **Situação auditada:** Concluída no escopo.
  - **Aceite:** Limitações por produto ficam visíveis e não há promessa universal de técnica.
  - **Constatação:** Seção explica possibilidades e informa consulta por peça.
  - **Evidências e referências:** `src/components/Storefront.tsx`.
  - **Próxima ação:** Conteúdo técnico por produto permanece na etapa 98.
  - **Dependências:** 035 (Concluída no escopo).

- [ ] **077. Construir explicação do processo.** Mostrar como seleção e briefing avançam para proposta comercial.
  - **Situação auditada:** Parcial.
  - **Aceite:** Comprador consegue descrever o próximo passo após ler a seção.
  - **Constatação:** Seção de três passos existe; compreensão do próximo passo não foi testada com compradores.
  - **Evidências e referências:** `src/components/Storefront.tsx`.
  - **Próxima ação:** Executar teste de compreensão sem orientação.
  - **Dependências:** 021 (Concluída no escopo).

- [x] **078. Construir perguntas frequentes.** Responder mínimo, prazo, personalização e kits.
  - **Situação auditada:** Concluída no escopo.
  - **Aceite:** Acordeões funcionam por teclado e respostas refletem condições a confirmar.
  - **Constatação:** FAQ usa details/summary nativos e respostas condicionam condições comerciais.
  - **Evidências e referências:** `src/components/Storefront.tsx`.
  - **Próxima ação:** Nenhuma ação para a FAQ da prévia.
  - **Dependências:** 021 (Concluída no escopo).

- [x] **079. Construir encerramento e rodapé.** Reforçar a ação de projeto, navegação e privacidade.
  - **Situação auditada:** Concluída no escopo.
  - **Aceite:** Nenhum contato fictício, selo sem prova ou link vazio é exibido.
  - **Constatação:** Rodapé tem destinos reais e privacidade sem contatos fictícios.
  - **Evidências e referências:** `src/components/Storefront.tsx`.
  - **Próxima ação:** Adicionar contatos somente após definição comercial.
  - **Dependências:** 071 (Concluída no escopo).

- [ ] **080. Validar home com usuários.** Observar compreensão de oferta e primeiro caminho escolhido.
  - **Situação auditada:** Sem entrega comprovada.
  - **Aceite:** Cinco compradores completam tarefa sem explicação prévia do moderador.
  - **Constatação:** Não houve teste da home com cinco compradores.
  - **Evidências e referências:** `docs/ESTRATEGIA_E_PESQUISA.md`.
  - **Próxima ação:** Executar tarefas e registrar compreensão e caminhos escolhidos.
  - **Dependências:** 071 (Concluída no escopo), 072 (Concluída no escopo), 073 (Concluída no escopo), 074 (Concluída no escopo), 075 (Concluída no escopo), 076 (Concluída no escopo), 077 (Parcial), 078 (Concluída no escopo), 079 (Concluída no escopo).


## Fase 09 — Busca, filtros e descoberta

**Responsável:** UX + frontend + backend · **Prioridade:** P0 · **Janela:** semanas 5–7.

**Articulação:** fase 05, fase 06, fase 07.

- [x] **081. Implementar busca da seleção.** Permitir buscar nome, SKU e categoria com normalização de acentos.
  - **Situação auditada:** Concluída no escopo.
  - **Aceite:** Busca de caderno, código válido e consulta sem resultados são testadas.
  - **Constatação:** Busca normaliza acentos e encontra nome, SKU e categoria na amostra.
  - **Evidências e referências:** `src/lib/catalog.ts`, `tests/storefront.spec.ts`.
  - **Próxima ação:** Relevância de catálogo amplo permanece na etapa 90.
  - **Dependências:** 042 (Concluída no escopo).

- [x] **082. Implementar categorias iniciais.** Filtrar a seleção por kits, escrita, lifestyle e viagem.
  - **Situação auditada:** Concluída no escopo.
  - **Aceite:** Filtro ativo e listagem mantêm correspondência sem itens de outra categoria.
  - **Constatação:** Categorias filtram a amostra e indicam estado ativo.
  - **Evidências e referências:** `src/components/Storefront.tsx`, `tests/storefront.spec.ts`.
  - **Próxima ação:** Nenhuma ação para filtros simples existentes.
  - **Dependências:** 042 (Concluída no escopo).

- [x] **083. Implementar favoritos locais.** Salvar identificadores válidos e oferecer listagem de favoritos.
  - **Situação auditada:** Concluída no escopo.
  - **Aceite:** Favorito persiste após recarregar e armazenamento corrompido não quebra a página.
  - **Constatação:** Favoritos válidos persistem e entradas corrompidas são descartadas.
  - **Evidências e referências:** `tests/storefront.spec.ts`, `src/lib/catalog.ts`.
  - **Próxima ação:** Definir política de retenção antes de ampliar persistência.
  - **Dependências:** 064 (Concluída no escopo).

- [x] **084. Implementar estados sem resultados.** Explicar busca vazia e oferecer recuperação de filtros.
  - **Situação auditada:** Concluída no escopo.
  - **Aceite:** Usuário pode voltar à seleção completa em uma ação.
  - **Constatação:** Estado vazio oferece limpeza de filtros em uma ação.
  - **Evidências e referências:** `src/components/Storefront.tsx`, `tests/storefront.spec.ts`.
  - **Próxima ação:** Correção da URL ao limpar a barra de busca pertence à etapa 88.
  - **Dependências:** 081 (Concluída no escopo).

- [ ] **085. Projetar filtros comerciais reais.** Incluir material, faixa de investimento, prazo e mínimo conforme dados aprovados.
  - **Situação auditada:** Sem entrega comprovada.
  - **Aceite:** Filtros usam atributos confiáveis e não prometem estoque ou prazo inexistentes.
  - **Constatação:** Não existem filtros de material, investimento, prazo ou mínimo.
  - **Evidências e referências:** `src/components/Storefront.tsx`, `src/lib/products.json`.
  - **Próxima ação:** Homologar atributos e implementar filtros úteis.
  - **Dependências:** 045 (Parcial), 046 (Parcial).

- [ ] **086. Implementar facetas combináveis.** Permitir múltiplas escolhas por atributo e indicar quantidade de resultados.
  - **Situação auditada:** Sem entrega comprovada.
  - **Aceite:** Semântica OR no grupo e AND entre grupos é validada no contrato.
  - **Constatação:** Não há multisseleção de facetas nem semântica OR/AND contratada.
  - **Evidências e referências:** `src/components/Storefront.tsx`, `docs/CONTRATO_CATALOGO_PUBLICO_V1.md`.
  - **Próxima ação:** Implementar facetas e contagens após aprovação dos atributos.
  - **Dependências:** 085 (Sem entrega comprovada).

- [x] **087. Implementar ordenação pública.** Ordenar por critérios úteis com desempate determinístico.
  - **Situação auditada:** Concluída no escopo.
  - **Aceite:** Paginação não repete nem perde produtos ao mudar ordenação.
  - **Constatação:** A interface oferece curadoria ou nome, preserva a escolha na URL e a fonte usa ID como desempate determinístico.
  - **Evidências e referências:** `src/components/Storefront.tsx`, `src/lib/site-database.ts`, `tests/public-api.spec.ts`.
  - **Próxima ação:** Manter casos de empate quando houver ampliação de catálogo.
  - **Dependências:** 126 (Parcial).

- [x] **088. Implementar URLs de busca.** Manter consulta, filtros e página ao compartilhar ou usar voltar.
  - **Situação auditada:** Concluída no escopo.
  - **Aceite:** Navegação e política de indexação tratam parâmetros consistentemente.
  - **Constatação:** Busca, categoria, página e ordenação sincronizam URL; popstate restaura a consulta e respostas antigas não sobrescrevem o filtro mais recente.
  - **Evidências e referências:** `src/components/Storefront.tsx`, `docs/audit/plan-browser-scenarios.json`, `tests/storefront.spec.ts`.
  - **Próxima ação:** Incluir facetas futuras no mesmo contrato de URL.
  - **Dependências:** 086 (Sem entrega comprovada).

- [x] **089. Implementar paginação de servidor.** Buscar apenas o conjunto necessário com cancelamento e limites.
  - **Situação auditada:** Concluída no escopo.
  - **Aceite:** Nenhuma jornada pública baixa milhares de registros para filtrar no cliente.
  - **Constatação:** A fonte aplica filtro, ordenação, contagem e offset antes de devolver uma página; uma página acima do total é normalizada para a última página publicada.
  - **Evidências e referências:** `src/app/api/catalog/route.ts`, `src/lib/site-database.ts`, `docs/audit/plan-scenarios.json`.
  - **Próxima ação:** Monitorar a contagem e manter o limite de 24 ao ampliar a curadoria.
  - **Dependências:** 127 (Concluída no escopo).

- [ ] **090. Testar relevância da descoberta.** Avaliar consultas reais, abreviações e sinônimos do comercial.
  - **Situação auditada:** Sem entrega comprovada.
  - **Aceite:** Conjunto de referência tem ranking esperado e métricas de acerto.
  - **Constatação:** Não há conjunto de consultas reais, sinônimos e ranking esperado.
  - **Evidências e referências:** `docs/ESTRATEGIA_E_PESQUISA.md`.
  - **Próxima ação:** Construir referência com comercial e medir acerto.
  - **Dependências:** 081 (Concluída no escopo), 086 (Sem entrega comprovada), 087 (Concluída no escopo), 088 (Concluída no escopo), 089 (Concluída no escopo).


## Fase 10 — Página de produto e confiança

**Responsável:** UX + conteúdo + frontend · **Prioridade:** P0 · **Janela:** semanas 5–7.

**Articulação:** fase 05, fase 07, fase 09.

- [x] **091. Construir detalhe rápido.** Exibir fotografia, descrição, SKU, mínimo e inclusão no projeto.
  - **Situação auditada:** Concluída no escopo.
  - **Aceite:** As oito peças da prévia têm dados de origem e modal funcional.
  - **Constatação:** Detalhes rápidos das oito peças incluem foto, SKU, descrição e mínimo.
  - **Evidências e referências:** `src/components/Storefront.tsx`, `tests/storefront.spec.ts`.
  - **Próxima ação:** Dados comerciais revisados dependem das etapas 43–46.
  - **Dependências:** 042 (Concluída no escopo), 048 (Concluída no escopo).

- [x] **092. Construir páginas permanentes.** Criar rota indexável por slug com ID canônico estável.
  - **Situação auditada:** Concluída no escopo.
  - **Aceite:** Link direto e navegação sem JavaScript preservam conteúdo principal.
  - **Constatação:** Rotas por slug entregam conteúdo e links no HTML inicial; noindex da prévia é intencional.
  - **Evidências e referências:** `src/app/produtos/[slug]/page.tsx`, `tests/public-api.spec.ts`.
  - **Próxima ação:** Conectar fichas à fonte publicada antes da abertura comercial.
  - **Dependências:** 091 (Concluída no escopo), 126 (Parcial).

- [ ] **093. Construir galeria fiel ao SKU.** Reunir ângulos, detalhes, escala e embalagem real.
  - **Situação auditada:** Parcial.
  - **Aceite:** Imagens não misturam variantes ou sugerem componentes não inclusos.
  - **Constatação:** Há uma foto por SKU; não existe galeria de ângulos, escala e embalagem homologada.
  - **Evidências e referências:** `src/lib/products.json`, `src/app/produtos/[slug]/page.tsx`.
  - **Próxima ação:** Obter mídia autorizada e construir galeria fiel.
  - **Dependências:** 049 (Sem entrega comprovada).

- [ ] **094. Exibir variantes confirmadas.** Oferecer apenas cores e tamanhos existentes para a peça.
  - **Situação auditada:** Sem entrega comprovada.
  - **Aceite:** Seleção de variante atualiza imagem, SKU e condições de disponibilidade.
  - **Constatação:** Modelo e UI não oferecem variantes de cor/tamanho com SKU e disponibilidade.
  - **Evidências e referências:** `src/lib/products.json`, `src/app/produtos/[slug]/page.tsx`.
  - **Próxima ação:** Homologar variantes e implementar seleção sincronizada.
  - **Dependências:** 124 (Parcial).

- [ ] **095. Exibir informação técnica revisada.** Organizar materiais, medidas, capacidade e itens inclusos.
  - **Situação auditada:** Parcial.
  - **Aceite:** Conteúdo coincide com ficha validada e resolve ambiguidades da importação.
  - **Constatação:** Descrições de origem são exibidas sem quadro técnico revisado por SKU.
  - **Evidências e referências:** `src/lib/products.json`, `src/app/produtos/[slug]/page.tsx`.
  - **Próxima ação:** Aprovar materiais, medidas e inclusões e estruturar apresentação.
  - **Dependências:** 043 (Parcial), 044 (Parcial).

- [ ] **096. Explicar condições de preço.** Diferenciar item, personalização, embalagem, frete e impostos.
  - **Situação auditada:** Parcial.
  - **Aceite:** Qualquer preço de entrada tem quantidade de referência e validade explícitas.
  - **Constatação:** Valores estão sob consulta e FAQ cita fatores; preço contextual por produto não está definido.
  - **Evidências e referências:** `src/components/Storefront.tsx`, `src/app/produtos/[slug]/page.tsx`.
  - **Próxima ação:** Validar condições e apresentá-las junto da oferta quando houver preço.
  - **Dependências:** 046 (Parcial).

- [ ] **097. Explicar prazo e disponibilidade.** Mostrar estimativas condicionadas às etapas reais de produção.
  - **Situação auditada:** Parcial.
  - **Aceite:** Consulta de estoque não é apresentada como reserva garantida.
  - **Constatação:** Aviso impede promessa de estoque, mas não há consulta nem estimativa por etapas reais.
  - **Evidências e referências:** `src/app/produtos/[slug]/page.tsx`, `docs/ARQUITETURA_E_INTEGRACAO.md`.
  - **Próxima ação:** Implementar disponibilidade e prazos confirmáveis com a operação.
  - **Dependências:** 124 (Parcial).

- [ ] **098. Criar conteúdo de personalização por peça.** Relacionar técnica, local de gravação e limites aplicáveis.
  - **Situação auditada:** Parcial.
  - **Aceite:** Informações são consistentes com áreas e técnicas aprovadas no sistema.
  - **Constatação:** Apenas booleano personalizable e texto genérico; técnicas e áreas por peça estão ausentes.
  - **Evidências e referências:** `src/lib/products.json`, `src/app/produtos/[slug]/page.tsx`.
  - **Próxima ação:** Vincular técnicas, áreas e limites homologados por SKU.
  - **Dependências:** 101 (Parcial).

- [ ] **099. Criar recomendação contextual.** Sugerir complementos ou alternativas compatíveis com ocasião e faixa.
  - **Situação auditada:** Sem entrega comprovada.
  - **Aceite:** Sem recomendação de itens inativos, indisponíveis ou não validados.
  - **Constatação:** Não há recomendação contextual de complementos ou alternativas.
  - **Evidências e referências:** `src/components/Storefront.tsx`, `src/app/produtos/[slug]/page.tsx`.
  - **Próxima ação:** Implementar regras sobre catálogo aprovado e elegibilidade.
  - **Dependências:** 053 (Parcial), 127 (Concluída no escopo).

- [ ] **100. Validar decisão de produto.** Testar se comprador entende inclusões, mínimo e próxima ação.
  - **Situação auditada:** Sem entrega comprovada.
  - **Aceite:** Dúvidas críticas são resolvidas antes de enviar briefing.
  - **Constatação:** Não existe teste de decisão de produto com compradores.
  - **Evidências e referências:** `docs/ESTRATEGIA_E_PESQUISA.md`.
  - **Próxima ação:** Validar compreensão de inclusões, mínimo e próxima ação.
  - **Dependências:** 092 (Concluída no escopo), 093 (Parcial), 094 (Sem entrega comprovada), 095 (Parcial), 096 (Parcial), 097 (Parcial), 098 (Parcial), 099 (Sem entrega comprovada).


## Fase 11 — Personalização e montagem de kits

**Responsável:** Produto + operação + frontend · **Prioridade:** P1 · **Janela:** semanas 6–8.

**Articulação:** fase 10, fase 13.

- [ ] **101. Mapear técnicas disponíveis.** Relacionar técnicas e áreas reais ao catálogo público aprovado.
  - **Situação auditada:** Parcial.
  - **Aceite:** Não há enumeração de técnica universal sem elegibilidade por produto.
  - **Constatação:** Auditoria interna localiza recursos de personalização; vitrine não mapeia técnicas e áreas.
  - **Evidências e referências:** `docs/AUDITORIA_PROJETO_INTERNO.md`, `src/lib/products.json`.
  - **Próxima ação:** Inspecionar dados autorizados e publicar elegibilidade por produto.
  - **Dependências:** 123 (Parcial), 124 (Parcial).

- [ ] **102. Projetar escolha de gravação.** Desenhar seleção de posição, técnica, cores e observações.
  - **Situação auditada:** Sem entrega comprovada.
  - **Aceite:** Fluxo mantém dependências claras e previne combinações inválidas.
  - **Constatação:** UI não permite escolher posição, técnica ou cores de gravação.
  - **Evidências e referências:** `src/components/Storefront.tsx`.
  - **Próxima ação:** Desenhar e implementar combinações válidas.
  - **Dependências:** 101 (Parcial).

- [ ] **103. Definir envio de logotipo.** Especificar tipos permitidos, tamanho máximo, retenção e acesso.
  - **Situação auditada:** Parcial.
  - **Aceite:** Contrato exige validação de conteúdo e armazenamento privado.
  - **Constatação:** Arquitetura exige storage privado e validação; tipos, tamanho e retenção não estão fechados.
  - **Evidências e referências:** `docs/ARQUITETURA_E_INTEGRACAO.md`, `docs/MODELO_DE_AMEACAS_PREVIA.md`.
  - **Próxima ação:** Especificar limites, validação de conteúdo, retenção e acesso.
  - **Dependências:** 141 (Parcial).

- [ ] **104. Implementar upload seguro.** Receber arquivo pelo backend autorizado com verificação adequada.
  - **Situação auditada:** Sem entrega comprovada.
  - **Aceite:** Arquivo inválido, excessivo ou sem autorização é rejeitado e registrado sem conteúdo sensível.
  - **Constatação:** Não há endpoint, storage ou UI de upload.
  - **Evidências e referências:** `docs/MODELO_DE_AMEACAS_PREVIA.md`.
  - **Próxima ação:** Implementar upload validado após contrato e autorização de acesso.
  - **Dependências:** 103 (Parcial), 145 (Sem entrega comprovada).

- [ ] **105. Distinguir simulação de prova final.** Identificar visualização como aproximada e prever aprovação de arte.
  - **Situação auditada:** Sem entrega comprovada.
  - **Aceite:** Nenhum preview é tratado como ordem de produção automaticamente.
  - **Constatação:** Não existe simulação de arte nem fluxo de prova final; imagem de campanha não é esse recurso.
  - **Evidências e referências:** `src/components/Storefront.tsx`, `docs/ARQUITETURA_E_INTEGRACAO.md`.
  - **Próxima ação:** Projetar aviso e aprovação versionada da arte.
  - **Dependências:** 102 (Sem entrega comprovada).

- [ ] **106. Definir composição de kits.** Mapear componentes, quantidades, embalagem e compatibilidade.
  - **Situação auditada:** Sem entrega comprovada.
  - **Aceite:** Um kit preserva IDs de todos os componentes e regras de múltiplos.
  - **Constatação:** Seleção de peças não modela kit, componentes, múltiplos e compatibilidade.
  - **Evidências e referências:** `src/lib/catalog.ts`, `docs/ARQUITETURA_E_INTEGRACAO.md`.
  - **Próxima ação:** Definir composição estruturada com regras aprovadas.
  - **Dependências:** 101 (Parcial).

- [ ] **107. Definir apresentação do kit.** Oferecer embalagens de acordo com capacidade e disponibilidade.
  - **Situação auditada:** Sem entrega comprovada.
  - **Aceite:** Dimensões e inclusão da embalagem são confirmadas no orçamento.
  - **Constatação:** Embalagem só aparece como intenção em texto livre.
  - **Evidências e referências:** `src/components/Storefront.tsx`.
  - **Próxima ação:** Modelar opções com capacidade, dimensão e disponibilidade.
  - **Dependências:** 106 (Sem entrega comprovada).

- [ ] **108. Projetar cartão e mensagem.** Permitir texto com limites adequados à produção e revisão.
  - **Situação auditada:** Sem entrega comprovada.
  - **Aceite:** Limites de caracteres e necessidade de aprovação ficam claros.
  - **Constatação:** Textarea genérico não equivale a cartão com limites e revisão de produção.
  - **Evidências e referências:** `src/components/Storefront.tsx`.
  - **Próxima ação:** Definir e implementar mensagem e aprovação do cartão.
  - **Dependências:** 107 (Sem entrega comprovada).

- [ ] **109. Implementar cálculo consistente.** Reutilizar cálculo validado no backend para peças e personalização.
  - **Situação auditada:** Sem entrega comprovada.
  - **Aceite:** Preço público não revela custo, margem ou regras comerciais internas.
  - **Constatação:** Não há adaptador de cálculo público para peça e personalização.
  - **Evidências e referências:** `docs/ARQUITETURA_E_INTEGRACAO.md`, `docs/AUDITORIA_PROJETO_INTERNO.md`.
  - **Próxima ação:** Integrar cálculo validado sem expor custos e margens.
  - **Dependências:** 106 (Sem entrega comprovada), 136 (Sem entrega comprovada).

- [ ] **110. Testar passagem da arte à produção.** Simular kit completo com peça, gravação, embalagem e mensagem.
  - **Situação auditada:** Sem entrega comprovada.
  - **Aceite:** Operação recebe todas as decisões com versão e aprovação registradas.
  - **Constatação:** Não há jornada testada de arte/kit até produção.
  - **Evidências e referências:** `docs/ARQUITETURA_E_INTEGRACAO.md`.
  - **Próxima ação:** Simular e homologar o fluxo completo com a operação.
  - **Dependências:** 104 (Sem entrega comprovada), 105 (Sem entrega comprovada), 107 (Sem entrega comprovada), 108 (Sem entrega comprovada), 109 (Sem entrega comprovada).


## Fase 12 — Seleção, briefing e conversão

**Responsável:** UX + frontend + comercial · **Prioridade:** P0 · **Janela:** semanas 5–8.

**Articulação:** fase 07, fase 09, fase 10.

- [x] **111. Implementar seleção persistente.** Salvar produtos e quantidades com validação dos dados locais.
  - **Situação auditada:** Concluída no escopo.
  - **Aceite:** Recarregar preserva seleção válida e descarta IDs desconhecidos.
  - **Constatação:** Seleção de IDs e quantidades persiste e rejeita IDs desconhecidos na amostra.
  - **Evidências e referências:** `src/lib/catalog.ts`, `tests/storefront.spec.ts`.
  - **Próxima ação:** Expiração em todas as rotas continua aberta na etapa 56.
  - **Dependências:** 042 (Concluída no escopo).

- [x] **112. Implementar edição de quantidade.** Permitir editar, aumentar, diminuir e remover peças.
  - **Situação auditada:** Concluída no escopo.
  - **Aceite:** Valor respeita mínimo cadastrado e limite máximo da prévia.
  - **Constatação:** Editar, aumentar, diminuir e remover respeitam limites da prévia.
  - **Evidências e referências:** `src/components/Storefront.tsx`, `tests/storefront.spec.ts`.
  - **Próxima ação:** Aplicar regras comerciais novas quando homologadas.
  - **Dependências:** 111 (Concluída no escopo).

- [x] **113. Implementar briefing aberto.** Permitir começar projeto sem produto escolhido.
  - **Situação auditada:** Concluída no escopo.
  - **Aceite:** Fluxo gera documento que solicita recomendação sem inventar itens.
  - **Constatação:** Briefing sem peças gera pedido explícito de recomendação.
  - **Evidências e referências:** `src/components/Storefront.tsx`.
  - **Próxima ação:** Nenhuma ação para o briefing aberto local.
  - **Dependências:** 111 (Concluída no escopo).

- [x] **114. Implementar formulário progressivo.** Separar seleção e informações do projeto com campos essenciais.
  - **Situação auditada:** Concluída no escopo.
  - **Aceite:** Contato obrigatório e campos opcionais têm labels e validação clara.
  - **Constatação:** O rascunho controlado permanece em memória ao voltar entre etapas e é excluído ao iniciar outro briefing; PII não vai ao armazenamento local.
  - **Evidências e referências:** `src/components/Storefront.tsx`, `docs/audit/plan-browser-scenarios.json`.
  - **Próxima ação:** Rever campos e retenção somente junto da política comercial aprovada.
  - **Dependências:** 066 (Concluída no escopo).

- [x] **115. Implementar exportação de briefing.** Gerar arquivo local com SKUs, IDs, quantidade, ocasião e contato.
  - **Situação auditada:** Concluída no escopo.
  - **Aceite:** Download contém seleção correta e informa que não houve envio comercial.
  - **Constatação:** Download inclui IDs, SKUs e quantidades corretos e informa não envio.
  - **Evidências e referências:** `tests/storefront.spec.ts`, `src/components/Storefront.tsx`.
  - **Próxima ação:** Nenhuma ação para a exportação local testada.
  - **Dependências:** 112 (Concluída no escopo), 113 (Concluída no escopo), 114 (Concluída no escopo).

- [ ] **116. Definir formulário de produção.** Validar dados indispensáveis, aviso de privacidade e finalidade com comercial.
  - **Situação auditada:** Parcial.
  - **Aceite:** Solicitação de marketing fica separada do atendimento quando aplicável.
  - **Constatação:** Campos iniciais e aviso local existem; finalidade e dados de produção não foram aprovados.
  - **Evidências e referências:** `src/components/Storefront.tsx`, `src/app/privacidade/page.tsx`.
  - **Próxima ação:** Homologar formulário e política com responsáveis comercial e jurídico.
  - **Dependências:** 024 (Sem entrega comprovada), 146 (Sem entrega comprovada).

- [ ] **117. Implementar envio real no backend.** Enviar briefing validado com chave de idempotência e proteção contra abuso.
  - **Situação auditada:** Parcial.
  - **Aceite:** Duplo clique e retry não geram oportunidades duplicadas.
  - **Constatação:** Entrega opcional usa chave estável, persistência/hash e lease atômica; falta receptor comercial homologado e rate limit distribuído.
  - **Evidências e referências:** `src/app/api/briefings/route.ts`, `src/components/Storefront.tsx`, `docs/audit/plan-browser-scenarios.json`.
  - **Próxima ação:** Integrar o destino aprovado e validar a criação de oportunidade sem duplicação.
  - **Dependências:** 116 (Parcial), 126 (Parcial), 134 (Concluída no escopo).

- [ ] **118. Implementar resposta confiável.** Apresentar protocolo somente após confirmação persistida no servidor.
  - **Situação auditada:** Parcial.
  - **Aceite:** Falha permite tentar novamente e sucesso nunca é simulado por temporizador.
  - **Constatação:** Protocolo é persistido antes da entrega; a interface rejeita 2xx sem protocolo válido e mantém o formulário. Falta validar retorno e conciliação do CRM homologado.
  - **Evidências e referências:** `src/app/api/briefings/route.ts`, `docs/audit/plan-database-check.json`, `tests/storefront.spec.ts`.
  - **Próxima ação:** Testar resposta, erro e conciliação com o receptor comercial aprovado.
  - **Dependências:** 117 (Parcial).

- [ ] **119. Implementar confirmação transacional.** Enviar confirmação pelo canal aprovado com resumo e próximos passos.
  - **Situação auditada:** Sem entrega comprovada.
  - **Aceite:** Mensagem contém protocolo correto e passa por teste de entrega autorizado.
  - **Constatação:** Não existe canal de confirmação transacional implementado ou teste de entrega.
  - **Evidências e referências:** `docs/CONTRATO_BRIEFING_V1.md`.
  - **Próxima ação:** Escolher canal e template e testar com destino autorizado.
  - **Dependências:** 118 (Parcial).

- [ ] **120. Testar continuidade da jornada.** Acompanhar um briefing do navegador até o atendimento efetivo.
  - **Situação auditada:** Sem entrega comprovada.
  - **Aceite:** Comercial localiza seleção e contexto sem redigitação.
  - **Constatação:** Não há briefing do navegador localizado por vendedor no CRM.
  - **Evidências e referências:** `docs/audit/plan-database-check.json`, `docs/ARQUITETURA_E_INTEGRACAO.md`.
  - **Próxima ação:** Executar jornada integrada com dados sintéticos autorizados.
  - **Dependências:** 118 (Parcial), 119 (Sem entrega comprovada), 133 (Parcial).


## Fase 13 — Contrato público e integração de catálogo

**Responsável:** Arquitetura + backend + dados · **Prioridade:** P0 · **Janela:** semanas 4–8.

**Articulação:** fase 01, fase 05.

- [x] **121. Definir projeção pública mínima.** Listar campos permitidos para lista, detalhe, variante e preço de venda.
  - **Situação auditada:** Concluída no escopo.
  - **Aceite:** Custos, margem, origem interna, organização e credenciais ficam fora do DTO público.
  - **Constatação:** Allowlist pública mínima está documentada e API omite campos internos.
  - **Evidências e referências:** `docs/ARQUITETURA_E_INTEGRACAO.md`, `tests/public-api.spec.ts`.
  - **Próxima ação:** Contratos avançados serão versionados ao incluir variantes e preços.
  - **Dependências:** 004 (Concluída no escopo), 010 (Concluída no escopo).

- [x] **122. Fixar host e configuração.** Validar URL por igualdade exata ou allowlist explícita no servidor.
  - **Situação auditada:** Concluída no escopo.
  - **Aceite:** Configuração de projeto legado ou host parecido é rejeitada.
  - **Constatação:** Servidor rejeita projeto operacional e host semelhante antes de buscar dados.
  - **Evidências e referências:** `src/lib/site-database.ts`, `docs/audit/plan-scenarios.json`.
  - **Próxima ação:** Manter testes da allowlist em futuras mudanças de configuração.
  - **Dependências:** 004 (Concluída no escopo).

- [ ] **123. Revalidar esquema ao vivo.** Consultar pg_catalog do projeto correto com acesso autorizado.
  - **Situação auditada:** Parcial.
  - **Aceite:** Inventário de grants, views, políticas e funções tem data e identidade comprovadas.
  - **Constatação:** pg_catalog, grants e RLS da vitrine foram inspecionados; inventário administrativo do comercial não existe.
  - **Evidências e referências:** `docs/audit/plan-database-check.json`, `docs/audit/CANONICAL_CATALOG_LIVE_CHECK_2026-09-22.md`.
  - **Próxima ação:** Concluir inventário autorizado de views/funções operacionais necessárias à integração.
  - **Dependências:** 004 (Concluída no escopo).

- [ ] **124. Validar as views existentes.** Comparar colunas e definições efetivas com contratos do repositório.
  - **Situação auditada:** Parcial.
  - **Aceite:** Diferenças são explicadas; SECURITY DEFINER não é alterado por suposição.
  - **Constatação:** View operacional teve leitura pública limitada; definições e políticas efetivas não foram revalidadas administrativamente.
  - **Evidências e referências:** `docs/audit/CANONICAL_CATALOG_LIVE_CHECK_2026-09-22.md`, `docs/AUDITORIA_PROJETO_INTERNO.md`.
  - **Próxima ação:** Comparar definições reais das views com contratos antes de criar adaptador.
  - **Dependências:** 123 (Parcial).

- [ ] **125. Projetar publicação editorial.** Definir como seleção premium, ordem, texto e visibilidade referenciam IDs canônicos.
  - **Situação auditada:** Parcial.
  - **Aceite:** Modelo não duplica o catálogo operacional e suporta despublicação.
  - **Constatação:** Tabela curada mantém IDs, ordem e published; faltam governança e sincronização de ciclo de vida.
  - **Evidências e referências:** `supabase/migrations/20260922110900_create_premium_site_core.sql`, `scripts/sync-site-catalog.mjs`, `docs/ARQUITETURA_E_INTEGRACAO.md`.
  - **Próxima ação:** Definir fonte de cada campo, edição autorizada e retirada em todas as superfícies.
  - **Dependências:** 041 (Parcial), 124 (Parcial).

- [ ] **126. Preparar contrato versionado.** Especificar paginação, filtros, erros, datas e disponibilidade da API.
  - **Situação auditada:** Parcial.
  - **Aceite:** Contrato revisado inclui exemplos de sucesso, vazio, inválido e indisponível.
  - **Constatação:** Contrato v1 cobre vazio, indisponibilidade, paginação, ordenação e busca; disponibilidade e variantes dependem de dados ainda não homologados.
  - **Evidências e referências:** `docs/CONTRATO_CATALOGO_PUBLICO_V1.md`, `src/app/api/catalog/route.ts`, `src/lib/site-database.ts`.
  - **Próxima ação:** Versionar os campos de disponibilidade e variantes após sua aprovação comercial.
  - **Dependências:** 121 (Concluída no escopo), 122 (Concluída no escopo), 124 (Parcial).

- [x] **127. Implementar leitura de catálogo.** Conectar servidor Next à projeção pública aprovada com limites de consulta.
  - **Situação auditada:** Concluída no escopo.
  - **Aceite:** Dados reais são validados e erros não viram listagens vazias silenciosas.
  - **Constatação:** Home, ficha de produto, API, seleção recuperada e validação de briefing consultam a projeção publicada com a mesma validação de contrato.
  - **Evidências e referências:** `src/lib/site-database.ts`, `src/components/Storefront.tsx`, `src/lib/briefing.ts`.
  - **Próxima ação:** Testar despublicação e conteúdo novo em um ambiente de staging quando houver dados aprovados.
  - **Dependências:** 125 (Parcial), 126 (Parcial).

- [ ] **128. Implementar cache e atualização.** Definir TTL e invalidação por mudanças relevantes de produto e publicação.
  - **Situação auditada:** Parcial.
  - **Aceite:** Produto retirado deixa de aparecer dentro do SLA definido.
  - **Constatação:** Cache de API usa TTL/SWR e sitemap consulta a publicação viva; páginas pré-renderizadas ainda dependem do TTL e não têm invalidação imediata por despublicação.
  - **Evidências e referências:** `src/app/api/catalog/route.ts`, `src/lib/site-database.ts`, `src/app/produtos/[slug]/page.tsx`, `src/app/sitemap.ts`.
  - **Próxima ação:** Definir SLA e testar retirada completa, revalidação e cache.
  - **Dependências:** 127 (Concluída no escopo).

- [x] **129. Implementar saúde de mídia.** Verificar disponibilidade, fallback e dimensões das imagens autorizadas.
  - **Situação auditada:** Concluída no escopo.
  - **Aceite:** CDN com 403 aciona fallback observável e não quebra a apresentação.
  - **Constatação:** Fotos locais evitam o CDN com falha; erro de mídia, inclusive 403 simulado, mostra fallback com nome da peça e mantém abertura do detalhe.
  - **Evidências e referências:** `src/components/Storefront.tsx`, `tests/storefront.spec.ts`.
  - **Próxima ação:** Adicionar observabilidade de falhas de mídia ao ambiente publicado.
  - **Dependências:** 047 (Concluída no escopo), 127 (Concluída no escopo).

- [ ] **130. Testar contrato ponta a ponta.** Conferir nomes, IDs, variantes, preço e resposta pública no staging.
  - **Situação auditada:** Parcial.
  - **Aceite:** Suite rejeita campo sensível e acompanha drift do contrato.
  - **Constatação:** E2E checam subset do DTO e oito produtos; não há staging nem teste de drift completo.
  - **Evidências e referências:** `tests/public-api.spec.ts`.
  - **Próxima ação:** Testar contrato exato, estados, variantes e alteração/despublicação em staging.
  - **Dependências:** 127 (Concluída no escopo), 128 (Parcial), 129 (Concluída no escopo).


## Fase 14 — Passagem para o comercial e CRM

**Responsável:** Backend + comercial + operações · **Prioridade:** P0 · **Janela:** semanas 7–9.

**Articulação:** fase 12, fase 13.

- [ ] **131. Mapear oportunidade e proprietário.** Definir destino dos briefings e relação com organizações e vendedores.
  - **Situação auditada:** Sem entrega comprovada.
  - **Aceite:** Fluxo aprovado identifica sistema canônico e dono de cada oportunidade.
  - **Constatação:** Nenhum CRM/receptor e dono de oportunidade foi formalizado.
  - **Evidências e referências:** `docs/ARQUITETURA_E_INTEGRACAO.md`, `docs/SUPABASE_SITE_DATABASE.md`.
  - **Próxima ação:** Definir destino canônico, organização e proprietário de cada briefing.
  - **Dependências:** 024 (Sem entrega comprovada).

- [ ] **132. Definir qualificação comercial.** Estabelecer ocasião, quantidade, orçamento, prazo e critérios de elegibilidade.
  - **Situação auditada:** Parcial.
  - **Aceite:** Regras não excluem oportunidades por inferências opacas sobre o comprador.
  - **Constatação:** Ocasião, orçamento e data são coletados; regras de qualificação não foram aprovadas.
  - **Evidências e referências:** `src/components/Storefront.tsx`, `docs/CONTRATO_BRIEFING_V1.md`.
  - **Próxima ação:** Definir critérios auditáveis com comercial.
  - **Dependências:** 131 (Sem entrega comprovada).

- [ ] **133. Definir payload de passagem.** Preservar IDs, SKUs, variantes, arte, quantidades e observações.
  - **Situação auditada:** Parcial.
  - **Aceite:** Contrato é consumível pelo comercial sem recuperar dados de texto livre.
  - **Constatação:** Payload básico preserva ID/SKU/quantidade; variantes, arte e consumidor comercial faltam.
  - **Evidências e referências:** `src/lib/briefing.ts`, `docs/CONTRATO_BRIEFING_V1.md`.
  - **Próxima ação:** Homologar contrato e adaptar o receptor sem redigitação.
  - **Dependências:** 126 (Parcial), 131 (Sem entrega comprovada), 132 (Parcial).

- [x] **134. Implementar deduplicação.** Tratar mesma solicitação e contato com idempotência e janela definida.
  - **Situação auditada:** Concluída no escopo.
  - **Aceite:** Retentativas não criam duplicatas nem fundem empresas distintas indevidamente.
  - **Constatação:** A chave e o hash são persistidos atomicamente; uma lease no banco permite uma única entrega concorrente, detecta conflito de payload e sobrevive ao reinício do processo.
  - **Evidências e referências:** `src/app/api/briefings/route.ts`, `supabase/migrations/20260922110900_create_premium_site_core.sql`, `docs/audit/plan-scenarios.json`.
  - **Próxima ação:** Exercitar a passagem ao CRM homologado e a conciliação operacional antes de habilitar a coleta.
  - **Dependências:** 133 (Parcial).

- [ ] **135. Implementar atribuição de vendedor.** Aplicar regras aprovadas de carteira, região ou distribuição.
  - **Situação auditada:** Sem entrega comprovada.
  - **Aceite:** Cenários de ausência e redistribuição mantêm rastreabilidade.
  - **Constatação:** Não existem regras ou implementação de atribuição de vendedor.
  - **Evidências e referências:** `docs/ARQUITETURA_E_INTEGRACAO.md`.
  - **Próxima ação:** Aprovar carteira/região/distribuição e fallback.
  - **Dependências:** 131 (Sem entrega comprovada).

- [ ] **136. Reutilizar orçamento transacional.** Integrar criação e aprovação pelas capacidades existentes do sistema.
  - **Situação auditada:** Sem entrega comprovada.
  - **Aceite:** Quote e itens permanecem atômicos e respeitam autorização e limites de desconto.
  - **Constatação:** Capacidade transacional foi localizada no comercial, sem adaptador na vitrine.
  - **Evidências e referências:** `docs/AUDITORIA_PROJETO_INTERNO.md`, `docs/ARQUITETURA_E_INTEGRACAO.md`.
  - **Próxima ação:** Integrar criação/aprovação autorizadas e testar atomicidade.
  - **Dependências:** 133 (Parcial), 134 (Concluída no escopo), 135 (Sem entrega comprovada).

- [ ] **137. Definir estados de acompanhamento.** Relacionar recebido, qualificado, proposta, aprovado e encerrado.
  - **Situação auditada:** Parcial.
  - **Aceite:** Cliente vê apenas estados úteis sem expor notas internas ou margem.
  - **Constatação:** Tabela tem received/qualified/closed, sem workflow ou acompanhamento implementado.
  - **Evidências e referências:** `supabase/migrations/20260922110900_create_premium_site_core.sql`.
  - **Próxima ação:** Definir estados e autorização antes de expor acompanhamento.
  - **Dependências:** 136 (Sem entrega comprovada).

- [ ] **138. Instrumentar SLA de atendimento.** Medir recebimento, primeira resposta e emissão de proposta.
  - **Situação auditada:** Sem entrega comprovada.
  - **Aceite:** Dashboard distingue horário útil e espera pelo cliente.
  - **Constatação:** Não há medição de recebimento, resposta, horário útil ou proposta.
  - **Evidências e referências:** `docs/ESTRATEGIA_E_PESQUISA.md`, `docs/ARQUITETURA_E_INTEGRACAO.md`.
  - **Próxima ação:** Instrumentar eventos e dashboard de SLA.
  - **Dependências:** 137 (Parcial).

- [ ] **139. Implementar retries e conciliação.** Prever fila, tentativas controladas e tratamento de falhas de integração.
  - **Situação auditada:** Sem entrega comprovada.
  - **Aceite:** Uma falha parcial não perde briefing e pode ser reprocessada por usuário autorizado.
  - **Constatação:** Timeout não equivale a fila: não existe outbox, retry persistente ou conciliação.
  - **Evidências e referências:** `src/app/api/briefings/route.ts`.
  - **Próxima ação:** Persistir envio e reprocessamento com rastreabilidade e sem perda.
  - **Dependências:** 136 (Sem entrega comprovada).

- [ ] **140. Executar piloto com vendedores.** Acompanhar solicitações de teste até proposta revisada.
  - **Situação auditada:** Sem entrega comprovada.
  - **Aceite:** Representantes aprovam contexto, usabilidade e ausência de redigitação crítica.
  - **Constatação:** Não houve piloto de solicitações com vendedores.
  - **Evidências e referências:** `docs/ARQUITETURA_E_INTEGRACAO.md`.
  - **Próxima ação:** Executar piloto após fluxo CRM e conciliação funcionarem.
  - **Dependências:** 138 (Sem entrega comprovada), 139 (Sem entrega comprovada), 120 (Sem entrega comprovada).


## Fase 15 — Segurança, privacidade e governança

**Responsável:** Segurança + jurídico + backend · **Prioridade:** P0 · **Janela:** semanas 6–10.

**Articulação:** fase 13, fase 14.

- [ ] **141. Modelar ameaças do fluxo público.** Analisar coleta abusiva, spam, upload, acesso indevido e exposição comercial.
  - **Situação auditada:** Parcial.
  - **Aceite:** Modelo tem responsáveis e controles proporcionais ao risco observado.
  - **Constatação:** Modelo de ameaças da prévia existe; integrações finais, responsáveis nomeados e controles efetivos faltam.
  - **Evidências e referências:** `docs/MODELO_DE_AMEACAS_PREVIA.md`, `docs/audit/plan-scenarios.json`.
  - **Próxima ação:** Atualizar modelo com achados desta auditoria e aprovar riscos operacionais.
  - **Dependências:** 126 (Parcial), 133 (Parcial).

- [ ] **142. Revisar permissões anônimas.** Testar leitura e negativa de escrita com anon no projeto correto.
  - **Situação auditada:** Parcial.
  - **Aceite:** Custos e PII permanecem protegidos; nenhum grant amplo é adicionado para destravar UI.
  - **Constatação:** Banco da vitrine nega escrita anon e acesso a briefings; acesso cruzado e escopo operacional não foram testados.
  - **Evidências e referências:** `docs/audit/plan-database-check.json`, `supabase/migrations/20260922110900_create_premium_site_core.sql`.
  - **Próxima ação:** Completar matriz de papéis e cenários no ambiente integrado.
  - **Dependências:** 123 (Parcial).

- [ ] **143. Proteger segredos de servidor.** Manter service role e integrações exclusivamente no servidor.
  - **Situação auditada:** Parcial.
  - **Aceite:** Build público e logs são verificados e não contêm segredos.
  - **Constatação:** Gate percorre código público, scripts e build estático, sem encontrar segredos; logs de uma infraestrutura publicada ainda não existem para inspeção.
  - **Evidências e referências:** `scripts/check-public-secrets.mjs`, `docs/SUPABASE_SITE_DATABASE.md`, `docs/audit/plan-secret-scan.json`.
  - **Próxima ação:** Adicionar logs e revisão de artefatos ao pipeline do ambiente publicado.
  - **Dependências:** 122 (Concluída no escopo).

- [ ] **144. Isolar requisições de orçamento.** Validar origem, tamanho, campos e limites; usar proteção conforme arquitetura.
  - **Situação auditada:** Parcial.
  - **Aceite:** Abuso, payload inesperado e repetição recebem respostas controladas.
  - **Constatação:** Corpo é limitado por bytes reais, data e textos são validados integralmente; rate limit por IP ainda é local ao processo.
  - **Evidências e referências:** `src/app/api/briefings/route.ts`, `src/lib/briefing.ts`, `docs/audit/plan-scenarios.json`.
  - **Próxima ação:** Aplicar rate limit confiável/distribuído no ambiente de produção.
  - **Dependências:** 141 (Parcial).

- [ ] **145. Revisar arquivos e links públicos.** Garantir acesso privado a logos e expiração de links compartilháveis.
  - **Situação auditada:** Sem entrega comprovada.
  - **Aceite:** Cliente A não acessa arquivos ou propostas de B.
  - **Constatação:** Arquivos privados e links por cliente não existem; isolamento ainda não foi implementado/testado.
  - **Evidências e referências:** `docs/MODELO_DE_AMEACAS_PREVIA.md`, `docs/ARQUITETURA_E_INTEGRACAO.md`.
  - **Próxima ação:** Implementar autorização, expiração e negativas entre clientes ao criar uploads.
  - **Dependências:** 103 (Parcial), 141 (Parcial).

- [ ] **146. Definir tratamento de dados.** Documentar finalidade, base legal, operadores, retenção e direitos com responsável jurídico.
  - **Situação auditada:** Sem entrega comprovada.
  - **Aceite:** Mapa corresponde ao sistema implementado e identifica o controlador.
  - **Constatação:** Não há controlador identificado, mapa de tratamento aprovado ou política de retenção comercial.
  - **Evidências e referências:** `src/app/privacidade/page.tsx`, `docs/ARQUITETURA_E_INTEGRACAO.md`.
  - **Próxima ação:** Obter definições dos responsáveis e mapear o fluxo real.
  - **Dependências:** 024 (Sem entrega comprovada), 131 (Sem entrega comprovada).

- [ ] **147. Publicar política adequada.** Redigir política e contato de privacidade da empresa para a versão comercial.
  - **Situação auditada:** Parcial.
  - **Aceite:** Texto aprovado descreve coleta real sem promessas impossíveis de cumprir.
  - **Constatação:** Página de privacidade descreve a prévia; não é política comercial aprovada.
  - **Evidências e referências:** `src/app/privacidade/page.tsx`.
  - **Próxima ação:** Redigir e aprovar texto com controlador e contato reais.
  - **Dependências:** 146 (Sem entrega comprovada).

- [ ] **148. Controlar cookies não essenciais.** Separar preferências necessárias de publicidade e analytics dependentes de consentimento.
  - **Situação auditada:** Parcial.
  - **Aceite:** Aceitar, recusar e rever escolha são verificáveis e respeitados pelos scripts.
  - **Constatação:** Prévia não instala analytics/publicidade; não há mecanismo de consentimento para eventual adoção.
  - **Evidências e referências:** `src/app/privacidade/page.tsx`.
  - **Próxima ação:** Inventariar scripts e decidir escopo; implementar controle se necessário.
  - **Dependências:** 146 (Sem entrega comprovada).

- [ ] **149. Definir atendimento a titulares.** Implementar processo de acesso, correção, exclusão e retenção aplicável.
  - **Situação auditada:** Sem entrega comprovada.
  - **Aceite:** Solicitação de teste é rastreável e concluída conforme política aprovada.
  - **Constatação:** Não existe canal/processo testado para acesso, correção e exclusão.
  - **Evidências e referências:** `src/app/privacidade/page.tsx`.
  - **Próxima ação:** Definir responsável, procedimento e evidência de solicitação teste.
  - **Dependências:** 146 (Sem entrega comprovada).

- [ ] **150. Revisar segurança antes da abertura.** Aplicar checks de dependências, headers, acesso, logs e recuperação.
  - **Situação auditada:** Parcial.
  - **Aceite:** Não há vulnerabilidade crítica aberta sem decisão formal e controle adequado.
  - **Constatação:** Build, dependências e headers têm checks; há falhas de lógica e gates de segurança abertos.
  - **Evidências e referências:** `next.config.ts`, `docs/VALIDACAO.md`, `docs/audit/plan-scenarios.json`.
  - **Próxima ação:** Corrigir achados, testar acesso/logs/recuperação e registrar revisão de abertura.
  - **Dependências:** 142 (Parcial), 143 (Parcial), 144 (Parcial), 145 (Sem entrega comprovada), 147 (Parcial), 148 (Parcial), 149 (Sem entrega comprovada).


## Fase 16 — Conteúdo, SEO e descoberta orgânica

**Responsável:** Conteúdo + SEO + frontend · **Prioridade:** P1 · **Janela:** semanas 6–10.

**Articulação:** fase 06, fase 10, fase 13.

- [ ] **151. Definir mapa de intenção de busca.** Separar páginas por categoria, ocasião e dúvida de compra real.
  - **Situação auditada:** Parcial.
  - **Aceite:** Não há páginas em massa criadas apenas por variações de palavra-chave.
  - **Constatação:** Categorias e ocasiões são propostas; mapa de intenção não foi pesquisado com compradores.
  - **Evidências e referências:** `docs/ESTRATEGIA_E_PESQUISA.md`, `docs/ARQUITETURA_INFORMACAO_E_FLUXOS.md`.
  - **Próxima ação:** Definir páginas por demanda real e intenção distinta.
  - **Dependências:** 023 (Sem entrega comprovada), 026 (Parcial).

- [ ] **152. Definir URLs e canonical.** Estabelecer slugs estáveis, redirects e política de facetas.
  - **Situação auditada:** Parcial.
  - **Aceite:** Uma entidade não compete com múltiplas URLs indexáveis equivalentes.
  - **Constatação:** Home, privacidade, planejamento e fichas têm canonical próprio; falta política de redirects para migrações de slug e aprovação das URLs comerciais.
  - **Evidências e referências:** `src/app/layout.tsx`, `src/app/privacidade/page.tsx`, `src/app/produtos/[slug]/page.tsx`.
  - **Próxima ação:** Documentar e testar redirects/facetas após aprovar domínio e slugs finais.
  - **Dependências:** 051 (Concluída no escopo), 151 (Parcial).

- [x] **153. Renderizar conteúdo no servidor.** Gerar HTML inicial com proposta, produtos e links úteis.
  - **Situação auditada:** Concluída no escopo.
  - **Aceite:** Conteúdo principal existe no HTML sem depender da hidratação.
  - **Constatação:** Home e fichas entregam conteúdo principal no HTML inicial, verificado por E2E.
  - **Evidências e referências:** `tests/public-api.spec.ts`, `src/app/produtos/[slug]/page.tsx`.
  - **Próxima ação:** Manter renderização ao integrar catálogo vivo.
  - **Dependências:** 071 (Concluída no escopo), 092 (Concluída no escopo).

- [ ] **154. Implementar metadados de páginas.** Criar títulos, descrições e imagens sociais específicas.
  - **Situação auditada:** Parcial.
  - **Aceite:** Não aparecem placeholders, números de estoque inventados ou títulos duplicados críticos.
  - **Constatação:** Títulos e canonical são específicos por rota; ficha usa descrição e imagem da peça. Metadados sociais dos templates internos e revisão editorial final ainda faltam.
  - **Evidências e referências:** `src/app/layout.tsx`, `src/app/produtos/[slug]/page.tsx`, `src/app/privacidade/page.tsx`.
  - **Próxima ação:** Revisar descrições e metadados sociais por template com conteúdo aprovado.
  - **Dependências:** 152 (Parcial), 153 (Concluída no escopo).

- [ ] **155. Implementar dados estruturados fiéis.** Usar schemas compatíveis com conteúdo real e preço confirmado.
  - **Situação auditada:** Parcial.
  - **Aceite:** Não há avaliação, disponibilidade ou Offer fictício para obter destaque.
  - **Constatação:** JSON-LD evita Offer/avaliação fictícios; conteúdo técnico e atribuição da marca exigem revisão.
  - **Evidências e referências:** `src/app/produtos/[slug]/page.tsx`, `src/lib/products.json`.
  - **Próxima ação:** Validar schema com dados homologados e marca correta por SKU.
  - **Dependências:** 094 (Sem entrega comprovada), 095 (Parcial), 096 (Parcial).

- [ ] **156. Implementar sitemap e robots.** Incluir apenas URLs canônicas publicáveis e manter preview fora do índice.
  - **Situação auditada:** Parcial.
  - **Aceite:** Staging permanece noindex e domínio final é validado antes de liberar indexação.
  - **Constatação:** Indexação exige flag, URL HTTPS de domínio e configuração da fonte pública; sitemap consulta peças publicadas e planejamento retorna 404 nessa configuração. Posse do domínio e liberação comercial ainda não foram validadas.
  - **Evidências e referências:** `src/app/robots.ts`, `src/app/sitemap.ts`, `src/app/layout.tsx`, `src/lib/publication.ts`, `docs/audit/2026-09-22-regression-scenarios.md`.
  - **Próxima ação:** Confirmar posse do domínio, conteúdo, direitos e gates comerciais antes de ativar a flag em produção.
  - **Dependências:** 152 (Parcial), 154 (Parcial).

- [ ] **157. Produzir páginas editoriais úteis.** Escrever guias de ocasião, técnica e planejamento com participação comercial.
  - **Situação auditada:** Sem entrega comprovada.
  - **Aceite:** Conteúdo responde dúvidas reais e aponta a produtos elegíveis.
  - **Constatação:** Não há páginas de guias de ocasião, técnicas ou planejamento comercial.
  - **Evidências e referências:** `docs/ARQUITETURA_INFORMACAO_E_FLUXOS.md`.
  - **Próxima ação:** Produzir conteúdo com dúvidas reais e produtos elegíveis.
  - **Dependências:** 151 (Parcial).

- [ ] **158. Revisar acessibilidade de conteúdo.** Redigir alt texts, links descritivos e títulos com hierarquia.
  - **Situação auditada:** Parcial.
  - **Aceite:** Texto alternativo não repete slogans nem omite conteúdo essencial.
  - **Constatação:** Alt texts e hierarquia da prévia existem; conteúdo editorial futuro não foi criado/revisado.
  - **Evidências e referências:** `src/components/Storefront.tsx`, `src/app/produtos/[slug]/page.tsx`.
  - **Próxima ação:** Revisar alternativas, links e títulos em todos os conteúdos aprovados.
  - **Dependências:** 157 (Sem entrega comprovada).

- [ ] **159. Configurar Search Console.** Verificar domínio autorizado e acompanhar rastreamento e indexação.
  - **Situação auditada:** Sem entrega comprovada.
  - **Aceite:** Sitemap processado e páginas estratégicas inspecionadas após lançamento.
  - **Constatação:** Não há domínio verificado ou configuração de Search Console.
  - **Evidências e referências:** `README.md`.
  - **Próxima ação:** Configurar após domínio e publicação aprovados.
  - **Dependências:** 156 (Parcial), 194 (Sem entrega comprovada).

- [ ] **160. Medir qualidade do tráfego orgânico.** Relacionar entradas orgânicas a briefings qualificados, com privacidade.
  - **Situação auditada:** Sem entrega comprovada.
  - **Aceite:** Relatório diferencia visibilidade, tráfego e resultado comercial.
  - **Constatação:** Não há tráfego orgânico medido ou associação com briefings qualificados.
  - **Evidências e referências:** `docs/ESTRATEGIA_E_PESQUISA.md`.
  - **Próxima ação:** Instrumentar relatório após lançamento e decisão de privacidade.
  - **Dependências:** 159 (Sem entrega comprovada).


## Fase 17 — Desempenho e confiabilidade

**Responsável:** Frontend + SRE + backend · **Prioridade:** P0 · **Janela:** semanas 7–10.

**Articulação:** fase 08, fase 09, fase 13.

- [x] **161. Definir orçamento de desempenho.** Fixar limites para JS inicial, imagens, fontes e requisições do MVP.
  - **Situação auditada:** Concluída no escopo.
  - **Aceite:** Orçamento está associado a páginas e condições de medição reproduzíveis.
  - **Constatação:** Gate mede imagens, fontes WOFF2, JavaScript gzip e quantidade de chunks por rota do build de produção.
  - **Evidências e referências:** `docs/ORCAMENTO_DESEMPENHO.md`, `scripts/check-performance-budget.mjs`.
  - **Próxima ação:** Manter os limites ao adicionar rotas ou dependências.
  - **Dependências:** 030 (Parcial).

- [x] **162. Otimizar imagem principal.** Fornecer formatos e tamanhos adequados e priorizar apenas o LCP.
  - **Situação auditada:** Concluída no escopo.
  - **Aceite:** Hero carrega sem salto e sem baixar a versão máxima em todo dispositivo.
  - **Constatação:** Hero usa WebP, sizes, srcset e prioridade; dimensões reservadas e CLS local zero.
  - **Evidências e referências:** `src/components/Storefront.tsx`, `docs/audit/lighthouse-mobile.json`, `scripts/check-performance-budget.mjs`.
  - **Próxima ação:** Meta global de LCP continua aberta nas etapas 166–167.
  - **Dependências:** 072 (Concluída no escopo).

- [x] **163. Otimizar imagens de catálogo.** Usar dimensões reservadas, tamanhos responsivos e lazy loading.
  - **Situação auditada:** Concluída no escopo.
  - **Aceite:** Cards fora da tela não competem desnecessariamente com conteúdo inicial.
  - **Constatação:** Cards usam dimensões reservadas, sizes e lazy loading; orçamento dos oito assets passa.
  - **Evidências e referências:** `src/components/Storefront.tsx`, `scripts/check-performance-budget.mjs`.
  - **Próxima ação:** Manter otimização ao ampliar catálogo.
  - **Dependências:** 074 (Concluída no escopo).

- [x] **164. Otimizar fontes.** Servir famílias locais e somente os pesos necessários.
  - **Situação auditada:** Concluída no escopo.
  - **Aceite:** Não há dependência de fonte de terceiros nem bloqueio prolongado de texto.
  - **Constatação:** Fontes são locais com imports dos pesos usados; nenhuma fonte de terceiros é necessária.
  - **Evidências e referências:** `src/app/layout.tsx`.
  - **Próxima ação:** Medir orçamento total na etapa 161.
  - **Dependências:** 033 (Concluída no escopo).

- [x] **165. Separar código por necessidade.** Adiar componentes pesados de configuração e planejamento.
  - **Situação auditada:** Concluída no escopo.
  - **Aceite:** Visitante da home não carrega ferramentas do backoffice ou integrações administrativas.
  - **Constatação:** Bundles da home e do planejamento têm chunks exclusivos; gate do build rejeita marcador do painel no JavaScript inicial da home. Não há provider administrativo na vitrine.
  - **Evidências e referências:** `src/components/Storefront.tsx`, `src/app/layout.tsx`, `docs/ORCAMENTO_DESEMPENHO.md`, `scripts/check-performance-budget.mjs`.
  - **Próxima ação:** Manter a separação ao adicionar ferramentas comerciais e medir novamente o orçamento por rota.
  - **Dependências:** 153 (Concluída no escopo).

- [ ] **166. Medir laboratório móvel.** Executar Lighthouse repetido com cenário e ambiente registrados.
  - **Situação auditada:** Parcial.
  - **Aceite:** Resultados não são apresentados como percentil real de usuários.
  - **Constatação:** Última coleta válida é única: LCP 3,0 s; repetição posterior falhou no ambiente.
  - **Evidências e referências:** `docs/audit/lighthouse-mobile.json`, `docs/VALIDACAO.md`.
  - **Próxima ação:** Executar rodadas repetidas reproduzíveis e atender orçamento.
  - **Dependências:** 161 (Concluída no escopo), 162 (Concluída no escopo), 163 (Concluída no escopo), 164 (Concluída no escopo), 165 (Concluída no escopo).

- [ ] **167. Medir Core Web Vitals em campo.** Instrumentar métricas reais conforme decisão de privacidade e consentimento.
  - **Situação auditada:** Sem entrega comprovada.
  - **Aceite:** Dashboard por dispositivo calcula p75 com amostra e janela explícitas.
  - **Constatação:** Não há coleta de Web Vitals de usuários reais nem dashboard p75.
  - **Evidências e referências:** `docs/ORCAMENTO_DESEMPENHO.md`.
  - **Próxima ação:** Instrumentar após definição de privacidade e ambiente publicado.
  - **Dependências:** 148 (Parcial), 194 (Sem entrega comprovada).

- [x] **168. Definir indisponibilidade e retries.** Projetar timeout, circuit breaker e mensagens úteis para falha de catálogo.
  - **Situação auditada:** Concluída no escopo.
  - **Aceite:** Erro do upstream não transforma indisponibilidade em falsa ausência de produtos.
  - **Constatação:** Resposta vazia válida preserva total zero; falha de fonte vira 503 e a interface mantém a seleção local com ação explícita de nova tentativa.
  - **Evidências e referências:** `src/lib/site-database.ts`, `src/app/api/catalog/route.ts`.
  - **Próxima ação:** Definir circuit breaker e observabilidade no ambiente com tráfego real.
  - **Dependências:** 127 (Concluída no escopo).

- [ ] **169. Validar capacidade do backend.** Executar teste de carga controlado em staging com orçamento acordado.
  - **Situação auditada:** Sem entrega comprovada.
  - **Aceite:** Limites e comportamento sob excesso de tráfego são medidos sem afetar produção.
  - **Constatação:** Não há ambiente de staging ou teste de carga autorizado registrado.
  - **Evidências e referências:** `docs/ARQUITETURA_E_INTEGRACAO.md`.
  - **Próxima ação:** Definir orçamento e executar carga controlada em staging.
  - **Dependências:** 168 (Concluída no escopo).

- [ ] **170. Definir observabilidade e alertas.** Acompanhar disponibilidade, mídia, latência e falha de briefings.
  - **Situação auditada:** Sem entrega comprovada.
  - **Aceite:** Cada alerta tem limiar, responsável e procedimento de resposta.
  - **Constatação:** Não existem alertas, limiares, donos ou runbook de resposta.
  - **Evidências e referências:** `docs/ARQUITETURA_E_INTEGRACAO.md`.
  - **Próxima ação:** Instrumentar disponibilidade, mídia e entrega de briefings.
  - **Dependências:** 138 (Sem entrega comprovada), 168 (Concluída no escopo).


## Fase 18 — Acessibilidade e inclusão

**Responsável:** QA acessibilidade + frontend · **Prioridade:** P0 · **Janela:** semanas 8–10.

**Articulação:** fase 07, fase 08, fase 09, fase 10, fase 12.

- [ ] **171. Auditar semântica e landmarks.** Verificar idioma, regiões, títulos e sequência de leitura.
  - **Situação auditada:** Parcial.
  - **Aceite:** Cada página tem H1 e estrutura compreensível por tecnologia assistiva.
  - **Constatação:** Semântica básica e axe cobrem páginas representativas; falta revisão completa de sequência e estados.
  - **Evidências e referências:** `tests/storefront.spec.ts`, `tests/public-api.spec.ts`, `tests/plan.spec.ts`.
  - **Próxima ação:** Auditar todos os templates e transições com tecnologia assistiva.
  - **Dependências:** 079 (Concluída no escopo), 092 (Concluída no escopo).

- [ ] **172. Auditar contraste.** Medir texto, botões, bordas essenciais e foco em todos os estados.
  - **Situação auditada:** Parcial.
  - **Aceite:** Texto normal atende 4,5:1; grande 3:1; componentes essenciais 3:1 conforme critério aplicável.
  - **Constatação:** Axe não detectou violações nos cenários cobertos; não há matriz manual de todos os pares/estados.
  - **Evidências e referências:** `docs/VALIDACAO.md`, `src/app/globals.css`.
  - **Próxima ação:** Medir fotografia, bordas, foco, disabled e texto em cada superfície.
  - **Dependências:** 063 (Concluída no escopo), 064 (Concluída no escopo), 066 (Concluída no escopo).

- [ ] **173. Auditar teclado.** Percorrer menu, filtros, favoritos, diálogos, quantidades e formulário.
  - **Situação auditada:** Parcial.
  - **Aceite:** Nenhuma tarefa exige ponteiro e foco nunca fica oculto ou sem saída.
  - **Constatação:** Teste de teclado cobre ciclo do diálogo, não toda a jornada de menu/filtros/quantidade/formulário.
  - **Evidências e referências:** `tests/storefront.spec.ts`.
  - **Próxima ação:** Executar percurso completo só com teclado e registrar foco.
  - **Dependências:** 065 (Concluída no escopo), 071 (Concluída no escopo), 081 (Concluída no escopo), 112 (Concluída no escopo), 114 (Concluída no escopo).

- [x] **174. Auditar diálogos.** Confirmar foco inicial adequado, Escape, contenção e restauração.
  - **Situação auditada:** Concluída no escopo.
  - **Aceite:** Fechamento devolve foco a um elemento existente e útil.
  - **Constatação:** Teste cobre Escape, contenção e retorno ao acionador no diálogo exercitado.
  - **Evidências e referências:** `tests/storefront.spec.ts`, `src/components/Modal.tsx`.
  - **Próxima ação:** Validar demais combinações de leitor/navegador na homologação.
  - **Dependências:** 065 (Concluída no escopo).

- [ ] **175. Auditar reflow e zoom.** Testar 200% e 400% e largura equivalente a 320 CSS px.
  - **Situação auditada:** Parcial.
  - **Aceite:** Conteúdo permanece funcional sem rolagem em duas dimensões indevida.
  - **Constatação:** E2E cobre 320 CSS px; zoom real 200/400% não tem evidência completa.
  - **Evidências e referências:** `tests/storefront.spec.ts`, `docs/VALIDACAO.md`.
  - **Próxima ação:** Testar zoom e reflow em todos os templates e diálogos.
  - **Dependências:** 062 (Concluída no escopo).

- [ ] **176. Auditar alvos de interação.** Inspecionar tamanho e espaçamento em telas móveis.
  - **Situação auditada:** Parcial.
  - **Aceite:** Atende WCAG 2.2 AA com exceções documentadas; busca-se 44 px para ações principais.
  - **Constatação:** Dimensões de controles existem e axe cobre parte dos critérios; inventário móvel de exceções falta.
  - **Evidências e referências:** `src/app/globals.css`, `docs/VALIDACAO.md`.
  - **Próxima ação:** Medir alvos e espaçamento em todos os estados móveis.
  - **Dependências:** 063 (Concluída no escopo), 064 (Concluída no escopo).

- [ ] **177. Auditar validação de formulários.** Verificar labels, erros, correção e preservação de campos válidos.
  - **Situação auditada:** Parcial.
  - **Aceite:** Leitor de tela consegue localizar e corrigir campos inválidos.
  - **Constatação:** Rascunho preserva dados válidos ao voltar; validação nativa e labels existem, mas falta teste com leitor de tela.
  - **Evidências e referências:** `src/components/Storefront.tsx`, `docs/audit/plan-browser-scenarios.json`.
  - **Próxima ação:** Testar identificação e correção de erros com tecnologia assistiva.
  - **Dependências:** 066 (Concluída no escopo), 114 (Concluída no escopo).

- [x] **178. Auditar movimento e mídia.** Testar reduced motion, textos alternativos e conteúdo conceitual.
  - **Situação auditada:** Concluída no escopo.
  - **Aceite:** Nenhuma informação depende de animação, cor isolada ou imagem sem alternativa.
  - **Constatação:** A sonda de navegador confirma que reduced-motion interrompe a rolagem suave explícita; imagens essenciais têm texto alternativo e identificação conceitual.
  - **Evidências e referências:** `docs/audit/plan-browser-scenarios.json`, `src/components/Storefront.tsx`, `src/app/globals.css`.
  - **Próxima ação:** Incluir qualquer nova mídia ou animação na varredura de acessibilidade.
  - **Dependências:** 068 (Concluída no escopo), 093 (Parcial).

- [x] **179. Executar varredura automatizada.** Rodar axe nas páginas e diálogos representativos.
  - **Situação auditada:** Concluída no escopo.
  - **Aceite:** Violações são corrigidas ou avaliadas; automação não equivale a certificação AA.
  - **Constatação:** Axe roda na home, formulário, produto, plano e privacidade sem violações nas regras cobertas.
  - **Evidências e referências:** `tests/storefront.spec.ts`, `tests/public-api.spec.ts`, `tests/plan.spec.ts`.
  - **Próxima ação:** Manter automação; não declarar conformidade integral por este resultado.
  - **Dependências:** 171 (Parcial), 172 (Parcial), 173 (Parcial), 174 (Concluída no escopo), 175 (Parcial), 176 (Parcial), 177 (Parcial), 178 (Concluída no escopo).

- [ ] **180. Validar com pessoas.** Conduzir tarefas com usuários de tecnologia assistiva.
  - **Situação auditada:** Sem entrega comprovada.
  - **Aceite:** Achados manuais são resolvidos e limitações ficam documentadas.
  - **Constatação:** Não há sessões com usuários de tecnologia assistiva.
  - **Evidências e referências:** `docs/VALIDACAO.md`.
  - **Próxima ação:** Recrutar participantes e resolver achados manuais.
  - **Dependências:** 179 (Concluída no escopo).


## Fase 19 — Qualidade, homologação e piloto

**Responsável:** QA + produto + comercial · **Prioridade:** P0 · **Janela:** semanas 9–11.

**Articulação:** fase 14, fase 15, fase 16, fase 17, fase 18.

- [x] **181. Validar build e tipos.** Executar compilação de produção e TypeScript estrito.
  - **Situação auditada:** Concluída no escopo.
  - **Aceite:** Comandos concluem sem erros na revisão entregue.
  - **Constatação:** Build de produção e TypeScript passaram, inclusive após a revisão do painel e do plano.
  - **Evidências e referências:** `docs/VALIDACAO.md`.
  - **Próxima ação:** Manter compilação e tipos como gates a cada alteração de aplicação.
  - **Dependências:** 079 (Concluída no escopo), 091 (Concluída no escopo), 115 (Concluída no escopo).

- [x] **182. Testar busca e seleção.** Cobrir filtros, zero resultados, favoritos, persistência e quantidade.
  - **Situação auditada:** Concluída no escopo.
  - **Aceite:** Testes E2E usam comportamento observável e detectam regressões do fluxo principal.
  - **Constatação:** E2E exercitam busca, vazio, favoritos, persistência, mínimos e remoção.
  - **Evidências e referências:** `tests/storefront.spec.ts`.
  - **Próxima ação:** Ampliar cenários de regressão para lacunas identificadas sem apagar a cobertura existente.
  - **Dependências:** 081 (Concluída no escopo), 082 (Concluída no escopo), 083 (Concluída no escopo), 084 (Concluída no escopo), 111 (Concluída no escopo), 112 (Concluída no escopo).

- [x] **183. Testar briefing da prévia.** Verificar validação e conteúdo real do arquivo exportado.
  - **Situação auditada:** Concluída no escopo.
  - **Aceite:** Download contém IDs, SKUs, quantidades e aviso de não envio.
  - **Constatação:** E2E verificam download, seleção correta e ausência de envio/PII no localStorage.
  - **Evidências e referências:** `tests/storefront.spec.ts`.
  - **Próxima ação:** Manter essa cobertura quando o modo comercial for habilitado.
  - **Dependências:** 115 (Concluída no escopo).

- [ ] **184. Testar integração em staging.** Cobrir erro, sucesso, idempotência e rastreabilidade com CRM.
  - **Situação auditada:** Sem entrega comprovada.
  - **Aceite:** Protocolo corresponde a registro persistido e oportunidades não se duplicam.
  - **Constatação:** Não existe teste integrado em staging com persistência e CRM.
  - **Evidências e referências:** `docs/ARQUITETURA_E_INTEGRACAO.md`.
  - **Próxima ação:** Validar sucesso, falha, concorrência, reinício e reconciliação.
  - **Dependências:** 120 (Sem entrega comprovada), 140 (Sem entrega comprovada).

- [ ] **185. Testar navegadores e dispositivos.** Verificar Chromium, Safari/WebKit e Firefox em larguras acordadas.
  - **Situação auditada:** Parcial.
  - **Aceite:** Matriz registra versões, tarefas cobertas e falhas corrigidas.
  - **Constatação:** CI executa Chromium serialmente em push/PR; WebKit, Firefox e aparelhos reais ainda faltam na matriz.
  - **Evidências e referências:** `playwright.config.ts`, `docs/VALIDACAO.md`, `.github/workflows/quality.yml`.
  - **Próxima ação:** Completar matriz com versões, tarefas e correções.
  - **Dependências:** 181 (Concluída no escopo).

- [ ] **186. Testar jornadas com rede limitada.** Simular lentidão, offline e falha de imagem ou API.
  - **Situação auditada:** Parcial.
  - **Aceite:** Feedback mantém contexto e oferece recuperação sem sucesso fictício.
  - **Constatação:** A jornada E2E cobre API 503, offline, resposta atrasada e mídia 403 com contexto preservado; ainda falta perfil de rede limitada em navegadores e dispositivos representativos.
  - **Evidências e referências:** `tests/public-api.spec.ts`, `tests/storefront.spec.ts`.
  - **Próxima ação:** Executar cenários de lentidão em navegadores e dispositivos representativos.
  - **Dependências:** 168 (Concluída no escopo).

- [ ] **187. Executar revisão comercial.** Validar nomes, técnicas, quantidades, preços e textos institucionais.
  - **Situação auditada:** Sem entrega comprovada.
  - **Aceite:** Responsáveis aprovam todas as peças publicadas e as promessas exibidas.
  - **Constatação:** Não há aceite comercial por peça e por promessa pública.
  - **Evidências e referências:** `README.md`.
  - **Próxima ação:** Homologar dados, técnicas, condições e textos com responsáveis.
  - **Dependências:** 050 (Sem entrega comprovada), 095 (Parcial), 096 (Parcial), 097 (Parcial), 098 (Parcial).

- [ ] **188. Executar piloto de compradores.** Convidar grupo autorizado para tarefas representativas.
  - **Situação auditada:** Sem entrega comprovada.
  - **Aceite:** Problemas críticos de compreensão e conclusão são resolvidos.
  - **Constatação:** Não houve piloto com compradores.
  - **Evidências e referências:** `docs/ESTRATEGIA_E_PESQUISA.md`.
  - **Próxima ação:** Conduzir tarefas representativas após sanar bloqueadores.
  - **Dependências:** 080 (Sem entrega comprovada), 100 (Sem entrega comprovada), 120 (Sem entrega comprovada).

- [ ] **189. Revisar evidências de lançamento.** Consolidar testes, acessibilidade, observabilidade e rollback.
  - **Situação auditada:** Parcial.
  - **Aceite:** Checklist tem evidência por gate e responsáveis para pendências aceitas.
  - **Constatação:** Esta revisão organiza evidências e gaps; ainda faltam testes e operação para fechar gates.
  - **Evidências e referências:** `docs/REVISAO_EXAUSTIVA_PLANO.md`, `docs/VALIDACAO.md`.
  - **Próxima ação:** Completar evidências de segurança, desempenho, acesso, CRM e rollback.
  - **Dependências:** 150 (Parcial), 166 (Parcial), 170 (Sem entrega comprovada), 180 (Sem entrega comprovada), 181 (Concluída no escopo), 182 (Concluída no escopo), 183 (Concluída no escopo), 184 (Sem entrega comprovada), 185 (Parcial), 186 (Parcial), 187 (Sem entrega comprovada), 188 (Sem entrega comprovada).

- [ ] **190. Decidir prontidão comercial.** Revisar critérios P0 com os responsáveis de negócio e tecnologia.
  - **Situação auditada:** Sem entrega comprovada.
  - **Aceite:** Registro explicita liberar, adiar ou reduzir escopo, com razões verificáveis.
  - **Constatação:** Não existe decisão formal de prontidão por negócio e tecnologia.
  - **Evidências e referências:** `src/lib/plan.json`.
  - **Próxima ação:** Registrar liberar, adiar ou reduzir escopo após revisão dos P0.
  - **Dependências:** 189 (Parcial).


## Fase 20 — Lançamento, operação e evolução

**Responsável:** PO + operações + crescimento · **Prioridade:** P0/P1 · **Janela:** semanas 11–12+.

**Articulação:** fase 19.

- [ ] **191. Preparar domínio e ambientes.** Configurar preview, staging e produção com variáveis distintas.
  - **Situação auditada:** Parcial.
  - **Aceite:** Domínio, certificados e configuração são verificados sem expor staging ao índice.
  - **Constatação:** Há .env local e banco dedicado; domínios e ambientes preview/staging/produção não estão configurados.
  - **Evidências e referências:** `docs/SUPABASE_SITE_DATABASE.md`, `README.md`.
  - **Próxima ação:** Configurar ambientes e certificados com segregação de variáveis.
  - **Dependências:** 190 (Sem entrega comprovada).

- [ ] **192. Preparar publicação reversível.** Criar release identificável com artefato e versão anterior disponível.
  - **Situação auditada:** Parcial.
  - **Aceite:** Rollback é exercitado em staging e procedimento tem responsável.
  - **Constatação:** Código está versionado no GitHub; não há release de aplicação nem rollback exercitado.
  - **Evidências e referências:** `README.md`.
  - **Próxima ação:** Criar artefato implantável e ensaiar rollback em staging.
  - **Dependências:** 191 (Parcial).

- [ ] **193. Preparar operação comercial.** Treinar atendimento, validar horários e definir expectativas de resposta.
  - **Situação auditada:** Sem entrega comprovada.
  - **Aceite:** Equipe encontra, assume e responde uma solicitação de teste.
  - **Constatação:** Não há treinamento ou exercício de atendimento de solicitação teste.
  - **Evidências e referências:** `docs/ARQUITETURA_E_INTEGRACAO.md`.
  - **Próxima ação:** Preparar equipe, horários e expectativa de resposta.
  - **Dependências:** 140 (Sem entrega comprovada).

- [ ] **194. Publicar versão comercial.** Implantar somente a versão que passou pelos gates de prontidão.
  - **Situação auditada:** Sem entrega comprovada.
  - **Aceite:** Smoke de produção confirma catálogo, briefing, CRM e privacidade.
  - **Constatação:** Repositório e schema publicados não equivalem a site comercial implantado; não há smoke de produção.
  - **Evidências e referências:** `README.md`, `docs/SUPABASE_SITE_DATABASE.md`.
  - **Próxima ação:** Implantar release aprovado e validar catálogo, briefing, CRM e privacidade.
  - **Dependências:** 190 (Sem entrega comprovada), 192 (Parcial), 193 (Sem entrega comprovada).

- [ ] **195. Monitorar primeiras 48 horas.** Acompanhar erros, mídia, velocidade e solicitações recebidas.
  - **Situação auditada:** Sem entrega comprovada.
  - **Aceite:** Incidentes têm responsável e reconciliação confirma ausência de leads perdidos.
  - **Constatação:** Não ocorreu lançamento comercial nem monitoramento das primeiras 48 horas.
  - **Evidências e referências:** `src/lib/plan.json`.
  - **Próxima ação:** Monitorar e reconciliar solicitações após publicação.
  - **Dependências:** 194 (Sem entrega comprovada).

- [ ] **196. Revisar funil inicial.** Comparar visita, seleção, início de briefing, envio e qualificação.
  - **Situação auditada:** Sem entrega comprovada.
  - **Aceite:** Baseline real substitui hipóteses sem atribuir causalidade prematura ao design.
  - **Constatação:** Não existe baseline do funil real.
  - **Evidências e referências:** `docs/ESTRATEGIA_E_PESQUISA.md`.
  - **Próxima ação:** Medir eventos e qualificação após operação iniciada.
  - **Dependências:** 195 (Sem entrega comprovada).

- [ ] **197. Executar primeira melhoria validada.** Priorizar o principal atrito encontrado em pesquisa e dados.
  - **Situação auditada:** Sem entrega comprovada.
  - **Aceite:** Resultado é medido com método compatível com volume e sem promessa de uplift.
  - **Constatação:** Não houve experimento de melhoria com resultado medido no funil.
  - **Evidências e referências:** `docs/ESTRATEGIA_E_PESQUISA.md`.
  - **Próxima ação:** Priorizar atrito observado e medir intervenção adequada ao volume.
  - **Dependências:** 196 (Sem entrega comprovada).

- [ ] **198. Expandir curadoria com qualidade.** Adicionar produtos e ocasiões somente com dados e mídia aprovados.
  - **Situação auditada:** Sem entrega comprovada.
  - **Aceite:** Expansão mantém SLA, atributos confiáveis e identidade fotográfica.
  - **Constatação:** Catálogo permanece com oito peças, sem expansão homologada.
  - **Evidências e referências:** `src/lib/products.json`, `docs/audit/plan-database-check.json`.
  - **Próxima ação:** Aprovar novos produtos e mídia e testar escala antes de expandir.
  - **Dependências:** 050 (Sem entrega comprovada), 196 (Sem entrega comprovada).

- [ ] **199. Estabelecer revisão trimestral.** Revisar catálogo, conteúdo, segurança, acessibilidade e integração.
  - **Situação auditada:** Sem entrega comprovada.
  - **Aceite:** Calendário tem donos, indicadores e procedimento para corrigir drift.
  - **Constatação:** Não há calendário trimestral com donos e indicadores.
  - **Evidências e referências:** `src/lib/plan.json`.
  - **Próxima ação:** Estabelecer revisão e processo de correção de drift.
  - **Dependências:** 195 (Sem entrega comprovada).

- [ ] **200. Encerrar ciclo e abrir próxima versão.** Consolidar resultados, aprendizados, riscos e backlog priorizado.
  - **Situação auditada:** Sem entrega comprovada.
  - **Aceite:** Relatório vincula metas, evidências, entregas concluídas e decisões da evolução.
  - **Constatação:** Relatório de revisão não encerra ciclo comercial; metas e resultados de operação faltam.
  - **Evidências e referências:** `src/lib/plan.json`.
  - **Próxima ação:** Consolidar aprendizados após os marcos 197–199.
  - **Dependências:** 197 (Sem entrega comprovada), 198 (Sem entrega comprovada), 199 (Sem entrega comprovada).

---

Fontes e justificativas: [pesquisa](ESTRATEGIA_E_PESQUISA.md), [auditoria interna](AUDITORIA_PROJETO_INTERNO.md), [arquitetura](ARQUITETURA_E_INTEGRACAO.md), [design system](DESIGN_SYSTEM.md) e [validação](VALIDACAO.md).

Fonte estruturada: `src/lib/plan.json`. Gerado por `node scripts/generate-plan.mjs`; verificado por `npm run check:plan`.
