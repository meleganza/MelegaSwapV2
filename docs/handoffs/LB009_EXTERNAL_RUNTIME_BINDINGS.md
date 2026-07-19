# LB009 Handoff — External Runtime Bindings Still Required

## Verified repository origins

| System | Origin | Local path | Modified in LB009? |
| --- | --- | --- | --- |
| MelegaSwapV2 | `https://github.com/meleganza/MelegaSwapV2.git` | Projects/MelegaSwapV2 | Yes |
| Treasury Runtime | `https://github.com/meleganza/melega-kiri-treasury-runtime.git` | Desktop/melega-kiri-treasury-runtime (`phase-a-topology-clean`) | **No** — handoff only |
| KERL KMS adapter | Not a separate writable sibling under Projects/ | In-repo `kerl-signing-gate` shows KMS_HSM MISSING | **No** production adapter |

## Required in Treasury Runtime (`melega-kiri-treasury-runtime`)

Implement LB settlement ingestion per `docs/handoffs/LB008_TREASURY_RUNTIME_LB_INGESTION.md`:

- schema `melega.treasury.liquidity-building-settlement.v1`
- ingest `LiquidityBuildingFeeSettled` + Program `ExecutionCompleted`
- idempotency: `chainId+sink+settlementKey+txHash+logIndex`
- states through ACCOUNTED
- JSON APIs (never SPA HTML)

MelegaSwapV2 provides local validation rules in `apps/web/src/lib/liquidity-building-runtime/treasury-integration.ts` but keeps `ready=false`.

## Required for KMS signing

Implement LB008 handoff pipeline in verified KERL/execution signing service:

- typed ExecutionIntent only
- DER decode, low-s, recovery ID
- Authorizer validation
- no HOT_SIGNER / private key fallback

MelegaSwapV2 exposes `DisabledLiquidityBuildingKmsSigner` until provisioned.

## Required for permissionless relay

Deploy a gas-funded relay that:

- submits opaque calldata only
- never signs
- never alters economics
- tracks nonce/retry/replacement

MelegaSwapV2 exposes `DisabledLiquidityBuildingRelay` (LB-G03C open).
