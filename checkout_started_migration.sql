-- Checkout-started tracking (routes/started.js).
-- Run once in the Supabase SQL editor for project speedybanner.

-- Anonymous funnel events: one row each time a checkout form is opened ('opened') and each time
-- a new started-checkout row is saved ('email_entered'). No customer details.
create table if not exists public.checkout_events (
  id bigint generated always as identity primary key,
  site text not null,
  event text not null,
  amount_cents integer,
  created_at timestamptz not null default now()
);
create index if not exists checkout_events_created_idx on public.checkout_events (created_at);
alter table public.checkout_events enable row level security;

-- Weekly numbers per site:
--   select e.site,
--          count(*) filter (where e.event = 'opened')        as opened,
--          count(*) filter (where e.event = 'email_entered') as email_entered
--   from checkout_events e where e.created_at >= now() - interval '7 days' group by 1;
--   select site, count(*) filter (where paid_at is not null) as paid,
--          count(*) filter (where abandoned_email_status = 'sent') as reminders_sent
--   from orders where created_at >= now() - interval '7 days' group by 1;
