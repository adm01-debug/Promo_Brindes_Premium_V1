# Auditoria transversal do sistema de design

Data: 22/09/2026. Escopo: templates públicos e painel interno desta versão.

## Resultado

- Tipografia, cores nucleares, gutter, alvo principal e movimento curto têm tokens compartilhados em `globals.css`.
- O gate `check:ui-contract` valida a existência dos tokens, 11 combinações de contraste, foco visível, alvo principal de 44 px e movimento reduzido.
- Botões principais, botões de ícone e ações textuais usam as mesmas primitivas. O teste de browser mede 24 px mínimos nas ações essenciais e mantém 44 px como meta dos controles principais.
- Os templates públicos têm exatamente um `main` e um H1, permanecem sem overflow em 320 CSS px e passam a varredura axe configurada.
- Os estados funcionais e sua composição estão no `INVENTARIO_DE_COMPONENTES.md`.

## Variações justificadas

- `/catalogos/**` usa fundo marfim e tinta escura para assumir linguagem de livro editorial. Os quatro tons de capa são propriedades de direção de arte, declaradas como custom properties por tema, e não estados semânticos globais.
- `/planejamento` mantém densidade maior porque é uma ferramenta interna. Ainda reutiliza tipografia, foco, cores-base e alvos de controle.
- Gradientes e transparências do hero são tratamentos fotográficos. Texto essencial usa sombra/overlay e também é coberto pela inspeção axe; contraste sobre fotografia continua sujeito à revisão visual quando a campanha mudar.
- Cores específicas de ilustração, sombras e fotografia não representam texto ou estado de interface e permanecem locais ao componente visual.

Não foram encontrados desvios funcionais que exijam um componente novo. Qualquer alteração nas cores nucleares falha no gate de contraste antes do merge.
