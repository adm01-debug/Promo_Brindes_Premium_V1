# Catálogo no servidor e estado de entrega — 22/09/2026

## Simulação antes da correção

| Caso | Falha encontrada | Controle implementado |
|---|---|---|
| Produto retirado entre a conferência no navegador e o `POST /api/briefings` | O servidor podia usar cache de cinco minutos e aceitar a seleção anterior. | O POST consulta o catálogo publicado com `cache: no-store`; retirada ou mínimo aumentado retorna `422`, sem persistir ou chamar o receptor. |
| Fonte retorna slug, data ou mídia malformada | Campos inválidos podiam chegar à ficha, ao sitemap ou ao payload editorial. | A projeção rejeita esses registros e responde com indisponibilidade recuperável, sem inventar conteúdo. |
| Fonte retorna duplicata, item fora dos IDs ou categoria pedidos, ou página acima do limite | A resposta podia satisfazer o tipo básico, mas violar o contrato da consulta. | A leitura rejeita IDs/SKUs/slugs repetidos, produto fora do filtro e página acima de 24 itens. |
| Ficha por slug recebe outro produto | A página poderia mostrar um item diferente sob o endereço solicitado. | A leitura da ficha exige correspondência do slug consultado. |
| Receptor responde com sucesso, mas o banco falha ao registrar esse sucesso | A falha de confirmação caía no mesmo bloco de erro do webhook e tentava marcar a entrega como rejeitada. | O servidor mantém o estado incerto e responde `BRIEFING_PENDING`; não grava rejeição falsa. |
| Receptor responde com falha | A tentativa precisa continuar registrada como falha recuperável. | O servidor registra falha de entrega e preserva o protocolo. |
| Produto é retirado depois de um envio entregue e o cliente repete a mesma chave | A validação do catálogo devolvia `422` antes de consultar a solicitação já registrada. | A consulta prévia por chave e hash da intenção normalizada recupera o protocolo com `200`; não chama novamente o receptor. |
| Produto é retirado enquanto o envio permanece pendente | Uma nova tentativa poderia perder o vínculo com o protocolo. | O servidor retorna `BRIEFING_PENDING` e o mesmo protocolo, sem novo disparo da peça retirada. Uma nova chave ainda recebe `422`. |
| A chave é repetida com conteúdo alterado após a retirada | O catálogo retirado podia ocultar o conflito. | O servidor retorna `409` antes da validação editorial. Espaços e caixa do e-mail normalizados não criam um conflito falso. |

`node scripts/audit-plan-scenarios.mjs` reproduz **31 casos sintéticos**, incluindo `AUD-21` a `AUD-36` para os cenários acima. O build de produção consulta o catálogo real e concluiu com os oito produtos publicados. A suíte E2E local mantém **102 aprovações** nos três motores.

A migration `20260922150000_lookup_briefing_intent.sql` só instala a consulta após confirmar que não há briefings antigos com hash do payload comercial. O banco oficial da vitrine tinha zero registros; a função respondeu `200` com lista vazia usando a chave de serviço, enquanto a chave pública recebeu `401`. Em transação revertida, um registro sintético retornou correspondência com o mesmo hash e conflito com hash diferente (`LOOKUP_OK`); após o rollback, a contagem permaneceu zero. A checagem posterior de migrations confirmou o banco atualizado. Nenhum briefing comercial foi criado por esses testes.

## Limite operacional

Uma resposta de sucesso do receptor seguida de falha persistente do banco continua **ambígua**: o código não pode provar que a oportunidade foi criada uma só vez sem um contrato de idempotência e consulta do CRM. Após a expiração da reserva, uma nova tentativa ainda pode reenviar o webhook. A ativação comercial exige receptor que honre `Idempotency-Key`, conciliação por protocolo, operador responsável e teste de falha entre aceite e confirmação. Isso mantém as etapas 117, 118 e 139 abertas.

As páginas públicas gerais continuam sujeitas à janela de cache. A correção garante leitura atual no ponto de decisão do briefing, mas não conclui a retirada em todas as superfícies nem o SLA da etapa 128.
