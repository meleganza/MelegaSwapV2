# R791B.4K — Pools Final Production Verification

**Verdict:** `R791B_4K_POOLS_FINAL_PASS`  
**Verification timestamp:** `2026-07-17T17:36:40.934Z` (classification + KPI reconcile)  
**Primary capture window:** `2026-07-17T17:31:36Z` – `2026-07-17T17:37:10Z`  
**Source:** `https://www.melega.finance/pools` only (no localhost / Preview)

---

## A. Production authority

| Field | Value |
|-------|-------|
| Production SHA | `e2686466f4378d00196277912edc8f1140fb4718` |
| Contains required commit | Yes (`e2686466` live) |
| Next.js build ID | `wGKgPfauxLyDl51wcF8H8` |
| Deployment URL | `https://melega-swap-v2-1i3bc4077-melegazas-projects.vercel.app` |
| Deployment status | `success` |
| Canonical alias | `https://www.melega.finance/pools/` → HTTP 200 |
| Redirect alias | `https://melega.finance/pools` → `https://www.melega.finance/pools/` HTTP 200 |
| Polling | Ready on first check (within limits) |

Authority chain included: `6006a69f` → `2ce9636b` → `54f2e91f` → `96c7fbb7` → `37c64ed7` → `961dac8f` → `f03f3174` → `e2686466`.

---

## B. Canonical classification response

Endpoint: `GET https://www.melega.finance/api/pools/classification/`  
Artifact: `apps/web/docs/runtime/r791b4k-pools-classification-snapshot.json`

| Field | Value |
|-------|-------|
| HTTP status | 200 (after brief transient 504s during earlier probes) |
| discovered | **239** |
| verified | **239** |
| active | **0** |
| funded | **229** |
| rewarding | **0** |
| ended | **239** |
| invalid | **0** |
| generatedAt | `2026-07-17T17:36:49.228Z` |
| currentBlock | `110556415` |
| dataSource | `on-chain-verified-multicall` |

Matches expected baseline exactly.

---

## C. KPI reconciliation

After classification load completed on production:

| KPI | Observed | Canonical | Match |
|-----|----------|-----------|-------|
| Pools Discovered | 239 | 239 | Yes |
| Secondary line | `0 active · 229 funded · 0 rewarding` | 0 / 229 / 0 | Yes |

Also verified:

- no stale `242`
- no `2 active`
- no false `0 funded`
- no pageerror / no Oops during reconcile capture

TVL renders (`$108.2K`) — recorded only, not audited.  
Pools Rewarding KPI tile showed `Unavailable` with secondary `0 with on-chain emission` (see §N).

---

## D. Hero reconciliation

| Check | Result |
|-------|--------|
| Title | **No active rewarding pools** |
| Discovered copy | **239 pools discovered on-chain — none are currently emitting rewards. Ended pools appear under Finished.** |
| Equals canonical discovered | Yes (239) |
| Footer | Rewards concluded |

---

## E. Canonical card inventory result

| Check | Result |
|-------|--------|
| Finished card count | **239** (= canonical ended) |
| Duplicate identities | **0** |
| Unique contracts (Finished) | 239 |
| MasterChef `0x41D5…2794` | Exactly **1** card |
| Retained label | **MARCO Staking** (All Pools) |
| Removed alias | **MARCO Locked** = 0 |
| Array slicing used to fabricate count | No (DOM card count = 239) |

Note: MARCO Staking appears under **All Pools** (1 card), not duplicated under Finished. Finished inventory is 239 ended sous/pair cards without a second MasterChef alias.

---

## F. MARCO Staking lifecycle result

Collapsed:

- exactly one `ENDED` badge
- Official absent
- Pool Health / `22/100` / health bar absent
- enabled **View Details**
- exactly one primary BscScan control
- full **STAKE TOKEN** / **REWARD TOKEN**
- no Estimated ROI in DOM
- no Daily Rewards

Expanded:

- CTA → **Hide Analysis**
- one explorer control remains
- Emission/day exactly once (`0.00 / day`)
- no Daily Rewards / Estimated ROI / ROI %
- no empty ROI wrapper / orphan divider / blank analysis cell
- machine JSON not shown as primary UI (collapsed behind Machine JSON chip)

Collapse again: card remained stable.

---

## G. Machine-action result

From `data-melega-pool-v2` on MARCO Staking:

| Field | Value |
|-------|-------|
| displayStatus / status | `ENDED` |
| recommendedAction | **`none`** |
| Forbidden `stake` | Not present |
| poolId | `sous-0` |
| contractAddress | `0x41D5487836452d23f2c467070244E5842B412794` |

---

## H. Analysis-panel result

