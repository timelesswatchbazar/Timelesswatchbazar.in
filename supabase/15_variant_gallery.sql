-- ============================================================
-- Multiple images per product variation
-- Run in Supabase SQL Editor
-- ============================================================

alter table public.product_variants
  add column if not exists gallery jsonb not null default '[]'::jsonb;

comment on column public.product_variants.image_url is
  'Primary image for this variation (used in selectors, cart, listings).';

comment on column public.product_variants.gallery is
  'Ordered list of additional images for this variation. Primary is image_url.';

-- Backfill: if gallery empty but image_url set, leave gallery empty
-- (primary alone is enough; app merges image_url + gallery into images[])
