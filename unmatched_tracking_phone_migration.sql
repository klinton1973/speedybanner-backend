-- Phone-number fallback for FedEx tracking matching (routes/tracking.js).
-- Queued shipments keep the recipient phone so the 15-minute retry can use it too.
alter table public.unmatched_tracking add column if not exists recipient_phone text;
