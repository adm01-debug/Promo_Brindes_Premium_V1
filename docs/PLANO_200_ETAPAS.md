# Promo Brindes Premium — plano de 200 etapas

Referência: **2026-09-20** · **20 fases × 10 etapas = 200 etapas**.

Status de referência: **63 concluídas na pesquisa/prévia; 137 pendentes**. Conclusão de etapa não representa aprovação comercial, integração em produção ou lançamento.

## Como utilizar

- `[x]`: entrega e critério atendidos no escopo explicitado, com evidência local.
- `[ ]`: etapa a executar ou validar. Não marcar sem atender ao critério.
- P0: necessário para a prontidão da frente correspondente. P1: evolução que pode ser negociada após o núcleo consultivo, conforme aceite do negócio.
- Responsáveis são papéis sugeridos, não pessoas já designadas.
- Janelas de semanas são estimativas relativas ao início aprovado, com trabalho em frentes paralelas; não são promessa de prazo. Fases fora da ordem numérica podem se apoiar entre si.
- Dependências de fase indicam articulação; dependências de etapa são explícitas. Não é necessário executar todas as 200 tarefas em série.
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
  - **Aceite:** Documento distingue protótipo, integração futura e lançamento comercial.
  - **Evidência:** `docs/ESTRATEGIA_E_PESQUISA.md`

- [x] **002. Fixar a referência do repositório.** Registrar branch, hash e data do código examinado.
  - **Aceite:** Auditoria aponta o commit 44857d5 e links reproduzíveis.
  - **Evidência:** `docs/AUDITORIA_PROJETO_INTERNO.md`
  - **Depende de:** 001.

- [x] **003. Inventariar o projeto.** Contabilizar arquivos por diretório e localizar módulos de catálogo, propostas, imagens e personalização.
  - **Aceite:** Inventário reproduzível inclui 8.319 arquivos versionados sem presumir leitura integral.
  - **Evidência:** `docs/AUDITORIA_PROJETO_INTERNO.md`
  - **Depende de:** 002.

- [x] **004. Confirmar o Supabase canônico.** Confrontar host informado com client.ts, AGENTS.md e SUPABASE_CONNECTION.md.
  - **Aceite:** A arquitetura adota exclusivamente doufsxqlfjyuvxuezpln para o catálogo canônico.
  - **Evidência:** `docs/ARQUITETURA_E_INTEGRACAO.md`
  - **Depende de:** 002.

- [x] **005. Mapear fronteiras de autenticação.** Ler composição de rotas e identificar catálogo, propostas e revista pública.
  - **Aceite:** Mapa mostra rotas protegidas e públicas com referências aos arquivos.
  - **Evidência:** `docs/AUDITORIA_PROJETO_INTERNO.md`
  - **Depende de:** 002.

- [x] **006. Qualificar o grafo disponível.** Checar artefatos graphify e a revisão que originou o relatório existente.
  - **Aceite:** Fica explícito que graph.json está ausente e o relatório é anterior ao commit auditado.
  - **Evidência:** `docs/AUDITORIA_PROJETO_INTERNO.md`
  - **Depende de:** 002.

- [x] **007. Validar leitura pública pontual.** Consultar uma projeção limitada de produtos sem escrita e guardar a amostra permitida.
  - **Aceite:** Respostas HTTP e campos selecionados são registrados sem chaves ou dados pessoais.
  - **Evidência:** `docs/audit/catalog-sample.json`
  - **Depende de:** 004.

- [ ] **008. Observar o comercial em uso.** Acompanhar representantes em catálogo, kit, simulação e proposta no ambiente autorizado.
  - **Aceite:** Ao menos três sessões de tarefas reais são registradas com tempos, erros e necessidades.
  - **Evidência:** Pendente; anexar resultado verificável antes de concluir.

- [x] **009. Inspecionar qualidade da amostra.** Confrontar nomes, descrições, fotos, mínimos e materiais das peças examinadas.
  - **Aceite:** Registro diferencia inconsistências verificadas de hipóteses que precisam de validação.
  - **Evidência:** `docs/AUDITORIA_PROJETO_INTERNO.md`
  - **Depende de:** 007.

- [x] **010. Consolidar achados e limites.** Produzir matriz de riscos com evidências, impacto e próxima ação.
  - **Aceite:** Cada achado tem origem documental, código, leitura ao vivo ou hipótese claramente identificada.
  - **Evidência:** `docs/AUDITORIA_PROJETO_INTERNO.md`
  - **Depende de:** 003, 004, 005, 006, 007, 009.


## Fase 02 — Pesquisa de mercado e evidências de UX

**Responsável:** Pesquisa + UX · **Prioridade:** P0 · **Janela:** semanas 1–2.

**Articulação:** fase 01.

- [x] **011. Pesquisar compra corporativa de luxo.** Comparar os serviços corporativos de Smythson, Burberry e Tiffany.
  - **Aceite:** Matriz cita fontes primárias e explica a aplicação ao contexto B2B brasileiro.
  - **Evidência:** `docs/ESTRATEGIA_E_PESQUISA.md`

- [x] **012. Pesquisar personalização.** Examinar apresentação de gravação e escolhas de personalização na Montblanc.
  - **Aceite:** Diretrizes distinguem inspiração de promessa operacional da Promo.
  - **Evidência:** `docs/ESTRATEGIA_E_PESQUISA.md`

- [x] **013. Pesquisar linguagem de produto.** Analisar narrativa de design e produto na Bang & Olufsen.
  - **Aceite:** Decisões editoriais são apresentadas como interpretação, sem copiar identidade ou conteúdo.
  - **Evidência:** `docs/ESTRATEGIA_E_PESQUISA.md`

- [x] **014. Pesquisar concorrência brasileira.** Inspecionar navegação, cotação e categorias na Luminati.
  - **Aceite:** São registrados padrões observáveis e oportunidades de diferenciação sem números de desempenho inventados.
  - **Evidência:** `docs/ESTRATEGIA_E_PESQUISA.md`

- [x] **015. Revisar pesquisa de luxo e usabilidade.** Confrontar recomendações de NN/g sobre luxo, clareza e atendimento.
  - **Aceite:** Relatório conecta achados a navegação, leitura de conteúdo e contato consultivo.
  - **Evidência:** `docs/ESTRATEGIA_E_PESQUISA.md`

- [x] **016. Revisar descoberta de produtos.** Aplicar pesquisa Baymard de busca, filtros e listas de produtos.
  - **Aceite:** Critérios cobrem estado aplicado, zero resultados e informações comparáveis.
  - **Evidência:** `docs/ESTRATEGIA_E_PESQUISA.md`

- [x] **017. Revisar acessibilidade oficial.** Consultar WCAG 2.2, contraste, foco e tamanho de alvos.
  - **Aceite:** Requisitos AA são diferenciados da meta interna mais confortável de 44 pixels.
  - **Evidência:** `docs/ESTRATEGIA_E_PESQUISA.md`

- [x] **018. Revisar desempenho oficial.** Consultar Google Web Vitals e distinguir laboratório de campo.
  - **Aceite:** Metas LCP ≤2,5 s, INP ≤200 ms e CLS ≤0,1 usam percentil 75 e segmentação.
  - **Evidência:** `docs/ESTRATEGIA_E_PESQUISA.md`

- [x] **019. Revisar SEO e segurança de dados.** Consultar Google Search Central e documentação oficial Supabase.
  - **Aceite:** Estratégia fundamenta URLs, renderização, RLS e projeção mínima de dados.
  - **Evidência:** `docs/ESTRATEGIA_E_PESQUISA.md`

- [x] **020. Construir matriz de decisões.** Relacionar cada referência a uma decisão, um risco e uma validação.
  - **Aceite:** Documento contém links, data de acesso e páginas indisponíveis sem fingir inspeção.
  - **Evidência:** `docs/ESTRATEGIA_E_PESQUISA.md`
  - **Depende de:** 011, 012, 013, 014, 015, 016, 017, 018, 019.


## Fase 03 — Posicionamento, descoberta e mensuração

**Responsável:** Estratégia + comercial · **Prioridade:** P0 · **Janela:** semanas 2–3.

**Articulação:** fase 01, fase 02.

- [x] **021. Definir hipótese de posicionamento.** Propor presentes com intenção, curadoria e cuidado como centro do valor.
  - **Aceite:** Uma frase de posicionamento e limites de promessa estão documentados.
  - **Evidência:** `docs/ESTRATEGIA_E_PESQUISA.md`
  - **Depende de:** 020.

- [ ] **022. Definir segmentos prioritários.** Separar RH, marketing, compras, agências e relacionamento executivo.
  - **Aceite:** Cada segmento tem ocasião, ticket a investigar e contexto de decisão.
  - **Evidência:** Pendente; anexar resultado verificável antes de concluir.
  - **Depende de:** 021.

