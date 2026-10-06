# Repository hygiene and legacy debt zero report

Mission: `MELEGA-DEX-REPOSITORY-HYGIENE-AND-LEGACY-DEBT-ZERO`

Base main: `ce61ef9cfa292d0b184e7572c5447dd25b79a67d`

## Result

The repository-wide TypeScript baseline was reduced from **438 diagnostics to 0**.
The #117 active-production closure remained at **0 diagnostics** throughout. No
TypeScript exclusion, `any`, `@ts-ignore`, disabled test, lowered strictness, or assertion
weakening was introduced to manufacture the result.

| Measure | Before | After |
| --- | ---: | ---: |
| Repository TypeScript diagnostics | 438 | 0 |
| Active-production diagnostics | 0 | 0 |
| Category C: test/historical | 212 | 0 |
| Category D: unreachable/tooling/generated/vendor | 226 | 0 |
| C1 stale fixture/type | 123 | 0 |
| C2 historical expectation/import drift | 71 | 0 |
| C3 harness/mock typing | 18 | 0 |
| D1 first-party scripts/tooling | 0 | 0 |
| D2 generated artifacts | 0 | 0 |
| D3 unreachable first-party module | 226 | 0 |
| D4 third-party/toolchain incompatibility | 0 | 0 |

The complete inventories are in `BEFORE_DIAGNOSTICS.json` and
`AFTER_DIAGNOSTICS.json`; `BEFORE.md` records the frozen pre-fix baseline.

## Changes

- Repaired stale fixtures, imports, unions, mocks, and historical API call shapes against
  current canonical types.
- Replaced Node-prefixed imports in browser-compiled historical tests with the import
  form supported by the repository's pinned Node typings.
- Added narrow compatibility adapters only for historical, classifier-unreachable
  profile, lottery, and locked-pool imports. These preserve compilation without entering
  the active production closure.
- Added compatibility aliases for historical design-token consumers rather than
  changing the current design system.
- Corrected first-party unreachable modules against their current shared contracts.
- Removed no first-party module: the reachability proof was sufficient to classify the
  debt, but not sufficient to justify deletion under the mission's conservative removal
  standard.
- Regenerated no generated source and changed no vendor source; the inventory contained
  no D2 or D4 diagnostics.
- Added root `yarn typecheck` and placed it in the existing full-funnel pull-request
  workflow, before deterministic certification.

## Lint

Baseline `yarn lint` stopped before analysis because `.eslintrc` extended the undeclared
`next/babel` preset. The repository already declares `@next/eslint-plugin-next`, so the
configuration now uses its supported recommended and Core Web Vitals presets directly;
no dependency was added.

The repaired command deterministically reports **3,792 historical findings: 1,735 errors
and 2,057 warnings** (525 errors and 154 warnings are potentially auto-fixable). This is a
separate, substantially larger semantic/formatting backlog and was not mass-fixed because
doing so would create unreviewable runtime churn. It was not added to CI. Next's production
compiler is explicitly configured to leave lint to the separate command, so production
build validity and lint debt remain independently observable.

## Verification

- `yarn typecheck`: PASS, 0 diagnostics.
- Active-production classifier: PASS, 0 active diagnostics; 1,533 files in the resolved
  active closure on this checkout.
- `yarn test:certification`: PASS, 29 suites / 271 tests.
- `yarn build`: PASS, 8/8 workspace build tasks.
- New deterministic test failures: 0.
- Browser smoke: not required; hygiene changes did not alter a certified rendered path.
- Real transactions: none.
- Deployment: none.

## Certified-behavior freeze

All certified behavior through merged PR #118 remains frozen, including global multichain
DEX TVL truth and ordering, unpriced liquidity treatment, Farm non-double-counting,
SmartSwap routing and execution economics, Liquidity and Farm workflows, Create Pool
visibility, Bridge capability truth, Trending identity and visuals, network selection,
mobile geometry, and #116 click integrity. Contracts, fees, economics, treasury behavior,
chain capabilities, deployment behavior, and product UX were not changed.

## Remaining blockers

There are no remaining repository TypeScript blockers. The explicitly measured lint
backlog is not part of the TypeScript zero-debt result and requires a separately scoped,
incremental lint burn-down before it can become a reliable CI gate.
