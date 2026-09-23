# Decisões de produto, operação e lançamento

Registro de decisão em **23/09/2026**. Este documento fecha escolhas reversíveis do projeto. Ele não transforma validação humana, licença, parecer jurídico ou teste integrado em evidência inexistente. A fonte executável dos gates é [`governance/release-governance.json`](governance/release-governance.json).

## Decisão de prontidão

**Decisão: adiar o lançamento comercial e manter a implantação como prévia técnica privada, noindex e sem coleta.** A experiência pública está tecnicamente demonstrável, porém o receptor comercial, o controlador de dados, o canal de direitos, as licenças das imagens, a aprovação dos oito produtos, o staging isolado e os pilotos ainda não têm evidência.

O release comercial só pode ser reavaliado quando cada gate marcado como `blocked` no registro de governança tiver uma evidência verificável. A existência de código, tabela ou documento não substitui o teste do processo real.

## Escopo decidido para o MVP

### Entra

- Home editorial, biblioteca de catálogos, catálogo, busca e filtros baseados em atributos públicos confiáveis.
- Detalhe do produto, favoritos, seleção com quantidades e validação do mínimo publicado.
- Briefing estruturado e download local, sem conta obrigatória e sem afirmar que houve envio.
- Catálogo central somente leitura e banco premium segregado para a futura entrada comercial.
- Acessibilidade, desempenho, segurança, privacidade por padrão e publicação reversível como gates contínuos.

### Fica fora até homologação

- Envio ao CRM, e-mail ou WhatsApp, confirmação transacional e acompanhamento pelo cliente.
- Upload de logotipo, simulação de arte, prova final, composição configurável de kits e cartão personalizado.
- Preço público, disponibilidade, estoque, prazo fechado, variante e técnica de gravação sem dado aprovado por SKU.
- Área autenticada, analytics de usuário, Search Console, indexação e páginas geradas em massa.
- Expansão além dos oito SKUs atuais.

O escopo é a recomendação executável. A etapa 030 continua parcial até PO e comercial registrarem aprovação por nome, pois essa assinatura não pode ser inferida do código.

## Prioridade comercial provisória

As prioridades são hipóteses para pesquisa, não constatações de receita.

| Ordem | Segmento                   | Ocasiões iniciais                           | Faixa de investimento a investigar                                   | Contexto de decisão                                                       |
| ----: | -------------------------- | ------------------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------- |
|     1 | Relacionamento e diretoria | Reconhecimento, marcos e relacionamento     | Até R$ 100, R$ 101–250 e acima de R$ 250 por presente                | Busca valor percebido, acabamento, apresentação e atendimento consultivo. |
|     2 | RH e employer branding     | Boas-vindas, reconhecimento e tempo de casa | Até R$ 100, R$ 101–250 e acima de R$ 250 por pessoa                  | Precisa equilibrar significado, escala, mensagem e distribuição.          |
|     3 | Marketing e eventos        | Lançamentos, eventos e campanhas            | Verba total e por pessoa, nas mesmas três faixas de pesquisa         | Decide por coerência de marca, data, personalização e impacto.            |
|     4 | Agências                   | Campanhas e projetos de clientes            | Verba total, quantidade e margem operacional a levantar fora do site | Precisa de fidelidade ao conceito, amostra, especificação e execução.     |
|     5 | Compras                    | Homologação e comparação de propostas       | Custo total por cenário, sem preço público prematuro                 | Prioriza mínimos, validade, impostos, frete e condições comparáveis.      |

As faixas servem apenas ao roteiro de entrevista. Elas não constituem tabela comercial nem promessa pública. A ordem deve ser revista após ao menos seis entrevistas com compradores, três com vendedores e análise de oportunidades reais.

Ocasiões provisórias: **relacionamento/reconhecimento**, **boas-vindas**, **marcos e conquistas**, **eventos/campanhas** e **datas comemorativas**, nessa ordem. A etapa 026 permanece parcial porque seu aceite exige demanda e disponibilidade reais.

## Decisões de oferta

