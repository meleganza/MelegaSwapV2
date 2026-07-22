# Liquidity Building — Treasury Boundary and Overengineering Audit

**Mission:** LB-ARCH-001  
**Assessed (UTC):** 2026-07-22T21:30:00Z  
**Scope:** MelegaSwapV2 contracts + `apps/web/src/lib/liquidity-building-runtime` (+ live Treasury health probe)  
**Constraints honored:** no deploy, no funds, no UI changes, no gate bypass  

Machine-readable companion: `liquidity-building-treasury-boundary-audit.json`

---

## 1. Executive conclusion

The Founder’s suspicion is **partially correct**.

- **On-chain Liquidity Building already implements the simple economic model:** compute 5% fee from gross quote, transfer fee to an immutable Treasury receiver via FeeSink, add liquidity with the remainder, mint LP to the configured recipient — all in one atomic `executeLiquidityBuilding` transaction.
- **Liquidity Building execution code does not call** Treasury Runtime `/api/v1/economic-quote`, `/execution-authorization`, `/execution-ticket`, or `/receipt`.
- **Overengineering appears at the activation / health / off-chain reconciliation boundary:** deploy activation (`activationAuthorized`) and the autonomous loop’s “success” path treat Treasury Runtime **ingestion OPERATIONAL** as a hard blocker, even though Runtime is not in the critical path of the on-chain swap/fee/LP atomic flow.
- Naming (`treasuryAuthorizationReference`) and older docs (LB001/LB006 probes) inflate the appearance of synchronous Treasury authority beyond what the contracts enforce.

**Final verdict:** `LIQUIDITY_BUILDING_TREASURY_BOUNDARY_PARTIALLY_OVERENGINEERED`

---

## 2. Current sequence diagram

### A. Intended on-chain execution (code)

```text
Relay/EOA submits Program.executeLiquidityBuilding(intent, signature)
  → Authorizer.validateExecutionIntent (EIP-712 vs signingAuthority)  [KMS, not Treasury HTTP]
  → validate bindings / epoch / strategy / quotePolicy / caps
  → swap project→quote on Melega Router
  → Math.melegaSuccessFee(gross) == 500 bps
  → FeeSink.settleLiquidityBuildingFee(... authRef ...)
       → transfer fee Program → treasuryReceiver (immutable)
       → emit LiquidityBuildingFeeSettled
  → addLiquidity(net quote + project) → LP to lpRecipient
  → emit ExecutionCompleted (+ accounting updates)
```

No HTTP. No Treasury ticket API. Fee failure reverts the whole tx.

### B. Off-chain autonomous loop (code today)

```text
runAutonomousLoopStep
  → assessLiquidityBuildingRuntimeHealth()  [kms/relay/treasuryReady/quote/contracts]
  → observe / finalize
  → decide
  → buildExecutionIntent (includes treasuryAuthorizationReference bytes32)
  → DisabledKmsSigner / DisabledRelay  (currently always fail-closed)
  → AFTER intended submit: BlockedTreasuryIngestor
       if !ready → TREASURY_UNAVAILABLE in blockedReasons
```

Treasury Runtime is treated as a **post-submit reconciliation prerequisite for loop health**, not as a pre-swap authorization service — but activation gates still require Runtime LB ingestion before `activationAuthorized=true`.

### C. Activation path (artifacts + API)

```text
loadAndConsumeActivationGates
  ← activation-gate-final.v1.json
  ← LiquidityBuildingV1.inputs.json
  requires LB-G04B (receiver address) AND LB-G04C/G12 (Runtime ingestion)
  → activationAuthorized=false while either OPEN
```

---

## 3. Current authority map

| Concern | Actual authority in code |
|---------|---------------------------|
| Fee rate 500 bps | On-chain `SUCCESS_FEE_BPS` / Factory ctor requires `successFeeBps == 500` |
| Fee destination | FeeSink immutable `treasuryReceiver` (must have code) |
| Fee transfer | Program → FeeSink → receiver, atomic in `executeLiquidityBuilding` |
| Execution permission | Authorizer EIP-712 signature from `signingAuthority` (KMS path) |
| Strategy / budget / caps | Program + Factory protocol parameters |
| Quote allowlist / floors | Factory `quotePolicy` (on-chain), ratified at deploy |
| LP ownership | Program `lpRecipient` |
| Pause / stop | Program lifecycle |
| Economic accounting receipts (off-chain) | Intended Treasury Runtime (not implemented for LB) |
| DEX UI activation flag | Gate consumer over JSON artifacts |

