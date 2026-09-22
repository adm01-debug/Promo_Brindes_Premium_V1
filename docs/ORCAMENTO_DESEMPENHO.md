# Orçamento de desempenho

O orçamento local serve como gate técnico, não como métrica de usuários reais. Ele deve ser medido em build de produção, viewport móvel e rede simulada registrada.

| Área                |                                      Limite inicial | Regra                                                                                          |
| ------------------- | --------------------------------------------------: | ---------------------------------------------------------------------------------------------- |
| LCP de laboratório  |                                           até 2,5 s | Repetir coleta; investigar hero, fontes e resposta antes de aceitar regressão.                 |
| CLS                 |                                             até 0,1 | Imagens e módulos devem reservar espaço.                                                       |
| JavaScript inicial  |                          até 200 KiB gzip, por rota | Medir no build de produção; não carregar planejamento, CRM ou backoffice na home.              |
| Fontes iniciais     |                            até 180 KiB transferidos | Famílias locais e pesos estritamente necessários.                                              |
| Imagem LCP          |                                até 160 KiB de fonte | Uma prioridade, WebP/AVIF e `sizes` correto; nenhuma imagem abaixo da dobra recebe prioridade. |
| Imagens de catálogo | até 100 KiB por peça; 256 KiB no conjunto da prévia | Reservar dimensões, servir responsivamente e manter lazy loading.                              |
| API de catálogo     |                        timeout e estado recuperável | Indisponibilidade não pode virar resultado vazio.                                              |

`npm run check:performance-budget` verifica os limites de arquivos estáticos da prévia e impede originais PNG/JPEG no diretório servido. A medição de JS, fontes e LCP continua obrigatória no build de produção com o cenário registrado; o Lighthouse de 20/09 registrou LCP de 3,0 s. Portanto, a meta ainda não está cumprida: qualquer publicação precisa de nova coleta estável e de medição de campo p75 após consentimento e lançamento.
