# Melega Smart Router — Phase 2 Constitutional Wrapper Specification

**Version:** 0.2.0 · **Status:** Design complete — deployment not started  
**Phase 1:** ADAPTER (preserved) · **Target:** WRAPPER canonical entrypoint

## Architecture evolution

```
Current (Phase 1):
  UI → Smart Router Adapter → Pancake Smart Router

Target (Phase 2+):
  UI → Melega Smart Router Wrapper → Pancake Smart Router
         ├─ D87 Protocol Fee
         ├─ Treasury Collector
         └─ Treasury Runtime handoff (off-chain)
```

## Wrapper responsibilities

- Collect D87 Protocol Fee (30 bps standard / 20 bps BUY MARCO)
- Preserve LP fee on underlying router path
- Emit `ProtocolFeeCollected` and `SmartRouterSwapRouted`
- Forward protocol fee to Treasury collector
- Delegate swap execution to Pancake Smart Router with **net** input only

## Never

- Execute FSC-01 locally
- Split fees inside DEX or Wrapper beyond collector forward
- Own treasury accounting or referral settlement

## Registry resolution (off-chain, pre-deploy)

| Resource | Order |
|----------|-------|
| Treasury Collector | Runtime Registry → KERL Registry → `.env` fallback |
| MARCO token | Runtime Registry → KERL Registry → `.env` → static dev (non-prod) |

Registry files: `/registry/treasury/index.json`, `/registry/smart-router/index.json`

## Execution sequence (exact-input v1)

See `lib/melega-smart-router/wrapper/spec.ts` — `WRAPPER_EXECUTION_SEQUENCE`

## Security model

See `WRAPPER_SECURITY_MODEL` in `wrapper/spec.ts`

## ABI draft

`lib/melega-smart-router/wrapper/MelegaSmartRouterWrapper.abi.json`

## Deployment checklist

See `WRAPPER_DEPLOYMENT_CHECKLIST` in `wrapper/spec.ts`
