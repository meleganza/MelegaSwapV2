# Unused-code inventory — after

Mission: `MELEGA-DEX-LINT-UNUSED-CODE-03`

## Result

- `@typescript-eslint/no-unused-vars`: **112 warnings** (0 errors), down from 765.
- Genuine reviewed U1/U2/U3 remaining: **0**.
- No lint suppression, rule-policy change, dependency, public API change, or global unused-argument exemption was added.

| Class | Fixed | Remaining | Reason for remaining |
| --- | ---: | ---: | --- |
| U1 dead imports | 519 | 0 | all unused bindings removed safely |
| U2 dead locals/constants | 132 | 0 | bindings removed; effectful initializers retained |
| U3 proven-dead internal helpers | 2 | 0 | `asBigInt` and `resolveFarmRemaining`, with no consumers |
| U4 required unused parameters | — | 58 | callback/component/interface compatibility |
| U5 tuple/order/API semantics | — | 18 | hook/tuple positions retained |
| U6 side-effect imports | — | 0 | no lint finding; initialization was preserved conservatively |
| U7 intentional scaffolding | — | 18 | disabled/forward-compatible product paths and hook initializers remain reachable/configured |
| U8 test-only | — | 18 | fixtures/helpers retained for test intent |
| U9 tooling-only | — | 0 | none |
| U10 contextual false positive | — | 0 | none |

Remaining by category: `U4=58, U5=18, U7=18, U8=18`; total 112.

The retained findings should not be forced to zero by deleting signatures, tuple members, disabled product hooks, or test intent. A later lint-policy mission may consider the repository's already-supported underscore convention one signature at a time.
