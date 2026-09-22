begin;

create extension if not exists pgtap with schema extensions;
set search_path = public, extensions;
select plan(35);

-- All elevated functions must resolve relations independently of caller input.
select is(
  (select p.proconfig from pg_proc as p where p.oid = 'public.persist_premium_briefing(text,text,text,text,text,text,date,text,text,jsonb)'::regprocedure),
  array['search_path=""']::text[],
  'persist function has an empty search path'
);
select is(
  (select p.proconfig from pg_proc as p where p.oid = 'public.lookup_premium_briefing(text,text)'::regprocedure),
  array['search_path=""']::text[],
  'lookup function has an empty search path'
);
select is(
  (select p.proconfig from pg_proc as p where p.oid = 'public.claim_premium_briefing_delivery_v2(text)'::regprocedure),
  array['search_path=""']::text[],
  'claim function has an empty search path'
);
select is(
  (select p.proconfig from pg_proc as p where p.oid = 'public.record_premium_briefing_delivery_v2(text,uuid,boolean,text)'::regprocedure),
  array['search_path=""']::text[],
  'delivery finalizer has an empty search path'
);
select is(
  (select p.proconfig from pg_proc as p where p.oid = 'public.allow_premium_briefing_attempt(text)'::regprocedure),
  array['search_path=""']::text[],
  'rate limiter has an empty search path'
);
select is(
  (select p.proconfig from pg_proc as p where p.oid = 'public.prune_premium_briefing_rate_limits()'::regprocedure),
  array['search_path=""']::text[],
  'retention function has an empty search path'
);

select ok(
  not has_function_privilege('anon', 'public.claim_premium_briefing_delivery_v2(text)', 'EXECUTE'),
  'anon cannot claim delivery'
);
select ok(
  not has_function_privilege('authenticated', 'public.claim_premium_briefing_delivery_v2(text)', 'EXECUTE'),
  'authenticated cannot claim delivery'
);
select ok(
  has_function_privilege('service_role', 'public.claim_premium_briefing_delivery_v2(text)', 'EXECUTE'),
  'service role may claim delivery'
);
select ok(
  not has_function_privilege('anon', 'public.record_premium_briefing_delivery_v2(text,uuid,boolean,text)', 'EXECUTE'),
  'anon cannot finalize delivery'
);
select ok(
  not has_function_privilege('authenticated', 'public.record_premium_briefing_delivery_v2(text,uuid,boolean,text)', 'EXECUTE'),
  'authenticated cannot finalize delivery'
);
select ok(
  has_function_privilege('service_role', 'public.record_premium_briefing_delivery_v2(text,uuid,boolean,text)', 'EXECUTE'),
  'service role may finalize delivery'
);
select ok(
  to_regprocedure('public.record_premium_briefing_delivery(text,boolean,text)') is null,
  'unfenced finalizer signature was removed'
);
select ok(
  to_regprocedure('public.claim_premium_briefing_delivery(text)') is null,
  'unversioned claim was removed for fail-closed rollout'
);

select lives_ok(
  $$select * from public.persist_premium_briefing(
    'pgtap-fencing-0001', repeat('c', 64), 'Pessoa Sintética',
    'Empresa de Teste', 'fencing@example.invalid', 'Teste de fencing', null,
    null, null, '[]'::jsonb
  )$$,
  'briefing for lease tests persists'
);

create temporary table lease_a as
select * from public.claim_premium_briefing_delivery_v2('pgtap-fencing-0001');

select is((select claimed from lease_a), true, 'first worker claims the delivery');
select is((select delivery_status from lease_a), 'delivering', 'claimed delivery is in progress');
select ok((select delivery_lease_token is not null from lease_a), 'claim returns an opaque lease token');
select is(
  (select delivery_attempts from public.premium_briefings where idempotency_key = 'pgtap-fencing-0001'),
  1,
  'first claim increments attempts once'
);

create temporary table lease_duplicate as
select * from public.claim_premium_briefing_delivery_v2('pgtap-fencing-0001');

select is((select claimed from lease_duplicate), false, 'concurrent worker cannot claim an active lease');
select is((select delivery_status from lease_duplicate), 'delivering', 'duplicate observes the in-flight state');
select ok((select delivery_lease_token is null from lease_duplicate), 'duplicate never receives another worker lease token');

update public.premium_briefings
set delivery_lease_expires_at = clock_timestamp() - interval '1 second'
where idempotency_key = 'pgtap-fencing-0001';

create temporary table lease_b as
select * from public.claim_premium_briefing_delivery_v2('pgtap-fencing-0001');

select is((select claimed from lease_b), true, 'expired lease can be reclaimed');
select isnt(
  (select delivery_lease_token from lease_b),
  (select delivery_lease_token from lease_a),
  'reclaim rotates the lease token'
);
select is(
  (select delivery_attempts from public.premium_briefings where idempotency_key = 'pgtap-fencing-0001'),
  2,
  'reclaim increments attempts exactly once'
);

select is_empty(
  $$select * from public.record_premium_briefing_delivery_v2(
    'pgtap-fencing-0001',
    (select delivery_lease_token from lease_a),
    false,
    'late_failure'
  )$$,
  'late attempt cannot overwrite the current lease'
);
select is(
  (select delivery_status from public.premium_briefings where idempotency_key = 'pgtap-fencing-0001'),
  'delivering',
  'stale finalizer leaves the newer attempt in progress'
);
select is(
  (select delivery_lease_token from public.premium_briefings where idempotency_key = 'pgtap-fencing-0001'),
  (select delivery_lease_token from lease_b),
  'stale finalizer does not clear the current token'
);

select isnt_empty(
  $$select * from public.record_premium_briefing_delivery_v2(
    'pgtap-fencing-0001',
    (select delivery_lease_token from lease_b),
    true,
    null
  )$$,
  'current token finalizes delivery'
);
select is(
  (select delivery_status from public.premium_briefings where idempotency_key = 'pgtap-fencing-0001'),
  'delivered',
  'successful finalization persists delivered state'
);
select ok(
  (select delivery_lease_token is null and delivery_lease_expires_at is null from public.premium_briefings where idempotency_key = 'pgtap-fencing-0001'),
  'finalization clears all lease state'
);
select is_empty(
  $$select * from public.record_premium_briefing_delivery_v2(
    'pgtap-fencing-0001',
    (select delivery_lease_token from lease_b),
    false,
    'late_failure'
  )$$,
  'completed delivery cannot be reversed by a late failure'
);

select is(
  public.allow_premium_briefing_attempt(repeat('d', 64)),
  true,
  'first rate-limited attempt is allowed'
);
select is(
  (select count(*) from generate_series(1, 4) where public.allow_premium_briefing_attempt(repeat('d', 64))),
  4::bigint,
  'next four attempts are allowed'
);
select is(
  public.allow_premium_briefing_attempt(repeat('d', 64)),
  false,
  'sixth attempt in the window is rejected'
);

select * from finish();
rollback;
