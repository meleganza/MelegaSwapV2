# Treasury Runtime Activation Plan

**Mission:** D87-01 Treasury Truth Activation  
**Status:** ACTIVE — phased activation roadmap  
**Authority:** [`TREASURY_SETTLEMENT_ARCHITECTURE.md`](./TREASURY_SETTLEMENT_ARCHITECTURE.md) · [`TREASURY_EVENT_SCHEMA.md`](./TREASURY_EVENT_SCHEMA.md)

---

## 1. Current state (verified)

| Signal | Finding |
|--------|---------|
| Treasury Runtime stage | `PLANNED` — "No treasury amounts indexed" |
| Activation progress | `percentReady: 0` across 11 stages |
| `economic-runtime` | Activation read model; `execution_enabled: false` |
| Settlement candidate | `melega.settlement-event-candidate.v1` — `treasuryIngestion: false` |
| Canonical settlements | **0 indexed** |
| Referral subsystem | **Absent** |
| Fee constants | Defined in `config/constants/info.ts` |
| Command Center treasury | **Not wired** |

**Blockers before live truth:**

1. No Settlement Producer module
2. No Treasury Runtime ingestion module
3. No on-chain receipt → settlement normalizer for Trade
4. No `/registry/treasury/*` published manifests (empty catalog acceptable)
5. Economic Events stage not READY (predecessor in activation pipeline)

---

## 2. Activation phases

### Phase A — Architecture freeze (D87-01) ✅

**Deliverables:**

- [x] `TREASURY_SETTLEMENT_ARCHITECTURE.md`
- [x] `TREASURY_EVENT_SCHEMA.md`
- [x] `TREASURY_RUNTIME_ACTIVATION_PLAN.md`
- [x] `D87_IMPLEMENTATION_MATRIX.md`
- [x] Update `DEX_RUNTIME_ARCHITECTURE.md`
- [x] Update `DEX_IMPLEMENTATION_MATRIX.md`

**Gate:** Schema and ownership documented; no conflicting settlement formats.

**Verdict after Phase A:** `D87_TREASURY_TRUTH_PARTIAL`

---

### Phase B — Trade Settlement Producer

**Scope:** First fee-bearing canonical settlements from verified on-chain swap receipts.

**New modules:**

```
apps/web/src/lib/treasury-settlement/
  settlement-types.ts          # melega.settlement-event.v1 types
  settlement-validator.ts      # schema + waterfall reconciliation
  producers/
    trade-settlement-producer.ts
  promote-candidate.ts         # candidate → canonical promotion
  index.ts
```

**Inputs:**

- Confirmed transaction receipt (tx hash, block, logs)
- Subgraph or RPC log indexer — **not** `useBestTrade` quote
- Fee policy from `config/constants/info.ts`

**Outputs:**

- Canonical `melega.settlement-event.v1` per confirmed swap with fee evidence
- Reject if receipt logs incomplete (`fee_evidence_not_indexed`)

**Does not:**

- Modify swap execution path
- Read Redux swap state
- Publish estimated amounts

**Tests:**

- Waterfall reconciliation: 25 bps → 17 + 2.25 + 5.75 + 0 referral
- Duplicate `settlement_id` rejection
- Null referral with `referral_subsystem_not_indexed`
- Incomplete receipt → no event emitted

**Gate:** ≥1 verified mainnet/testnet swap produces ingested settlement with matching tx hash.

---

### Phase C — Treasury Runtime ingestion + registry publish

**Scope:** Treasury Runtime becomes truth owner.

**New modules:**

```
apps/web/src/lib/treasury-runtime/
  runtime-types.ts             # TreasuryTruthReadModel
  ingestion.ts                 # accepts settlement events only
  aggregates.ts                # current, daily, weekly, monthly
  dimensional.ts               # by-module, by-chain, by-asset, by-wallet
  serializer.ts                # /registry/treasury/* JSON
  index.ts

apps/web/public/registry/treasury/
  index.json                   # empty catalog until first settlement
```

**Pipeline:**

```
Settlement Producer → ingestSettlement(event) → append log → recompute aggregates → publish JSON
```

**Activation stage update:**

- `treasury_runtime` → `READY` when first settlement ingested and manifests published
- `economic_events` → `READY` when settlement log append operational

**Gate:**

- `/registry/treasury/current.json` reflects ingested totals only
- `settlement_count` matches append log length
- `execution_enabled` remains `false` until Phase D sign-off

---

### Phase D — Command Center treasury read

**Scope:** Command Center displays treasury truth — read only.

**Changes (runtime only, no layout redesign):**

```
apps/web/src/lib/treasury-runtime/useTreasuryRuntime.ts
apps/web/src/views/CommandCenter/commandCenterRuntime/
  buildMachineSummary.ts       # v3 treasury passthrough section
  formatTreasuryContribution.ts
```

**Rules:**

- `useCommandCenterOrchestrationRuntime` imports `useTreasuryRuntime` — not inline fee math
- Empty treasury → explicit "not indexed" — never zero fabrication
- KPI fields: Treasury Contribution, Fees Generated, Economic Impact, D87 Contribution

