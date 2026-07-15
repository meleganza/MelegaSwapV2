# R791B.3J — Homepage Activity Final Production Verification

**Verification timestamp:** 2026-07-15T13:44:29.452Z  
**Verdict:** `R791B_3J_HOMEPAGE_ACTIVITY_PASS`

## Deployment authority

| Field | Value |
|-------|-------|
| Production SHA | `16c88d3b3eae2b9ab2a6ce2ac90e140f6c5b02ef` |
| Build ID | `ai7YNG7vRvrQV9AHbWMke` |
| Deployment URL | `https://melega-swap-v2-4eraja40g-melegazas-projects.vercel.app` |
| Deployment status | success (GitHub Production deployment `5457979780`) |
| Canonical alias | `https://www.melega.finance` → HTTP 200 |
| Redirect alias | `https://melega.finance` → HTTP 200 → `https://www.melega.finance/` |
| Authority commit | `16c88d3b` (R791B_3I_REMOVE_DUPLICATE_ACTIVITY_ROWS) |

Production serves `16c88d3b` or later. Duplicate-row correction (`selectCanonicalActivityRows`) is live.

## Canonical API snapshot

Source: `GET https://www.melega.finance/api/protocol/activity?limit=40` (single read)

| Metric | Value |
|--------|-------|
| HTTP status | 200 |
| API status | `ready` |
| Canonical API row count | 3 |
| Canonical unique row count | 3 |
| Unique transaction count | 3 |
| AMM | 3 |
| MasterChef | 0 |
| SmartChef | 0 |
| Newest timestamp | `1783853420` |
| Oldest timestamp | `1773393280` |
| Events within 24h | 0 |
| Duplicate canonical identities | 0 |
| Newest-first ordering | yes |

Canonical identities (newest first):

1. `56:0x6ea8256066280d0972c204fdf7832c2bd394f3d721ba0834898875512bd8fc61:355`
2. `56:0xb43c9d1bdc6a9d2015ba8fade20a2d4e7840ab6c894e4835a88a6df2c514152d:266`
3. `56:0x76c0b12d2fe149a6c524661f2bdd93fe51da373e561b870b53c9141b0db240c9:485`

API validation: valid hashes, finite timestamps, no duplicate canonical identity, no `undefined`/`NaN`, no synthetic registry events.

Full snapshot: `apps/web/docs/runtime/r791b3j-activity-api-snapshot.json`

## Title reconciliation

| | Value |
|--|-------|
| Expected title (0 events within 24h, 3 rows exist) | `Recent Protocol Activity` |
| Rendered title (1440) | `Recent Protocol Activity` |
| Rendered title (768) | `Recent Protocol Activity` |
| Rendered title (390) | `Recent Protocol Activity` |

Title matches API timestamps at all viewports. No stale externally passed title observed.

## Row-count reconciliation

| Viewport | Limit | Expected visible | Actual visible | Unique row IDs | Unique tx hashes | Match |
|----------|-------|------------------|----------------|----------------|------------------|-------|
| 1440×900 | 6 | 3 | 3 | 3 | 3 | yes |
| 768×1024 | 5 | 3 | 3 | 3 | 3 | yes |
| 390×844 | 4 | 3 | 3 | 3 | 3 | yes |

Invariants satisfied at all viewports:

1. visible row count equals expected visible rows
2. visible row count equals unique `data-activity-row-id` count
3. no canonical row rendered twice
4. no duplicate row added to fill limit
5. no placeholder rows counted
6. newest-first order preserved

**Duplicated rows detected:** no (R791B.3H defect resolved — was 6 DOM rows / 3 unique txs at 1440)

## Row content reconciliation

| Check | Result |
|-------|--------|
| Stable row IDs present | yes |
| Event labels readable | yes (`Swap · MARCO / WBNB`) |
| Wallet shortened | yes |
| Relative time consistent | yes (`3d ago`, `4d ago`, `124d ago`) |
| Explorer links correct | yes (BscScan tx URLs) |
| No undefined/null/NaN | yes |
| No duplicate symbols | yes |

## Mutually exclusive UI states

**Observed case: CASE A — API HAS ROWS**

| Check | Result |
|-------|--------|
| Rows render | yes |
| No skeleton after load | yes |
| No empty state | yes |
| No unavailable state | yes |

CASE B and CASE C not observed.

## Visual geometry

| Viewport | Border visible | Horizontal overflow | Bottom breathing | Clipping |
|----------|---------------|---------------------|------------------|----------|
| 1440 | yes | no | 21px | none |
| 768 | yes | no | 21px | none |
| 390 | yes | no | 21px | none |

No hidden duplicate mobile/desktop row variants. No page-level horizontal overflow caused by the panel.

## View All

| Check | Result |
|-------|--------|
| href | `/trade/` |
| Click responds | yes |
| Final route | `/trade/` |
| Error boundary | no |
| Dead interaction | no |

## Newest / oldest rendered event

| | Transaction hash |
|--|------------------|
| Newest | `0x6ea8256066280d0972c204fdf7832c2bd394f3d721ba0834898875512bd8fc61` |
| Oldest | `0x76c0b12d2fe149a6c524661f2bdd93fe51da373e561b870b53c9141b0db240c9` |

## PASS criteria evaluation

| Criterion | Pass |
|-----------|------|
| Production ≥ 16c88d3b | yes |
| Panel mounts at 3 viewports | yes |
| No pageerror | yes |
| Title matches timestamps | yes |
| Expected = actual row count | yes |
| Actual = unique DOM row IDs | yes |
| Zero duplicate activity rows | yes |
| Newest-first order | yes |
| Mutually exclusive states | yes |
| View All works | yes |
| No overflow/clipping | yes |

## Screenshots

- `apps/web/docs/runtime/r791b3j-screenshots/homepage-activity-1440.png`
- `apps/web/docs/runtime/r791b3j-screenshots/homepage-activity-768.png`
- `apps/web/docs/runtime/r791b3j-screenshots/homepage-activity-390.png`

## Artifacts

- `apps/web/docs/runtime/r791b3j-activity-api-snapshot.json`
- `apps/web/docs/runtime/R791B_3J_HOMEPAGE_ACTIVITY_FINAL_VERIFICATION.md`
- `apps/web/docs/runtime/r791b3j-screenshots/` (3 PNGs)

## Next mission

**R791B.4A — POOLS PRODUCTION BASELINE ONLY**
