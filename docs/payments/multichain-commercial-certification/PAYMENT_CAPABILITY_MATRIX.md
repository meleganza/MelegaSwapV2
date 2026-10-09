# Payment capability matrix (repo truth, Phase A)

Source: `origin/main` `b8f223f4d` plus this branch. Statuses: READY / PARTIAL / BLOCKED / UNSUPPORTED / HIDDEN.
"MARCO Pay" = canonical path `CommercialCheckoutModal` → `POST /api/marco-pay/orders` → MARCO session → ERC-20 transfer of MARCO
(`0x963556De…210b`, chain 56) to `MELEGA_TREASURY_WALLET` `0xb6436EF4…F65b` → signed `payment.completed` webhook / reconcile → activation.

## Commercial checkouts exposed

| Service | Entry points | Payment code path(s) | Canonical MARCO Pay? | Runtime |
| --- | --- | --- | --- | --- |
| Boost Your Project (launcher) | `GlobalTrendingBar` → `BoostProjectLauncher` | `CommercialCheckoutModal` | yes for MARCO Pay; also BNB/USDT/USDC direct (`/api/featured/orders`, `/api/trend-boost/orders`) and M-Credits (`/api/mcredits/orders`) | live |
| Trend Boost | Boost modal, Project Page V7, List workspace | modal: MARCO Pay + direct + M-Credits; List: `ListTrendBoostCheckout` direct only | modal yes / List no | `VISIBILITY_RUNTIME['trend-boost'].live = true` |
| Featured Project (Home) | Boost modal, Project Page V7, List workspace | modal: MARCO Pay + direct + M-Credits; List: `ListFeaturedCheckout` direct only | modal yes / List no | `featured.live = true` |
| Sponsored Search (Featured Research) | Boost modal | MARCO Pay path exists | yes | `live: false` (awaiting activation) |
| Featured Farm / Featured Pool | Boost modal | MARCO Pay path exists | yes | `live: false` |
| Create Token | Build Studio | factory constructor fee 0.10 BNB → Treasury (`fee-schedule.json createToken`) | no (on-chain factory fee) | `createTokenExecution: true` |
| Create Farm | Farms Studio, Public Farm Factory | factory fee 0.25 BNB or FREE when pair contains MARCO; MARCO reward rejected | no (on-chain factory fee) | live |
| Create Pool | `CreatePoolCta` | factory fee rules in `fee-schedule.json createPool` | no | **HIDDEN** (component not mounted anywhere; left hidden) |
| Listing / Claim project | List workspace | `ListFeaturedCheckout`, `ListTrendBoostCheckout` (direct BNB/USDT/USDC/MARCO transfer + receipt verification) | **no** | live |

Finding: Featured/Trend Boost bought from the List workspace do not use the canonical MARCO Pay path, and referral attribution only exists on
the MARCO Pay path. Not changed in Phase B (scope: BNB P0 only).

## Service × chain (MARCO Pay settlement)

| Service | BNB 56 | Solana | Base 8453 | Polygon 137 | Arc 5042 | Robinhood 4663 |
| --- | --- | --- | --- | --- | --- | --- |
| Boost / Trend Boost | PARTIAL | BLOCKED | BLOCKED | BLOCKED | BLOCKED | BLOCKED |
| Featured Project | PARTIAL | BLOCKED | BLOCKED | BLOCKED | BLOCKED | BLOCKED |
| Sponsored Search | BLOCKED (service not live) | BLOCKED | BLOCKED | BLOCKED | BLOCKED | BLOCKED |
| Featured Farm / Pool | BLOCKED (service not live) | BLOCKED | BLOCKED | BLOCKED | BLOCKED | BLOCKED |
| Create Token | UNSUPPORTED via MARCO Pay (BNB factory fee) | UNSUPPORTED | UNSUPPORTED | UNSUPPORTED | UNSUPPORTED | UNSUPPORTED |
| Create Farm | UNSUPPORTED via MARCO Pay (BNB factory fee) | UNSUPPORTED | UNSUPPORTED | UNSUPPORTED | UNSUPPORTED | UNSUPPORTED |
| Create Pool | HIDDEN | HIDDEN | HIDDEN | HIDDEN | HIDDEN | HIDDEN |

BNB is PARTIAL, not READY: order + payment preparation verified in production and on a BSC fork, but settlement is verified by MARCO
(webhook/state), the DEX never receives the submitted tx hash, `/api/marco-pay/reconcile` has no Vercel cron, and no real end-to-end
settlement could be observed under this mission's rules. Every other chain is hard-blocked by `MARCO_PAY_CHAIN_ID = 56` /
`CHAIN_MISMATCH` guards and has no payment adapter or settlement verifier. Phase C (multichain adapters) is pending the Founder.
