# Test evidence (Phase B, BNB MARCO Pay P0)

Base: `origin/main` `b8f223f4d`. Branch `p0-marco-pay-bnb-checkout`. Node 20 was used for vitest; under Node 26, jsdom
`localStorage` fails on baseline too. No real payment, approval, signature or transaction was made.

## Unit / component

| Suite | Result |
| --- | --- |
| `lib/marco-pay/__tests__/preparedCheckout.test.ts` (4 new wallet-error tests) | 9/9 PASS |
| `views/shared/monetization/__tests__/marcoPayBnbP0Checkout.test.tsx` (new) | 7/7 PASS |
| `yarn test:certification` | 29 files / 276 tests PASS |
| Gate suites (boost claim authority, boost/listed token detection, checkout target binding + UI, paid trend boost ticker merge, trend boost activation guard, global liquidity, all marco-pay suites) | PASS |
| `lib/marco-pay` + `views/shared/monetization` dirs | 117 PASS / 4 baseline failures |

The new P0 suite covers these cases: no wallet shows Connect Wallet with no outage text and no order created. Connecting after review
creates exactly one order that carries the referral (buyer, `trend-boost`, `trend_6h`, lowercase contract, ref `2mjywytuw5`, destination
`melega-dex`). With no referral, `referralCode` is null. Insufficient MARCO uses the real production ethers error and shows clear copy;
the wallet receives the exact production calldata. A 4001 rejection shows the cancelled state, and a retry creates no second order.
On wrong chain 8453 no transfer is sent. Success appears only at `ACTIVE`, after `ONCHAIN_PENDING`/`PAYMENT_CONFIRMED`.

Baseline failures, identical on `origin/main` (checked with stash). None were weakened:
`marcoPayWalletChain.test.tsx` (3), `listedTokenIdentity.test.ts` (1),
`liquidity-module-005-market-snapshot.test.ts` (2: missing `docs/runtime/LIQUIDITY_MODULE_OWNERSHIP_MAP.md` / hash).

## Static / build

- Typecheck: `tsc --noEmit -p apps/web/tsconfig.json` exit 0. The repo has no `yarn typecheck` script.
- Production build: `yarn build` in `apps/web` (with prebuild) exit 0.
- `git diff --check`: clean.

## Browser (read-only harness: injected EIP-1193 wallet that rejects every signing method with 4001)

| Run | Target | Result |
| --- | --- | --- |
| old_d92aa47 desktop, no wallet, click | pre-#131 prod deployment | reproduced "MARCO Pay is temporarily unavailable." |
| prod desktop/mobile with referral | `b8f223f` prod | readiness OK; order created with referral −$2.90; PAY returned a raw ethers insufficient-balance error |
| prod desktop, no wallet | `b8f223f` prod | "Connect wallet" error and no Connect button in the footer (dead end) |
| local desktop/mobile, no wallet | this branch (`next start`, fixture readiness/orders) | footer Connect Wallet |
| local desktop/mobile, wallet | this branch | PAY WITH MARCO, then "This wallet does not hold enough MARCO on BNB Smart Chain…"; signing requests: none |
| Boost service modal layout (`verify-boost-service-modal-layout`) | this branch | PASS at 1440x900, 1280x800, 390x844, 430x932 |

## BSC fork (anvil, chain 56, block ~126600281)

MARCO has decimals 18. A transfer from the observation wallet reverts with "transfer amount exceeds balance". The exact production
calldata (104697.35 MARCO to Treasury), sent from an impersonated holder on the fork only, gave status 1 and gasUsed 35468. The Transfer
event and the Treasury balance delta match the order amount.

## Production side effects of the probes

The probes created unpaid orders in `AWAITING_WALLET`. No payment was made and each order will expire:
`mp_a748f43b6f304c1ef1184f53`, `mp_06fae7e086ab8b12535f7bd8`, `mp_8e5f927d239c86cf692a2467` (current prod) and
`mp_9ff6e0f474ca5e42c0a99b9c`, `mp_dabfdc4d94ef6e0f2ca73243` (pre-#131 deployment).

Artifacts (logs, screenshots, receipts) are on the executor box under `/workspace/marcopay/`.
