-- ============================================================
-- Switch store location defaults to India (Ujjain)
-- Run in Supabase SQL Editor
-- ============================================================

alter table public.customers
  alter column country set default 'India';

alter table public.orders
  alter column country set default 'India';

update public.customers
set country = 'India'
where country ilike '%arab%' or country ilike '%emirates%' or country = '';

update public.orders
set country = 'India'
where country ilike '%arab%' or country ilike '%emirates%' or country = '';
