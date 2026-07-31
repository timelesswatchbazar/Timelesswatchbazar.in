-- ============================================================
-- Fix admin_users privileges + link Hussain Nalwala
-- Run in Supabase SQL Editor if admin login shows unauthorized
-- ============================================================

grant usage on schema public to postgres, anon, authenticated, service_role;
grant all on table public.admin_users to postgres, service_role;
grant select on table public.admin_users to authenticated;

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

select * from public.admin_users;
