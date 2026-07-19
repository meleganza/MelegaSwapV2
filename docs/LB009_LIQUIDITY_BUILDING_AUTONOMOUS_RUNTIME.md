# LB009 — Liquidity Building Autonomous Runtime

**Verdict:** `LB009_IMPLEMENTED_WITH_MAINNET_BLOCKERS`
**Baseline start SHA:** `ead3fde62a41c48eadd189939d8f136440c21fb1` (`main`)
**Module:** `apps/web/src/lib/liquidity-building-runtime/`
**APIs:** `GET /api/liquidity-building/health`, `GET /api/liquidity-building/readiness`

---

## 1. Executive Summary

LB009 implements the MelegaSwapV2-side autonomous runtime **observation / decision / intent / health** layer:

observe → classify → decide → (sign) → (submit) → (reconcile)

Production KMS signing, permissionless relay broadcast, and Treasury Runtime ingestion remain **disabled interfaces** with explicit blockers. No private-key fallback. No first mainnet cycle executed. On-chain Program remains the economic authority.

---

## 2. Runtime Architecture

```
Swap logs (canonical Melega pairs)
        ↓
eligible-flow.ts (LB003 classification + finality)
        ↓
decision-engine.ts (Full AI / Dynamic Range ≤ 5000 bps)
        ↓
intent-builder.ts (LB006 ExecutionIntent V1 wire)
        ↓
signing-adapter.ts (Disabled until KMS)
        ↓
relay.ts (Disabled until relay service)
        ↓
treasury-integration.ts (ready=false; local validation helpers)
        ↓
readiness.ts / state-machine.ts / loop.ts
```

Runtime must not custody tokens, receive fees, approve tokens, bypass Router/Sink, or mutate signed intents.

---

## 3. Observer

`buildObservation` / `classifySwap` / `classifyDirection` in `eligible-flow.ts`.

Consumes only provided Swap-like events with pair orientation. No centralized volume APIs.

---

## 4. Finality Model

Depth **15** (`LB_FINALITY_DEPTH`). States: `OBSERVED` → `AWAITING_FINALITY` → `FINALIZED` | `REORGED` | `REJECTED`.

Unsigned intents require `FINALIZED` observation (`intent-builder.ts`).

---

## 5. Eligible Flow Classification

LB003 rules:

| Class | Rule |
| --- | --- |
| Buy | Quote in, project out — quote paid into pair |
| Sell | Project in, quote out — quote removed |
| Net | `E = max(buys − sells, 0)` |
| Layers | Observed / Excluded / Eligible |

Exclusions: LB own swap, duplicate, reverted, non-canonical, add/remove liquidity, retry/replacement, unrelated direction.

**Test:** LB execution-flagged swap increases excluded, not eligible.

---

## 6. Decision Engine

`decideLiquidityBuilding`:

- Full AI: clamp rate to ≤ 5000
- Dynamic Range: require ownerMin ≤ rate ≤ ownerMax ≤ 5000
- Outputs only `EXECUTE` | `WAIT` | `SKIP`
- Never exceeds ceiling; never alters fee/Treasury/LP recipient

---

## 7. Execution Intent Pipeline

`buildExecutionIntent` maps finalized observation + EXECUTE decision to `ExecutionIntentV1Wire` matching LB006 field set. Rejects unfinalized / non-EXECUTE / flow mismatch.

---

## 8. KMS Signing

`DisabledLiquidityBuildingKmsSigner` — `ready=false`.
`assertNoPrivateKeySignerConfig` rejects LB private-key env vars and `HOT_SIGNER`.

**Blockers preserved:** LB-G03B, LB-G11.

---

## 9. Relay

`DisabledLiquidityBuildingRelay` — no broadcast; duplicate/idempotency surface; `relayPreservesEconomics` guards tampering.

**Blocker preserved:** LB-G03C.

---

## 10. Monitoring

`SubmissionMonitor` + `isEconomicallySuccessful` requires ExecutionCompleted ∧ Treasury ∧ LP — receipt alone insufficient.

---

## 11. Treasury Reconciliation

`BlockedTreasuryIngestor` / `LocalValidationTreasuryIngestor` with `ready=false`.
Local `validateAndStore` implements canonical checks + idempotency for unit tests only.

Distinct IDs: executionId ≠ settlementReceipt ≠ runtimeAcknowledgementId.

**Blockers preserved:** LB-G04B, LB-G04C, LB-G12.

External origin verified: `meleganza/melega-kiri-treasury-runtime` — not modified in LB009.

---

## 12. Health and Readiness

`assessLiquidityBuildingRuntimeHealth` returns `BLOCKED` while KMS/relay/Treasury/quote/deployment gates fail. Never `READY` with missing mandatory deps.

Endpoints return JSON (`Content-Type: application/json`).

---

## 13. First Mainnet Cycle Runbook

See `docs/runbooks/LB009_FIRST_MAINNET_CYCLE.md`.
**No mainnet cycle executed in LB009.**

---

## 14. Security Model

| Control | Result |
| --- | --- |
| NO HUMAN SIGNER | PASS (disabled) |
| NO PRIVATE KEY ACCESS | PASS |
| NO FUNDED EXECUTION WALLET | PASS |
| NO ECONOMIC RELAYER AUTHORITY | PASS |
| NO CENTRALIZED VOLUME SOURCE | PASS |
| NO FAKE OBSERVATION DATA | PASS (tests use synthetic fixtures only) |
| NO UNFINALIZED DECISION SIGNING | PASS |
| NO TREASURY BYPASS | PASS |
| NO MANUAL FEE SETTLEMENT | PASS |
| NO OFF-CHAIN ACCOUNTING AS SOURCE OF TRUTH | PASS (Program remains authority) |

---

## 15. Test Evidence

Vitest: `apps/web/src/lib/liquidity-building-runtime/__tests__/` — 30 tests covering observer, decision, signing disablement, relay, treasury validation, loop, health, properties.

---

## 16. Mainnet Evidence

**NONE** — activation blocked. Fork production cycle not run (dependencies unavailable).

---

## 17. Remaining Blockers

| ID | After LB009 |
| --- | --- |
| LB-G02B | **CLOSED IN CODE** (runtime implemented; activation blocked) |
| LB-G03B | OPEN |
| LB-G03C | OPEN |
| LB-G04B | OPEN |
| LB-G04C | OPEN |
| LB-G08 | OPEN |
| LB-G09 | OPEN |
| LB-G10 | OPEN |
| LB-G11 | OPEN |
| LB-G12 | OPEN |

Schemas: `deployments/liquidity-building/schemas/{observation,decision,execution,reconciliation}.v1.schema.json`.
