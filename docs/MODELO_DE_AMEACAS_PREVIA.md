# Modelo de ameaças da prévia pública

Data: 22/09/2026. Escopo: snapshot local, APIs `/api/catalog` e `/api/briefings`, e eventual adaptador de entrega. Este documento é uma análise técnica; jurídico, DPO e operação precisam aprovar o modelo final antes de qualquer publicação.

**Revisão posterior:** os cenários sintéticos agora confirmam limite de corpo real, rejeição de data inválida, hash de payload, paginação de fonte e uma única entrega concorrente por chave. A persistência usa chave única, hash e lease no banco dedicado. A RLS do banco dedicado da vitrine foi verificada em `audit/plan-database-check.json`; a auditoria administrativa do banco operacional e o fluxo de acesso entre clientes permanecem abertos.

| Ativo ou fluxo   | Ameaça                                                    | Controle local                                                                     | Dono do gate de produção       |
| ---------------- | --------------------------------------------------------- | ---------------------------------------------------------------------------------- | ------------------------------ |
| Catálogo público | Vazamento de custo, fornecedor, margem ou estoque         | DTO com allowlist e teste que rejeita campos internos                              | Arquitetura + dados            |
| Catálogo futuro  | Host parecido, projeto errado ou schema divergente        | Snapshot isolado; migração exige host canônico, `pg_catalog` e allowlist           | Backend + responsável Supabase |
| Briefing         | Origem forjada, JSON inesperado, payload excessivo e spam | Checagem de origem, JSON, 16 KiB, schema, mínimo e limite por endereço             | Backend + segurança            |
| Reenvio          | Duas oportunidades pelo mesmo clique ou retry             | Chave/hash persistidos e lease atômica por protocolo; conflito retorna `409`       | Backend + operações            |
| Várias réplicas  | Memória perdida em reinício ou divergente entre pods      | Idempotência e limite de tentativas no banco; endereço só é aceito de proxy declarado | Backend + SRE                  |
| Dados de contato | Persistência indevida no navegador ou logs                | Download local não salva formulário; payload só sai quando há receptor configurado | Jurídico + backend             |
| Arquivos de arte | Malware, acesso cruzado ou URL pública                    | Upload não existe nesta prévia; futuro exige validação e storage privado           | Segurança + operações          |
| Navegador        | XSS, framing ou carregamento de terceiros                 | CSP, `nosniff`, `DENY`, política de permissões e recursos locais                   | Frontend + segurança           |
| Prévia           | Indexação ou descoberta antes de aprovação                | `noindex`, `robots` bloqueado e sitemap vazio por padrão                           | PO + crescimento               |

## Riscos que não podem ser resolvidos localmente

O limite da entrega configurada é compartilhado pelo banco, mas o cabeçalho de IP precisa ser comprovadamente sobrescrito pelo proxy na implantação. A limpeza foi agendada no PostgreSQL e o primeiro ciclo terminou com sucesso; alertas e retenção contínua precisam ser observados em operação. O destino comercial, logs com retenção, WAF, fila operacional de conciliação, DPA, política e resposta a incidentes ainda não existem nesta instalação. Esses riscos são gates explícitos para as etapas 123, 131–150 e 184–195; não devem ser fechados por uma passagem de testes local.
