-- ============================================================
-- Remove COD payment status everywhere
-- Run in Supabase SQL Editor
-- ============================================================

-- Convert any existing COD orders to unpaid
update public.orders
set payment_status = 'unpaid'
where payment_status = 'cod';

-- Drop and recreate check constraint without 'cod'
alter table public.orders
  drop constraint if exists orders_payment_status_check;

alter table public.orders
  add constraint orders_payment_status_check
  check (payment_status in ('unpaid', 'paid', 'refunded'));
