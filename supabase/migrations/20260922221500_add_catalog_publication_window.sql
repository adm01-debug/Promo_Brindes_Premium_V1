-- Publication is controlled in the dedicated premium database. Null bounds
-- preserve the current always-published behaviour for the curated catalog.
alter table public.premium_catalog_items
  add column published_from timestamptz,
  add column published_until timestamptz,
  add constraint premium_catalog_items_publication_window_check
    check (
      published_from is null
      or published_until is null
      or published_until > published_from
    );

create index premium_catalog_items_publication_window_idx
  on public.premium_catalog_items (published, published_from, published_until)
  where published = true;

drop policy premium_catalog_public_read on public.premium_catalog_items;
create policy premium_catalog_public_read
  on public.premium_catalog_items for select
  to anon, authenticated
  using (
    published = true
    and (published_from is null or published_from <= pg_catalog.statement_timestamp())
    and (published_until is null or published_until > pg_catalog.statement_timestamp())
  );

