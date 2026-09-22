-- Fence delivery attempts with an opaque lease token. A timestamp alone cannot
-- distinguish a late response from attempt A after attempt B has reclaimed an
-- expired lease. Only the holder of the current token may finalize delivery.
alter table public.premium_briefings
  add column delivery_lease_token uuid;

-- Deployments must not preserve an unfenced in-flight attempt. It is safer to
-- leave the durable briefing for reconciliation than to let a stale worker
-- finalize a newer attempt.
update public.premium_briefings
set
  delivery_status = 'failed',
  last_delivery_error = 'lease_token_migration',
  delivery_lease_expires_at = null
where delivery_status = 'delivering';

alter table public.premium_briefings
  add constraint premium_briefings_delivery_lease_check
  check (
    (
      delivery_status = 'delivering'
      and delivery_lease_token is not null
      and delivery_lease_expires_at is not null
    )
    or (
      delivery_status <> 'delivering'
      and delivery_lease_token is null
      and delivery_lease_expires_at is null
    )
  );

drop function public.claim_premium_briefing_delivery(text);

create function public.claim_premium_briefing_delivery_v2(
  p_idempotency_key text
)
returns table (
  protocol text,
  claimed boolean,
  delivery_status text,
  delivery_lease_token uuid
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_protocol text;
  v_delivery_status text;
  v_delivery_lease_token uuid;
begin
  update public.premium_briefings as briefing
  set
    delivery_status = 'delivering',
    delivery_attempts = briefing.delivery_attempts + 1,
    delivery_lease_expires_at = pg_catalog.now() + interval '2 minutes',
    delivery_lease_token = pg_catalog.gen_random_uuid(),
    last_delivery_error = null
  where briefing.idempotency_key = p_idempotency_key
    and (
      briefing.delivery_status in ('pending', 'failed')
      or (
        briefing.delivery_status = 'delivering'
        and briefing.delivery_lease_expires_at < pg_catalog.now()
      )
    )
  returning
    briefing.protocol,
    briefing.delivery_status,
    briefing.delivery_lease_token
  into v_protocol, v_delivery_status, v_delivery_lease_token;

  if found then
    return query
      select v_protocol, true, v_delivery_status, v_delivery_lease_token;
    return;
  end if;

  select briefing.protocol, briefing.delivery_status
    into v_protocol, v_delivery_status
  from public.premium_briefings as briefing
  where briefing.idempotency_key = p_idempotency_key;

  if not found then
    raise exception 'briefing idempotency record was not found';
  end if;

  return query
    select v_protocol, false, v_delivery_status, null::uuid;
end;
$$;

revoke all on function public.claim_premium_briefing_delivery_v2(text)
  from public, anon, authenticated;
grant execute on function public.claim_premium_briefing_delivery_v2(text)
  to service_role;

-- Remove the unfenced finalizer. Keeping it as a compatibility overload would
-- let an old worker overwrite the state owned by a newer lease.
drop function public.record_premium_briefing_delivery(text, boolean, text);

create function public.record_premium_briefing_delivery_v2(
  p_idempotency_key text,
  p_delivery_lease_token uuid,
  p_delivered boolean,
  p_error text default null
)
returns table (protocol text, delivery_status text, delivery_attempts integer)
language plpgsql
security definer
set search_path = ''
as $$
begin
  return query
  update public.premium_briefings as briefing
  set
    delivery_status = case when p_delivered then 'delivered' else 'failed' end,
    last_delivery_error = case
      when p_delivered then null
      else pg_catalog.left(coalesce(p_error, 'delivery_failed'), 160)
    end,
    delivered_at = case
      when p_delivered then pg_catalog.now()
      else briefing.delivered_at
    end,
    delivery_lease_expires_at = null,
    delivery_lease_token = null
  where briefing.idempotency_key = p_idempotency_key
    and briefing.delivery_status = 'delivering'
    and briefing.delivery_lease_token = p_delivery_lease_token
  returning
    briefing.protocol,
    briefing.delivery_status,
    briefing.delivery_attempts;
end;
$$;

revoke all on function public.record_premium_briefing_delivery_v2(text, uuid, boolean, text)
  from public, anon, authenticated;
grant execute on function public.record_premium_briefing_delivery_v2(text, uuid, boolean, text)
  to service_role;

-- Every SECURITY DEFINER function uses an empty search path and schema-qualified
-- relations, preventing caller-controlled object resolution.
alter function public.persist_premium_briefing(text, text, text, text, text, text, date, text, text, jsonb)
  set search_path = '';
alter function public.lookup_premium_briefing(text, text)
  set search_path = '';

-- Mirror the server-side catalog contract at the persistence boundary. This
-- prevents an administrative import from publishing rows the runtime rejects.
alter table public.premium_catalog_items
  add constraint premium_catalog_items_sku_shape_check
    check (sku = pg_catalog.btrim(sku) and pg_catalog.char_length(sku) between 1 and 64),
  add constraint premium_catalog_items_slug_shape_check
    check (
      slug = pg_catalog.btrim(slug)
      and pg_catalog.char_length(slug) between 1 and 120
      and slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
    ),
  add constraint premium_catalog_items_name_shape_check
    check (name = pg_catalog.btrim(name) and pg_catalog.char_length(name) between 1 and 120),
  add constraint premium_catalog_items_original_name_shape_check
    check (
      original_name = pg_catalog.btrim(original_name)
      and pg_catalog.char_length(original_name) between 1 and 240
    ),
  add constraint premium_catalog_items_tagline_shape_check
    check (
      tagline = pg_catalog.btrim(tagline)
      and pg_catalog.char_length(tagline) between 1 and 160
    ),
  add constraint premium_catalog_items_description_shape_check
    check (
      description = pg_catalog.btrim(description)
      and pg_catalog.char_length(description) between 1 and 2000
    ),
  add constraint premium_catalog_items_image_path_shape_check
    check (
      image_path = pg_catalog.btrim(image_path)
      and pg_catalog.char_length(image_path) between 1 and 255
      and image_path ~* '^/images/[A-Za-z0-9][A-Za-z0-9._-]*[.](webp|avif|png|jpe?g)$'
      and pg_catalog.strpos(image_path, '..') = 0
    );

create unique index premium_catalog_items_sku_casefold_key
  on public.premium_catalog_items (pg_catalog.lower(sku));

-- Keep the catalog audit timestamp truthful on every update path, including
-- PostgREST upserts that do not send updated_at explicitly.
create function public.set_premium_catalog_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := pg_catalog.clock_timestamp();
  return new;
end;
$$;

revoke all on function public.set_premium_catalog_updated_at()
  from public, anon, authenticated;

create trigger premium_catalog_items_set_updated_at
before update on public.premium_catalog_items
for each row
execute function public.set_premium_catalog_updated_at();
