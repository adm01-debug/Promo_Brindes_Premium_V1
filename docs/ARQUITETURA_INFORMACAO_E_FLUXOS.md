# Arquitetura da informação e fluxos da prévia

Versão: 22/09/2026. Este mapa descreve somente a experiência implementada. Itens marcados como futuros dependem de dados, operação ou aprovação comercial e não são promessas do site.

## Mapa de rotas

| Tipo         | Rota ou estado                                       | Finalidade                                                 | Indexação                                               |
| ------------ | ---------------------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------- |
| MVP público  | `/`                                                  | Descoberta, coleções, busca, favoritos e seleção           | Bloqueada enquanto a prévia não for liberada            |
| MVP público  | `/produtos/[slug]`                                   | Ficha estável de cada SKU selecionado                      | Preparada para indexar somente no lançamento autorizado |
| MVP público  | `/privacidade`                                       | Explica a retenção local e a configuração de entrega atual | Bloqueada enquanto a prévia não for liberada            |
| Interno      | `/planejamento`                                      | Acompanhamento das 200 etapas                              | Nunca entra no sitemap público                          |
| Estado local | modal de detalhe, seleção e briefing                 | Não cria URL nem registra dados de contato                 | Não indexável                                           |
| Futuro       | coleções por ocasião, guias e páginas institucionais | Exigem conteúdo, critérios e mídia aprovados               | Não criado                                              |

As facetas de descoberta são estado da vitrine, não novas páginas editoriais. A busca usa `q` e a coleção usa `categoria`; o canonical da home permanece `/`. Isso evita transformar combinações de filtros em duplicatas indexáveis.

## Taxonomia atual

As únicas categorias publicadas são `Kits & experiências`, `Escrita`, `Lifestyle` e `Viagem`. Cada card preserva seu mesmo ID e SKU quando muda de filtro. As ocasiões do briefing servem para explicar a intenção do projeto; elas **não** tornam um produto elegível nem afirmam prazo, técnica, preço ou disponibilidade. Essa relação só poderá ser publicada depois da curadoria comercial.

## Jornada sem conta e retorno

1. A pessoa explora a curadoria, busca por nome, categoria ou SKU e pode favoritar itens.
2. Ao incluir uma peça, a seleção grava apenas ID e quantidade no navegador; não grava nome, empresa, e-mail ou briefing.
3. A seleção expira após 14 dias, é validada contra o snapshot no carregamento e pode ser apagada por item ou pelo comando **Limpar toda a seleção**.
4. A pessoa prepara um briefing com ou sem peças. Sem receptor comercial configurado, o resultado é um arquivo local e nenhum dado de contato sai do navegador.
5. Quando existir receptor aprovado, a mesma etapa deve entregar a solicitação validada e apenas então mostrar o protocolo retornado pelo servidor.

Em dispositivo compartilhado, a pessoa deve usar o comando de limpeza antes de encerrar a sessão. O mecanismo local não substitui uma política de retenção ou um atendimento a titulares da versão comercial.

## Estados de recuperação cobertos

| Situação                       | Resposta da prévia                                    | Recuperação                                                 |
| ------------------------------ | ----------------------------------------------------- | ----------------------------------------------------------- |
| Busca sem resultado            | Explica que outra possibilidade pode funcionar        | Limpa filtros em uma ação                                   |
| Favoritos ou seleção inválidos | Ignora IDs desconhecidos e quantidades fora do mínimo | Mantém a vitrine navegável                                  |
| Seleção expirada               | Remove a seleção local sem recuperar dados antigos    | Permite iniciar nova seleção                                |
| Receptor comercial ausente     | Mantém download local e a API responde `503`          | Não apresenta envio fictício                                |
| Falha do receptor configurado  | Mantém formulário e orienta nova tentativa            | Não gera protocolo local                                    |
| Produto retirado no futuro     | Ainda requer adaptação à fonte canônica               | Deve exibir indisponibilidade, nunca lista vazia silenciosa |

## Componentes e decisões de uso

| Componente            | Decisão implementada                                                                             |
| --------------------- | ------------------------------------------------------------------------------------------------ |
| Cabeçalho e navegação | Marca, busca, favoritos e seleção têm nomes acessíveis; menu móvel abre em diálogo.              |
| Hero                  | Uma imagem conceitual com CTA para curadoria e projeto; não representa SKU.                      |
| Card de produto       | Imagem, categoria, título, favorito, detalhe e inclusão são ações separadas.                     |
| Modal                 | Usa diálogo, Escape, foco contido e restauração do acionador.                                    |
| Seleção               | Quantidade nunca cai abaixo do mínimo público; remover e limpar não equivalem a cancelar pedido. |
| Briefing              | Campos obrigatórios usam labels; download local é diferente de envio ao comercial.               |
| Feedback              | Toast anuncia mudanças sem deslocar o foco.                                                      |

O sistema visual, variantes e restrições de movimento estão em [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md). A aceitação comercial destes fluxos e os testes com compradores permanecem etapas abertas do plano.
