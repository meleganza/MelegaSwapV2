# R791B.4A — Pools Production Baseline

**Verification timestamp:** 2026-07-15T15:36:20.877Z  
**Verdict:** `R791B_4A_POOLS_BASELINE_CAPTURED`

## A. Production authority

| Field | Value |
|-------|-------|
| Production SHA | `f6cb41d08e69b9176f1b557c0f89cade10ee5e65` |
| Build ID | `LtbYTQI8jCdDttrRMByUX` |
| Deployment URL | `https://melega-swap-v2-5gkjuohtk-melegazas-projects.vercel.app` |
| Deployment status | success (GitHub Production deployment `5458112410`) |
| Canonical alias | `https://www.melega.finance` → HTTP 200 |
| Redirect alias | `https://melega.finance` → HTTP 200 → `https://www.melega.finance/` |
| Authority commit | `f6cb41d0` (R791B_3J_HOMEPAGE_ACTIVITY_FINAL_VERIFICATION) |

## B. Canonical classification totals

Source: `GET https://www.melega.finance/api/pools/classification/` (single read, HTTP 200)

| Metric | Value |
|--------|-------|
| Current block | `110156497` |
| Generated at | `2026-07-15T15:36:30.751Z` |
| Discovered | 239 |
| Verified | 239 |
| Active | 0 |
| Funded | 229 |
| Rewarding | 0 |
| Ended | 239 |
| Invalid | 0 |
| Unique transaction hashes (N/A — pool contracts) | — |
| Contracts with positive rewardPerBlock | 239 |
| Contracts with positive reward-token balance | 229 |
| Contracts with positive total staked (API field absent) | 0 |

API definitions recorded in snapshot. No duplicate canonical identity (`chainId + txHash + logIndex` N/A; contract addresses unique per row). Newest-first N/A for classification inventory.

Full snapshot: `apps/web/docs/runtime/r791b4a-pools-classification-snapshot.json`

## C. KPI reconciliation table

Captured at 1440×900 on `/pools`.

| KPI label | UI value | UI secondary | API field | API value | Reconciles |
|-----------|----------|--------------|-----------|-----------|------------|
| Total Value Locked | `$104.9K` | — | derived (on-chain TVL) | — | not cross-checked |
| Pools Discovered | `242` | `2 active · 0 funded · 0 rewarding` | `discovered` / lifecycle | 239 / active 0, funded 229, rewarding 0 | **no** |
| Pools Rewarding | `Unavailable` | `0 with on-chain emission` | `rewarding` | 0 | yes (0 rewarding) |
| Highest Sustainable APR | `—` | — | N/A (rewarding=0) | — | yes (no forbidden 0%) |
| Featured Pool | `Unavailable` | — | N/A (rewarding=0) | — | yes |

**Contradictions:**

1. **Discovered count:** UI `242` ≠ API discovered `239` (+3 drift).
2. **Active count:** UI secondary reports `2 active`; API active `0`.
3. **Funded count:** UI secondary reports `0 funded`; API funded `229`.
4. **Rewarding count:** UI secondary `0 rewarding` matches API `0` (consistent).
5. Rewarding (`0`) does not exceed active or funded — consistent at API level; UI secondary understates funded.

## D. Hero truth assessment

**Expected case:** CASE B — rewarding = 0, ended = 239 > 0

| Field | Production value |
|-------|------------------|
| Title | `No active rewarding pools` |
| Subtitle | `242 pools discovered on-chain — none are currently emitting rewards. Ended pools appear under Finished.` |
| Badge | `Rewards concluded` |
| CTA | `Create Pool` |
| Runtime badge | `Live Runtime` |
| Featured pool identity | none (empty hero) |

**Correctness:** **matches CASE B** — hero does not imply active rewarding pools; directs users to Finished/historical context. Subtitle discovered count (`242`) diverges from API (`239`).

## E. Reward Advisor truth assessment

| Field | Value |
|-------|-------|
| Panel title | `Reward Advisor` |
| Recommendation rows | 0 |
| Body | `No eligible rewarding pools.` |
| Ask Advisor CTA | absent |
| Raw address fragments | none |
| Ranked recommendations | none |

**Correctness:** **correct for rewarding=0** — compact empty state only; no ranked ended-pool recommendations.

## F. Tabs and counts

| Tab | Click works | Visible cards | Empty state | Notes |
|-----|-------------|---------------|-------------|-------|
| All Pools | yes | 2 | no | Both cards status `ENDED` |
| My Positions (0) | yes | 0 | disconnected-wallet implied | wallet not connected |
| Finished | yes | 240 | no | historical/ended pool grid |

**Contradictions:**

- **All Pools** shows 2 ended official pools (`MARCO Locked`, `MARCO Staking`) while API active=0 and rewarding=0 — ended pools presented as primary grid opportunities.
- **Finished** count (240) ≈ API ended (239) + possible UI duplicate/card — reconcile in fix mission.
- Tab label `My Positions (0)` matches visible empty positions state.

## G. Pool-card defect register

### All Pools — card 1

| Field | Value |
|-------|-------|
| Identity | `MARCO Locked` |
| Contract | `0x41D5487836452d23f2c467070244E5842B412794` |
| Status | `ENDED` |
| APR | `—` |
| Stake / reward | MARCO / MARCO |
| CTA context | Pool Analysis expanded metadata visible |

**Defects:** Ended pool surfaced under All Pools; shares contract address with card 2.

