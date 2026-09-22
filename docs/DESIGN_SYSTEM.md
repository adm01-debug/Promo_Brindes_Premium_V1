# Sistema visual — Promo Brindes Premium

Versão conceitual de 20/09/2026. Nome de trabalho: **Premium Collection**. Assinatura editorial: “A arte de presentear”. Proposta: presentes corporativos com intenção, utilidade e apresentação cuidadosa.

## Paleta e uso

| Token              | Valor     | Uso                                        |
| ------------------ | --------- | ------------------------------------------ |
| Obsidiana          | `#101110` | Fundo principal, moldura da experiência    |
| Superfície         | `#191A18` | Alternância de seções e diálogos           |
| Superfície elevada | `#22231F` | Campos e superfícies auxiliares            |
| Champanhe          | `#C9B487` | CTA, detalhes e destaques editoriais       |
| Champanhe claro    | `#E1CEAA` | Hover e foco                               |
| Marfim             | `#F4F0E8` | Texto principal                            |
| Cinza quente       | `#B3B1A7` | Texto secundário sobre superfícies escuras |
| Fundo de produto   | `#EEECE6` | Contraste para fotografia real             |

Texto sobre o CTA champanhe é escuro. Dourado em fundo claro não deve ser usado para texto pequeno. Bordas decorativas podem ser discretas; limites essenciais de campo e foco precisam de contraste próprio. Razões verificadas e achados de teste ficam no relatório de validação.

## Tipografia

**Cormorant Garamond**, peso 400/500, em títulos e marcas editoriais; itálico para a segunda intenção da frase. **Manrope**, pesos 400/500/600, em texto e controles. Arquivos de fonte são servidos localmente. Família e peso são escolhas conceituais; o pacote instalado inclui licenças que devem permanecer preservadas na distribuição.

Títulos grandes, leitura curta, descrições diretas. Eyebrows pequenos são decorativos e nunca substituem o nome acessível de uma ação. Foco em legibilidade: a avaliação final deve considerar zoom, baixa visão e telas reais; densidade visual da prévia não dispensa essa revisão.

## Composição

Margem desktop próxima de 5,5vw; mobile 24px. Grid de produtos com quatro colunas desktop e duas em mobile, com uma versão futura de uma coluna caso a ficha exija maior densidade. Imagens com proporção e dimensões reservadas. Botões geométricos; dourado fosco; linhas finas. Sem shimmer excessivo, partículas, cursor customizado ou rolagem sequestrada.

O hero apresenta objeto e contexto. A narrativa alterna seções curtas e espaço de leitura. Cards não dependem de hover para revelar uma ação essencial. A preferência de movimento reduzido é respeitada.

## Voz e microcopy

Usar: “Explore a curadoria”, “Incluir no meu projeto”, “Data desejada”, “Valores sob consulta”, “Possibilidades de personalização”. Descrever o próximo passo e a condição real.

Evitar: “o melhor do Brasil”, “100% sustentável”, “entrega garantida”, “últimas unidades” e qualquer selo, número ou parceria sem prova. Não prometer prazo de atendimento até a operação validar o SLA. Não chamar imagem generativa de fotografia do produto real.

Erro de envio futuro: “Não foi possível registrar seu projeto agora. Sua seleção foi preservada.” Sucesso futuro: “Projeto recebido. Protocolo [confirmado pelo servidor].” Na prévia: “Seu briefing está pronto” significa somente que um arquivo local foi preparado para download.

## Fotografia e ativos

Produto: imagem correspondente ao SKU, cor coerente, fundo limpo, ângulo principal, detalhe de acabamento, escala e embalagem. Licença e disponibilidade precisam de aprovação para publicação comercial. Um conjunto de fotos de fornecedor foi baixado das URLs alternativas já presentes no catálogo.

Campanha: iluminação quente lateral, sombras suaves, materiais reconhecíveis, preto e champanhe, área livre para texto. Não extrapolar a composição conceitual para a lista de componentes de um SKU.

### Imagem gerada

- Ferramenta: **imagegen integrada**, sem CLI ou chamada de API própria.
- Arquivo utilizado: [`../public/images/hero-gifting.webp`](../public/images/hero-gifting.webp).
- Original de trabalho: preservado fora do repositório de entrega; a única versão publicada é `public/images/hero-gifting.webp`.
- Prompt integral: [`IMAGE_PROMPT.txt`](IMAGE_PROMPT.txt).
- Uso: composição conceitual principal e coleção editorial, sempre separada da ficha real de produtos.

## Componentes e estados

O inventário reproduzível de templates, componentes e estados está em
[`INVENTARIO_DE_COMPONENTES.md`](INVENTARIO_DE_COMPONENTES.md). O gate
`npm run check:ui-contract` impede regressão dos tokens essenciais, contraste,
foco, alvo principal e preferência de movimento.

| Componente  | Estados necessários                                                               |
| ----------- | --------------------------------------------------------------------------------- |
| Botão       | normal, hover, foco, disabled, processando quando houver rede                     |
| Card        | imagem, falha de imagem na integração futura, favorito, selecionado               |
| Busca       | inicial, consulta, resultados, vazio, erro quando houver rede                     |
| Filtro      | disponível, aplicado, removido, conjunto sem resultado                            |
| Seleção     | vazia, preenchida, edição, limite, retomada e dado local inválido                 |
| Diálogo     | aberto, foco contido, Escape, fechamento e foco restaurado                        |
| Briefing    | campos vazios, inválidos, corrigidos, download; rede e protocolo no MVP integrado |
| Notificação | anúncio não intrusivo em região de status                                         |

Componentes implementados estão em `src/components`. Os passos avançados de produção estão no plano; a presença desta especificação não significa que todos os estados de rede já existam.
