# DEX Treasury Handoff Report — D87-03

**Mission:** D87-03 DEX Receipt → Treasury Settlement Handoff  
**Date:** 2026-07-03  
**Branch:** `design-system-foundation`  
**Verdict:** `D87_DEX_TREASURY_HANDOFF_READY`

---

## Objective

Connect Melega DEX verified swap receipts to Treasury Runtime settlement ingestion **without DEX owning settlement truth**.

```
SmartSwap confirmed receipt
        ↓
Execution receipt payload (melega.dex-execution-receipt.v1)
        ↓
POST /api/treasury/settlement-events  (same-origin proxy)
        ↓
Treasury Runtime /api/public/treasury/settlement-events
        ↓
Settlement Event (Treasury-owned)
        ↓
DEX stores settlement reference only
```

---

## Ownership proof

| Concern | Owner | DEX role |
|---------|-------|----------|
| Settlement normalization | **Treasury Runtime** | None |
| Settlement ID | **Treasury Runtime** | Stores returned `settlement_id` only |
| Fee waterfall (LP/Treasury/Buyback/Referral) | **Treasury Runtime** | **Never computed in DEX** |
| Execution receipt | **DEX** | Submits verified fields only |
| Settlement reference | **DEX** | `txHash → settlementStatus, settlementId` |

**Forbidden in DEX handoff payload:** `settlement_id`, `lp_amount`, `treasury_amount`, `buyback_amount`, `referral_amount`, `waterfall`, `amounts`.

Enforced by `lib/treasury-handoff/ownership.ts` + API route validation.

---

## Implementation

### Module: `lib/treasury-handoff/`

| File | Role |
|------|------|
| `types.ts` | Receipt payload + settlement reference types |
| `ownership.ts` | Forbidden field guard |
| `config.ts` | `TREASURY_RUNTIME_URL` / `NEXT_PUBLIC_TREASURY_RUNTIME_URL` |
| `buildSwapHandoffContext.ts` | Capture swap context at submit (execution metadata) |
| `buildExecutionReceiptPayload.ts` | Build receipt on confirmation |
| `submitSettlementHandoff.ts` | POST with retry; tolerate `DUPLICATE_SETTLEMENT` |
| `settlementReferenceStore.ts` | Reference storage — not treasury truth |
| `formatTradeSettlementMetadata.ts` | Machine-readable trade metadata |

### API proxy: `pages/api/treasury/settlement-events.ts`

- Server-side forward to `${TREASURY_RUNTIME_URL}/api/public/treasury/settlement-events`
- Returns `503` when Treasury Runtime URL not configured
- Rejects forbidden settlement fields before proxy

### Transaction wiring

| Location | Change |
|----------|--------|
| `useSwapCallback.ts` | Stores `settlementHandoffContext` on swap submit |
| `treasuryHandoffUpdater.tsx` | On confirmed swap receipt → submit handoff |
| `index.tsx` | Mounts `TreasuryHandoffUpdater` per chain |
| `useTradeSwapRuntime.ts` | Machine JSON includes `settlement` metadata |

---

## Receipt payload (DEX sends)

| Field | Source |
|-------|--------|
| `transactionHash` | Confirmed receipt |
| `wallet` | Transaction `from` |
| `chain` | Active chain id |
| `timestamp` | Receipt confirmation time |
| `status` | `confirmed` / `failed` |
| `asset` | Swap input token (context at submit) |
| `amount` | Swap input amount |
| `fee` | Gross protocol fee on input (execution metadata — not waterfall) |
| `operation` | `swap` |
| `explorerUrl` | Block explorer link |
| `originModule` | `trade` |
| `originProject` | `melega-dex` when MARCO involved |

---

## Treasury response (DEX stores)

| Field | Stored on |
|-------|-----------|
| `settlement_id` | `SettlementReference.settlementId` |
| `status` | Mapped to `SETTLEMENT_*` enum |
| `machine_code` | `SettlementReference.machineCode` |
| `reason` | `SettlementReference.reason` |

---

## Failure behavior

| Condition | Swap UX | Settlement status |
|-----------|---------|-------------------|
| Treasury unavailable | **Success preserved** | `SETTLEMENT_PENDING` |
| Treasury not configured | **Success preserved** | `SETTLEMENT_PENDING` + `not_configured` |
| Duplicate tx hash | **Success preserved** | `SETTLEMENT_DUPLICATE` |
| Rejected receipt | **Success preserved** | `SETTLEMENT_REJECTED` + machine code |

Retries: 3 attempts with backoff on network/5xx errors.

---

## Environment

```bash
# Preferred — server-side proxy (not exposed to client)
TREASURY_RUNTIME_URL=https://treasury.example.com

# Fallback — documented for direct configuration
NEXT_PUBLIC_TREASURY_RUNTIME_URL=
```

Client always POSTs to same-origin `/api/treasury/settlement-events`.

---

## Machine-readable metadata

Trade runtime machine JSON (`TradeMachinePayload`) includes:

```json
{
  "settlement": {
    "txHash": "0x...",
    "settlementStatus": "SETTLEMENT_ACCEPTED",
    "settlementId": "settlement:56:0x...",
    "machineCode": null,
    "treasuryRuntimeEndpointStatus": "available"
  }
}
```

---

## Validation

| Check | Result |
|-------|--------|
| `yarn build` | PASS |
| `yarn test src/design-system` | 11/11 PASS |
| `yarn test src/lib/homepage-live` | 2/2 PASS |
| `yarn test src/lib/treasury-handoff` | 7/7 PASS |

---

## Related docs

- [`TREASURY_SETTLEMENT_ARCHITECTURE.md`](./TREASURY_SETTLEMENT_ARCHITECTURE.md)
- [`TREASURY_EVENT_SCHEMA.md`](./TREASURY_EVENT_SCHEMA.md)
- [`D87_IMPLEMENTATION_MATRIX.md`](./D87_IMPLEMENTATION_MATRIX.md)

---

## Non-goals (honored)

- No UI/CSS redesign
- No treasury calculations inside DEX
- No settlement normalization inside DEX
- No fabricated settlement IDs or amounts
