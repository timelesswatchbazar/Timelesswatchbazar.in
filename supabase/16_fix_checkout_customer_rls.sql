-- ============================================================
-- Fix checkout RLS for customers / orders (optional safety net)
-- Checkout in the app now uses the service role for writes.
-- Run this only if you still want anon INSERT policies present.
-- ============================================================

grant select, insert on public.customers to anon, authenticated;
grant select, insert on public.orders to anon, authenticated;
grant select, insert on public.order_items to anon, authenticated;

drop policy if exists "Public insert customers" on public.customers;
create policy "Public insert customers"
  on public.customers for insert
  to anon, authenticated
  with check (true);

drop policy if exists "Public insert orders" on public.orders;
create policy "Public insert orders"
  on public.orders for insert
  to anon, authenticated
  with check (true);

drop policy if exists "Public insert order items" on public.order_items;
create policy "Public insert order items"
  on public.order_items for insert
  to anon, authenticated
  with check (true);
