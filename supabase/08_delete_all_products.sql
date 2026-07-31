-- ============================================================
-- Delete all products + fix table privileges
-- Run in Supabase SQL Editor
-- ============================================================

grant usage on schema public to anon, authenticated, service_role;
grant select, insert, update, delete on all tables in schema public to service_role;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant select on public.products to anon;
grant select on public.categories to anon;
grant select on public.banners to anon;

-- Clear cart/order line items first (safe if none exist)
delete from public.order_items;

-- Delete every product
delete from public.products;

-- Confirm
select count(*) as products_left from public.products;
