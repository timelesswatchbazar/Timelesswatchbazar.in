-- ============================================================
-- Timeless Watch Bazar — Supabase Schema
-- Run this FIRST in Supabase SQL Editor
-- ============================================================

-- Extensions
create extension if not exists "pgcrypto";

-- ---------- Categories ----------
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text not null default '',
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- Products ----------
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories (id) on delete set null,
  name text not null,
  slug text not null unique,
  description text not null default '',
  image_url text not null default '',
  gallery jsonb not null default '[]'::jsonb,
  -- Pricing
  actual_price numeric(12, 2) not null check (actual_price >= 0),
  sale_price numeric(12, 2) not null check (sale_price >= 0),
  -- Inventory & flags
  stock integer not null default 0 check (stock >= 0),
  is_new_arrival boolean not null default false,
  is_best_seller boolean not null default false,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint sale_lte_actual check (sale_price <= actual_price)
);

create index if not exists products_category_id_idx on public.products (category_id);
create index if not exists products_is_active_idx on public.products (is_active);
create index if not exists products_is_new_arrival_idx on public.products (is_new_arrival);
create index if not exists products_is_best_seller_idx on public.products (is_best_seller);
create index if not exists products_slug_idx on public.products (slug);

-- ---------- Banners ----------
create table if not exists public.banners (
  id uuid primary key default gen_random_uuid(),
  title text not null default '',
  subtitle text not null default '',
  image_url text not null,
  link_url text not null default '/',
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists banners_is_active_sort_idx
  on public.banners (is_active, sort_order);

-- ---------- Customers ----------
create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text not null default '',
  address text not null default '',
  city text not null default '',
  country text not null default 'United Arab Emirates',
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists customers_email_unique_idx
  on public.customers (lower(email));
create index if not exists customers_phone_idx on public.customers (phone);

-- ---------- Orders ----------
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  customer_id uuid references public.customers (id) on delete set null,
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null default '',
  shipping_address text not null default '',
  city text not null default '',
  country text not null default 'United Arab Emirates',
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
  payment_status text not null default 'unpaid'
    check (payment_status in ('unpaid', 'paid', 'refunded', 'cod')),
  subtotal numeric(12, 2) not null default 0 check (subtotal >= 0),
  discount numeric(12, 2) not null default 0 check (discount >= 0),
  shipping_fee numeric(12, 2) not null default 0 check (shipping_fee >= 0),
  total numeric(12, 2) not null default 0 check (total >= 0),
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_status_idx on public.orders (status);
create index if not exists orders_customer_email_idx on public.orders (lower(customer_email));
create index if not exists orders_created_at_idx on public.orders (created_at desc);

-- ---------- Order Items ----------
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid references public.products (id) on delete set null,
  product_name text not null,
  product_slug text not null default '',
  image_url text not null default '',
  unit_price numeric(12, 2) not null check (unit_price >= 0),
  quantity integer not null check (quantity > 0),
  line_total numeric(12, 2) not null check (line_total >= 0),
  created_at timestamptz not null default now()
);

create index if not exists order_items_order_id_idx on public.order_items (order_id);

-- ---------- Admin profiles (linked to auth.users) ----------
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text not null default '',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------- updated_at trigger ----------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists categories_set_updated_at on public.categories;
create trigger categories_set_updated_at
  before update on public.categories
  for each row execute function public.set_updated_at();

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

drop trigger if exists banners_set_updated_at on public.banners;
create trigger banners_set_updated_at
  before update on public.banners
  for each row execute function public.set_updated_at();

drop trigger if exists customers_set_updated_at on public.customers;
create trigger customers_set_updated_at
  before update on public.customers
  for each row execute function public.set_updated_at();

drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

-- ---------- Order number generator ----------
create or replace function public.generate_order_number()
returns trigger
language plpgsql
as $$
begin
  if new.order_number is null or new.order_number = '' then
    new.order_number := 'TWB-' || to_char(now(), 'YYMMDD') || '-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));
  end if;
  return new;
end;
$$;

drop trigger if exists orders_generate_number on public.orders;
create trigger orders_generate_number
  before insert on public.orders
  for each row execute function public.generate_order_number();

-- ---------- Table privileges (required for API / service role) ----------
grant usage on schema public to anon, authenticated, service_role;

grant select, insert, update, delete on all tables in schema public to service_role;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant select, insert on public.customers to anon;
grant select, insert on public.orders to anon;
grant select, insert on public.order_items to anon;
grant select on public.categories to anon;
grant select on public.products to anon;
grant select on public.banners to anon;
