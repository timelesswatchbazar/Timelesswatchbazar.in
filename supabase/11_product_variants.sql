-- ============================================================
-- Product color variants (dial colors)
-- Run in Supabase SQL Editor
-- ============================================================

-- ---------- Variants ----------
create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  color_name text not null,
  color_hex text not null default '#C7A252',
  image_url text not null default '',
  stock integer not null default 0 check (stock >= 0),
  -- null = inherit product prices
  actual_price numeric(12, 2) check (actual_price is null or actual_price >= 0),
  sale_price numeric(12, 2) check (sale_price is null or sale_price >= 0),
  is_default boolean not null default false,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint product_variants_sale_lte_actual
    check (
      sale_price is null
      or actual_price is null
      or sale_price <= actual_price
    ),
  constraint product_variants_color_unique unique (product_id, color_name)
);

create index if not exists product_variants_product_id_idx
  on public.product_variants (product_id);
create index if not exists product_variants_active_idx
  on public.product_variants (product_id, is_active, sort_order);

drop trigger if exists product_variants_set_updated_at on public.product_variants;
create trigger product_variants_set_updated_at
  before update on public.product_variants
  for each row execute function public.set_updated_at();

-- ---------- Order items: remember selected color ----------
alter table public.order_items
  add column if not exists variant_id uuid references public.product_variants (id) on delete set null;

alter table public.order_items
  add column if not exists variant_label text not null default '';

create index if not exists order_items_variant_id_idx
  on public.order_items (variant_id);

-- ---------- Privileges ----------
grant usage on schema public to anon, authenticated, service_role;
grant select, insert, update, delete on public.product_variants to service_role;
grant select, insert, update, delete on public.product_variants to authenticated;
grant select on public.product_variants to anon;

-- ---------- RLS ----------
alter table public.product_variants enable row level security;

drop policy if exists "Public read active variants" on public.product_variants;
create policy "Public read active variants"
  on public.product_variants for select
  using (is_active = true or public.is_admin());

drop policy if exists "Admin all product variants" on public.product_variants;
create policy "Admin all product variants"
  on public.product_variants for all
  using (public.is_admin())
  with check (public.is_admin());
