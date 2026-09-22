# Fluxo de publicação editorial

Este fluxo controla somente a projeção curada do projeto Premium `whwloseshzraipljisqo`. O catálogo operacional `doufsxqlfjyuvxuezpln` continua sendo uma fonte somente de leitura e nunca é destino deste procedimento.

## Autoridade de cada campo

| Campo                                                                                                | Autoridade                            | Regra                                                                                                                                                              |
| ---------------------------------------------------------------------------------------------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `id`, `sku`, `original_name`, `minimum`, `personalizable`                                            | Catálogo operacional                  | O sincronizador confere a fonte por ID antes de escrever a projeção. Divergência ou produto inativo interrompe o processo.                                         |
| `name`, `slug`, `category`, `tagline`, `description`, `image_path`, `editorial_order`, `source_date` | Snapshot editorial versionado         | A equipe revisa esses campos no repositório. O sincronizador valida formato, limites e unicidade.                                                                  |
| `published`, `published_from`, `published_until`                                                     | Operação editorial da vitrine Premium | O comando de publicação é o único procedimento documentado para retirada e agendamento. A sincronização preserva retirada manual e não envia os limites temporais. |
| `created_at`, `updated_at`                                                                           | Banco Premium                         | O PostgreSQL mantém a trilha temporal. `updated_at` funciona como revisão para impedir sobrescrita concorrente.                                                    |

O modelo referencia os IDs canônicos dos produtos escolhidos e mantém apenas a projeção necessária para a vitrine. Ele não replica fornecedores, custos, preços internos, clientes, pedidos ou demais estruturas do sistema operacional.

## Controles antes de uma alteração

O comando `npm run db:publication`:

- aceita somente um UUID de produto por execução;
- exige URL, project ref e chave secreta do projeto Premium;
- rejeita o host operacional, hosts parecidos e chave publicável antes da rede;
- consulta o registro sem cache e exige uma resposta de exatamente uma linha;
- aceita somente `published`, `published_from` e `published_until`;
- exige horário RFC 3339 com fuso e rejeita uma janela vazia ou invertida;
- funciona como dry-run por padrão;
- no modo de aplicação, exige o SKU e o `updated_at` vistos na inspeção;
- envia a atualização condicionada ao mesmo `updated_at`, sem retry automático;
- falha se outra pessoa ou processo alterar o registro durante a revisão.

A chave secreta fica apenas no ambiente local/servidor autorizado. Ela não deve ser colada no comando, commit, ticket, captura de tela ou log.

## Procedimento

1. Inspecione o produto e registre o SKU, o estado atual e a revisão:

   ```bash
   npm run db:publication -- --inspect --id UUID_DO_PRODUTO
   ```

2. Simule a decisão. Os horários abaixo são exemplos; use a data aprovada:

   ```bash
   npm run db:publication -- --id UUID_DO_PRODUTO --published false
   npm run db:publication -- --id UUID_DO_PRODUTO --from 2026-10-01T09:00:00-03:00 --until 2026-10-31T21:00:00-03:00
   npm run db:publication -- --id UUID_DO_PRODUTO --from null --until null
   ```

3. Compare `current` e `proposed`. Confirme o produto pelo UUID, SKU, slug e decisão editorial. Uma pessoa autorizada deve aprovar conteúdo, direitos e data quando a mudança significar publicação comercial.

4. Aplique usando a revisão e o SKU retornados pela inspeção:

   ```bash
   npm run db:publication -- --id UUID_DO_PRODUTO --published false --apply --expect-updated-at REVISAO_EXATA --confirm-sku SKU_EXATO
   ```

5. Inspecione novamente. Em seguida, valide a API e as superfícies públicas. Uma retirada deve bloquear imediatamente consultas de seleção e briefing; listagens, home, coleções, ficha e sitemap deixam de servir a peça em até 60 segundos.

`npm run check:editorial:live` exige que os oito itens do snapshot atual estejam visíveis. Portanto, ele deve passar no estado editorial padrão e falhar de forma esperada durante uma retirada ou agendamento que reduza esse conjunto. Nessa situação, valide a decisão específica pela inspeção e pelo endpoint público, sem reativar o item apenas para deixar o check verde.

## Cenários operacionais

| Decisão                 | Alteração                                        | Resultado esperado                                                                                          |
| ----------------------- | ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------- |
| Retirada imediata       | `--published false`                              | O item não entra em novas consultas públicas ou briefings; caches de descoberta expiram em até 60 segundos. |
| Republicação imediata   | `--published true --from null --until null`      | O item volta a ficar elegível após a atualização das superfícies em cache.                                  |
| Campanha futura         | `--published true --from INICIO --until FIM`     | O item aparece somente dentro do intervalo aprovado. O término é exclusivo.                                 |
| Adiamento ou extensão   | novo `--from` e/ou `--until`                     | A aplicação exige a revisão atual, evitando sobrescrever uma edição concorrente.                            |
| Rollback de uma decisão | aplicar o estado anterior com a **nova** revisão | O operador reinspeciona e executa uma nova mudança; nunca reutiliza um `updated_at` antigo.                 |

Uma retirada urgente não depende de sincronizar o catálogo. Se o produto ficou inativo ou mudou na origem, `npm run db:sync-catalog -- --dry-run` também falha antes de qualquer escrita, exigindo revisão do snapshot.

## Responsabilidade e evidência

Os papéis propostos são: curadoria aprova seleção e texto; comercial confirma condições; jurídico/marketing confirma direitos; engenharia executa ou supervisiona o comando; operação verifica as superfícies e registra a evidência. Pessoas nominais, substitutos e SLA formal continuam dependendo de aprovação organizacional e são acompanhados separadamente na etapa 050 do plano.

Para cada alteração, registre sem segredos: data, solicitante, aprovador, motivo, UUID, SKU, estado anterior, estado novo, revisão anterior, revisão resultante e resultado das verificações. Em falha de concorrência, reinspecione e submeta a decisão novamente; não contorne a trava.
