# Fronteira dos bancos de dados

- `doufsxqlfjyuvxuezpln` pertence ao Promo Gifts V4 e à gestão geral de produtos. Por instrução explícita do usuário, este projeto pode **somente ler** essa origem.
- Não executar INSERT, UPDATE, DELETE, UPSERT, migrations, mudanças de schema, policies, grants, funções, Storage ou RPCs de escrita na origem. Testes de escrita também são proibidos nesse banco.
- Ler os produtos pela view `v_products_public`, com colunas explícitas e chave publishable em `CATALOG_SOURCE_SUPABASE_*`. Não armazenar nem usar uma secret/service_role da origem neste site.
- `whwloseshzraipljisqo` é o banco dedicado à vitrine: as variáveis `SUPABASE_*`, migrations e persistência do site pertencem exclusivamente a ele. Nunca substituir essas variáveis pelas credenciais da origem.
- Manter os dois destinos fixos e distintos no código, incluindo importações e entrega de briefings. Nenhum webhook pode escrever diretamente no projeto operacional.
- Validar alterações dessa fronteira com `npm run test:catalog-boundary` e `node scripts/audit-plan-scenarios.mjs`. A verificação ao vivo `npm run check:catalog-source` é somente leitura; não usar o banco operacional para testes de mutação.