- [ ] **023. Entrevistar compradores.** Realizar entrevistas sobre compras anteriores, dificuldades e critérios de aprovação.
  - **Aceite:** Pelo menos seis entrevistas fornecem evidências, sem tratar personas hipotéticas como pesquisa.
  - **Evidência:** Pendente; anexar resultado verificável antes de concluir.
  - **Depende de:** 022.

- [ ] **024. Entrevistar vendedores.** Identificar informações indispensáveis para transformar interesse em proposta.
  - **Aceite:** Vendedores validam campos, objeções recorrentes e etapas de qualificação.
  - **Evidência:** Pendente; anexar resultado verificável antes de concluir.
  - **Depende de:** 005.

- [ ] **025. Mapear a jornada atual.** Descrever descoberta, seleção, briefing, orçamento, amostra, aprovação e entrega.
  - **Aceite:** Mapa identifica pontos de espera, donos e falhas de contexto.
  - **Evidência:** Pendente; anexar resultado verificável antes de concluir.
  - **Depende de:** 023, 024.

- [ ] **026. Priorizar ocasiões.** Avaliar onboarding, reconhecimento, fim de ano, relacionamento e eventos.
  - **Aceite:** Prioridade é aprovada usando demanda comercial e disponibilidade reais.
  - **Evidência:** Pendente; anexar resultado verificável antes de concluir.
  - **Depende de:** 025.

- [ ] **027. Definir oferta de entrada.** Selecionar um escopo inicial de produtos e serviços que a operação pode cumprir.
  - **Aceite:** Critérios de inclusão excluem itens sem informações, imagem ou condições confiáveis.
  - **Evidência:** Pendente; anexar resultado verificável antes de concluir.
  - **Depende de:** 026.

- [ ] **028. Definir métricas de negócio.** Estabelecer briefing qualificado, proposta emitida e receita como resultados do funil.
  - **Aceite:** Cada KPI tem fórmula, fonte, janela, responsável e baseline ainda a medir.
  - **Evidência:** Pendente; anexar resultado verificável antes de concluir.
  - **Depende de:** 025.

- [ ] **029. Priorizar hipóteses de conversão.** Listar hipóteses de impacto para busca, preço e atendimento consultivo.
  - **Aceite:** Backlog separa evidência de opinião e inclui método de avaliação.
  - **Evidência:** Pendente; anexar resultado verificável antes de concluir.
  - **Depende de:** 028.

- [ ] **030. Validar o escopo do MVP.** Alinhar funcionalidades do primeiro lançamento com operação e capacidade.
  - **Aceite:** PO e comercial aprovam uma lista de entrada e saída do MVP.
  - **Evidência:** Pendente; anexar resultado verificável antes de concluir.
  - **Depende de:** 027, 029.


## Fase 04 — Identidade, direção de arte e voz

**Responsável:** Direção de arte + conteúdo · **Prioridade:** P0 · **Janela:** semanas 2–4.

**Articulação:** fase 02, fase 03.

- [x] **031. Propor a assinatura premium.** Criar aplicação de Promo Brindes com assinatura Premium Collection.
  - **Aceite:** Marca conceitual mantém o nome existente e não pressupõe registro ou aprovação final.
  - **Evidência:** `src/components/Storefront.tsx`
  - **Depende de:** 021.

- [x] **032. Definir paleta semântica.** Especificar obsidiana, champanhe, marfim e superfícies auxiliares.
  - **Aceite:** Tokens CSS têm função definida e pares de contraste verificáveis.
  - **Evidência:** `src/app/globals.css`
  - **Depende de:** 031.

- [x] **033. Definir sistema tipográfico.** Combinar Cormorant Garamond em títulos e Manrope em interface.
  - **Aceite:** Fontes são locais e pesos usados estão documentados.
  - **Evidência:** `src/app/layout.tsx`
  - **Depende de:** 031.

- [x] **034. Definir voz editorial.** Escrever tom, vocabulário, mensagens de ação e expressões proibidas.
  - **Aceite:** Guia privilegia clareza e evita superlativos, urgência e certificações sem evidência.
  - **Evidência:** `docs/DESIGN_SYSTEM.md`
  - **Depende de:** 021.

- [x] **035. Definir gramática fotográfica.** Especificar iluminação, materiais, enquadramento e fundo por tipo de imagem.
  - **Aceite:** Brief separa fotografia de produto e composição conceitual de campanha.
  - **Evidência:** `docs/DESIGN_SYSTEM.md`
  - **Depende de:** 011.

- [x] **036. Criar imagem conceitual principal.** Gerar composição exclusiva de caixa preta e presentes com detalhes champanhe.
  - **Aceite:** Arquivo e prompt são preservados e a imagem não é atribuída a um SKU real.
  - **Evidência:** `public/images/hero-gifting.webp`
  - **Depende de:** 035.

- [ ] **037. Definir direção para embalagens.** Desenhar opções de apresentação sujeitas a fornecedor e aprovação operacional.
  - **Aceite:** Moodboard identifica acabamentos sugeridos e os ainda não disponíveis.
  - **Evidência:** Pendente; anexar resultado verificável antes de concluir.
  - **Depende de:** 035.

- [x] **038. Definir ícones e ornamentação.** Estabelecer família de ícones, espessura e uso limitado de detalhes decorativos.
  - **Aceite:** Interface utiliza uma família coerente com nomes acessíveis nos controles.
  - **Evidência:** `src/components/Storefront.tsx`
  - **Depende de:** 031.

- [ ] **039. Validar identidade com público.** Comparar duas direções com compradores do público prioritário.
  - **Aceite:** Resultado registra percepção, confiança e compreensão sem perguntar só preferência estética.
  - **Evidência:** Pendente; anexar resultado verificável antes de concluir.
  - **Depende de:** 031, 032, 033, 035.

- [ ] **040. Fechar guia de marca digital.** Documentar componentes, fotografia, voz e exemplos aprovados.
  - **Aceite:** Guia passa pela marca e pelo comercial antes de aplicação definitiva.
  - **Evidência:** Pendente; anexar resultado verificável antes de concluir.
  - **Depende de:** 039.


## Fase 05 — Curadoria e qualidade do catálogo

**Responsável:** Conteúdo + dados + comercial · **Prioridade:** P0 · **Janela:** semanas 3–5.

**Articulação:** fase 01, fase 03.

- [ ] **041. Criar critérios da seleção premium.** Definir valor percebido, utilidade, acabamento e viabilidade como critérios.
  - **Aceite:** Cada produto candidato recebe justificativa e status de validação comercial.
  - **Evidência:** Pendente; anexar resultado verificável antes de concluir.
  - **Depende de:** 027.

- [x] **042. Selecionar peças iniciais reais.** Usar produtos identificáveis do catálogo para a prévia.
  - **Aceite:** Oito produtos preservam IDs, SKUs e nomes técnicos de origem.
  - **Evidência:** `src/lib/products.json`
  - **Depende de:** 007.

- [ ] **043. Revisar materiais por SKU.** Comparar materiais estruturados com descrição e ficha do fornecedor.
  - **Aceite:** Conflitos de couro, PET, plástico ou capacidade ficam resolvidos antes de publicação.
  - **Evidência:** Pendente; anexar resultado verificável antes de concluir.
  - **Depende de:** 042.

- [ ] **044. Revisar capacidades e dimensões.** Uniformizar ml, litros, centímetros e peso sem inventar especificações.
  - **Aceite:** Produto, variante e imagem exibem a mesma capacidade e versão.
  - **Evidência:** Pendente; anexar resultado verificável antes de concluir.
  - **Depende de:** 042.

- [ ] **045. Definir quantidades mínimas reais.** Distinguir mínimo comercial, embalagem múltipla e mínimo de personalização.
  - **Aceite:** Contrato explicita cada restrição e o front valida combinações corretamente.
  - **Evidência:** Pendente; anexar resultado verificável antes de concluir.
  - **Depende de:** 042, 024.

- [ ] **046. Revalidar preços e faixas.** Conferir venda, quantidade, gravação, impostos, validade e frete.
  - **Aceite:** Toda oferta pública informa sua base; preço sem contexto permanece sob consulta.
  - **Evidência:** Pendente; anexar resultado verificável antes de concluir.
  - **Depende de:** 042, 024.

- [x] **047. Verificar mídia por amostragem.** Testar URLs principais e alternativas das peças escolhidas.
  - **Aceite:** 403 das imagens principais e sucesso das alternativas ficam registrados sem generalizar ao catálogo inteiro.
  - **Evidência:** `docs/audit/media-check.json`
  - **Depende de:** 007.

- [x] **048. Preparar ativos para a prévia.** Obter fotos reais pela alternativa já cadastrada e otimizar cópias locais.
  - **Aceite:** Oito imagens locais carregam e correspondem aos respectivos SKUs.
  - **Evidência:** `public/images/`
  - **Depende de:** 047.

