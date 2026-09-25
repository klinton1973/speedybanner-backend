-- Adds a human-readable, sequential order number.  Applied to production 2026-09-25.
--
-- Only orders that were actually paid get a number, so the highest number always
-- equals the true lifetime order count. Abandoned checkouts (a Stripe intent with
-- no paid_at) stay null and never consume a number.
--
-- One shared counter across all sites. Numbering starts at 1001; the 88 orders
-- that existed at migration time were backfilled as 1001-1088.
--
-- NOTE: run the statements below ONE AT A TIME in the Supabase SQL editor. Pasting
-- them as one script silently drops the dollar-quoted function body -- the editor
-- reports success and creates nothing.

alter table public.orders add column if not exists order_number integer;

create sequence if not exists public.order_number_seq as integer start with 1001;

-- Backfill every already-paid order in the order it was actually paid.
with ordered as (
  select id, row_number() over (order by paid_at, created_at) as rn
  from public.orders
  where paid_at is not null and order_number is null
)
update public.orders o
   set order_number = 1000 + ordered.rn
  from ordered
 where o.id = ordered.id;

-- Park the sequence just past the backfill so live orders continue the run.
select setval('public.order_number_seq', (select coalesce(max(order_number), 1000) from public.orders));

create unique index if not exists orders_order_number_key on public.orders (order_number);

-- Assign the number in the database, not the app: this fires however an order gets
-- paid (Stripe webhook, $0 coupon insert, or a manual status change in the
-- dashboard) and cannot hand the same number to two concurrent orders.
create or replace function public.assign_order_number()
returns trigger
language plpgsql
as $function$
begin
  if new.paid_at is not null and new.order_number is null then
    new.order_number := nextval('public.order_number_seq');
  end if;
  return new;
end;
$function$;

create trigger orders_assign_order_number
before insert or update on public.orders
for each row execute function public.assign_order_number();
