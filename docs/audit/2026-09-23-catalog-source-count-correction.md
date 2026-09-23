# Correção da contagem do catálogo operacional

Data: **23/09/2026**.

## Correção

A mensagem anterior “oito produtos ativos” era ambígua e incorreta como descrição do tamanho do banco. O verificador recebia os oito IDs da curadoria Premium e consultava `v_products_public` com `id=in.(...)`; portanto, comprovava somente que esses oito candidatos estavam ativos e consistentes.

Uma consulta adicional, restrita a `GET`, `select=id`, `is_active=eq.true`, `limit=1` e `Prefer: count=exact`, retornou:

- projeto: `doufsxqlfjyuvxuezpln`;
- HTTP `206`;
- `Content-Range: 0-0/7678`;
- total público ativo: **7.678 produtos**;
- linhas transferidas: **1**;
- escritas: **0**.

O script agora realiza e distingue as duas verificações:

1. contagem total dos produtos ativos expostos pela view pública;
2. conferência detalhada dos oito IDs selecionados para a curadoria Premium.

Isso não é auditoria das tabelas internas e não altera a regra de acesso: o banco operacional continua somente leitura para este projeto. O banco Premium contém apenas a projeção editorial publicada, não o catálogo operacional completo.
