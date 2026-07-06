# KAP-006C — DEX Gravity Implementation Report

**Date:** 2026-07-06  
**Authority:** KIRI DEX  
**Marker:** `KAP-006C_DEX_GRAVITY_IMPLEMENTED`  
**Verdict:** **IMPLEMENTED** (Phases A–D)

---

## Files changed

### New modules

| Path | Purpose |
|------|---------|
| `apps/web/src/lib/routing-layer/facade.ts` | Canonical routing facade |
| `apps/web/src/lib/execution-ingress/canonicalSubmit.ts` | Thin submit wrapper into ingress |
| `apps/web/src/lib/execution-ingress/dexCanonicalGates.ts` | Production DEX ingress gates |
| `apps/web/src/lib/dex-gravity/*` | Schemas, radar stub, validator |
| `apps/web/src/lib/liquidity-runtime/canonicalOwnership.ts` | Liquidity runtime ownership |
| `apps/web/public/registry/exchange/melega-dex.json` | Static exchange manifest |

### Modified

| Path | Change |
|------|--------|
| `apps/web/src/lib/execution-ingress/activation.ts` | Canonical ingress enabled by default |
| `apps/web/src/lib/execution-ingress/dispatch.ts` | DEX canonical gate path |
| `apps/web/src/lib/execution-layer/useSwapExecution.ts` | Submit via ingress |
| `apps/web/src/views/Swap/SmartSwap/components/SmartSwapCommitButton.tsx` | Routing facade |
| `apps/web/src/views/Swap/StableSwap/components/StableSwapCommitButton.tsx` | Routing facade + V2 execution |
| `apps/web/src/views/Trade/tradeRuntime/useTradeSwapRuntime.ts` | Facade quote + opportunityRef |
| `apps/web/src/views/LiquidityStudio/liquidityRuntime/useLiquidityMintRuntime.tsx` | Canonical payload + LP routing |
| `apps/web/src/pages/add/[[...currency]].tsx` | liquidityRuntime alias |
| `apps/web/src/pages/remove/[[...currency]].tsx` | liquidityRuntime alias |
| `docs/DEX_RUNTIME_ARCHITECTURE.md` | KAP-006C architecture section |
| `apps/web/package.json` | `verify:kap-006c-dex-gravity` script |

### Tests added

- `lib/routing-layer/__tests__/routing-facade.test.ts`
- `lib/dex-gravity/__tests__/kap-006c.test.ts`
- `lib/execution-ingress/__tests__/kap-006c-canonical-ingress.test.ts`

---

## Routing convergence

- `routing-layer/facade` is constitutional quote/path owner.
- SmartSwap and StableSwap commit buttons package quotes through facade.
- Trade runtime machine payload includes `routingFacade` marker.
- Liquidity runtime packages mint/burn via `routeLiquidityInstruction`.
- Routing layer does not submit execution.

## Execution convergence

- `execution-ingress` is canonical submit owner (active by default).
- `useSmartSwapExecution` / `useV2SwapExecution` route through `submitSwapViaIngress`.
- DEX canonical gates apply when execution mode is OFF (preserves production swap behavior).
- KERL live testnet gates unchanged for harness paths.
- `execution-tracker` remains evidence-only; `treasury-handoff` unchanged.

## Liquidity convergence

- `/liquidity-studio` remains canonical UX.
- `/add` and `/remove` declare `liquidityRuntimeAlias` metadata.
- `state/mint` and `state/burn` primitives unchanged.
- Machine payload includes `canonicalOwner: liquidityRuntime` and `melega.liquidity.v1` schema.

## Schemas added

| Schema | Builder |
|--------|---------|
| `melega.dex.v1` | `buildMelegaDexV1()` |
| `melega.liquidity.v1` | `buildMelegaLiquidityV1()` |
| `melega.execution.v1` | `buildMelegaExecutionV1()` |
| `melega.exchange-receipt.v1` | `buildMelegaExchangeReceiptV1()` (alias: `melega.dex-execution-receipt.v1`) |

## Manifest added

`public/registry/exchange/melega-dex.json` — declares DEX role, pipelines, schemas, delegated/forbidden authorities.

## Tests run

```bash
cd apps/web && yarn test
yarn verify:kap-006c-dex-gravity
yarn build
```

## Deferred items

- `useCakeEnable` direct `useSwapCallback` path (internal CAKE enable utility — low-traffic).
- Bridge SmartSwapCommitButton (commented swap path).
- Full Radar URL prefill wiring when `NEXT_PUBLIC_RADAR_URL` is configured (stub consumes ref only).
- LP submit through execution-ingress (unsupported instruction type — LP remains direct wallet submit via liquidityRuntime).

## Final verdict

**KAP-006C_DEX_GRAVITY_IMPLEMENTED**

Phases A–D complete. DEX operates as Civilization Economic Exchange Engine with converged routing, execution ingress, liquidity runtime canonicalization, and four machine schemas. No Gravity computation, no Opportunity Truth, no Treasury settlement changes.
