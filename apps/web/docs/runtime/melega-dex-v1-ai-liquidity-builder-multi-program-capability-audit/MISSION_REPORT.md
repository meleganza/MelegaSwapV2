# MELEGA_DEX_V1_AI_LIQUIDITY_BUILDER_MULTI_PROGRAM_CAPABILITY_AUDIT

## Verdict

**MELEGA_DEX_V1_AI_LIQUIDITY_BUILDER_MULTI_PROGRAM_READY**

Liquidity Builder **Factory V1 already supports multiple simultaneous programs**. Uniqueness is scoped per `(owner, projectToken, quoteAsset, pair)`. No contract, Factory, or fee architecture change is required for multi-program capability.

Product UI and indexer **do not yet expose** that capability — they remain single-selection. Those are implementation gaps, not protocol redesigns.

---

## Scope

| Item | Action |
|---|---|
| Contracts | Read-only audit — **not modified** |
| Fees | **Not modified** |
| Frontend app code | **Not modified** |
| Deliverables | JSON + this report only |

---

## 1. Multiple programs per owner

**YES — on-chain.**

There is no global “one program per owner” limit. Each `baseKey` has its own active slot in `_activeByBaseKey`.

```solidity
bytes32 baseKey = computeBaseKey(owner_, projectToken, quoteAsset, pair);
address existing = _activeByBaseKey[baseKey];
if (existing != address(0)) {
    if (lifecycle != Stopped) revert DuplicateActiveProgram();
}
```

Source: `contracts/liquidity-building/LiquidityBuildingFactoryV1.sol`

---

## 2. Same token, multiple quote assets (TOKEN/WBNB, TOKEN/USDT, TOKEN/USDC)

**YES on contracts** when:

1. Quote asset is Factory-enabled (`isQuoteEnabled`)
2. Melega pair exists for `(projectToken, quoteAsset)`
3. Pair reserves are non-zero

Different quote → different baseKey → concurrent programs allowed.

**Operational note:** USDT/USDC have historically been `NotActive` (LB-G09 gas conversion). WBNB is the canary quote. Enabling additional quotes is a **policy/ops** action, not a Factory redesign.

---

## 3. Multiple tokens per owner (MARCO, MM72, EYED)

**YES.**

Different `projectToken` → different baseKey. An owner can run MARCO/WBNB and MM72/WBNB (and EYED/…) in parallel. No project-token whitelist in Factory.

---

## 4. Program uniqueness rules

| Rule | Value |
|---|---|
| Key | `owner + projectToken + quoteAsset + pair` |
| Formula | `baseKey = keccak256(abi.encode(...))` |
| Active slot | One **non-Stopped** program per baseKey |
| Recreate | Allowed after `Stopped`; `generation++`; new deterministic address |
| Global registry | `_programs[]` + `programCount` / `programAt` (all owners) |
| Owner index | **Not stored** — use `ProgramCreated` logs (indexed `owner`) |

---

## 5. Program lifecycle

### On-chain (`LBTypes.Lifecycle`)

| # | State | Mission term |
|---|---|---|
| 0 | Created | setup / awaiting deposit |
| 1 | Ready | deposited, not activated |
| 2 | Active | **active** |
| 3 | Paused | **paused** |
| 4 | SafetyPaused | **paused** (safety) |
| 5 | Stopped | **terminated** |

**Gaps vs mission wording:**

- **completed** — not an on-chain lifecycle. Reserve depletion does not auto-transition to a Completed state; `remainingBudget` may be 0 while lifecycle stays `Active`.
- **terminated** — maps to `Stopped`.

Frontend adds UX-only statuses (`BUDGET_DEPLETED`, `SETUP_REQUIRED`, etc.) in `mapProgramView.ts` / `programStatus`.

---

## 6. Existing frontend / indexer support

### Frontend — single program

- `useProgramReadModel` → one `activeProgram` call for the selected tuple
- Card / dashboard assume one program
- Factory ABI fragment omits `programCount` / `programAt`
- Portfolio hooks often pass `projectTokenAddress: null` → never resolve any program
- Passport `?program=` deep link is not consumed by Liquidity Studio

### Indexer — none for LB clones

- BSC indexer covers AMM pairs / featured markets / farms — **not** LB `ProgramCreated` or program lifecycle
- `/api/liquidity-building/*` = activation/runtime gates only
- No `GET …/programs?owner=`

---

## Factory methods (summary)

See `contract-model.json` for full signatures.

**Critical for multi-program:**

- `createProgram` — create clone bound to baseKey
- `activeProgram` — current non-Stopped for one baseKey
- `programCount` / `programAt` — global enumeration
- `generationCount` / `computeBaseKey` / `predictProgramAddress`
- Event `ProgramCreated(programId, owner, program, …)` — owner indexed

**Missing (by design):** `programsByOwner`, `listPrograms`

---

## Program storage model

| Storage | Purpose |
|---|---|
| `_activeByBaseKey` | Current program for uniqueness slot |
| `_generationByBaseKey` | Generation counter per slot |
| `_programs` | Global list of all clones |
| `_programById` / `_idByProgram` | Id ↔ address |
| `_quotePolicies` | Quote enablement + floors |

---

## Required changes (no contracts)

### Frontend

1. Owner program inventory
2. List + switcher + “Create another”
3. Explicit `programAddress` read path + `?program=` deep link
4. Fix Passport / Positions / Wallet overview discovery
5. Clearer `DuplicateActiveProgram` UX
6. Richer activity than `latestExecution`

### Indexing

1. Index `ProgramCreated` (+ lifecycle/execution events)
2. Owner-scoped programs API
3. Orchestrator sync job for Factory address

Details: `frontend-gap-analysis.json`

---

## Artifacts

| File | Purpose |
|---|---|
| `multi-program-capability.json` | Capability matrix + verdict |
| `contract-model.json` | Factory methods + storage + lifecycle |
| `frontend-gap-analysis.json` | UI/indexer gaps + required work |
| `MISSION_REPORT.md` | This report |

---

## Final verdict

**MELEGA_DEX_V1_AI_LIQUIDITY_BUILDER_MULTI_PROGRAM_READY**

Protocol/contracts are multi-program capable today. Ship product inventory + indexing on top — do **not** redesign Factory uniqueness or fees for this capability.
