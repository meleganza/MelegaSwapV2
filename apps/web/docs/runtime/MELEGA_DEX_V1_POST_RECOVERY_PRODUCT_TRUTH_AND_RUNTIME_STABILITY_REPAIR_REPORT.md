# MELEGA_DEX_V1_POST_RECOVERY_PRODUCT_TRUTH_AND_RUNTIME_STABILITY_REPAIR

## CRASH RECOVERY

- **Crash point:** Cursor interrupted while implementing Pools last-good retention + Liquidity discovery truth, after Smart Swap Instant|Smart restoration had already been applied from certified tip `95c1cbf4`.
- **Worktree:** `/Users/marcomelega/Projects/MelegaSwapV2-post-recovery-truth`
- **Mission branch:** `melega-dex-v1-post-recovery-product-truth-and-runtime-stability-repair`
- **Recovered HEAD (safety):** `78772fe33307f605a2eb795ac4893f1774bf8131`
- **Safety branch:** `safety/melega-dex-v1-post-recovery-crash-recovery-20260727-215502`
- **Safety commit message:** `safety: preserve post-recovery P0 crash state`
- **Production base at recovery:** live tip `e51e7efd` (buildId `BXHRorPyGCTkN7YjSBxUF`). Older SHA `cde70867` / buildId `0puv09Bvgf-cb1t455Xm3` was **not** the live production tip at crash-recovery time.
- **Partial implementation preserved (not discarded):**
  - `buildPoolsWalletPositions.ts` — stale empty rejection, claimable merge, USD unavailable
  - `liquidityPoolDiscoveryModel.ts` — symbol/status/quality scaffolding
  - `TradeModeSelector.tsx` + `swapExperience.ts` — Instant | Smart
- **Completed after crash:** module-level Pools cache + AbortController, Farms/Pools Hero compact featured + trust `height: auto`, Farms 24h emission KPI, Pools Total Pools partition + claimable USD copy, Top Movers credibility gate, Liquidity market-quality default sort + never address-as-title.
- Evidence: `apps/web/docs/runtime/melega-dex-v1-post-recovery-product-truth-and-runtime-stability-repair/`

## Product repairs

### A. Smart Swap
- Labels restored to **Instant** | **Smart** (no STANDARD / SMARTSWAP NEW / explanatory paragraph).
- Browser gate: Instant+Smart present; Smart tab click shows Route/Details path.

### B. Liquidity
- Pair titles resolve via canonical registry + asset registry; unresolved tokens labeled `Unknown` (never `0x…` as primary title).
- Status: Active / Inactive / Empty / New / Unavailable with reasons.
- Default sort: **Market quality** (active + resolved identity + TVL/volume).

### C. Farms
- Why Farm trust panel `height: auto` (no fixed clip).
- Compact Featured Farm in Hero trust column; 24px gaps.
- Position card: factual USD primary, LP secondary; harvestable USD unavailable when unpriced.
- **24h Rewards:** MasterChef emission `perDay` when ready.
- **Active Farmers:** remains honest `Unique wallet data unavailable` (no unique-wallet participation index without estimating).

### D. Pools
- Wallet-scoped last-good via module `Map` keyed `chainId:normalizedWallet`.
- Generation sequencing + AbortController cancel commit path; remount does not clear module cache.
- Stale empty / zeroed refresh cannot overwrite last-good.
- Claimable token amount retained when USD valuation fails (`USD value unavailable`).
- Hero: compact Featured Pool + Why Stake `height: auto`; KPI **Total Pools**.

### E. Top Movers
- Ribbon label **TOP MOVERS**.
- Removed full multi-day OHLCV history fallback (root cause of false MARCO −49.1%).
- `isCredibleMoverChange` rejects extreme unproven percentages.
- Headless browser: “Market activity unavailable” when <2 factual movers (no padding / no false animation).

## Validation

| Gate | Result |
|------|--------|
| Focused Vitest | **67 passed** / 7 files |
| `yarn next build` | **passed** |
| Browser labels Instant\|Smart | **pass** |
| Browser Top Movers label | **pass** |
| Responsive overflow (5 viewports) | **pass** |
| Liquidity no address pair titles | **pass** |
| Farms/Pools Hero mounted | **pass** |
| Pools 3-cycle with connected wallet positions | **not proven in headless** (no wallet; module + connect state only) |
| Forbidden economic/contract files | **untouched** |

## Deploy authorization

Merge/deploy retained only if every mission gate passes. Headless validation could not prove wallet-connected Pools position stability across three cycles, and Active Farmers remains unavailable without a factual unique-wallet index. Therefore production merge/deploy is **blocked** pending founder-connected wallet cycle confirmation (or an approved participation index source).

## Verdict

See final line of mission response.
