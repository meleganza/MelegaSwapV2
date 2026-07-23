# LIQUIDITY_MODULE_006 — Your Positions

**Mission:** `LIQUIDITY_MODULE_006_POSITIONS`  
**Verdict:** `LIQUIDITY_MODULE_006_POSITIONS_CERTIFIED`  
**Branch:** `mission-liquidity-module-006-positions`  
**Commit:** _(filled on push)_  
**Base:** `origin/mission-liquidity-module-005-wallet-overview` @ `17c5cca6`

---

## Scope

Modified **only** Your Positions (`LiquidityPositions.tsx` + tokens + tests + evidence).

| Locked module | Touched |
| --- | --- |
| Header / Trending / Hero | No |
| LB / Add / Snapshot / Overview | No |
| Education / Footer / Mobile Nav | No |
| UnifiedLiquidityPage | No (prop names accepted as already wired) |
| **Your Positions** | **Yes** |

---

## Desktop geometry

| Element | Target | Measured |
| --- | ---: | ---: |
| Module width | 1376 | 1376 |
| Chrome header | 64 | 64 |
| Table header | 52 | 52 |
| Row | 68 | 68 |
| Padding | 16 | 16 |

Geometry deviation: **0%** (< 3%).

Chrome contains: Title · Filters · Search · **Hide Closed** only.

Table columns: Pair · Type · Value · Pool Share · Fees · Status · Actions.

No expandable rows. Max two visible action buttons + overflow menu.

---

## Behavior

- **LB Manage** → `onManageLb` / `onOpenBuilding` + `setMode('Liquidity Building')` — no building query navigation.
- **Manual Add** → `onAddManual` / `onAddLiquidity` + Add Liquidity mode (parent scrolls).
- Fees unavailable → `—`.
- Empty → centered “No Positions Yet” + Add Liquidity.
- Mobile → compact cards, not table.

---

## Evidence

`apps/web/docs/runtime/liquidity-module-006-positions/`

- `desktop-disconnected.png`
- `desktop-mixed-positions.png`
- `desktop-with-closed.png`
- `mobile-390-empty.png`
- `mobile-390-mixed-positions.png`
- `desktop-overlay.png`
- `geometry-measurements.json`

Localhost-only `__LIQ_MODULE_006_FIXTURE__` for mixed-state screenshots (not production data).

---

## Validation

| Check | Result |
| --- | --- |
| Vitest (module 006 + pixel + one-page) | **18/18 passed** |
| `yarn next build` | **passed** |
| Playwright certify | **pass** |
| Forbidden / locked modules | **untouched** |

---

## Push / deploy

Commit + push branch only. No merge / no deploy. Working tree clean.