**Gate:** Machine summary `treasury` section sources `data_source: treasury-runtime` only.

---

### Phase E — Operation settlements (Liquidity, Pools, Farms)

**Scope:** Zero-fee operation records for constitutional activity tracking.

| Module | Operations | Platform fee |
|--------|------------|--------------|
| Liquidity | add/remove | 0 until SKU defined |
| Pools | stake/unstake/claim | 0 |
| Farms | deposit/withdraw/harvest | 0 |

**Gate:** Operation settlements include tx evidence; `fee_amount = 0`; no fabricated treasury credit.

---

### Phase F — Project attribution + service settlements

**Scope:**

- `/registry/projects/{slug}/economic-contribution.json`
- Build / Collectibles / Projects fee SKUs when constitutionally priced
- Space / SmartDrop / Labs via `signed_service_invoice` evidence bridge

**Prerequisite:** Service pricing ratification per `D87_IMPLEMENTATION_MATRIX.md` Pricing row.

---

### Phase G — Referral waterfall activation

**Scope:**

- Referral subsystem implementation (separate mission)
- `referral_amount` populated from verified payout evidence
- Waterfall `referral` split `status` → `active`

**Prerequisite:** Referral architecture mission — not part of D87-01.

---

## 3. Module implementation order

| Priority | Module | Phase | Settlement type |
|----------|--------|-------|-----------------|
| 1 | Trade | B | Fee-bearing |
| 2 | Treasury Runtime | C | Ingestion owner |
| 3 | Command Center | D | Read consumer |
| 4 | Liquidity | E | Operation |
| 5 | Pools | E | Operation |
| 6 | Farms | E | Operation |
| 7 | Projects | F | Service |
| 8 | Build Studio | F | Service |
| 9 | Collectibles | F | Service |
| 10 | Space | F | Off-chain invoice |
| 11 | SmartDrop | F | Campaign |
| 12 | Labs | F | Narrative service |
| 13 | Referral | G | Payout |
| 14 | Radar | — | No settlements |
| 15 | Command Center | — | No settlements (read only) |

---

## 4. Ownership implementation checklist

| Layer | File ownership | Forbidden imports |
|-------|----------------|-------------------|
| Settlement Producer | `lib/treasury-settlement/` | `views/*`, `useBestTrade`, Redux swap |
| Treasury Runtime | `lib/treasury-runtime/` | UI components, router hooks |
| Command Center | reads `useTreasuryRuntime` | fee computation, `config/constants/info.ts` for totals |
| Execution Ingress | unchanged | treasury-settlement, treasury-runtime |
| Execution Tracker | unchanged | settlement emission |
| Economic Runtime | activation only | settlement ingestion |

---

## 5. Registry manifest evolution

### Before Phase C

```json
{
  "manifest": "manifest://melega/platform/treasury-runtime@0.2.0",
  "settlement_count": 0,
  "revenue_count": 0,
  "disclaimer": "No canonical settlements indexed — not a zero balance claim.",
  "data_source": "treasury-runtime",
  "as_of": "2026-07-03"
}
```

### After first Trade settlement

- Append `settlements/{settlement_id}.json`
- Update `current.json` with summed `treasury_amount` from evidence
- Update `by-module/trade.json`
- Update `activation/runtime.json` treasury_runtime stage → `READY`

---

## 6. Test strategy

| Suite | Location | Coverage |
|-------|----------|----------|
| Schema validation | `treasury-settlement/__tests__/` | Required fields, absence reasons |
| Waterfall math | `treasury-settlement/__tests__/` | Policy reconciliation |
| Ingestion dedup | `treasury-runtime/__tests__/` | Duplicate rejection |
| Empty state | `treasury-runtime/__tests__/` | No fabrication on zero events |
| Command passthrough | `commandCenterRuntime/__tests__/` | Treasury read-only |
| Forbidden imports | existing ingress/tracker tests | No regression |

---

## 7. Rollback

| Phase | Rollback action |
|-------|-----------------|
| B | Disable Trade Producer; no registry publish |
| C | Clear settlement log; restore empty treasury index |
| D | Remove treasury section from machine summary v3 |
| E–G | Disable per-module producers independently |

Treasury truth rollback must not affect live swap execution.

---

## 8. Success criteria

| Criterion | Phase |
|-----------|-------|
| Canonical schema frozen | A ✅ |
| Trade settlement from tx receipt | B |
| Treasury Runtime ingests events only | C |
| `/registry/treasury/*` published | C |
| Command Center reads treasury — never computes | D |
| Project attribution manifests | F |
| Referral slot populated | G |

**Full READY verdict:** `D87_TREASURY_TRUTH_READY` — requires Phases B + C + D complete with ≥1 verified fee settlement ingested and Command Center passthrough live.

---

## 9. Mission verdict (post D87-01)

```
D87_TREASURY_TRUTH_PARTIAL
```

**Reason:** Phase A architecture is complete. Settlement Producer, Treasury ingestion, and Command Center read path are **specified but not implemented**. Zero canonical settlements indexed. Referral and service pricing remain absent.

**Next mission:** D87-02 Trade Settlement Producer (Phase B) — implementation, not architecture.
