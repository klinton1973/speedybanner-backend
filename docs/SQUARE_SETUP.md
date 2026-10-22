# Square payments — setup and test guide

Everything here is **inert until the Square variables exist on Railway**. Live Stripe checkout
keeps working exactly as before. Do these steps in order; stop after any step and nothing is live.

## 1. Square account (free)
1. Create a Square developer account at developer.squareup.com and make an **Application**.
2. In the app's **Credentials** page, with the **Sandbox** toggle on, copy:
   - Sandbox **Application ID**
   - Sandbox **Access token**
3. Under **Locations**, copy the Sandbox **Location ID**.

## 2. Database (Supabase SQL editor — one statement at a time)
Run `square_migration.sql`. It only adds columns; existing orders and Stripe checkout are unaffected.
Do this on a **test Supabase project** if you can. If you test against the real one, the sandbox
orders land in your real `orders` table (delete them afterwards; they are named "TEST 4x2 Vinyl Banner").

## 3. Environment variables
| Variable | Value |
|---|---|
| `SQUARE_ACCESS_TOKEN` | sandbox access token (secret) |
| `SQUARE_LOCATION_ID` | sandbox location id |
| `SQUARE_APPLICATION_ID` | sandbox application id (public) |
| `SQUARE_ENV` | `sandbox` (use `production` only at cutover) |
| `SQUARE_WEBHOOK_SIGNATURE_KEY` | from the Square webhook subscription |
| `SQUARE_WEBHOOK_URL` | the exact webhook URL you give Square, e.g. `https://<railway-domain>/webhook/square` |
| `PAYMENT_PROVIDER` | leave unset (= `stripe`). Set to `square` at cutover. |

## 4. Try it without touching the live sites
On your own computer: copy `.env.example`-style values into a local `.env` (the same variables the
server already uses, plus the ones above, plus `ALLOW_LOCAL_TEST=1` and `PORT=3000`), run
`npm install` and `npm start`, then open `http://localhost:3000/square-test`.
Pay with test card `4111 1111 1111 1111`, any future expiry, any CVV/ZIP.
Other sandbox test cards (declines, bad CVV) are listed in Square's testing docs.

Automated checks (no network, no keys needed): `npm test`.

## 5. Webhook (needed for dispute alerts and the safety net)
In the Square dashboard → Webhooks → add subscription to `SQUARE_WEBHOOK_URL`, events
`payment.updated` and `dispute.created`. Copy its signature key into `SQUARE_WEBHOOK_SIGNATURE_KEY`.

## 6. Cutover (when you decide to go live)
1. Switch the four sandbox values to **production** values and set `SQUARE_ENV=production`.
2. Update the storefront checkout (see below) on ONE small site first and place a real $1-type order.
3. Set `PAYMENT_PROVIDER=square` once the pages read `/checkout/config`.
Rollback = set `PAYMENT_PROVIDER` back to `stripe`. Stripe code and keys are untouched throughout.

## Storefront changes still needed (not part of this branch)
The pages currently call `/checkout/create-payment-intent` and use Stripe Elements. For Square they must:
1. `GET /checkout/config`; if `provider === 'square'`, load `https://web.squarecdn.com/v1/square.js`
   (sandbox: `https://sandbox.web.squarecdn.com/v1/square.js`).
2. Mount `Square.payments(applicationId, locationId).card()` in place of the Stripe card field.
3. On submit: `card.tokenize()` → POST the token as `sourceId` to `/checkout/square-pay` with the same
   body as today (`items, customerEmail, shippingAddress, fileKey, discountCents, termsAccepted, termsVersion`).
4. On `{ success: true }` show the success screen. On HTTP 402 show `error` under the card field.
`test/square-sandbox.html` is a working minimal example of exactly this.
Apple Pay / Google Pay / Cash App Pay use Square's own buttons (`payments.applePay()` etc.);
Stripe's Link button has no Square equivalent.

## Known differences from Stripe
- Customers who saved a card on Stripe must re-enter it once; cards cannot be moved between processors by this code.
- Square gives about **7 days** to answer a dispute (the webhook emails you immediately).
- The saved-cards lookup is by email only, same as the existing Stripe route.
- Failed/declined Square attempts leave a `pending` order, so the abandoned-checkout reminder treats them like any other abandoned checkout.
