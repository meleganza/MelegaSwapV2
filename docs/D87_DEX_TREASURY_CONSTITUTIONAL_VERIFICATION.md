# D87 DEX Treasury Constitutional Verification

**Mission:** D87-03 Constitutional Verification (pre-commit)  
**Date:** 2026-07-04  
**Type:** Read-only audit — no code modified  
**Scope:** `lib/treasury-handoff/`, `/api/treasury/settlement-events`, transaction handoff wiring  
**Authority:** [`TREASURY_SETTLEMENT_ARCHITECTURE.md`](./TREASURY_SETTLEMENT_ARCHITECTURE.md) · [`DEX_TREASURY_HANDOFF_REPORT.md`](./DEX_TREASURY_HANDOFF_REPORT.md)

---

## Method

Inspected implementation files and tests. No runtime execution. Truth over continuity.

| Area inspected | Path |
|----------------|------|
| Handoff types & ownership | `apps/web/src/lib/treasury-handoff/` |
| API proxy | `apps/web/src/pages/api/treasury/settlement-events.ts` |
| Receipt trigger | `apps/web/src/state/transactions/treasuryHandoffUpdater.tsx` |
| Context capture | `apps/web/src/views/Swap/SmartSwap/hooks/useSwapCallback.ts` |
| Execution boundary | `apps/web/src/lib/execution-ingress/ownership.ts` |
| Tests | `apps/web/src/lib/treasury-handoff/__tests__/treasury-handoff.test.ts` |

---

## Question 1 — Does DEX own Settlement?

**Answer: NO**

| Evidence | Finding |
|----------|---------|
| `submitSettlementHandoff.ts` | POSTs receipt; stores Treasury **response** only |
| `settlementReferenceStore.ts` | Holds `settlementId`, `settlementStatus` as **reference** — not truth |
| `ownership.ts` | `mustNeverOwn`: settlement normalization, settlement_id generation, treasury truth |
| Forbidden outbound fields | `settlement_id` blocked from DEX payload |
| Inbound only | `settlement_id` arrives **from** Treasury Runtime response |

DEX never generates `melega.settlement-event.v1`. It never publishes `/registry/treasury/*`. Settlement ownership remains with Treasury Runtime.

---

## Question 2 — Does DEX compute any Treasury waterfall?

**Answer: NO**

| Check | Result |
|-------|--------|
| `TREASURY_FEE`, `LP_HOLDERS_FEE`, `BUYBACK_FEE` in `lib/treasury-handoff/` | **Not imported** |
| `waterfall` object in outbound payload | **Absent** |
| `amounts.treasury_amount` / split fields | **Absent** |
| `buildSwapHandoffContext.ts` | Uses `TOTAL_FEE` only → single **gross** protocol fee scalar |
| Tests | Assert payload has no `waterfall`, `treasury_amount`, `lp_amount`, `buyback_amount`, `referral_amount` |

**Note:** DEX computes one gross fee hint (`input × TOTAL_FEE`) labeled execution metadata in `types.ts`. This is **not** a treasury waterfall — no destination splits, no treasury share isolation, no policy reconciliation object.

---

## Question 3 — Does DEX compute LP allocation?

**Answer: NO**

No LP amount computation exists in `lib/treasury-handoff/`. `LP_HOLDERS_FEE` is not referenced. Forbidden field `lp_amount` / `lpAmount` is blocked by `assertPayloadDoesNotOwnSettlement`.

---

## Question 4 — Does DEX compute Buyback?

**Answer: NO**

No buyback computation exists in `lib/treasury-handoff/`. `BUYBACK_FEE` is not referenced. Forbidden field `buyback_amount` / `buybackAmount` is blocked.

---

## Question 5 — Does DEX compute Referral distribution?

**Answer: NO**

Referral subsystem is absent from codebase. No referral amount computation. Forbidden field `referral_amount` / `referralAmount` is blocked. Tests explicitly assert absence.

---

## Question 6 — Does DEX send only Execution Evidence?

**Answer: YES — with one constitutional caveat on hint fields**

### Transmitted fields (`melega.dex-execution-receipt.v1`)

| Field | Source at handoff | Classification | Treasury-authoritative? |
|-------|-------------------|----------------|------------------------|
| `schema` | DEX envelope | Protocol metadata | No |
| `transactionHash` | Confirmed receipt | **Execution evidence** | No — pointer to chain truth |
| `wallet` | `tx.from` / receipt | **Execution evidence** | No |
| `chain` | Active chain id | **Execution evidence** | No |
| `timestamp` | `confirmedTime` / receipt finalization | **Execution evidence** | No |
| `status` | `receipt.status === 1` | **Execution evidence** | No |
| `asset` | Swap quote at **submit** (stored context) | **Non-authoritative hint** | Yes — Treasury normalizes from chain |
| `amount` | Swap quote at **submit** (stored context) | **Non-authoritative hint** | Yes — Treasury derives from logs |
| `fee` | `input × TOTAL_FEE` at **submit** | **Non-authoritative hint** (gross only) | Yes — Treasury applies waterfall policy |
| `operation` | Constant `swap` | Execution metadata | No |
| `explorerUrl` | Derived from `transactionHash` + chain | **Evidence pointer** | No |
| `originModule` | Constant `trade` | Execution metadata | No |
| `originProject` | MARCO address heuristic | Attribution hint | Yes — Treasury confirms attribution |

### Fields constitutionally owned by Treasury Runtime — verified NOT sent

| Treasury-owned field | Sent by DEX? |
|---------------------|--------------|
| `settlement_id` | **NO** — forbidden |
| `lp_amount` | **NO** — forbidden |
| `treasury_amount` | **NO** — forbidden |
| `buyback_amount` | **NO** — forbidden |
| `referral_amount` | **NO** — forbidden |
| `waterfall` | **NO** — forbidden |
| `amounts` (settlement splits object) | **NO** — forbidden |

