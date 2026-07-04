# KERL Genesis Testnet Economic Transaction — Phase T3B

**Mission:** KERL Phase T3B — Genesis Wallet Configuration and Single Rerun  
**Repository:** MelegaSwapV2 (`design-system-foundation`)  
**Date:** 2026-07-04  
**Prior verdict:** `KERL_GENESIS_TESTNET_TRANSACTION_ABORTED` (T3)  
**Chain permitted:** BNB Smart Chain Testnet (`chainId: 97`) only  
**MAINNET:** Constitutionally forbidden — untouched

---

## Final verdict

**KERL_GENESIS_TESTNET_TRANSACTION_ABORTED**

T3B operator environment verification failed. All six required shell environment variables were **unset** in the active execution shell. No wallet derived. No transaction submitted. Rolled back to `DRY_RUN`.

---

## 1. Operator environment verification

Script: `yarn tsx scripts/kerl-first-testnet-execution.ts`  
Run date: 2026-07-04

| Variable | Required value | Runtime status |
|----------|----------------|----------------|
| `KERL_TESTNET_EXECUTOR_PRIVATE_KEY` | `0x...` (dedicated testnet wallet) | ❌ **unset** |
| `KERL_EXECUTION_MODE` | `TESTNET_EXECUTION_ONLY` | ❌ **unset** |
| `KERL_LIVE_EXECUTION_AUTHORIZED` | `true` | ❌ **unset** |
| `KERL_TESTNET_EXECUTION_ARMED` | `true` | ❌ **unset** |
| `KERL_GATEWAY_ENABLED` | `true` | ❌ **unset** |
| `KERL_INGRESS_ENABLED` | `true` | ❌ **unset** |

**Missing (all six):** Operator configuration incomplete before script activation.

**Private key:** Not present in repository, documentation, or shell output. Not printed.

---

## 2. Executor wallet address

**Unknown** — derivation skipped because `KERL_TESTNET_EXECUTOR_PRIVATE_KEY` unset.

When configured, script logs **address only** (never private key):

```
Executor wallet address: 0x...
Chain ID: 97 (BNB Testnet)
Wallet funded: yes/no (balance wei: ...)
```

---

## 3. Chain verification

Handoff instruction `chainId`: **97** ✅ (validated at precondition evaluation)  
On-chain submission: **N/A** — aborted before execution

---

## 4. Wallet funding

**Not verified** — no wallet derived.

| Guidance | Amount |
|----------|--------|
| Minimum | 0.05 tBNB |
| Recommended | 0.5–1 tBNB |
| Repeated testing | 1–2 tBNB |

---

## 5. Fifteen mandatory preconditions

| # | Precondition | Result |
|---|--------------|--------|
| 1 | `TESTNET_EXECUTION_ONLY` | ❌ Mode OFF — env unset; activation not engaged |
| 2 | Civilization authorization | ❌ |
| 3 | Gateway enabled | ❌ |
| 4 | Certified handshake | ✅ |
| 5 | Registry publication ACTIVE | ✅ |
| 6 | Registry compatibility | ✅ |
| 7 | Supported execution type | ✅ SmartSwap |
| 8 | Chain 97 | ✅ |
| 9 | Executor private key | ❌ unset |
| 10 | Executor wallet derived | ❌ |
| 11 | Wallet funded | ❌ |
| 12 | Treasury Runtime OBSERVED | ✅ |
| 13 | Mission Director OBSERVED | ✅ |
| 14 | KCIS OBSERVED | ✅ |
| 15 | Economic Memory OBSERVED | ✅ |

**Abort:** Immediate — operator env incomplete + execution gates not satisfied.

---

## 6. Gate evaluation

| Gate | Status |
|------|--------|
| Operator env (T3B) | ❌ All 6 vars missing |
| `execution_mode` | ❌ OFF |
| `civilization_authorization` | ❌ |
| `gateway_enabled` | ❌ |
| `ingress_enabled` | ❌ |
| `wallet_present` | ❌ |
| `wallet_funded` | ❌ |
| `activation_gates` | ❌ |
| Observation gates (registry, treasury, MD, KCIS, EM) | ✅ |
| `mainnet_forbidden` | ✅ |

