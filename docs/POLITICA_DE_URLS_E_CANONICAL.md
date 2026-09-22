# Política de URLs, facetas e canonical

Versão: 22/09/2026.

| Entidade                | URL canônica                | Variações                                                                                                                        |
| ----------------------- | --------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Home e descoberta       | `/`                         | `q`, `categoria`, `ocasiao`, `personalizavel`, `quantidade`, `sort` e `page` preservam a jornada, mas apontam canonical para `/` |
| Biblioteca de catálogos | `/catalogos`                | busca `q` e tema `tema` apontam canonical para `/catalogos`                                                                      |
| Coleção editorial       | `/catalogos/{slug-estável}` | uma URL por coleção; slug desconhecido retorna 404                                                                               |
| Produto publicado       | `/produtos/{slug-estável}`  | uma URL por produto; slug ausente/despublicado retorna 404                                                                       |
| Privacidade             | `/privacidade`              | noindex na prévia                                                                                                                |
| Planejamento            | `/planejamento`             | noindex e indisponível quando o site for indexável                                                                               |

Slugs são minúsculos, sem acentos, separados por hífen e não carregam preço, estoque ou campanha temporária. Uma mudança aprovada de slug deve incluir redirect permanente direto do endereço antigo ao novo, atualização do canonical e do sitemap, sem cadeia de redirects. Enquanto não existe slug substituído, não se cria redirect especulativo.

Facetas não geram páginas concorrentes: servem para estado compartilhável da descoberta e mantêm canonical no template base. A prévia inteira permanece `noindex`; a ativação de indexação exige domínio canônico aprovado, direitos de conteúdo, revisão do sitemap e Search Console. `tests/public-api.spec.ts` verifica canonical sem parâmetros, títulos únicos e metadados sociais dos templates públicos.
