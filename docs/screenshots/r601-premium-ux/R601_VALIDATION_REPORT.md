# R601 — Premium UX Convergence Validation

**Status:** Local implementation complete — **no commit, no push**  
**Base:** `b8a9ec2` (R600 staging) + R601 working tree

## Build

| Check | Result |
|-------|--------|
| `yarn build` | Pass |

## Screenshots

Path: `docs/screenshots/r601-premium-ux/`

| File | Route |
|------|-------|
| `home-before-ref-home-desktop-1440.png` | `/` |
| `home-mobile-390.png` | `/` |
| `build-studio-desktop-1440.png` | `/build-studio` |
| `trade-desktop-1440.png` | `/trade` |
| `pools-desktop-1440.png` | `/pools` |
| `farms-desktop-1440.png` | `/farms` |
| `liquidity-desktop-1440.png` | `/liquidity-studio` |
| `radar-desktop-1440.png` | `/radar` |
| `collectibles-desktop-1440.png` | `/collectibles` |
| `projects-desktop-1440.png` | `/projects` |

---

## UX Fixes

| Area | Fix |
|------|-----|
| Home ribbon | Top Pool shows pair + APR (same pattern as Top Farm) |
| Home cards | Top Pool card: pair name + `APR X.XX%` meta |
| Build CTA | Single `Import & Analyze Token` → `/build-studio#build-import` |
| Grow panel | LABS/SPACE/RADAR/SMARTDROP → external `*.melega.ai` |
| Live Activity | Router txs: latest swap, LP add/remove, recent swaps (no Top Farm/Pool) |
| Trade | Limit Orders tab hidden |
| Trade swaps | Empty: `No swaps detected yet.` |
| Farms grid | Analyze ↔ Hide Analysis toggle |
| Farms KPI | `MARCO Emitted Today` (daily emission, not ambiguous "rewards") |
| Pools KPI | `Pool Rewards Today` |
| Radar nav/page | Renamed **DEX Intelligence** |
| Identity Hub | Page title **IDENTITY HUB**; collection preview images; premium detail layout |
| Build Studio | 3-col: Import \| Create Token+Farm+Pool \| Advisor; sidebar import hidden |
| Projects | Uses `buildDexTokenIndex` (MARCO + MXMX + BabyMarco + registry) |
| Trending | Discovery Engine → `/projects` |
| Command Center | Greeting responsive line-break fix |

---

## Runtime Fixes

| Area | Fix |
|------|-----|
| Pools LIVE | Requires meaningful reward budget + active emission/period |
| Pools APR | Clamp >50%; auto-MARCO cap 12%; never 0% on LIVE (`Calculating...`) |
| Pools ranking | Reward budget → APR → TVL |
| Liquidity Top Pools | Stop perpetual loading when subgraph txs resolved |
| Liquidity Activity | Empty: `No liquidity events yet.` |
| Liquidity layout | Builder / Preview / Right column min-height alignment |
| Projects index | `dexIndexToEnrichedProjects(buildDexTokenIndex())` |

---

## Issue Table

| Issue | Severity | Fixed | Remaining |
|-------|----------|-------|-----------|
| Top Pool ribbon missing APR | P0 | Yes | — |
| Top Pool card missing APR | P0 | Yes | — |
| Reward MARCO holders dead CTA | P0 | Yes | — |
| Grow links pointed locally | P0 | Yes | — |
| Live Activity showed farm/pool not router | P0 | Yes | Farm/pool stake txs not in subgraph |
| Limit Orders visible unimplemented | P0 | Yes | — |
| Recent swaps perpetual Indexing | P0 | Partial | Subgraph pair coverage |
| Pools impossible APR display | P0 | Yes | Clamped at 50% |
| Pools zero-reward still LIVE | P0 | Yes | ENDED when budget meaningless |
| Farms Analyze label inconsistent | P0 | Yes | — |
| MARCO Rewards Today ambiguous | P0 | Yes | Renamed Emitted Today |
| Radar vs radar.melega.ai ambiguity | P0 | Yes | DEX Intelligence |
| Only 3 projects indexed | P0 | Partial | Static DEX index; no runtime multicall |
| Identity detail JSON-first | P0 | Partial | Premium hero; manifest collapsed |
| Build Studio inefficient layout | P0 | Yes | — |
| Sidebar duplicate import entry | P0 | Yes | Hidden, route preserved |
| Trade chart/holders from subgraph | P0 | No | CoinGecko partial (R600) |
| Home ticker + cards duplication | P1 | No | Still overlaps |
| Liquidity crash `LoadingLine` | P0 | Yes | PositionPreviewPanel |
| Pixel-perfect all breakpoints | P2 | Partial | Founder review |

---

## Remaining Blockers

1. **Subgraph** — Melega-native swap/LP/farm stake indexing still limits Trade, Live Activity farm stakes, and chart depth.
2. **DEX token index** — MXMX/BabyMarco + registry static; full farm/LP union needs runtime multicall.
3. **Trade holders** — BscScan API not configured.
4. **Home deduplication** — Ticker + QuickMarketStrip still show overlapping Top Farm/Pool.
5. **Identity NFT market data** — Floor/volume unavailable from public APIs.

---

## Git

| Target | Status |
|--------|--------|
| Commit | **None** |
| Push | **None** |
| Staging | Unchanged until approval |
