-- Adds Square support to the orders table. Safe to run while Stripe is live: existing rows
-- and the Stripe checkout are untouched. Run the statements ONE AT A TIME in the Supabase SQL editor.

alter table public.orders add column if not exists payment_provider text not null default 'stripe';

alter table public.orders add column if not exists square_payment_id text;

create index if not exists orders_square_payment_id_idx on public.orders (square_payment_id);
