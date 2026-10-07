# Unused-code inventory — before

Mission: `MELEGA-DEX-LINT-UNUSED-CODE-03`

Base main: `fac47700b919f247d44aa5b24c32d7874cfbbc7b`

## Certified baseline

- Full lint: **1,644 errors / 2,043 warnings**.
- `@typescript-eslint/no-unused-vars`: **765 warnings** (0 errors), across 309 files.
- Typecheck: 0 diagnostics.
- Certification: 29 files / 271 tests passed.
- Global TVL deterministic regression: 5/5 passed.
- Boost authority regression: 4 files / 24 tests passed.
- Production build: 8/8 tasks passed.

## Review method and classification

Every finding was resolved to its TypeScript syntax owner (import binding, parameter, destructured binding, local declaration, or helper declaration), then reviewed by surface (production, test, or tooling). Import removals preserve a module-only import whenever removing the final runtime binding could otherwise change module initialization. Type-only and React JSX-runtime-only imports were removed outright. Locals whose initializers can execute were reduced to the initializer expression so hook order, registration, and other effects remain unchanged.

For helper candidates, repository-wide symbol search was combined with the active dependency/reachability classification used by the previous stability tranches. No exported symbol, Next.js route, barrel entry, registry/config entry, dynamic import, test helper, script, or package entrypoint was deleted.

| Class | Before | Disposition |
| --- | ---: | --- |
| U1 dead import binding, no required side effect | 519 | remove binding; preserve module initialization where applicable |
| U2 dead local/constant | 132 | remove binding; preserve effectful initializer |
| U3 proven-dead internal helper | 2 | remove after repository-wide non-reachability proof |
| U4 required unused callback/interface parameter | 58 | retain |
| U5 tuple/order/API semantic binding | 18 | retain |
| U6 side-effect/registration import | 0 lint findings | retain by rule; final-binding removals conservatively keep module initialization |
| U7 intentionally reachable/configured scaffolding | 18 | retain |
| U8 test fixture/helper | 18 | retain to preserve test intent |
| U9 tooling/script | 0 | none |
| U10 contextual false positive | 0 | none |

The 765 rows are therefore fully accounted for: 653 genuine U1/U2/U3 findings and 112 intentional U4/U5/U7/U8 findings. The classification includes dependency-cascade findings exposed only after removal of their sole dead consumer.
