# P0 — Swap confirmation ownership

Original fix base: b56f69c27e8bb5078cabc1b9692283fc9817bdce. Revalidated after merging current
`origin/main` at efba7cd182396c9400cb502be884ca9c47d2cb9b on 2026-10-04.

The legacy fallback returned by SmartSwapCommitButton mounts a second SwapCommitButton beneath its still-mounted parent. Both register `useModal(..., true, true, 'confirmSwapModal')`. Previously, both hooks treated the shared logical name as ownership and wrote their different modal props into ModalContext, producing an update feedback loop. This is independent of the MARCO/AARON pair and explains a flickering, unclickable confirmation.

The shared hook now scopes its logical name with React.useId(). Only the instance that presented the modal may update it. Explicitly opening another modal still transfers ownership. Public useModal arguments are unchanged. Live quote updates and existing Accept Changes, slippage, expiry and V2 plan checks remain in place. No swap execution, fees, contracts, wallet permissions or on-chain calls were changed.

## Validation

- Bounded regression tests reproduce conflicting writes before the patch: 3 failures (explicit shared ID, default ID, and explicit ownership transfer).
- Focused suite: **20/20 PASS**. Exercises actual local UIKit hooks plus SmartSwap confirmation, pinned-plan expiry, replacement, wallet readiness and the newly covered nested legacy fallback.
- Production-minified browser harness imports the actual ModalProvider, useModal, Modal, renderer and animations; synthetic content and quote ticks isolate the ownership issue. Chrome at 1440, 1280 and 390 px: one mount, no remount, identical Confirm button, 0 px drift, one correct callback and zero wrong callbacks while quotes update every 100 ms, including during pointer-down/up. Overlay dismissal and reopening pass. This is a component integration test, not a signed swap on the production site.
- No real transaction was signed or submitted.

Run focused tests from repository root:

```sh
./node_modules/.bin/vitest run --config docs/swap-confirm-stability/vitest.config.ts packages/uikit/src/widgets/Modal/__tests__/useModalOwnership.test.tsx apps/web/src/lib/smartswap-universal-engine/__tests__/v2ConfirmModalStability.test.tsx apps/web/src/lib/smartswap-universal-engine/__tests__/v2ConfirmModal.test.tsx --threads false
```

The config explicitly resolves UIKit from this checkout, avoiding a shared node_modules symlink silently testing another checkout. Browser reproduction: build and preview `docs/swap-confirm-stability/browser/vite.config.ts`, then run `browser/check.cjs` with PLAYWRIGHT_MODULE pointing to an installed playwright-core package and Chrome installed. Evidence JSON is checked in; browser screenshots are local at `/private/tmp/swap-confirm-browser-results/`.

## Publication

The September production hotfix proved the ownership fix, but its review commit was never merged
into `main`; later production rollouts therefore reintroduced the defect. PR #108 is now rebased in
place through a merge with current `main` so the fix can land durably. Keep it draft until the current
Vercel preview and AARON confirmation stability checks pass. No real transaction is required.
