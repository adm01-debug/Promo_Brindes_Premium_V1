-- Legacy project defaults auto-exposed new public-schema objects. New objects
-- now start private and each migration must grant its exact capability.
alter default privileges for role postgres in schema public
  revoke all on tables from public, anon, authenticated, service_role;
alter default privileges for role postgres in schema public
  revoke all on sequences from public, anon, authenticated, service_role;
alter default privileges for role postgres in schema public
  revoke all on functions from public, anon, authenticated, service_role;

-- Normalize current table ACLs. Historical defaults included administrative
-- capabilities beyond the application contract.
revoke all on table public.premium_catalog_items
  from public, anon, authenticated, service_role;
grant select on table public.premium_catalog_items to anon, authenticated;
grant select, insert, update, delete on table public.premium_catalog_items
  to service_role;

revoke all on table public.premium_briefings
  from public, anon, authenticated, service_role;
grant select, insert, update on table public.premium_briefings to service_role;

revoke all on table public.premium_briefing_rate_limits
  from public, anon, authenticated, service_role;
grant select, insert, update, delete on table public.premium_briefing_rate_limits
  to service_role;

-- Trigger functions run through the trigger owner and are not public RPCs.
revoke all on function public.set_premium_catalog_updated_at()
  from public, anon, authenticated, service_role;

revoke all on function public.persist_premium_briefing(text, text, text, text, text, text, date, text, text, jsonb)
  from public, anon, authenticated, service_role;
grant execute on function public.persist_premium_briefing(text, text, text, text, text, text, date, text, text, jsonb)
  to service_role;

revoke all on function public.lookup_premium_briefing(text, text)
  from public, anon, authenticated, service_role;
grant execute on function public.lookup_premium_briefing(text, text)
  to service_role;

revoke all on function public.claim_premium_briefing_delivery_v2(text)
  from public, anon, authenticated, service_role;
grant execute on function public.claim_premium_briefing_delivery_v2(text)
  to service_role;

revoke all on function public.record_premium_briefing_delivery_v2(text, uuid, boolean, text)
  from public, anon, authenticated, service_role;
grant execute on function public.record_premium_briefing_delivery_v2(text, uuid, boolean, text)
  to service_role;

revoke all on function public.allow_premium_briefing_attempt(text)
  from public, anon, authenticated, service_role;
grant execute on function public.allow_premium_briefing_attempt(text)
  to service_role;

revoke all on function public.prune_premium_briefing_rate_limits()
  from public, anon, authenticated, service_role;
grant execute on function public.prune_premium_briefing_rate_limits()
  to service_role;
