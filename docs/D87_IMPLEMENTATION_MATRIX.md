# D87 Implementation Matrix

**Mission:** D87-01 Treasury Truth Activation  
**Status:** ACTIVE — tracks D87 economic convergence  
**Authority:** [`DEX_CONSTITUTION.md`](./DEX_CONSTITUTION.md) · [`TREASURY_SETTLEMENT_ARCHITECTURE.md`](./TREASURY_SETTLEMENT_ARCHITECTURE.md)  
**Companion:** [`DEX_IMPLEMENTATION_MATRIX.md`](./DEX_IMPLEMENTATION_MATRIX.md)

---

## D87 definition

**Explainability · Observability · Bounded Autonomy · Treasury Truth**

---

## Status legend

| Status | Meaning |
|--------|---------|
| **Not Started** | No architecture or code |
| **Partial** | Architecture or read model exists; loop not closed |
| **Ready** | Constitutional loop operational with verified evidence |

---

## D87 convergence matrix

| Dimension | Status | Evidence | Next gate |
|-----------|--------|----------|-----------|
| **Treasury Truth** | **Partial** | D87-03 DEX handoff live; Treasury Runtime owns normalization | Treasury Runtime ingestion + registry |
| **Settlement** | **Partial** | DEX sends receipts; canonical events from Treasury Runtime | Treasury Runtime settlement publish |
| **Referral** | **Not Started** | Zero codebase references; waterfall slot reserved with `not_indexed` | Referral architecture mission |
| **Economic Intelligence** | **Partial** | Organ 00 spec ratified; not implemented | EIE mission post-treasury ingestion |
| **Pricing** | **Partial** | Swap fees in `config/constants/info.ts`; all service SKUs undefined | Per-service constitutional pricing |
| **Revenue** | **Partial** | On-chain swap fees exist; not ingested to Treasury Runtime | Phase C ingestion |
| **Registry** | **Partial** | 1 project, 5 infrastructure events; no settlement registry | `/registry/treasury/*` publish |
| **MARCO Utility** | **Partial** | Canonical asset declared; `treasuryCompatible: planned`; optional in execution | Treasury SKU + service payment rails |
| **Civilization Economy** | **Partial** | Activation pipeline 0% READY; economic-runtime read model only | Close activation stages B→F |

---

## Settlement module tracker

| Module | Settlement status | Phase | Notes |
|--------|-------------------|-------|-------|
| Trade | Partial | B/D87-03 | DEX receipt handoff; Treasury normalizes |
| Liquidity | Not Started | E | Operation settlements planned |
| Pools | Not Started | E | Operation settlements planned |
| Farms | Not Started | E | Operation settlements planned |
| Projects | Not Started | F | Listing fee SKU undefined |
| Radar | N/A | — | No settlements by design |
| Collectibles | Not Started | F | No pricing |
| Build Studio | Not Started | F | Optional services unpriced |
| Import Token | N/A | — | Defers to Projects |
| Command Center | Partial | D | Read path specified; not wired |
| Space | Not Started | F | External; invoice bridge planned |
| SmartDrop | Not Started | F | Activation PLANNED |
| Labs | Not Started | F | Pipeline `execution_enabled: false` |
| Referral | Not Started | G | Subsystem absent |
| Future | Not Started | — | Requires producer registration |

---

## Treasury Truth checklist

| Requirement | Status |
|-------------|--------|
| Single settlement schema | ✅ `TREASURY_EVENT_SCHEMA.md` |
| Single truth owner (Treasury Runtime) | ✅ Specified — not implemented |
| Settlement-only ingestion | ✅ Specified |
| No UI/router/wallet ingestion | ✅ Specified |
| Fee waterfall machine-readable | ✅ `melega.fee-waterfall.v1` |
| Referral slot honest (not indexed) | ✅ |
| Empty state honest (no fabrication) | ✅ |
| Command Center reads only | ✅ Specified — Phase D |
| Project attribution explainability | ✅ Specified — Phase F |
| DEX receipt handoff module | ✅ `lib/treasury-handoff/` |
| API proxy `/api/treasury/settlement-events` | ✅ |
| Forbidden waterfall fields in DEX payload | ✅ |
| Settlement reference store (not truth) | ✅ |
| ≥1 verified settlement ingested by Treasury Runtime | ❌ (external dependency) |

---

## D87 pillar alignment

| Pillar | Status | Gap |
|--------|--------|-----|
| Explainability | **Partial** | Schema + evidence model ready; EIE not live |
| Observability | **Partial** | Settlement publication path defined; nothing indexed |
| Bounded Autonomy | **Ready** | Execution layers forbidden from owning settlements |
| Treasury Truth | **Partial** | Architecture complete; ingestion blocked at Phase B |

---

## Mission dependency graph

```
D87-01 (Architecture) ✅
    ↓
D87-02 (Trade Settlement Producer) — Phase B
    ↓
D87-03 (Treasury Runtime Ingestion) — Phase C
    ↓
D87-04 (Command Center Treasury Read) — Phase D
    ↓
D87-05 (Operation Settlements) — Phase E
    ↓
D87-06 (Service + Project Attribution) — Phase F
    ↓
Referral Mission — Phase G
    ↓
EIE Implementation — post-treasury
```

---

## Change log

| Date | Change |
|------|--------|
| 2026-07-03 | D87-03 — DEX receipt handoff to Treasury Runtime |
| 2026-07-03 | D87-01 — Treasury Truth architecture frozen; matrix created |

---

## Amendment rule

Any change to settlement schema, waterfall policy, or ownership boundaries requires update to:

1. `TREASURY_EVENT_SCHEMA.md`
2. `TREASURY_SETTLEMENT_ARCHITECTURE.md`
3. This matrix
4. `DEX_IMPLEMENTATION_MATRIX.md` (if runtime layer affected)