Treasury Runtime is **not** the authority for swap/liquidity permission in contracts.

---

## 4. Current on-chain fee logic

Evidence:

- `LiquidityBuildingExecutionMathV1.sol`: `SUCCESS_FEE_BPS = 500`; `melegaSuccessFee(gross)`
- `LiquidityBuildingFactoryV1.sol`: ctor rejects if `successFeeBps != 500`
- `LiquidityBuildingProgramV1._settleFee`: recomputes fee from **gross**, compares to plan, approves sink, calls `settleLiquidityBuildingFee`
- `LiquidityBuildingTreasuryFeeSinkV1`: pulls fee to `treasuryReceiver`, emits `LiquidityBuildingFeeSettled`, returns settlement receipt hash

Fee is **not** supplied by Treasury Runtime. Relay cannot change fee without invalidating the signed intent / failing on-chain checks.

`treasuryAuthorizationReference` is a **bytes32** on the intent, required non-zero by FeeSink, included in settlement receipt hash. Tests set it to `keccak256("auth-ref")`. FeeSink does **not** verify a Treasury Runtime signature on that field — it is provenance/idempotency metadata, despite the name.

---

## 5. Current Treasury API dependencies

| Endpoint | Invoked by LB execution code? | Role today |
|----------|-------------------------------|------------|
| `/api/v1/economic-quote` | **No** | Historical probe docs only; SPA/HTML historically |
| `/api/v1/execution-authorization` | **No** | Not wired |
| `/api/v1/execution-ticket` | **No** | Not wired |
| `/api/v1/receipt` | **No** | Generic batch API; LB schema missing |
| `/api/v1/health` | Ops/activation probes only | Live: CONNECTED but `development` / `chain=none` / smartdrop — no LB support |

`BlockedTreasuryIngestor` never performs HTTP; `ready=false` always until a future Runtime adapter is enabled.

DEX `lib/treasury-handoff` settlement paths serve **Trade/Command Center** handoff, not LB Program execution.

---

## 6. Gate classification table

| Gate | Classification | Retain? | Notes |
|------|----------------|---------|-------|
| LB-G03B KMS authority | **A REQUIRED SECURITY** | Yes | Executor identity |
| LB-G11 KMS↔Authorizer verify | **A REQUIRED SECURITY** | Yes | One-time + readiness |
| LB-G03C Relay | **A REQUIRED SECURITY** | Yes | Submit opaque calldata |
| LB-G04B Fee receiver address | **B REQUIRED DEPLOYMENT INPUT** | Yes | Bind before FeeSink deploy |
| LB-G04C Runtime ingestion OPERATIONAL | **D UNNECESSARY SYNC / mis-scoped** for activation & execution | Convert async | Accounting, not execution permission |
| LB-G12 Reconciliation IDs | **C ACCOUNTING/OBSERVABILITY** | Yes (async) | Must not block on-chain success |
| LB-G08 Quote policy ratified | **B REQUIRED DEPLOYMENT INPUT** | Yes | Then on-chain; not live quote API |
| LB-G09 Stables path | **B** (optional NOT_ACTIVE) | Yes | WBNB-only OK |
| LB-G10 Finality 15 | **A** for observation | Yes | Don’t couple to Treasury SPA env |
| CONTRACTS_NOT_DEPLOYED | **B** | Yes | |
| DEPLOYMENT_INPUTS_BLOCKED | **B** (aggregate) | Yes | Should not require G04C OPERATIONAL |
| `treasuryAuthorizationReference` as “Treasury ticket” | **E DUPLICATED AUTHORITY (naming)** | Keep field, redefine source | Executor-generated ref, not Runtime ticket |
| loop `TREASURY_UNAVAILABLE` after submit | **D** | Remove as hard fail | Prefer `RECONCILE_PENDING` |
| Melega Factory/Router gates | **B** (already PASS) | Yes | |

---

## 7. Single points of failure

| SPOF | Scope | Severity if Runtime down |
|------|-------|---------------------------|
| On-chain FeeSink → receiver transfer | Execution tx | Tx reverts (correct) |
| KMS signer | Signing intents | Cannot submit new executions |
| Relay | Broadcast | Cannot submit |
| Treasury Runtime HTTP | **Activation flag / off-chain reconcile claim** | Blocks `activationAuthorized` & loop success labeling today; **does not** appear in Program.execute critical path |
| Quote policy (on-chain) | Execution | Revert if floor violated |

