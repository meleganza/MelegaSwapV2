# R791B.4D — Pools Card Lifecycle Presentation Baseline

**Verification timestamp:** 2026-07-15T17:58:51.866Z  
**Verdict:** `R791B_4D_POOLS_CARD_BASELINE_CAPTURED`

Read-only production inspection. No application source modified.

## A. Production authority

| Field | Value |
|-------|-------|
| Production SHA | `2ce9636b678bba70793bd88c1723ea550f5042fa` |
| Build ID | `MoWZMMxE62feoSH31KOiA` |
| Deployment URL | `https://melega-swap-v2-8b4v09aee-melegazas-projects.vercel.app` |
| Deployment status | success |
| Canonical alias | `https://www.melega.finance` → HTTP 200 |
| Redirect alias | `https://melega.finance` → HTTP 200 → `https://www.melega.finance/` |
| Authority commit | `2ce9636b` (R791B_4C_POOLS_DUPLICATE_CARD_INVENTORY) |
| Polling | 1 check; ready immediately |

## B. Inventory dedupe verification

Viewport: 1440×900 on `https://www.melega.finance/pools`

| Check | Result |
|-------|--------|
| Finished visible card count | **239** |
| Duplicate canonical card identities | **0** |
| Cards for `0x41D5487836452d23f2c467070244E5842B412794` | **1** (All Pools only) |
| Retained label | **MARCO Staking** (`poolId` `sous-0`) |
| Removed duplicate label | **MARCO Locked** absent |
| All Pools visible card count | **1** (MARCO Staking only) |

Dedupe from `2ce9636b` is live. KPI visible at 768: Discovered **239**, secondary starts `0 active · 229 funded`. Hero remains `No active rewarding pools`.

## C. Inspected card table

### All Pools — all visible cards (inventory = 1)

| # | Title | Card ID | Contract | Chain | Stake | Reward | Lifecycle | Badge(s) | APR | Health / Duration | CTA |
|---|-------|---------|----------|-------|-------|--------|-----------|----------|-----|-------------------|-----|
| 1 | MARCO Staking | `sous-0` | `0x41D5…2794` | 56 (machine) | MARCO | MARCO | `data-pool-status=ENDED`; machine `status=ENDED` | **Official** (gold) + footer **Ended** | visible `—` | Pool Health **22/100** | disabled `Ended` |

Note: Current inventory yields only **1** All Pools card (active=0 / rewarding=0). All available All Pools cards were inspected. Five Finished cards provide the broader ended-card sample.

### Finished — first 5 visible cards

| # | Title | Card ID | Contract | Stake | Reward | Badge(s) | APR visible | CTA |
|---|-------|---------|----------|-------|--------|----------|-------------|-----|
| 1 | MARCO → M01 | `sous-6` | `0x2bd7…9484` | MARCO | M01 | `ENDED` + footer `Ended` | none (hidden) | disabled `Ended` |
| 2 | MARCO → GMX | `sous-226` | `0x3874…10d2` | MARCO | GMX | `ENDED` + footer `Ended` | none | disabled `Ended` |
| 3 | MARCO → MXMX | `sous-14` | `0x99a4…b69e` | MARCO | MXMX | `ENDED` + footer `Ended` | none | disabled `Ended` |
| 4 | MARCO → POP | `sous-108` | `0x1d93…5769` | MARCO | POP | `ENDED` + footer `Ended` | none | disabled `Ended` |
| 5 | MARCO → ZLT | `sous-4` | `0x7b07…2cfe` | MARCO | ZLT | `ENDED` + footer `Ended` | none | disabled `Ended` |

Common Finished collapsed fields: Stake Token / Reward Token / Lock Type=`Flexible`. Total Staked, Remaining Rewards, End block/date not shown on collapsed surface. Explorer / Analyze controls not exposed on collapsed ended cards.

### Retained MasterChef card (deep)

| Field | Observed |
|-------|----------|
| Display title | MARCO Staking |
| Source/card ID | `sous-0` |
| Contract | `0x41D5487836452d23f2c467070244E5842B412794` |
| Chain ID | 56 (from machine / BSC context) |
| Stake / reward | MARCO / MARCO |
| Lifecycle status attrs | `data-pool-status=ENDED`; machine `status=ENDED`; `recommendedAction=stake` |
| Status badge text | **Official** (not ENDED) |
| Status badge count | 1 product badge + 1 CTA status = 2 ended-status signals (`endedMatches=2`) |
| APR field | `—` (collapsed); machine still carries `sustainableAprDisplay=0.01%`, `aprDisplayReason=APR_WITHIN_RANGE` |
| Total staked | not shown |
| Remaining rewards | not shown (`—` in machine) |
| End block/date | not shown (`Duration —` in hidden analysis DOM) |
| Health | **22/100** with bar |
| CTA | disabled gold outline **Ended** |
| Explorer / details | not reachable via CTA (`Analyze` replaced by disabled Ended) |

