# POOLS_MODULE_001_HERO_REPORT

## 1. Final verdict

**POOLS_MODULE_001_HERO_CERTIFIED**

## 2. Branch

`pools-module-001-hero`

## 3. Mission commit

`c2310473a92d0f1eb73f6d17e53ee4c7d8b7aabf`

## 4. Certified base

| | |
| --- | --- |
| Architecture | `POOLS_ARCHITECTURE_000_CERTIFIED` |
| Branch | `pools-architecture-000-mockup-lock` |
| Tip | `f1d1fd11` |
| Lock commit | `1c86c8eb` |

## 5. Worktree

`/Users/marcomelega/Projects/MelegaSwapV2-pools-m001`

## 6. Founder mockup integrity

| | |
| --- | --- |
| Path | `pools-architecture-000/pools-founder-mockup-lock.png` |
| SHA-256 | `549ca3bb663315730945de4ada9bc36559399cf3e9ce72a59de4d10f89558d4f` |
| Bytes | 166617 |
| Pass | **yes** (byte-identical) |

## 7. Architecture freeze

Architecture 000 contracts, mockup SHA, and page entry (`pages/pools` → `PoolsStudioScreen`) remain frozen. Modules 002–010 are not mounted. No `PoolsArchitectureShell` cutover.

## 8. Files changed

- `views/PoolsStudio/modules/PoolsHeroModule.tsx`
- `views/PoolsStudio/modules/PoolsHeroArtwork.tsx`
- `views/PoolsStudio/modules/PoolsHeroTrustPanel.tsx`
- `views/PoolsStudio/modules/poolsHeroTokens.ts`
- `views/PoolsStudio/PoolsStudioScreen.tsx` (mount point only)
- `views/PoolsStudio/__tests__/poolsModule001.hero.test.ts`
- `docs/runtime/POOLS_MODULE_OWNERSHIP_MAP.md` (file assignment)
- `docs/runtime/pools-module-001-hero/*` evidence
- `docs/runtime/POOLS_MODULE_001_HERO_REPORT.md`

## 9. Hero ownership

Module 001 owns orientation only: title, description, CTAs, artwork, trust panel.  
Legacy Studio body (Your Pools, KPIs, Featured, Explore, Create Pool builder, below-fold) remains mounted beneath.  
Legacy `PoolsStudioPageHeader` superseded to avoid duplicate Pools titles.

## 10. Desktop geometry

Primary viewport 1440×1200 — **DOM-measured**:

| Metric | Target | Measured | Pass |
| --- | --- | --- | --- |
| Hero width | 1376 ±2 | 1376 | yes |
| Hero height | 260 ±2 | 260 | yes |
| Top gap after stack | 24 ±2 | 24 | yes |
| Left | 440 ±2 | 440 | yes |
| Artwork | 480×230 ±3 | 480×230 | yes |
| Trust | 360×230 ±3 | 360×230 | yes |
| Column gaps | 48 ±2 | 48 / 48 | yes |

## 11. Tablet behavior

At 1024: left + artwork row, trust panel full width below. No three-column squeeze. No horizontal overflow.

## 12. Mobile geometry

| Viewport | Content width | Hero height | Overflow |
| --- | --- | --- | --- |
| 390 | 358 | 650 (max) | none |
| 430 | 398 | 650 (max) | none |

Stack: title → actions → artwork → trust. Safe bottom padding retained via legacy mobile bottom pad.

## 13. Hero copy

- Title: **Pools**
- Description: **Stake tokens. Earn rewards. On your terms.**
- Trust title: **Why Stake on Melega DEX?**
- Factual trust rows (Security-first / Sustainable Rewards / Flexible Options / Transparent Fees)

Documented deviations from mockup audit-style claims: see `POOLS_HERO_COPY_DEVIATIONS` in `poolsHeroTokens.ts`.

## 14. Artwork implementation

Local SVG composition in `PoolsHeroArtwork.tsx` (decorative, `aria-hidden`).  
Does **not** embed the Founder mockup screenshot. No readable fake APR/balances/counts.

## 15. Trust-panel semantics

`aside` with labelled title + list rows; concise factual supporting lines; no guaranteed returns / universal audit claims.

## 16. Create Pool destination

`#create-pool` (on-page `CreatePoolCta` builder). Fallback documented: `/build-studio?intent=staking-pool#create-pool`. Not a dead button. Pool creation logic not implemented in Module 001.

## 17. How it Works destination

Rendered (Architecture 000 / Module 001 ownership reserves the CTA).  
Behavior: scrolls to `#create-pool` as the factual guided entry until a dedicated How it Works section exists. No blank modal. No new explanatory content authored in this mission.

## 18. Accessibility

Semantic `section` + `h1`; trust panel labelled; decorative artwork hidden from AT; focus rings 2px gold / 2px offset; touch targets ≥44px.

## 19. Reduced motion

Module disables animations/transitions under `prefers-reduced-motion`. Scroll uses `auto` when reduced motion is preferred.

## 20. Runtime independence

Hero uses no pools runtime hooks, wallet portfolio, APR, TVL, or factory reads. Stable when wallet disconnected / factory unavailable.

## 21. Tests

13 focused tests passed (`poolsModule001.hero` + `poolsArchitecture000.mockupLock`).

## 22. Typecheck

Mission-path covered via `next build` (repo policy).

## 23. Build

`yarn next build` — **passed**.

## 24. Evidence

`apps/web/docs/runtime/pools-module-001-hero/`

## 25. Deviations

1. Trust copy tightened for factual correctness vs mockup “audited / maximum returns” language (documented).
2. How it Works targets `#create-pool` pending a dedicated explanatory module.
3. Artwork is Module-001-owned SVG, not a crop of the Founder mockup.

## 26. Factual blockers

None for Module 001 certification.

## 27. Working-tree status

Clean after push.

## 28. Exact next mission

**POOLS_MODULE_002_OVERVIEW_KPIS**

Implement Overview KPIs only against the Founder mockup. Preserve Module 001 geometry. Do not rebuild My Positions / Explore / Finished.