- [ ] **049. Obter direitos de publicação.** Validar autorização de uso das fotos, marcas de terceiros e evidências de sustentabilidade.
  - **Aceite:** Registro de licenças e comprovações acompanha os ativos do lançamento.
  - **Evidência:** Pendente; anexar resultado verificável antes de concluir.
  - **Depende de:** 048.

- [ ] **050. Definir manutenção editorial.** Atribuir responsável por dados, imagens e expiração de coleções.
  - **Aceite:** SLA interno e processo de retirada de conteúdo incorreto estão acordados.
  - **Evidência:** Pendente; anexar resultado verificável antes de concluir.
  - **Depende de:** 043, 044, 045, 046, 049.


## Fase 06 — Arquitetura de informação e jornadas

**Responsável:** UX + conteúdo · **Prioridade:** P0 · **Janela:** semanas 3–5.

**Articulação:** fase 03, fase 05.

- [ ] **051. Projetar sitemap público.** Mapear início, coleções, produtos, projeto, conteúdo e páginas institucionais.
  - **Aceite:** Sitemap diferencia rotas MVP, futuras e privadas.
  - **Evidência:** Pendente; anexar resultado verificável antes de concluir.
  - **Depende de:** 030.

- [ ] **052. Definir nomes de navegação.** Usar rótulos compreensíveis para compradores, com linguagem premium nos conteúdos.
  - **Aceite:** Tree test confirma que usuários encontram categoria e pedido de orçamento.
  - **Evidência:** Pendente; anexar resultado verificável antes de concluir.
  - **Depende de:** 051.

- [ ] **053. Definir taxonomia de ocasiões.** Relacionar cada ocasião a coleções e produtos elegíveis.
  - **Aceite:** Uma ocasião não duplica o cadastro do produto nem altera seu SKU.
  - **Evidência:** Pendente; anexar resultado verificável antes de concluir.
  - **Depende de:** 026.

- [ ] **054. Definir jornada sem cadastro.** Permitir explorar, favoritar e iniciar briefing antes de autenticação.
  - **Aceite:** Roteiro de teste chega ao briefing sem conta obrigatória.
  - **Evidência:** Pendente; anexar resultado verificável antes de concluir.
  - **Depende de:** 051.

- [ ] **055. Definir fluxo de seleção.** Separar lista de interesse de pedido confirmado e reserva de estoque.
  - **Aceite:** Textos e estados deixam clara a natureza consultiva de cada etapa.
  - **Evidência:** Pendente; anexar resultado verificável antes de concluir.
  - **Depende de:** 054.

- [ ] **056. Definir jornada de retorno.** Desenhar retomada de seleção, validade e dados que podem ser persistidos.
  - **Aceite:** Política cobre dispositivo compartilhado, expiração e limpeza da seleção.
  - **Evidência:** Pendente; anexar resultado verificável antes de concluir.
  - **Depende de:** 055.

- [ ] **057. Definir jornada móvel.** Priorizar busca, seleção e briefing em telas pequenas.
  - **Aceite:** Protótipo cobre 360 pixels e teclado virtual sem perder ações principais.
  - **Evidência:** Pendente; anexar resultado verificável antes de concluir.
  - **Depende de:** 054.

- [ ] **058. Definir estados excepcionais.** Mapear vazio, erro, offline, SKU removido e conteúdo expirado.
  - **Aceite:** Cada estado tem mensagem útil e caminho de recuperação.
  - **Evidência:** Pendente; anexar resultado verificável antes de concluir.
  - **Depende de:** 054.

- [ ] **059. Validar arquitetura com compradores.** Aplicar teste de árvore ou tarefas de localização no sitemap.
  - **Aceite:** Resultados documentam sucesso por tarefa e mudanças necessárias.
  - **Evidência:** Pendente; anexar resultado verificável antes de concluir.
  - **Depende de:** 052, 053.

- [ ] **060. Documentar fluxos aprovados.** Produzir wireflows que liguem ações públicas ao atendimento comercial.
  - **Aceite:** Cada transição tem entrada, saída, erro e responsável.
  - **Evidência:** Pendente; anexar resultado verificável antes de concluir.
  - **Depende de:** 059.


## Fase 07 — Sistema de design e componentes

**Responsável:** Design de produto + frontend · **Prioridade:** P0 · **Janela:** semanas 4–6.

**Articulação:** fase 04, fase 06.

- [x] **061. Implementar tokens de interface.** Codificar cores, tipografia, espaçamento, bordas e superfícies.
  - **Aceite:** Tokens usados na prévia estão centralizados e nomeados por função.
  - **Evidência:** `src/app/globals.css`
  - **Depende de:** 032, 033.

- [x] **062. Definir grade responsiva.** Construir limites de largura, margens e quebra de colunas.
  - **Aceite:** Sem rolagem horizontal em 360, 390, 768 e 1440 pixels.
  - **Evidência:** `docs/VALIDACAO.md`
  - **Depende de:** 061.

- [x] **063. Implementar botões e links.** Criar ações primárias, secundárias e ícones com hierarquia consistente.
  - **Aceite:** Hover, foco, disabled e nomes acessíveis ficam inspecionados.
  - **Evidência:** `src/app/globals.css`
  - **Depende de:** 061.

- [x] **064. Implementar cartão de produto.** Combinar imagem, categoria, título, favorito e adicionar à seleção.
  - **Aceite:** Ações são independentes, acessíveis e não abrem destinos inesperados.
  - **Evidência:** `src/components/Storefront.tsx`
  - **Depende de:** 042, 061.

- [x] **065. Implementar diálogos acessíveis.** Usar modal com Escape, contenção de foco e restauração do foco.
  - **Aceite:** Testes de teclado comprovam abertura, fechamento e retorno ao acionador.
  - **Evidência:** `docs/VALIDACAO.md`
  - **Depende de:** 061.

- [x] **066. Implementar controles de formulário.** Padronizar labels, ajuda, validação e estados de campos.
  - **Aceite:** Erros podem ser identificados sem depender apenas de cor.
  - **Evidência:** `src/components/Storefront.tsx`
  - **Depende de:** 061.

- [x] **067. Implementar feedback de interação.** Adicionar mensagens de adição e estados de download.
  - **Aceite:** Feedback é anunciado por tecnologia assistiva sem capturar foco.
  - **Evidência:** `src/components/Storefront.tsx`
  - **Depende de:** 061.

- [x] **068. Especificar movimento.** Limitar animações a feedback e transições discretas.
  - **Aceite:** Preferência de movimento reduzido desativa transições e rolagem suave.
  - **Evidência:** `src/app/globals.css`
  - **Depende de:** 061.

- [x] **069. Catalogar componentes.** Criar documentação de variantes, exemplos e decisões de uso.
  - **Aceite:** Biblioteca permite reproduzir todas as páginas MVP sem improvisos.
  - **Evidência:** `docs/ARQUITETURA_INFORMACAO_E_FLUXOS.md`
  - **Depende de:** 061, 062, 063, 064, 065, 066, 067, 068.

- [ ] **070. Revisar consistência transversal.** Inspecionar tipografia, densidade, ícones e espaçamento entre páginas.
  - **Aceite:** Desvios do sistema de design são corrigidos ou justificados.
  - **Evidência:** Pendente; anexar resultado verificável antes de concluir.
  - **Depende de:** 069.


## Fase 08 — Página inicial e narrativa de marca

**Responsável:** Design + frontend + conteúdo · **Prioridade:** P0 · **Janela:** semanas 4–6.

**Articulação:** fase 04, fase 05, fase 07.

- [x] **071. Construir cabeçalho público.** Organizar marca, navegação, busca e seleção em desktop e mobile.
  - **Aceite:** Todos os destinos e controles realizam a ação indicada.
  - **Evidência:** `src/components/Storefront.tsx`
  - **Depende de:** 063.

- [x] **072. Construir hero editorial.** Aplicar conceito visual preto e champanhe com proposta clara.
  - **Aceite:** Título legível, imagem principal priorizada e CTA visível em telas testadas.
  - **Evidência:** `src/components/Storefront.tsx`
  - **Depende de:** 036, 061.

- [x] **073. Construir proposta de valor.** Apresentar curadoria, identidade e projeto sem promessas operacionais não verificadas.
  - **Aceite:** Textos da faixa de valor são sustentáveis pelo serviço proposto.
  - **Evidência:** `src/components/Storefront.tsx`
  - **Depende de:** 021.

- [x] **074. Construir curadoria em destaque.** Exibir seleção curta com continuidade para mais produtos.
  - **Aceite:** Quatro peças iniciais e expansão para oito funcionam na prévia.
  - **Evidência:** `src/components/Storefront.tsx`
  - **Depende de:** 042, 048, 064.

