-- ============================================================
-- Timeless Watch Bazar — Seed Data (optional)
-- Run this FOURTH after schema + storage + RLS
-- ============================================================

insert into public.categories (name, slug, description, sort_order) values
  ('Men''s Watches', 'mens-watches', 'Classic and contemporary timepieces for men.', 1),
  ('Women''s Watches', 'womens-watches', 'Elegant watches designed for every occasion.', 2),
  ('Smart Watches', 'smart-watches', 'Connected wearables for modern living.', 3),
  ('Luxury Collection', 'luxury-collection', 'Premium watches with refined craftsmanship.', 4),
  ('Sports & Dive', 'sports-dive', 'Durable watches built for active lifestyles.', 5),
  ('Accessories', 'accessories', 'Straps, cases, and watch care essentials.', 6)
on conflict (slug) do nothing;

-- Sample products (uses Unsplash URLs — replace with uploaded Storage URLs later)
insert into public.products (
  category_id, name, slug, description, image_url,
  actual_price, sale_price, stock, is_new_arrival, is_best_seller, is_active, sort_order
)
select
  c.id,
  v.name,
  v.slug,
  v.description,
  v.image_url,
  v.actual_price,
  v.sale_price,
  v.stock,
  v.is_new_arrival,
  v.is_best_seller,
  true,
  v.sort_order
from (
  values
    ('mens-watches', 'Aurora Chronograph Black', 'aurora-chronograph-black',
      'A sleek black chronograph with stainless steel case.',
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
      399::numeric, 299::numeric, 25, true, true, 1),
    ('womens-watches', 'Luna Pearl Rose Gold', 'luna-pearl-rose-gold',
      'Rose gold-toned case with a pearl-effect dial.',
      'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&w=800&q=80',
      449::numeric, 349::numeric, 18, true, false, 2),
    ('smart-watches', 'Pulse Pro Smartwatch', 'pulse-pro-smartwatch',
      'Fitness tracking with AMOLED display.',
      'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=800&q=80',
      549::numeric, 449::numeric, 30, true, true, 3),
    ('luxury-collection', 'Heritage Automatic Silver', 'heritage-automatic-silver',
      'Automatic movement with sapphire crystal.',
      'https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?auto=format&fit=crop&w=800&q=80',
      1199::numeric, 899::numeric, 8, true, true, 4),
    ('sports-dive', 'Tide Diver Blue', 'tide-diver-blue',
      'Dive watch with 200m water resistance.',
      'https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&w=800&q=80',
      459::numeric, 379::numeric, 14, false, true, 5),
    ('accessories', 'Leather Strap Set Brown', 'leather-strap-set-brown',
      'Premium brown leather quick-release straps.',
      'https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=800&q=80',
      99::numeric, 79::numeric, 40, false, false, 6)
) as v(category_slug, name, slug, description, image_url, actual_price, sale_price, stock, is_new_arrival, is_best_seller, sort_order)
join public.categories c on c.slug = v.category_slug
on conflict (slug) do nothing;

insert into public.banners (title, subtitle, image_url, link_url, sort_order, is_active) values
  (
    'Discover Watches That Define Your Style',
    'Curated men''s, women''s, luxury, and smart watches.',
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1920&q=80',
    '/products',
    1,
    true
  ),
  (
    'Luxury Timepieces',
    'Premium craftsmanship at amazing prices.',
    'https://images.unsplash.com/photo-1612817159949-195b6eb9e31a?auto=format&fit=crop&w=1920&q=80',
    '/categories/luxury-collection',
    2,
    true
  ),
  (
    'New Arrivals This Week',
    'Fresh styles just landed.',
    'https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=1920&q=80',
    '/products',
    3,
    true
  );
