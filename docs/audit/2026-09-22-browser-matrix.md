# Matriz local de navegadores — 22/09/2026

Playwright `1.63.0`, Linux headless e build de produção. A matriz vigente executou as mesmas 66 jornadas em cada motor: catálogo/contrato/API, facetas combináveis, busca e histórico, seleção e briefing, recomendações contextuais, metadados, teclado, alvos, rede lenta, menu e reflow móvel, diálogos, privacidade, plano e axe nos fluxos representativos. Foram **198 aprovações locais**. A matriz anterior também passou no [CI remoto do commit `7dcc960`](https://github.com/adm01-debug/Promo_Brindes_Premium_V1/actions/runs/35776344257).

| Motor    | Versão observada | Larguras exercitadas | Resultado local |
| -------- | ---------------- | -------------------- | --------------- |
| Chromium | `153.0.8010.12`  | 1280, 390 e 320 px   | 66/66           |
| Firefox  | `155.0`          | 1280, 390 e 320 px   | 66/66           |
| WebKit   | `26.6`           | 1280, 390 e 320 px   | 66/66           |

O primeiro ensaio encontrou duas falhas. No Firefox, ao escolher “A curadoria” no menu móvel, o diálogo devolvia o foco ao acionador depois da rolagem e a seção saía da viewport. O fechamento agora termina antes de rolar e foca o título de destino. No WebKit, várias execuções encontravam um mesmo `Map` de rate limit local na prévia desativada, causando `429` no teste de validação; a entrega ativada já usa limite distribuído no banco, e a prévia não consome essa janela nem grava contatos.

As seis jornadas novas por motor verificam o cabeçalho sem cache na consulta por IDs, a retirada de SKU antes do briefing, a alteração de mínimo, a falha da fonte, a mudança de seleção durante a conferência e a troca de categoria durante recuperação atrasada.

Os onze casos desta rodada verificam metadados/canonical, landmarks e reflow de todos os templates públicos, alvos essenciais em cada template e nos diálogos, movimento reduzido, operação do Super Filtro por teclado, jornada essencial sem ponteiro, erros de formulário associados e latência explícita sem sucesso fictício. A ficha e o teste de contrato existentes também ganharam verificação de recomendações publicadas, schema exato, request ID e `Server-Timing`.

O [CI do commit `2e3c3b3`](https://github.com/adm01-debug/Promo_Brindes_Premium_V1/actions/runs/35748064817) encontrou uma falha intermitente no WebKit: o teste de busca clicava no filtro logo após iniciar a recuperação da curadoria e observou as oito peças da resposta anterior. O teste de busca agora espera as oito peças antes de testar o filtro; uma jornada separada atrasa deliberadamente a resposta anterior e verifica que a categoria mais recente prevalece. As duas jornadas passaram 20 execuções repetidas com `CI=true` no WebKit local. Isso remove a ambiguidade do teste sem eliminar a cobertura da concorrência.

A matriz automatizada cobre motores de navegador e larguras simuladas. Ainda faltam Safari instalado em macOS/iOS, Firefox/Chrome em aparelhos reais, teclado virtual, leitores de tela e rede celular medida. Essas validações continuam no gate de lançamento.
