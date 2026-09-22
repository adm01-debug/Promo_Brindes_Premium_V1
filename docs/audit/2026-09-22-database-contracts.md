# Contratos SQL em banco isolado

Data: 22/09/2026. Escopo: `APV1-23`, com relação às etapas 130, 142, 150 e 184 do plano premium.

O projeto agora inclui [13 verificações pgTAP](../../supabase/tests/database/premium_access_and_idempotency.test.sql) e uma [CI de banco isolado](../../.github/workflows/database.yml). Elas verificam a existência das tabelas, RLS, permissões negadas a papéis públicos, recuperação de protocolo pela role de serviço, primeira persistência, repetição idêntica e conflito de conteúdo.

O teste local foi executado com Supabase CLI `2.115.0` e PostgreSQL local, sem conexão com o banco oficial. A inicialização aplicou as nove migrations. Em seguida, `supabase db reset --local --yes` reconstruiu o schema do zero. `supabase test db --local` retornou **13 testes aprovados, zero falhas**, e `supabase db lint --local --level warning --fail-on warning` não encontrou erro ou aviso de schema. O banco de teste usa apenas contato e identificadores sintéticos dentro de transação revertida.

Segundo a [documentação oficial do Supabase](https://supabase.com/docs/guides/database/testing), arquivos em `supabase/tests/database` são executados como pgTAP por `supabase test db`. A [referência da CLI](https://supabase.com/docs/reference/cli/supabase-db-schema-declarative) especifica que cada teste é revertido individualmente. A CI reconstruirá o schema local antes de testar, sem usar credenciais de produção.

Este conjunto comprova somente os 13 contratos descritos. Ainda faltam provas em staging para integração com CRM, concorrência real entre sessões, políticas de todos os futuros papéis, Storage e dados editoriais publicados. A migration do briefing estruturado continua desnecessária porque os novos campos cabem no contrato publicado e no resumo privado já existente.
