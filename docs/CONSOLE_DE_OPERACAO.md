# Console de operação (/operacoes)

Área interna do dono do site para operar o banco premium sem linha de comando:
catálogo, ficha técnica, publicação, leads e limites de envio.

## Como ligar

O console fica invisível (404 na página e nas rotas) até estas duas variáveis
existirem no ambiente:

| Variável | Regra |
| --- | --- |
| `PROMO_PREMIUM_CONSOLE_ENABLED` | precisa ser exatamente `true` |
| `PROMO_PREMIUM_CONSOLE_TOKEN` | 32 caracteres ou mais, sem espaços |
| `SUPABASE_SECRET_KEY` | chave `sb_secret_` do projeto premium; sem ela a página abre mas toda leitura da tela responde 500 |

As duas primeiras liberam a página e as rotas; a terceira é o que permite ao
servidor ler briefings, limites e catálogo com `service_role`. São gates
diferentes, com sintomas diferentes: sem `PROMO_PREMIUM_CONSOLE_ENABLED` ou sem
o token, `/operacoes` e `/api/operacoes/*` respondem 404, igual a uma rota
inexistente; com o gate liberado e sem `SUPABASE_SECRET_KEY`, a página responde
200 e o login funciona, mas toda leitura da tela responde 500, porque
`siteServerConfig()` devolve `null` sem a chave do projeto premium. Por isso as
três entram juntas, no ambiente de Production. O token é digitado uma vez e trocado por um cookie de sessão
`HttpOnly`, `SameSite=Strict`, com validade de 8 horas, assinado por
HMAC-SHA256 com o próprio token. O cookie nunca vai para o cliente em texto
legível e não pode ser forjado sem o token.

As rotas também recusam requisição de outra origem e exigem o cookie de sessão
em toda leitura e gravação.

## O que cada aba faz

**Situação** — conectividade do banco premium, estado real do envio ao
comercial (com a lista de variáveis que faltam), contagem de peças, publicadas,
leads na fila, leads com falha e limites ativos. Mostra também a **réplica da
gestão**: quando o catálogo foi replicado pela última vez, quantos itens curados
foram conferidos, quantos produtos ativos existiam na base de gestão e o motivo
da última falha. Sem sucesso há mais de 48 horas (a replicação roda todo dia) o
card fica **Atrasada** e a tela avisa que a vitrine pode estar exibindo nome ou
preço antigo. Com uma falha registrada e o sucesso já vencido, o card mostra os
dois sinais na mesma nota: o motivo da falha e a idade dos dados. Quando a
consulta ao banco falha, o card fica **Indisponível** e a tela diz que não
conseguiu ler o histórico — diferente de **Sem registro**, que só aparece quando
o banco respondeu e nunca houve tentativa. As contagens exibidas são sempre as da
última execução com sucesso: uma tentativa que falha não as apaga.

**Catálogo** — lista todas as peças com ordem editorial, situação de publicação
e janela. Permite:

- editar a ficha técnica (materiais, medidas, peso em gramas e embalagem) com
  as mesmas regras do banco (até 5 materiais, medidas 2..80, embalagem 2..120,
  peso 1..100000 g) e conferência do que voltou gravado;
- aplicar publicação (no ar/fora do ar + janela) exigindo a digitação do SKU,
  com concorrência otimista por `updated_at`: se alguém alterou a peça depois
  que a tela carregou, a gravação é recusada em vez de sobrescrever.

As duas gravações do catálogo (ficha e publicação) carregam a revisão
(`updated_at`) que a tela leu e só gravam se ela ainda for a do banco, em duas
camadas: a comparação em memória e o filtro `updated_at=eq.<revisão>` no
`PATCH`, com falha fechada quando o banco não devolve exatamente 1 linha. O
carimbo preserva os microssegundos do Postgres — sem isso o filtro nunca
encontraria a linha e a publicação seria sempre recusada. Duas abas abertas não
sobrescrevem mais uma à outra: a segunda recebe "A ficha mudou desde que a tela
foi carregada" (409) e precisa recarregar. Repetir uma publicação idêntica é
tratado como nada a fazer ("Nada mudou em ..."), não como erro.

**Leads** — últimos 200 briefings com contato, ocasião, peças, situação da
entrega, número de tentativas e último erro. Cada lead traz o seletor de
situação do funil (`recebido` → `qualificado` → `encerrado`); a troca só é
enviada ao clicar em **Gravar situação**, e o botão fica desabilitado quando
nada mudou ou enquanto a gravação está em curso. Leads em `failed` (ou presos em
`delivering` com a reserva já expirada) podem voltar para a fila (`pending`). Um
lead em `delivering` com reserva válida é recusado (409): reenfileirar no meio
de um envio apagaria a reserva e o envio em andamento não conseguiria registrar
a entrega. O reenvio real depende do receptor comercial configurado: o console
não inventa um payload que o banco não guarda.