---

## 7. Transaction hash

**Unknown** — no submission.

---

## 8. Receipt

**Unknown** — no transaction.

| Field | Value |
|-------|-------|
| Block number | Unknown |
| Gas used | Unknown |
| Receipt timestamp | Unknown |
| Explorer URL | Unknown |

Expected explorer format: `https://testnet.bscscan.com/tx/{hash}`

---

## 9. Execution evidence

**Not produced.**

Certified instruction (not submitted):

| Field | Value |
|-------|-------|
| Instruction ID | `swap-smart:BNB:BUSD:1000000000000:50` |
| Correlation ID | `corr:genesis:testnet:swap:97:2026-07-03` |
| Operation (when funded) | 0-value self-attestation tx via SmartSwap adapter |

---

## 10. Settlement candidate

**Not produced** — no receipt.

When receipt exists: exactly one `melega.settlement-event-candidate.v1` with `treasuryIngestion: false`, `treasuryMutation: false`. Treasury remains observer only.

---

## 11. Mission Director

| Field | Value |
|-------|-------|
| Observed | ✅ |
| Mission actions created | **0** |
| Auto execute | **false** |

---

## 12. Rollback status

| Action | Status |
|--------|--------|
| Rollback to `DRY_RUN` | ✅ |
| Wallet submission | ❌ None |
| Fabricated success | ❌ None |

---

## 13. T3B script enhancements (uncommitted)

| Change | Purpose |
|--------|---------|
| `verifyOperatorEnv.ts` | Validates 6 operator env vars without logging secrets |
| `kerl-first-testnet-execution.ts` | T3B env check → wallet address log → single execution |
| Tests | 7/7 PASS including operator env cases |

Activation still requires `enableKerlTestnetExecutionActivation()` after env verification — civilization authorization is never env-only without script gate.

---

## 14. Validation

| Check | Result |
|-------|--------|
| T3B live run | `KERL_GENESIS_TESTNET_TRANSACTION_ABORTED` (exit 2) |
| `yarn test first-testnet-execution` | 7/7 PASS |
| Exactly one tx | N/A — aborted |
| Zero Treasury mutations | ✅ |
| Zero Mission actions | ✅ |
| MAINNET untouched | ✅ |

---

## 15. Operator command for SUCCESS rerun

Set variables in **active shell only**. Do not commit. Do not document private key.

```bash
export KERL_TESTNET_EXECUTOR_PRIVATE_KEY="0x..."   # dedicated BNB Testnet wallet
export KERL_EXECUTION_MODE="TESTNET_EXECUTION_ONLY"
export KERL_LIVE_EXECUTION_AUTHORIZED="true"
export KERL_TESTNET_EXECUTION_ARMED="true"
export KERL_GATEWAY_ENABLED="true"
export KERL_INGRESS_ENABLED="true"

cd apps/web
yarn tsx scripts/kerl-first-testnet-execution.ts
```

Expected SUCCESS path:

1. All 6 env vars verified ✅  
2. Executor address logged (address only)  
3. chainId 97 confirmed  
4. tBNB balance verified  
5. All 15 preconditions pass  
6. Exactly one 0-value self-attestation tx  
7. One receipt, one ExecutionReport, one ExecutionEvidence  
8. One Settlement candidate (`candidate_only`)  
9. Verdict: `KERL_GENESIS_TESTNET_TRANSACTION_SUCCESS`

---

## 16. Lessons learned

1. **T3 abort was correct** — proceeding without operator wallet would violate truth protocol.
2. **T3B adds explicit env verification** — all six vars must be set in shell before activation engages.
3. **Private key never appears in logs or docs** — only wallet address when derived.
4. **Observation gates pass without wallet** — execution gates require funded operator configuration.
5. **Single rerun only** — configure env once, run script once; no automatic retries.

---

**KERL_GENESIS_TESTNET_TRANSACTION_ABORTED**
