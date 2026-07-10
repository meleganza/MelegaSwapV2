# R753 — KRMP-01 Testnet Operational Certification

**Date:** 2026-07-09  
**Authority:** KRMP-01 · `SMART_ROUTER_TESTNET_FROZEN`  
**Mission:** KERL integration validation — **not** swap re-validation  
**Mode:** Audit only — no deploy, no chain 97 wrapper changes, no Treasury/KERL/D87/FSC-01 modifications

---

## Output

| Field | Result |
|---|---|
| **Audit** | **BLOCKED** |
| **Final verdict** | **`KRMP_TESTNET_OPERATIONAL_BLOCKED`** |
| **Certificate** | `apps/web/public/registry/smart-router/krmp-testnet-operational-certificate.json` (verdict: `BLOCKED`) |

Constitutional **on-chain** artifacts (Wrapper V2, Treasury Intake, registry publication) are **READY**. The **KERL integration pipeline** is **not** end-to-end operational — multiple interfaces bypass KERL or remain unwired.

---

## Part A — Execution chain audit

Required path:

```
Economic Intent → KERL → Execution Request → Smart Router → Wrapper V2
  → DEX execution → Execution Receipt → KERL Settlement Receipt
  → Treasury Runtime → FSC-01
```

| Hop | Status | Evidence |
|---|---|---|
| Economic Intent → KERL | **PARTIAL** | Labs/KERL route authority declared live externally; DEX `kerl/index.json` is `DRY_RUN_ONLY` |
| KERL → Execution Request | **PARTIAL** | `ExecutionInstruction` (`execution-contract` v1.0) via handoff packages; default mode `OFF`; `kerlLiveExecutionAuthorized: false` |
| Execution Request → Smart Router | **PARTIAL** | Instruction carries `routingPlan` (`swap-smart` / `swap-v2`); live `/swap` uses `useBestTrade` — **not** KERL-sourced |
| Smart Router → Wrapper V2 | **BLOCKED** | No Swap UI path targets `0x9D2451b30102B098570bfCeae0E8b8C9Fd2bb2Db`; `prepareCivilizationRoute` **blocks chain 97** |
| Wrapper V2 → DEX execution | **BLOCKED** | Wrapper validated on-chain (R747) but **not wired** to production swap commit |
| DEX → Execution Receipt | **PARTIAL** | `melega.dex-execution-receipt.v1` via `buildExecutionReceiptPayload` on tx confirm |
| Execution Receipt → KERL Settlement Receipt | **BLOCKED** | **No KERL Settlement Receipt schema** in repository |
| KERL Settlement → Treasury Runtime | **BLOCKED** | `submitSettlementHandoff` posts **directly** from DEX — KERL bypass |
| Treasury Runtime → FSC-01 | **PARTIAL** | Intake accepts fees on-chain via wrapper; off-chain FSC-01 waterfall owned by Treasury (`execution_enabled: false`) |

**Bypasses identified:**

1. Live swap routing: DEX `routing-layer` / `useBestTrade` — not KERL  
2. Settlement: `treasuryHandoffUpdater` → `submitSettlementHandoff` — not KERL  
3. Civilization router: chain 97 hard-block prevents constitutional path despite deployed wrapper  

---

## Part B — Interface matrix