### All Pools — card 2

| Field | Value |
|-------|-------|
| Identity | `MARCO Staking` |
| Contract | `0x41D5487836452d23f2c467070244E5842B412794` |
| Status | `ENDED` |
| APR | `—` |

**Defects:** Same contract address as card 1 despite different pool identities (`cakeVault` vs `sous-0` in machine JSON).

### Finished — card 1

| Field | Value |
|-------|-------|
| Identity | `MARCO → M01` |
| Contract | `0x2bd7d2a773b525133c9a87910ae6baf8159d9484` |
| Status | `ENDED` |
| APR | `—` |

### Finished — card 2

| Field | Value |
|-------|-------|
| Identity | `MARCO → GMX` |
| Contract | `0x3874faAaF39333528D0Ed674D011B823d20c10d2` |
| Status | `ENDED` |

No clipping/title overlap observed on inspected cards at 1440px. Machine JSON exposed in card analysis panel (founder-facing verbosity — note for polish).

## H. Create Pool defect register

| Check | Result |
|-------|--------|
| Collapsed panel visible | yes |
| Expand via header CTA | works |
| Wizard step on expand | step 1 (Reward Token / Stake Token) |
| MARCO avatar | `https://www.melega.finance/images/melega.png` for both selectors |
| Generic `M` circle fallback | not observed |
| Estimated APR on step 1 | not shown (correct — parameters incomplete) |
| Wallet required for deploy | yes (preview-only until connected) |
| Transaction submitted | no |

**Defects:** None blocking baseline capture. Both token selectors default to MARCO with same logo asset — verify canonical MARCO asset path in fix mission if `melega.png` is not the official MARCO mark.

## I. Responsive baseline

| Viewport | Oops | pageerror | Horizontal overflow | Card count | Borders |
|----------|------|-----------|---------------------|------------|---------|
| 1440×900 | no | no | no | 2 (All Pools) | complete |
| 768×1024 | no | no | no | 2 | complete |
| 390×844 | no | no | no | 2 | complete |

Finished tab visible at mobile. Create Pool panel fits viewport at 390px.

## J. Interaction baseline

| Control | Classification |
|---------|----------------|
| All Pools tab | WORKS |
| My Positions tab | WORKS |
| Finished tab | WORKS |
| Pool Analyze/Stake action | DISABLED_HONESTLY (ended pools — stake not primary) |
| Create Pool expand/collapse | WORKS |
| Wallet-disconnected primary stake | DISABLED_HONESTLY |

## K. Likely source files (inspection only)

| Defect area | Likely files |
|-------------|--------------|
| KPI discovered/active/funded drift | `poolsRuntime/formatPoolsRuntime.ts`, `poolsRuntime/usePoolsStakingRuntime.ts`, `components/PoolsKpiRow.tsx` |
| All Pools includes ended official pools | `poolsRuntime/formatPoolsRuntime.ts`, `poolsRuntime/usePoolsStakingRuntime.ts`, `components/PoolsGrid.tsx` |
| Duplicate contract on two All Pools cards | `poolsRuntime/formatPoolPresentation.ts`, `components/PoolGridCard.tsx` |
| Hero discovered count copy | `components/FeaturedPoolHero.tsx`, `poolsRuntime/usePoolsStakingRuntime.ts` |
| Reward Advisor empty state | `components/AIRewardAdvisorPanel.tsx` (currently correct) |
| Create Pool token avatars | `components/CreatePoolCta.tsx` |
| Tab filtering Finished vs All | `poolsRuntime/usePoolsStakingRuntime.ts`, `components/PoolsGrid.tsx` |

## L. Screenshot paths

- `apps/web/docs/runtime/r791b4a-screenshots/pools-1440-full.png`
- `apps/web/docs/runtime/r791b4a-screenshots/pools-768-full.png`
- `apps/web/docs/runtime/r791b4a-screenshots/pools-390-full.png`
- `apps/web/docs/runtime/r791b4a-screenshots/pools-kpi-hero-1440.png`
- `apps/web/docs/runtime/r791b4a-screenshots/pools-advisor-1440.png`
- `apps/web/docs/runtime/r791b4a-screenshots/pools-cards-1440.png`
- `apps/web/docs/runtime/r791b4a-screenshots/pools-finished-1440.png`
- `apps/web/docs/runtime/r791b4a-screenshots/pools-create-pool-1440.png`
- `apps/web/docs/runtime/r791b4a-screenshots/pools-create-pool-390.png`

## M. Priority order for following micro-fixes

1. **R791B.4B — KPI lifecycle reconciliation** — align Pools Discovered / active / funded / rewarding KPI values and secondary copy with `/api/pools/classification/` (242 vs 239 discovered; 0 vs 229 funded; 2 vs 0 active).
2. **R791B.4C — All Pools tab filtering** — remove ended-only pools from All Pools when rewarding=0; ensure All Pools reflects display-eligible verified pools per product rules.
3. **R791B.4D — Pool card contract identity** — resolve duplicate contract address on distinct All Pools cards (MARCO Locked vs MARCO Staking).
4. **R791B.4E — Hero discovered count copy** — align hero subtitle discovered count with canonical classification API.

## Verdict

`R791B_4A_POOLS_BASELINE_CAPTURED` — production SHA live, classification captured, three viewport baselines documented, KPI/hero/advisor/card/create-pool defects registered, no application code modified.

**Next micro-mission:** R791B.4B — KPI lifecycle reconciliation
