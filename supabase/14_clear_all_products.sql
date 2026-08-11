-- ============================================================
-- Delete ALL products (variants cascade automatically)
-- Run in Supabase SQL Editor if you prefer not to use the script
-- ============================================================

-- Optional: also clear banners? leave commented
-- delete from public.banners;

delete from public.product_variants;
delete from public.products;
