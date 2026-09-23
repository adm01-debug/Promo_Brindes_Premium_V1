# Operação comercial, SLA e conciliação

Contrato operacional decidido em **23/09/2026**. Ele define como o fluxo deverá funcionar, sem afirmar que existe um CRM homologado.

## Sistema canônico e propriedade

1. A API valida o briefing e persiste uma intenção idempotente em `premium_briefings`.
2. Esse registro é o **canônico de entrada** até o receptor confirmar o mesmo protocolo.
3. O receptor comercial cria ou localiza a oportunidade pelo protocolo, nunca apenas por e-mail ou nome.
4. Depois da confirmação, CRM e intake são conciliados pelo protocolo e hash da intenção; divergência abre incidente.
5. O dono funcional de toda oportunidade recebida é a **Coordenação Comercial Premium**. Antes da atribuição individual, ela permanece na fila dessa coordenação.
6. Uma pessoa titular e uma substituta precisam ser nomeadas antes de ativar a entrega.

Nenhum CRM específico foi escolhido sem evidência da operação real. A integração permanece via webhook HTTPS assinado, permitindo homologar o receptor correto sem alterar o contrato público.

## Qualificação auditável

Uma solicitação pode receber apenas um dos resultados abaixo, sempre com código de razão e autor humano:

| Resultado           | Regra objetiva                                                                                                                                                                                                          |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `qualified`         | Contato válido; ao menos um SKU atualmente elegível; quantidade igual ou superior ao mínimo conhecido; ocasião/necessidade compreensível; e nenhuma incompatibilidade confirmada. Orçamento em aberto não desqualifica. |
| `needs_information` | Falta dado necessário para preparar proposta, há conflito de data/quantidade ou o produto precisa de confirmação. Deve listar exatamente o que falta.                                                                   |
| `disqualified`      | Spam/abuso comprovado, pedido fora do serviço, contato inválido após tentativa definida ou impossibilidade operacional confirmada. Deve usar motivo enumerado.                                                          |

Não se pode inferir porte, poder de compra, setor ou qualidade do lead por domínio de e-mail, nome, dispositivo, localização aproximada ou perfil oculto. Data desejada nunca é promessa de atendimento.

## Atribuição decidida

- Distribuir oportunidades qualificadas em rodízio entre vendedores ativos habilitados para a linha Premium.
- Registrar `assigned_at`, identificador do responsável, regra aplicada e todas as transferências.
- Se nenhum vendedor estiver ativo, atribuir à Coordenação Comercial Premium e alertar o substituto.
- Ausência, férias ou SLA rompido devolvem o item à fila com motivo; nunca apagam o proprietário anterior.
- Reenvio com o mesmo protocolo atualiza a mesma oportunidade e não reinicia artificialmente o SLA.

A regra será implementada apenas no receptor escolhido. Carteira, região ou especialidade podem substituir o rodízio depois de documentadas e testadas.

## Estados

| Estado interno                  | Estado público futuro     | Significado                                                       |
| ------------------------------- | ------------------------- | ----------------------------------------------------------------- |
| `received`                      | Recebido                  | Intake persistido e, quando habilitado, confirmado pelo receptor. |
| `in_review`                     | Em análise                | Responsável humano assumiu o atendimento.                         |
| `needs_information`             | Precisamos de informações | Existe uma solicitação objetiva de complemento.                   |
| `proposal_ready`                | Proposta preparada        | Proposta válida está disponível em canal autorizado.              |
| `closed_won`                    | Concluído                 | Projeto aceito conforme processo comercial.                       |
| `closed_lost` ou `disqualified` | Encerrado                 | Atendimento encerrado; motivo interno não é exposto.              |

Notas internas, custo, margem, desconto, risco, score e identidade de outros clientes nunca aparecem no acompanhamento público.

## SLA decidido para o piloto

- confirmação técnica: somente depois de persistência e aceite do receptor, com o mesmo protocolo;
- primeira ação humana: até **1 dia útil**;
- pedido de complemento: deve listar campos faltantes e pausar a contagem até resposta do cliente;
- incidentes de entrega: alerta em até 15 minutos e triagem em até 1 hora útil;
- conciliação: a cada 15 minutos no piloto e fechamento diário;
- promessa pública de SLA: proibida antes de quatro semanas de medição estável.

Horário útil e feriados precisam ser configurados no receptor. O dashboard deve separar tempo interno, espera pelo cliente e indisponibilidade técnica.

## Conciliação de falhas

O processo futuro compara todos os registros persistidos com confirmações do receptor:

1. selecionar itens `received`, `sending` ou `uncertain` por protocolo;
2. consultar o receptor de forma autenticada;
3. se o mesmo protocolo e hash existirem, registrar confirmação sem novo envio;
4. se não existirem e a lease estiver expirada, reprocessar com a mesma chave idempotente;
5. se protocolo, hash ou payload divergirem, bloquear reenvio e abrir incidente;
6. registrar ator, horário, tentativa, resultado e motivo sem copiar texto livre para logs;
7. gerar relatório diário de persistidos, confirmados, pendentes, divergentes e reprocessados.

Retenção, número máximo de tentativas e descarte só serão fechados com o mapa de tratamento e a capacidade do receptor. A conciliação deve ser operada por usuário autorizado; o site público não recebe botão administrativo.

## Matriz mínima de homologação

- sucesso, timeout antes e depois do aceite, resposta inválida e HTTP 4xx/5xx;
- duplo clique, retry paralelo, reinício da aplicação e duas réplicas;
- produto retirado ou mínimo alterado entre seleção e envio;
- protocolo existente com mesmo hash e com hash divergente;
- vendedor ausente, fila sem vendedor, redistribuição e cliente aguardando informação;
- recuperação de uma falha parcial sem duplicar oportunidade;
- vendedor localiza SKU, quantidade, ocasião, datas e contato sem redigitação crítica.

Somente dados sintéticos autorizados serão usados em staging.
