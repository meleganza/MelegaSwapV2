# MELEGASWAP_V2_RELEASE_LINEAGE_INTEGRATION

## Verdict

**MELEGASWAP_V2_RELEASE_LINEAGE_INTEGRATED**

## Lineage

| Role | Branch / commit |
|------|-----------------|
| Base tip | `b93f9762` (`mission-pools-final-product-consistency`) — Pools Final + Project Page V7 |
| Merged tip | `934df141` (`mission-liquidity-studio-final-product-polish`) — Liquidity Final |
| Merge-base | `4a5d55ab` (Project Page V6 Founder Pixel Perfect) |
| Integration branch | `mission-release-lineage-integration` |
| Merge commit | `50d8ca6f` (parents: `b93f9762` + `934df141`, explicit merge, no squash/rebase) |

Project Page V7 commit `0c94102c` is an ancestor of the base tip.

## Conflicts

All content conflicts were under `PoolsStudio`. Resolution preference: **Pools final (`--ours`)**.

See `conflicts-resolved.md` for the full file list. Summary:

| Area | Preserved |
|------|-----------|
| Pools My Positions | 4-card preview, inline View all, Cards\|List |
| Pools Explore | Compact toolbar, Cards\|List, Manage removed |
| Freeze token modules / P09 tests | Pools final hashes + assertions |
| Liquidity Studio | Taken from `934df141` (clean merge) |
| Project Page V7 | Retained from base (no conflicts) |

### Post-merge shared restores

Liquidity tip had overwritten shared Home/Pools surfaces that are certified on the Pools/V7 line. Restored from `b93f9762`:

- `PoolsOverviewKpisModule.tsx`
- `PoolsExplorePoolCard.tsx`
- `PoolsMyPositionCard.tsx`
- `poolsMyPositionsTokens.ts`
- `useGetTopPoolsByApr.tsx`
- `useHomeTradeData.ts`

Liquidity **test** expectations were aligned to Liquidity final polish copy (not product redesign / not fee formula changes).

## Product status

| Line | Status |
|------|--------|
| Project Page V7 | **PASS** — `/@marco` + `/token/{chain}/{address}` mount `ProjectPageV7Shell`; canonical href resolver retained |
| Pools Final | **PASS** — preview 4, View all inline, Cards/List, Manage removed, compact toolbar, Create Pool portal, Home Top Pools restored |
| Liquidity Final | **PASS** — `LiquidityStudioV3Shell` mounted; final polish / remove repair / tab stability suites green |

## No silent regressions

Entrypoints verified:

- `pages/project-hq/[slug].tsx` → V7 (not V6/V5)
- `pages/token/[chain]/[address].tsx` → V7 unclaimed
- `pages/liquidity.tsx` → LiquidityStudioV3Shell
- `pages/pools/index.tsx` → PoolsStudioScreen

Historical V5/V6 components remain on disk but are not mounted.

## Forbidden surfaces

Untouched for this mission:

- Smart Swap engine, AMM/router, contracts, Treasury, fee economics, wallet execution, Data Truth formulas

## Validation

| Gate | Result |
|------|--------|
| Required vitest matrix | PASS (266 + 13 + 29 + 43 core suites) |
| `yarn next build` | PASS |
| Browser acceptance | PASS — see `browser-acceptance.json` |

## Evidence

`apps/web/docs/runtime/melegaswap-v2-release-lineage-integration/`

- `PRE_MERGE.md`
- `REPORT.md`
- `conflicts-resolved.md`
- `integrated-invariants.json`
- `tests.json`
- `build.json`
- `browser-acceptance.json`
- `screenshots/`

## Out of scope

Farms implementation was **not** started.
