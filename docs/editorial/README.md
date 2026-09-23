# Aprovação editorial dos presentes premium

O [registro de revisão](product-review.json) lista os oito produtos do snapshot versionado em `src/lib/products.json`. Todos começam **pendentes**: nome, material, mínimo, descrição e imagem ainda precisam de conferência humana. Nenhum campo foi preenchido com uma licença ou aprovação presumida. O `sourceDigest` identifica o conteúdo público completo da peça; qualquer alteração no snapshot exige atualizar o registro e revisar a ficha novamente.

Para cada SKU, a curadoria/comercial deve conferir na fonte operacional e com o fornecedor:

1. Material, medidas, capacidade, mínimo e variações aplicáveis, guardando a referência em `materialEvidence` e `minimumEvidence`.
2. Texto público e eventuais alegações ambientais ou de qualidade; marcar `copyApproved` só depois da revisão.
3. Direito de publicar e adaptar a imagem concreta, anotando a evidência em `imageRightsEvidence`.
4. Nome de quem aprovou, data `YYYY-MM-DD` e `reviewedSourceDate` igual à versão da fonte conferida.

Depois da conferência, mudar `status` para `approved`. `npm run check:editorial` valida cobertura, correspondência ao snapshot e preenchimento das aprovações declaradas. `npm run check:editorial:ready` é o gate de lançamento: falha enquanto qualquer item estiver pendente ou rejeitado. A CI executa o controle estrutural e mantém a prévia utilizável durante a revisão.

O script verifica a presença e consistência do registro, não autentica a licença ou o parecer do fornecedor. Em 22/09/2026, `npm run check:editorial:live` fez uma leitura pública do Supabase oficial e encontrou **oito produtos publicados**, sem produto extra e com os 12 campos públicos de cada item iguais aos do snapshot versionado. Essa correspondência é pontual; alterações posteriores precisam de nova conferência. O comando exige `.env.local` com URL, ref e chave pública do projeto da vitrine; não imprime credenciais e nunca grava no banco. O item `APV1-02` permanece parcial até aprovação real por produto.

O [fluxo de publicação editorial](../FLUXO_PUBLICACAO_EDITORIAL.md) define a autoridade dos campos, dry-run, dupla confirmação por revisão e SKU, retirada imediata, agendamento e rollback. Ele não transforma uma ficha pendente em aprovada nem substitui evidência de direitos.

Os [critérios de curadoria](../GOVERNANCA_EDITORIAL_E_CURADORIA.md) registram a justificativa e a lacuna decisiva de cada candidato. Eles tornam a escolha auditável, mas preservam corretamente os oito status como pendentes até a revisão humana.
