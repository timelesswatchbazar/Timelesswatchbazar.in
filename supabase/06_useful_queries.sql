-- ============================================================
-- Useful Admin Queries (run anytime in SQL Editor)
-- ============================================================

-- List all products with pricing
-- select id, name, actual_price, sale_price, is_new_arrival, is_best_seller, is_active
-- from public.products order by sort_order, created_at desc;

-- Toggle best seller
-- update public.products set is_best_seller = true where slug = 'aurora-chronograph-black';

-- Toggle new arrival
-- update public.products set is_new_arrival = true where slug = 'luna-pearl-rose-gold';

-- Update pricing (actual = MRP, sale = discounted)
-- update public.products
-- set actual_price = 499, sale_price = 349
-- where slug = 'pulse-pro-smartwatch';

-- Soft-disable a product
-- update public.products set is_active = false where slug = 'leather-strap-set-brown';

-- Export-style customer list
-- select full_name, email, phone, city, country, created_at
-- from public.customers
-- order by created_at desc;

-- Orders with totals
-- select order_number, customer_name, customer_email, status, payment_status, total, created_at
-- from public.orders
-- order by created_at desc;

-- Order details
-- select o.order_number, oi.product_name, oi.quantity, oi.unit_price, oi.line_total
-- from public.order_items oi
-- join public.orders o on o.id = oi.order_id
-- where o.order_number = 'TWB-XXXXXX-XXXXXX';
