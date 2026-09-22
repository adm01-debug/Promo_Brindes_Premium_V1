# Conferência de seleção antes do briefing — 22/09/2026

## Simulações e decisão

| Cenário                                                    | Falha anterior                                                                   | Comportamento validado                                                                              |
| ---------------------------------------------------------- | -------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Produto selecionado é despublicado após abrir a página     | A cópia em memória ainda podia compor o arquivo local.                           | Consulta por IDs sem cache remove a peça e pede revisão antes do download ou envio.                 |
| Quantidade mínima aumenta após a seleção                   | O arquivo podia registrar quantidade abaixo do mínimo atual.                     | A quantidade é ajustada e a seleção volta para revisão; o briefing não é preparado silenciosamente. |
| Fonte do catálogo falha no instante de preparar o briefing | O arquivo podia usar dados anteriores sem distinguir falha de publicação válida. | A ação é interrompida com mensagem recuperável; nenhum arquivo é baixado.                           |
| Fonte omite ou contradiz `Content-Range`                   | A página era confundida com a contagem total, ocultando itens posteriores.       | O servidor retorna `503 CATALOG_UNAVAILABLE`; não informa um total inventado.                       |
| Seleção muda enquanto a consulta está em andamento         | A resposta poderia validar uma intenção anterior.                                | A operação é cancelada e solicita nova revisão.                                                     |

O endpoint `GET /api/catalog?ids=…` responde `Cache-Control: no-store` e a leitura à fonte usa `cache: no-store`. A consulta geral usa TTL de um minuto e `must-revalidate`. O navegador envia apenas IDs de produto na conferência; nome, empresa, e-mail e mensagem não fazem parte dela.

Evidência reproduzível atualizada: `node scripts/audit-plan-scenarios.mjs` aprovou **43 cenários**, incluindo contagem, paginação em múltiplos lotes, limite, mudança de total e cache. `npm run test:e2e` aprovou **165 execuções**, 55 por Chromium, Firefox e WebKit; quatro jornadas por motor exercitam retirada, mínimo, falha de conferência e alteração da seleção em trânsito, e uma verifica o cabeçalho de IDs.

## Limite explícito

Essa conferência protege a preparação do briefing imediatamente. A migration de vigência e a redução posterior do cache definiram em 60 segundos o SLA das superfícies de descoberta; detalhes e testes estão em [vigência e retirada do catálogo](2026-09-22-catalog-publication-window.md). A etapa 130 continua parcial porque o contrato comercial completo ainda não possui staging homologado. O backend de entrega faz sua própria conferência de produtos e mínimos quando está ativado.
