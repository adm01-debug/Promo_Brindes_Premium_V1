begin;

create extension if not exists pgtap with schema extensions;
set search_path = public, extensions;
select plan(29);

select has_table('public', 'premium_catalog_items', 'published catalog exists');
select has_table('public', 'premium_briefings', 'private briefings exist');
select has_column('public', 'premium_catalog_items', 'published_from', 'catalog supports scheduled publication');
select has_column('public', 'premium_catalog_items', 'published_until', 'catalog supports publication expiry');
select ok((select relrowsecurity from pg_class where oid = 'public.premium_briefings'::regclass), 'briefings have RLS enabled');
select ok(not has_table_privilege('anon', 'public.premium_briefings', 'SELECT'), 'anon cannot read contact records');
select ok(not has_table_privilege('authenticated', 'public.premium_briefings', 'SELECT'), 'authenticated cannot read contact records');
select ok(has_table_privilege('anon', 'public.premium_catalog_items', 'SELECT'), 'anon may read published catalog under RLS');
select ok(not has_function_privilege('anon', 'public.persist_premium_briefing(text,text,text,text,text,text,date,text,text,jsonb)', 'EXECUTE'), 'anon cannot persist a briefing');
select ok(not has_function_privilege('anon', 'public.record_premium_briefing_delivery_v2(text,uuid,boolean,text)', 'EXECUTE'), 'anon cannot finalize a delivery');
select ok(not has_function_privilege('authenticated', 'public.lookup_premium_briefing(text,text)', 'EXECUTE'), 'authenticated cannot look up protocols');
select ok(has_function_privilege('service_role', 'public.lookup_premium_briefing(text,text)', 'EXECUTE'), 'service role may recover protocols');
select is(
  (
    select count(*)
    from pg_constraint
    where conrelid = 'public.premium_catalog_items'::regclass
      and conname in (
        'premium_catalog_items_sku_shape_check',
        'premium_catalog_items_slug_shape_check',
        'premium_catalog_items_name_shape_check',
        'premium_catalog_items_original_name_shape_check',
        'premium_catalog_items_tagline_shape_check',
        'premium_catalog_items_description_shape_check',
        'premium_catalog_items_image_path_shape_check'
      )
  ),
  7::bigint,
  'catalog persistence has every public DTO shape constraint'
);
select ok(
  not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.premium_catalog_items'::regclass
      and conname like 'premium_catalog_items_%_shape_check'
      and not convalidated
  ),
  'catalog shape constraints are validated'
);
select ok(
  exists (
    select 1
    from pg_index as index_definition
    join pg_class as index_relation on index_relation.oid = index_definition.indexrelid
    where index_definition.indrelid = 'public.premium_catalog_items'::regclass
      and index_relation.relname = 'premium_catalog_items_sku_casefold_key'
      and index_definition.indisunique
      and pg_get_expr(index_definition.indexprs, index_definition.indrelid) = 'lower(sku)'
  ),
  'SKU uniqueness is enforced case-insensitively'
);
select ok(
  exists (
    select 1
    from pg_constraint
    where conrelid = 'public.premium_catalog_items'::regclass
      and conname = 'premium_catalog_items_publication_window_check'
      and convalidated
  ),
  'publication window order is constrained'
);
select ok(
  exists (
    select 1
    from pg_indexes
    where schemaname = 'public'
      and tablename = 'premium_catalog_items'
      and indexname = 'premium_catalog_items_publication_window_idx'
      and indexdef like '%WHERE (published = true)%'
  ),
  'published window has a targeted index'
);
select ok(
  exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'premium_catalog_items'
      and policyname = 'premium_catalog_public_read'
      and qual like '%published_from%'
      and qual like '%published_until%'
  ),
  'public RLS policy enforces both publication bounds'
);

