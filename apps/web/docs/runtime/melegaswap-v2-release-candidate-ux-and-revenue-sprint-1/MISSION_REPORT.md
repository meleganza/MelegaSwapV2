# MELEGASWAP_V2_RELEASE_CANDIDATE_UX_AND_REVENUE_SPRINT_1

**Verdict:** `MELEGASWAP_V2_RELEASE_CANDIDATE_SPRINT_1_COMPLETE`

**Mode:** Release Candidate · Infrastructure Freeze

## Scope delivered

| Part | Deliverable |
|------|-------------|
| A UI polish | Monetization card spacing, skeletons, errors, responsive package chips |
| B Copy | `lib/monetization/copy.ts` human-first uniform terminology |
| C Wallet UX | `WalletFlowStatus` connect/switch/approve/confirm/success/error |
| D Featured packages | 24h / 72h / 1 week / 1 month |
| E Trend Boost | 1h / 3h / 6h / 12h / 24h + API + List checkout |
| F Sponsored suggestions | Featured / Trending / Sponsored labels in Search + Token selector + Home rail |
| G Payment Router | BNB · USDT · USDC · MARCO for Create Token/Farm/Pool (protocol BNB) + Featured + Trend Boost |

## Constraints honored

- No new protocol features / no contract redeploys
- Forbidden swap/router/wallet/farm/pool/MasterChef/NFT/token-list logic untouched
- Featured default remains $99 / 7 days
- Treasury direct settlement only (no Treasury Runtime / KERL)

## Unblock / follow-ups (non-blocking)

- Production alias should pick up List Studio + Search sponsorship strip
- Create Token/Farm/Pool multi-asset remains commercial overlay display; on-chain create still BNB
