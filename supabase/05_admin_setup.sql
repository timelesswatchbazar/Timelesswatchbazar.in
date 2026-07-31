-- ============================================================
-- Timeless Watch Bazar — Create Admin User
-- Run this FIFTH (after creating the Auth user in Dashboard)
-- ============================================================
--
-- Admin panel login (what you type on /admin/login):
--   Username: Hussain Nalwala
--   Password: Huss@in786
--
-- Supabase Auth still needs an email behind the scenes:
--   Email: hussainnalwala@timelesswatchbazar.com
--
-- Steps:
-- 1. In Supabase Dashboard → Authentication → Users → Add user
--    Email: hussainnalwala@timelesswatchbazar.com
--    Password: Huss@in786
--    Auto Confirm User: ON
--
-- 2. Run this query to link the Auth user as admin:
--

insert into public.admin_users (user_id, email, full_name, is_active)
select
  u.id,
  u.email,
  'Hussain Nalwala',
  true
from auth.users u
where lower(u.email) = lower('hussainnalwala@timelesswatchbazar.com')
on conflict (user_id) do update
  set email = excluded.email,
      full_name = excluded.full_name,
      is_active = true;

-- Verify admin was linked:
-- select * from public.admin_users;
