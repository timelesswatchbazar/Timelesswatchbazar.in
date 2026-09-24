-- Normalize category slugs (spaces → hyphens) for clean URLs
-- e.g. "pair watches" → "pair-watches"
-- Run in Supabase SQL Editor

update public.categories
set slug = lower(
  regexp_replace(
    regexp_replace(trim(slug), '[^a-zA-Z0-9]+', '-', 'g'),
    '(^-|-$)',
    '',
    'g'
  )
)
where slug ~ '\s' or slug ~ '[^a-z0-9-]';
