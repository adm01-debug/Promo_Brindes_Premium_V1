-- The RETURNS TABLE column delivery_status shadows unqualified identifiers
-- inside PL/pgSQL; qualify the table row in the delivery finalizer as well.
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
  update public.premium_briefings as briefing
  set
    delivery_status = case when p_delivered then 'delivered' else 'failed' end,
    last_delivery_error = case when p_delivered then null else left(coalesce(p_error, 'delivery_failed'), 160) end,
    delivered_at = case when p_delivered then now() else briefing.delivered_at end,
    delivery_lease_expires_at = null
  where briefing.idempotency_key = p_idempotency_key
    and briefing.delivery_status = 'delivering'
  returning briefing.protocol, briefing.delivery_status, briefing.delivery_attempts;
end;
$$;

revoke all on function public.record_premium_briefing_delivery(text, boolean, text) from public, anon, authenticated;
grant execute on function public.record_premium_briefing_delivery(text, boolean, text) to service_role;
