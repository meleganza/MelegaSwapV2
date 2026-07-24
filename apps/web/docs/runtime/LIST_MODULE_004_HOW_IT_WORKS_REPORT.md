# LIST_MODULE_004 — How It Works

## 1. Verdict

**LIST_MODULE_004_HOW_IT_WORKS_CERTIFIED**

## 2. Branch

`mission-list-module-004-how-it-works`

## 3. Commit

63b35163

## 4. Certified base verification

| Check | Result |
| --- | --- |
| Base tip | `10c37d62` (Module 003) |
| Ancestor | **yes** (`git merge-base --is-ancestor 10c37d62 HEAD`) |
| Worktree | `/Users/marcomelega/Projects/MelegaSwapV2-list-how004` |

## 5. Frozen-module integrity

Byte-identical vs `10c37d62` (see `list-module-004-how-it-works/frozen-modules-integrity.json`):

| File | Unchanged |
| --- | --- |
| `ListPageHero.tsx` | **yes** |
| `ListActionCards.tsx` | **yes** |
| `useListIntent.ts` | **yes** |
| `ListWhyBuildRail.tsx` | **yes** |

Desktop regression boxes (Playwright): Hero 1376×360, Cards 1376×272, Why 1376×112 — all exact.

## 6. Files changed

- `apps/web/src/views/ListStudio/ListHowItWorks.tsx` (new)
- `apps/web/src/views/ListStudio/listTokens.ts` (MODULE_004 tokens only)
- `apps/web/src/views/ListStudio/ListStudioScreen.tsx` (mount + flex order)
- `apps/web/src/views/ListStudio/__tests__/listModule004.howItWorks.test.ts` (new)
- `apps/web/docs/runtime/list-module-004-how-it-works/*`
- `apps/web/docs/runtime/LIST_MODULE_004_HOW_IT_WORKS_REPORT.md`

## 7. Desktop geometry (1440×1200, measured)

| Metric | Target | Actual |
| --- | ---: | ---: |
| Why → How gap | 24 | 24 |
| Module | 1376×176 | 1376×176 |
| Padding | 20 | 20 |
| Header | 28 | 28 |
| Timeline | 1336×108 | 1334×108 (±2) |
| Connector | 1088 | 1088 |
| Step blocks | 208×108 | 208×108 |
| Circles | 32×32 | 32×32 |
| Hero / Cards / Why | locked | locked |

Deviation: **&lt; 3%** (timeline width 1334 within ±2px). Overlay MAE vs dark plate: ~2.5% of 255.

## 8. Tablet layout (1024)

Natural-height module; 18px padding; 3+2 grid (Choose / Setup / Review, then Publish / Grow); desktop connector hidden. Screenshot: `tablet-1024.png`.

## 9. Mobile layout (390, measured)

| Metric | Target | Actual |
| --- | ---: | ---: |
| Module width | 358 | 358 |
| Circles | 28×28 | 28×28 |
| Step-row gaps | 8 | 8 |
| Overflow X | none | none |
| Height | ~322 natural | 380 (in 280–420 accept band) |

Vertical process; rail segments between steps 1–4 only; all five steps visible; no accordion.

## 10. Copy and claims

1. **Choose** — Import, create or claim your token or project.
2. **Setup** — Complete the required information with AI assistance.
3. **Review** — Confirm the details, ownership and publishing choices.
4. **Publish** — Create your Melega identity and ecosystem presence.
5. **Grow** — Build visibility, liquidity and community over time.

No automatic AI verification, ownership verification without evidence, auto-activation of all products, or guaranteed growth claims. Module is explanatory only (`pointer-events: none` on desktop; no links/buttons).

## 11. Accessibility

- `section` + `h2#list-how-it-works-title` + `ol` + five `li`
- Visible numbers match sequence 1–5
- Connector / mobile rails `aria-hidden`
- Circle glow disabled under `prefers-reduced-motion`

Evidence: `accessibility-validation.json` — pass.

## 12. Tests

```text
yarn vitest run listModule001|002|003|004
→ 4 files, 24 tests passed
```

## 13. Typecheck

`next build` typecheck path succeeded. Full-repo `tsc --noEmit` still reports pre-existing Trade/Trending errors unrelated to ListStudio (unchanged by this mission).

## 14. Build

`yarn next build` — **passed**.

## 15. Evidence paths

`apps/web/docs/runtime/list-module-004-how-it-works/`

- `desktop-1440.png`
- `desktop-1600.png`
- `tablet-1024.png`
- `mobile-390.png`
- `desktop-overlay.png`
- `desktop-diff.png`
- `geometry-measurements.json`
- `accessibility-validation.json`
- `frozen-modules-integrity.json`
- `certify.mjs`

## 16. Deviations

- Timeline content width measured **1334px** vs 1336px target (within ±2px).
- Mobile natural height **380px** vs approximate 322px (still compact vertical process; no overflow/clipping).

## 17. Working-tree status

Clean after commit/push on `mission-list-module-004-how-it-works`. No merge. No deploy.
