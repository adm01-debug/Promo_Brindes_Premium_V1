# Recomendações contextuais e qualidade transversal

Data: 22/09/2026. Escopo: ficha de produto, metadados, contrato público, observabilidade definida, acessibilidade e documentação do plano.

## Simulações antes da implementação

1. **Produto publicado em duas coleções:** os candidatos são unidos na ordem editorial, sem duplicata e sem a própria peça.
2. **Produto despublicado ou linha malformada:** a projeção do banco elimina a peça; uma falha de origem remove o bloco de recomendações sem inutilizar a ficha.
3. **Compatibilidade desconhecida:** a interface diz “mesma ocasião” e não afirma kit, estoque, técnica ou combinação física.
4. **Contrato com campo extra/ausente:** o teste compara todas as chaves do envelope, item e facetas, bloqueando drift silencioso.
5. **Teclado em campo de busca:** `Escape` fecha qualquer modal, inclusive quando `type=search` tentaria consumir a tecla.
6. **Formulário inválido:** o resumo é anunciado, a mensagem é vinculada por `aria-errormessage`, o primeiro campo recebe foco e valores válidos permanecem.
7. **Rede lenta:** a curadoria anuncia progresso, preserva filtro/URL e não mostra sucesso de briefing.
8. **Reflow e toque:** todos os templates públicos são testados em 320 CSS px; controles essenciais visíveis são medidos em 390 px.

## Entregas

- Recomendações com até três peças efetivamente publicadas das mesmas coleções.
- Open Graph e Twitter nos templates públicos, canonical de facetas e política de redirects futuros.
- `X-Request-Id` e `Server-Timing` no catálogo, log estruturado sem PII em falha e runbook com limiar/owner/resposta.
- Tokens para cores nucleares, gutter, alvo de 44 px e movimento; gate matemático de 11 pares de contraste.
- Inventário reproduzível de componentes e auditoria das variações visuais.
- Jornada essencial por teclado, alvos, landmarks, reflow, movimento reduzido, rede lenta e erros associados.

## Limites preservados

Não foi criada recomendação por preço, material, técnica, estoque ou composição porque esses atributos não estão homologados no contrato público. Não foram ativados CRM, analytics, indexação ou alertas de produção. Direitos de imagem, política comercial de privacidade, staging, dispositivos reais e pilotos permanecem gates externos.
