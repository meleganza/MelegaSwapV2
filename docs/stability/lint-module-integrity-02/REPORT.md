# Lint module integrity tranche 02

## Mission and baseline

- Mission: `MELEGA-DEX-LINT-MODULE-INTEGRITY-02`
- Base main: `392736b8b96a7c60719ca590c1bd798c8c3a0b67`
- Branch: `mission/lint-module-integrity-02`
- Baseline lint: **1,720 errors / 2,043 warnings**
- Baseline module counts: `import/export` 75; `import/no-duplicates` 86; `import/no-named-as-default` 116; `import/no-cycle` 4.
- Baseline typecheck: **0 diagnostics**.
- Baseline certification: **29 suites / 271 tests passed**.
- Baseline global TVL: **5/5 passed**.
- Baseline Boost authority: **4 files / 24 tests passed**.
- Baseline production build: **8/8 tasks passed**.

The first typecheck attempt used stale workspace links from another checkout. A clean `yarn install --frozen-lockfile --ignore-scripts` repaired the local dependency graph; the rerun above is the certified source baseline. No source change was made before that rerun.

## Reviewed scope and classification

The complete 285-row evidence inventory is in [MODULE_BEFORE.md](./MODULE_BEFORE.md). It records rule, file, line, active/test/tooling status, certified-entrypoint reachability, the exact import/export statement or resolved symbol, and classification.

| Class | Found | Fixed | Remaining |
| --- | ---: | ---: | ---: |
| M1 confirmed runtime/module defect | 0 | 0 | 0 |
| M2 genuine bounded integrity risk | 76 | 76 | 0 |
| N1 stylistic duplicate import only | 28 | — | 28 |
| N2 contextual/default-named/cycle false positive | 33 | — | 33 |
| N3 test/tooling-only | 21 | — | 21 |
| N4 historical/dead/unreachable | 127 | — | 127 |

## Root causes and fixes

### Ambiguous barrels

Six barrels used `export *` across canonical sources and secondary modules that re-exported the same names. ESLint reported 75 collisions. The affected areas were Civilization Runtime, Economic Orchestrator, Economic Submission, Labs Runtime, Phase-D Readiness, and Real Event Intake.

The correction keeps the canonical star export where safe and uses explicit export lists at the collision boundary. Deprecated Civilization alias modules remain directly importable, while the barrel exposes each public name exactly once. Typecheck and focused barrel/runtime tests prove that the public symbol set used by consumers is preserved.

### Active data-truth cycle

`globalYieldInventory` re-exported `listGeneratedLivePools` from `poolConfigPreviewCards`, while `poolConfigPreviewCards` imported `poolIdentity` back from `globalYieldInventory`. The functions were currently safe by call timing, but the order-dependent graph was a genuine M2 initialization risk in data-truth code.

`farmIdentity` and `poolIdentity` moved to a side-effect-free leaf module. Both previous public exports remain available from `globalYieldInventory`, including `listGeneratedLivePools`; `poolConfigPreviewCards` imports only the leaf. No cache or state instance was added.

## Cycles retained after review

- My Melega provider/drawer: two lint reports for one intentional `import('./MyMelegaDrawer')` preload. It runs only on user intent after provider initialization and does not create a second provider/store.
- Execution modes/ingress: one static cycle. A bounded trial using leaf imports changed canonical-ingress initialization semantics and made a historical OFF-by-default assertion observable. The trial was reverted. With no certified failure or undefined export demonstrated, this remains contextual architecture debt rather than a safe lint-tranche fix.

## Duplicate and default/named review

All 86 duplicate-import reports resolve to the same canonical module path. None uses two side-effect-only imports or alternate paths capable of creating a second singleton/module instance. They remain N1, N3, or N4; no global consolidation was performed.

All 116 default/named reports were checked against the exporting module and consumer binding. They are same-identity component/hook exports or unreachable historical surfaces. No consumer imported a different symbol than intended, so no rename campaign was performed.

## Verification

- Focused module/runtime regressions: **8 files / 62 tests passed**.
- Focused module-integrity ESLint on corrected barrels/cycle: `import/export` 0 and corrected `import/no-cycle` 0.
- Final full lint: **1,644 errors / 2,043 warnings**.
- Final module counts: `import/export` 0; `import/no-duplicates` 86; `import/no-named-as-default` 116; `import/no-cycle` 3.
- Typecheck: PASS, 0 diagnostics.
- Certification: PASS, 29 suites / 271 tests.
- Global TVL deterministic regression: PASS, 5/5.
- Boost authority regression: PASS, 4 files / 24 tests.
- Production build: PASS, 8/8 tasks.
- Browser acceptance: not required; no runtime-rendered behavior or UX changed.
- Cross-product deterministic smoke: certification plus focused module/runtime, TVL, and Boost suites; zero new critical failures.
- `git diff --check`: PASS.

No public API name, contract, fee, Treasury behavior, economics, routing, TVL semantics, Boost authority, chain registry, modal/store singleton, or product UX changed. No lint suppression or CI gate was added.

Recommended next tranche after architect review: `MELEGA-DEX-LINT-UNUSED-CODE-03`. It was not started.
