-- HISTORICAL: this is the table as originally created. The live table has since
-- drifted from it -- notably `id` is a uuid, not a bigint identity, and there are
-- now 18 columns (site, terms_*, order_number). Verified against production
-- 2026-09-25. Treat order_number_migration.sql as the authoritative record of the
-- order-number change; check information_schema before trusting anything below.

create table public.orders (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  updated_at timestamptz,
  stripe_payment_intent_id text,
  customer_email text not null,
  shipping_address jsonb,
  items jsonb not null,
  file_key text,
  amount_cents integer not null,
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'printing', 'shipped', 'delivered', 'refunded')),
  paid_at timestamptz,
  tracking_number text
);

alter table public.orders enable row level security;
-- No policies added: only the service_role key (used by the backend) can access this table.
