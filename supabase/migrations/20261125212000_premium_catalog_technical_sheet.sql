-- Ficha tecnica da vitrine. Material, medidas e peso sao copiados do cadastro
-- operacional (somente leitura); embalagem e editorial e fica nula ate a
-- curadoria confirmar, para a peca publica exibir "a confirmar".
alter table public.premium_catalog_items
  add column materials text[] not null default '{}'::text[],
  add column dimensions text,
  add column weight_g integer,
  add column packaging text;

alter table public.premium_catalog_items
  add constraint premium_catalog_items_materials_shape_check
    check (
      cardinality(materials) between 0 and 5
      and array_position(materials, '') is null
      and array_position(materials, null) is null
    ),
  add constraint premium_catalog_items_dimensions_shape_check
    check (
      dimensions is null
      or (dimensions = btrim(dimensions) and length(dimensions) between 2 and 80)
    ),
  add constraint premium_catalog_items_weight_g_shape_check
    check (weight_g is null or weight_g between 1 and 100000),
  add constraint premium_catalog_items_packaging_shape_check
    check (
      packaging is null
      or (packaging = btrim(packaging) and length(packaging) between 2 and 120)
    );

comment on column public.premium_catalog_items.materials is
  'Materiais informados pelo fornecedor; lista vazia aparece como pendente na vitrine.';
comment on column public.premium_catalog_items.dimensions is
  'Medidas textuais do cadastro operacional; nulo aparece como pendente na vitrine.';
comment on column public.premium_catalog_items.weight_g is
  'Peso em gramas informado pelo fornecedor; nulo aparece como pendente na vitrine.';
comment on column public.premium_catalog_items.packaging is
  'Embalagem aprovada pela curadoria; nulo aparece como pendente na vitrine.';