-- Durable briefing persistence for the dedicated storefront only.
alter table public.premium_briefings
  add column delivery_status text not null default 'pending'
    check (delivery_status in ('pending', 'delivered', 'failed')),
  add column delivery_attempts integer not null default 0
    check (delivery_attempts >= 0),
  add column last_delivery_error text
    check (last_delivery_error is null or length(last_delivery_error) <= 160),
  add column delivered_at timestamptz;

create index premium_briefings_delivery_pending_idx
  on public.premium_briefings (created_at asc)
  where delivery_status in ('pending', 'failed');

create or replace function public.persist_premium_briefing(
  p_idempotency_key text,
  p_request_hash text,
  p_contact_name text,
  p_company text,
  p_email text,
  p_occasion text,
  p_desired_date date,
  p_budget text,
  p_message text,
  p_items jsonb
)
returns table (
  protocol text,
  duplicate boolean,
  payload_conflict boolean,
  delivery_status text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_protocol text;
  v_request_hash text;
  v_delivery_status text;
begin
  insert into public.premium_briefings (
    protocol,
    idempotency_key,
    request_hash,
    contact_name,
    company,
    email,
    occasion,
    desired_date,
    budget,
    message,
    items
  ) values (
    'PB-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 12)),
    p_idempotency_key,
    p_request_hash,
    p_contact_name,
    p_company,
    p_email,
    p_occasion,
    p_desired_date,
    p_budget,
    p_message,
    p_items
  )
  on conflict (idempotency_key) do nothing
  returning premium_briefings.protocol, premium_briefings.delivery_status
    into v_protocol, v_delivery_status;

  if found then
    return query select v_protocol, false, false, v_delivery_status;
    return;
  end if;

  select b.protocol, b.request_hash, b.delivery_status
    into v_protocol, v_request_hash, v_delivery_status
  from public.premium_briefings b
  where b.idempotency_key = p_idempotency_key;

  if not found then
    raise exception 'briefing idempotency record was not found after conflict';
  end if;

  return query select
    v_protocol,
    true,
    v_request_hash <> p_request_hash,
    v_delivery_status;
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
    delivery_attempts = premium_briefings.delivery_attempts + 1,
    delivery_status = case when p_delivered then 'delivered' else 'failed' end,
    last_delivery_error = case when p_delivered then null else left(coalesce(p_error, 'delivery_failed'), 160) end,
    delivered_at = case when p_delivered then now() else premium_briefings.delivered_at end
  where idempotency_key = p_idempotency_key
  returning premium_briefings.protocol, premium_briefings.delivery_status, premium_briefings.delivery_attempts;
end;
$$;

revoke all on function public.persist_premium_briefing(text, text, text, text, text, text, date, text, text, jsonb) from public, anon, authenticated;
revoke all on function public.record_premium_briefing_delivery(text, boolean, text) from public, anon, authenticated;
grant execute on function public.persist_premium_briefing(text, text, text, text, text, text, date, text, text, jsonb) to service_role;
grant execute on function public.record_premium_briefing_delivery(text, boolean, text) to service_role;
