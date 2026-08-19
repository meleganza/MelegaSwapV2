# PROTOCOL_FEE_EXECUTION_CONTRACT

A V2 route may become `PRODUCTION` execution-capable only when all of the following are true.

## Required proofs

1. Protocol fee is deterministically calculated from ratified formula (no invented bps).
2. User can see the correct fee through the **existing frozen UX** (no new fee panels).
3. Execution plan includes the fee correctly.
4. Collection is actually enforceable on-chain.
5. Fee destination is canonical treasury `0xb6436EF4c7f76bE0f26c0C5C9dB72F2689abF65b`.
6. Execution cannot claim collection when none occurred.
7. Receipt/post-state can verify the economic result.

Prefer **atomic** collection with the swap.  
Never implement a misleading second transaction and describe the fee as collected.  
Never show a fabricated fee.

## Machine-readable states

| State | Meaning | Production-capable? |
|-------|---------|---------------------|
| `FEE_UNAVAILABLE` | Cannot calculate or disclose honestly | No |
| `FEE_PREVIEW_ONLY` | Formula/display exist; not enforceable | No |
| `FEE_ENFORCEABLE` | Plan will collect atomically to treasury | Candidate |
| `FEE_VERIFIED` | Receipt proved collection | After fill |

M1 Melega adapter: **`FEE_PREVIEW_ONLY`** + `SMARTSWAP_PROTOCOL_FEE_ENFORCEMENT_GAP`.

`markFeeCollected()` throws unless state is `FEE_VERIFIED` and `collectionProven`.

## M1

No new production fee collection. No formula change. Architecture + audit + tests only.

Current production remains: swap executes; protocol fee not collected; UX already says so.
