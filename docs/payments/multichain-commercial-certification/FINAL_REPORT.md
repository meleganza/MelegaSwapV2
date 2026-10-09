# Final report: MELEGA-DEX-P0-MULTICHAIN-COMMERCIAL-PAYMENTS-CERTIFICATION

Status: Phase 0 + Phase A + Phase B done. **Phase C (multichain adapters) is pending the Founder's decision and was not started.**

## BNB MARCO Pay P0

- Root cause, proven (see `BNB_MARCO_PAY_ROOT_CAUSE.md`): with no EVM wallet connected, deployment `d92aa4703` replaced the
  connect-wallet error with the throw `MARCO Pay is temporarily unavailable.` (`CommercialCheckoutModal.tsx` L1706 → L2310–2312).
  Readiness was healthy. The first divergence is wallet/chain state, not MARCO Pay availability. PR #131 fixed this message in
  production (deployed 2026-10-08 12:46 Rome).
- Residual defects fixed in this branch: (1) MARCO Pay review had no Connect Wallet button, so it was still a dead end;
  (2) raw ethers errors were shown (for example the insufficient-balance error). Both are fixed with clear copy.
- Certification: **not certified**. No real end-to-end settlement could be observed under the mission rules.
  Settlement is confirmed by MARCO, the DEX never receives the tx hash, and `/api/marco-pay/reconcile` has no cron.

## Referral

The referral reaches the order: it is server-verified and persisted (code, discount, partner). Commission is computed by MARCO
(partnerBps 100); the DEX keeps no commission ledger. Settlement-side reconciliation is pending.

## Other chains / services

See `PAYMENT_CAPABILITY_MATRIX.md` and `CHAIN_SETTLEMENT_READINESS.md`. BNB is PARTIAL. Solana, Base, Polygon, Arc and Robinhood are
BLOCKED. Create Token and Create Farm use BNB factory fees, not MARCO Pay. Create Pool stays HIDDEN.

## Blockers

1. Real settlement certification needs a Founder-approved real payment or confirmation from the MARCO side.
2. `/api/marco-pay/reconcile` has no scheduled cron; the DEX relies on the MARCO webhook.
3. The ledger lacks explicit `paymentToken` and `targetChain` fields.
4. The List-workspace Featured/Trend Boost checkouts are not canonical and carry no referral.
5. Non-BNB chains have no adapter, Treasury or verifier.
6. Baseline test failures predate this work (see `TEST_EVIDENCE.md`).
