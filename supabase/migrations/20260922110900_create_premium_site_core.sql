-- Dedicated premium storefront. The commercial Promo Gifts database remains separate.
create table public.premium_catalog_items (
  id uuid primary key,
  sku text not null unique,
  slug text not null unique,
  name text not null,
  original_name text not null,
  category text not null check (category in ('Kits & experiências', 'Escrita', 'Lifestyle', 'Viagem')),
  tagline text not null,
  description text not null,
  image_path text not null check (image_path like '/images/%'),
  minimum integer not null check (minimum between 1 and 10000),
  personalizable boolean not null,
  source_date date not null,
  editorial_order smallint not null unique check (editorial_order > 0),
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.premium_catalog_items enable row level security;
revoke all on public.premium_catalog_items from public, anon, authenticated;
grant select on public.premium_catalog_items to anon, authenticated;
grant select, insert, update, delete on public.premium_catalog_items to service_role;
create policy premium_catalog_public_read
  on public.premium_catalog_items for select
  to anon, authenticated
  using (published = true);

create table public.premium_briefings (
  id uuid primary key default gen_random_uuid(),
  protocol text not null unique check (protocol ~ '^PB-[A-Z0-9]{12}$'),
  idempotency_key text not null unique check (idempotency_key ~ '^[A-Za-z0-9_-]{16,128}$'),
  request_hash text not null check (request_hash ~ '^[a-f0-9]{64}$'),
  contact_name text not null check (length(contact_name) between 1 and 120),
  company text not null check (length(company) between 1 and 160),
  email text not null check (length(email) between 3 and 200),
  occasion text not null check (length(occasion) between 1 and 120),
  desired_date date,
  budget text check (budget is null or length(budget) <= 80),
  message text check (message is null or length(message) <= 2000),
  items jsonb not null default '[]'::jsonb check (jsonb_typeof(items) = 'array' and jsonb_array_length(items) <= 24),
  status text not null default 'received' check (status in ('received', 'qualified', 'closed')),
  created_at timestamptz not null default now()
);

create index premium_briefings_created_at_idx on public.premium_briefings (created_at desc);
alter table public.premium_briefings enable row level security;
revoke all on public.premium_briefings from public, anon, authenticated;
grant select, insert, update on public.premium_briefings to service_role;
-- No anon/authenticated policy: contact data is server-only.