### Caveat (non-violation, operational requirement)

`asset`, `amount`, and `fee` are captured at swap **submit** from router quote state (`buildSwapHandoffContext` in `useSwapCallback.ts`), not re-parsed from receipt logs at confirmation. They are **convenience hints**, not authoritative settlement inputs.

**Constitutional requirement on Treasury Runtime:** Must treat `transactionHash` + on-chain receipt as authoritative. Must not trust DEX `amount` or `fee` for settlement normalization without chain verification.

Proxy route (`settlement-events.ts`) re-validates forbidden fields before forward — no enrichment added.

---

## Question 7 — Can Treasury Runtime reconstruct the Settlement Event without trusting DEX economic calculations?

**Answer: YES**

| Authoritative reconstruction path | Available? |
|-----------------------------------|------------|
| `transactionHash` | ✅ |
| `chain` | ✅ |
| `explorerUrl` | ✅ |
| `wallet` | ✅ (verifiable on-chain) |
| `status` | ✅ (verifiable from receipt) |

Treasury Runtime can:

1. Fetch transaction receipt and logs via `transactionHash` + `chain`
2. Derive executed input/output amounts from on-chain events
3. Apply fee policy (`config/constants/info.ts` equivalents on Treasury side) to compute waterfall
4. Emit canonical `melega.settlement-event.v1` without using DEX `amount` or `fee`

DEX hints are **optional accelerators**. Settlement truth does not depend on them.

---

## Question 8 — Can KERL still remain the only routing authority?

**Answer: YES**

| Boundary | Status |
|----------|--------|
| Handoff timing | **Post-execution only** — after confirmed swap receipt |
| `lib/treasury-handoff/` imports routing | **None** — no `@pancakeswap/smart-router`, no `useBestTrade` |
| `execution-ingress/ownership.ts` | Unchanged — `mustNeverOwn: settlement events`; treasury imports forbidden |
| `execution-tracker/ownership.ts` | Unchanged — `mustNeverOwn: settlement normalization` |
| `useSwapCallback.ts` | Routing/execution unchanged; handoff context attached **after** tx broadcast only |

Treasury handoff does not participate in route selection, slippage, asset policy, or execution instruction production. KERL routing authority boundary is preserved.

---

## Question 9 — Is any constitutional responsibility duplicated?

**Answer: NO**

| Responsibility | Owner | Duplicated in DEX handoff? |
|----------------|-------|----------------------------|
| Settlement normalization | Treasury Runtime | **No** |
| Settlement ID generation | Treasury Runtime | **No** |
| Fee waterfall splits | Treasury Runtime | **No** |
| Execution receipt submission | DEX | **Yes — sole owner** |
| Settlement reference cache | DEX | **Yes — passthrough only, not truth** |
| Gross fee **display** constant (`TOTAL_FEE`) | Swap UI + handoff hint | Shared constant, **not** treasury truth duplication |
| Activation progress read model | `economic-runtime` | Separate — not replaced by handoff |

No module publishes treasury totals. DEX stores Treasury-returned `settlement_id` as reference — not as generated truth.

---

## Question 10 — Would replacing the DEX with another execution engine leave Treasury Runtime unchanged?

**Answer: YES**

Treasury Runtime contract is **engine-agnostic**:

```
POST /api/public/treasury/settlement-events
Body: melega.dex-execution-receipt.v1 (normalized intake shape via normalizeTreasuryIntakePayload)
Response: { settlement_id, status, machine_code?, reason? }
```

Shape normalization (`chain` string, flat `asset` symbol, numeric `amount`/`fee`) is **transport mapping only** — not settlement computation.

Any replacement execution engine that:

1. Posts the same receipt schema after confirmed execution
2. Does not send forbidden settlement fields
3. Stores returned settlement reference only

…requires **zero changes** to Treasury Runtime ingestion, normalization, or waterfall logic.

Treasury Runtime does not import DEX modules, Redux state, or router hooks. Proxy URL is configurable via `TREASURY_RUNTIME_URL`.

---

## Test corroboration

`treasury-handoff.test.ts`:

- Forbidden waterfall/settlement fields absent from payload
- `assertPayloadDoesNotOwnSettlement` rejects `settlement_id` injection
- D87-03G normalizer maps numeric chain + nested asset → Treasury intake contract
- Missing fee rejects locally before POST
- Duplicate settlement tolerated (`DUPLICATE_SETTLEMENT`)
- Treasury unavailable → `SETTLEMENT_PENDING` (swap not blocked)
- Rejected settlement exposes `machine_code`
- Outbound normalized body contains no LP/treasury/buyback/referral/settlement_id fields

---

## Observations (not violations)

1. **`amount` / `fee` hint staleness:** Context captured at submit; if executed on-chain amounts differ from quote, hints may diverge. Treasury must use chain truth — satisfies Q7.
2. **`originProject` heuristic:** MARCO address set lookup; Treasury should confirm via registry, not trust blindly.
3. **Treasury Runtime external:** Ingestion endpoint not in this repo — constitutional compliance of Treasury-side normalization is assumed per D87-01 architecture, not verified in this audit.

---

## Verdict

```
D87_DEX_TREASURY_CONSTITUTION_VERIFIED
```

**Reason:** DEX does not own settlement, does not compute treasury waterfall or LP/buyback/referral splits, sends no Treasury-authoritative fields, preserves KERL/execution boundaries, stores settlement reference only, and exposes an engine-agnostic receipt contract. Gross fee hint (`TOTAL_FEE × input`) is execution metadata explicitly distinguished from waterfall normalization and is reconstructable independently by Treasury via `transactionHash`.