- [x] **075. Construir coleções editoriais.** Criar entradas por contexto de presente com imagens e narrativa.
  - **Aceite:** Cliques conduzem à seleção correspondente com filtro aplicado.
  - **Evidência:** `src/components/Storefront.tsx`
  - **Depende de:** 042, 048.

- [x] **076. Construir seção de personalização.** Explicar peça, identidade e apresentação com fotografia e texto.
  - **Aceite:** Limitações por produto ficam visíveis e não há promessa universal de técnica.
  - **Evidência:** `src/components/Storefront.tsx`
  - **Depende de:** 035.

- [ ] **077. Construir explicação do processo.** Mostrar como seleção e briefing avançam para proposta comercial.
  - **Aceite:** Comprador consegue descrever o próximo passo após ler a seção.
  - **Evidência:** Pendente; anexar resultado verificável antes de concluir.
  - **Depende de:** 021.

- [x] **078. Construir perguntas frequentes.** Responder mínimo, prazo, personalização e kits.
  - **Aceite:** Acordeões funcionam por teclado e respostas refletem condições a confirmar.
  - **Evidência:** `src/components/Storefront.tsx`
  - **Depende de:** 021.

- [x] **079. Construir encerramento e rodapé.** Reforçar a ação de projeto, navegação e privacidade.
  - **Aceite:** Nenhum contato fictício, selo sem prova ou link vazio é exibido.
  - **Evidência:** `src/components/Storefront.tsx`
  - **Depende de:** 071.

- [ ] **080. Validar home com usuários.** Observar compreensão de oferta e primeiro caminho escolhido.
  - **Aceite:** Cinco compradores completam tarefa sem explicação prévia do moderador.
  - **Evidência:** Pendente; anexar resultado verificável antes de concluir.
  - **Depende de:** 071, 072, 073, 074, 075, 076, 077, 078, 079.


## Fase 09 — Busca, filtros e descoberta

**Responsável:** UX + frontend + backend · **Prioridade:** P0 · **Janela:** semanas 5–7.

**Articulação:** fase 05, fase 06, fase 07.

- [x] **081. Implementar busca da seleção.** Permitir buscar nome, SKU e categoria com normalização de acentos.
  - **Aceite:** Busca de caderno, código válido e consulta sem resultados são testadas.
  - **Evidência:** `docs/VALIDACAO.md`
  - **Depende de:** 042.

- [x] **082. Implementar categorias iniciais.** Filtrar a seleção por kits, escrita, lifestyle e viagem.
  - **Aceite:** Filtro ativo e listagem mantêm correspondência sem itens de outra categoria.
  - **Evidência:** `src/components/Storefront.tsx`
  - **Depende de:** 042.

- [x] **083. Implementar favoritos locais.** Salvar identificadores válidos e oferecer listagem de favoritos.
  - **Aceite:** Favorito persiste após recarregar e armazenamento corrompido não quebra a página.
  - **Evidência:** `docs/VALIDACAO.md`
  - **Depende de:** 064.

- [x] **084. Implementar estados sem resultados.** Explicar busca vazia e oferecer recuperação de filtros.
  - **Aceite:** Usuário pode voltar à seleção completa em uma ação.
  - **Evidência:** `src/components/Storefront.tsx`
  - **Depende de:** 081.

- [ ] **085. Projetar filtros comerciais reais.** Incluir material, faixa de investimento, prazo e mínimo conforme dados aprovados.
  - **Aceite:** Filtros usam atributos confiáveis e não prometem estoque ou prazo inexistentes.
  - **Evidência:** Pendente; anexar resultado verificável antes de concluir.
  - **Depende de:** 045, 046.

- [ ] **086. Implementar facetas combináveis.** Permitir múltiplas escolhas por atributo e indicar quantidade de resultados.
  - **Aceite:** Semântica OR no grupo e AND entre grupos é validada no contrato.
  - **Evidência:** Pendente; anexar resultado verificável antes de concluir.
  - **Depende de:** 085.

- [ ] **087. Implementar ordenação pública.** Ordenar por critérios úteis com desempate determinístico.
  - **Aceite:** Paginação não repete nem perde produtos ao mudar ordenação.
  - **Evidência:** Pendente; anexar resultado verificável antes de concluir.
  - **Depende de:** 126.

- [ ] **088. Implementar URLs de busca.** Manter consulta, filtros e página ao compartilhar ou usar voltar.
  - **Aceite:** Navegação e política de indexação tratam parâmetros consistentemente.
  - **Evidência:** Pendente; anexar resultado verificável antes de concluir.
  - **Depende de:** 086.

- [ ] **089. Implementar paginação de servidor.** Buscar apenas o conjunto necessário com cancelamento e limites.
  - **Aceite:** Nenhuma jornada pública baixa milhares de registros para filtrar no cliente.
  - **Evidência:** Pendente; anexar resultado verificável antes de concluir.
  - **Depende de:** 127.

- [ ] **090. Testar relevância da descoberta.** Avaliar consultas reais, abreviações e sinônimos do comercial.
  - **Aceite:** Conjunto de referência tem ranking esperado e métricas de acerto.
  - **Evidência:** Pendente; anexar resultado verificável antes de concluir.
  - **Depende de:** 081, 086, 087, 088, 089.


## Fase 10 — Página de produto e confiança

**Responsável:** UX + conteúdo + frontend · **Prioridade:** P0 · **Janela:** semanas 5–7.

**Articulação:** fase 05, fase 07, fase 09.

- [x] **091. Construir detalhe rápido.** Exibir fotografia, descrição, SKU, mínimo e inclusão no projeto.
  - **Aceite:** As oito peças da prévia têm dados de origem e modal funcional.
  - **Evidência:** `src/components/Storefront.tsx`
  - **Depende de:** 042, 048.

- [ ] **092. Construir páginas permanentes.** Criar rota indexável por slug com ID canônico estável.
  - **Aceite:** Link direto e navegação sem JavaScript preservam conteúdo principal.
  - **Evidência:** Pendente; anexar resultado verificável antes de concluir.
  - **Depende de:** 091, 126.

- [ ] **093. Construir galeria fiel ao SKU.** Reunir ângulos, detalhes, escala e embalagem real.
  - **Aceite:** Imagens não misturam variantes ou sugerem componentes não inclusos.
  - **Evidência:** Pendente; anexar resultado verificável antes de concluir.
  - **Depende de:** 049.

- [ ] **094. Exibir variantes confirmadas.** Oferecer apenas cores e tamanhos existentes para a peça.
  - **Aceite:** Seleção de variante atualiza imagem, SKU e condições de disponibilidade.
  - **Evidência:** Pendente; anexar resultado verificável antes de concluir.
  - **Depende de:** 124.

- [ ] **095. Exibir informação técnica revisada.** Organizar materiais, medidas, capacidade e itens inclusos.
  - **Aceite:** Conteúdo coincide com ficha validada e resolve ambiguidades da importação.
  - **Evidência:** Pendente; anexar resultado verificável antes de concluir.
  - **Depende de:** 043, 044.

- [ ] **096. Explicar condições de preço.** Diferenciar item, personalização, embalagem, frete e impostos.
  - **Aceite:** Qualquer preço de entrada tem quantidade de referência e validade explícitas.
  - **Evidência:** Pendente; anexar resultado verificável antes de concluir.
  - **Depende de:** 046.

- [ ] **097. Explicar prazo e disponibilidade.** Mostrar estimativas condicionadas às etapas reais de produção.
  - **Aceite:** Consulta de estoque não é apresentada como reserva garantida.
  - **Evidência:** Pendente; anexar resultado verificável antes de concluir.
  - **Depende de:** 124.

- [ ] **098. Criar conteúdo de personalização por peça.** Relacionar técnica, local de gravação e limites aplicáveis.
  - **Aceite:** Informações são consistentes com áreas e técnicas aprovadas no sistema.
  - **Evidência:** Pendente; anexar resultado verificável antes de concluir.
  - **Depende de:** 101.

- [ ] **099. Criar recomendação contextual.** Sugerir complementos ou alternativas compatíveis com ocasião e faixa.
  - **Aceite:** Sem recomendação de itens inativos, indisponíveis ou não validados.
  - **Evidência:** Pendente; anexar resultado verificável antes de concluir.
  - **Depende de:** 053, 127.

- [ ] **100. Validar decisão de produto.** Testar se comprador entende inclusões, mínimo e próxima ação.
  - **Aceite:** Dúvidas críticas são resolvidas antes de enviar briefing.
  - **Evidência:** Pendente; anexar resultado verificável antes de concluir.
  - **Depende de:** 092, 093, 094, 095, 096, 097, 098, 099.


## Fase 11 — Personalização e montagem de kits

**Responsável:** Produto + operação + frontend · **Prioridade:** P1 · **Janela:** semanas 6–8.

