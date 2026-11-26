-- Manutenção automática: a limpeza dos limites roda a cada cinco minutos pelo
-- agendador do banco e, até aqui, falhar ou parar era invisível — o resíduo só
-- aparecia como contatos velhos na aba Limites. Esta tabela guarda a última
-- execução da limpeza para o console provar que ela continua rodando.

create table public.premium_maintenance_state (
  job_name text primary key check (
    job_name = btrim(job_name)
    and length(job_name) between 1 and 64
    and job_name !~ '[\r\n]'
  ),
  last_status text not null check (last_status in ('success', 'failed')),
  last_finished_at timestamptz not null,
  last_success_at timestamptz,
  last_removed integer check (
    last_removed is null or last_removed between 0 and 500
  ),
  last_error text check (
    last_error is null
    or (
      last_error = btrim(last_error)
      and length(last_error) between 1 and 200
      and last_error !~ '[\r\n]'
    )
  ),
  run_count bigint not null default 1 check (run_count between 1 and 1000000000),
  updated_at timestamptz not null default now(),
  constraint premium_maintenance_state_status_check check (
    (
      last_status = 'success'
      and last_error is null
      and last_removed is not null
      and last_success_at is not null
    )
    or (last_status = 'failed' and last_error is not null)
  )
);

comment on table public.premium_maintenance_state is
  'Última execução de cada tarefa de manutenção agendada do banco premium.';
comment on column public.premium_maintenance_state.last_status is
  'success quando a tarefa terminou; failed com o motivo em last_error.';
comment on column public.premium_maintenance_state.last_removed is
  'Registros removidos na última execução bem-sucedida (limite de 500 por rodada).';
comment on column public.premium_maintenance_state.run_count is
  'Execuções registradas desde a instalação da tarefa.';

alter table public.premium_maintenance_state enable row level security;

revoke all on public.premium_maintenance_state from public, anon, authenticated;
grant select, insert, update on public.premium_maintenance_state to service_role;

-- A limpeza registra o próprio resultado. Uma falha na remoção não derruba a
-- execução do agendador: ela fica gravada como failed com o motivo, e o console
-- mostra o cartão de manutenção em falha em vez de esconder o problema.
create or replace function public.prune_premium_briefing_rate_limits()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_removed integer;
  v_status text := 'success';
  v_error text;
begin
  begin
    delete from public.premium_briefing_rate_limits as rate
    where rate.client_hash in (
      select stale.client_hash
      from public.premium_briefing_rate_limits as stale
      where stale.updated_at < clock_timestamp() - interval '1 hour'
      order by stale.updated_at
      limit 500
    );
    get diagnostics v_removed = row_count;
  exception
    when others then
      v_status := 'failed';
      v_error := left(regexp_replace(sqlerrm, '[\r\n]+', ' ', 'g'), 200);
      v_removed := null;
  end;

  insert into public.premium_maintenance_state as state (
    job_name,
    last_status,
    last_finished_at,
    last_success_at,
    last_removed,
    last_error
  ) values (
    'prune_premium_briefing_rate_limits',
    v_status,
    now(),
    case when v_status = 'success' then now() end,
    v_removed,
    v_error
  )
  on conflict (job_name) do update
    set last_status = excluded.last_status,
        last_finished_at = excluded.last_finished_at,
        last_success_at = coalesce(excluded.last_success_at, state.last_success_at),
        last_removed = excluded.last_removed,
        last_error = excluded.last_error,
        run_count = state.run_count + 1,
        updated_at = now();

  return v_removed;
end;
$$;
