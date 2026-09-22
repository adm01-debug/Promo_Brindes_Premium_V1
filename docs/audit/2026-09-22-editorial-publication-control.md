# Controle seguro da publicação editorial

Data: 22/09/2026. Escopo: operação de `published`, `published_from` e `published_until` no banco oficial da vitrine Premium. Nenhuma alteração de visibilidade foi aplicada durante esta auditoria.

## Gap e correção

A vigência temporal já existia no schema e no runtime, mas a operação dependeria de edição manual no Supabase. Isso permitia erro de destino, janela ambígua e perda de atualização quando duas pessoas revisassem o mesmo produto.

O comando `scripts/manage-site-publication.mjs` acrescenta um limite operacional estreito: destino Premium exato, shape de resposta fechado, dry-run padrão, confirmação por SKU, trava otimista por `updated_at`, patch somente dos três campos de publicação e ausência de retry. O processo completo está em [FLUXO_PUBLICACAO_EDITORIAL.md](../FLUXO_PUBLICACAO_EDITORIAL.md).

## Simulações automatizadas

`npm run test:publication-management` executa 16 contratos:

1. inspeção somente leitura;
2. normalização de janela com fuso em dry-run;
3. aplicação com confirmação de SKU e trava de revisão;
4. revisão obsoleta;
5. SKU incorreto;
6. corrida que retorna zero linhas;
7. janela invertida;
8. horário sem fuso;
9. campo não autorizado;
10. tipo inválido de `published`;
11. limpeza sem mudança;
12. destino operacional;
13. host parecido;
14. project ref incorreto;
15. chave publicável;
16. registro ausente ou fora do contrato.

Todos os casos passaram. Nos cenários de falha, nenhuma chamada PATCH é alcançada, exceto na corrida simulada, cuja atualização condicionada retorna zero linhas e falha fechada.

## Verificação oficial sem escrita

O produto de UUID `0144f10f-c311-47eb-afd6-14b9ebef35b6`, SKU `08255`, foi consultado no projeto Premium. A inspeção encontrou `published=true`, limites nulos e uma revisão válida. Em seguida, um dry-run propôs `published=false`; o resultado registrou `applied=false`. Nova inspeção confirmou o mesmo estado e o mesmo `updated_at`, demonstrando que a simulação não escreveu.

O projeto operacional `doufsxqlfjyuvxuezpln` não recebeu consulta nem escrita desse comando. A suíte confirma que esse destino é rejeitado antes da rede.

## Limites

O controle técnico não concede autorização editorial, direitos de imagem ou responsabilidade a uma pessoa. A etapa 050 continua aberta até os nomes e o SLA serem aprovados. Uma futura execução com `--apply` deve ter uma decisão editorial concreta e gerar evidência operacional própria.
