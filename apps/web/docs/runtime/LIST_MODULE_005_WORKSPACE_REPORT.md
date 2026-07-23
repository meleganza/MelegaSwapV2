# LIST_MODULE_005 — Unified List Workspace

## 1. Verdict

**LIST_MODULE_005_WORKSPACE_CERTIFIED**

## 2. Branch

`mission-list-module-005-workspace`

## 3. Commit

ded6c491

## 4. Certified base verification

| Check | Result |
| --- | --- |
| Base tip | `f879c6c8` (Module 004) |
| Ancestor | **yes** |
| Worktree | `/Users/marcomelega/Projects/MelegaSwapV2-list-ws005` |

## 5. Frozen-module integrity

Byte-identical vs `f879c6c8` (`list-module-005-workspace/frozen-modules-integrity.json`):

| File | Unchanged |
| --- | --- |
| `ListPageHero.tsx` | **yes** |
| `ListActionCards.tsx` | **yes** |
| `useListIntent.ts` | **yes** |
| `ListWhyBuildRail.tsx` | **yes** |
| `ListHowItWorks.tsx` | **yes** |

Desktop regression (measured): Hero 1376×360, Cards 1376×272, Why 1376×112, How 1376×176 — exact.

Module 002 placeholder remains in `ListActionCards` but is visually retired via `ListStudioScreen` CSS (`display: none`) so MODULE_005 owns the workspace without editing frozen Module 002 source.

## 6. Files changed

- `apps/web/src/views/ListStudio/ListWorkspace.tsx` (new)
- `apps/web/src/views/ListStudio/listTokens.ts` (MODULE_005 tokens only)
- `apps/web/src/views/ListStudio/ListStudioScreen.tsx` (mount + order + placeholder hide)
- `apps/web/src/views/ListStudio/__tests__/listModule005.workspace.test.ts` (new)
- `apps/web/docs/runtime/list-module-005-workspace/*`
- `apps/web/docs/runtime/LIST_MODULE_005_WORKSPACE_REPORT.md`

## 7. Desktop geometry (1440, measured)

| Metric | Target | Actual |
| --- | ---: | ---: |
| How → Workspace gap | 24 | 24 |
| Workspace | 1376×920 | 1376×920 |
| Padding X | 24 | 24 |
| Header | 64 | 64 |
| Body | 760 | 760 |
| Footer | 72 | 72 |
| Modules 001–004 | locked | locked |

Shell stays fixed; intent swaps body content only (replace, never append/grow/navigate).

## 8. Intent states

Validated on `/list/?intent=…` (trailingSlash):

| Intent | Title | Continue | Notes |
| --- | --- | --- | --- |
| import-token | Import Token | yes | Contract, Chain, Auto Detection, Project Preview |
| create-token | Create Token | yes (to preview) | Coming Soon; publish disabled |
| claim-project | Claim Project | yes | Contract, Wallet, Verification, Preview |
| create-project | Create Project | yes | Token optional — never mandatory |
| ai-assistant | AI Assistant | no | Conversation, Suggestions, Generate / Improve / Find |

Footer: Back / Continue / Cancel according to step + intent. Cancel clears `listIntent` via shallow `/list` query update. No modals, drawers, or new routes.

## 9. Mobile (390, measured)

| Metric | Target | Actual |
| --- | ---: | ---: |
| Width | 358 | 358 |
| Height | natural | 576 |
| Overflow X | none | none |

One-column layout; workspace height auto.

## 10. Accessibility / behavior

- `section` + heading + labeled progress
- No dialogs / portals
- Create Token honest Coming Soon copy
- Claim/Import copy does not assert verified ownership

## 11. Tests

```text
yarn vitest run listModule001–005
→ 5 files, 29 tests passed
```

## 12. Typecheck

`next build` completed with repo `ignoreBuildErrors` (pre-existing). ListStudio module tests cover MODULE_005 contracts.

## 13. Build

`yarn next build` — **passed**.

## 14. Evidence paths

`apps/web/docs/runtime/list-module-005-workspace/`

- `desktop-1440.png`
- `desktop-1440-idle.png`
- `desktop-1440-*.png` (per intent)
- `mobile-390.png`
- `desktop-overlay.png`
- `desktop-diff.png`
- `geometry-measurements.json`
- `intent-state-validation.json`
- `frozen-modules-integrity.json`
- `certify.mjs`

## 15. Deviations

None material. Pathname reported as `/list/` due to Next `trailingSlash: true` (still List page; no navigation away).

## 16. Working-tree status

Clean after commit/push on `mission-list-module-005-workspace`. No merge. No deploy.
