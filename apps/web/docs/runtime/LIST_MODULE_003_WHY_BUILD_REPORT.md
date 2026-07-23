# LIST_MODULE_003 — Why Build on Melega

## 1. Verdict

**LIST_MODULE_003_WHY_BUILD_CERTIFIED**

## 2. Branch

`mission-list-module-003-why-build`

## 3. Commit

_(filled after commit)_

## 4. Certified base verification

| Check | Result |
| --- | --- |
| Base tip | `50538dd6` (Module 002) |
| Ancestor | **yes** |
| `ListPageHero.tsx` | **untouched** |
| `ListActionCards.tsx` | **untouched** |
| `useListIntent.ts` | **untouched** |
| Header / Trending / shell | **untouched** |

Page composition uses flex `order` so Why sits 24px under Action Cards while the Module 002 intent placeholder remains below Why — without editing `ListActionCards.tsx`.

## 5. Files changed

- `apps/web/src/views/ListStudio/ListWhyBuildRail.tsx` (new)
- `apps/web/src/views/ListStudio/listTokens.ts` (MODULE_003 geometry tokens only)
- `apps/web/src/views/ListStudio/ListStudioScreen.tsx` (mount + order)
- `apps/web/src/views/ListStudio/__tests__/listModule003.whyBuild.test.ts` (new)
- `apps/web/src/views/ListStudio/__tests__/listModule002.actionCards.test.ts` (allow Why mount on screen)
- `apps/web/docs/runtime/list-module-003-why-build/*`
- `apps/web/docs/runtime/LIST_MODULE_003_WHY_BUILD_REPORT.md`

## 6. Desktop geometry (1440, measured)

| Metric | Target | Actual |
| --- | ---: | ---: |
| Cards → Why gap | 24 | 24 |
| Module | 1376×112 | 1376×112 |
| Inner | 1344×80 | 1342×80 (±2) |
| Intro | 220×80 | 220×80 |
| Benefits | 265×80 | 265×80 |
| Gaps | 16 | 16 |
| Icon tiles | 44×44 | 44×44 |
| Hero regression | 1376×360 | 1376×360 |
| Cards regression | 1376×272 | 1376×272 |

Deviation: **&lt; 3%** (inner width 1342 within ±2px).

## 7. Tablet geometry (1024)

Intro full-width; 2-column benefit grid; benefit height 72px; no five-across compression. Screenshot: `tablet-1024.png`.

## 8. Mobile geometry (390, measured)

| Metric | Target | Actual |
| --- | ---: | ---: |
| Module width | 358 | 358 |
| Benefit rows | 64 | 64 |
| Gaps | 10 | 10 |
| Overflow X | none | none |
| Auto height | 360–410 | in range |

## 9. Benefit copy

1. Full Ecosystem Access — Liquidity, Farms, Pools, SmartDrop, Radar and more.
2. AI-Powered Guidance — Smart assistance helps prepare and improve your project information.
3. Verified & Secure — Built-in tools support verification, ownership checks and safer publishing.
4. Community Driven — Gain visibility and connect with the wider Melega builder community.

## 10. Claim integrity

No guaranteed reach, automatic verification, or AI ownership/publish claims. Informational rail only (no buttons).

## 11. Accessibility

Semantic `section` + `h2` + `ul`/`li`; decorative icons `aria-hidden`; contrast via `#F5F5F5` / `#A8A8A8` on dark rail. Evidence: `accessibility-validation.json`.

## 12. Tests

Vitest MODULE_001 + 002 + 003: **19/19 passed**  
Playwright certify: **passed**

## 13. Typecheck

Passed via `yarn next build` compilation.

## 14. Build

`yarn next build` — **passed**

## 15. Evidence paths

`apps/web/docs/runtime/list-module-003-why-build/`

- `desktop-1440.png`
- `tablet-1024.png`
- `mobile-390.png`
- `desktop-overlay.png`
- `desktop-diff.png`
- `geometry-measurements.json`
- `accessibility-validation.json`
- `certify.mjs`

## 16. Deviations

Inner content width measured 1342px vs 1344px target (within ±2px tolerance). No other material deviations.

## 17. Working-tree status

_(filled after push)_

## Certification

`LIST_MODULE_003_WHY_BUILD_CERTIFIED`
