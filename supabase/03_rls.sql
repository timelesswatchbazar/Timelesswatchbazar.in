-- ============================================================
-- Timeless Watch Bazar — Row Level Security
-- Run this THIRD in Supabase SQL Editor
-- ============================================================

alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.banners enable row level security;
alter table public.customers enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.admin_users enable row level security;

-- Helper: is current user an active admin?
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = auth.uid()
      and is_active = true
  );
$$;

-- ---------- Public read (storefront) ----------
drop policy if exists "Public read active categories" on public.categories;
create policy "Public read active categories"
  on public.categories for select
  using (is_active = true or public.is_admin());

drop policy if exists "Public read active products" on public.products;
create policy "Public read active products"
  on public.products for select
  using (is_active = true or public.is_admin());

drop policy if exists "Public read active banners" on public.banners;
create policy "Public read active banners"
  on public.banners for select
  using (is_active = true or public.is_admin());

-- Anyone can place an order (insert customer + order + items)
drop policy if exists "Public insert customers" on public.customers;
create policy "Public insert customers"
  on public.customers for insert
  with check (true);

drop policy if exists "Public insert orders" on public.orders;
create policy "Public insert orders"
  on public.orders for insert
  with check (true);

drop policy if exists "Public insert order items" on public.order_items;
create policy "Public insert order items"
  on public.order_items for insert
  with check (true);

-- ---------- Admin full access ----------
drop policy if exists "Admin all categories" on public.categories;
create policy "Admin all categories"
  on public.categories for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admin all products" on public.products;
create policy "Admin all products"
  on public.products for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admin all banners" on public.banners;
create policy "Admin all banners"
  on public.banners for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admin all customers" on public.customers;
create policy "Admin all customers"
  on public.customers for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admin all orders" on public.orders;
create policy "Admin all orders"
  on public.orders for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admin all order items" on public.order_items;
create policy "Admin all order items"
  on public.order_items for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admin read admin_users" on public.admin_users;
create policy "Admin read admin_users"
  on public.admin_users for select
  using (public.is_admin() or user_id = auth.uid());