**Articulação:** fase 10, fase 13.

- [ ] **101. Mapear técnicas disponíveis.** Relacionar técnicas e áreas reais ao catálogo público aprovado.
  - **Aceite:** Não há enumeração de técnica universal sem elegibilidade por produto.
  - **Evidência:** Pendente; anexar resultado verificável antes de concluir.
  - **Depende de:** 123, 124.

- [ ] **102. Projetar escolha de gravação.** Desenhar seleção de posição, técnica, cores e observações.
  - **Aceite:** Fluxo mantém dependências claras e previne combinações inválidas.
  - **Evidência:** Pendente; anexar resultado verificável antes de concluir.
  - **Depende de:** 101.

- [ ] **103. Definir envio de logotipo.** Especificar tipos permitidos, tamanho máximo, retenção e acesso.
  - **Aceite:** Contrato exige validação de conteúdo e armazenamento privado.
  - **Evidência:** Pendente; anexar resultado verificável antes de concluir.
  - **Depende de:** 141.

- [ ] **104. Implementar upload seguro.** Receber arquivo pelo backend autorizado com verificação adequada.
  - **Aceite:** Arquivo inválido, excessivo ou sem autorização é rejeitado e registrado sem conteúdo sensível.
  - **Evidência:** Pendente; anexar resultado verificável antes de concluir.
  - **Depende de:** 103, 145.

- [ ] **105. Distinguir simulação de prova final.** Identificar visualização como aproximada e prever aprovação de arte.
  - **Aceite:** Nenhum preview é tratado como ordem de produção automaticamente.
  - **Evidência:** Pendente; anexar resultado verificável antes de concluir.
  - **Depende de:** 102.

- [ ] **106. Definir composição de kits.** Mapear componentes, quantidades, embalagem e compatibilidade.
  - **Aceite:** Um kit preserva IDs de todos os componentes e regras de múltiplos.
  - **Evidência:** Pendente; anexar resultado verificável antes de concluir.
  - **Depende de:** 101.

- [ ] **107. Definir apresentação do kit.** Oferecer embalagens de acordo com capacidade e disponibilidade.
  - **Aceite:** Dimensões e inclusão da embalagem são confirmadas no orçamento.
  - **Evidência:** Pendente; anexar resultado verificável antes de concluir.
  - **Depende de:** 106.

- [ ] **108. Projetar cartão e mensagem.** Permitir texto com limites adequados à produção e revisão.
  - **Aceite:** Limites de caracteres e necessidade de aprovação ficam claros.
  - **Evidência:** Pendente; anexar resultado verificável antes de concluir.
  - **Depende de:** 107.

- [ ] **109. Implementar cálculo consistente.** Reutilizar cálculo validado no backend para peças e personalização.
  - **Aceite:** Preço público não revela custo, margem ou regras comerciais internas.
  - **Evidência:** Pendente; anexar resultado verificável antes de concluir.
  - **Depende de:** 106, 136.

- [ ] **110. Testar passagem da arte à produção.** Simular kit completo com peça, gravação, embalagem e mensagem.
  - **Aceite:** Operação recebe todas as decisões com versão e aprovação registradas.
  - **Evidência:** Pendente; anexar resultado verificável antes de concluir.
  - **Depende de:** 104, 105, 107, 108, 109.


## Fase 12 — Seleção, briefing e conversão

**Responsável:** UX + frontend + comercial · **Prioridade:** P0 · **Janela:** semanas 5–8.

**Articulação:** fase 07, fase 09, fase 10.

- [x] **111. Implementar seleção persistente.** Salvar produtos e quantidades com validação dos dados locais.
  - **Aceite:** Recarregar preserva seleção válida e descarta IDs desconhecidos.
  - **Evidência:** `docs/VALIDACAO.md`
  - **Depende de:** 042.

- [x] **112. Implementar edição de quantidade.** Permitir editar, aumentar, diminuir e remover peças.
  - **Aceite:** Valor respeita mínimo cadastrado e limite máximo da prévia.
  - **Evidência:** `docs/VALIDACAO.md`
  - **Depende de:** 111.

- [x] **113. Implementar briefing aberto.** Permitir começar projeto sem produto escolhido.
  - **Aceite:** Fluxo gera documento que solicita recomendação sem inventar itens.
  - **Evidência:** `src/components/Storefront.tsx`
  - **Depende de:** 111.

- [x] **114. Implementar formulário progressivo.** Separar seleção e informações do projeto com campos essenciais.
  - **Aceite:** Contato obrigatório e campos opcionais têm labels e validação clara.
  - **Evidência:** `src/components/Storefront.tsx`
  - **Depende de:** 066.

- [x] **115. Implementar exportação de briefing.** Gerar arquivo local com SKUs, IDs, quantidade, ocasião e contato.
  - **Aceite:** Download contém seleção correta e informa que não houve envio comercial.
  - **Evidência:** `src/components/Storefront.tsx`
  - **Depende de:** 112, 113, 114.

- [ ] **116. Definir formulário de produção.** Validar dados indispensáveis, aviso de privacidade e finalidade com comercial.
  - **Aceite:** Solicitação de marketing fica separada do atendimento quando aplicável.
  - **Evidência:** Pendente; anexar resultado verificável antes de concluir.
  - **Depende de:** 024, 146.

- [ ] **117. Implementar envio real no backend.** Enviar briefing validado com chave de idempotência e proteção contra abuso.
  - **Aceite:** Duplo clique e retry não geram oportunidades duplicadas.
  - **Evidência:** Pendente; anexar resultado verificável antes de concluir.
  - **Depende de:** 116, 126, 134.

- [ ] **118. Implementar resposta confiável.** Apresentar protocolo somente após confirmação persistida no servidor.
  - **Aceite:** Falha permite tentar novamente e sucesso nunca é simulado por temporizador.
  - **Evidência:** Pendente; anexar resultado verificável antes de concluir.
  - **Depende de:** 117.

- [ ] **119. Implementar confirmação transacional.** Enviar confirmação pelo canal aprovado com resumo e próximos passos.
  - **Aceite:** Mensagem contém protocolo correto e passa por teste de entrega autorizado.
  - **Evidência:** Pendente; anexar resultado verificável antes de concluir.
  - **Depende de:** 118.

- [ ] **120. Testar continuidade da jornada.** Acompanhar um briefing do navegador até o atendimento efetivo.
  - **Aceite:** Comercial localiza seleção e contexto sem redigitação.
  - **Evidência:** Pendente; anexar resultado verificável antes de concluir.
  - **Depende de:** 118, 119, 133.


## Fase 13 — Contrato público e integração de catálogo

**Responsável:** Arquitetura + backend + dados · **Prioridade:** P0 · **Janela:** semanas 4–8.

**Articulação:** fase 01, fase 05.

- [x] **121. Definir projeção pública mínima.** Listar campos permitidos para lista, detalhe, variante e preço de venda.
  - **Aceite:** Custos, margem, origem interna, organização e credenciais ficam fora do DTO público.
  - **Evidência:** `docs/ARQUITETURA_E_INTEGRACAO.md`
  - **Depende de:** 004, 010.

- [ ] **122. Fixar host e configuração.** Validar URL por igualdade exata ou allowlist explícita no servidor.
  - **Aceite:** Configuração de projeto legado ou host parecido é rejeitada.
  - **Evidência:** Pendente; anexar resultado verificável antes de concluir.
  - **Depende de:** 004.

- [ ] **123. Revalidar esquema ao vivo.** Consultar pg_catalog do projeto correto com acesso autorizado.
  - **Aceite:** Inventário de grants, views, políticas e funções tem data e identidade comprovadas.
  - **Evidência:** Pendente; anexar resultado verificável antes de concluir.
  - **Depende de:** 004.

- [ ] **124. Validar as views existentes.** Comparar colunas e definições efetivas com contratos do repositório.
  - **Aceite:** Diferenças são explicadas; SECURITY DEFINER não é alterado por suposição.
  - **Evidência:** Pendente; anexar resultado verificável antes de concluir.
  - **Depende de:** 123.

- [ ] **125. Projetar publicação editorial.** Definir como seleção premium, ordem, texto e visibilidade referenciam IDs canônicos.
  - **Aceite:** Modelo não duplica o catálogo operacional e suporta despublicação.
  - **Evidência:** Pendente; anexar resultado verificável antes de concluir.
  - **Depende de:** 041, 124.

- [ ] **126. Preparar contrato versionado.** Especificar paginação, filtros, erros, datas e disponibilidade da API.
  - **Aceite:** Contrato revisado inclui exemplos de sucesso, vazio, inválido e indisponível.
  - **Evidência:** Pendente; anexar resultado verificável antes de concluir.
  - **Depende de:** 121, 122, 124.

