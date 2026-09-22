# Lighthouse móvel repetido — 22/09/2026

Três rodadas sequenciais sobre o mesmo build de produção, servido localmente em `127.0.0.1:3177`, com Lighthouse `13.5.0` e Chromium Linux headless `153.0.0.0` do Playwright. Preset móvel padrão: viewport emulada de 412 × 823 CSS px, DPR 1,75, throttling simulado com RTT de 150 ms, 1.638,4 Kbps de download e CPU 4× mais lenta. O comando usou `--only-categories=performance`, `--chrome-flags='--headless --no-sandbox --disable-dev-shm-usage'` e `CHROME_PATH` apontando para o Chromium instalado pelo Playwright. As execuções foram feitas em sequência, sem alterar código ou dados entre elas.

| Rodada | Performance | LCP | FCP | TBT | CLS | Relatório completo |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| 1 | 97 | 2.612 ms | 770 ms | 34 ms | 0,0005 | [JSON](lighthouse-mobile-2026-09-22-run1.json) |
| 2 | 99 | 2.259 ms | 759 ms | 35 ms | 0,0005 | [JSON](lighthouse-mobile-2026-09-22-run2.json) |
| 3 | 93 | 3.121 ms | 1.514 ms | 31 ms | 0,0005 | [JSON](lighthouse-mobile-2026-09-22-run3.json) |

O **LCP mediano foi 2.612 ms**, acima da meta local de 2.500 ms; a amplitude foi 862 ms. A imagem conceitual do hero foi o elemento LCP. A terceira rodada também teve FCP maior, o que aponta variabilidade de ambiente/execução e impede apresentar a melhor rodada isolada como resultado. A repetição cumpre o critério próprio de medição da etapa 166; a meta de desempenho e o gate de lançamento permanecem abertos. Isto não é p75 de usuários, nem mede INP de campo.

Para repetir, iniciar o build com `npm run start -- -p 3177` e executar o Lighthouse com os parâmetros acima, alterando `--output-path` para cada rodada. Os JSONs completos preservam configuração, métricas e rastros da coleta. A medição anterior de 20/09 continua em [lighthouse-mobile.json](lighthouse-mobile.json) para comparação histórica; ela usou Chrome para Windows e não deve ser mesclada como se fosse a mesma amostra.
