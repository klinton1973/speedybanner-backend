-- Queue for FedEx tracking emails that didn't match an order right away.
-- The backend retries these every 15 minutes for up to 7 days and emails
-- one daily summary of anything still unmatched after 3+ hours.
create table public.unmatched_tracking (
  id bigint generated always as identity primary key,
  tracking_number text not null unique,
  recipient_name text,
  recipient_zip text,
  received_at timestamptz not null default now(),
  status text not null default 'pending'
    check (status in ('pending', 'matched', 'expired')),
  notified_at timestamptz,
  resolved_at timestamptz,
  order_id uuid references public.orders(id)
);

alter table public.unmatched_tracking enable row level security;
-- No policies added: only the service_role key (used by the backend) can access this table.
