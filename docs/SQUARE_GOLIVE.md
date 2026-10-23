# Square go-live checklist (nothing here is done yet)

Status: sandbox verified end to end (approved payment, declined card, terms checkbox, order flow). Stripe stays the live processor until step 6.

## Files ready
- `storefront-square-live/app.js` = the current live `app.js` plus the Square card form. It asks `/checkout/config` which processor to use and falls back to Stripe, so it is safe to publish BEFORE the switch (shoppers keep seeing Stripe). Regenerate from the latest live app.js with `storefront-square-test/patch.py` if the live file changes first.
- Backend: branch `square-payments` (inert until SQUARE_* vars are set; `PAYMENT_PROVIDER` defaults to stripe). DB migration `square_migration.sql` already run on production.

## Steps (in order, each reversible)
1. Merge `square-payments` into `main`; Railway deploys. Behaviour unchanged (Stripe).
2. Square dashboard, PRODUCTION: create/open the application, note Application ID, Production Access Token, and the Location ID of the "Speedy Banner" location (not "Klinton Barnhill").
3. Railway variables: `SQUARE_ACCESS_TOKEN`, `SQUARE_APPLICATION_ID`, `SQUARE_LOCATION_ID`, `SQUARE_ENV=production`, `NOTIFY_EMAIL` (if not set). Leave `PAYMENT_PROVIDER` unset/`stripe`.
4. Square webhooks: subscribe `payment.updated` and `dispute.created` to `https://<railway-domain>/webhook/square`; set `SQUARE_WEBHOOK_SIGNATURE_KEY` and `SQUARE_WEBHOOK_URL` (exact URL) on Railway.
4b. Wallets (Square): in the Square dashboard register each pilot domain for Apple Pay and upload the verification file to `/.well-known/apple-developer-merchantid-domain-association` on that site; enable Google Pay and Cash App Pay on the production account. Stripe stays only for Link (`storefront-square-live/app.js` turns every other Stripe wallet off).
5. Publish `storefront-square-live/app.js` as the live `app.js` on ONE pilot site (bump the `?v=` hash in index.html). Still Stripe for shoppers. Check `/checkout/config` returns provider stripe plus square block.
6. Pilot: set `PAYMENT_PROVIDER=square`. Place one real small order on the pilot site with your own card; confirm order row, emails, Square receipt, webhook delivery; refund it in Square.
7. Roll to other sites (each site needs the same app.js change and its origin in `sites.js`).

## Rollback
Set `PAYMENT_PROVIDER=stripe` on Railway. Takes effect on next page load, no redeploy of the pages.

## Known gaps
- Apple Pay / Cash App Pay / Link could not be tested in the sandbox on localhost; they get their first real test on the pilot site over HTTPS.
- Webhook-driven order finalization is only tested with the Square payment response, not live webhook delivery.
- Make the GitHub repo private and replace the sandbox token that appeared in chat.
