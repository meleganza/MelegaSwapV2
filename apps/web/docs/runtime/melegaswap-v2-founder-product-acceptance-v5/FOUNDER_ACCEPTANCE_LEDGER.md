# Founder Acceptance Ledger V5

Baseline: `mission-my-melega-positions-drawer` @ `e544873f`  
Walk base: `http://127.0.0.1:3066` (local `next start`)  
Session: clean browser context · sequential navigation · viewports 1440/1280/1024/768/390

## Summary

| Severity | Count | Action |
|---|---|---|
| P0 | 0 (1 false positive invalidated) | — |
| P1 | 1 confirmed → **FIXED** | FA-V5-001 |
| P2 | 3 | No fix this mission |

### FA-V5-001 fix verification (post-repair)

- Console `[Pools Action] error …` → **0**
- Home Top Pools: MARCO→2GCC TVL $19.8K, YD $5.8K / 126.63%, EYED $5.7K, … (no empty CTA)
- Pools overview TVL **$46.8K**, Rewards 24H **$37.56**, Pools Rewarding **1**
- Screenshots: `home/top-pools-after-fix.png`, `pools/explore-after-fix.png`

---

## FA-V5-000 — INVALIDATED (false positive)

| Field | Value |
|---|---|
| ID | FA-V5-000 |
| route | `/liquidity-studio` (via header Liquidity click) |
| viewport | 1440 |
| severity | ~~P0~~ → invalid |
| screenshot | `screenshots/home/nav-after-liquidity.png` |
| expected | Destination shell mounts; Home unmounts |
| actual | Automated `homeStuck` detector fired during transition |
| likely root cause | Race: probe during soft navigation before Home teardown |
| re-verify | Direct probe: `homeRoot=false`, `liqV3=true`, `h1=Liquidity`, `aria-current=Liquidity` |
| minimal fix | None — detector flake only |
| files | walk harness only |

---

## FA-V5-001 — P1 CONFIRMED

| Field | Value |
|---|---|
| ID | FA-V5-001 |
| route | `/`, `/pools`, Home Top Pools |
| viewport | 1440 (+ all) |
| severity | **P1** |
| screenshot | `screenshots/home/top-pools-viewport.png`, `screenshots/pools/explore-1440-detail.png` |
| expected | Home Top Pools shows factual TVL/APR/reward rows when certifiable; Explore Pools cards show economics when on-chain public data loads |
| actual | Home Top Pools empty CTA only (“Open Pools for the full LIVE inventory”). Explore lists ~188 pools as Partial with APR/TVL/Remaining/Emission all `—`. Overview KPIs: Valuation/index/APR unavailable. Console: `[Pools Action] error when getting public data … invalid address … _owner … value=""` |
| data-truth class | **C** — source exists (RPC + pool configs) but adapter/fetch mismatch prevents hydration |
| likely root cause | `getAddress(address)` now returns `''` when `chainId` omitted (`addressHelpers.ts`). `fetchPools.ts` `poolsBalanceOf` calls `getAddress(poolConfig.contractAddress)` **without** chainId, so every `balanceOf` owner is `""`. Also `poolsConfig` includes non-BSC rows with `56: ''`. `Promise.all` in `fetchPoolsPublicDataAsync` fails → no `totalStaked` / prices / APR. |
| minimal fix | In `fetchPools.ts`: always pass chainId into `getAddress`; filter pools with empty contract/staking addresses before multicall; map results from the same filtered list. Do not invent TVL/APR. |
| files likely involved | `apps/web/src/state/pools/fetchPools.ts`, possibly callers; do **not** change Data Truth formulas |

---

## FA-V5-002 — P2

| Field | Value |
|---|---|
| ID | FA-V5-002 |
| route | `/farms`, `/pools` |
| viewport | 1440 |
| severity | P2 |
| screenshot | `screenshots/farms/1440-explore.png`, `screenshots/pools/1440-explore.png` |
| expected | Prefer `—` when unknown; avoid “Unavailable” walls |
| actual | KPI supporting lines: “Valuation unavailable”, “Sustainable APR unavailable”, “Pool index unavailable” (compact, not full-page walls) |
| likely root cause | Intentional supporting copy in overview KPI builders |
| minimal fix | Map supporting copy to quieter dash/omit (post-P1) |
| files | `buildFarmsOverviewKpis.ts`, `usePoolsOverviewKpis.ts` |

---

## FA-V5-003 — P2

| Field | Value |
|---|---|
| ID | FA-V5-003 |
| route | `/audit` |
| viewport | 1440 |
| severity | P2 |
| screenshot | `screenshots/audit/1440-security.png`, `screenshots/audit/audit-contracts-detail.png` |
| expected | Contract rows with name/chain/address/status/score; Score vs Runtime clear |
| actual | Score 97.1 + formula + Runtime Readiness explanation OK; truncated addresses present; Owner/Upgrade show `UNAVAILABLE` when not in SSOT |
| likely root cause | Honest missing metadata |
| minimal fix | Optional `—` instead of `UNAVAILABLE` label polish |
| files | Audit surface |

---

## FA-V5-004 — P2

| Field | Value |
|---|---|
| ID | FA-V5-004 |
| route | `/` Top Farms |
| viewport | 1440 |
| severity | P2 |
| screenshot | `screenshots/home/1440-hero.png` |
| expected | Stable factual TVL once hydrated |
| actual | Brief windows where Top Farms show TVL `—` before farm public data settles; later shows $ TVL (e.g. BUSD-BULX $1.23M) |
| likely root cause | Progressive hydration |
| minimal fix | None required for release; optional skeleton |

---

## FA-V5-005 — INVALIDATED

| Field | Value |
|---|---|
| ID | FA-V5-005 |
| severity | ~~P1~~ → invalid |
| note | Walk classifier matched `Unavailable` against Home Top Farms surface JSON incorrectly; Home body `Unavailable` count = 0 |

---

## Surfaces verified OK (no P0/P1)

- Global shell / primary nav (Home · Liquidity · Farms · Pools · List) · no Portfolio · no hamburger · My Melega present
- Sequential primary nav remounts (Liquidity/Farms/Pools/List/Home) after re-verify
- Trending bar in viewport; Switch Network modal z=10040 above header/ticker
- Home hierarchy + ecosystem PASSPORT/SMARTDROP/BLACK/SPACE/MAIORA · no BlackPump
- Smart Swap on Home: no public Treasury address
- Projects directory: featured/search/filters/cards; Trade/Open present
- Project Page V6: marco/mm72/eyed/blion/young-degens mount; economy address-matched farms; swap present; no scientific notation
- Liquidity Studio V3 shell + My/Add/AI Builder BETA
- Farms hero/explore/create; no bigint leak
- My Melega from Home/Project/Liquidity/Farms/Pools; z=10040; disconnected CTA; no Passport copy
- Portfolio secondary shell/header; no Passport language
- Commercial Featured funnel opens (packages/chain/pay path) without payment execution
- Responsive 390–1440: My Melega in-view; no horizontal overflow on sampled routes
- Nav performance: no click >3s P1 after walk; some cold gotos 1.5–2.2s (notice only)

---

## Phase 3 decision

Fix **FA-V5-001** only. Re-run Home Top Pools + Pools Explore acceptance after fix.
