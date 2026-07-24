# LIQUIDITY_MODULE_004 — DEX Liquidity Snapshot

**Mission:** `LIQUIDITY_MODULE_004_DEX_SNAPSHOT`  
**Verdict:** `LIQUIDITY_MODULE_004_DEX_SNAPSHOT_CERTIFIED`  
**Branch:** `mission-liquidity-module-004-dex-snapshot`  
**Commit:** `26a9de43`  
**Push:** `origin/mission-liquidity-module-004-dex-snapshot`  
**Base:** `origin/mission-liquidity-module-003-add-card` @ `ba8b153c`

---

## Scope

Modified **only** the DEX Liquidity Snapshot card (plus tokens, guards, evidence).

| Locked module | Touched |
| --- | --- |
| Header / Trending / Hero | No |
| Liquidity Building Card | No |
| Add Liquidity Card | No |
| Overview / Positions / Education | No |
| Footer / Mobile Nav | No |
| **DEX Snapshot** | **Yes** |

Forbidden DEX cores: **untouched**.

---

## Desktop geometry (locked)

| Section | Target | Measured | Δ |
| --- | ---: | ---: | ---: |
| Header | 44 | 44 | 0 |
| Top KPIs | 76 | 76 | 0 |
| Chart | 132 | 132 | 0 |
| Footer | 72 | 72 | 0 |
| **Card** | **672 × 324** | **672 × 324** | **0** |

Section sum: `44+76+132+72 = 324`.

| Control | Target | Notes |
| --- | ---: | --- |
| KPI cards | 310 × 76 | Two equal; gap 12 |
| Donut (when indexed) | 132 × 132 | Left of chart row |
| Legend rows | 24 × 4 | Color / token / % / value — indexed only |

**Geometry deviation:** **0%** (target &lt; 3%).

---

## Mobile

| Viewport | Card height | Notes |
| --- | ---: | --- |
| 390 × 844 | natural (~500) | Chart stacks under KPIs; footer 3 rows; no clip |

---

## Data truthfulness

- TVL / 24H Volume from `useProtocolDataSWR` only — never fabricated
- Legend tokens from `useAllTokenHighLight` only — no hardcoded BNB / USDT / MARCO
- Footer Indexed Pools / Tokens / Last Sync from indexer health / indexed token count — `—` when unavailable
- Unavailable chart: compact centered illustration + Awaiting Indexer + Last Indexed Block + Last Attempt + Refresh (no black empty rectangle)
- No sparklines / fake charts

---

## Evidence

Directory: `apps/web/docs/runtime/liquidity-module-004-dex-snapshot/`

| Artifact | Path |
| --- | --- |
| Before / after desktop | `before-desktop-dex-snapshot.png` / `after-desktop-dex-snapshot.png` |
| Mobile | `before-mobile-dex-snapshot.png` / `after-mobile-dex-snapshot.png` |
| Overlay / diff | `overlay-desktop-dex-snapshot.png` / `diff-desktop-dex-snapshot.png` |
| DOM measurements | `dex-snapshot-measurements.json` |
| Certify script | `certify.mjs` |

Overlay vs pre-rebuild MAE ≈ **2.88%** of 255 (intentional layout change; geometry deviation **0%**).

---

## Validation

| Check | Result |
| --- | --- |
| Vitest (module 004 + one-page + pixel + module 003) | **23/23 passed** |
| `yarn next build` | **passed** |
| Playwright DOM certify | **pass** |
| Forbidden files | **untouched** |

---

## Files committed (mission-scoped)

- `apps/web/src/views/LiquidityStudio/onePage/DexLiquiditySnapshot.tsx`
- `apps/web/src/views/LiquidityStudio/onePage/onePageTokens.ts`
- `apps/web/src/views/LiquidityStudio/__tests__/liquidityModule004.dexSnapshot.test.ts`
- `apps/web/src/views/LiquidityStudio/__tests__/dexLiqOne002.onePage.test.ts`
- `apps/web/src/views/LiquidityStudio/__tests__/liquidityPixelPerfection001.test.ts`
- `apps/web/docs/runtime/LIQUIDITY_MODULE_004_DEX_SNAPSHOT_REPORT.md`
- `apps/web/docs/runtime/liquidity-module-004-dex-snapshot/*`

---

## Push / deploy

- Commit + push branch only
- No merge / no PR / no production deploy
