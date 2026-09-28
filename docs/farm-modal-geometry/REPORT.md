# Farm Creation modal geometry P0

MISSION=MELEGA-FARM-CREATION-MODAL-LAYOUT-P0
BASE_MAIN_SHA=42332c824a08970b3dbec4b887f49727eb297fa1
BRANCH=p0-farm-modal-geometry

## Root cause

`8c5a1513b47210046e3fd35e9270b213ed1a103d` recorded the nested `minmax(0, 1.15fr) minmax(250px, 0.85fr)` Step 1 layout with a 10px gap and `min-height: 100%`. `88e839196` restored that source into the current main lineage. The workspace reserves a fixed 300px Review column inside the shared modal's 760px maximum. The page-width breakpoint leaves both grids active on desktop despite the narrow modal. Actual main: selector 125.984375px, card 99.984375px.

Search is **not currently detached with absolute/fixed positioning**: it is a normal-flow input with no explicit width/max-width, so its intrinsic size exceeds that narrow selector and invades Pair Status. `7bca182cb5a2dced1654699046f59d0afb840453` removed the previous portaled/fixed dropdown and placed the list below Search without resolving the width budget. It also retained a call to the deleted `setPairDropdownOpen` setter. The prior local Farm branch at `58ef3045b` is not part of the verified main and is not cherry-picked here.

ROOT_CAUSE_COMMIT_OR_CHANGE=8c5a1513b nested grid + 88e839196 restoration + 7bca182cb incomplete in-flow dropdown conversion; intrinsic input width inside undersized selector.

## Scoped correction

Two production files, two existing focused tests, one browser geometry runner and its evidence:

- `apps/web/src/views/FarmsStudio/FarmsStudioGlobalStyle.tsx`: scope a larger width only to `create-farm-modal`, `min(1360px, calc(100vw - 32px))`, with viewport-safe height and mobile margins. Existing modal component, header, close/focus behavior and body scrolling are retained.
- `apps/web/src/views/FarmsStudio/modules/PublicFarmFactoryWorkspace.tsx`: 60/40 workflow/Review grid; Step 1 `minmax(286px, .9fr) minmax(320px, 1.1fr)` with 16px gap; tablet/mobile stacking; remove the artificial 100% panel minimum-height; Search uses relative positioning, block display and 100% width/max-width/border-box; rows fill their list and scroll only vertically. Remove only the obsolete undefined UI setter; the existing draft selection update remains unchanged.
- `apps/web/src/views/FarmsStudio/__tests__/createFarmPairSearchLayout.test.ts`: update overflow expectation and guard against obsolete dropdown setter.
- `apps/web/src/views/FarmsStudio/__tests__/publicFarmFactory.uiLock.test.ts`: update responsive breakpoint expectation to 1199px.
- `docs/farm-modal-geometry/`: one geometry test, captured API response, test/typecheck helpers and logs, measurements, screenshots and this report.

No eligibility, liquidity threshold, creation fee, duration/reward math, factory, approval/transaction handlers, contracts, Pool self-service, SmartSwap, Bridge or token data source changes. No new component/design system, z-index workaround or search transform/negative margin.

## Real-browser acceptance

The runner opens the actual local `/farms?create=1` page in Chrome and renders the actual Create Farm modal/LP card components. `pairs-api-snapshot.json` is an unmodified response captured from the local main `/api/indexer/pairs?page=1&pageSize=12` endpoint, replayed only at the read API boundary for reproducible before/after content. It contains real indexed M01/ZLT, BNBDOG/WBNB and other LP records (historical indexer reserves, not fresh live-chain claims). A persisted draft selects the real BNBDOG/WBNB pair in its low-liquidity state. No fake card DOM, layout injection, connected wallet or transaction.

`PHASE=before` changes artifact names and skips the known broken selection handler only; **all geometry assertions are identical**. It fails on untouched main with 10 geometry failures: Search containment, Search/list versus Status separation, row clipping, horizontal overflow and desktop minimum widths at 1440 and 1280. After correction the same assertions pass at 1440×900, 1280×800 and 390×844. Final after-run also filters M01, selects its actual LP row, confirms Review changes to M01/ZLT and closes the modal.

Measured results:

