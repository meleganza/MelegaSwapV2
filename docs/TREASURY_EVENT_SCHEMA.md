# Treasury Settlement Event Schema

**Mission:** D87-01 Treasury Truth Activation  
**Status:** CANONICAL — constitutional economic truth contract  
**Schema ID:** `melega.settlement-event.v1`  
**Authority:** [`TREASURY_SETTLEMENT_ARCHITECTURE.md`](./TREASURY_SETTLEMENT_ARCHITECTURE.md) · [`DEX_CONSTITUTION.md`](./DEX_CONSTITUTION.md)

---

## 1. Purpose

This document defines the **single canonical Settlement Event format** consumed by Treasury Runtime.

| Rule | Enforcement |
|------|-------------|
| One schema | No duplicated event formats across modules |
| Settlement only | Treasury Runtime never ingests UI, router, or wallet state |
| Evidence required | Every field with a monetary value must cite on-chain or signed-off-chain evidence |
| No fabrication | Missing amounts are `null` with explicit `absence_reason` — never estimated |
| Machine readable | JSON only; versioned; published under `/registry/treasury/settlements/` |

**Distinction from existing artifacts:**

| Artifact | Schema | Role |
|----------|--------|------|
| **Settlement Event** (this doc) | `melega.settlement-event.v1` | Canonical economic truth — Treasury ingestion |
| Settlement Event Candidate | `melega.settlement-event-candidate.v1` | KERL T2 pre-ingestion stub — `treasuryIngestion: false` |
| Event Registry record | `manifest://melega/platform/event-registry@0.1.0` | Infrastructure lifecycle — **not** fee settlement |
| Real Event Intake record | `CanonicalEventIntakeRecord` | Observation routing — **not** treasury truth |

---

## 2. Canonical object

```json
{
  "schema": "melega.settlement-event.v1",
  "version": "1.0.0",
  "settlement_id": "settlement:56:0xabc...def:swap:20260703120000",
  "timestamp": "2026-07-03T12:00:00.000Z",
  "origin_module": "trade",
  "operation": "swap_exact_in",
  "wallet": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "chain_id": 56,
  "asset": {
    "symbol": "MARCO",
    "address": "0x963556de0eb8138E97A85F0A86eE0acD159D210b",
    "decimals": 18,
    "ref": "token://56/0x963556de0eb8138E97A85F0A86eE0acD159D210b"
  },
  "amounts": {
    "gross_amount": {
      "raw": "1000000000000000000",
      "decimal": "1.0",
      "currency": "MARCO"
    },
    "fee_amount": {
      "raw": "2500000000000000",
      "decimal": "0.0025",
      "currency": "MARCO",
      "absence_reason": null
    },
    "treasury_amount": {
      "raw": "225000000000000",
      "decimal": "0.000225",
      "currency": "MARCO",
      "absence_reason": null
    },
    "buyback_amount": {
      "raw": "575000000000000",
      "decimal": "0.000575",
      "currency": "MARCO",
      "absence_reason": null
    },
    "lp_amount": {
      "raw": "1700000000000000",
      "decimal": "0.0017",
      "currency": "MARCO",
      "absence_reason": null
    },
    "referral_amount": {
      "raw": null,
      "decimal": null,
      "currency": null,
      "absence_reason": "referral_subsystem_not_indexed"
    }
  },
  "waterfall": {
    "schema": "melega.fee-waterfall.v1",
    "gross_fee_bps": 25,
    "splits": [
      { "destination": "lp_holders", "bps": 17, "amount_ref": "amounts.lp_amount" },
      { "destination": "treasury", "bps": 2.25, "amount_ref": "amounts.treasury_amount" },
      { "destination": "buyback", "bps": 5.75, "amount_ref": "amounts.buyback_amount" },
      { "destination": "referral", "bps": 0, "amount_ref": "amounts.referral_amount", "status": "not_indexed" }
    ],
    "policy_ref": "config://fees/swap@1",
    "reproducible": true
  },
  "destination": {
    "treasury_wallet": null,
    "lp_pool": "0x...",
    "buyback_wallet": null,
    "referral_wallet": null,
    "notes": "On-chain destination addresses resolved from receipt logs when indexed"
  },
  "hash": "0xabc123def4567890abcdef1234567890abcdef1234567890abcdef1234567890",
  "status": "confirmed",
  "evidence": {
    "kind": "on_chain_receipt",
    "tx_hash": "0xabc123def4567890abcdef1234567890abcdef1234567890abcdef1234567890",
    "block_number": 12345678,
    "log_index": 4,
    "data_source": "subgraph://melega/bsc-v2",
    "as_of": "2026-07-03T12:00:05.000Z",
    "correlation": {
      "instruction_id": null,
      "execution_id": null,
      "project_slug": "melega-dex",
      "venue_slug": null
    }
  },
  "machine_readable": true,
  "disclaimer": "Canonical settlement — derived from verified on-chain evidence only."
}
```

