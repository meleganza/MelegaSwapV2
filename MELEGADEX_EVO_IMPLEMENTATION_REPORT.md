# MelegaDEX Evo R033 Implementation Report

Verdict: `R033_FOUNDER_REVIEW_RC_READY`

This is not `UX_APPROVED` and not `BETA_LIVE_READY`. Founder Review and cutover remain separate gates.

## Git and scope

- Baseline: R032 `70fb5f82ed1c2fc93e9781cc534195373c128017`
- Verified ancestor: R031 `7ff4d72d16de270bc8870a36d0e160b647c3485e`
- Branch: `codex/r033-founder-approved-ux`
- Application changed: `apps/web` only
- No merge, deployment, DNS change, wallet signature, approval, payment, contract change, fee change or Treasury change was performed.
- Pre-existing local cache excluded from the RC commit: `apps/web/tsconfig.tsbuildinfo`.

## Phase status

| Phase | Status | Evidence |
|---|---|---|
| 0 — Mockup recovery and manifest | PASS | eight unique canonical images copied under `artifacts/r033/mockups`; dimensions and SHA-256 recorded in the master spec |
| 1 — Shell and tokens | PASS | Pearl canvas/surfaces, Inter, flat gold CTA, canonical extracted Evo asset, unified mobile/desktop shell |
| 2 — Trade / SmartSwap | PASS | one canonical SmartSwap runtime; Pearl trade shell; real disconnected state; 390/1440 captures |
| 3 — Token Selector | PASS | existing token registry and import runtime retained; contextual copy/wallet/explorer actions; 390 capture |
| 4 — MARCO Bridge | PASS | existing MARCO build/quote/track runtime retained; no invented route/fee/history data; 390/1440 captures |
| 5 — Earn catalog | PASS | one Earn entry surface with Pair/Token/Liquidity paths and Positions/Finished access |
| 6 — Earn detail and guided flows | PARTIAL | routing and canonical action hosts retained; transaction-bound connected-wallet steps intentionally not executed |
| 7 — Liquidity | PASS | legacy AMM add/remove runtime restyled; no second liquidity engine; 390/1440 captures |
| 8 — Portfolio | PARTIAL | wallet-first disconnected state verified; connected balances and actions require a real wallet and were not fabricated |
| 9 — Explore | PASS | registry-backed discovery and project detail retained; unavailable figures remain unavailable |
| 10 — Tools | PASS | exactly four approved primary services; existing factory and checkout hosts retained |
| 11 — Cross-page QA | PASS | real browser captures at 390×844 and 1440×900; no horizontal overflow on captured routes |
| 12 — Financial certification | PASS | policy, SmartSwap truth and Tools service tests: 22/22 PASS; typecheck and production build PASS |
| 13 — Founder Review RC | READY | isolated branch and rollback point; stopped before cutover |

## Route matrix

| Surface / route | Visual | Runtime | Result |
|---|---|---|---|
| Trade `/`, `/swap` | M01 Pearl hierarchy | canonical SmartSwap | PASS |
| Token selector | M02 Pearl sheet | token lists, balances, import | PASS |
| MARCO Bridge `/bridge` | M03 Pearl form | existing MARCO APIs/action host | PASS |
| Earn Pair `/farms` | M04/M05 unified Earn | farm readers/actions | PASS |
| Earn Token `/pools` | M04/M05 unified Earn | pool readers/actions | PASS |
| Earn Liquidity `/liquidity` | M05 add/remove flow | legacy AMM | PASS |
| Portfolio `/portfolio` | M06 wallet-first | existing portfolio readers | PARTIAL — disconnected evidence only |
| Explore `/projects` | M07 discovery | existing registry | PASS |
| Project detail `/project/[slug]` | M07 detail/handoff | existing project data | PASS |
| Tools `/list` | M08 catalog | existing services | PASS |
| Create Token intent | M08 create flow | canonical factory | PASS — UI/build boundary only |
| Trend Boost intent | M08 plan flow | canonical order/checkout | PASS — UI/build boundary only |

## Screenshot evidence

All evidence is under `artifacts/r033/screenshots/`. Captured surfaces include `trade`, `token-selector`, `bridge`, `earn`, `pools`, `liquidity`, `portfolio`, `explore`, `project`, `tools`, `create-token` and `trend-boost`. Route captures have 390px mobile and 1440px desktop variants; the token selector is additionally captured open at 390px.

Observed horizontal layout: mobile `scrollWidth = clientWidth = 390` on all route captures. Desktop content remained within the viewport; the 8px difference on scrollable routes is the browser scrollbar, not page overflow.

## Tests and build

- TypeScript: `yarn tsc --noEmit` — PASS.
- Production build: `yarn build` — PASS, 114 static pages generated.
- Focused tests — PASS, 3 files and 22 tests:
  - native yield termination policy: 9 tests;
  - SmartSwap execution-preview truth: 11 tests;
  - approved Tools services: 2 tests.
- Expected non-failing diagnostics: localStorage checksum no-op and server-only participant snapshot unavailable without its external RPC/BscScan environment. No value was replaced with invented data.

## Terminated policy

- BNB: new Melega farm/pool entry remains active.
- Polygon, Ethereum and Base: native Melega farm/pool entry remains terminated at list, deep-link and action-host boundaries.
- Existing exits remain available where supported by the contract: unstake, withdraw, emergency withdraw, claim and remove liquidity.
- Swap and ordinary liquidity removal are not disabled by the yield termination policy.
- Contracts, Treasury and fees are unchanged.

## Funnel before / after

| Area | Before | R033 |
|---|---|---|
| Trade | legacy visual hierarchy around the same engine | one focused SmartSwap card with MARCO Bridge as the adjacent Trade tab |
| Earn | farms, pools and liquidity appeared as separate destinations | one Earn entry with Pair, Token and Liquidity paths, preserving their existing runtimes |
| Portfolio | repeated disconnected prompts | one wallet-first disconnected state and direct My Positions access |
| Tools | visually mixed service entry | four approved primary services; existing factory/checkout flows unchanged |

## Residual P0/P1 and E2E limits

- P0 residuals found in the certified scope: none.
- P1 external gate: connected-wallet balances and transaction preparation should be re-run during Founder Review with an approved disposable QA wallet and non-production test funds. R033 deliberately did not sign, approve, pay or broadcast.
- Bridge recent history appears only when the canonical runtime supplies wallet history; mockup history was not copied as fake data.
- APR, APY, TVL, price, market cap, holders, rewards and balances are never sourced from mockup values.
- Visual review is evidence for Founder Review, not Founder approval.

## Diff and rollback

The diff is limited to the shell, mapped consumer surfaces, verified brand asset, reports and screenshot/mockup evidence. No new financial provider, reader, engine, indexer, AMM, factory or checkout was added.

Rollback point: R032 SHA `70fb5f82ed1c2fc93e9781cc534195373c128017`. R033 is isolated on `codex/r033-founder-approved-ux` and stops before cutover.
