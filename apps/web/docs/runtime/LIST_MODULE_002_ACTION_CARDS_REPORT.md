# LIST_MODULE_002 — Action Cards

## 1. Verdict

**LIST_MODULE_002_ACTION_CARDS_CERTIFIED**

## 2. Crash recovery method

Interrupted Cursor session left uncommitted Module 002 work in an isolated worktree.

Recovery:

1. Located worktree `/Users/marcomelega/Projects/MelegaSwapV2-list-cards002`
2. Verified branch `mission-list-module-002-action-cards` @ `5efbc4e8`
3. Created safety stash `LIST-MODULE-002-CRASH-RECOVERY-SNAPSHOT` (incl. untracked)
4. Re-applied stash and completed remaining tests / certify / evidence / delivery

## 3. Worktree recovered

`/Users/marcomelega/Projects/MelegaSwapV2-list-cards002`

## 4. Starting HEAD

`5efbc4e8` — `Mission 001: LIST_MODULE_001 Hero`

## 5. Certified Hero base verification

| Check | Result |
| --- | --- |
| Ancestor includes `5efbc4e8` | **yes** |
| `ListPageHero.tsx` vs base | **byte-identical (no diff)** |
| Hero public images vs base | **unchanged** |
| Header / Trending / shell | **untouched** |

## 6. Files recovered (partial → completed)

| File | Classification |
| --- | --- |
| `listTokens.ts` | complete + geometry tokens for cards |
| `useListIntent.ts` | complete (`/list?intent=` shallow routing) |
| `ListActionCards.tsx` | complete (5 cards, desktop/tablet/mobile) |
| `ListStudioScreen.tsx` | complete (Hero + cards, 24px gap via `cardsTop`) |
| `listModule002.actionCards.test.ts` | completed / expanded |

## 7. Files changed

- `apps/web/src/views/ListStudio/listTokens.ts`
- `apps/web/src/views/ListStudio/useListIntent.ts` (new)
- `apps/web/src/views/ListStudio/ListActionCards.tsx` (new)
- `apps/web/src/views/ListStudio/ListStudioScreen.tsx`
- `apps/web/src/views/ListStudio/__tests__/listModule002.actionCards.test.ts` (new)
- `apps/web/docs/runtime/list-module-002-action-cards/*`
- `apps/web/docs/runtime/LIST_MODULE_002_ACTION_CARDS_REPORT.md`

## 8. Desktop geometry (1440, measured)

| Metric | Target | Actual |
| --- | ---: | ---: |
| Hero | 1376×360 | 1376×360 |
| Hero→cards gap | 24 | 24 |
| Row | 1376×272 | 1376×272 |
| Each card | 256×272 | 256×272 |
| Gaps | 24 | 24 |
| CTA | 216×44 | 216×44 |
| Icon tile | 56×56 | 56×56 |
| Popular badge | 68×20 | 68×20 |

Deviation: **0%** (< 3%).

## 9. Mobile geometry (390, measured)

| Metric | Target | Actual |
| --- | ---: | ---: |
| Row / content | 358 | 358 |
| Each card | 358×82 | 358×82 |
| Gaps | 10 | 10 |
| Overflow X | none | none |

## 10. Target versus actual

See `geometry-measurements.json`. All desktop + mobile geometry checks passed.

## 11. Individual card behavior

| Card | Intent | CTA | Notes |
| --- | --- | --- | --- |
| Import Token | `import-token` | Import Token | remains on `/list` |
| Create Token | `create-token` | Coming Soon | disabled — factory not operational |
| Claim Project Page | `claim-project` | Claim Page | featured gold + POPULAR |
| Create Project Page | `create-project` | Create Page | remains on `/list` |
| AI Assistant | `ai-assistant` | Get Help | remains on `/list` |

## 12. Claim Project emphasis

Featured radial gold surface, gold border, POPULAR badge 68×20 @ top −10px, gold CTA gradient. Card size remains 256×272.

## 13. Intent-state routing

- Canonical `listIntent` via `useListIntent`
- URL: `/list?intent=<value>`
- Shallow router push, `scroll: false`
- Invalid intent → no selection
- Back/forward validated in `intent-state-validation.json`
- No modal / drawer / separate route

## 14. Create Token availability

`LIST_CREATE_TOKEN_AVAILABLE = false` (Build Studio create-token is Coming Soon). Card visible, CTA “Coming Soon”, action disabled accessibly.

## 15. Accessibility

- Full-card buttons
- `aria-pressed` / `aria-disabled`
- Focus-visible gold ring (2px + 2px offset)
- Hover `translateY(-2px)` / active `0` with `prefers-reduced-motion` respect
- Compact intent placeholder with `aria-live="polite"`

## 16. Tests

`yarn vitest run` — listModule001 + listModule002 + dexUxRebuild.nav:

**22/22 passed**

Playwright certify: **passed** (geometry + intents)

## 17. Typecheck

Scoped via Next build compilation — **passed** (no Module 002 TS errors).

## 18. Build

`yarn next build` — **passed**

## 19. Evidence paths

`apps/web/docs/runtime/list-module-002-action-cards/`

- `desktop-1440-default.png`
- `desktop-1440-claim-hover.png`
- `desktop-1440-keyboard-focus.png`
- `tablet-1024.png`
- `mobile-390.png`
- `desktop-overlay.png`
- `desktop-diff.png`
- `geometry-measurements.json`
- `intent-state-validation.json`
- `certify.mjs`

## 20. Deviations

None material. Pathname may normalize to `/list/` in the browser; treated as `/list`.

## 21. Factual blockers

None for Module 002. Create Token remains non-operational by design (Coming Soon).

## 22. Push result

Mission commit `a7a42e46` pushed to `origin/mission-list-module-002-action-cards` (tip `25816643`).

## 23. Working-tree status

Clean.

## Certification

`LIST_MODULE_002_ACTION_CARDS_CERTIFIED`