> **Note:** The example above illustrates field shape. Live ingestion must not publish example amounts until evidence exists. Empty treasury index = zero settlement files, not fabricated samples.

---

## 3. Required fields

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `schema` | `string` | ✅ | Always `melega.settlement-event.v1` |
| `version` | `string` | ✅ | Semver of this schema document |
| `settlement_id` | `string` | ✅ | Globally unique; deterministic from evidence |
| `timestamp` | `ISO-8601` | ✅ | Block time or signed service timestamp |
| `origin_module` | `SettlementOriginModule` | ✅ | See §4 |
| `operation` | `string` | ✅ | Module-specific operation enum |
| `wallet` | `address \| null` | ✅ | Initiator; `null` only for system-origin events with evidence |
| `chain_id` | `number` | ✅ | EVM chain id |
| `asset` | `SettlementAsset` | ✅ | Primary settled asset |
| `amounts` | `SettlementAmounts` | ✅ | All split fields present; use `absence_reason` when null |
| `waterfall` | `FeeWaterfall` | ✅ | Machine-readable split policy |
| `destination` | `SettlementDestinations` | ✅ | Resolved addresses or explicit null + notes |
| `hash` | `string` | ✅ | Primary evidence hash (tx hash or signed doc hash) |
| `status` | `SettlementStatus` | ✅ | Lifecycle state |
| `evidence` | `SettlementEvidence` | ✅ | Traceable proof bundle |
| `machine_readable` | `true` | ✅ | Always true for canonical events |

---

## 4. Enumerations

### 4.1 `SettlementOriginModule`

```
trade | liquidity | pools | farms | build | projects | collectibles
| space | smartdrop | labs | referral | future
```

### 4.2 `SettlementStatus`

| Status | Meaning |
|--------|---------|
| `pending` | Evidence submitted; confirmation in progress |
| `confirmed` | Evidence verified; ingested into Treasury Runtime |
| `failed` | Operation failed; no treasury credit |
| `reversed` | On-chain reversal or clawback recorded |
| `absent` | Operation occurred; fee evidence not yet indexed |

### 4.3 Trade `operation` values (Phase B)

```
swap_exact_in | swap_exact_out | swap_multi
```

### 4.3 Liquidity `operation` values (Phase C)

```
add_liquidity | remove_liquidity
```

### 4.3 Pools / Farms `operation` values (Phase C)

```
stake | unstake | claim | harvest | deposit | withdraw
```

### 4.4 Service `operation` values (Phase E+)

```
extension_activation | audit_purchase | smartdrop_campaign | labs_narrative | listing_fee
```

---

## 5. Amount rules

### 5.1 `SettlementAmounts`

Every amount sub-object:

```typescript
interface SettlementAmountField {
  raw: string | null       // integer string in smallest unit
  decimal: string | null   // decimal string — never float
  currency: string | null  // symbol or ISO if fiat service
  absence_reason: string | null
}
```

| Field | When null is allowed |
|-------|---------------------|
| `gross_amount` | Never for confirmed fee settlements |
| `fee_amount` | Operation-only settlements with zero platform fee |
| `treasury_amount` | When waterfall policy assigns 0 bps to treasury |
| `buyback_amount` | When policy assigns 0 bps |
| `lp_amount` | When operation has no LP fee component |
| `referral_amount` | **Always null today** — `referral_subsystem_not_indexed` |

### 5.2 Absence reason vocabulary (closed set)

```
referral_subsystem_not_indexed
fee_evidence_not_indexed
receipt_logs_incomplete
service_pricing_not_defined
off_chain_settlement_pending
module_not_activated
```

---

## 6. Fee waterfall schema (`melega.fee-waterfall.v1`)

