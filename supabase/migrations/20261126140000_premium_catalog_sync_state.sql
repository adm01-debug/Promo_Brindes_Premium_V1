-- Heartbeat da replicação gestão -> premium. Uma linha só, sem dado pessoal:
-- o console mostra quando o catálogo foi replicado pela última vez e para de
-- depender do histórico do GitHub Actions para perceber que a vitrine parou.

create table public.premium_catalog_sync_state (
  id boolean primary key default true check (id),
  last_attempt_at timestamptz not null,
  last_status text not null check (last_status in ('success', 'failed')),
  last_success_at timestamptz,
  last_error text check (
    last_error is null
    or (
      last_error = btrim(last_error)
      and length(last_error) between 1 and 200
      and last_error !~ '[\r\n]'
    )
  ),
  source_count integer check (source_count is null or source_count between 1 and 1000000),
  curated_count integer check (curated_count is null or curated_count between 1 and 1000),
  updated_at timestamptz not null default now(),
  constraint premium_catalog_sync_state_status_check check (
    (last_status = 'success' and last_error is null and last_success_at is not null)
    or (last_status = 'failed' and last_error is not null)
  )
);

comment on table public.premium_catalog_sync_state is
  'Última tentativa de replicação gestão -> premium, gravada pelo workflow do catálogo.';
comment on column public.premium_catalog_sync_state.last_status is
  'success quando todos os itens curados foram replicados; failed com o motivo em last_error.';
comment on column public.premium_catalog_sync_state.source_count is
  'Produtos ativos na base de gestão no momento da última replicação bem-sucedida.';
comment on column public.premium_catalog_sync_state.curated_count is
  'Itens curados replicados na última execução bem-sucedida.';

create trigger premium_catalog_sync_state_set_updated_at
  before update on public.premium_catalog_sync_state
  for each row execute function public.set_premium_catalog_updated_at();

alter table public.premium_catalog_sync_state enable row level security;

revoke all on public.premium_catalog_sync_state from anon, authenticated;
grant select, insert, update on public.premium_catalog_sync_state to service_role;