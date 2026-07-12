# R783 Second Crash Recovery

**Captured:** 2026-07-12 (after window terminated, code 5)

## Git state at recovery start

| Item | Value |
|------|-------|
| Branch | `main` |
| HEAD SHA | `8e0c9f4736f4dd8208c55d80f384fd7fabe88c9a` |
| Remote | Up to date with `origin/main` |
| Staged files | **none** |
| Merge/rebase/cherry-pick | **none active** |

### Unstaged (unrelated — do not stage for emission)

- `apps/web/docs/runtime/r778-verify.mjs`
- `apps/web/docs/runtime/r780-data-quality-gates.json`
- `apps/web/public/registry/kerl/*`
- `apps/web/tsconfig.tsbuildinfo`

## Previous recovery artifacts (found)

| Artifact | Status |
|----------|--------|
| `recovery/R783_CURSOR_CRASH_STATE.md` | **fully written** (committed `5c9b3bca`) |
| `recovery/r783-cursor-crash.patch` | **fully written** (committed `5c9b3bca`) |
| `r783-farms-playwright.mjs` | **fully written** (committed `5c9b3bca`) |
| `r783-masterchef-rpc-proof.mjs` | **fully written** (committed `5c9b3bca`) |
| `r783-masterchef-rpc-proof.json` | **fully written** (committed `5c9b3bca`) |
| `masterChefEmission.test.ts` | **fully written** (+ updated in `8e0c9f47`) |
| `masterChefEmissionMath.ts` | **fully written** (+ poolWeight fallback in `8e0c9f47`) |

## R783 implementation files

| File | Status |
|------|--------|
| `src/lib/data-truth/masterChefEmissionMath.ts` | **fully written** — pure math + status |
| `src/lib/data-truth/useMasterChefEmission.ts` | **fully written** — API-first hook |
| `src/pages/api/masterchef/emission.ts` | **fully written** — RPC authority |
| `src/views/FarmsStudio/farmsRuntime/formatFarmsRuntime.ts` | **fully written** — consumes emission object |
| `src/views/FarmsStudio/farmsRuntime/useFarmsStakingRuntime.ts` | **fully written** — wired to `masterChefEmission` |
| `src/views/FarmsStudio/components/FarmsKpiRow.tsx` | **fully written** — diagnostics |
| `src/lib/data-truth/__tests__/masterChefEmission.test.ts` | **fully written** — 11 tests |

## Commits since first crash recovery

1. `239d049a` — farms route fix (`useFarmsTerminalData` import)
2. `5c9b3bca` — `R783_RECOVER_AND_CERTIFY_MASTER_CHEF_EMISSION`
3. `8e0c9f47` — Featured Farm poolWeight ratio fallback when alloc cache miss

## Duplicate implementations

**None found.** Single canonical pipeline:

`emission.ts` (API/RPC) → `useMasterChefEmission` → `masterChefEmissionMath` → `formatFarmsRuntime` → KPI / Featured / Cards

`poolWeight` in `utils/apr.ts` remains **APR-only** (not daily reward authority).

## Risk assessment

| Risk | Level | Notes |
|------|-------|-------|
| Crash interrupted file writes | **Low** | All R783 files committed; working tree clean for emission |
| Duplicate emission logic | **Low** | Consolidated |
| Featured Farm Rewards/Day unavailable while KPI shows 144K | **Medium** | Observed in prior playwright mobile capture — needs re-verify |
| Full R783 (ticker, pools, activity) | **Out of scope** | Separate blockers remain |

## Missing items

- Fresh production Playwright pass after `8e0c9f47`
- Production screenshots post-latest deploy
- Optional commit `R783_MASTERCHEF_EMISSION_CERTIFIED` only if new fixes required
