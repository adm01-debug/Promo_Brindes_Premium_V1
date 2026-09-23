# Implementação da descoberta premium

Data: 22/09/2026. Escopo: adaptação dos padrões seguros levantados na auditoria do Super Filtro para a vitrine premium.

## Resultado

A vitrine passou a oferecer um painel único e controlado com busca, tipo de presente, múltiplas ocasiões, confirmação de personalização e quantidade desejada. Ocasiões combinam em OR; dimensões diferentes combinam em AND. A quantidade aceita inteiros de 1 a 10.000 e aplica `minimum <= quantity`, com texto explícito de que isso não confirma estoque.

A resposta `2026-09-22.2` inclui total, página, critérios normalizados, sugestão de busca e facetas contextuais. As contagens removem temporariamente a própria dimensão e preservam todas as demais, antes da paginação. O navegador recebe somente a página pedida; o servidor lê a allowlist pública publicada em páginas cacheadas de 500, exige contagem exata, rejeita drift entre páginas e limita o conjunto auditado a 10.000 itens.

## Cenários simulados antes e durante a implementação

- OR entre `boas-vindas` e `novos-destinos`; AND com categoria, personalização e quantidade.
- SKU, acentos, múltiplos termos, aliases editoriais e erro de um caractere.
- Prioridade de correspondência do produto sobre alias amplo de coleção: “garrafa” não transforma toda a coleção de viagem em produto compatível.
- Parâmetros desconhecidos, repetidos, vazios, decimais, negativos e acima do limite.
- URL compartilhada, recarga, Voltar e Avançar com todas as novas facetas.
- Resposta A lenta seguida de B rápida, falha persistente, retry e modo offline.
- Favoritos consultados por IDs publicados, limitados ao mesmo contrato de 24 itens e sem cache compartilhado.
- Despublicação, mínimo alterado, seleção concorrente e ausência de protocolo no briefing.
- Painel em 390 × 844 e 1440 × 1000, sem overflow horizontal ou erro JavaScript.
- Diálogo, foco, Escape, status, nomes acessíveis e varredura axe.

## Evidências de validação

| Verificação                                         | Resultado                                             |
| --------------------------------------------------- | ----------------------------------------------------- |
| Build de produção e TypeScript                      | Aprovados                                             |
| Playwright em Chromium, Firefox e WebKit            | 213/213 aprovados                                     |
| Isolamento de sincronização e fronteira dos bancos  | 52/52 aprovados                                       |
| Biblioteca de catálogos                             | 13/13 aprovados                                       |
| Ambientes de runtime                                | 5/5 aprovados                                         |
| Probes sintéticos de catálogo, briefing e segurança | 57/57 aprovados                                       |
| Plano de 200 etapas                                 | 200 IDs/revisões; Markdown e CSV sincronizados        |
| Segredos em arquivos públicos/build                 | 70 arquivos verificados; aprovado                     |
| Orçamento de mídia e build                          | Aprovado                                              |
| Origem operacional ao vivo                          | 8 IDs da curadoria ativos por GET; nenhuma escrita    |
| Dependências de produção                            | `npm audit --omit=dev`: 0 vulnerabilidades conhecidas |

Capturas revisadas: [desktop](../screenshots/super-filtro-desktop.png) e [mobile](../screenshots/super-filtro-mobile.png).

## Fronteira de dados

Nenhuma migration foi necessária. Categoria, mínimo e personalização já pertenciam à projeção premium; ocasiões são relações editoriais versionadas por IDs canônicos. O runtime continua lendo `premium_catalog_items` no projeto premium. A origem operacional `doufsxqlfjyuvxuezpln` foi consultada somente por GET durante a validação.

Não foram expostos custo, fornecedor, vendas, estoque, margem ou regras de desconto. O evento local `promo:catalog-filter` informa somente nomes de dimensões, total, duração e sucesso; não inclui busca livre, contato ou briefing.

## Limites que permanecem externos

Cores, materiais, técnicas, preço, estoque e prazo dependem de dados e regras públicas homologadas. Inventar esses valores produziria falsa compatibilidade. A coleta de métricas depende de decisão de privacidade; o evento já está minimizado, mas nenhum destino foi ativado. A validação com vendedores/compradores, o ambiente de staging, o receptor comercial, os direitos das fotos e a liberação de indexação continuam como gates humanos e operacionais.

O cálculo atual de facetas é apropriado à curadoria pequena. Antes de crescer o catálogo até o limite, a equipe deve medir cache frio com volume representativo e mover filtragem/agregação para uma view ou função no banco premium se as metas deixarem de ser atendidas.
