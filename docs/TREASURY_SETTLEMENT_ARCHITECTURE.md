# Treasury Settlement Architecture

**Mission:** D87-01 Treasury Truth Activation  
**Status:** CANONICAL — D87 Treasury Truth layer specification  
**Authority:** [`DEX_CONSTITUTION.md`](./DEX_CONSTITUTION.md) · [`TREASURY_EVENT_SCHEMA.md`](./TREASURY_EVENT_SCHEMA.md) · [`ORGAN_00_ECONOMIC_INTELLIGENCE_ENGINE.md`](./ORGAN_00_ECONOMIC_INTELLIGENCE_ENGINE.md)

---

## 1. Constitutional objective

### Today (verified state)

```
Trade → Fee → On-chain protocol routing → End
```

- Swap fees are defined in `config/constants/info.ts` (`TOTAL_FEE`, `TREASURY_FEE`, `LP_HOLDERS_FEE`, `BUYBACK_FEE`).
- Fees are displayed in swap UI (`SwapModalFooter.tsx`).
- Treasury Runtime stage is `PLANNED` — "No treasury amounts indexed" (`activation/runtime.json`).
- `economic-runtime` is activation read model only — `execution_enabled: false`.
- KERL T2 produces `SettlementEventCandidate` with `treasuryIngestion: false`.

### Target (D87 convergence)

```
Economic Activity → Settlement Producer → Settlement Event → Treasury Runtime → EIE → Civilization
```

Treasury Runtime becomes the **single source of economic truth**. Every fee-bearing or constitutionally tracked economic activity eventually produces exactly one canonical Settlement Event.

---

## 2. Layer model

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        ECONOMIC ACTIVITY LAYER                           │
│  Trade · Liquidity · Pools · Farms · Build · Services · Future        │
└───────────────────────────────┬─────────────────────────────────────────┘
                                │ verified evidence only
┌───────────────────────────────▼─────────────────────────────────────────┐
│                     SETTLEMENT PRODUCER LAYER (NEW)                      │
│  lib/treasury-settlement/                                                │
│  - normalizes on-chain receipts & signed service invoices                │
│  - applies fee waterfall policy                                          │
│  - emits melega.settlement-event.v1                                      │
│  - NEVER reads UI/router/wallet state directly                           │
└───────────────────────────────┬─────────────────────────────────────────┘
                                │ Settlement Events only
