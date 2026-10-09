# Referral reconciliation (Passport PRO, MARCO Pay path)

Trace for `?ref=2mjywytuw5&rd=melega-dex`, observed on production `b8f223f4d` (2026-10-09, read-only harness) and in repo code.

| Step | Where | Evidence |
| --- | --- | --- |
| Landing | MARCO Connect SDK + `lib/marco-referral/client` | `GET marco.melega.ai/api/public/referral/resolve?code=2mjywytuw5` → 200 `ok: true`; localStorage `marco.passport-pro.referral.v1` = `{code:"2mjywytuw5", status:"VERIFIED", destinationRef:"melega-dex", campaignRef:null, expiresAt: +30 days}` |
| Project selection | `CommercialCheckoutModal` | referral is not bound to the project; target is `chainId:tokenAddress` (client `targetKey`) |
| Checkout / payment method | `resolveMarcoReferralForCheckout` | referral only used when `pay === 'MARCO_PAY'` and the package is in the Passport PRO catalogue (`dexReferralCatalogRef`) |
| Chain | payment chain fixed to 56 | — |
| Order | `POST /api/marco-pay/orders` | body carries `referralCode`, `referralDestination`, `referralCampaign`; server re-verifies with `quoteMarcoReferralForCheckout` and refuses with `422 REFERRAL_NOT_VERIFIED` (message present since #131). Production 201: `referenceAmountMinor 2610`, `referralApplied true`, discount `290` minor (−$2.90) |
| Persistence | `MarcoPayOrder` | `referralCode`, `referralCatalogRef`, `referralDiscountMinor`, `referralDestinationRef`, `referralCampaignRef` |
| Settlement | MARCO session body | `referral_code`, `catalog_ref`, `destination_ref`, `campaign_ref`; commission is computed by MARCO (readiness `partnerBps: 100`) |
| Activation | `fulfilPaidBoostOrder` | independent of referral; only after receipt + `PAYMENT_CONFIRMED` |

Cases (tests in `marcoPayReferralCheckout.test.tsx`, `marcoPayBnbP0Checkout.test.tsx`, `orders.test.ts`, `preparedCheckout.test.ts`):
valid referral ✓, invalid/unverified (422 message, not an outage) ✓, none (`referralCode: null`, listed price) ✓, reload (localStorage, 30-day
expiry) ✓ by storage design, wallet switch (new quote) ✓, chain switch (new quote) ✓, retry after rejection (no second order) ✓, expired quote
(10-min TTL → new quote) ✓, duplicate callback (`claimOnce('event')`, `claimOnce('payment')`) ✓ in `orders.test.ts`.

Commission: the DEX keeps no commission ledger; duplicate commission / commission on unverified payment can only be prevented on the MARCO side
(event/payment idempotency there is not visible from this repo). DEX-side: an order without verified receipt never reaches `ACTIVE`.

Gaps (reported, not changed): referral is dropped for BNB/USDT/USDC direct payments, M-Credits and the List workspace checkouts; the order does
not persist the target chain id (only `projectContract`).

REFERRAL_ATTRIBUTION on the DEX side: PASS for the MARCO Pay path up to order creation (observed in production). Settlement-side attribution: pending
(no real payment).