| Field | Result |
|-------|--------|
| Emission/day | Exactly once |
| Daily Rewards | Absent |
| Estimated ROI | Absent (collapsed + expanded DOM) |
| Empty ROI structure | Absent |
| Explorer in analysis | Not duplicated (primary only) |

---

## I. Reward Token responsive geometry

| Viewport | Visible text | Lines | Inside cell R/B | Clip | Overlap |
|----------|--------------|-------|-----------------|------|---------|
| 1440×900 | REWARD TOKEN | 1 | Yes / Yes | No | No |
| 768×1024 | REWARD TOKEN | 1 | Yes / Yes | No | No |
| 390×844 | REWARD TOKEN | 1 | Yes / Yes | No | No |

Stake Token: full `STAKE TOKEN` at all three.  
No page-level horizontal overflow.  
Collapsed metadata uses text symbols (MARCO); no generic initial-only avatars introduced; no token-logo collision (logos not rendered in this card metadata layout).

---

## J. Full card responsive geometry

| Check | 1440 | 768 | 390 |
|-------|------|-----|-----|
| Oops | No | No | No |
| pageerror | None | None | None |
| Horizontal overflow | No | No | No |
| Card borders | Intact | Intact | Intact |
| Title/status collision | No | No | No |
| CTA outside card | No | No | No |
| Analysis outside card | No | — | No |
| Mobile single-column | — | — | Yes |
| Tablet fit | — | Yes | — |

---

## K. Tabs and interactions

| Control | Classification |
|---------|----------------|
| All Pools | **WORKS** |
| My Positions | **WORKS** (disconnected / empty honest state) |
| Finished | **WORKS** (239 ended cards) |
| View Details | **WORKS** |
| Hide Analysis | **WORKS** |
| Primary BscScan | **WORKS** → `https://bscscan.com/address/0x41D5487836452d23f2c467070244E5842B412794` |
| Create Pool expand/collapse | **WORKS** (first step only; no tx) |

---

## L. Reward Advisor regression

Observed: **No eligible rewarding pools.**

- no ranked recommendations
- no ended pools recommended
- no Highest APR / Best Risk rows
- no repeated MARCO recommendation
- no Ask Advisor CTA
- no raw-address recommendation

---

## M. Screenshot paths

All from `https://www.melega.finance/pools`:

- `apps/web/docs/runtime/r791b4k-screenshots/pools-final-1440-full.png`
- `apps/web/docs/runtime/r791b4k-screenshots/pools-final-768-full.png`
- `apps/web/docs/runtime/r791b4k-screenshots/pools-final-390-full.png`
- `apps/web/docs/runtime/r791b4k-screenshots/pools-final-kpi-hero-1440.png`
- `apps/web/docs/runtime/r791b4k-screenshots/pools-final-marco-collapsed-1440.png`
- `apps/web/docs/runtime/r791b4k-screenshots/pools-final-marco-expanded-1440.png`
- `apps/web/docs/runtime/r791b4k-screenshots/pools-final-marco-expanded-390.png`
- `apps/web/docs/runtime/r791b4k-screenshots/pools-final-finished-1440.png`
- `apps/web/docs/runtime/r791b4k-screenshots/pools-final-reward-advisor-1440.png`
- `apps/web/docs/runtime/r791b4k-screenshots/pools-final-create-pool-390.png`

---

## N. Exact remaining defects, if any

Non-blocking observations (do not fail PASS criteria):

1. **Transient classification API 504** — `/api/pools/classification/` returned gateway 504 on early probes; recovered to HTTP 200 with expected counts. KPI briefly showed Unavailable/Loading until the API succeeded.
2. **Pools Rewarding KPI tile** — remains `Unavailable` even when secondary line correctly shows `0 with on-chain emission` / rewarding=0 (out of 4K PASS scope; recorded only).
3. **Token logos** — MARCO Staking collapsed metadata is symbol text only (no avatar images); consistent with accepted post-4E/4J card layout; no initial-only replacements.

No remaining defect blocks the Pools sequence PASS criteria listed in §O.

---

## O. Verdict

**`R791B_4K_POOLS_FINAL_PASS`**

All required PASS conditions met:

- production serves `e2686466`
- KPI reconciles with canonical classification
- Finished count = ended (239)
- duplicate identities = 0
- MARCO Staking exactly once
- ENDED presentation coherent; Official/Health absent
- recommendedAction = `none`
- View Details / Hide Analysis works
- one explorer; Emission/day once; Daily Rewards absent; forward ROI absent
- full REWARD TOKEN at 1440 / 768 / 390 without clip/overlap
- no pageerror / horizontal overflow
- Reward Advisor does not recommend ended pools
- required interactions work
