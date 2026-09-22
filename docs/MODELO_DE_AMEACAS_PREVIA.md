# Modelo de ameaças da prévia pública

Data: 22/09/2026. Escopo: snapshot local, APIs `/api/catalog` e `/api/briefings`, e eventual adaptador de entrega. Este documento é uma análise técnica; jurídico, DPO e operação precisam aprovar o modelo final antes de qualquer publicação.

**Revisão posterior:** os controles da tabela são iniciais e não satisfazem todos os critérios. Os [cenários diagnósticos](REVISAO_EXAUSTIVA_PLANO.md#defeitos-reproduzidos) reproduziram falhas de concorrência, replay com payload diferente, retry com nova chave e limite de corpo dependente do cabeçalho. A RLS do banco dedicado da vitrine foi verificada em `audit/plan-database-check.json`; a auditoria administrativa do banco operacional e o fluxo de acesso entre clientes permanecem abertos.

| Ativo ou fluxo   | Ameaça                                                    | Controle local                                                                     | Dono do gate de produção       |
| ---------------- | --------------------------------------------------------- | ---------------------------------------------------------------------------------- | ------------------------------ |
| Catálogo público | Vazamento de custo, fornecedor, margem ou estoque         | DTO com allowlist e teste que rejeita campos internos                              | Arquitetura + dados            |
| Catálogo futuro  | Host parecido, projeto errado ou schema divergente        | Snapshot isolado; migração exige host canônico, `pg_catalog` e allowlist           | Backend + responsável Supabase |
| Briefing         | Origem forjada, JSON inesperado, payload excessivo e spam | Checagem de origem, JSON, 16 KiB, schema, mínimo e limite por endereço             | Backend + segurança            |
| Reenvio          | Duas oportunidades pelo mesmo clique ou retry             | Chave de idempotência e protocolo após `2xx` do receptor                           | Backend + operações            |
| Várias réplicas  | Memória perdida em reinício ou divergente entre pods      | Limite explícito: bloqueia lançamento sem persistência compartilhada               | Backend + SRE                  |
| Dados de contato | Persistência indevida no navegador ou logs                | Download local não salva formulário; payload só sai quando há receptor configurado | Jurídico + backend             |
| Arquivos de arte | Malware, acesso cruzado ou URL pública                    | Upload não existe nesta prévia; futuro exige validação e storage privado           | Segurança + operações          |
| Navegador        | XSS, framing ou carregamento de terceiros                 | CSP, `nosniff`, `DENY`, política de permissões e recursos locais                   | Frontend + segurança           |
| Prévia           | Indexação ou descoberta antes de aprovação                | `noindex`, `robots` bloqueado e sitemap vazio por padrão                           | PO + crescimento               |

## Riscos que não podem ser resolvidos localmente

O rate limit e a idempotência atuais vivem na memória de uma instância. O destino comercial, logs com retenção, WAF, fila, conciliação, RLS efetivo, DPA, política e resposta a incidentes ainda não existem nesta instalação. Esses riscos são gates explícitos para as etapas 123, 131–150 e 184–195; não devem ser fechados por uma passagem de testes local.
