# BNB MARCO Pay P0 — root cause

Mission: MELEGA-DEX-P0-MULTICHAIN-COMMERCIAL-PAYMENTS-CERTIFICATION · Phase A/B · 2026-10-09 (Europe/Rome)

## Reported symptom

Boost Your Project → TRUMPET (`56:0x5844cbFaD5702fF56A489C99dD791D748dE39E5D`) → Trend Boost 6 hours ($29) → MARCO Pay on BNB,
landing `?ref=2mjywytuw5&rd=melega-dex`. Review shows **"MARCO Pay is temporarily unavailable."**

## Reproduction (read-only harness, signing methods rejected, no transaction sent)

| Deployment | Commit | Wallet state | Result after **Review and pay** |
| --- | --- | --- | --- |
| `melega-swap-v2-9xu3slre4…vercel.app` (Production deployment of 2026-10-08 08:20 Rome) | `d92aa4703` | no EVM account connected | **"MARCO Pay is temporarily unavailable."** (reproduced) |
| `www.melega.finance` (Production deployment of 2026-10-08 12:46 Rome) | `b8f223f4d` | no EVM account connected | "Connect wallet" text, no order created |
| `www.melega.finance` | `b8f223f4d` | observation account on chain 56 | order created, `PAY WITH MARCO`, referral −$2.90 applied |
| `www.melega.finance` | `b8f223f4d` | observation account, PAY clicked | raw ethers `UNPREDICTABLE_GAS_LIMIT … ERC20: transfer amount exceeds balance` |

Desktop 1440×900 and mobile 390×844 both checked on production with the referral URL. Artifacts: `/workspace/marcopay/` on the agent box
(`logs/*.jsonl` network logs, `shots/*.png`, `readiness_prod.json`, `readiness_samples.txt`, `public_quote_prod.txt`).

## First divergence

Checkout ✓ → MARCO Pay availability ✓ (`GET /api/marco-pay/readiness` 200 `executable: true`, 12/12 samples) →
**wallet/chain ✗** (no connected EVM account) → quote/order never requested.

Exact source on `d92aa4703`, `apps/web/src/views/shared/monetization/CommercialCheckoutModal.tsx`:

- line 1706: `prepareMarcoPayOrder()` sets `RC_COPY.connectWallet` and returns `null` when `buyerWallet` is missing;
- line 2310–2312: `reviewAndPay()` then runs `if (!order || !wallet) throw new Error('MARCO Pay is temporarily unavailable.')`,
  overwriting the real blocker with the outage string.

PR #131 (`fdbacc6d6`, merged 2026-10-08 12:44 Rome, deployed 12:46 Rome) replaced that throw with `return` and stopped labelling
referral-verification failures and loading readiness as an outage. Production `b8f223f4d` no longer shows the message on this path.

## Residual P0 defects on current production (fixed in this branch)

1. **Connect dead-end.** With MARCO Pay selected and no EVM account, the footer kept "Review and pay", which only printed
   "Connect wallet". `ConnectWalletButton` was suppressed for MARCO Pay (`!buyerWallet && !isMarcoPay && !isMCredits`).
   Fix: show the existing `ConnectWalletButton` for MARCO Pay as well (M-Credits unchanged: it uses MARCO Passport).
2. **Raw wallet errors.** A wallet without enough MARCO (or BNB gas, or a simulated revert) surfaced the raw ethers dump.
   Fix: `marcoPayWalletErrorMessage()` in `lib/marco-pay/preparedCheckout.ts` maps rejection, insufficient MARCO, insufficient BNB gas,
   revert and RPC timeout to factual copy. Only pre-broadcast failures say "MARCO Pay was not charged"; RPC timeout and unknown errors
   ask the user to check wallet activity before paying again (double-charge guard). The MARCO Pay handoff fallback is unchanged.

Not changed: server checks, readiness, referral verification, prices, Treasury, token, chain, settlement, activation.

## Remaining conditions that can still legitimately show the message

`GET /api/marco-pay/readiness` failing three times, server readiness `executable: false` (MARCO machine endpoints / app quote / signed test /
settlement wallet), gateway errors in `POST /api/marco-pay/orders` (`QUOTE_UNAVAILABLE`, `MARCO_CONVERSION_INVALID`,
`LIVE_SETTLEMENT_REQUIRED`, `SETTLEMENT_WALLET_NOT_TREASURY`, `WALLET_TRANSFER_UNAVAILABLE`), and an order polled in `TEST_VERIFIED`.
None was observed in production on 2026-10-09.
