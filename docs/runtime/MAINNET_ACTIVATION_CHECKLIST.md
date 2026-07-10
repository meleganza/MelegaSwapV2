# Mainnet Activation Checklist — Smart Router Wrapper V2

**Authority:** `SMART_ROUTER_TESTNET_FROZEN` (R748)  
**Reference implementation:** Chain 97 — `0x9D2451b30102B098570bfCeae0E8b8C9Fd2bb2Db`  
**Equivalence review:** `docs/runtime/R749_SMART_ROUTER_MAINNET_EQUIVALENCE_REVIEW.md`  
**Certificate schema:** `docs/runtime/MAINNET_DEPLOYMENT_CERTIFICATE_SCHEMA.json`

**Status:** Pre-activation — no step below is complete unless Evidence column is filled.

---

## Phase 0 — Constitutional prerequisites

### 1. Resolve underlying router compatibility

| Field | Value |
|---|---|
| **Owner** | Smart Router / DEX engineering + founder |
| **Prerequisite** | R749 equivalence review acknowledged |
| **Action** | Verify chain 56 `underlyingRouter` implements `IUnderlyingSwapRouter` (`swapExactETHForTokens`, `swapExactTokensForTokens`). Registry lists Pancake Smart Router `0xC6665d98Efd81f47B03801187eB46cbC63F328B0` which uses `swap(IERC20,…)` — **incompatible with frozen wrapper bytecode** per R745B. Either certify a V2-compatible router for mainnet deploy or obtain constitutional ticket for wrapper interface change (not permitted under R748 freeze). |
| **Evidence** | On-chain selector check `0x7ff36ab5` + `0x38ed1739` on chosen router; signed router attestation JSON |
| **Rollback** | Do not deploy; retain ADAPTER-only mainnet routing |

### 2. Treasury Runtime publishes mainnet Treasury Intake

| Field | Value |
|---|---|
| **Owner** | Treasury Runtime operator |
| **Prerequisite** | FSC-01 intake contract deployed and verified on chain 56 |
| **Action** | Publish collector address to `/registry/treasury/index.json#56` via Treasury Runtime (DEX does not modify Treasury Runtime in activation ticket) |
| **Evidence** | Non-null `collector` in treasury registry; BscScan contract verification; ERC20 acceptance test from deployer EOA |
| **Rollback** | Wrapper deploy blocked; pause any staging UI pointing at wrapper |

### 3. External security audit

| Field | Value |
|---|---|
| **Owner** | Founder + external auditor |
| **Prerequisite** | Frozen bytecode hash `0x38b51c47…` submitted to auditor |
| **Action** | Complete audit of `MelegaSmartRouterWrapper.sol` matching testnet V2; publish audit report reference |
| **Evidence** | Audit report ID, date, scope covering native WBNB fee path + treasury intake |
| **Rollback** | Do not deploy; address audit findings in new ticket if contract change required |

### 4. KERL / MARCO attestation (read-only)

| Field | Value |
|---|---|
| **Owner** | Treasury Runtime / KERL operator |
| **Prerequisite** | MARCO `0x963556de0eb8138E97A85F0A86eE0acD159D210b` confirmed for chain 56 |
| **Action** | Confirm MARCO address matches testnet immutable (same contract address on BSC) |
| **Evidence** | `/registry/assets/marco.json` + deploy script `MARCO_TOKEN` env match |
| **Rollback** | Abort deploy if MARCO mismatch |

---

## Phase 1 — Deploy ceremony

### 5. Pre-deploy immutables snapshot

| Field | Value |
|---|---|
| **Owner** | Founder deploy wallet |
| **Prerequisite** | Steps 1–4 complete |
| **Action** | Record mainnet constructor args: `underlyingRouter`, `treasuryIntake`, `marcoToken`, `pricingRefHash`, `treasuryPolicyRefHash`, `owner` |
| **Evidence** | Signed JSON matching `MAINNET_DEPLOYMENT_CERTIFICATE_SCHEMA.json` → `immutables` (pre-deploy draft) |
| **Rollback** | Abort broadcast if any hash differs from testnet freeze manifest policy hashes |

### 6. Deploy Wrapper V2 on chain 56

| Field | Value |
|---|---|
| **Owner** | Founder (`MAINNET_DEPLOYER`) |
| **Prerequisite** | Step 5 snapshot approved |
| **Action** | `forge script script/DeployMelegaSmartRouterWrapper.s.sol --rpc-url bsc_mainnet --broadcast --verify` with verified env vars |
| **Evidence** | Deploy tx hash, block, BscScan verified contract, bytecode hash equals testnet |
| **Rollback** | `pause()` on wrapper via owner; document address as DO NOT USE if immutables wrong |

### 7. Post-deploy immutables verification

| Field | Value |
|---|---|
| **Owner** | DEX engineering |
| **Prerequisite** | Step 6 complete |
| **Action** | On-chain read `underlyingRouter()`, `treasuryCollector()`, `marcoToken()`, `pricingRefHash()`, `treasuryPolicyRefHash()` |
| **Evidence** | RPC call log matching pre-deploy snapshot |
| **Rollback** | Pause wrapper; do not publish registry |

---

## Phase 2 — Constitutional validation ceremony

### 8. BUY_MARCO validation (20 bps)

| Field | Value |
|---|---|
| **Owner** | Founder wallet |
| **Prerequisite** | MARCO/WBNB mainnet liquidity available |
| **Action** | `swapExactETHForTokens` via wrapper; output MARCO |
| **Evidence** | Tx hash; receipt logs `ProtocolFeeCollected` with 20 bps; treasury WBNB balance delta |
| **Rollback** | Pause wrapper; root-cause against testnet reference txs |

