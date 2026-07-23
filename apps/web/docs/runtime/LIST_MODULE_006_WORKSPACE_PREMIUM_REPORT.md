# LIST_MODULE_006 — Workspace Premium

## 1. Verdict

**LIST_MODULE_006_WORKSPACE_PREMIUM_CERTIFIED**

## 2. Branch

`mission-list-module-006-workspace-premium`

## 3. Commit

(filled after commit)

## 4. Certified base verification

| Check | Result |
| --- | --- |
| Base tip | `c75cd6fb` (Module 005) |
| Ancestor | **yes** |
| Worktree | `/Users/marcomelega/Projects/MelegaSwapV2-list-ws006` |

## 5. Frozen-module integrity

Byte-identical vs `c75cd6fb`:

| File | Unchanged |
| --- | --- |
| `ListPageHero.tsx` | **yes** |
| `ListActionCards.tsx` | **yes** |
| `useListIntent.ts` | **yes** |
| `ListWhyBuildRail.tsx` | **yes** |
| `ListHowItWorks.tsx` | **yes** |
| `ListStudioScreen.tsx` | **yes** |

Outer workspace locks unchanged: 1376×920 · header 64 · body 760 · footer 72.

## 6. Files changed

- `apps/web/src/views/ListStudio/ListWorkspace.tsx` (premium rebuild)
- `apps/web/src/views/ListStudio/listTokens.ts` (MODULE_006 internal tokens only)
- `apps/web/src/views/ListStudio/__tests__/listModule006.workspacePremium.test.ts` (new)
- `apps/web/src/views/ListStudio/__tests__/listModule005.workspace.test.ts` (footer: Cancel + Continue/Publish)
- `apps/web/docs/runtime/list-module-006-workspace-premium/*`
- `apps/web/docs/runtime/LIST_MODULE_006_WORKSPACE_PREMIUM_REPORT.md`

## 7. Desktop geometry (measured)

| Metric | Target | Actual |
| --- | ---: | ---: |
| Workspace | 1376×920 | 1376×920 |
| Header | 64 | 64 |
| Body | 760 | 760 |
| Footer | 72 | 72 |
| Right panel | 340×760 | 340×760 |
| Progress dots | 5 × 20 | 5 × 20 |
| Completeness ring | 72 | 72 |
| Hero / How regression | locked | locked |

## 8. Premium behavior

- Header: flow title · 5-dot progress · status pill · autosave (real debounce, else Draft)
- Body: left form + right context (intent-specific; compact placeholders when empty)
- Completeness: 0/25/50/75/100 from required fields only
- Field marks: green check / gray circle; red only after Continue validation
- Footer: Cancel + Continue/Publish only (≤2 buttons)
- Motion: 120ms fade / 8px slide; reduced-motion respected
- No modals, drawers, or route changes

## 9. Mobile (390)

Right panel stacks below the form. Width 358. No overflow. No drawer.

## 10. Tests

```text
yarn vitest run listModule001–006
→ 6 files, 33 tests passed
```

## 11. Build

`yarn next build` — **passed**.

## 12. Evidence

`apps/web/docs/runtime/list-module-006-workspace-premium/`

- `desktop-1440.png`
- `desktop-1440-*.png` (intents + autosaved)
- `mobile-390.png`
- `desktop-overlay.png`
- `desktop-diff.png`
- `geometry-measurements.json`
- `frozen-modules-integrity.json`
- `certify.mjs`

## 13. Deviations

Left column uses remaining width beside the locked 340px context panel (premium panel lock prioritized over a pure 65/35 percentage split).

## 14. Working-tree status

Clean after commit/push. No merge. No deploy.