| Tema             | Regra agora                                                                              | Condição para ampliar                                                              |
| ---------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Preço            | “Sob consulta”; nenhum preço sem quantidade, personalização, tributos, frete e validade. | Matriz aprovada por SKU e teste de exibição contextual.                            |
| Prazo e estoque  | Não prometer, reservar ou estimar automaticamente.                                       | Fonte operacional, timestamp, regra de validade e fallback aprovados.              |
| Variantes        | Não expor seletor de cor/tamanho sem SKU, mídia e disponibilidade sincronizados.         | Contrato versionado e produtos homologados.                                        |
| Técnicas         | Não listar técnicas universais.                                                          | Elegibilidade, área, limite e resultado esperado aprovados por SKU.                |
| Embalagem e kits | Tratar como intenção no briefing, sem afirmar inclusão.                                  | Componentes, múltiplos, dimensões, capacidade e preço aprovados.                   |
| Logotipo         | Perguntar somente o status; não receber arquivo.                                         | Storage privado, validação real de conteúdo, retenção, acesso e exclusão testados. |
| Simulação        | Nenhuma imagem conceitual é prova de produção.                                           | Arte versionada, aprovador autorizado e trilha de aceite.                          |
| Expansão         | Congelada nos oito SKUs atuais.                                                          | Aprovação editorial e operacional dos oito itens e capacidade medida.              |

## Busca e conteúdo

O mapa inicial tem quatro intenções distintas:

1. **Encontrar uma peça:** catálogo e busca por nome, SKU ou categoria.
2. **Resolver uma ocasião:** páginas editoriais de boas-vindas, reconhecimento, eventos, relacionamento, datas e conquistas.
3. **Entender o processo:** briefing, personalização, prazos, aprovação de arte e entrega.
4. **Comparar uma seleção:** lista escolhida com quantidade e contexto.

Uma nova página só entra quando responde a uma necessidade diferente, possui produtos elegíveis e conteúdo próprio revisado. Variações de cidade, cor, adjetivo ou palavra-chave não justificam páginas em massa. Indexação continua desligada até domínio, direitos, privacidade e release comercial aprovados.

## Donos por papel

| Decisão ou processo       | Accountable                         | Executor               | Gate para produção                                     |
| ------------------------- | ----------------------------------- | ---------------------- | ------------------------------------------------------ |
| Escopo e release          | PO / direção do projeto             | Engenharia e operações | Aprovação nominal de PO e comercial.                   |
| Curadoria e textos        | Responsável editorial               | Conteúdo e dados       | Responsável nominal e oito fichas aprovadas.           |
| Produto, preço e promessa | Coordenação comercial               | Comercial e operação   | Responsável nominal e matriz por SKU.                  |
| Entrada e distribuição    | Coordenação comercial Premium       | Backend / CRM          | Receptor, fila, fallback e conciliação homologados.    |
| Privacidade e direitos    | Controlador e responsável designado | Jurídico / privacidade | Identidade, canal, mapa, retenção e teste de direitos. |
| Segurança e release       | Responsável técnico                 | Engenharia / SRE       | Staging, rollback, smoke e monitoramento.              |

Papéis definem responsabilidade, mas não inventam pessoas. Todo gate que exige atuação operacional deve receber um nome e substituto antes do lançamento.

## Orçamento de teste de capacidade

O teste de carga futuro ocorrerá somente em staging isolado, com dados sintéticos. Cenário inicial: 20 requisições por segundo por 15 minutos, pico de 40 req/s por 60 segundos, concorrência de retries e duplo clique. Aceite: nenhuma duplicação, nenhum briefing perdido, taxa de erro controlada, recuperação após o pico e confirmação de limites do provedor. O orçamento deve ser revisto quando houver volume real; ele não autoriza carga contra produção.

## Calendário de revisão

A revisão ocorre na primeira semana útil de janeiro, abril, julho e outubro. PO coordena; editorial revisa catálogo e direitos; comercial revisa qualidade, SLA e ganho; privacidade revisa tratamentos e pedidos; engenharia revisa erros, performance, dependências e drift de contrato. Cada ciclo registra métricas, divergências, dono, prazo e decisão de corrigir, retirar ou aceitar temporariamente. Incidentes e conteúdo incorreto não aguardam o trimestre.

## Decisões que exigem fatos externos

Permanecem abertas porque uma escolha sem evidência criaria risco:

- razão social/CNPJ do controlador e canal de atendimento a titulares;
- pessoas responsáveis e substitutas em comercial, editorial, privacidade e operação técnica;
- CRM/receptor utilizado e credenciais próprias de staging;
- direitos das imagens e comprovações das alegações de produto;
- disponibilidade, variantes, técnicas, mínimos combinados, preços e prazos por SKU;
- domínio comercial, aparelhos físicos e participantes dos pilotos.

Esses dados alimentam os gates; não exigem redesenhar a arquitetura decidida.
