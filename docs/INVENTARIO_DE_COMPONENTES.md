# Inventário de componentes e estados

Revisão: 22/09/2026. Este inventário liga as páginas do MVP aos componentes que as reproduzem e aos testes dos estados críticos. Estilos compartilhados ficam em `src/app/globals.css`; a direção editorial clara dos catálogos fica em `src/app/catalogos/catalogs.css`.

| Componente                   | Responsabilidade                     | Estados reproduzíveis                                                                                                   | Páginas              | Evidência automatizada                   |
| ---------------------------- | ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------- | -------------------- | ---------------------------------------- |
| `Storefront`                 | Home, descoberta, seleção e briefing | inicial, carregando, vazio, erro, offline, filtros, favoritos, seleção válida/inválida/expirada e briefing local/remoto | `/`                  | `tests/storefront.spec.ts`               |
| `CatalogFilters`             | Super Filtro contextual              | busca, tipo, ocasiões múltiplas, personalização, quantidade, contagens, limpeza, loading e erro                         | `/` em diálogo       | `tests/storefront.spec.ts`               |
| `Modal`                      | Janela modal nativa                  | foco inicial, contenção, `Escape`, clique externo e retorno ao acionador                                                | home                 | `tests/storefront.spec.ts`               |
| `ProductDetailActions`       | Persistência da escolha na ficha     | disponível e incluído                                                                                                   | `/produtos/[slug]`   | `tests/public-api.spec.ts`               |
| `ProductRecommendationImage` | Imagem de recomendação contextual    | imagem e falha local                                                                                                    | `/produtos/[slug]`   | contrato de origem e teste da ficha      |
| `CatalogLibrary`             | Busca e temas da biblioteca          | lista, busca, tema, nenhum resultado e origem indisponível                                                              | `/catalogos`         | `tests/catalogs.spec.ts`                 |
| `CatalogCover`               | Capa editorial de coleção            | quatro tons, com e sem imagem publicada                                                                                 | biblioteca e coleção | `tests/catalogs.spec.ts`                 |
| `CatalogFrame`               | Cabeçalho e rodapé das coleções      | desktop e mobile                                                                                                        | `/catalogos/**`      | reflow e axe em `tests/catalogs.spec.ts` |
| `CollectionProductImage`     | Imagem de peça na coleção            | imagem e fallback acessível                                                                                             | `/catalogos/[slug]`  | `tests/catalogs.spec.ts`                 |
| `ShareCatalog`               | Compartilhamento progressivo         | Web Share, clipboard, cópia manual, cancelamento e erro                                                                 | `/catalogos/[slug]`  | `tests/catalogs.spec.ts`                 |
| `RetryCollection`            | Recuperação de leitura indisponível  | nova navegação/consulta                                                                                                 | `/catalogos/[slug]`  | contrato de coleção                      |
| `PlanDashboard`              | Auditoria interna do plano           | filtros, marcação local, status auditado e exportação                                                                   | `/planejamento`      | `tests/plan.spec.ts`                     |

## Composição das páginas

| Template     | Estrutura obrigatória                                                                                                  |
| ------------ | ---------------------------------------------------------------------------------------------------------------------- |
| Home         | anúncio, cabeçalho, `main`, hero, proposta, curadoria, coleções, personalização, processo, FAQ, CTA, rodapé e diálogos |
| Biblioteca   | `CatalogFrame`, `main`, introdução, filtros, grade de `CatalogCover` e rodapé                                          |
| Coleção      | `CatalogFrame`, introdução, capa, peças publicadas ou estado explícito, fechamento e rodapé                            |
| Produto      | cabeçalho, ficha fiel, ações, até três recomendações publicadas, fechamento e JSON-LD sem oferta inventada             |
| Privacidade  | `main`, H1 único e seções que refletem a configuração efetiva de entrega                                               |
| Planejamento | painel interno; retorna 404 quando o ambiente está habilitado para indexação                                           |

Novos componentes devem declarar estados de carregamento, vazio, erro, teclado, reflow e mídia indisponível quando aplicáveis. Uma nova promessa comercial exige dado confirmado e teste de contrato; não deve ser resolvida apenas por texto ou estilo.
