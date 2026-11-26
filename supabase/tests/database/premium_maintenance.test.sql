begin;

create extension if not exists pgtap with schema extensions;
set search_path = public, extensions;
select plan(22);

select has_table(
  'public',
  'premium_maintenance_state',
  'scheduled maintenance keeps a heartbeat'
);
select has_column(
  'public',
  'premium_maintenance_state',
  'last_removed',
  'heartbeat records how much the task removed'
);
select ok(
  (
    select relrowsecurity
    from pg_class
    where oid = 'public.premium_maintenance_state'::regclass
  ),
  'heartbeat has RLS enabled'
);
select ok(
  not has_table_privilege('anon', 'public.premium_maintenance_state', 'SELECT'),
  'anon cannot read maintenance state'
);
select ok(
  not has_table_privilege(
    'authenticated',
    'public.premium_maintenance_state',
    'SELECT'
  ),
  'authenticated cannot read maintenance state'
);
select ok(
  has_table_privilege('service_role', 'public.premium_maintenance_state', 'SELECT'),
  'service role reads the maintenance heartbeat'
);
select ok(
  not has_table_privilege(
    'service_role',
    'public.premium_maintenance_state',
    'DELETE'
  ),
  'service role cannot erase the maintenance history'
);

-- Uma linha velha é removida, a linha dentro da janela fica, e a execução
-- aparece no heartbeat com a contagem.
insert into public.premium_briefing_rate_limits (client_hash, attempt_times, updated_at)
values
  (repeat('a', 64), array[now() - interval '2 hours'], now() - interval '2 hours'),
  (repeat('b', 64), array[now()], now());

select is(
  public.prune_premium_briefing_rate_limits(),
  1,
  'retention removes the stale rate-limit row'
);
select is(
  (
    select count(*)
    from public.premium_briefing_rate_limits
    where client_hash = repeat('b', 64)
  ),
  1::bigint,
  'retention keeps the attempt inside the window'
);
select is(
  (
    select last_status || ':' || last_removed || ':' || run_count
    from public.premium_maintenance_state
    where job_name = 'prune_premium_briefing_rate_limits'
  ),
  'success:1:1',
  'the run is recorded with status, removed rows and count'
);
select ok(
  (
    select last_success_at is not null and last_error is null
    from public.premium_maintenance_state
    where job_name = 'prune_premium_briefing_rate_limits'
  ),
  'a successful run records its success time and no error'
);

-- Rodada sem resíduo continua sendo execução: o console precisa ver que a
-- tarefa está viva mesmo quando não há nada para remover.
select is(
  public.prune_premium_briefing_rate_limits(),
  0,
  'an empty retention run removes nothing'
);
select is(
  (
    select last_removed || ':' || run_count
    from public.premium_maintenance_state
    where job_name = 'prune_premium_briefing_rate_limits'
  ),
  '0:2',
  'the empty run still advances the heartbeat'
);

select ok(
  has_function_privilege(
    'service_role',
    'public.prune_premium_briefing_rate_limits_manual()',
    'EXECUTE'
  ),
  'service role can trigger the manual prune'
);
select ok(
  not has_function_privilege(
    'anon',
    'public.prune_premium_briefing_rate_limits_manual()',
    'EXECUTE'
  ),
  'anon cannot trigger the manual prune'
);
select ok(
  not has_function_privilege(
    'service_role',
    'public.prune_premium_rate_limits_for(text)',
    'EXECUTE'
  ),
  'the shared retention routine is not a callable entry point'
);

-- A limpeza manual grava em linha própria: se ela atualizasse a linha do
-- agendador, um cron parado passaria a parecer "Em dia" no primeiro clique do
-- operador, que é justamente o problema que o cartão precisa mostrar.
update public.premium_maintenance_state
set last_finished_at = now() - interval '2 hours',
    last_success_at = now() - interval '2 hours'
where job_name = 'prune_premium_briefing_rate_limits';

insert into public.premium_briefing_rate_limits (client_hash, attempt_times, updated_at)
values (repeat('d', 64), array[now() - interval '4 hours'], now() - interval '4 hours');

select is(
  public.prune_premium_briefing_rate_limits_manual(),
  1,
  'the manual prune removes the stale row'
);
select ok(
  (
    select last_status = 'success' and last_removed = 1 and run_count = 1
    from public.premium_maintenance_state
    where job_name = 'prune_premium_briefing_rate_limits_manual'
  ),
  'the manual prune records its own heartbeat'
);
select ok(
  (
    select last_finished_at < now() - interval '1 hour'
    from public.premium_maintenance_state
    where job_name = 'prune_premium_briefing_rate_limits'
  ),
  'the manual prune leaves the scheduler heartbeat untouched'
);

-- Falha na remoção não pode ser silenciosa: fica gravada como failed com o
-- motivo, preservando a data do último sucesso.
create function public.pgtap_fail_rate_limit_delete()
returns trigger
language plpgsql
as $$
begin
  raise exception 'synthetic retention failure';
end;
$$;

create trigger pgtap_fail_rate_limit_delete
  before delete on public.premium_briefing_rate_limits
  for each row execute function public.pgtap_fail_rate_limit_delete();

insert into public.premium_briefing_rate_limits (client_hash, attempt_times, updated_at)
values (repeat('c', 64), array[now() - interval '3 hours'], now() - interval '3 hours');

select is(
  public.prune_premium_briefing_rate_limits(),
  null::integer,
  'a failing retention run returns no count'
);
select is(
  (
    select last_status || ':' || coalesce(last_removed::text, 'null')
    from public.premium_maintenance_state
    where job_name = 'prune_premium_briefing_rate_limits'
  ),
  'failed:null',
  'the failure is recorded with status failed and no count'
);
select ok(
  (
    select
      last_error like '%synthetic retention failure%'
      and last_success_at is not null
      and run_count = 3
    from public.premium_maintenance_state
    where job_name = 'prune_premium_briefing_rate_limits'
  ),
  'the failure keeps the last success time and the reason'
);

select * from finish();
rollback;