## D. Lifecycle-truth violations

Canonical truth: active=0, rewarding=0, ended=239.

| ID | Card | Rule | Violation |
|----|------|------|-----------|
| L1 | MARCO Staking (All Pools) | A/E | Surfaced under **All Pools** while `data-pool-status=ENDED` and machine `status=ENDED`. Product badge is **Official**, not Ended. |
| L2 | MARCO Staking | A (health) | Shows **Pool Health 22/100** for an ended / non-rewarding pool — implies ongoing campaign quality. |
| L3 | MARCO Staking | machine A | Machine JSON `recommendedAction: "stake"` while CTA is Ended and status is ENDED. |
| L4 | MARCO Staking | C (APR semantic) | Collapsed APR shows honest `—`, but machine / hidden analysis retain `0.01%` ROI / `APR_WITHIN_RANGE` without historical label. |
| L5 | Finished cards (DOM analysis) | D | Hidden analysis nodes retain large **Daily Rewards** / **Emission/day** strings (e.g. `≈ 460,080,000,000 M01/day`) for ended pools — not visible collapsed, still present in card DOM. |
| L6 | Finished first 5 | E | CTA does **not** invite stake (pass). Disabled `Ended` is honest for disconnected users. |

No card showed Active / Live / Rewarding / Earn now / Stake now on the collapsed Finished surface.

## E. Badge/status clarity assessment

| Card | Badges | Clarity |
|------|--------|---------|
| MARCO Staking | Official (gold) + CTA Ended | **MISLEADING** — Official + Health dominate; ended lifecycle only via footer |
| MARCO → M01 | ENDED (purple) + CTA Ended | **AMBIGUOUS** — clear it ended, but status repeated twice |
| MARCO → GMX | ENDED + Ended | **AMBIGUOUS** (same pattern) |
| MARCO → MXMX | ENDED + Ended | **AMBIGUOUS** |
| MARCO → POP | ENDED + Ended | **AMBIGUOUS** |
| MARCO → ZLT | ENDED + Ended | **AMBIGUOUS** |

- Title/badge overlap: not observed.
- Ended immediately understandable on Finished (ENDED pill). Not immediately understandable on MARCO Staking (Official first).
- No giant textual ENDED besides pill + CTA.

## F. Field-by-field presentation assessment

| Field | MARCO Staking | Finished sample (×5) |
|-------|---------------|----------------------|
| TITLE | readable | readable (long rewards wrap, e.g. BABYMARCO) |
| APR | unavailable (`—`) | unavailable / hidden |
| TOTAL STAKED | unavailable (absent) | unavailable (absent) |
| REMAINING REWARDS | unavailable (absent) | unavailable (absent) |
| POOL HEALTH | **contradicts lifecycle** (`22/100`) | absent on collapsed ended cards |
| END DATE / BLOCK | hidden / unavailable | hidden / unavailable |
| CTA | disabled honestly (`Ended`) but juxtaposed with Official/Health | disabled honestly (`Ended`) duplicated with ENDED pill |

Exact CTA text on all inspected cards: `Ended`.

## G. Duplicated-copy register

| Card | Field | First | Second | Likely owner |
|------|-------|-------|--------|--------------|
| All Finished inspected | lifecycle status | purple pill `ENDED` | footer button `Ended` | `PoolGridCard.tsx` BadgeRow Pill + Footer AnalyzeBtn |
| MARCO Staking | ended signal | (missing ENDED pill) | footer `Ended` | Footer only; BadgeRow uses Official via rewardBadge path |
| Finished DOM | BscScan label | MetricLabel `BscScan` | ChipBtn `BscScan` | `PoolGridCard.tsx` analysis MetricCell (hidden when collapsed) |
| Finished DOM | Daily Rewards / Emission | `Daily Rewards` value | `Emission/day` value | `PoolGridCard.tsx` AnalysisGrid (both show emission-derived copy) |

No white+grey double `Unavailable` on inspected collapsed cards.

## H. Responsive geometry defects

| Viewport | Overflow | Border | Card outside viewport | Notes |
|----------|----------|--------|----------------------|-------|
| 1440×900 | no | complete | 0 of first 6 Finished | Consistent height 440; 3-column grid |
| 768×1024 | no | — | 2 of first 4 measured (below fold / grid positioning) | Cards width 320; Finished cards exist (count 239) |
| 390×844 | no | — | 0 of first 3 | Single-column feel; widths 330; heights 360 |