Canonical swap policy (from `apps/web/src/config/constants/info.ts`):

| Destination | Share of trade volume | bps of gross |
|-------------|----------------------|--------------|
| LP holders | `LP_HOLDERS_FEE` = 0.0017 | 17 |
| Treasury | `TREASURY_FEE` = 0.000225 | 2.25 |
| Buyback | `BUYBACK_FEE` = 0.000575 | 5.75 |
| Referral | not defined | 0 (not indexed) |
| **Total fee** | `TOTAL_FEE` = 0.0025 | 25 |

**Waterfall rules:**

1. `gross_fee_bps` + `splits[].bps` must reconcile to policy_ref.
2. Every split must reference an `amount_ref` or declare `status: not_indexed`.
3. Splits are computed from **verified input amount** — never from UI quote display.
4. Future destinations append to `splits[]` without renaming existing destinations.

---

## 7. `settlement_id` generation

Deterministic ID prevents duplicates:

```
settlement:{chain_id}:{hash}:{origin_module}:{operation}:{evidence_nonce}
```

| Component | Source |
|-----------|--------|
| `chain_id` | Event chain |
| `hash` | Tx hash or signed document hash (lowercase) |
| `origin_module` | Producer module |
| `operation` | Operation enum |
| `evidence_nonce` | Log index, instruction id, or service invoice id |

Treasury Runtime rejects duplicate `settlement_id`.

---

## 8. Evidence requirements

| `evidence.kind` | Required for |
|-----------------|--------------|
| `on_chain_receipt` | Trade, Liquidity, Pools, Farms |
| `signed_service_invoice` | Space, SmartDrop, Labs, Build paid extensions |
| `registry_attestation` | Projects listing fees (future) |
| `kerl_execution_bundle` | KERL-certified execution path |

**Mandatory evidence fields:**

- `tx_hash` or `signed_doc_hash`
- `data_source` (URI identifying indexer, subgraph, or service)
- `as_of`
- `correlation.project_slug` when project-attributable

**Forbidden as evidence:**

- Redux swap form state
- Router quote objects
- Wallet balance snapshots
- UI-displayed fee percentages without receipt derivation

---

## 9. Candidate → canonical promotion

`melega.settlement-event-candidate.v1` (KERL T2) promotes to canonical only when:

| Candidate field | Canonical requirement |
|-----------------|----------------------|
| `txHash` present | Maps to `hash` + `evidence.tx_hash` |
| `treasuryIngestion: false` | Must become ingestion workflow, not inline mutation |
| Missing amounts | Must be computed by Settlement Producer from receipt — not copied from candidate |

Promotion is performed by **Settlement Producer** — not Execution Ingress, not Execution Tracker.

---

## 10. Publication layout

```
/registry/treasury/
  index.json                          # catalog + counts + as_of
  current.json                        # rolling treasury totals
  history/
    daily/{YYYY-MM-DD}.json
    weekly/{YYYY-Www}.json
    monthly/{YYYY-MM}.json
  by-module/{origin_module}.json
  by-chain/{chain_id}.json
  by-asset/{asset_ref}.json
  by-wallet/{address}.json            # privacy-gated; aggregate only in public index
  settlements/
    {settlement_id}.json              # individual canonical events
```

**Empty index rule:** When no settlements are indexed, manifests publish:

```json
{
  "settlement_count": 0,
  "revenue_count": 0,
  "disclaimer": "No canonical settlements indexed — not a zero balance claim.",
  "data_source": "treasury-runtime",
  "as_of": "..."
}
```

---

## 11. Validation rules

Treasury Runtime ingestion rejects events when:

1. `schema` ≠ `melega.settlement-event.v1`
2. `settlement_id` already ingested
3. `hash` missing or malformed
4. `amounts.*.decimal` present without `evidence` chain
5. `waterfall.splits` do not reconcile to `policy_ref`
6. `referral_amount` non-null without referral subsystem activation
7. Any forbidden field from execution layers (`missionLogic`, `router_execute`, etc.)

---

## 12. Versioning

| Version | Change |
|---------|--------|
| `1.0.0` | D87-01 initial canonical schema |

Amendments require update to this document, `TREASURY_SETTLEMENT_ARCHITECTURE.md`, and `D87_IMPLEMENTATION_MATRIX.md`.
