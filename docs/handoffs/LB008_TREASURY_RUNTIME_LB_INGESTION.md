# LB008 Handoff — Treasury Runtime Liquidity Building Receipt Ingestion

**Status:** REQUIRED — NOT IMPLEMENTED  
**Blockers:** LB-G04B, LB-G04C, LB-G12  
**Canonical Runtime URL:** https://treasury.melega.ai  

Verified remote for Treasury Runtime (outside MelegaSwapV2 workspace):  
`meleganza/melega-kiri-treasury-runtime`  
Path observed: `/Users/marcomelega/Desktop/melega-kiri-treasury-runtime`  

MelegaSwapV2 must **not** host a parallel Treasury economic authority. Implement ingestion only in the Treasury Runtime repository.

## Canonical receiver

No production-capable LB fee receiver was identified on chain-56:

| Candidate | Address | Verdict |
| --- | --- | --- |
| Vault | `0xb2d57B1A40E61AAb3F88361228E1188E0fB6A21C` | Rejected — role unproven for LB Sink |
| Treasury label | `0xb6436EF4c7f76bE0f26c0C5C9dB72F2689abF65b` | Rejected — EIP-7702 designator |
| Fee collector | `0xb5a8707FfA045E0FC7db6eFC63161e853C80139a` | Rejected — EOA |

**Required:** implement `TreasuryLiquidityBuildingReceiverV1` (or equivalent) inside Treasury / D99 custody boundary, then bind immutable `LiquidityBuildingTreasuryFeeSinkV1(receiver)`.

## Schema

`melega.treasury.liquidity-building-settlement.v1`

Minimum fields: schemaVersion, chainId, Factory, Factory version, Program, Program ID, owner, project token, quote asset, pair, execution ID, epoch ID, Sink, Treasury receiver, settlement key, settlement receipt, authorization reference, fee amount (base-unit string), quote decimals, tx hash, block number/timestamp, log index, finality depth, ingestion/accounting/reconciliation status, source event refs, observed/finalized/ingested timestamps.

## Source events (MelegaSwapV2 contracts)

1. `LiquidityBuildingFeeSettled` — `LiquidityBuildingTreasuryFeeSinkV1`
2. Treasury receiver intake event (new)
3. `ExecutionCompleted` — `LiquidityBuildingProgramV1`
4. Transaction receipt + Factory registration + deployment registry

## Idempotency identity

```
chainId + sink + settlementKey + transactionHash + logIndex
```

Do not use transaction hash alone.

## States

`OBSERVED` → `AWAITING_FINALITY` → `VALIDATING` → `RECONCILED` → `ACCOUNTED`  
Also: `REJECTED`, `REORGED`, `ERROR`

## Validation gates

Reject unless: approved chainId 56; Sink canonical; receiver matches; Program registered by canonical Factory; Factory Sink/Authorizer match; Program ID / execution ID / quote / amount / settlement receipt match; finalized; not already ingested.

## API

Extend existing Runtime receipt entry (prefer `/api/v1/receipt` with explicit LB receipt type). JSON only — never SPA HTML. Health/readiness for LB ingestion required.

## Three identities (never conflate)

1. execution ID (Program)
2. on-chain settlement receipt (Sink)
3. Treasury Runtime acknowledgement ID (references settlement receipt)

## Sink contract (MelegaSwapV2)

`contracts/liquidity-building/LiquidityBuildingTreasuryFeeSinkV1.sol` — immutable receiver; no setter; no EOA.
