# FARMS_MODULE_001_HERO_REPORT

## 1. Final verdict

**FARMS_MODULE_001_HERO_CERTIFIED**

## 2. Branch

`farms-module-001-hero`

## 3. Mission commit

_(stamped after commit)_

## 4. Certified base

| | |
| --- | --- |
| Architecture | `FARMS_ARCHITECTURE_000_CERTIFIED` |
| Branch | `farms-architecture-000` |
| Tip | `8edd68d4` |
| Lock commit | `bd655190` |

## 5. Worktree

`/Users/marcomelega/Projects/MelegaSwapV2-farms-m001`

## 6. Founder mockup integrity

| | |
| --- | --- |
| Path | `farms-architecture-000/farms-founder-mockup-lock.png` |
| SHA-256 | `a19e506f7d7a5194050d52481f0b220bad30e4a774e3fde2529b37e830db848a` |
| Bytes | 148024 |
| Pass | **yes** (byte-identical) |

## 7. Architecture freeze

Architecture 000 contracts and mockup SHA remain frozen.  
`/farms` still mounts `FarmsStudioScreen` (no `FarmsArchitectureShell`).  
Modules 002–008 are not mounted. Legacy body (Your Farms, KPIs, Featured, Explore band, Grid, Activity) retained under Hero until Integration 009.

## 8. Files changed

- `views/FarmsStudio/modules/FarmsHeroModule.tsx`
- `views/FarmsStudio/modules/FarmsHeroArtwork.tsx`
- `views/FarmsStudio/modules/FarmsHeroTrustPanel.tsx`
- `views/FarmsStudio/modules/farmsHeroTokens.ts`
- `views/FarmsStudio/FarmsStudioScreen.tsx` (mount point only)
- `views/FarmsStudio/__tests__/farmsModule001.hero.test.ts`
- `views/FarmsStudio/__tests__/farmsArchitecture000.mockupLock.test.ts` (freeze assertion updated for Hero mount)
- `docs/runtime/FARMS_MODULE_OWNERSHIP_MAP.md` (Module 001 file assignment)
- `docs/runtime/farms-module-001-hero/*` evidence
- `docs/runtime/FARMS_MODULE_001_HERO_REPORT.md`

## 9. Hero ownership

Module 001 owns orientation only: title, description, Explore Farms CTA, LP→Farm→Reward artwork, trust panel.  
Legacy `FarmsStudioPageHeader` superseded to avoid duplicate Farms titles.  
No runtime queries. No APR / TVL / rewards / wallet balances in Hero.

## 10. Desktop geometry

Primary viewport 1440×1200 — **DOM-measured**:

| Metric | Target | Pass |
| --- | --- | --- |
| Hero width | 1376 ±2 | yes |
| Hero height | 260 ±2 | yes |
| Top gap after stack | 24 ±2 | yes |
| Left | 440 ±2 | yes |
| Artwork | 480×230 ±3 | yes |
| Trust | 360×230 ±3 | yes |
| Column gaps | 48 ±2 | yes |

Evidence: `farms-module-001-hero/geometry-measurements.json`

## 11. Tablet behavior

At 1024: left + artwork row, trust panel full width below. No horizontal overflow.

## 12. Mobile geometry

| Viewport | Content width | Overflow |
| --- | --- | --- |
| 390 | 358 ±4 | none |
| 430 | 398 ±4 | none |

Stack: title → actions → artwork → trust.

## 13. Hero copy

- Title: **Farms**
- Description: **Stake LP tokens. / Earn farming rewards. / Grow liquidity.**
- Trust title: **Why Farm on Melega DEX?**
- Trust rows: LP-Powered Yield · Transparent Rewards · Flexible Management · On-Chain Ownership

Forbidden claims not shipped: Guaranteed rewards / Highest APR / Risk-free farming.

## 14. Artwork implementation

Local SVG in `FarmsHeroArtwork.tsx` (decorative, `aria-hidden`).  
Communicates **LP Pair → Farm → Reward Token**. Distinct from Pools hero artwork. No fake rates/balances.

## 15. Explore Farms destination

`#explore-farms` — reserved Module 004 domain anchor.  
Temporary legacy destination: on-page `#explore-farms` band (existing featured/explore grid). Fallback documented: `/farms#explore-farms`. Not a dead button.

## 16. How Farming Works destination

**Omitted honestly.** No dedicated factual How Farming Works destination exists on-site. No blank modal. No new explanatory content authored in this mission.

## 17. Accessibility

Semantic `section` + `h1`; trust panel labelled; decorative artwork hidden from AT; focus rings 2px gold / 2px offset; touch targets ≥44px. Keyboard Enter on Explore Farms scrolls to `#explore-farms`.

## 18. Reduced motion

Module disables animations/transitions under `prefers-reduced-motion`. Scroll uses `auto` when reduced motion is preferred.

## 19. Runtime independence

Hero renders without farm runtime queries for: wallet disconnected / connected, unsupported chain, runtime unavailable, MasterChef unavailable.

## 20. Tests / build

| Gate | Result |
| --- | --- |
| Focused Vitest (14) | passed |
| `yarn build` | passed |
| DOM certify (1440/1024/430/390) | passed |
| Forbidden files untouched | yes |

## 21. Delivery

| | |
| --- | --- |
| Push | `origin/farms-module-001-hero` |
| Merge | none |
| Deploy | none |

## 22. Next authorized mission

`FARMS_MODULE_002_OVERVIEW_KPIS`
