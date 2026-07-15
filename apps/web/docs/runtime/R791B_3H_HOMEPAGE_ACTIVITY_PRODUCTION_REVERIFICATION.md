# R791B.3H — Homepage Activity Production Reverification

**Verification timestamp:** 2026-07-15T13:18:38.505Z  
**Verdict:** `R791B_3H_HOMEPAGE_ACTIVITY_BLOCKED`

## Deployment authority

| Field | Value |
|-------|-------|
| Production SHA | `b050b5750b1beac6a5168b3977d579094970be7e` |
| Build ID | `aT1uaKzvF3bq68qWCGoke` |
| Deployment URL | `https://melega-swap-v2-b6i5jnjoi-melegazas-projects.vercel.app` |
| Deployment status | success (GitHub Production deployment `5457585188`) |
| Alias status | `https://www.melega.finance` and `https://melega.finance` both HTTP 200 |
| Authority commit | `b050b575` (R791B_3G_FIX_HOMEPAGE_ACTIVITY_ROW_WIRING) |

Production serves `b050b575` or later. Pre-fix crash (`data.activityRows`) is resolved — panel mounts at all three viewports with no `pageerror` and no global Oops screen.

## Canonical API snapshot

Source: `GET https://www.melega.finance/api/protocol/activity?limit=40` (single read)

| Metric | Value |
|--------|-------|
| HTTP status | 200 |
| API status | `ready` |
| Total rows | 3 |
| AMM | 3 |
| MasterChef | 0 |
| SmartChef | 0 |
| Newest timestamp | `1783853420` |
| Oldest timestamp | `1773393280` |
| Events within 24h | 0 |
| Duplicate keys | 0 |
| Newest-first ordering | yes |

Transaction hashes (newest first):

1. `0x6ea8256066280d0972c204fdf7832c2bd394f3d721ba0834898875512bd8fc61` (logIndex 355)
2. `0xb43c9d1bdc6a9d2015ba8fade20a2d4e7840ab6c894e4835a88a6df2c514152d` (logIndex 266)
3. `0x76c0b12d2fe149a6c524661f2bdd93fe51da373e561b870b53c9141b0db240c9` (logIndex 485)

API validation: valid hashes, finite timestamps, no `undefined`/`NaN`, no duplicate `chainId + txHash + logIndex`, no synthetic registry events.

Full snapshot: `apps/web/docs/runtime/r791b3h-activity-api-snapshot.json`

## Title expectation vs render

| | Value |
|--|-------|
| Expected title (0 events within 24h, 3 rows exist) | `Recent Protocol Activity` |
| Rendered title (1440) | `Recent Protocol Activity` |
| Rendered title (768) | `Recent Protocol Activity` |
| Rendered title (390) | `Recent Protocol Activity` |

Title matches API timestamps at all viewports. No externally passed stale title observed.

## Visible rows by viewport

| Viewport | DOM row count | Unique tx count | Max allowed | Within limit |
|----------|---------------|-----------------|-------------|--------------|
| 1440×900 | 6 | 3 | 6 | yes (DOM) |
| 768×1024 | 5 | 3 | 5 | yes (DOM) |
| 390×844 | 4 | 2 | 4 | yes (DOM) |

**Expected:** 3 visible rows at every viewport (API contains 3 canonical events).

**Observed:** Each canonical event renders twice in the DOM. At 1440, 6 `[data-live-activity-row]` nodes map to only 3 unique explorer transaction hashes. Newest-first order is preserved among unique events.

### Row reconciliation (1440)

| Check | Result |
|-------|--------|
| Panel mounts | yes |
| No pageerror | yes |
| Title correct | yes |
| One API event per visible row | **no — each event duplicated once** |
| Event labels readable | yes (`Swap · MARCO / WBNB`) |
| Wallet shortened | yes (`0x4cc3…81a9`, etc.) |
| Relative time present | yes (`3d ago`, `4d ago`, `124d ago`) |
| Explorer URL hash correct | yes |
| No duplicate row | **no — 3 duplicate pairs** |
| No undefined/null/NaN | yes |

## Empty / loading / error behavior

**Observed case: CASE A — API HAS ROWS**

| Check | Result |
|-------|--------|
| Rows render | yes |
| Empty state absent | yes |
| Loading skeleton absent after load | yes |
| Compact unavailable absent | yes |

CASE B and CASE C not observed (API returned 3 rows successfully).

## View All

| Check | Result |
|-------|--------|
| Control present | yes |
| href | `/trade/` |
| Click responds | yes |
| Destination | `/trade/` (Trade route) |
| Error boundary | no |
| Dead interaction | no |

## Visual / geometry (activity panel only)

| Viewport | Horizontal page overflow | Panel border visible | Icon clipped | Overlap/clipping |
|----------|-------------------------|---------------------|--------------|------------------|
| 1440 | no | yes | no | no |
| 768 | no | yes | no | no |
| 390 | no | yes | no | no |

No horizontal overflow caused by the panel. No giant empty lower region or duplicated empty copy observed.

## Exact defect

**UI duplicate row rendering:** Production renders each of the 3 canonical API events twice in `[data-live-activity-row]` (6 DOM nodes / 3 unique transaction hashes at 1440×900). The API reports 0 duplicate keys. Row reconciliation fails because visible DOM count (6) does not match canonical API count (3), and duplicate visible rows violate PASS criteria.

This defect is **not fixed in this verification mission**.

## PASS criteria evaluation

| Criterion | Pass |
|-----------|------|
| Production ≥ b050b575 | yes |
| Panel mounts | yes |
| No pageerror | yes |
| Title matches timestamps | yes |
| Rows reconcile with API | **no — duplicated in UI** |
| Row limits respected (canonical count) | **no — 6 DOM rows for 3 API events** |
| No duplicate row | **no** |
| View All works | yes |
| No panel overflow at 3 viewports | yes |

## Screenshots

- `apps/web/docs/runtime/r791b3h-screenshots/homepage-activity-1440.png`
- `apps/web/docs/runtime/r791b3h-screenshots/homepage-activity-768.png`
- `apps/web/docs/runtime/r791b3h-screenshots/homepage-activity-390.png`

## Artifacts

- `apps/web/docs/runtime/r791b3h-activity-api-snapshot.json`
- `apps/web/docs/runtime/R791B_3H_HOMEPAGE_ACTIVITY_PRODUCTION_REVERIFICATION.md`
- `apps/web/docs/runtime/r791b3h-screenshots/` (3 PNGs)

## Next mission

**R791B.4A — POOLS PRODUCTION BASELINE ONLY**
