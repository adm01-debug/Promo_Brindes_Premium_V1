# Tokens estruturais e equivalência visual

Data: 22/09/2026. Escopo: `globals.css`, biblioteca de catálogos e gate do sistema visual.

## Simulação anterior à mudança

O inventário separou propriedades estruturais de dimensões específicas. Foram considerados seguros para substituição somente valores repetidos em `gap`, `row-gap`, `column-gap`, `padding`, `margin`, bordas de 1px e quatro raios já recorrentes. Medidas de fonte, ícones, posições absolutas, fotografia, gradientes e composições singulares ficaram fora.

O impacto previsto foi:

| Grupo                       | Substituições exatas |
| --------------------------- | -------------------: |
| Espaçamentos comuns         |                  112 |
| Gutter responsivo duplicado |                    5 |
| Bordas finas                |                   68 |
| Raios                       |                   10 |
| **Total**                   |              **195** |

## Prova de equivalência

Depois da alteração, um verificador temporário leu os CSS do `HEAD` com `git show`, resolveu os novos tokens nos arquivos atuais e removeu apenas suas declarações. A comparação estrita confirmou equivalência byte a byte nos dois arquivos. Isso demonstra que a centralização não mudou nenhum valor computado pretendido.

O gate permanente `npm run check:ui-contract` agora:

- exige os tokens de espaçamento, gutter, borda e raio;
- valida os valores da escala estrutural;
- rejeita literais comuns nas propriedades cobertas;
- exige que a biblioteca reutilize `--page-gutter`;
- mantém os 25 pares de contraste, foco, alvo principal e movimento reduzido.

## Critério de manutenção

Um novo valor global precisa representar uma decisão reutilizável. Exceções de composição permanecem junto ao componente e devem ser justificadas na revisão. Alterar a escala exige atualizar o contrato e validar novamente reflow, alvos, contraste e as jornadas nos três motores.

## Validação

Build, TypeScript, plano, contrato visual, scanner de segredos, orçamento e 86 contratos unitários passaram. Os 57 cenários sintéticos permaneceram verdes.

A primeira matriz de navegador encontrou três falhas equivalentes no teste do painel: o cenário usava a etapa 061 como exemplo fixo de item parcial, mas ela acabara de ser concluída. O teste passou a escolher uma etapa parcial a partir do próprio plano e continuou verificando que dados de revisão antiga não alteram a auditoria. O caso corrigido passou isoladamente em Chromium, Firefox e WebKit; a repetição integral terminou com **213/213 execuções aprovadas**.

## Evidência remota do commit técnico

O commit `32bb20c351ca85820e7b11c8e5cd3f95e3b5498b` foi enviado à `main` e validado fora da estação de desenvolvimento:

- GitHub Actions **Quality gates** `35795101559`: sucesso em 5m36s, incluindo a matriz completa de navegador;
- GitHub Actions **Isolated database contracts** `35795101521`: sucesso em 1m48s, com reconstrução das migrations, contratos, concorrência e lint;
- GitHub deployment `6602480640`: estado `success`;
- Vercel deployment `dpl_7TRLTbG9efPiU1LTVGq3LQVFdi1J`: produção `Ready`, associado aos aliases públicos.

O smoke test na implantação exata confirmou `200` na home, em `/catalogos` e na rota real de produto. `/api/catalog?pageSize=24` respondeu `200`, oito itens, `x-catalog-contract-version: 2026-09-22.2`, `x-catalog-source: site-database`, `CSP`, `HSTS`, `X-Content-Type-Options`, `X-Frame-Options` e `noindex`. A consulta de logs da implantação não encontrou erros.