┌───────────────────────────────▼─────────────────────────────────────────┐
│                      TREASURY RUNTIME (TRUTH OWNER)                      │
│  lib/treasury-runtime/                                                   │
│  - ingests canonical settlement events only                              │
│  - deduplicates by settlement_id                                         │
│  - aggregates current / historical / dimensional views                   │
│  - publishes /registry/treasury/*                                        │
│  - execution_enabled: false until Phase D gate                           │
└───────────────────────────────┬─────────────────────────────────────────┘
                                │ read-only artifacts
        ┌───────────────────────┼───────────────────────┐
        ▼                       ▼                       ▼
┌───────────────┐     ┌─────────────────┐     ┌─────────────────┐
│      EIE      │     │ Command Center  │     │ Projects / CC   │
│  Organ 00     │     │  reads only     │     │  attribution    │
│ interprets    │     │  never computes │     │  explainability │
└───────────────┘     └─────────────────┘     └─────────────────┘
```

---

## 3. Part I — Settlement Event Model

**Canonical schema:** [`TREASURY_EVENT_SCHEMA.md`](./TREASURY_EVENT_SCHEMA.md) (`melega.settlement-event.v1`)

Every event contains:

| Field | Present in schema |
|-------|-------------------|
| Settlement ID | `settlement_id` |
| Timestamp | `timestamp` |
| Origin Module | `origin_module` |
| Operation | `operation` |
| Wallet | `wallet` |
| Chain | `chain_id` |
| Asset | `asset` |
| Gross Amount | `amounts.gross_amount` |
| Fee Amount | `amounts.fee_amount` |
| Treasury Amount | `amounts.treasury_amount` |
| Buyback Amount | `amounts.buyback_amount` |
| LP Amount | `amounts.lp_amount` |
| Referral Amount | `amounts.referral_amount` (null + absence_reason today) |
| Destination | `destination` |
| Hash | `hash` |
| Status | `status` |
| Evidence | `evidence` |
| Version | `version` |
| Machine Readable | `machine_readable: true` |

**No duplicated formats.** Event Registry (`event-registry@0.1.0`) remains infrastructure lifecycle — not settlement.

---

## 4. Part II — Treasury Ingestion

### Ingestion contract

| Consumes | Does not consume |
|----------|------------------|
| `melega.settlement-event.v1` JSON | UI events |
| Signed service invoices (future) | Router quote state |
| KERL-promoted settlement bundles (future) | Redux swap form |
| | Wallet balance snapshots |
| | `CanonicalEventIntakeRecord` |
| | `SettlementEventCandidate` directly (must promote via Producer) |

### Ingestion pipeline

```
1. Settlement Producer submits event
2. Treasury Runtime validates schema + evidence + waterfall reconciliation
3. Deduplicate settlement_id
4. Append to immutable settlement log (Phase C storage)
5. Recompute aggregate read models (current, daily, by-module, ...)
6. Publish /registry/treasury/* with as_of + data_source
```

### Alignment with existing safety gates

- `real-event-intake`: observation only — **not** treasury ingestion path
- `execution-ingress`: `mustNeverOwn: settlement events` — preserved
- `execution-tracker`: `mustNeverOwn: settlement normalization` — preserved
- Settlement Producer is a **new module** — not retrofitted into forbidden layers

---

## 5. Part III — Economic Ownership

| Concern | Owner | Must never |
|---------|-------|------------|
| **Creates settlement** | Settlement Producer (per module adapter) | Compute treasury totals |
| **Owns treasury truth** | Treasury Runtime | Interpret economic meaning (EIE role) |
| **Owns interpretation** | Economic Intelligence Engine (Organ 00) | Own authoritative amounts |
| **Reads treasury state** | Command Center, Projects attribution | Compute, estimate, or duplicate fee math |
| **Execution lifecycle** | Execution Tracker / Ingress | Emit settlement events |
| **Fee policy constants** | `config/constants/info.ts` | Apply policy without evidence |
| **Activation progress** | `lib/economic-runtime` | Replace treasury truth aggregates |

**Duplication check:** No module other than Treasury Runtime may publish `current treasury` totals. Command Center `buildMachineSummary` v2 today has no treasury section — Phase D adds `treasury: read from Treasury Runtime API` only.

---

## 6. Part IV — Module Settlement Audit

| Module | Creates Settlement Events | Status | Event description (when active) |
|--------|---------------------------|--------|--------------------------------|
| **Trade** | YES | PLANNED (Phase B) | `swap_*` with fee waterfall from on-chain swap receipt + `TOTAL_FEE` policy |
| **Liquidity** | YES | PLANNED (Phase C) | `add_liquidity` / `remove_liquidity` — operation record; platform fee = 0 unless policy adds SKU |
| **Pools** | YES | PLANNED (Phase C) | `stake` / `unstake` / `claim` — operation record; no platform fee today |
| **Farms** | YES | PLANNED (Phase C) | `deposit` / `withdraw` / `harvest` — operation record; no platform fee today |
| **Projects** | YES | PLANNED (Phase E) | `listing_fee` / `verification_fee` when pricing defined — service settlement |
| **Radar** | NO | N/A | Observation module — no fee generation by design |
| **Collectibles** | YES | PLANNED (Phase E) | `mint` / `transfer` when fee SKU defined — currently no pricing |
| **Build Studio** | YES | PLANNED (Phase E) | `extension_activation` when optional services gain pricing |
| **Import Existing Token** | NO | N/A | Analysis only — settlement when listing fee SKU activates via Projects |
| **Command Center** | NO | N/A | Read-only aggregator — never produces settlements |
| **Space** | YES | PLANNED (Phase F) | `audit_purchase` via signed service invoice bridge |
| **SmartDrop** | YES | PLANNED (Phase F) | `smartdrop_campaign` when campaign runtime indexed |
| **Labs** | YES | PLANNED (Phase F) | `labs_narrative` when Labs economic pipeline `execution_enabled` |
| **Referral** | YES | PLANNED (Phase G) | `referral_payout` — subsystem not indexed |
| **Future modules** | YES | PLANNED | Must register producer adapter + waterfall policy before activation |

### Current verified truth

- **Zero canonical settlements indexed** in repository today.
- Event registry contains 5 `registry_derived` / `observed` infrastructure events — **not settlements**.
- KERL T2 `SettlementEventCandidate` exists — **not ingested**.

---

## 7. Part V — Treasury Waterfall

### Canonical swap waterfall

Source: `apps/web/src/config/constants/info.ts`

```
Gross trade input amount
        ↓
Gross Fee (TOTAL_FEE = 0.25% = 25 bps)
        ↓
├── LP Share      (LP_HOLDERS_FEE = 0.17% = 17 bps)
├── Treasury Share (TREASURY_FEE = 0.0225% = 2.25 bps)
├── Buyback       (BUYBACK_FEE = 0.0575% = 5.75 bps)
├── Referral      (0 bps — not_indexed)
└── Other         (reserved — 0 bps until constitutional amendment)
```

### Waterfall properties (mandatory)

| Property | Requirement |
|----------|-------------|
| Machine-readable | `waterfall` object on every fee-bearing settlement |
| Observable | Published in settlement JSON + dimensional aggregates |
| Reproducible | `policy_ref` + input `gross_amount` deterministically yields splits |
| Honest gaps | Referral slot present with `status: not_indexed` — not omitted |

### Non-swap modules

Until platform fee SKUs are constitutionally defined, Liquidity/Pools/Farms settlements publish:

- `fee_amount.decimal = "0"`
- `waterfall.gross_fee_bps = 0`
- `absence_reason: "module_not_activated"` on treasury/buyback/lp/referral splits

This records **economic activity** without fabricating platform revenue.

---

## 8. Part VI — Treasury Truth API

### Canonical outputs

| Endpoint | Content |
|----------|---------|
| `/registry/treasury/index.json` | Catalog, settlement_count, revenue_count, as_of, disclaimer |
| `/registry/treasury/current.json` | Rolling totals by destination (treasury, buyback, lp, referral) |
| `/registry/treasury/history/daily/{date}.json` | Daily aggregates |
| `/registry/treasury/history/weekly/{week}.json` | Weekly aggregates |
| `/registry/treasury/history/monthly/{month}.json` | Monthly aggregates |
| `/registry/treasury/by-module/{module}.json` | Per-module totals + event count |
| `/registry/treasury/by-chain/{chainId}.json` | Per-chain totals |
| `/registry/treasury/by-asset/{ref}.json` | Per-asset totals |
| `/registry/treasury/by-wallet/{address}.json` | Per-wallet contribution (gated) |
| `/registry/treasury/settlements/{id}.json` | Individual settlement event |

### Response envelope (all endpoints)

```json
{
  "manifest": "manifest://melega/platform/treasury-runtime@0.2.0",
  "api_version": "0.2.0",
  "schema": "melega.treasury-runtime.v1",
  "read_only": true,
  "execution_enabled": false,
  "data_source": "treasury-runtime",
  "as_of": "ISO-8601",
  "settlement_count": 0,
  "revenue_count": 0,
  "disclaimer": "..."
}
```

### Count definitions

| Metric | Definition |
|--------|------------|
| `settlement_count` | All ingested canonical events (including zero-fee operations) |
| `revenue_count` | Settlements where `fee_amount > 0` |

**Today:** All counts = 0. Manifests must state absence explicitly.

---

## 9. Part VII — Command Center integration

### Rules

| Rule | Enforcement |
|------|-------------|
| Reads Treasury Runtime | `useTreasuryRuntime()` — new read hook |
| Never computes fees | Remove any future inline fee math |
| Never estimates | Display `null` / "not indexed" when treasury empty |
| Display fields | Treasury Contribution, Fees Generated, Economic Impact, D87 Contribution |

### Machine summary extension (Phase D)

`melega.command-center.v3` adds:

```json
{
  "treasury": {
    "source": "treasury-runtime",
    "settlement_count": 0,
    "fees_generated": null,
    "treasury_contribution": null,
    "d87_contribution": "treasury_truth_not_indexed",
    "absence_reason": "no_canonical_settlements"
  }
}
```

Values are **passthrough** from Treasury Runtime — Command Center formatters map shapes only.

---

## 10. Part VIII — Project contribution

Every imported project (via `registry/projects`) receives explainability attribution when settlements include `evidence.correlation.project_slug`.

| Field | Source | Today |
|-------|--------|-------|
| Treasury Contribution | Sum of `treasury_amount` for project_slug | `null` — no settlements |
| Fees Generated | Sum of `fee_amount` for project_slug | `null` |
| Reward Generated | Farms/pools reward settlements (operation class) | `null` |
| MARCO Generated | MARCO-denominated gross in/out per project | `null` |
| Civilization Contribution | EIE synthesis over above | Spec only |

Published at:

```
/registry/projects/{slug}/economic-contribution.json
```

**Explainability only** — not investment ranking. Inherits Projects disclaimer.

---

## 11. Part IX — MARCO economy (constitutional utility)

MARCO is the **canonical asset** (`activation-types.ts`: `canonicalAsset: 'MARCO'`). Mandatory utility is declared only where constitution requires — not arbitrary gating.

| Surface | MARCO role | Mandatory? | Status |
|---------|------------|------------|--------|
| Trade fee denomination | Settlement asset ref | Optional | Live pairs include MARCO |
| Treasury settlement | Canonical treasury asset SKU | **Planned** | `treasuryCompatible: planned` |
| Builder templates | Payment for deploy prep (future) | **Planned** | Pricing undefined |
| Infrastructure extensions | Payment rail (future) | **Planned** | No SKU |
| Professional services (Space) | Payment option (future) | **Planned** | External |
| Reward MARCO holders | Buyback + distribution loop | **Planned** | Buyback bps defined; ingestion missing |
| Referral payouts | MARCO referral wallet (future) | **Planned** | Subsystem missing |
| Collectibles | Civilization rights | Optional | No MARCO gate |

**No arbitrary MARCO requirements** until pricing SKU is constitutionally ratified per service.

---

## 12. Relationship to existing modules

| Module | Relationship |
|--------|--------------|
| `lib/economic-runtime` | Activation session progress — remains separate from treasury aggregates |
| `lib/economic-activation` | Pipeline stages; `treasury_runtime` stage advances when ingestion live |
| `lib/real-event-intake` | Observation path — does not feed treasury |
| `lib/execution-modes` | Candidate producer — promotes via Settlement Producer in Phase B |
| Event Registry | Infrastructure events — parallel track, not merged into settlement schema |
| KERL boundary | Execution decides externally; settlement records outcome |

---

## 13. D87 alignment

| D87 pillar | Treasury Truth activation impact |
|------------|----------------------------------|
| **Explainability** | Every amount traces to evidence + waterfall policy |
| **Observability** | Settlement events + dimensional aggregates published |
| **Bounded Autonomy** | Producers emit facts; EIE interprets; no agent writes treasury |
| **Treasury Truth** | Single owner, single schema, single ingestion path |

---

## 14. Non-goals (this mission)

- No UI/CSS changes
- No swap router changes
- No fabricated settlement files
- No referral implementation
- No EIE implementation (spec reference only)

See [`TREASURY_RUNTIME_ACTIVATION_PLAN.md`](./TREASURY_RUNTIME_ACTIVATION_PLAN.md) for phased code activation.
