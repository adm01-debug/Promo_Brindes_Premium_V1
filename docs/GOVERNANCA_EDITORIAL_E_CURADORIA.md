# Governança editorial e critérios de curadoria

Decisão de **23/09/2026**. O registro técnico de revisão continua em [`editorial/product-review.json`](editorial/product-review.json). “Candidato” significa elegível para avaliação; “pendente” impede lançamento comercial.

## Critérios de seleção premium

Cada SKU recebe uma justificativa em seis dimensões:

1. **Utilidade:** resolve uma necessidade clara no cotidiano ou na ocasião.
2. **Valor percebido:** materiais, acabamento e apresentação podem sustentar a proposta premium.
3. **Coerência:** produto, texto e fotografia contam a mesma história.
4. **Personalização:** elegibilidade, área, técnica e limites podem ser confirmados.
5. **Operação:** mínimo, variante, disponibilidade, prazo e embalagem podem ser executados.
6. **Conformidade editorial:** descrição, imagem, marca e alegações têm fonte e direito de publicação.

Um produto só fica `approved` quando as seis dimensões têm evidência. Falha de direito, conflito de SKU/variante, alegação sem comprovação ou impossibilidade operacional resulta em `rejected` ou retirada imediata.

## Avaliação dos oito candidatos

| SKU      | Candidato                   | Justificativa de curadoria                                                                    | Lacuna decisiva                                                                                   | Status comercial |
| -------- | --------------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ---------------- |
| 08255    | Kit executivo               | Combina escrita e organização em uma apresentação adequada a relacionamento e reconhecimento. | Componentes, material, embalagem, técnica e direitos precisam ser confirmados.                    | Pendente.        |
| 93586    | Caderno A5 em PET reciclado | Objeto útil e recorrente para boas-vindas e trabalho; narrativa material pode ser relevante.  | Composição reciclada, alegações, dimensões, imagem e técnica precisam de comprovação.             | Pendente.        |
| MA-02801 | Mochila executive 22 L      | Alto uso percebido e boa adequação a onboarding, viagem e conquistas.                         | Capacidade, materiais, medidas, variantes, áreas e disponibilidade precisam ser homologados.      | Pendente.        |
| 13845    | Garrafa térmica 500 ml      | Utilidade diária e presença visual compatíveis com reconhecimento e eventos.                  | Capacidade, conservação térmica, tampa, variantes e gravação precisam de ficha validada.          | Pendente.        |
| KT-90231 | Ritual do café              | Experiência de pausa com potencial para relacionamento e celebração.                          | Conteúdo exato, validade, embalagem, logística e restrições alimentares precisam ser confirmados. | Pendente.        |
| KT-90455 | Kit para chá em bambu       | Gesto de cuidado adequado a relacionamento e bem-estar.                                       | Componentes, origem/material, embalagem, dimensões e direitos precisam ser comprovados.           | Pendente.        |
| KT-90307 | Kit gourmet · 5 peças       | Proposta de encontro e celebração com bom valor percebido.                                    | Cinco componentes, contato com alimento, embalagem, técnicas e logística precisam ser validados.  | Pendente.        |
| CE-87001 | Caneta touch em alumínio    | Peça simples, útil e adequada a assinatura, eventos e complemento de kit.                     | Material, mecanismo touch, cores, área/técnica e apresentação precisam de homologação.            | Pendente.        |

O critério e o status tornam a etapa de seleção auditável; não aprovam dados que ainda não foram conferidos. O gate `npm run check:editorial:ready` continuará falhando até as aprovações reais.

## Fluxo e SLA interno

| Evento                                                               | Ação                                                               | Prazo interno decidido                   | Responsável por papel                              |
| -------------------------------------------------------------------- | ------------------------------------------------------------------ | ---------------------------------------- | -------------------------------------------------- |
| Risco de direito, produto errado ou promessa materialmente incorreta | Despublicar primeiro, preservar evidência e abrir incidente.       | Até 1 hora útil após confirmação.        | Responsável editorial, com fallback técnico.       |
| Erro de texto sem risco comercial                                    | Corrigir em branch, obter revisão e publicar pelo fluxo protegido. | Triagem em 1 dia útil.                   | Conteúdo/editorial.                                |
| Mudança no catálogo canônico                                         | Executar dry-run, comparar digest e revalidar o SKU afetado.       | Antes de qualquer sincronização efetiva. | Dados + editorial.                                 |
| Nova imagem ou alegação                                              | Anexar licença/comprovação e revisão da peça.                      | Antes da publicação.                     | Editorial + comercial/privacidade conforme o caso. |
| Revisão de rotina                                                    | Conferir fonte, direitos, texto, disponibilidade e drift.          | Trimestral.                              | Editorial + comercial + dados.                     |

Até haver pessoas nomeadas, o processo está definido, mas a manutenção editorial continua parcial para fins de prontidão. Cada responsável deve ter um substituto registrado.

## Evidência mínima por aprovação

- nome do revisor e data;
- data e identificador da fonte operacional revisada;
- referência de material/dimensões e do mínimo aplicável;
- documento, contrato ou autorização para a imagem;
- comprovação de alegações ambientais, técnicas ou de qualidade;
- confirmação comercial de disponibilidade, personalização, embalagem e limites;
- digest do conteúdo aprovado.

Links genéricos, mensagens sem remetente identificável ou a condição de que os dois projetos pertencem à mesma empresa não comprovam licença de terceiros.
