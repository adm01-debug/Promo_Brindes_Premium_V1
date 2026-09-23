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

## Repositório, CI e produção

O commit técnico `1e7b55de2ee3d9a38b5c06fa37ce3d635dcb0ecf` foi enviado ao `main`. A [qualidade remota 35793370735](https://github.com/adm01-debug/Promo_Brindes_Premium_V1/actions/runs/35793370735) passou em 4m13s com tipos, plano, 86 contratos unitários, build, scanner, orçamento, 57 cenários sintéticos e 213 jornadas de navegador. O [banco isolado 35793370707](https://github.com/adm01-debug/Promo_Brindes_Premium_V1/actions/runs/35793370707) passou em 2m03s com rebuild de onze migrations, 64 contratos pgTAP, concorrência e lint.

A Vercel publicou o commit técnico no deploy imutável `dpl_28aqxQGamE3XAu82usMyymqhh4qS`, URL `promo-brindes-premium-v1-jgyubc3h0-juca1.vercel.app`, com status `Ready` e alias `promo-brindes-premium-v1.vercel.app`.

O smoke test autenticado no deploy confirmou:

- `GET /api/catalog?pageSize=24`: `200`, oito itens, total oito, contrato `2026-09-22.2` no header e corpo e fonte `site-database`;
- cache da mesma consulta: `MISS`, seguido por `HIT` com idade de dois segundos;
- parâmetro desconhecido: `400 INVALID_CATALOG_QUERY` com `no-store`;
- home, ficha permanente e `robots.txt`: `200`;
- `X-Robots-Tag: noindex, nofollow`, CSP, HSTS, `nosniff` e `DENY` presentes;
- logs do deploy: quatro requisições informativas observadas, sem erro de runtime.

O dry-run de migrations confirmou o remoto atualizado e sem migration pendente. O dry-run do catálogo verificou os oito IDs da curadoria como ativos e não escreveu. O dry-run de retirada foi seguido por nova inspeção com `published=true`, limites nulos e o mesmo `updated_at`.

## Limites

O controle técnico não concede autorização editorial, direitos de imagem ou responsabilidade a uma pessoa. A etapa 050 continua aberta até os nomes e o SLA serem aprovados. Uma futura execução com `--apply` deve ter uma decisão editorial concreta e gerar evidência operacional própria.