- [ ] **127. Implementar leitura de catálogo.** Conectar servidor Next à projeção pública aprovada com limites de consulta.
  - **Aceite:** Dados reais são validados e erros não viram listagens vazias silenciosas.
  - **Evidência:** Pendente; anexar resultado verificável antes de concluir.
  - **Depende de:** 125, 126.

- [ ] **128. Implementar cache e atualização.** Definir TTL e invalidação por mudanças relevantes de produto e publicação.
  - **Aceite:** Produto retirado deixa de aparecer dentro do SLA definido.
  - **Evidência:** Pendente; anexar resultado verificável antes de concluir.
  - **Depende de:** 127.

- [ ] **129. Implementar saúde de mídia.** Verificar disponibilidade, fallback e dimensões das imagens autorizadas.
  - **Aceite:** CDN com 403 aciona fallback observável e não quebra a apresentação.
  - **Evidência:** Pendente; anexar resultado verificável antes de concluir.
  - **Depende de:** 047, 127.

- [ ] **130. Testar contrato ponta a ponta.** Conferir nomes, IDs, variantes, preço e resposta pública no staging.
  - **Aceite:** Suite rejeita campo sensível e acompanha drift do contrato.
  - **Evidência:** Pendente; anexar resultado verificável antes de concluir.
  - **Depende de:** 127, 128, 129.


## Fase 14 — Passagem para o comercial e CRM

**Responsável:** Backend + comercial + operações · **Prioridade:** P0 · **Janela:** semanas 7–9.

**Articulação:** fase 12, fase 13.

- [ ] **131. Mapear oportunidade e proprietário.** Definir destino dos briefings e relação com organizações e vendedores.
  - **Aceite:** Fluxo aprovado identifica sistema canônico e dono de cada oportunidade.
  - **Evidência:** Pendente; anexar resultado verificável antes de concluir.
  - **Depende de:** 024.

- [ ] **132. Definir qualificação comercial.** Estabelecer ocasião, quantidade, orçamento, prazo e critérios de elegibilidade.
  - **Aceite:** Regras não excluem oportunidades por inferências opacas sobre o comprador.
  - **Evidência:** Pendente; anexar resultado verificável antes de concluir.
  - **Depende de:** 131.

- [ ] **133. Definir payload de passagem.** Preservar IDs, SKUs, variantes, arte, quantidades e observações.
  - **Aceite:** Contrato é consumível pelo comercial sem recuperar dados de texto livre.
  - **Evidência:** Pendente; anexar resultado verificável antes de concluir.
  - **Depende de:** 126, 131, 132.

- [ ] **134. Implementar deduplicação.** Tratar mesma solicitação e contato com idempotência e janela definida.
  - **Aceite:** Retentativas não criam duplicatas nem fundem empresas distintas indevidamente.
  - **Evidência:** Pendente; anexar resultado verificável antes de concluir.
  - **Depende de:** 133.

- [ ] **135. Implementar atribuição de vendedor.** Aplicar regras aprovadas de carteira, região ou distribuição.
  - **Aceite:** Cenários de ausência e redistribuição mantêm rastreabilidade.
  - **Evidência:** Pendente; anexar resultado verificável antes de concluir.
  - **Depende de:** 131.

- [ ] **136. Reutilizar orçamento transacional.** Integrar criação e aprovação pelas capacidades existentes do sistema.
  - **Aceite:** Quote e itens permanecem atômicos e respeitam autorização e limites de desconto.
  - **Evidência:** Pendente; anexar resultado verificável antes de concluir.
  - **Depende de:** 133, 134, 135.

- [ ] **137. Definir estados de acompanhamento.** Relacionar recebido, qualificado, proposta, aprovado e encerrado.
  - **Aceite:** Cliente vê apenas estados úteis sem expor notas internas ou margem.
  - **Evidência:** Pendente; anexar resultado verificável antes de concluir.
  - **Depende de:** 136.

- [ ] **138. Instrumentar SLA de atendimento.** Medir recebimento, primeira resposta e emissão de proposta.
  - **Aceite:** Dashboard distingue horário útil e espera pelo cliente.
  - **Evidência:** Pendente; anexar resultado verificável antes de concluir.
  - **Depende de:** 137.

- [ ] **139. Implementar retries e conciliação.** Prever fila, tentativas controladas e tratamento de falhas de integração.
  - **Aceite:** Uma falha parcial não perde briefing e pode ser reprocessada por usuário autorizado.
  - **Evidência:** Pendente; anexar resultado verificável antes de concluir.
  - **Depende de:** 136.

- [ ] **140. Executar piloto com vendedores.** Acompanhar solicitações de teste até proposta revisada.
  - **Aceite:** Representantes aprovam contexto, usabilidade e ausência de redigitação crítica.
  - **Evidência:** Pendente; anexar resultado verificável antes de concluir.
  - **Depende de:** 138, 139, 120.


## Fase 15 — Segurança, privacidade e governança

**Responsável:** Segurança + jurídico + backend · **Prioridade:** P0 · **Janela:** semanas 6–10.

**Articulação:** fase 13, fase 14.

- [ ] **141. Modelar ameaças do fluxo público.** Analisar coleta abusiva, spam, upload, acesso indevido e exposição comercial.
  - **Aceite:** Modelo tem responsáveis e controles proporcionais ao risco observado.
  - **Evidência:** Pendente; anexar resultado verificável antes de concluir.
  - **Depende de:** 126, 133.

- [ ] **142. Revisar permissões anônimas.** Testar leitura e negativa de escrita com anon no projeto correto.
  - **Aceite:** Custos e PII permanecem protegidos; nenhum grant amplo é adicionado para destravar UI.
  - **Evidência:** Pendente; anexar resultado verificável antes de concluir.
  - **Depende de:** 123.

- [ ] **143. Proteger segredos de servidor.** Manter service role e integrações exclusivamente no servidor.
  - **Aceite:** Build público e logs são verificados e não contêm segredos.
  - **Evidência:** Pendente; anexar resultado verificável antes de concluir.
  - **Depende de:** 122.

- [ ] **144. Isolar requisições de orçamento.** Validar origem, tamanho, campos e limites; usar proteção conforme arquitetura.
  - **Aceite:** Abuso, payload inesperado e repetição recebem respostas controladas.
  - **Evidência:** Pendente; anexar resultado verificável antes de concluir.
  - **Depende de:** 141.

- [ ] **145. Revisar arquivos e links públicos.** Garantir acesso privado a logos e expiração de links compartilháveis.
  - **Aceite:** Cliente A não acessa arquivos ou propostas de B.
  - **Evidência:** Pendente; anexar resultado verificável antes de concluir.
  - **Depende de:** 103, 141.

- [ ] **146. Definir tratamento de dados.** Documentar finalidade, base legal, operadores, retenção e direitos com responsável jurídico.
  - **Aceite:** Mapa corresponde ao sistema implementado e identifica o controlador.
  - **Evidência:** Pendente; anexar resultado verificável antes de concluir.
  - **Depende de:** 024, 131.

- [ ] **147. Publicar política adequada.** Redigir política e contato de privacidade da empresa para a versão comercial.
  - **Aceite:** Texto aprovado descreve coleta real sem promessas impossíveis de cumprir.
  - **Evidência:** Pendente; anexar resultado verificável antes de concluir.
  - **Depende de:** 146.

- [ ] **148. Controlar cookies não essenciais.** Separar preferências necessárias de publicidade e analytics dependentes de consentimento.
  - **Aceite:** Aceitar, recusar e rever escolha são verificáveis e respeitados pelos scripts.
  - **Evidência:** Pendente; anexar resultado verificável antes de concluir.
  - **Depende de:** 146.

- [ ] **149. Definir atendimento a titulares.** Implementar processo de acesso, correção, exclusão e retenção aplicável.
  - **Aceite:** Solicitação de teste é rastreável e concluída conforme política aprovada.
  - **Evidência:** Pendente; anexar resultado verificável antes de concluir.
  - **Depende de:** 146.

- [ ] **150. Revisar segurança antes da abertura.** Aplicar checks de dependências, headers, acesso, logs e recuperação.
  - **Aceite:** Não há vulnerabilidade crítica aberta sem decisão formal e controle adequado.
  - **Evidência:** Pendente; anexar resultado verificável antes de concluir.
  - **Depende de:** 142, 143, 144, 145, 147, 148, 149.


## Fase 16 — Conteúdo, SEO e descoberta orgânica

**Responsável:** Conteúdo + SEO + frontend · **Prioridade:** P1 · **Janela:** semanas 6–10.

**Articulação:** fase 06, fase 10, fase 13.

- [ ] **151. Definir mapa de intenção de busca.** Separar páginas por categoria, ocasião e dúvida de compra real.
  - **Aceite:** Não há páginas em massa criadas apenas por variações de palavra-chave.
  - **Evidência:** Pendente; anexar resultado verificável antes de concluir.
  - **Depende de:** 023, 026.

