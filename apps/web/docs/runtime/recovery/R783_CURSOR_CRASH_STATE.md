# R783 Cursor Crash Recovery State

- **Captured:** 2026-07-12
- **Branch:** `main`
- **HEAD SHA:** `3a4e1d50`
- **Recovery patch:** `apps/web/docs/runtime/recovery/r783-cursor-crash.patch`
- **`239d049a` in history:** yes (`R783 hotfix: restore farms route and canonical MARCO emission reads.`)

## Interrupted files

| File | State | Notes |
|------|-------|-------|
| `apps/web/src/lib/data-truth/masterChefEmissionMath.ts` | **Complete (needs status type)** | Pure math + `resolveFarmEmissionState`; add structured `status` envelope |
| `apps/web/src/lib/data-truth/useMasterChefEmission.ts` | **Incomplete** | API-first hook written; missing `status` field; runtime not wired |
| `apps/web/src/pages/api/masterchef/emission.ts` | **Complete (needs status + scan cap)** | Uses `dexTokenPerBlock`; full pool scan may timeout on Vercel |
| `apps/web/src/views/FarmsStudio/farmsRuntime/formatFarmsRuntime.ts` | **Complete (needs runtime wire)** | Expects `MasterChefEmission` object; `formatHumanTokenAmount` added |

## Critical incomplete integration

`useFarmsStakingRuntime.ts` still passes `canonicalPerBlock: number` into `mapFarmToPreviewCard` and `aggregateKpis`, but signatures now require `MasterChefEmission`. **This is the crash-recovery repair target.**

## Other dirty files (preserve, do not stage for emission commit)

- `apps/web/docs/runtime/r778-verify.mjs`
- `apps/web/docs/runtime/r780-data-quality-gates.json`
- `apps/web/public/registry/kerl/*`
- `apps/web/tsconfig.tsbuildinfo`

## Unrelated untracked (do not stage)

- `.cursor/`, `.env.*`, screenshot dirs, `package-lock.json`, `r783-verify.mjs`
