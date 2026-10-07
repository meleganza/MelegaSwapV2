# Lint unused-code tranche 03

## Mission and baseline

- Mission: `MELEGA-DEX-LINT-UNUSED-CODE-03`
- Base main: `fac47700b919f247d44aa5b24c32d7874cfbbc7b`
- Branch: `mission/lint-unused-code-03`
- Baseline lint: **1,644 errors / 2,043 warnings**.
- Baseline unused findings: **765 warnings**.
- Baseline gates: typecheck 0; certification 29/271; global TVL 5/5; Boost authority 4 files / 24 tests; build 8/8.

## Changes

The tranche removed 519 unused import bindings and 132 unused local bindings. When a removed binding was the last runtime import, the module initialization was retained unless the import was type-only or the obsolete React JSX binding. Hook/order-dependent initializers were retained and classified rather than being deleted for a lower count.

Two non-exported helpers were removed after repository-wide search found no production, test, script, configuration, dynamic-registration, barrel, or package-entrypoint consumer:

- `asBigInt` in SmartSwap route selection;
- `resolveFarmRemaining` in Farms Explore formatting.

No exported symbol or file was removed. No public API, route convention, callback signature, registry, side-effect import, feature hook, fixture, assertion, or test was deleted. The remaining 112 findings are intentionally classified in [UNUSED_AFTER.md](./UNUSED_AFTER.md).

## Safety and impact

- Public API changes: none.
- Contracts, fees, Treasury and economics: unchanged.
- Certified product behavior: unchanged.
- New ESLint suppressions or policy changes: none.
- Browser acceptance: not required; no rendered behavior changed.

## Verification

- Final lint: **1,637 errors / 1,389 warnings**; unused warnings **765 → 112**.
- Typecheck: PASS, 0 diagnostics.
- Certification: PASS, 29 files / 271 tests.
- Global TVL deterministic regression: PASS, 5/5.
- Boost authority regression: PASS, 4 files / 24 tests.
- Production build: PASS, 8/8 tasks.
- Cross-product deterministic smoke: certification plus focused TVL and Boost suites; zero new critical failures.
- `git diff --check`: PASS.

Recommended next tranche after architect review: `MELEGA-DEX-LINT-CONTROL-FLOW-04`. It was not started.
