-- Keep accent-insensitive discovery in the database so source pagination does
-- not fall back to downloading a catalog just to normalize a query.
alter table public.premium_catalog_items
  add column search_text text generated always as (
    lower(
      translate(
        name || ' ' || original_name || ' ' || sku || ' ' || category,
        'ÁÀÂÃÄáàâãäÉÈÊËéèêëÍÌÎÏíìîïÓÒÔÕÖóòôõöÚÙÛÜúùûüÇçÑñ',
        'AAAAAaaaaaEEEEeeeeIIIIiiiiOOOOOoooooUUUUuuuuCcNn'
      )
    )
  ) stored;

create index premium_catalog_items_search_text_idx
  on public.premium_catalog_items (search_text);
