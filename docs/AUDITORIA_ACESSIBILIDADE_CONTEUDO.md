# Auditoria de acessibilidade do conteúdo publicado

Revisão: 22/09/2026. Escopo: home, biblioteca, coleção, ficha de produto e privacidade da prévia.

## Critérios verificados

- Cada template público contém um `main`, um único H1 e hierarquia de títulos sem salto de nível.
- Toda imagem tem atributo `alt`. Imagens informativas descrevem o objeto mostrado, sem repetir o slogan vizinho.
- `alt=""` aparece somente quando a imagem é redundante com o nome acessível do link/botão que a contém; o controle recebe `aria-label` com a peça ou coleção.
- Fallbacks de mídia anunciam a indisponibilidade quando ela muda a experiência; ícones decorativos ficam fora do nome acessível.
- Links genéricos como “Conhecer a peça” permanecem dentro do artigo identificado pelo H3 e a imagem principal oferece nome explícito. Links isolados usam texto descritivo.
- Títulos, labels e mensagens de erro usam texto visível; placeholders não substituem rótulos.

O teste transversal percorre todos os templates em 320 px, valida landmarks/H1/hierarquia, exige alternativa em cada imagem e rejeita `alt` vazio fora de um controle explicitamente nomeado. Axe cobre `image-alt`, `link-name`, labels e demais regras A/AA nos fluxos representativos.

## Decisões editoriais

| Conteúdo                   | Tratamento                                                                 |
| -------------------------- | -------------------------------------------------------------------------- |
| Hero                       | descreve caixa, caderno, caneta e garrafa; o slogan permanece fora do alt  |
| Produto na grade/ficha     | usa o nome original da peça, mais fiel ao objeto do fornecedor             |
| Capa de catálogo           | imagem interna é redundante; a capa inteira é um link nomeado pela coleção |
| Recomendação contextual    | imagem é redundante; o link recebe “Conhecer {nome da peça}”               |
| Item já nomeado na seleção | miniatura é redundante com o H3 adjacente                                  |
| Falha de mídia             | texto anuncia a indisponibilidade e mantém a ação utilizável               |

Novo conteúdo editorial, mídia ou template deve entrar na mesma matriz antes da publicação. A auditoria cobre o conteúdo versionado atual; não aprova antecipadamente materiais futuros.