**Limites** — janelas de rate limit por contato, com cinco colunas: **Código**
(8 primeiros dígitos do hash do contato, o mesmo que a vitrine mostra a quem foi
barrado), **Tentativas na janela**, **Situação** (Bloqueado / Sem bloqueio),
**Última tentativa** e **Ações**. O bloqueio real é o da função
`allow_premium_briefing_attempt`: 5 tentativas ou mais dentro de 10 minutos. A
tela aplica exatamente essa regra, então **Tentativas na janela** pode ser menor
que o total de tentativas gravadas — as antigas já saíram da janela e não
bloqueiam ninguém.

O botão **Liberar** apaga o registro daquele contato: é a única forma de
destravar na hora quem ficou sem enviar. Ele só fica habilitado quando a linha
está **Bloqueado**; liberar quem ainda pode enviar devolveria 409 ("ainda pode
enviar, nada foi apagado") e zeraria tentativas válidas. A exclusão é condicional
à lista de tentativas lida (`attempt_times` no filtro): se o contato tentou de
novo entre a leitura da tela e o clique, o DELETE não encontra a linha, nada é
apagado e a resposta é 409 para a tela recarregar. A limpeza automática do
`pg_cron` a cada 5 minutos **não** serve para liberar na hora — ela só remove
registros sem atividade há mais de 1 hora.

## O que o console não faz

- Não envia lead ao comercial por conta própria: sem `BRIEFING_DELIVERY_ENABLED`
  e o receptor configurado, nenhum lead novo entra no banco e a aba mostra o
  motivo exato.
- Não reordena o catálogo: `editorial_order` é único no banco e reordenar exige
  função transacional nova (DDL), fora do escopo deste console.
- Não expõe segredo, chave ou token: as respostas trazem somente estado,
  contagens e conteúdo editorial.

## Verificação

```bash
npm run test:console-operations        # token, sessão, ficha técnica, limites, réplica
npm run test:catalog-boundary          # heartbeat da replicação: alvo, upsert e leitura
npm run test:publication-management    # revisão otimista e microssegundos da publicação
npm run test:e2e -- tests/console.spec.ts   # gate, login, sessão e ações reais
```

Conferido contra o projeto premium (`whwloseshzraipljisqo`) em 26/11/2026, com
peças e leads de teste criados e removidos na mesma execução (o banco voltou às
contagens iniciais: 8 peças, 0 briefings, 0 limites):

| Cenário no runtime de produção | Resultado |
| --- | --- |
| login com o token do console | 200, cookie `HttpOnly` |
| ficha com revisão velha | 409 "A ficha mudou desde que a tela foi carregada" |
| ficha com a revisão lida (microssegundos) | 200 e valores gravados no banco |
| publicar com a revisão lida | 200 "está no ar com a janela informada" |
| repetir a publicação idêntica | 200 "Nada mudou em ..." |
| despublicar com revisão velha | 409 e peça intacta |
| SKU de confirmação errado | 409 "O SKU digitado não confere com o produto" |
| reenfileirar lead em envio com reserva válida | 409 "Esse lead está em envio agora" |
| reenfileirar lead em falha | 200 "voltou para a fila de entrega" |
| lead que ganhou reserva entre a leitura e o envio do pedido | 0 linhas no PATCH (`Content-Range: */0`) e lead intacto em `delivering` |
| liberar contato bloqueado | 200 "já pode enviar um novo briefing" |
| liberar contato com 4 tentativas na janela | 409 "não está bloqueado agora" e registro intacto |
| liberar quando o contato tentou de novo depois da leitura | 0 linhas no DELETE (`Content-Range: */0`) e registro intacto |
| sexto envio do contato bloqueado | 429 `{"error":"RATE_LIMITED","reference":"<8 dígitos>"}` com o mesmo código da aba Limites |
| hash de contato inválido | 400 |
| primeira replicação depois da migration | 200 e a linha única gravou `success` com 8 itens curados entre 7.968 produtos ativos |
| replicação que falha depois de um sucesso | linha vira `failed` com o motivo, mantendo `last_success_at` e as duas contagens do último sucesso, e a nota da tela traz o motivo junto com a idade dos dados |
| replicação que falha sem nenhum sucesso anterior | a nota diz que ainda não houve replicação bem-sucedida, em vez de "há 0 hora(s)" |
| contagem da gestão reprovada (resposta sem `Content-Range` exato) | a contagem é conferida antes de qualquer escrita: a vitrine não recebe nada, a execução falha e o motivo fica no card |
| conferência da gestão reprovada no workflow | o passo de replicação roda mesmo assim (`!cancelled()`), o sincronizador reprova a mesma divergência e grava `failed` com o motivo, em vez de o job abortar em silêncio |
| tabela sem nenhuma tentativa (banco novo) | card mostra **Sem registro** e a tela diz que ainda não houve replicação, em vez de exibir saúde falsa |
| leitura do heartbeat indisponível | card mostra **Indisponível** e a tela diz que não conseguiu consultar o histórico, sem sugerir primeira sincronização |
| contagem da gestão reprovada na simulação (`--dry-run`) | a simulação falha pelo mesmo motivo que a replicação real falharia, em vez de passar limpa e dar a impressão de execução saudável |
| vitrine replicada, mas o heartbeat não pôde ser gravado | a replicação continua válida (o catálogo está atualizado) e o comando avisa no log; o card mantém a tentativa anterior — se já houve sucesso gravado, vira **atrasada** em 48h; se nunca houve, fica em **Sem registro**, que já avisa que a vitrine pode estar desatualizada. O erro cai para o lado de avisar, nunca para o de mostrar saúde falsa |

### O que o e2e cobre e o que ele não cobre

O e2e de navegador (`tests/console.spec.ts`) roda com `route.fulfill`: ele prova
que a tela pede a ação certa, com o corpo certo e no momento certo — não prova
que o banco aplicou. A aplicação real (efeito no Postgres, RLS, `409` de
concorrência, código de atendimento do `429`) é verificada à parte, contra o
projeto premium, e é essa segunda camada que sustenta a tabela acima. As duas
existem porque o e2e não pode rodar contra o banco de produção em cada PR: o
teste não teria como desfazer fixtures de leads e limites com segurança em um
pipeline público. Nenhuma linha da tabela de verificação foi provada só pelo
e2e.

## Cobertura: banco premium x tela

Inventário conferido por consulta direta ao projeto `whwloseshzraipljisqo` em 26/11/2026: 4 tabelas, 7 funções, 2 triggers, 1 política de RLS, 1 job de cron, nenhuma view ou materialized view.

| Objeto do banco | Quem usa | Onde o dono vê ou decide |
| --- | --- | --- |
| `premium_briefings` (20 colunas) | `POST /api/briefings` | aba **Leads**: protocolo, criado em, situação, contato, empresa, e-mail, ocasião, data desejada, peças, mensagem, orçamento (em "Detalhes do pedido"), entrega, tentativas, entregue em, erro. Ficam fora de propósito apenas `id`/`idempotency_key`/`request_hash`/`delivery_lease_*`, que são controle interno e aparecem só como efeito (botão desabilitado enquanto a reserva vale) |
| `premium_briefings.status` | só a aba Leads grava | seletor **Situação do lead** + botão **Gravar situação** (recebido/qualificado/encerrado) |
| `premium_briefings.delivery_*` | funções de claim/record | aba **Leads** + botão **Voltar para a fila** (recusado enquanto a reserva está válida) |
| `premium_briefing_rate_limits` | `allow_premium_briefing_attempt` | aba **Limites** + botão **Liberar** por contato |
| `premium_catalog_sync_state` (7 colunas, 1 linha) | `scripts/sync-site-catalog.mjs` grava; `readConsoleStatus` lê | aba **Situação** → card **Réplica da gestão** (último sucesso, última tentativa, itens conferidos, produtos ativos, motivo da falha) |
| RPCs de briefing (`lookup_`, `persist_`, `allow_`, `claim_`/`record_..._v2`) | `src/app/api/briefings/route.ts` | indireto: cada RPC aparece no efeito dentro da aba **Leads** (lead criado, tentativa contada, entrega reservada/concluída) |
| `premium_catalog_items.published*` | `getSiteCatalogPage` | aba **Catálogo** → **Publicação** (exige digitar o SKU) |
| `premium_catalog_items` ficha (materials, dimensions, weight_g, packaging) | `/api/catalog` e ficha da vitrine | aba **Catálogo** → **Ficha técnica** |
| `premium_catalog_items` editorial (name, slug, tagline, description, image_path, minimum, personalizable, category, editorial_order) | `src/lib/products.json` + sync | fora da tela de propósito: é curadoria versionada e o sync sobrescreve — editar no banco criaria um valor que o próximo ciclo apaga |
| `premium_catalog_items.search_text` | busca pública | vitrine (derivado no sync; não é campo de operação) |
| `set_premium_catalog_updated_at` (trigger) | automático | indireto: `updated_at` aparece nas linhas do Catálogo e protege a concorrência da publicação |
| `prune_premium_briefing_rate_limits` | cron `*/5 * * * *` | indireto: a aba **Limites** mostra o resíduo; só remove registros sem atividade há mais de 1 hora |
| política `premium_catalog_public_read` | leitura anônima da vitrine | vitrine pública (só itens publicados e dentro da janela) |
| replicação gestão→premium | `.github/workflows/catalog-source-guard.yml` (cron 11:17 UTC + guard diário) | aba **Situação** → card **Réplica da gestão** (data do último sucesso, itens conferidos, produtos ativos na gestão e motivo da última falha). O botão "replicar agora" continua fora do console de propósito, para não expor no runtime web a chave de leitura da base de gestão |

O workflow grava o resultado de cada tentativa na tabela `premium_catalog_sync_state` (uma linha só, sem dado pessoal), então a falha aparece na tela em vez de morrer no histórico do GitHub Actions. A etapa de replicação roda mesmo quando a conferência da base de gestão reprova: o sincronizador repete a mesma validação e registra o motivo no heartbeat, para que a divergência que bloqueou a atualização fique visível no card. A contagem de produtos ativos da gestão é a última conferência antes de qualquer escrita: se ela não puder ser provada, a vitrine fica intocada e a tentativa entra como falha — assim o card nunca mostra um resultado antigo para uma vitrine que já foi atualizada. Por ser consulta de leitura, ela roda também no `--dry-run`, que é o passo que o workflow executa no disparo manual sem escrita; o agendamento diário roda `check-catalog-source.mjs` e a replicação real, e as duas passam pela mesma contagem. O heartbeat é observabilidade depois do fato: se a gravação dele falhar depois de uma replicação bem-sucedida, o catálogo continua correto e o comando apenas avisa no log — o card fica na tentativa anterior, virando **atrasada** em 48h quando já havia sucesso gravado e permanecendo em **Sem registro** quando nunca houve, que já avisa que a vitrine pode estar desatualizada. Ou seja, a falha aparece como aviso e nunca como saúde garantida. O runtime web lê essa linha com `service_role` e nunca recebe a chave da base de gestão: quem quer o botão "replicar agora" dentro do console precisa aceitar que a chave de leitura da gestão passe a existir no runtime do site.

### Segurança conferida (RLS e grants)

Estado lido direto do banco em 26/11/2026, para nenhuma tabela ficar acessível por fora do console:

- **RLS ligada nas 4 tabelas** (`premium_catalog_items`, `premium_briefings`, `premium_briefing_rate_limits`, `premium_catalog_sync_state`).
- **Uma única política**: `premium_catalog_public_read` (SELECT) em `premium_catalog_items`, liberando só `published = true` dentro da janela de publicação. Briefings e limites **não têm política nenhuma** — ou seja, nem `anon` nem `authenticated` alcançam esses dados: toda leitura passa pelo console com `service_role`.
- **Grants de tabela**: `anon` e `authenticated` recebem apenas `SELECT` (por coluna) em `premium_catalog_items`; em `premium_briefings` e `premium_briefing_rate_limits` não há grant para essas roles. `service_role` tem `INSERT/SELECT/UPDATE` em `premium_briefings` (sem `DELETE`, coerente com a regra de não apagar lead) e `DELETE/INSERT/SELECT/UPDATE` nos limites.
- **Funções**: 6 das 7 são `SECURITY DEFINER` e todas as 7 usam `search_path` vazio; `EXECUTE` está concedido **somente** para `service_role` — nenhuma função é chamável pela vitrine pública, nem por usuário logado. `set_premium_catalog_updated_at` é função de trigger e não tem `EXECUTE` para ninguém, como deve ser.
- **Nenhuma view nem materialized view**, então não existe caminho de leitura paralelo sem RLS.

### Índices, constraints e o que não existe

Levantado no mesmo banco, para ninguém procurar tela de algo que não é operável:

- **47 constraints** (por tabela: `premium_catalog_items` 20, `premium_briefings` 18, `premium_briefing_rate_limits` 2, `premium_catalog_sync_state` 7): 4 chaves primárias, 5 unicidades (`sku`, `slug`, `editorial_order`, `idempotency_key`, `protocol`) e 38 `check` — as `*_shape_check` são as que recusam texto vazio, fora de faixa ou com espaços nas pontas; `premium_briefings_delivery_lease_check` é a que exige token de reserva e expiração só em `delivering`; em `premium_catalog_sync_state`, `id` booleano com `primary key` e `check (id)` mantém a linha única e a combinada exige `last_error` só quando a tentativa falhou.
- **11 índices não-PK**, todos de suporte (`created_at`, fila de entrega pendente, janela de publicação, `search_text`, `updated_at` dos limites). Nenhum deles é uma funcionalidade: existem para a tela responder rápido, não para o dono operar.
- **Sem chave estrangeira, sem sequence, sem view.** As três tabelas são independentes; os identificadores são `uuid` gerados por `gen_random_uuid()`, então não há coluna de "código sequencial" para exibir.