### 9. SELL_MARCO validation (30 bps)

| Field | Value |
|---|---|
| **Owner** | Founder wallet |
| **Prerequisite** | MARCO balance + approval |
| **Action** | `swapExactTokensForTokens` MARCO → WBNB via wrapper |
| **Evidence** | Tx hash; 30 bps MARCO fee to Treasury Intake |
| **Rollback** | Pause wrapper |

### 10. STANDARD_SWAP validation (30 bps)

| Field | Value |
|---|---|
| **Owner** | Founder wallet |
| **Prerequisite** | BNB + target pair liquidity |
| **Action** | Native or ERC20 standard swap via wrapper (non-MARCO output) |
| **Evidence** | Tx hash; 30 bps fee; events triplet verified |
| **Rollback** | Pause wrapper |

### 11. Treasury handoff + execution manifest

| Field | Value |
|---|---|
| **Owner** | DEX engineering |
| **Prerequisite** | Steps 8–10 pass |
| **Action** | Verify `TreasuryHandoffPrepared` on all three txs; off-chain manifest generation matches testnet schema |
| **Evidence** | Event decode logs; manifest JSON samples |
| **Rollback** | Do not publish certificate |

### 12. Issue mainnet validation certificate

| Field | Value |
|---|---|
| **Owner** | DEX / registry operator |
| **Prerequisite** | Steps 8–11 pass |
| **Action** | Populate certificate per `MAINNET_DEPLOYMENT_CERTIFICATE_SCHEMA.json`; store at `/registry/smart-router/mainnet-validation-certificate.json` |
| **Evidence** | Certificate JSON with `verdict: PASSED` |
| **Rollback** | Withhold publication; wrapper remains paused |

---

## Phase 3 — Registry publication (separate ticket)

### 13. Publish chain 56 in Smart Router registry

| Field | Value |
|---|---|
| **Owner** | DEX registry operator |
| **Prerequisite** | Step 12 certificate issued |
| **Action** | Update `index.json` chain 56: `wrapperAddress`, `validationStatus: passed`, remove blocker reasons |
| **Evidence** | Registry diff + cross-validation script |
| **Rollback** | Revert registry commit; wrapper pause remains effective |

### 14. Regenerate civilization router contract

| Field | Value |
|---|---|
| **Owner** | DEX engineering |
| **Prerequisite** | Step 13 |
| **Action** | Regenerate `civilization-router-contract.json`; top-level `wrapperAddress` non-null |
| **Evidence** | Machine contract JSON; tests pass |
| **Rollback** | Revert JSON; keep testnet freeze manifest unchanged |

### 15. Update Labs integration contract

| Field | Value |
|---|---|
| **Owner** | DEX + Labs liaison |
| **Prerequisite** | Step 13 |
| **Action** | Chain 56 `melegaWrapper` + `swapReadinessBlockers: []` when collector published |
| **Evidence** | labs-integration-contract.json diff |
| **Rollback** | Revert; Labs continues ADAPTER-only binding |

---

## Phase 4 — Product wiring

### 16. Wire production DEX to wrapper registry address

| Field | Value |
|---|---|
| **Owner** | DEX frontend engineering |
| **Prerequisite** | Step 13 published |
| **Action** | Swap/Trade studios consume registry wrapper for chain 56; remove ADAPTER-only claims where wrapper canonical |
| **Evidence** | Staging swap txs through wrapper; QA checklist |
| **Rollback** | Feature flag to ADAPTER; registry address unchanged |

### 17. Unblock civilization route preparation (optional)

| Field | Value |
|---|---|
| **Owner** | Smart Router module owner |
| **Prerequisite** | Steps 12–13 |
| **Action** | Remove chain 56 wrapper blockers in `prepareCivilizationRoute` when registry confirms deploy |
| **Evidence** | Unit tests; prepared route JSON samples |
| **Rollback** | Restore block code path |

### 18. Mainnet freeze publication

| Field | Value |
|---|---|
| **Owner** | Founder / registry operator |
| **Prerequisite** | Steps 12–16 complete |
| **Action** | Issue mainnet freeze manifest mirroring R748 structure |
| **Evidence** | `mainnet-freeze-manifest.json` + runtime doc |
| **Rollback** | Unfreeze requires new constitutional ticket |

---

## Phase 5 — Operational readiness

### 19. Configure Treasury Runtime intake URL

| Field | Value |
|---|---|
| **Owner** | DevOps |
| **Prerequisite** | Treasury Runtime accepts mainnet handoffs |
| **Action** | Set `TREASURY_RUNTIME_URL` in production; verify POST proxy |
| **Evidence** | 200 response on test handoff; no 503 from proxy |
| **Rollback** | Unset URL; DEX continues on-chain-only mode |

### 20. Monitoring and incident response

| Field | Value |
|---|---|
| **Owner** | DevOps + founder |
| **Prerequisite** | Step 6 deploy |
| **Action** | Index wrapper events; alert on pause; document owner pause procedure |
| **Evidence** | Runbook link; BscScan alert or internal monitor |
| **Rollback** | Owner calls `pause()`; UI fallback per Step 16 rollback |

---

## Summary gate

| Gate | Required for mainnet canonical |
|---|---|
| Underlying router interface verified | Yes |
| Treasury Intake published (56) | Yes |
| Audit complete | Yes |
| Bytecode hash match testnet | Yes |
| 3/3 validation txs | Yes |
| Certificate issued | Yes |
| Registry publication | Yes (separate ticket) |

**Do not skip steps.** Truth over continuity.
