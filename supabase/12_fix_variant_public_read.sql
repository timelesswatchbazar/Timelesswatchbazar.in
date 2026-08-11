-- ============================================================
-- Fix public read for product color variants (if colors missing on store)
-- Run in Supabase SQL Editor
-- ============================================================

grant select on public.product_variants to anon, authenticated;

drop policy if exists "Public read active variants" on public.product_variants;
create policy "Public read active variants"
  on public.product_variants for select
  to anon, authenticated
  using (is_active = true or public.is_admin());

-- Optional: confirm variants exist
-- select p.name, v.color_name, v.is_active, v.stock
-- from public.product_variants v
-- join public.products p on p.id = v.product_id
-- order by p.name, v.sort_order;