---

## 8. Latency and availability risks

Current activation model: Liquidity Building product cannot be marked authorized until Runtime LB ingestion exists → **product launch coupled to an incomplete off-chain accounting service**.

If the loop were enabled as written: after a successful broadcast, Runtime `ready=false` still marks `TREASURY_UNAVAILABLE`, risking false “failed epoch” signals despite on-chain success.

Preferred model: Runtime lag only delays **receipts/reporting**, never market execution.

---

## 9. Security benefits of the current model

- No local fee wallet in DEX app  
- Fee rate immutable at 500 bps on Factory  
- Receiver must be a contract (non-EOA) at FeeSink construction  
- Atomic fee+LP or full revert  
- Authorizer prevents arbitrary calldata economics from unsigned parties  
- Fail-closed activation avoids claiming production readiness with unbound receivers  

---

## 10. Security costs of the current model

- Conflates **accounting readiness** with **execution authority**  
- Inflates deploy complexity and calendar time  
- Encourages false belief that every epoch needs Treasury permission  
- `treasuryAuthorizationReference` naming invites ticket-style designs that contracts do not enforce  
- `isEconomicallySuccessful(..., treasurySettled)` can under-report success if “settled” means Runtime ack rather than on-chain `FeeSettled`

---

## 11. Evidence of overengineering

1. `activationAuthorized` requires LB-G04C/G12 (Runtime ingestion) even though Program.execute never calls Runtime.  
2. `assessLiquidityBuildingRuntimeHealth` defaults `treasuryReady=false` → health BLOCKED.  
3. `loop.ts` transitions `TREASURY_UNAVAILABLE` when ingestor not ready **after** relay submit.  
4. Historical docs (LB001/LB006) probed economic-quote / execution-authorization as if LB needed them — **no client was ever implemented**.  
5. Activation matrix packages Treasury receiver **binding** (legitimate) with Runtime **OPERATIONAL** (observability) as one TREASURY mega-blocker string.

---

## 12. Evidence against the overengineering hypothesis

1. Contracts already match the Founder’s preferred atomic fee model.  
2. No live per-epoch HTTP authorization exists in LB runtime.  
3. Authorizer validates KMS/authority signatures, not Treasury tickets.  
4. Requiring a non-null, non-EOA fee receiver before deploy is a legitimate security/deployment input.  
5. Async ingestion + reconciliation remains a real constitutional need for provenance — just not a sync gate for swaps.

---

## 13. Proposed minimal architecture

Align with Founder baseline:

**On-chain owns:** budget, constraints, 500 bps, receiver, Melega bindings, quote policy root, LP recipient, pause, atomic fee+LP, events, idempotency.  

**KMS executor owns:** sign intents, allowlisted submit, gas/nonce, schedule.  

**Treasury Runtime owns:** publish/govern receiver & policies, index `LiquidityBuildingFeeSettled`, provenance, receipts, reconciliation, anomalies — **asynchronously**.

---

## 14. Proposed sequence diagram

```text
KMS signs ExecutionIntent (incl. executor-generated settlementRef bytes32)
→ Relay submits executeLiquidityBuilding
→ On-chain: swap → fee to receiver → addLiquidity → events
→ Indexer / Event Fabric observes FeeSettled + ExecutionCompleted
→ Treasury Runtime reconciles asynchronously → receipt/ack
```

Not:

```text
LB → Treasury authorize → ticket → execute → sync receipt → else block
```

---

## 15. Exact gates to retain

- LB-G03B, LB-G11 (KMS)  
- LB-G03C (relay)  
- LB-G04B (receiver address binding at deploy)  
- LB-G08 (ratified quote policy → on-chain)  
- LB-G10 (observation finality)  
- CONTRACTS_NOT_DEPLOYED / validator for real addresses & parameters  
- On-chain fee/receiver/LP/idempotency/pause invariants  

---

## 16. Exact gates to remove (as hard activation/execution blockers)

- **LB-G04C / LB-G12 as prerequisites for `activationAuthorized=true`**  
- **Off-chain loop hard-fail on Treasury ingestor `ready=false` after successful submit**  
- Any future wiring of `/economic-quote` / `/execution-authorization` / `/execution-ticket` into the per-epoch path  

---

## 17. Exact gates to convert to asynchronous evidence

