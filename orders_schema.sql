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
