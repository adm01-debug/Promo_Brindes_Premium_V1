-- A limpeza dos limites pode ser disparada pelo agendador do banco (a cada
-- cinco minutos) ou na mao pelo console. As duas execucoes precisam ficar em
-- linhas separadas: se a manual atualizasse a linha do agendador, um cron
-- parado passaria a aparecer como "Em dia" no primeiro clique do operador,
-- escondendo exatamente o problema que o cartao existe para mostrar.

create or replace function public.prune_premium_rate_limits_for(p_job_name text)
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
    p_job_name,
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

comment on function public.prune_premium_rate_limits_for(text) is
  'Retencao dos limites compartilhada pelas entradas agendada e manual; grava o heartbeat da origem recebida.';

-- A rotina compartilhada nao e ponto de entrada: so as duas funcoes abaixo
-- podem chamar, e nenhuma delas recebe o nome da tarefa de fora.
revoke all on function public.prune_premium_rate_limits_for(text)
  from public, anon, authenticated, service_role;

create or replace function public.prune_premium_briefing_rate_limits()
returns integer
language sql
security definer
set search_path = ''
as $$
  select public.prune_premium_rate_limits_for('prune_premium_briefing_rate_limits');
$$;

comment on function public.prune_premium_briefing_rate_limits() is
  'Entrada do agendador (cron de cinco minutos); grava o heartbeat que o console usa para provar que o cron esta vivo.';

create or replace function public.prune_premium_briefing_rate_limits_manual()
returns integer
language sql
security definer
set search_path = ''
as $$
  select public.prune_premium_rate_limits_for('prune_premium_briefing_rate_limits_manual');
$$;

comment on function public.prune_premium_briefing_rate_limits_manual() is
  'Entrada da acao "Limpar limites agora" do console; grava heartbeat proprio para nao mascarar um agendador parado.';

revoke all on function public.prune_premium_briefing_rate_limits_manual()
  from public, anon, authenticated;
grant execute on function public.prune_premium_briefing_rate_limits_manual()
  to service_role;