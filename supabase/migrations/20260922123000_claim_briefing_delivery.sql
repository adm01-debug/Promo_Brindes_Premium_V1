-- A delivery lease makes duplicate browser retries safe even while a webhook
-- request is in flight. A later retry can recover only an expired lease.
alter table public.premium_briefings
  add column delivery_lease_expires_at timestamptz;

alter table public.premium_briefings
  drop constraint premium_briefings_delivery_status_check,
  add constraint premium_briefings_delivery_status_check
    check (delivery_status in ('pending', 'delivering', 'delivered', 'failed'));

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
  update public.premium_briefings
  set
    delivery_status = 'delivering',
    delivery_attempts = premium_briefings.delivery_attempts + 1,
    delivery_lease_expires_at = now() + interval '2 minutes',
    last_delivery_error = null
  where idempotency_key = p_idempotency_key
    and (
      delivery_status in ('pending', 'failed')
      or (
        delivery_status = 'delivering'
        and delivery_lease_expires_at < now()
      )
    )
  returning premium_briefings.protocol, premium_briefings.delivery_status
    into v_protocol, v_delivery_status;

  if found then
    return query select v_protocol, true, v_delivery_status;
    return;
  end if;

  select b.protocol, b.delivery_status
    into v_protocol, v_delivery_status
  from public.premium_briefings b
  where b.idempotency_key = p_idempotency_key;

  if not found then
    raise exception 'briefing idempotency record was not found';
  end if;

  return query select v_protocol, false, v_delivery_status;
end;
$$;

create or replace function public.record_premium_briefing_delivery(
  p_idempotency_key text,
  p_delivered boolean,
  p_error text default null
)
returns table (protocol text, delivery_status text, delivery_attempts integer)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  update public.premium_briefings
  set
    delivery_status = case when p_delivered then 'delivered' else 'failed' end,
    last_delivery_error = case when p_delivered then null else left(coalesce(p_error, 'delivery_failed'), 160) end,
    delivered_at = case when p_delivered then now() else premium_briefings.delivered_at end,
    delivery_lease_expires_at = null
  where idempotency_key = p_idempotency_key
    and delivery_status = 'delivering'
  returning premium_briefings.protocol, premium_briefings.delivery_status, premium_briefings.delivery_attempts;
end;
$$;

revoke all on function public.claim_premium_briefing_delivery(text) from public, anon, authenticated;
revoke all on function public.record_premium_briefing_delivery(text, boolean, text) from public, anon, authenticated;
grant execute on function public.claim_premium_briefing_delivery(text) to service_role;
grant execute on function public.record_premium_briefing_delivery(text, boolean, text) to service_role;
