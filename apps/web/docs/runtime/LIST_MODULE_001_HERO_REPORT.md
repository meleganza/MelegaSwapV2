# LIST_MODULE_001_HERO — Report

## 1. Verdict

**LIST_MODULE_001_HERO_CERTIFIED**

## 2. Branch

`mission-list-module-001-hero`

## 3. Commit

`5efbc4e8`

## 4. Base

`origin/mission-liquidity-module-007-visual-polish` @ `74b4f2e4`

## 5. Exact image source

| Role | Path |
| --- | --- |
| Chat attachment (immutable) | Cursor assets `Generated_image_1__12_-8ef34bcc-3969-4855-b33e-4c2181199e1c.png` |
| Evidence archive | `apps/web/docs/runtime/list-module-001-hero/approved-design-source.png` |
| Hero background | `apps/web/public/images/list/list-hero-background.png` |
| Hero artwork | `apps/web/public/images/list/list-hero-artwork.png` |

SHA-256 (approved design source):

`172ad3d5b78503f73103b3d6d829fca1939631b2b3d58d2773402972eed308c4`

Background / artwork are founder-derived crops from the approved design board (left content masked on background to `#101010` so HTML stats can show `—` honestly). Artwork displayed with `object-fit: contain` — no CSS crop of the asset.

## 6. Scope

| Surface | Touched |
| --- | --- |
| Header / Trending Bar / Footer / Nav / Shell | **No** |
| Import / Create / Claim / Forms / AI / Cards / Workflow | **No** (not mounted) |
| **List Hero** | **Yes** |

`/list` mounts hero-only shell (`ListPageHero`).

## 7. Desktop measurements (1440)

| Metric | Target | Actual | Pass |
| --- | ---: | ---: | --- |
| Header height | 72 | 72 | ✓ |
| Trending Bar height | 44 | 44 | ✓ |
| Trending→Hero gap | 24 | 24 | ✓ |
| Hero width | 1376 | 1376 | ✓ |
| Hero height | 360 | 360 | ✓ |
| Hero left | 32 | 32 | ✓ |
| Hero right margin | 32 | 32 | ✓ |
| Artwork frame | 560×320 | 560×320 | ✓ |
| Stat cards | 120×72 ×4 | 120×72 ×4 | ✓ |
| Headline width | 520 | 520 | ✓ |
| Description width | 480 | 480 | ✓ |
| Overflow X | none | none | ✓ |
| Background | list-hero-background.png | exact | ✓ |
| Artwork | list-hero-artwork.png | exact | ✓ |
| Fake stats | none | `—` | ✓ |

Geometry deviation: **0%** (< 3%).

## 8. Mobile measurements (390)

| Metric | Target | Actual | Pass |
| --- | ---: | ---: | --- |
| Hero width | 358 | 358 | ✓ |
| Hero height | auto | 666 (auto) | ✓ |
| Stack | text → art → stats 2×2 | confirmed | ✓ |
| Overflow X | none | none | ✓ |

## 9. Overlay / bounding boxes

Evidence under `apps/web/docs/runtime/list-module-001-hero/`:

- `desktop-1440-hero.png`
- `desktop-hero-module.png`
- `desktop-overlay.png`
- `desktop-bounding-boxes.png`
- `mobile-390-hero.png`
- `geometry-measurements.json`

## 10. Files

- `apps/web/public/images/list/list-hero-background.png`
- `apps/web/public/images/list/list-hero-artwork.png`
- `apps/web/src/views/ListStudio/ListPageHero.tsx`
- `apps/web/src/views/ListStudio/listTokens.ts`
- `apps/web/src/views/ListStudio/useListHeroStats.ts`
- `apps/web/src/views/ListStudio/ListStudioScreen.tsx` (hero-only shell)
- `apps/web/src/views/ListStudio/__tests__/listModule001.hero.test.ts`
- `apps/web/src/app-shell/__tests__/dexUxRebuild.nav.test.ts` (expects `ListPageHero`)
- `apps/web/docs/runtime/list-module-001-hero/*`
- `apps/web/docs/runtime/LIST_MODULE_001_HERO_REPORT.md`

## 11. Validation

| Check | Result |
| --- | --- |
| Vitest listModule001 + nav | **passed** |
| `yarn next build` (`turbo --filter=web`) | **passed** |
| Playwright certify | **passed** |
| Forbidden DEX core | **untouched** |

## 12. Certification

`LIST_MODULE_001_HERO_CERTIFIED`