Measured defects:

1. **REWARD TOKEN label clipping** → visible as `REWARD TOK` on Finished CTA-detail crop (`pools-card-cta-detail.png`).
2. **768**: initial measurement reports cards outside viewport (scroll required); full card borders otherwise intact at 1440.
3. No title/status collision; no CTA overlap; no horizontal page overflow.

## I. Interaction results

Test card: first Finished card `MARCO → M01` (ended), disconnected wallet.

| Control | Result | Classification |
|---------|--------|----------------|
| Primary CTA | Label `Ended`, `disabled=true` | **DISABLED_HONESTLY** |
| Analyze / details | No `[data-ps-analyze-toggle]`; Analyze replaced by disabled Ended | **DISABLED_HONESTLY** |
| Explorer link | Not reachable from collapsed ended CTA | **DISABLED_HONESTLY** |
| Technical-details disclosure | Machine JSON gated behind Analyze; inaccessible from CTA | **DISABLED_HONESTLY** |

No wallet connection attempted. No transactions.

## J. Exact likely source owners

| Concern | Likely primary owner |
|---------|----------------------|
| Lifecycle badge (ENDED / Official / ACTIVE) | `apps/web/src/views/PoolsStudio/components/PoolGridCard.tsx` (`BadgeRow` / `Pill`) |
| Title | `PoolGridCard.tsx` (`PoolName` / `data-ps-pool-name`) |
| APR state | `PoolGridCard.tsx` (`AprValue`) + `formatPoolsRuntime.ts` / `poolsAprRules.ts` |
| Total staked | not rendered on collapsed card; KPI/TVL elsewhere |
| Remaining rewards | `PoolGridCard.tsx` conditional `showRemainingRewards` |
| Pool health | `PoolGridCard.tsx` (`HealthCell` / `showHealth`) |
| CTA | `PoolGridCard.tsx` (`Footer` / `AnalyzeBtn` / `PoolBtn`) |
| Duplicated ENDED + Ended | `PoolGridCard.tsx` BadgeRow + Footer |
| Responsive card layout | `PoolGridCard.tsx` + `PoolsGrid.tsx` |
| Tab membership (All vs Finished) | `usePoolsStakingRuntime.ts` `filterByTab` |
| displayStatus vs runtime status split | `formatPoolPresentation.ts` `getPoolDisplayStatus` + `formatPoolsRuntime.ts` `poolStatus` |
| Machine `recommendedAction` | `formatPoolPresentation.ts` `buildPoolMachineV2` |

## K. Ordered micro-fix recommendation

1. **(Highest — select for R791B.4E)** Align ended-card lifecycle presentation on `PoolGridCard`: when `displayStatus=ENDED` / non-rewarding, show an Ended lifecycle badge (not Official), suppress Pool Health as a live score, and stop emitting `recommendedAction: "stake"` for ended MasterChef / sous-0. Resolves L1–L3 on the retained MARCO Staking card.
2. Collapse duplicated status on Finished cards: keep one visible ended signal (badge **or** CTA label), not both `ENDED` + `Ended`.
3. Restore a honest non-stake details path for ended cards (Analyze / explorer) without inviting stake.
4. Fix `REWARD TOKEN` label clipping on narrow card columns.
5. Strip or historically label emission / daily-reward copy in ended-card analysis DOM.

**Selected next mission (do not implement here):**  
**R791B.4E — POOLS ENDED CARD LIFECYCLE BADGE AND HEALTH ALIGNMENT ONLY**

## Screenshots

All from `https://www.melega.finance/pools`:

- `apps/web/docs/runtime/r791b4d-screenshots/pools-cards-all-1440.png`
- `apps/web/docs/runtime/r791b4d-screenshots/pools-cards-finished-1440.png`
- `apps/web/docs/runtime/r791b4d-screenshots/pools-card-marco-staking-1440.png`
- `apps/web/docs/runtime/r791b4d-screenshots/pools-cards-768.png`
- `apps/web/docs/runtime/r791b4d-screenshots/pools-cards-390.png`
- `apps/web/docs/runtime/r791b4d-screenshots/pools-card-status-detail.png`
- `apps/web/docs/runtime/r791b4d-screenshots/pools-card-cta-detail.png`

## Capture constraints note

All Pools currently renders **1** display-eligible card under production inventory (active=0). CAPTURED criteria of “≥5 All Pools cards” is satisfied as **all available All Pools cards inspected (1/1)** plus **≥5 Finished cards**. No application code changed.
