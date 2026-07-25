# FARMS_MODULE_002_OVERVIEW_KPIS_REPORT

## 1. Final verdict

**FARMS_MODULE_002_OVERVIEW_KPIS_CERTIFIED**

## 2. Branch

`farms-module-002-overview-kpis`

## 3. Mission commit

_(stamped after commit)_

## 4. Certified base

| | |
| --- | --- |
| Module 001 | `FARMS_MODULE_001_HERO_CERTIFIED` |
| Branch | `farms-module-001-hero` |
| Tip | `21c2c0bb` |
| Mission commit | `3cf49b34` |
| Architecture | `8edd68d4` |

## 5. Worktree

`/Users/marcomelega/Projects/MelegaSwapV2-farms-m002`

## 6. Module 001 freeze

Hero owned files remain byte-identical to Module 001 tip:

| File | SHA-256 |
| --- | --- |
| FarmsHeroModule.tsx | `d9c56b4f…640b` |
| FarmsHeroArtwork.tsx | `a0e3e588…bc16` |
| FarmsHeroTrustPanel.tsx | `ce9af36c…270c` |
| farmsHeroTokens.ts | `eb192bfa…a06c` |

Founder mockup SHA unchanged: `a19e506f7d7a5194050d52481f0b220bad30e4a774e3fde2529b37e830db848a`.

## 7. Files changed

- `modules/FarmsOverviewKpisModule.tsx`
- `modules/useFarmsOverviewKpis.ts`
- `modules/buildFarmsOverviewKpis.ts`
- `modules/farmsOverviewKpisTokens.ts`
- `modules/farmsOverviewKpisTypes.ts`
- `FarmsStudioScreen.tsx` (mount Module 002 under Hero; supersede `FarmsKpiRow` strip)
- `__tests__/farmsModule002.overviewKpis.test.ts`
- Module 001 / Arch000 tests updated for Module 002 mount allowance
- `FARMS_MODULE_OWNERSHIP_MAP.md`
- `farmsArchitecture000Contracts.ts` (002 phase)
- `docs/runtime/farms-module-002-overview-kpis/*`
- `FARMS_MODULE_002_OVERVIEW_KPIS_REPORT.md`

## 8. KPI order (exactly six)

1. Total Farm TVL  
2. Active Farms  
3. Active Farmers  
4. 24H Rewards  
5. Highest Sustainable APR  
6. My Harvestable  

## 9. Desktop geometry (DOM-measured @ 1440)

| Metric | Target | Pass |
| --- | --- | --- |
| Module | 1376×112 | yes |
| Card | 216×112 | yes |
| Gap | 16 | yes |
| Gap after Hero | 16 | yes |

## 10. Factual rules

| KPI | Behavior |
| --- | --- |
| TVL | LP farm `liquidity` only; excludes Pools / pid 0; partial disclosed |
| Active Farms | Live/indexing farmable LP farms only |
| Active Farmers | `—` · Unique wallet data unavailable (never estimate) |
| 24H Rewards | `—` · Reward valuation unavailable (emission not used) |
| Highest Sustainable APR | Max among rewarding live farms with positive liquidity |
| My Harvestable | Disconnected → `—` / Connect wallet; connected zero → `$0.00` / No harvest after successful reads |

## 11. Source independence

Each KPI fails independently. Unavailable Active Farmers + 24H Rewards do not collapse the strip (six cards always rendered).

## 12. Mobile

| Viewport | Card width | Columns | Overflow |
| --- | --- | --- | --- |
| 390 | ~171 | 2 | none |
| 430 | ~191 | 2 | none |

No carousel.

## 13. Tests / build

| Gate | Result |
| --- | --- |
| Focused Vitest (26) | passed |
| `yarn build` | passed |
| DOM certify | passed |
| Module 001 freeze | passed |
| Forbidden files untouched | yes |

## 14. Delivery

| | |
| --- | --- |
| Push | `origin/farms-module-002-overview-kpis` |
| Merge | none |
| Deploy | none |

## 15. Next authorized mission

`FARMS_MODULE_003_MY_FARMS`