- LB-G04C Runtime ingestion  
- LB-G12 reconciliation / Runtime acknowledgement  
- Monitoring “economic success” should treat on-chain FeeSettled as settlement truth; Runtime ack as accounting completeness  

---

## 18. Exact gates required only once at deployment

- LB-G04B receiver + FeeSink/Factory deploy  
- LB-G08 quote policy ratification → constructor/storage  
- LB-G03B/G11 authority commissioning  
- Contract verification / address binding  
- Melega Factory/Router constants  

---

## 19. Contract changes required

**Minimal / possibly none for fee model** — already atomic.

Optional clarity (Founder-approved later):

- Rename or document `treasuryAuthorizationReference` as `settlementReference` (ABI break — only if worth it)  
- Ensure FeeSink never gains Runtime signature checks  

Do **not** add Treasury Runtime callbacks into Program.execute.

---

## 20. Relay changes required

None for Treasury boundary. Relay must remain economically blind. Do not require Runtime tickets in relay API.

---

## 21. Treasury Runtime changes required

- Publish canonical LB fee receiver governance  
- Implement **async** ingestion of `LiquidityBuildingFeeSettled` (schema handoff already written)  
- Production health should advertise LB capability when ready — as observability, not DEX activation mutex  
- Do not require DEX to call authorize/ticket/quote per epoch  

---

## 22. Migration strategy (after Founder approval — not this mission)

1. Split activation matrix: `DEPLOY_READY` vs `ACCOUNTING_READY`  
2. Allow `activationAuthorized` when contracts+KMS+relay+receiver+quote policy ready; accounting may lag  
3. Change loop success semantics to `ONCHAIN_SUCCESS` + `RECONCILE_PENDING|ACCOUNTED`  
4. Keep fail-closed on missing receiver address  
5. Update docs that still imply economic-quote/execution-authorization for LB  

---

## 23. Test strategy

- Keep Foundry atomic fee/LP tests  
- Add/adjust unit tests: loop COMPLETE with on-chain success even if ingestor not ready (pending mission)  
- Activation consumer tests: G04C OPEN ⇒ accounting pending, not necessarily `activationAuthorized=false` (policy change)  
- Forbid new HTTP clients to `/execution-authorization` in LB runtime via lint/test  

---

## 24. Risks

| Risk | Mitigation |
|------|------------|
| Fees received but never accounted | Async indexer alerts; do not block markets |
| Wrong receiver bound at deploy | Keep LB-G04B strict; governance/timelock for changes if ever mutable |
| Premature activation without relay/KMS | Keep those security gates |
| ABI rename churn | Prefer documentation over rename |

---

## 25. Final recommendation

Adopt the Founder’s boundary:

> **Execution authority belongs to bounded Liquidity Building contracts and the KMS executor. Treasury owns canonical fee destination, accounting, provenance, and reconciliation — not per-epoch execution permission.**

Treat current packaging of LB-G04C/G12 into activation as **partial overengineering**. Keep fee enforcement and receiver binding. Convert Runtime ingestion to asynchronous evidence before the next activation mission.

---

## Audit Q&A (concise)

1. **Treasury Runtime called when?** Activation/ops probes + intended **post**-settlement ingest. Not during Program.execute. Loop checks ingestor readiness after submit.  
2. **Endpoints?** None of the four LB-critical Runtime APIs are invoked by LB execution code (see JSON).  
3. **5% fee?** Enforced on-chain (500 bps); not from Treasury API; not mutable by relay/app.  
4. **Receiver?** Immutable FeeSink constructor value; not fetched live per epoch.  
5. **Treasury ticket required for contract accept?** **No** HTTP ticket. Non-zero `treasuryAuthorizationReference` bytes32 required — not Runtime-issued in code.  
6. **Authorizer validates?** Executor/authority signature + intent fields; not Treasury-issued tickets.  
7. **Runtime outage prevents?** Today: **activationAuthorized** and off-chain success claim. Not the on-chain fee/LP path once deployed.  
8. **Atomic fee+LP?** **Yes** in `executeLiquidityBuilding`.  
9. **Constitutional need for sync Treasury auth?** **No** for deterministic protocol fee routing; yes for custody/credit products — different class.  
10. **Gate classes:** see §6 and JSON.

---

## Final verdict

**LIQUIDITY_BUILDING_TREASURY_BOUNDARY_PARTIALLY_OVERENGINEERED**
