-- Shared sliding window for the optional commercial briefing receiver.
-- The application sends only an HMAC of a proxy-validated client address.
create table public.premium_briefing_rate_limits (
  client_hash text primary key check (client_hash ~ '^[a-f0-9]{64}$'),
  attempt_times timestamptz[] not null default '{}'::timestamptz[],
  updated_at timestamptz not null default clock_timestamp()
);

create index premium_briefing_rate_limits_updated_at_idx
  on public.premium_briefing_rate_limits (updated_at);

alter table public.premium_briefing_rate_limits enable row level security;
revoke all on public.premium_briefing_rate_limits from public, anon, authenticated;
grant select, insert, update, delete on public.premium_briefing_rate_limits to service_role;

create function public.allow_premium_briefing_attempt(p_client_hash text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_attempt_times timestamptz[];
  v_recent timestamptz[];
  v_now timestamptz;
begin
  if p_client_hash is null or p_client_hash !~ '^[a-f0-9]{64}$' then
    raise exception 'invalid rate-limit identity';
  end if;

  insert into public.premium_briefing_rate_limits (client_hash)
  values (p_client_hash)
  on conflict (client_hash) do nothing;

  select rate.attempt_times into v_attempt_times
  from public.premium_briefing_rate_limits as rate
  where rate.client_hash = p_client_hash
  for update;

  v_now := clock_timestamp();
  select coalesce(array_agg(attempt_time order by attempt_time), '{}'::timestamptz[])
    into v_recent
  from unnest(v_attempt_times) as attempt_time
  where attempt_time > v_now - interval '10 minutes';

  if cardinality(v_recent) >= 5 then
    return false;
  end if;

  update public.premium_briefing_rate_limits as rate
  set attempt_times = array_append(v_recent, v_now), updated_at = v_now
  where rate.client_hash = p_client_hash;

  return true;
end;
$$;

revoke all on function public.allow_premium_briefing_attempt(text) from public, anon, authenticated;
grant execute on function public.allow_premium_briefing_attempt(text) to service_role;

-- Administrative retention task; invoke periodically from the trusted server.
create function public.prune_premium_briefing_rate_limits()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_deleted integer;
begin
  delete from public.premium_briefing_rate_limits as rate
  where rate.client_hash in (
    select stale.client_hash
    from public.premium_briefing_rate_limits as stale
    where stale.updated_at < clock_timestamp() - interval '1 hour'
    order by stale.updated_at
    limit 500
  );
  get diagnostics v_deleted = row_count;
  return v_deleted;
end;
$$;

revoke all on function public.prune_premium_briefing_rate_limits() from public, anon, authenticated;
grant execute on function public.prune_premium_briefing_rate_limits() to service_role;
