-- ============================================================
-- Optional product variants flag
-- Run in Supabase SQL Editor
-- ============================================================

alter table public.products
  add column if not exists has_variants boolean not null default false;

-- Existing products that already have color rows → enable variants
update public.products p
set has_variants = true
where exists (
  select 1 from public.product_variants v where v.product_id = p.id
);