insert into public.premium_catalog_items (
  id, sku, slug, name, original_name, category, tagline, description,
  image_path, minimum, personalizable, source_date, editorial_order, published,
  published_from, published_until
) values
  (
    '11111111-1111-4111-8111-111111111111', 'PGTAP-PUBLISHED',
    'pgtap-published', 'Publicada', 'Publicada', 'Escrita', 'Teste',
    'Produto sintético publicado.', '/images/pgtap.webp', 1, true,
    current_date, 32000, true, null, null
  ),
  (
    '22222222-2222-4222-8222-222222222222', 'PGTAP-PRIVATE',
    'pgtap-private', 'Privada', 'Privada', 'Escrita', 'Teste',
    'Produto sintético não publicado.', '/images/pgtap.webp', 1, true,
    current_date, 32001, false, null, null
  ),
  (
    '33333333-3333-4333-8333-333333333333', 'PGTAP-FUTURE',
    'pgtap-future', 'Futura', 'Futura', 'Escrita', 'Teste',
    'Produto sintético agendado.', '/images/pgtap.webp', 1, true,
    current_date, 32002, true, statement_timestamp() + interval '1 hour', null
  ),
  (
    '44444444-4444-4444-8444-444444444444', 'PGTAP-EXPIRED',
    'pgtap-expired', 'Expirada', 'Expirada', 'Escrita', 'Teste',
    'Produto sintético expirado.', '/images/pgtap.webp', 1, true,
    current_date, 32003, true, null, statement_timestamp() - interval '1 hour'
  ),
  (
    '55555555-5555-4555-8555-555555555555', 'PGTAP-WINDOW',
    'pgtap-window', 'Vigente', 'Vigente', 'Escrita', 'Teste',
    'Produto sintético em vigência.', '/images/pgtap.webp', 1, true,
    current_date, 32004, true,
    statement_timestamp() - interval '1 hour',
    statement_timestamp() + interval '1 hour'
  );

select throws_ok(
  $$insert into public.premium_catalog_items (
      id, sku, slug, name, original_name, category, tagline, description,
      image_path, minimum, personalizable, source_date, editorial_order,
      published, published_from, published_until
    ) values (
      '66666666-6666-4666-8666-666666666666', 'PGTAP-INVERTED',
      'pgtap-inverted', 'Invertida', 'Invertida', 'Escrita', 'Teste',
      'Produto sintético inválido.', '/images/pgtap.webp', 1, true,
      current_date, 32005, true,
      statement_timestamp() + interval '1 hour',
      statement_timestamp() - interval '1 hour'
    )$$,
  '23514',
  null,
  'inverted publication window is rejected'
);

set local role anon;
select is(
  (select count(*) from public.premium_catalog_items where sku like 'PGTAP-%'),
  2::bigint,
  'anon sees only currently published catalog rows'
);
select is(
  (select string_agg(sku, ',' order by sku) from public.premium_catalog_items where sku like 'PGTAP-%'),
  'PGTAP-PUBLISHED,PGTAP-WINDOW',
  'anon cannot recover unpublished, future or expired rows'
);
reset role;

set local role authenticated;
select is(
  (select count(*) from public.premium_catalog_items where sku like 'PGTAP-%'),
  2::bigint,
  'authenticated sees only currently published catalog rows'
);
select is(
  (select string_agg(sku, ',' order by sku) from public.premium_catalog_items where sku like 'PGTAP-%'),
  'PGTAP-PUBLISHED,PGTAP-WINDOW',
  'authenticated cannot recover unpublished, future or expired rows'
);
reset role;

select ok(
  (select updated_at = created_at from public.premium_catalog_items where sku = 'PGTAP-PUBLISHED'),
  'new catalog row starts with matching audit timestamps'
);
select pg_sleep(0.01);
update public.premium_catalog_items
set tagline = 'Teste atualizado'
where sku = 'PGTAP-PUBLISHED';
select ok(
  (select updated_at > created_at from public.premium_catalog_items where sku = 'PGTAP-PUBLISHED'),
  'catalog update advances updated_at automatically'
);

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
