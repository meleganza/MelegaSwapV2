# KAP-006E — DEX Gravity Compliance Closure

**Date:** 2026-07-06  
**Authority:** KIRI DEX  
**Marker:** `KAP-006E_DEX_GRAVITY_COMPLIANCE_CLOSED`  
**Prior audit:** KAP-006D → `DEX_GRAVITY_PARTIALLY_COMPLIANT`

---

## KAP-006D findings resolved

| Finding | Resolution |
|---------|------------|
| V2 `SwapCommitButton` skipped routing facade | Wired through `routeV2SwapQuote` → `useV2SwapExecution` |
| `useCakeEnable` bypassed ingress | Wired through `routeV2SwapQuote` → `useV2SwapExecution` (same boundary as commit buttons) |
| LP submit deferral undocumented | `lib/liquidity-runtime/lpSubmitDeferral.ts` + machine payload field + validator check |
| Dirty tree mixed R702/KERL | Staging script isolates KAP-006C/E paths (see below) |

---

## Residual accepted deferrals

| Item | Status | Rationale |
|------|--------|-----------|
| LP mint/burn direct wallet submit | **Accepted** | `execution-ingress` rejects liquidity domain; routing packages quotes only |
| `/add` `/remove` legacy views (no redirect) | **Accepted** | Metadata alias to `liquidityRuntime`; shared `state/mint` / `state/burn` |
| Full test suite green | **Deferred** | Pre-existing failures unrelated to DEX Gravity (treasury mock, trending/radar labels, vitest load errors) |

**LP deferral constitutional guarantees** (`lpSubmitDeferral.ts`):
- `liquidityRuntime` is canonical owner
- No settlement authority
- No reward authority (Farms/Pools separate)
- No Treasury computation
- No Gravity / Opportunity Truth

---

## Files changed (KAP-006E delta)

| File | Change |
|------|--------|
| `apps/web/src/views/Swap/components/SwapCommitButton.tsx` | `routeV2SwapQuote` facade |
| `apps/web/src/hooks/useCakeEnable.tsx` | Facade + ingress via `useV2SwapExecution` |
| `apps/web/src/lib/liquidity-runtime/lpSubmitDeferral.ts` | **New** — deferral manifest |
| `apps/web/src/views/LiquidityStudio/liquidityRuntime/useLiquidityMintRuntime.tsx` | `lpSubmitDeferral` in machine payload |
| `apps/web/src/lib/dex-gravity/verifyKap006c.ts` | KAP-006E validator checks + marker |
| `apps/web/src/lib/dex-gravity/constants.ts` | `KAP_006E_MARKER` |
| `apps/web/src/lib/dex-gravity/__tests__/kap-006c.test.ts` | 006E closure assertions |
| `apps/web/src/lib/liquidity-runtime/__tests__/liquidity-canonical.test.ts` | Deferral test |
| `apps/web/scripts/stage-kap-006ce.sh` | **New** — isolated staging helper |

---

## KAP-006C/E file manifest (stage scope)

### Include — KAP-006C/E

```
apps/web/package.json
apps/web/public/registry/exchange/
apps/web/scripts/stage-kap-006ce.sh
apps/web/src/lib/dex-gravity/
apps/web/src/lib/routing-layer/facade.ts
apps/web/src/lib/routing-layer/index.ts
apps/web/src/lib/routing-layer/__tests__/
apps/web/src/lib/execution-ingress/activation.ts
apps/web/src/lib/execution-ingress/canonicalSubmit.ts
apps/web/src/lib/execution-ingress/dexCanonicalGates.ts
apps/web/src/lib/execution-ingress/dispatch.ts
apps/web/src/lib/execution-ingress/index.ts
apps/web/src/lib/execution-ingress/__tests__/execution-ingress.test.ts
apps/web/src/lib/execution-ingress/__tests__/kap-006c-canonical-ingress.test.ts
apps/web/src/lib/execution-layer/useSwapExecution.ts
apps/web/src/lib/liquidity-runtime/
apps/web/src/hooks/useCakeEnable.tsx
apps/web/src/pages/add/
apps/web/src/pages/remove/
apps/web/src/views/LiquidityStudio/liquidityRuntime/useLiquidityMintRuntime.tsx
apps/web/src/views/Swap/components/SwapCommitButton.tsx
apps/web/src/views/Swap/SmartSwap/components/SmartSwapCommitButton.tsx
apps/web/src/views/Swap/StableSwap/components/StableSwapCommitButton.tsx
apps/web/src/views/Trade/tradeRuntime/useTradeSwapRuntime.ts
docs/DEX_RUNTIME_ARCHITECTURE.md
docs/KAP_006C_DEX_GRAVITY_IMPLEMENTATION_REPORT.md
docs/KAP_006E_DEX_GRAVITY_COMPLIANCE_CLOSURE.md
```

**Stage command:** `./apps/web/scripts/stage-kap-006ce.sh`

### Exclude — not KAP scope

```
apps/web/src/views/PoolsStudio/**          # R702 Pools pixel
apps/web/src/views/PoolsStudio/poolsRuntime/**
apps/web/scripts/capture-r702-*
apps/web/scripts/kerl-first-testnet-execution.ts
apps/web/src/lib/execution-modes/first-testnet-execution/**
apps/web/public/registry/kerl/handoffs/**
apps/web/src/lib/treasury-handoff/types.ts   # unrelated settlementTime additive
yarn.lock                                  # unrelated churn
docs/screenshots/**
apps/web/tsconfig.tsbuildinfo
.cursor/
```

---

## Validator / build / test status

```bash
cd apps/web
yarn verify:kap-006c-dex-gravity   # → KAP-006C + KAP-006E markers
yarn vitest --run \
  src/lib/routing-layer/__tests__ \
  src/lib/dex-gravity/__tests__ \
  src/lib/execution-ingress/__tests__/kap-006c-canonical-ingress.test.ts \
  src/lib/liquidity-runtime/__tests__
yarn build
```

| Check | Status |
|-------|--------|
| `yarn verify:kap-006c-dex-gravity` | Pass — emits both markers |
| KAP-scoped tests | Pass |
| `yarn build` | Pass |
| Full `yarn test` | Pre-existing unrelated failures remain |

### KAP-006E validator checks added

- `kap006e-v2-commit-facade` — V2 commit uses `routeV2SwapQuote`, not direct factory
- `kap006e-cake-enable-ingress-or-exempt` — facade + `useV2SwapExecution`
- `kap006e-lp-submit-deferral-documented`
- `kap006e-no-treasury-settlement-computation`

---

## Dirty tree isolation plan

1. Do **not** `git add -A`
2. Run `./apps/web/scripts/stage-kap-006ce.sh`
3. Verify: `git diff --cached --stat` shows only KAP paths
4. Commit when ready: `KAP-006C/E — DEX Gravity implementation and compliance closure`
5. Leave R702/KERL changes unstaged for separate commits

---

## Final verdict

**`DEX_GRAVITY_CONSTITUTIONALLY_COMPLIANT`**

All KAP-006D narrow gaps are closed or explicitly documented as accepted deferrals. Constitutional boundaries preserved. KAP-006C/E files are stageable independently from R702/KERL work.

**Marker:** `KAP-006E_DEX_GRAVITY_COMPLIANCE_CLOSED`
