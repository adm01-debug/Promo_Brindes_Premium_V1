# Orçamento de desempenho

O orçamento local serve como gate técnico, não como métrica de usuários reais. Ele deve ser medido em build de produção, viewport móvel e rede simulada registrada.

| Área                |                                      Limite inicial | Regra                                                                                          |
| ------------------- | --------------------------------------------------: | ---------------------------------------------------------------------------------------------- |
| LCP de laboratório  |                                           até 2,5 s | Repetir coleta; investigar hero, fontes e resposta antes de aceitar regressão.                 |
| CLS                 |                                             até 0,1 | Imagens e módulos devem reservar espaço.                                                       |
| JavaScript inicial  |                          até 200 KiB gzip, por rota | Gate lê os chunks iniciais de cada rota no build de produção; não carregar planejamento, CRM ou backoffice na home.              |
| Fontes iniciais     |                            até 180 KiB transferidos | Gate soma os WOFF2 publicados; famílias locais e pesos estritamente necessários.                                              |
| Imagem LCP          |                                até 160 KiB de fonte | Uma prioridade, WebP/AVIF e `sizes` correto; nenhuma imagem abaixo da dobra recebe prioridade. |
| Imagens de catálogo | até 100 KiB por peça; 256 KiB no conjunto da prévia | Reservar dimensões, servir responsivamente e manter lazy loading.                              |
| API de catálogo     |                        timeout e estado recuperável | Indisponibilidade não pode virar resultado vazio.                                              |

`npm run check:performance-budget` verifica imagens, JavaScript gzip por rota, quantidade de chunks iniciais, fontes WOFF2, ausência do painel de planejamento no bundle inicial da home e impede originais PNG/JPEG no diretório servido. O Lighthouse de 20/09 registrou LCP de 3,0 s. [Três novas rodadas móveis](audit/2026-09-22-lighthouse-repeat.md) registraram LCP de 2,259 a 3,121 s, mediana 2,612 s. A meta de LCP ainda não está cumprida de modo estável: otimizar, repetir a coleta e medir p75 de campo após consentimento e lançamento.
