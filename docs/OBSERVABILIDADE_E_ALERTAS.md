# Observabilidade e alertas operacionais

Versão: 22/09/2026. Escopo: catálogo público, briefing e banco dedicado da vitrine. O documento define sinais, limiares, responsáveis e resposta; a conexão do provedor de alertas depende do ambiente de produção.

## Política de telemetria

- Logs e métricas não recebem nome, e-mail, telefone, mensagem, endereço IP bruto, payload do briefing, URL assinada ou segredo.
- `/api/catalog` devolve `X-Request-Id` aleatório e `Server-Timing: catalog;dur=…`; falhas inesperadas registram JSON com evento, rota, status, duração e o mesmo identificador.
- O status HTTP é a fonte de verdade da borda. Eventos do navegador medem descoberta sem contato pessoal. O banco dedicado mantém protocolo e estados técnicos de entrega conforme a política de retenção aprovada.
- Tokens, chaves de idempotência e hashes de endereço não entram em dashboards de produto. Acesso a logs de servidor segue o menor privilégio.

## Catálogo de alertas

| Alerta                       | Janela e limiar inicial                                                           | Fonte                              | Responsável primário         | Procedimento                                                                                                                                                   |
| ---------------------------- | --------------------------------------------------------------------------------- | ---------------------------------- | ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Catálogo indisponível        | `503` em mais de 2% das consultas por 5 min, com ao menos 20 consultas            | status da rota `/api/catalog`      | Backend de plantão           | correlacionar `X-Request-Id`; conferir Supabase da vitrine e deploy; manter briefing de itens bloqueado; reverter o deploy se a regressão for da aplicação     |
| Catálogo lento               | p95 de `Server-Timing catalog` acima de 1.500 ms por 10 min                       | header agregado no edge/APM        | Backend + plataforma         | separar tempo de borda e banco; conferir paginação/contagem; reduzir tráfego abusivo; não aumentar cache sem validar o SLA editorial                           |
| Erro de briefing             | respostas `5xx` acima de 2% por 5 min, mínimo de 10 tentativas                    | status de `/api/briefings`         | Backend + operação comercial | distinguir destino, persistência, catálogo e limite distribuído; preservar protocolos; desabilitar entrega remota se houver duplicação ou perda de confirmação |
| Entrega pendente envelhecida | qualquer registro `pending`/lease expirado por mais de 10 min                     | banco dedicado                     | Operação comercial           | conciliar pelo protocolo no receptor antes de liberar retry; nunca criar segunda oportunidade sem prova de idempotência                                        |
| Fila de falhas               | 5 ou mais entregas finais falhas em 15 min                                        | banco dedicado                     | Operação comercial + backend | pausar retries, validar autenticação e contrato do receptor, exportar protocolos afetados sem dados pessoais para incidente                                    |
| Pico de rate limit           | `429` acima de 10% por 10 min                                                     | status de `/api/briefings`         | Segurança + plataforma       | confirmar cabeçalho de proxy, identificar automação na camada de borda e ajustar WAF; não relaxar limite antes de excluir fraude                               |
| Drift do contrato            | qualquer falha de schema, contagem, slug ou versão                                | CI, checagem editorial e log `503` | Dados + backend              | bloquear publicação, comparar projeção allowlist com migration, corrigir produtor ou criar nova versão de contrato                                             |
| Orçamento de mídia           | qualquer arquivo público acima do limite versionado                               | `check:performance-budget` em CI   | Frontend                     | otimizar/substituir o ativo e repetir build/Lighthouse antes do merge                                                                                          |
| Web Vitals                   | LCP p75 acima de 2,5 s ou INP p75 acima de 200 ms por 7 dias e amostra suficiente | RUM aprovado                       | Frontend + produto           | segmentar página/dispositivo, reproduzir, corrigir causa e acompanhar uma janela equivalente; não declarar melhora por Lighthouse isolado                      |

## Severidade e resposta

- **SEV-1:** risco de duplicação de oportunidade, exposição de dados ou indisponibilidade geral. Operação interrompe a entrega, segurança e responsável técnico assumem o incidente e a retomada exige conciliação.
- **SEV-2:** erro ou latência sustentada sem perda/duplicação. Backend responde no horário de operação e pode reverter o último deploy.
- **SEV-3:** orçamento, drift detectado antes da publicação ou degradação de campo. O owner registra correção no próximo ciclo, mantendo o gate bloqueado.

Para cada incidente, registrar início, alerta, impacto, request IDs amostrais, decisão, responsável, recuperação e ação preventiva. A revisão semanal elimina alertas sem ação e recalibra limiares apenas com volume real. A liberação comercial continua condicionada à criação efetiva desses monitores, canais de plantão e teste controlado em staging.
