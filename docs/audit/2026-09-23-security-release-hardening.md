# Hardening de segurança, banco e release

Data: **23/09/2026**. Candidato técnico inicial: `844056f5b427ff1589ce7c13a40dc0c8938a6807`. Escopo: exposição do planejamento, privacidade da busca, contrato de briefing, privilégios do Supabase Premium, dependências do CI e inventário de segredos da Vercel. O projeto operacional `doufsxqlfjyuvxuezpln` foi consultado somente por GET e não recebeu migration ou escrita.

## Simulações antes da mudança

| Cenário                                                              | Falha procurada                                             | Decisão aplicada                                                                                                         |
| -------------------------------------------------------------------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Visitante acessa `/planejamento` ou procura texto interno nos chunks | Exposição do plano comercial por rota, RSC ou JavaScript    | Opt-in somente local, 404 em qualquer ambiente Vercel e gate que procura marcadores internos em todos os chunks públicos |
| Busca contém texto livre                                             | Compartilhamento do termo em cache público                  | `private, no-store` quando existe `q` e aviso explícito para não inserir nome, e-mail ou telefone                        |
| Cliente omite `Origin` ou envia bytes UTF-8 inválidos                | Contorno do contrato ou normalização ambígua                | Falha fechada com 403 e decodificação UTF-8 fatal antes do JSON                                                          |
| Endpoint remoto responde apenas HTTP 2xx                             | Falso sucesso, protocolo divergente ou corpo excessivo      | Confirmação JSON limitada a 4 KiB, `accepted:true` e protocolo exato                                                     |
| Atacante forja uma chamada ao receptor                               | Briefing falso no CRM                                       | HMAC-SHA256 do timestamp, chave de idempotência e corpo exato, com segredo separado                                      |
| Migration cria objeto novo com ACL herdada                           | Exposição futura por privilégio padrão                      | Revogação de privilégios padrão e grants explícitos mínimos nas tabelas e seis RPCs                                      |
| CI usa tags mutáveis ou perde a evidência de browser                 | Dependência alterada sem revisão e diagnóstico insuficiente | Actions fixadas por SHA, audit de dependências e upload de traces somente em falha                                       |
| Deploy mantém credenciais não usadas                                 | Ampliação desnecessária do impacto de comprometimento       | Remoção de 17 nomes legados/administrativos; runtime ficou com sete variáveis estritamente consumidas                    |

Uma regressão foi encontrada pela própria matriz: o cenário de corpo em streaming não incluía `Origin` e passou a receber 403 antes de exercitar o limite de 16 KiB. O teste foi corrigido para manter sua intenção. A primeira execução E2E também revelou que o servidor de teste herdava a origem local da porta 3100; `playwright.config.ts` agora fixa a origem da porta 3107. A repetição dirigida passou nos três motores antes da matriz integral.

## Resultado local

- TypeScript, plano de 200 etapas, revisão editorial, contrato visual, build, inspeção de segredos, orçamento de performance e `npm audit --omit=dev --audit-level=high`: aprovados.
- Contratos Node: **91/91**.
- Cenários sintéticos isolados: **61/61**, incluindo assinatura, confirmação estrita, ausência de origem e UTF-8 inválido.
- Navegadores Chromium, Firefox e WebKit: **213/213**.
- Banco reconstruído com 12 migrations: **75/75** contratos pgTAP, lint sem alerta e concorrência repetida **10/10**.
- `actionlint` e formatação: aprovados.

## Banco oficial e fronteira de dados

O dry-run remoto apontou somente `20260923071500_harden_default_privileges.sql`. A migration foi aplicada em `whwloseshzraipljisqo`; o dry-run seguinte retornou banco atualizado. Uma consulta administrativa somente leitura confirmou: migration registrada, zero grants padrão para `public`/`anon`/`authenticated`/`service_role`, um grant de tabela para `anon`, um para `authenticated`, onze capacidades de tabela para `service_role` e zero RPCs públicas para `anon` ou `authenticated`.

A fonte operacional `doufsxqlfjyuvxuezpln` foi reconferida pelo cliente limitado: oito produtos ativos retornados por GET, nenhuma escrita. O formulário continua em download local porque `BRIEFING_DELIVERY_ENABLED=false`.

## Estado de implantação

O resultado remoto de GitHub Actions, o deployment imutável, o smoke de produção e a proteção da branch serão registrados nesta seção após a publicação do commit final. A rota de planejamento deve responder 404 no alias e seus marcadores não podem aparecer nos assets públicos. O catálogo deve continuar com oito itens e `X-Catalog-Source: site-database`; briefing deve continuar `configured:false`.

## Pendências externas preservadas

O hardening não homologa um receptor comercial, não cria conciliação automática, não aprova política de retenção, direitos das imagens ou conteúdo, domínio comercial, staging independente, monitoramento real ou piloto com vendedores. Esses itens dependem de decisões, contas ou pessoas externas e permanecem abertos no plano. A assinatura valida autenticidade; a confirmação estruturada reduz falso sucesso; nenhuma das duas elimina a incerteza de timeout depois que o receptor processou a mensagem. O receptor final ainda precisa deduplicar e permitir consulta por protocolo.