| # | Producer | Consumer | Schema | Status | Version | Machine readable |
|---|---|---|---|---|---|---|
| 1 | KERL / Labs | DEX ingress | `TestnetExecutionHandoffPackage` + `ExecutionInstruction` | **PARTIAL** | handoff `1.0.0`, instruction `1.0` | Yes — `kerl/handoffs/*.json` |
| 2 | KERL | DEX gateway | `ExecutionInstruction` | **PARTIAL** | `1.0` | Yes — `execution-contract/types.ts` |
| 3 | DEX routing-layer | DEX execution | `SmartSwapRoutingPlan` / `V2SwapRoutingPlan` | **ACTIVE (non-KERL)** | facade marker | Yes — `routing-layer/types.ts` |
| 4 | Smart Router adapter | Wrapper (intended) | `melega.smart-router.quote.v1` + `ExecutionManifest` | **PARTIAL** | adapter `2.5.0` | Yes — `execution-manifest/types.ts` |
| 5 | Wrapper V2 (on-chain) | V2 router | `IUnderlyingSwapRouter` | **READY (on-chain)** | frozen V2 | Yes — ABI + R747 txs |
| 6 | Wrapper V2 (on-chain) | Treasury Intake | ERC20 transfer + `TreasuryHandoffPrepared` event | **READY (on-chain)** | FSC-01 ref hash | Yes — R747 validation |
| 7 | DEX | Treasury Runtime | `melega.dex-execution-receipt.v1` | **ACTIVE (bypass)** | v1 | Yes — `treasury-handoff/types.ts` |
| 8 | KERL | Treasury Runtime | **KERL Settlement Receipt** | **MISSING** | — | **No** |
| 9 | KERL registry | Labs/KERL env | `melega.kerl.smart-router-wrapper-v2-registry.v1` | **READY** | `1.0.0` | Yes — kiri HTTP 200 |
| 10 | Execution Adapter | Router | `melega.execution-adapter.v1` | **READY** | v1 | Yes — R750 |
| 11 | Policy Engine | Smart Router plan | `melega.smart-router.policy.v1` | **READY** | D87 + FSC-01 | Yes |
| 12 | Capability Manifest | Agents / audit | `melega.smart-router.capability.v1` | **READY** | — | Yes |

---

## Part C — Execution Request audit

**Canonical name in codebase:** `ExecutionInstruction` (not `ExecutionRequest`).

| Wrapper requirement | Present in instruction? | Source |
|---|---|---|
| `chainId` | Yes | `ExecutionInstructionBase.chainId` |
| Routing plan (path, slippage) | Yes | `routingPlan` on `SwapExecutionInstruction` |
| Adapter selection | Yes | `adapter: 'smart-router' \| 'v2-router'` |
| Wrapper contract address | **No** | Must come from KERL registry env — not embedded in instruction |
| Treasury collector | **No** | Resolved at runtime from registry |
| MARCO address | **No** | Resolved at runtime from KERL/registry |
| Protocol fee bps | **No** | Computed by `prepareMelegaSmartRouterSwap` / wrapper on-chain |
| Exact-input only | Implicit | Handoff + validation gates |

**Routing logic location:**

| Component | Routing logic? | Verdict |
|---|---|---|
| Wrapper V2 Solidity | **No** — fee math + delegate only | Correct |
| DEX live swap (`useBestTrade`, `useTradeInfo`) | **Yes** — quote/route discovery | **Authority violation** vs KERL-decides |
| Smart Router adapter (`prepareMelegaSmartRouterSwap`) | Economic plan only — no path search | Correct |
| KERL handoff | `routingDecisionSnapshotRef` — snapshot only | Partial — not enforced on live UI |

---

## Part D — Settlement Receipt audit

**Required path:**

```
ExecutionReceipt → KERL Settlement Receipt → Treasury Runtime
```

**Actual path:**

```
ExecutionReceipt (melega.dex-execution-receipt.v1)
  → submitSettlementHandoff (DEX)
  → Treasury Runtime proxy (POST)
```

| Artifact | Schema | KERL in path? |
|---|---|---|
| Execution Receipt | `melega.dex-execution-receipt.v1` | No |
| KERL Settlement Receipt | **Does not exist** | — |
| Settlement Event Candidate | `melega.settlement-event-candidate.v1` | Produced in T2 script only; `treasuryIngestion: false` |
| Treasury intake payload | `melega.treasury-intake.v1` (normalized) | No KERL attestation field |

**Verdict:** **BLOCKED** — direct Treasury Runtime call bypasses KERL.

---

## Part E — Authority matrix

