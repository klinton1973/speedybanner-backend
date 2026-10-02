-- Abandoned-checkout reminder bookkeeping (routes/abandoned.js).
-- Run once in the Supabase SQL editor for project speedybanner.
alter table public.orders add column if not exists abandoned_email_sent_at timestamptz;
alter table public.orders add column if not exists abandoned_email_status text;
create index if not exists orders_abandoned_pending_idx
  on public.orders (created_at)
  where paid_at is null and abandoned_email_sent_at is null;
