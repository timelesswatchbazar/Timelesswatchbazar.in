-- ============================================================
-- Timeless Watch Bazar — Storage Buckets
-- Run this SECOND in Supabase SQL Editor
-- ============================================================

-- Product images bucket
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Banner images bucket
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'banner-images',
  'banner-images',
  true,
  8388608,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Public read for both buckets
drop policy if exists "Public read product images" on storage.objects;
create policy "Public read product images"
  on storage.objects for select
  using (bucket_id = 'product-images');

drop policy if exists "Public read banner images" on storage.objects;
create policy "Public read banner images"
  on storage.objects for select
  using (bucket_id = 'banner-images');

-- Admin upload/update/delete (authenticated users in admin_users)
drop policy if exists "Admin write product images" on storage.objects;
create policy "Admin write product images"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'product-images'
    and exists (
      select 1 from public.admin_users a
      where a.user_id = auth.uid() and a.is_active = true
    )
  );

drop policy if exists "Admin update product images" on storage.objects;
create policy "Admin update product images"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'product-images'
    and exists (
      select 1 from public.admin_users a
      where a.user_id = auth.uid() and a.is_active = true
    )
  );

drop policy if exists "Admin delete product images" on storage.objects;
create policy "Admin delete product images"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'product-images'
    and exists (
      select 1 from public.admin_users a
      where a.user_id = auth.uid() and a.is_active = true
    )
  );

drop policy if exists "Admin write banner images" on storage.objects;
create policy "Admin write banner images"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'banner-images'
    and exists (
      select 1 from public.admin_users a
      where a.user_id = auth.uid() and a.is_active = true
    )
  );

drop policy if exists "Admin update banner images" on storage.objects;
create policy "Admin update banner images"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'banner-images'
    and exists (
      select 1 from public.admin_users a
      where a.user_id = auth.uid() and a.is_active = true
    )
  );

drop policy if exists "Admin delete banner images" on storage.objects;
create policy "Admin delete banner images"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'banner-images'
    and exists (
      select 1 from public.admin_users a
      where a.user_id = auth.uid() and a.is_active = true
    )
  );
