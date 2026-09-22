# Matriz local de navegadores — 22/09/2026

Playwright `1.63.0`, Linux headless e build de produção. Cada motor executou as mesmas 32 jornadas: catálogo/contrato/API, busca e histórico, seleção e briefing, menu e reflow móvel, diálogos, privacidade, plano e axe nos fluxos representativos. Foram **96 aprovações locais** na matriz ampliada. A matriz anterior, com 28 jornadas por motor, também passou no [CI remoto do commit `6e87c3b`](https://github.com/adm01-debug/Promo_Brindes_Premium_V1/actions/runs/35740802785).

| Motor | Versão observada | Larguras exercitadas | Resultado local |
| --- | --- | --- | --- |
| Chromium | `153.0.8010.12` | 1280, 390 e 320 px | 32/32 |
| Firefox | `155.0` | 1280, 390 e 320 px | 32/32 |
| WebKit | `26.6` | 1280, 390 e 320 px | 32/32 |

O primeiro ensaio encontrou duas falhas. No Firefox, ao escolher “A curadoria” no menu móvel, o diálogo devolvia o foco ao acionador depois da rolagem e a seção saía da viewport. O fechamento agora termina antes de rolar e foca o título de destino. No WebKit, várias execuções encontravam um mesmo `Map` de rate limit local na prévia desativada, causando `429` no teste de validação; a entrega ativada já usa limite distribuído no banco, e a prévia não consome essa janela nem grava contatos.

As quatro jornadas novas por motor verificam o cabeçalho sem cache na consulta por IDs, a retirada de SKU antes do briefing, a alteração de mínimo e a falha da fonte de conferência.

A matriz automatizada cobre motores de navegador e larguras simuladas. Ainda faltam Safari instalado em macOS/iOS, Firefox/Chrome em aparelhos reais, teclado virtual, leitores de tela e rede celular medida. Essas validações continuam no gate de lançamento.
