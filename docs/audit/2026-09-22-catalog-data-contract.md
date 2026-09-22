# Auditoria independente do fluxo de dados do catálogo

Data: 22/09/2026  
Escopo: `doufsxqlfjyuvxuezpln` (somente GET) → conferência/sincronizador → `whwloseshzraipljisqo` → API e UI públicas.

## Resultado

O fluxo preservou a fronteira entre os bancos em todos os ensaios. A origem operacional recebeu somente GET com chave publishable, view e seis colunas fixas. O dry-run consultou os dois projetos e não executou escrita. A conferência ao vivo encontrou oito produtos ativos na origem e oito produtos publicados no banco premium, com os 12 campos públicos iguais ao snapshot editorial.

O sincronizador passou a validar integralmente o snapshot antes de qualquer chamada de rede. Dados malformados, ambíguos ou excessivos agora falham antes de ler a origem e antes de alcançar o destino.

## Evidências reproduzíveis

| Verificação                                  | Resultado                            | Comando                                                                                                           |
| -------------------------------------------- | ------------------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| Fronteira origem/destino e falhas simuladas  | 52/52 testes                         | `npm run test:catalog-boundary`                                                                                   |
| Paginação, cache, drift e integração isolada | 55/55 cenários                       | `node scripts/audit-plan-scenarios.mjs`                                                                           |
| Origem operacional ao vivo                   | 8 ativos e coincidentes; GET público | `npm run check:catalog-source`                                                                                    |
| Fluxo completo sem mutação                   | 8 conferidos; zero escritas          | `npm run db:sync-catalog -- --dry-run`                                                                            |
| Publicação premium ao vivo                   | 8 publicados; 12 campos exatos       | `npm run check:editorial:live`                                                                                    |
| Formatação e whitespace                      | aprovado                             | `npx prettier --check scripts/sync-site-catalog.mjs scripts/tests/catalog-boundary.test.mjs` e `git diff --check` |

Nenhum teste de escrita, migration, RPC de mutação ou alteração de permissão foi executado em `doufsxqlfjyuvxuezpln`.

## Contratos conferidos

- Origem fixa em `https://doufsxqlfjyuvxuezpln.supabase.co/rest/v1/v_products_public`.
- Método GET, redirecionamento recusado, sem corpo e sem `Authorization` administrativo.
- Projeção fixa: `id,sku,name,min_quantity,allows_personalization,is_active`.
- Chave da origem aceita somente no formato `sb_publishable_*`; secret e JWT legado falham antes da rede.
- Resposta exige contagem exata, todos os IDs solicitados, IDs únicos, tipos válidos e itens ativos.
- Colunas inesperadas da origem, incluindo custo e fornecedor sintéticos, são descartadas na reconstrução do DTO.
- Escrita do sincronizador permanece restrita ao host premium exato; URL operacional, lookalikes, porta, credenciais na URL, caminho, query, fragmento e redirecionamento são recusados.
- Despublicação manual, leitura parcial do destino, falha da origem e drift em SKU, nome original, mínimo ou personalização interrompem o fluxo antes da escrita.
- API pública lê somente os 12 campos aprovados, somente publicados, em páginas de 500, com contagem exata e teto de 10.000 itens.
- Paginação de 530 itens, mudança de total entre páginas, ausência de total, intervalo inconsistente, duplicata e item não solicitado foram simulados.
- Consulta por IDs usa `no-store`; descoberta usa cache compartilhado de cinco minutos e `stale-while-revalidate` de dez minutos.
- IDs, SKUs e slugs duplicados no resultado premium são tratados como inconsistência; slug, data, categoria, mídia, quantidade e tipos são validados antes de compor o DTO público.

## Hardening implementado no sincronizador

Os maiores valores atuais e os novos limites preventivos são:

| Campo           | Maior valor atual | Limite |
| --------------- | ----------------: | -----: |
| `sku`           |                 8 |     64 |
| `slug`          |                87 |    120 |
| `name`          |                27 |    120 |
| `original_name` |                88 |    240 |
| `tagline`       |                39 |    160 |
| `description`   |               201 |  2.000 |
| `image_path`    |                22 |    255 |

O preflight também exige UUID, slug canônico, categoria pública, caminho local de imagem seguro, data civil válida, mínimo entre 1 e 10.000, booleano de personalização e texto sem espaços marginais. IDs, slugs e SKUs precisam ser únicos; SKU é comparado sem diferença entre maiúsculas e minúsculas.

Dezessete mutações negativas cobrem colisão de SKU/slug, slug e mídia inseguros, data impossível, categoria, mínimo, booleano, espaços marginais e excesso em cada campo. Todas provaram zero chamadas de rede.

## Defesas adicionadas após a auditoria

- A migration `20260922152000_fence_delivery_leases.sql`, aplicada ao banco Premium após o runtime compatível ficar pronto, espelha os limites, trim, formatos de slug/mídia e unicidade de `lower(sku)`. O preflight e a conferência posterior confirmaram que os oito registros atuais são compatíveis e não têm colisões.
- O runtime aceita `SUPABASE_PUBLISHABLE_KEY` apenas no formato `sb_publishable_*` e `SUPABASE_SECRET_KEY` apenas como `sb_secret_*`; chave de classe errada falha antes da rede.
- Toda leitura PostgREST usada pelo runtime e pelo verificador editorial declara GET e rejeita redirects.

## Gaps residuais

1. **Mutações fora do sincronizador.** A auditoria prova o comportamento do código versionado, das constraints e das policies. Não certifica processos administrativos externos que usem service role no banco premium.
2. **Consistência transacional de leitura longa.** Contagem alterada e duplicatas são detectadas entre páginas. Uma alteração concorrente que preserve exatamente o total e não gere duplicata pode produzir uma fotografia mista durante os cinco minutos de cache; ao crescer perto de 500 itens, mover a projeção para uma função/view transacional no banco premium.

Esses gaps não autorizam alterações no banco operacional. A única ação permitida em `doufsxqlfjyuvxuezpln` continua sendo GET da view pública com colunas explícitas.
