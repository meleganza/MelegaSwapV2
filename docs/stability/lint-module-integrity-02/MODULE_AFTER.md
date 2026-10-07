# Module integrity inventory — after

Mission: `MELEGA-DEX-LINT-MODULE-INTEGRITY-02`

## Result

| Rule | Before | After | Change |
| --- | ---: | ---: | ---: |
| `import/export` | 75 | 0 | -75 |
| `import/no-duplicates` | 86 | 86 | 0 |
| `import/no-named-as-default` | 116 | 116 | 0 |
| `import/no-cycle` | 4 | 3 | -1 |
| `@next/next/no-assign-module-variable` | 4 | 4 | 0 |

All 76 M2 findings are corrected. M1 remaining: **0**. M2 remaining: **0**.

## Corrections

- Six barrels now expose one unambiguous origin for every public name. Explicit export lists remove collisions while preserving the same public symbols.
- `globalYieldInventory` still exports `farmIdentity`, `poolIdentity`, and `listGeneratedLivePools`. The identity primitives now live in the leaf module `yieldIdentity`, so `poolConfigPreviewCards` no longer imports back through the inventory barrel. This removes the active initialization cycle without creating a second cache, provider, store, or singleton.

## Intentionally retained findings

- 86 `import/no-duplicates`: 28 active style-only import declarations, 14 test-only, and 44 historical/unreachable. Every pair resolves to the same ESM module, which is evaluated once; no side-effect-only duplicate or alternate-path double initialization was found.
- 116 `import/no-named-as-default`: 30 active contextual reports, 4 test-only, and 82 historical/unreachable. In every case inspected, the default binding and same-named export identify the same component/hook; no consumer resolves a different symbol.
- 3 `import/no-cycle`: two reports describe the same My Melega provider/drawer intent-time dynamic import, after provider initialization; the third is the execution-mode/ingress architecture. A trial unrolling changed canonical-ingress initialization behavior, so it was rejected as unsafe lint-only work. No undefined export, duplicate singleton, or certified runtime failure was demonstrated.
- 4 `no-assign-module-variable`: local variables named `module`, not writes to the CommonJS module object; three are tests and one is unreachable from certified entrypoints.

## Classification remaining

| Class | Remaining |
| --- | ---: |
| M1 | 0 |
| M2 | 0 |
| N1 | 28 |
| N2 | 33 |
| N3 | 21 |
| N4 | 127 |

No ESLint suppression, import-order cleanup, duplicate-import sweep, default-import rename campaign, dependency, or CI gate was added.
