begin;

create extension if not exists pgtap with schema extensions;
set search_path = public, extensions;
select plan(13);

select has_table('public', 'premium_catalog_items', 'published catalog exists');
select has_table('public', 'premium_briefings', 'private briefings exist');
select ok((select relrowsecurity from pg_class where oid = 'public.premium_briefings'::regclass), 'briefings have RLS enabled');
select ok(not has_table_privilege('anon', 'public.premium_briefings', 'SELECT'), 'anon cannot read contact records');
select ok(not has_table_privilege('authenticated', 'public.premium_briefings', 'SELECT'), 'authenticated cannot read contact records');
select ok(has_table_privilege('anon', 'public.premium_catalog_items', 'SELECT'), 'anon may read published catalog under RLS');
select ok(not has_function_privilege('anon', 'public.persist_premium_briefing(text,text,text,text,text,text,date,text,text,jsonb)', 'EXECUTE'), 'anon cannot persist a briefing');
select ok(not has_function_privilege('authenticated', 'public.lookup_premium_briefing(text,text)', 'EXECUTE'), 'authenticated cannot look up protocols');
select ok(has_function_privilege('service_role', 'public.lookup_premium_briefing(text,text)', 'EXECUTE'), 'service role may recover protocols');

select is(
  (select duplicate from public.persist_premium_briefing(
    'pgtap-briefing-0001', repeat('a', 64), 'Pessoa Sintética',
    'Empresa de Teste', 'pgtap@example.invalid', 'Teste isolado', null,
    null, 'Data do evento: 2026-12-15', '[]'::jsonb
  )), false, 'first request is new'
);
select is(
  (select duplicate from public.persist_premium_briefing(
    'pgtap-briefing-0001', repeat('a', 64), 'Pessoa Sintética',
    'Empresa de Teste', 'pgtap@example.invalid', 'Teste isolado', null,
    null, 'Data do evento: 2026-12-15', '[]'::jsonb
  )), true, 'same request is deduplicated'
);
select is(
  (select payload_conflict from public.persist_premium_briefing(
    'pgtap-briefing-0001', repeat('b', 64), 'Pessoa Sintética',
    'Empresa de Teste', 'pgtap@example.invalid', 'Teste isolado', null,
    null, 'Data do evento: 2026-12-16', '[]'::jsonb
  )), true, 'different intent conflicts without replacing the request'
);
select is(
  (select payload_conflict from public.lookup_premium_briefing('pgtap-briefing-0001', repeat('a', 64))),
  false, 'original intent still recovers its protocol'
);

select * from finish();
rollback;
