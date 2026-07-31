-- ============================================================
-- Customer profile auth + table privileges
-- Run in Supabase SQL Editor
-- ============================================================

-- Fix API access (products were failing with permission denied)
grant usage on schema public to anon, authenticated, service_role;
grant select, insert, update, delete on all tables in schema public to service_role;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant select on public.categories to anon;
grant select on public.products to anon;
grant select on public.banners to anon;
grant select, insert on public.customers to anon;
grant select, insert on public.orders to anon;
grant select, insert on public.order_items to anon;

-- Customers can read/update their own profile row
drop policy if exists "Customers read own profile" on public.customers;
create policy "Customers read own profile"
  on public.customers for select
  using (
    public.is_admin()
    or lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );

drop policy if exists "Customers update own profile" on public.customers;
create policy "Customers update own profile"
  on public.customers for update
  using (lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')))
  with check (lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')));

-- Customers can read their own orders
drop policy if exists "Customers read own orders" on public.orders;
create policy "Customers read own orders"
  on public.orders for select
  using (
    public.is_admin()
    or lower(customer_email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );

drop policy if exists "Customers read own order items" on public.order_items;
create policy "Customers read own order items"
  on public.order_items for select
  using (
    public.is_admin()
    or exists (
      select 1
      from public.orders o
      where o.id = order_id
        and lower(o.customer_email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    )
  );
