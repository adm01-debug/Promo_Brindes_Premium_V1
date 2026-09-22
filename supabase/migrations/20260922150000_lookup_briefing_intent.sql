-- Request hashes now identify normalized customer intent, independently of
-- mutable catalog fields such as SKU. Refuse to mix old and new hash semantics.
do $$
begin
  if exists (select 1 from public.premium_briefings limit 1) then
    raise exception 'briefing hash migration requires reconciliation of existing rows';
  end if;
end;
$$;

create function public.lookup_premium_briefing(
  p_idempotency_key text,
  p_request_hash text
)
returns table (
  protocol text,
  payload_conflict boolean,
  delivery_status text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    briefing.protocol,
    briefing.request_hash <> p_request_hash,
    briefing.delivery_status
  from public.premium_briefings as briefing
  where briefing.idempotency_key = p_idempotency_key;
$$;

revoke all on function public.lookup_premium_briefing(text, text)
  from public, anon, authenticated;
grant execute on function public.lookup_premium_briefing(text, text)
  to service_role;
