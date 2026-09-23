# Inventário de privacidade do runtime

Revisão: 23/09/2026. Escopo: aplicação web atual, antes de CRM, analytics, publicidade ou upload.

| Recurso               | Estado atual                              | Classificação                  | Evidência                                                                   |
| --------------------- | ----------------------------------------- | ------------------------------ | --------------------------------------------------------------------------- |
| Cookies da aplicação  | nenhum                                    | não aplicável                  | E2E consulta o contexto após a jornada pública                              |
| Analytics/publicidade | nenhum script ou requisição               | não aplicável                  | E2E rejeita host de terceiro; busca estática no código                      |
| Fontes                | arquivos WOFF2 no próprio build           | necessário à apresentação      | pacote `@fontsource`, CSP `font-src 'self'`                                 |
| Imagens               | arquivos locais do deploy                 | necessário ao catálogo         | CSP `img-src 'self' data: blob:`                                            |
| Catálogo              | servidor consulta o Supabase Premium      | necessário à função solicitada | navegador chama somente `/api/catalog` no mesmo host                        |
| Seleção e favoritos   | IDs, quantidades e data em `localStorage` | preferência necessária         | chaves `promo-premium-selection-v1` e `promo-premium-favorites-v1`          |
| Busca do catálogo     | termo na URL do mesmo host                | dado fornecido pelo visitante  | resposta com termo usa `private, no-store`; interface proíbe dados pessoais |
| Progresso do plano    | IDs marcados e versão em `localStorage`   | ferramenta interna local       | chave `promo-premium-plan-v2`; rota retorna 404 em deploy Vercel            |
| Dados do briefing     | memória da aba e arquivo solicitado       | necessário à ação local        | entrega comercial desligada; nenhum contato em storage                      |

## Decisão desta versão

Não existe banner de consentimento porque a aplicação não instala cookie não essencial, não carrega tracker e não oferece uma escolha fictícia. A página de privacidade informa armazenamento local, ausência de analytics e modo local do briefing.

A busca permanece em query string para permitir restauração por Voltar/Avançar e compartilhamento de filtros. A interface orienta usar somente produto, categoria ou código e não inserir nome, e-mail ou telefone. Respostas com `q` não entram em cache compartilhado, mas a URL ainda pode constar no histórico do navegador e nos logs técnicos da infraestrutura. A decisão para esta versão é manter a busca sem dados pessoais; qualquer futura busca de clientes deve usar um fluxo autenticado próprio e uma avaliação de retenção.

O plano de execução deixou de ser conteúdo da prévia. A rota exige opt-in local e falha fechada em qualquer ambiente implantado na Vercel; os marcadores internos também são rejeitados pelo gate do bundle público.

Qualquer inclusão futura de medição, publicidade, chat, vídeo incorporado ou personalização por identificador reabre esta decisão antes do merge. A implementação deverá bloquear o recurso por padrão, oferecer aceitar/recusar/rever com a mesma facilidade, registrar apenas o necessário e atualizar este inventário e os testes. A base legal, o texto e a retenção dependem dos responsáveis por privacidade; este documento não substitui essa aprovação.
