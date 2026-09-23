begin;

create extension if not exists pgtap with schema extensions;
set search_path = public, extensions;
select plan(11);

select ok(
  not exists (
    select 1
    from pg_default_acl as defaults
    cross join lateral aclexplode(defaults.defaclacl) as privilege
    where defaults.defaclrole = 'postgres'::regrole
      and defaults.defaclnamespace = 'public'::regnamespace
      and privilege.grantee in (
        0,
        'anon'::regrole::oid,
        'authenticated'::regrole::oid,
        'service_role'::regrole::oid
      )
  ),
  'future public objects grant no capability by default'
);

select is(
  (
    select string_agg(table_name || ':' || privilege_type, ',' order by table_name, privilege_type)
    from information_schema.role_table_grants
    where table_schema = 'public' and grantee = 'anon'
  ),
  'premium_catalog_items:SELECT',
  'anon has only catalog SELECT'
);
select is(
  (
    select string_agg(table_name || ':' || privilege_type, ',' order by table_name, privilege_type)
    from information_schema.role_table_grants
    where table_schema = 'public' and grantee = 'authenticated'
  ),
  'premium_catalog_items:SELECT',
  'authenticated has only catalog SELECT'
);
select is(
  (
    select count(*)
    from information_schema.role_table_grants
    where table_schema = 'public' and grantee = 'service_role'
  ),
  11::bigint,
  'service role has exactly eleven explicit table capabilities'
);
select ok(
  not has_table_privilege('service_role', 'public.premium_briefings', 'DELETE'),
  'service role cannot delete briefings directly'
);
select ok(
  not has_table_privilege('anon', 'public.premium_catalog_items', 'INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER,MAINTAIN'),
  'anon has no catalog mutation or administration capability'
);

select is(
  (
    select count(*)
    from information_schema.routine_privileges
    where specific_schema = 'public'
      and grantee in ('anon', 'authenticated')
      and privilege_type = 'EXECUTE'
  ),
  0::bigint,
  'public API roles execute no private routine'
);
select is(
  (
    select count(distinct routine_name)
    from information_schema.routine_privileges
    where specific_schema = 'public'
      and grantee = 'service_role'
      and privilege_type = 'EXECUTE'
      and routine_name in (
        'persist_premium_briefing',
        'lookup_premium_briefing',
        'claim_premium_briefing_delivery_v2',
        'record_premium_briefing_delivery_v2',
        'allow_premium_briefing_attempt',
        'prune_premium_briefing_rate_limits'
      )
  ),
  6::bigint,
  'service role executes the six intended private routines'
);
select ok(
  not has_function_privilege('service_role', 'public.set_premium_catalog_updated_at()', 'EXECUTE'),
  'trigger function is not exposed as a service RPC'
);
select ok(
  not has_schema_privilege('anon', 'public', 'CREATE')
  and not has_schema_privilege('authenticated', 'public', 'CREATE')
  and not has_schema_privilege('service_role', 'public', 'CREATE'),
  'API roles cannot create objects in public'
);

insert into public.premium_catalog_items (
  id, sku, slug, name, original_name, category, tagline, description,
  image_path, minimum, personalizable, source_date, editorial_order, published
) values (
  '77777777-7777-4777-8777-777777777777', 'PGTAP-ACL-TRIGGER',
  'pgtap-acl-trigger', 'ACL trigger', 'ACL trigger', 'Escrita', 'Teste',
  'Produto sintético para validar a execução interna do trigger.',
  '/images/pgtap.webp', 1, true, current_date, 31000, false
);
select pg_sleep(0.01);
set local role service_role;
update public.premium_catalog_items
set tagline = 'Atualizado pelo service role'
where sku = 'PGTAP-ACL-TRIGGER';
reset role;
select ok(
  (
    select updated_at > created_at
    from public.premium_catalog_items
    where sku = 'PGTAP-ACL-TRIGGER'
  ),
  'service update still invokes the trigger without direct EXECUTE privilege'
);

select * from finish();
rollback;
