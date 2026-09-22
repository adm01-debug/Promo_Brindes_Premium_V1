-- Qualify table references in the lease claim function. The output column
-- delivery_status is also a PL/pgSQL variable inside RETURNS TABLE.
create or replace function public.claim_premium_briefing_delivery(
  p_idempotency_key text
)
returns table (
  protocol text,
  claimed boolean,
  delivery_status text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_protocol text;
  v_delivery_status text;
begin
  update public.premium_briefings as briefing
  set
    delivery_status = 'delivering',
    delivery_attempts = briefing.delivery_attempts + 1,
    delivery_lease_expires_at = now() + interval '2 minutes',
    last_delivery_error = null
  where briefing.idempotency_key = p_idempotency_key
    and (
      briefing.delivery_status in ('pending', 'failed')
      or (
        briefing.delivery_status = 'delivering'
        and briefing.delivery_lease_expires_at < now()
      )
    )
  returning briefing.protocol, briefing.delivery_status
    into v_protocol, v_delivery_status;

  if found then
    return query select v_protocol, true, v_delivery_status;
    return;
  end if;

  select briefing.protocol, briefing.delivery_status
    into v_protocol, v_delivery_status
  from public.premium_briefings as briefing
  where briefing.idempotency_key = p_idempotency_key;

  if not found then
    raise exception 'briefing idempotency record was not found';
  end if;

  return query select v_protocol, false, v_delivery_status;
end;
$$;

revoke all on function public.claim_premium_briefing_delivery(text) from public, anon, authenticated;
grant execute on function public.claim_premium_briefing_delivery(text) to service_role;