- [ ] **152. Definir URLs e canonical.** Estabelecer slugs estáveis, redirects e política de facetas.
  - **Aceite:** Uma entidade não compete com múltiplas URLs indexáveis equivalentes.
  - **Evidência:** Pendente; anexar resultado verificável antes de concluir.
  - **Depende de:** 051, 151.

- [ ] **153. Renderizar conteúdo no servidor.** Gerar HTML inicial com proposta, produtos e links úteis.
  - **Aceite:** Conteúdo principal existe no HTML sem depender da hidratação.
  - **Evidência:** Pendente; anexar resultado verificável antes de concluir.
  - **Depende de:** 071, 092.

- [ ] **154. Implementar metadados de páginas.** Criar títulos, descrições e imagens sociais específicas.
  - **Aceite:** Não aparecem placeholders, números de estoque inventados ou títulos duplicados críticos.
  - **Evidência:** Pendente; anexar resultado verificável antes de concluir.
  - **Depende de:** 152, 153.

- [ ] **155. Implementar dados estruturados fiéis.** Usar schemas compatíveis com conteúdo real e preço confirmado.
  - **Aceite:** Não há avaliação, disponibilidade ou Offer fictício para obter destaque.
  - **Evidência:** Pendente; anexar resultado verificável antes de concluir.
  - **Depende de:** 094, 095, 096.

- [ ] **156. Implementar sitemap e robots.** Incluir apenas URLs canônicas publicáveis e manter preview fora do índice.
  - **Aceite:** Staging permanece noindex e domínio final é validado antes de liberar indexação.
  - **Evidência:** Pendente; anexar resultado verificável antes de concluir.
  - **Depende de:** 152, 154.

- [ ] **157. Produzir páginas editoriais úteis.** Escrever guias de ocasião, técnica e planejamento com participação comercial.
  - **Aceite:** Conteúdo responde dúvidas reais e aponta a produtos elegíveis.
  - **Evidência:** Pendente; anexar resultado verificável antes de concluir.
  - **Depende de:** 151.

- [ ] **158. Revisar acessibilidade de conteúdo.** Redigir alt texts, links descritivos e títulos com hierarquia.
  - **Aceite:** Texto alternativo não repete slogans nem omite conteúdo essencial.
  - **Evidência:** Pendente; anexar resultado verificável antes de concluir.
  - **Depende de:** 157.

- [ ] **159. Configurar Search Console.** Verificar domínio autorizado e acompanhar rastreamento e indexação.
  - **Aceite:** Sitemap processado e páginas estratégicas inspecionadas após lançamento.
  - **Evidência:** Pendente; anexar resultado verificável antes de concluir.
  - **Depende de:** 156, 194.

- [ ] **160. Medir qualidade do tráfego orgânico.** Relacionar entradas orgânicas a briefings qualificados, com privacidade.
  - **Aceite:** Relatório diferencia visibilidade, tráfego e resultado comercial.
  - **Evidência:** Pendente; anexar resultado verificável antes de concluir.
  - **Depende de:** 159.


## Fase 17 — Desempenho e confiabilidade

**Responsável:** Frontend + SRE + backend · **Prioridade:** P0 · **Janela:** semanas 7–10.

**Articulação:** fase 08, fase 09, fase 13.

- [ ] **161. Definir orçamento de desempenho.** Fixar limites para JS inicial, imagens, fontes e requisições do MVP.
  - **Aceite:** Orçamento está associado a páginas e condições de medição reproduzíveis.
  - **Evidência:** Pendente; anexar resultado verificável antes de concluir.
  - **Depende de:** 030.

- [ ] **162. Otimizar imagem principal.** Fornecer formatos e tamanhos adequados e priorizar apenas o LCP.
  - **Aceite:** Hero carrega sem salto e sem baixar a versão máxima em todo dispositivo.
  - **Evidência:** Pendente; anexar resultado verificável antes de concluir.
  - **Depende de:** 072.

- [ ] **163. Otimizar imagens de catálogo.** Usar dimensões reservadas, tamanhos responsivos e lazy loading.
  - **Aceite:** Cards fora da tela não competem desnecessariamente com conteúdo inicial.
  - **Evidência:** Pendente; anexar resultado verificável antes de concluir.
  - **Depende de:** 074.

- [x] **164. Otimizar fontes.** Servir famílias locais e somente os pesos necessários.
  - **Aceite:** Não há dependência de fonte de terceiros nem bloqueio prolongado de texto.
  - **Evidência:** `src/app/layout.tsx`
  - **Depende de:** 033.

- [ ] **165. Separar código por necessidade.** Adiar componentes pesados de configuração e planejamento.
  - **Aceite:** Visitante da home não carrega ferramentas do backoffice ou integrações administrativas.
  - **Evidência:** Pendente; anexar resultado verificável antes de concluir.
  - **Depende de:** 153.

- [ ] **166. Medir laboratório móvel.** Executar Lighthouse repetido com cenário e ambiente registrados.
  - **Aceite:** Resultados não são apresentados como percentil real de usuários.
  - **Evidência:** Pendente; anexar resultado verificável antes de concluir.
  - **Depende de:** 161, 162, 163, 164, 165.

- [ ] **167. Medir Core Web Vitals em campo.** Instrumentar métricas reais conforme decisão de privacidade e consentimento.
  - **Aceite:** Dashboard por dispositivo calcula p75 com amostra e janela explícitas.
  - **Evidência:** Pendente; anexar resultado verificável antes de concluir.
  - **Depende de:** 148, 194.

- [ ] **168. Definir indisponibilidade e retries.** Projetar timeout, circuit breaker e mensagens úteis para falha de catálogo.
  - **Aceite:** Erro do upstream não transforma indisponibilidade em falsa ausência de produtos.
  - **Evidência:** Pendente; anexar resultado verificável antes de concluir.
  - **Depende de:** 127.

- [ ] **169. Validar capacidade do backend.** Executar teste de carga controlado em staging com orçamento acordado.
  - **Aceite:** Limites e comportamento sob excesso de tráfego são medidos sem afetar produção.
  - **Evidência:** Pendente; anexar resultado verificável antes de concluir.
  - **Depende de:** 168.

- [ ] **170. Definir observabilidade e alertas.** Acompanhar disponibilidade, mídia, latência e falha de briefings.
  - **Aceite:** Cada alerta tem limiar, responsável e procedimento de resposta.
  - **Evidência:** Pendente; anexar resultado verificável antes de concluir.
  - **Depende de:** 138, 168.


## Fase 18 — Acessibilidade e inclusão

**Responsável:** QA acessibilidade + frontend · **Prioridade:** P0 · **Janela:** semanas 8–10.

**Articulação:** fase 07, fase 08, fase 09, fase 10, fase 12.

- [ ] **171. Auditar semântica e landmarks.** Verificar idioma, regiões, títulos e sequência de leitura.
  - **Aceite:** Cada página tem H1 e estrutura compreensível por tecnologia assistiva.
  - **Evidência:** Pendente; anexar resultado verificável antes de concluir.
  - **Depende de:** 079, 092.

- [ ] **172. Auditar contraste.** Medir texto, botões, bordas essenciais e foco em todos os estados.
  - **Aceite:** Texto normal atende 4,5:1; grande 3:1; componentes essenciais 3:1 conforme critério aplicável.
  - **Evidência:** Pendente; anexar resultado verificável antes de concluir.
  - **Depende de:** 063, 064, 066.

- [ ] **173. Auditar teclado.** Percorrer menu, filtros, favoritos, diálogos, quantidades e formulário.
  - **Aceite:** Nenhuma tarefa exige ponteiro e foco nunca fica oculto ou sem saída.
  - **Evidência:** Pendente; anexar resultado verificável antes de concluir.
  - **Depende de:** 065, 071, 081, 112, 114.

- [x] **174. Auditar diálogos.** Confirmar foco inicial adequado, Escape, contenção e restauração.
  - **Aceite:** Fechamento devolve foco a um elemento existente e útil.
  - **Evidência:** `docs/VALIDACAO.md`
  - **Depende de:** 065.

- [ ] **175. Auditar reflow e zoom.** Testar 200% e 400% e largura equivalente a 320 CSS px.
  - **Aceite:** Conteúdo permanece funcional sem rolagem em duas dimensões indevida.
  - **Evidência:** Pendente; anexar resultado verificável antes de concluir.
  - **Depende de:** 062.

- [ ] **176. Auditar alvos de interação.** Inspecionar tamanho e espaçamento em telas móveis.
  - **Aceite:** Atende WCAG 2.2 AA com exceções documentadas; busca-se 44 px para ações principais.
  - **Evidência:** Pendente; anexar resultado verificável antes de concluir.
  - **Depende de:** 063, 064.

