-- The dedicated storefront database owns its short-lived abuse-control data.
create extension if not exists pg_cron with schema extensions;

select cron.schedule(
  'promo-premium-prune-rate-limits',
  '*/5 * * * *',
  'select public.prune_premium_briefing_rate_limits()'
);
