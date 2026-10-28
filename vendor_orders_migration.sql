-- Signs365 (the print vendor) emails a receipt at order time with the ship-to address and,
-- later, a "has Shipped" email with only the order number + tracking number. The backend keeps
-- the receipts here so the shipped email can be matched to a customer order (routes/tracking.js).
create table if not exists public.vendor_orders (
  vendor_order text primary key,
  recipient_name text,
  recipient_street text,
  recipient_zip text,
  received_at timestamptz not null default now()
);
alter table public.vendor_orders enable row level security;
-- Queued shipments remember which vendor order they belong to, so a receipt that arrives late can still resolve them.
alter table public.unmatched_tracking add column if not exists vendor_order text;
alter table public.unmatched_tracking add column if not exists recipient_street text;
