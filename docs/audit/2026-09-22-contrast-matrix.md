# Matriz final de contraste

Data: 22/09/2026. Escopo: cores semânticas, biblioteca clara, capas editoriais, foco, controles e texto sobre a fotografia atual do hero.

## Gate matemático

`npm run check:ui-contract` deriva as cores dos próprios arquivos CSS e mede **25 pares**. O menor resultado de toda a matriz é `--control-border` sobre `--black`, **4,22:1**, acima do mínimo de 3:1 aplicável ao componente. Todos os pares de texto normal têm pelo menos 4,5:1.

As capas são medidas por tema, sem presumir que uma capa clara compartilha a tinta das capas escuras:

| Superfície | Contraste de texto |
| ---------- | -----------------: |
| Areia      |            10,29:1 |
| Floresta   |            10,05:1 |
| Carvão     |            13,38:1 |
| Vinho      |             9,99:1 |

Na biblioteca clara, tinta, texto secundário, dourados, placeholder, botões normal/hover e seleção variam de **4,99:1 a 13,83:1**. A borda principal do campo é verificada no patamar de componentes. O gate também exige foco visível, alvo principal de 44 px e redução de movimento.

## Texto sobre fotografia

O hero foi renderizado no build de produção em 1440 × 900 e 390 × 844. Para cada caixa de texto, o conteúdo foi ocultado sem alterar layout, fotografia ou overlays; o fundo foi amostrado a cada dois pixels e comparado à cor computada do texto. Usar o menor pixel de toda a caixa é conservador porque inclui áreas vazias onde nenhum glifo é desenhado.

| Elemento                  | Mínimo desktop |    Mínimo mobile | Requisito aplicado |
| ------------------------- | -------------: | ---------------: | -----------------: |
| Eyebrow dourado           |         4,79:1 |           9,25:1 |              4,5:1 |
| H1 marfim                 |         9,80:1 |          14,35:1 | 3:1 (texto grande) |
| Ênfase dourada do H1      |         5,50:1 |           8,14:1 | 3:1 (texto grande) |
| Descrição                 |         4,83:1 |   acima de 9,9:1 |              4,5:1 |
| CTA textual               |        12,39:1 |           9,49:1 |              4,5:1 |
| Assinatura                | acima de 5,4:1 |           4,66:1 |              4,5:1 |
| Linha forte da assinatura |        11,51:1 |           7,20:1 |              4,5:1 |
| Link inferior             |         9,53:1 |           6,18:1 |              4,5:1 |
| Legenda inferior desktop  |         5,34:1 | oculta no mobile |              4,5:1 |

O símbolo ✧ é decorativo, tem `aria-hidden` e não comunica estado ou informação. A assinatura recebeu o token `--hero-copy` mais claro para manter margem no recorte mobile mais desfavorável.

## Estados inativos

Controles desabilitados preservam o atributo nativo `disabled`, cursor e opacidade consistente. Eles não carregam informação disponível apenas pela cor e são excluídos dos requisitos de contraste de elementos inativos previstos pelos critérios aplicáveis. O mesmo controle, quando acionável ou focável, usa os pares aprovados e o outline de foco medido pelo gate.

A matriz vale para as imagens e cores versionadas neste commit. Trocar fotografia, overlay, tema de capa ou token nuclear exige repetir a medição; o CI bloqueia regressões nas cores determinísticas.
