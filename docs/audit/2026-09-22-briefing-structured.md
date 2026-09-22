# Evolução do briefing — implementação técnica e cenários

Data: 22/09/2026. Escopo: item `APV1-01` do [backlog comparativo](../BACKLOG_APROVEITAMENTO_V1.csv), com impacto nas etapas 114, 116, 132 e 133 do plano de 200 etapas.

## Decisões de compatibilidade antes da edição

O banco oficial da vitrine tem `premium_briefings.message` limitado a 2.000 caracteres e a RPC `persist_premium_briefing` publicada. Uma migration para trocar a assinatura da função introduziria risco de incompatibilidade sem receptor comercial homologado. A solução mantém o schema e acrescenta ao campo de observações um resumo humano dos novos dados. O webhook envia os campos estruturados no contrato `2026-09-22`. Assim, o vendedor recebe o contexto organizado, e o registro privado guarda uma cópia legível para conciliação.

Pedidos legados, sem os campos novos, continuam normalizados sem propriedades extras. O hash da intenção continua estável para a mesma entrada, inclusive se imagem ou SKU do catálogo mudar. A verba legada sem escopo explícito é interpretada como **por presente** no payload comercial. Se o usuário escolhe orçamento **total**, a interface aceita uma descrição livre da verba, sem inventar faixas de valores comerciais. Cada campo alterado limpa a chave de idempotência da interface; o servidor continua verificando conflitos pela intenção normalizada.

## Cenários simulados e resultado exigido

| Cenário                                         | Esperado                                                                       | Evidência                           |
| ----------------------------------------------- | ------------------------------------------------------------------------------ | ----------------------------------- |
| Recebimento depois do evento                    | Recusar com explicação, preservar formulário                                   | Sonda isolada e browser             |
| WhatsApp/ligação sem telefone                   | Recusar; campo obrigatório na interface                                        | Sonda isolada e atributo `required` |
| Primeiro envio com campos estruturados          | Persistir resumo e enviar estrutura ao receptor                                | Sonda API sintética                 |
| Reenvio igual                                   | Recuperar protocolo sem segunda chamada comercial                              | Sonda API sintética                 |
| Mesma chave, data do evento alterada            | `409`, sem substituir pedido anterior                                          | Sonda API sintética                 |
| Mensagem perto de 2.000 caracteres com contexto | Recusar antes da RPC                                                           | Sonda isolada                       |
| Cliente antigo sem campos novos                 | Mesma forma normalizada, sem propriedade adicional                             | Sonda isolada                       |
| Voltar do formulário e retornar                 | Dados novos preservados em memória                                             | Browser                             |
| Download local                                  | Escopo total, evento, canal e telefone constam no arquivo; nenhum POST externo | Browser                             |

Resultados reproduzíveis: `node scripts/audit-plan-scenarios.mjs` (36/36 sondas no escopo sintético) e `npx playwright test tests/storefront.spec.ts --grep 'briefing estruturado' --project=chromium`. A suíte original de navegador e a CI devem continuar cobrindo as jornadas anteriores. Não há migração de banco para este item.

## Limites para concluir a entrega comercial

- [x] Contrato do navegador e servidor implementado, documentado e validado localmente.
- [x] Reenvio igual, conflito real, limite de mensagem e compatibilidade anterior simulados.
- [x] Privacidade da prévia atualizada para telefone e campos do projeto.
- [ ] Aprovar as faixas por presente, linguagem de verba total e campos com o time comercial.
- [ ] Homologar o receptor/CRM para aceitar o contrato `2026-09-22` e atribuir responsável.
- [ ] Exercitar o mesmo cenário em staging com banco e receptor isolados, sem contato de cliente real.
- [ ] Confirmar com vendedores que o resumo é suficiente para preparar uma proposta.

O item permanece **parcial** no backlog. Os estados das 200 etapas não mudaram: adicionar campos não comprova CRM, responsável, prazo, política comercial ou piloto.