- [ ] **177. Auditar validação de formulários.** Verificar labels, erros, correção e preservação de campos válidos.
  - **Aceite:** Leitor de tela consegue localizar e corrigir campos inválidos.
  - **Evidência:** Pendente; anexar resultado verificável antes de concluir.
  - **Depende de:** 066, 114.

- [ ] **178. Auditar movimento e mídia.** Testar reduced motion, textos alternativos e conteúdo conceitual.
  - **Aceite:** Nenhuma informação depende de animação, cor isolada ou imagem sem alternativa.
  - **Evidência:** Pendente; anexar resultado verificável antes de concluir.
  - **Depende de:** 068, 093.

- [ ] **179. Executar varredura automatizada.** Rodar axe nas páginas e diálogos representativos.
  - **Aceite:** Violações são corrigidas ou avaliadas; automação não equivale a certificação AA.
  - **Evidência:** Pendente; anexar resultado verificável antes de concluir.
  - **Depende de:** 171, 172, 173, 174, 175, 176, 177, 178.

- [ ] **180. Validar com pessoas.** Conduzir tarefas com usuários de tecnologia assistiva.
  - **Aceite:** Achados manuais são resolvidos e limitações ficam documentadas.
  - **Evidência:** Pendente; anexar resultado verificável antes de concluir.
  - **Depende de:** 179.


## Fase 19 — Qualidade, homologação e piloto

**Responsável:** QA + produto + comercial · **Prioridade:** P0 · **Janela:** semanas 9–11.

**Articulação:** fase 14, fase 15, fase 16, fase 17, fase 18.

- [x] **181. Validar build e tipos.** Executar compilação de produção e TypeScript estrito.
  - **Aceite:** Comandos concluem sem erros na revisão entregue.
  - **Evidência:** `docs/VALIDACAO.md`
  - **Depende de:** 079, 091, 115.

- [x] **182. Testar busca e seleção.** Cobrir filtros, zero resultados, favoritos, persistência e quantidade.
  - **Aceite:** Testes E2E usam comportamento observável e detectam regressões do fluxo principal.
  - **Evidência:** `docs/VALIDACAO.md`
  - **Depende de:** 081, 082, 083, 084, 111, 112.

- [x] **183. Testar briefing da prévia.** Verificar validação e conteúdo real do arquivo exportado.
  - **Aceite:** Download contém IDs, SKUs, quantidades e aviso de não envio.
  - **Evidência:** `docs/VALIDACAO.md`
  - **Depende de:** 115.

- [ ] **184. Testar integração em staging.** Cobrir erro, sucesso, idempotência e rastreabilidade com CRM.
  - **Aceite:** Protocolo corresponde a registro persistido e oportunidades não se duplicam.
  - **Evidência:** Pendente; anexar resultado verificável antes de concluir.
  - **Depende de:** 120, 140.

- [ ] **185. Testar navegadores e dispositivos.** Verificar Chromium, Safari/WebKit e Firefox em larguras acordadas.
  - **Aceite:** Matriz registra versões, tarefas cobertas e falhas corrigidas.
  - **Evidência:** Pendente; anexar resultado verificável antes de concluir.
  - **Depende de:** 181.

- [ ] **186. Testar jornadas com rede limitada.** Simular lentidão, offline e falha de imagem ou API.
  - **Aceite:** Feedback mantém contexto e oferece recuperação sem sucesso fictício.
  - **Evidência:** Pendente; anexar resultado verificável antes de concluir.
  - **Depende de:** 168.

- [ ] **187. Executar revisão comercial.** Validar nomes, técnicas, quantidades, preços e textos institucionais.
  - **Aceite:** Responsáveis aprovam todas as peças publicadas e as promessas exibidas.
  - **Evidência:** Pendente; anexar resultado verificável antes de concluir.
  - **Depende de:** 050, 095, 096, 097, 098.

- [ ] **188. Executar piloto de compradores.** Convidar grupo autorizado para tarefas representativas.
  - **Aceite:** Problemas críticos de compreensão e conclusão são resolvidos.
  - **Evidência:** Pendente; anexar resultado verificável antes de concluir.
  - **Depende de:** 080, 100, 120.

- [ ] **189. Revisar evidências de lançamento.** Consolidar testes, acessibilidade, observabilidade e rollback.
  - **Aceite:** Checklist tem evidência por gate e responsáveis para pendências aceitas.
  - **Evidência:** Pendente; anexar resultado verificável antes de concluir.
  - **Depende de:** 150, 166, 170, 180, 181, 182, 183, 184, 185, 186, 187, 188.

- [ ] **190. Decidir prontidão comercial.** Revisar critérios P0 com os responsáveis de negócio e tecnologia.
  - **Aceite:** Registro explicita liberar, adiar ou reduzir escopo, com razões verificáveis.
  - **Evidência:** Pendente; anexar resultado verificável antes de concluir.
  - **Depende de:** 189.


## Fase 20 — Lançamento, operação e evolução

**Responsável:** PO + operações + crescimento · **Prioridade:** P0/P1 · **Janela:** semanas 11–12+.

**Articulação:** fase 19.

- [ ] **191. Preparar domínio e ambientes.** Configurar preview, staging e produção com variáveis distintas.
  - **Aceite:** Domínio, certificados e configuração são verificados sem expor staging ao índice.
  - **Evidência:** Pendente; anexar resultado verificável antes de concluir.
  - **Depende de:** 190.

- [ ] **192. Preparar publicação reversível.** Criar release identificável com artefato e versão anterior disponível.
  - **Aceite:** Rollback é exercitado em staging e procedimento tem responsável.
  - **Evidência:** Pendente; anexar resultado verificável antes de concluir.
  - **Depende de:** 191.

- [ ] **193. Preparar operação comercial.** Treinar atendimento, validar horários e definir expectativas de resposta.
  - **Aceite:** Equipe encontra, assume e responde uma solicitação de teste.
  - **Evidência:** Pendente; anexar resultado verificável antes de concluir.
  - **Depende de:** 140.

- [ ] **194. Publicar versão comercial.** Implantar somente a versão que passou pelos gates de prontidão.
  - **Aceite:** Smoke de produção confirma catálogo, briefing, CRM e privacidade.
  - **Evidência:** Pendente; anexar resultado verificável antes de concluir.
  - **Depende de:** 190, 192, 193.

- [ ] **195. Monitorar primeiras 48 horas.** Acompanhar erros, mídia, velocidade e solicitações recebidas.
  - **Aceite:** Incidentes têm responsável e reconciliação confirma ausência de leads perdidos.
  - **Evidência:** Pendente; anexar resultado verificável antes de concluir.
  - **Depende de:** 194.

- [ ] **196. Revisar funil inicial.** Comparar visita, seleção, início de briefing, envio e qualificação.
  - **Aceite:** Baseline real substitui hipóteses sem atribuir causalidade prematura ao design.
  - **Evidência:** Pendente; anexar resultado verificável antes de concluir.
  - **Depende de:** 195.

- [ ] **197. Executar primeira melhoria validada.** Priorizar o principal atrito encontrado em pesquisa e dados.
  - **Aceite:** Resultado é medido com método compatível com volume e sem promessa de uplift.
  - **Evidência:** Pendente; anexar resultado verificável antes de concluir.
  - **Depende de:** 196.

- [ ] **198. Expandir curadoria com qualidade.** Adicionar produtos e ocasiões somente com dados e mídia aprovados.
  - **Aceite:** Expansão mantém SLA, atributos confiáveis e identidade fotográfica.
  - **Evidência:** Pendente; anexar resultado verificável antes de concluir.
  - **Depende de:** 050, 196.

- [ ] **199. Estabelecer revisão trimestral.** Revisar catálogo, conteúdo, segurança, acessibilidade e integração.
  - **Aceite:** Calendário tem donos, indicadores e procedimento para corrigir drift.
  - **Evidência:** Pendente; anexar resultado verificável antes de concluir.
  - **Depende de:** 195.

- [ ] **200. Encerrar ciclo e abrir próxima versão.** Consolidar resultados, aprendizados, riscos e backlog priorizado.
  - **Aceite:** Relatório vincula metas, evidências, entregas concluídas e decisões da evolução.
  - **Evidência:** Pendente; anexar resultado verificável antes de concluir.
  - **Depende de:** 197, 198, 199.

---

Fontes e justificativas: [pesquisa](ESTRATEGIA_E_PESQUISA.md), [auditoria interna](AUDITORIA_PROJETO_INTERNO.md), [arquitetura](ARQUITETURA_E_INTEGRACAO.md), [design system](DESIGN_SYSTEM.md) e [validação](VALIDACAO.md).

Fonte estruturada: `src/lib/plan.json`. Gerado por `node scripts/generate-plan.mjs`; verificado por `npm run check:plan`.
