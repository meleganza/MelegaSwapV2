# R032 Founder Override QA

Baseline: `7ff4d72d16de270bc8870a36d0e160b647c3485e`

## Verification

- TypeScript: PASS (`yarn tsc --noEmit`)
- Production build: PASS (`yarn build`, 114 static pages)
- Targeted financial/safety tests: PASS (22/22)
  - Native yield policy: 9/9
  - SmartSwap execution truth: 11/11
  - Tools service contract: 2/2
- Real-wallet E2E: BLOCKED by the no-real-transactions constraint; disconnected states and canonical action surfaces were inspected.
- Historical UX tests: PARTIAL. Six assertions encode R031 elements deliberately removed by R032 (global ticker and the combined Swap/Bridge Home tab); these are obsolete contracts, not runtime failures.

## Route matrix

| Route | 390 | 1440 | Result | Notes |
|---|---:|---:|---|---|
| `/` | captured | captured | PASS | Same canonical SmartSwap experience as `/swap`; two verified featured cards, no fictitious third slot. |
| `/swap` | captured | captured | PASS | Canonical SmartSwap form and mandatory execution details preserved. |
| `/bridge` | captured | captured | PASS | Hero removed; canonical bridge runtime remains. |
| `/liquidity` | captured | captured | PASS | Immediate positions and Add/Remove workspace; builder/explore remain available only through their existing deep links. |
| `/farms` | captured | captured | PASS | Earn header/tabs simplified; chain safety policy unchanged. |
| `/pools` | captured | captured | PASS | Earn header/tabs simplified; chain safety policy unchanged. |
| `/portfolio` | captured | captured | PASS | Simple header/connect state; Assets, Earn, Liquidity and Finished data preserved. |
| `/projects` | captured | captured | PASS | Explore/search/Featured/Trending/All/list, without marketing hero or CTAs. |
| `/project-hq/marco` | captured | captured | PARTIAL | Existing detail runtime preserved; screenshot timing is limited by ISR/data readiness. |
| `/list` | captured | captured | PASS | Exactly four approved services, no intro copy or extra banner. |
| `/add` | captured | captured | PASS | Canonical add-liquidity runtime preserved. |
| `/remove` | captured | captured | PASS | Canonical remove-liquidity runtime preserved. |

Screenshots are under `artifacts/r032/screenshots/` and were generated against the local production server at 390×844 and 1440×1000.

## Safety statement

No wallet, Redux/Wagmi, SmartSwap engine, action host, LP contract, fee, Treasury, MARCO Pay or checkout runtime was changed. Polygon, Base and Ethereum native Farms/Pools remain terminated for new entry through the R031 policy; reads and contract-supported exits remain available. Swap and LP removal were not disabled on those chains.

No real transaction, merge, production deploy, DNS change or financial setting change was performed.