- 1440×900: selector **334.609375px**, minimum LP row **308.609375px**; selector | status | Review side by side.
- 1280×800: selector **304.375px**, minimum LP row **278.375px**; selector | status | Review side by side.
- 390×844: selector **320px**, rows **294px** (full selector content width after panel padding); selector, status and Review in order vertically.
- Search position relative, transform none, box sizing border-box; all four edges contained. Search label/input/list ordered without intersection.
- No horizontal overflow in modal descendants, list or page. Every measured card is horizontally contained and has no clipped content.
- CTA is hit-testable in every viewport. Mobile modal body scrolls 530px to reach it; document scroll remains zero. Close button stays visible and stationary. Review is readable at the bottom; screenshots document the scrolled states. Existing modal body is vertically scrollable at all tested sizes.

SEARCH_CONTAINED=true
SEARCH_POSITIONING=relative; normal flow; width/max-width 100%; border-box
SELECTOR_WIDTH_1440=334.609375px
PAIR_CARD_MIN_WIDTH_1440=308.609375px
PAIR_STATUS_NO_OVERLAP=true
REVIEW_NO_OVERLAP=true
CTA_REACHABLE=true
HORIZONTAL_OVERFLOW=false

## Before / after evidence

- [Broken current main, 1440](before-farm-modal-1440.png).
- [After 1440](farm-modal-1440.png), [after 1280](farm-modal-1280.png), [after mobile 390](farm-modal-390.png).
- [Mobile CTA reached by scrolling](after-farm-modal-390-cta.png), [mobile Review](after-farm-modal-390-review.png).
- [Before DOM measurements](before-geometry.json), [after DOM measurements](after-geometry.json).
- Browser logs: [before expected failure](before-browser.log), [after pass](after-browser.log).

Screenshots were visually inspected: short pair names/logos and chain/liquidity metadata are readable, Search is contained, the three desktop panels are separated, and mobile content remains accessible. Development has a pre-existing Suspense hydration warning and broad class-name styling visible around shared modal header elements. The runner records those errors and dismisses the Next error overlay using UI controls (close product modal, close developer overlay, reopen product modal); it does not inject styles or alter production DOM. Shared styling and hydration behavior are outside this layout correction. No claim of full application health or production deployment is made.

## Validation

GEOMETRY_REGRESSION_TEST=PASS on corrected branch, expected FAIL on unmodified main; actual DOM bounding boxes, three required viewports.
FARM_TESTS=21/21 focused PASS; broader FarmsStudio suite 161 PASS / 22 FAIL both before and after; identical failing test identities, zero new failures.
TYPECHECK=0 touched-file diagnostics after (1 before: stale setter); 153 unchanged dependency diagnostics. Full-project typecheck is not green.
DIFF_CHECK=PASS

Broader baseline failures involve historical module hashes/fixtures, chain eligibility and obsolete module expectations; see the before/after logs. No unrelated repair and no full build was attempted. The user explicitly authorized this Farm-only correction, local commit and one draft PR; the old generic mission rule forbidding Farm files/PRs does not override that task-specific authorization.

Reproduction from repository root (use an existing Playwright installation; local Next server on port 3118):

```sh
PLAYWRIGHT_MODULE=/path/to/playwright-core node docs/farm-modal-geometry/geometry.cjs
node docs/farm-modal-geometry/check-types.cjs
node node_modules/vitest/vitest.mjs run --config docs/farm-modal-geometry/vitest.config.ts apps/web/src/views/FarmsStudio/__tests__ --threads false
```

Run the same browser script against base source with `PHASE=before` to reproduce the expected geometric failure. No package installation is needed. The script's snapshot is a test fixture only and is not imported by production.

FARM_LOGIC_CHANGED=false
FEE_CHANGED=false
CONTRACTS_CHANGED=false
REAL_TX=false
DEPLOYED=false
MERGED=false
BLOCKERS=No remaining P0 geometry blocker. Baseline full-suite/dependency failures and development hydration/style issues are documented above; no production or transaction certification.

**FARM_CREATION_MODAL_LAYOUT_P0_PASS** — browser geometry acceptance only, not full repository certification. Draft publication is for Architect/Founder review; no merge or manual production deployment. Branch-triggered Vercel output is preview only.