| Authority | Owner (constitutional) | Actual owner (testnet) | Exceeds authority? |
|---|---|---|---|
| Route / quote decision | **KERL** | **DEX** (`useBestTrade`, smart-router package) | **Yes — DEX** |
| Protocol fee computation | Wrapper + D87 | Wrapper on-chain; adapter off-chain | No |
| Swap execution submit | DEX ingress | DEX wallet callbacks | No |
| Economic entrypoint | Wrapper V2 | Wrapper on-chain; **UI bypasses** | **Partial gap** |
| Settlement normalization | Treasury Runtime | Treasury Runtime (when proxy available) | No |
| FSC-01 waterfall | Treasury Runtime | Treasury Runtime (`execution_enabled: false`) | No |
| Registry truth | KERL + Treasury + Smart Router | Published static JSON | No |

---

## Part F — Testnet operational status

| Component | Status | Rationale |
|---|---|---|
| **Wrapper** | **READY** | Deployed, validated 3/3, frozen — `0x9D2451b30102B098570bfCeae0E8b8C9Fd2bb2Db` |
| **Treasury Intake** | **READY** | `0xe674b1d925d79f5A0053e40cC7cdED7841AD4164` — R747 verified |
| **KERL** | **PARTIAL** | Registry HTTP 200 on kiri; handoffs dry-run; live execution unauthorized |
| **DEX** | **PARTIAL** | Swap works; KERL ingress + wrapper not wired; chain 97 civilization blocked |
| **Execution Adapter** | **READY** | V2 only on 97 per R750 |
| **Execution Manifest** | **READY** | Schema published, builder tested |
| **Capability Manifest** | **READY** | Schema published |
| **Policy Engine** | **READY** | D87 + FSC-01 resolution |
| **Settlement** | **BLOCKED** | No KERL Settlement Receipt; DEX→Treasury bypass |

---

## Part G — Certification artifact

Schema: `melega.krmp.testnet.operational.v1`  
Path: `apps/web/public/registry/smart-router/krmp-testnet-operational-certificate.json`  
**Verdict: `BLOCKED`** — not issued as operational READY because constitutional interfaces are not all correct.

KERL registry probe (read-only): **PASS** — `https://kiri.melega.ai/public/registry/melega-dex/smart-router-wrapper-v2.json` HTTP 200.

---

## Part H — Remaining blockers

| # | Blocker | Ticket scope |
|---|---|---|
| 1 | `prepareCivilizationRoute` blocks chain 97 (stale message vs R747) | Product wiring |
| 2 | Swap UI does not commit through Wrapper V2 | Frontend + ingress |
| 3 | KERL live execution mode off (`kerlLiveExecutionAuthorized: false`) | Execution modes |
| 4 | Genesis handoff `executionPerformed: false` | KERL T2 ceremony |
| 5 | No `KERL Settlement Receipt` schema | KERL + DEX contract |
| 6 | `submitSettlementHandoff` bypasses KERL | Settlement path refactor |
| 7 | Live routing owned by DEX not KERL | Authority handoff |
| 8 | `kerl/index.json` missing genesis testnet handoff entry | Registry publication |

---

## Files changed (this mission)

| File | Action |
|---|---|
| `docs/runtime/R753_KRMP_TESTNET_OPERATIONAL_CERTIFICATION.md` | **Created** — audit report |
| `apps/web/public/registry/smart-router/krmp-testnet-operational-certificate.json` | **Created** — blocked certificate |

**Not changed:** Wrapper Solidity, Treasury Runtime, KERL implementation, chain 97 registry, mainnet.

---

## Path to `KRMP_TESTNET_OPERATIONAL_READY`

1. Publish KERL Settlement Receipt schema (KERL-owned).  
2. Route settlement: `ExecutionReceipt → KERL attestation → Treasury` (no DEX direct POST).  
3. Wire `acceptKerlExecutionInstruction` → Wrapper V2 commit on chain 97.  
4. Unblock `prepareCivilizationRoute` for chain 97 (truth-aligned message).  
5. Complete genesis handoff execution ceremony with funded executor.  
6. Re-run R753 audit — all interface matrix rows **ACTIVE** or **READY**.

---

**Final verdict:** `KRMP_TESTNET_OPERATIONAL_BLOCKED`
