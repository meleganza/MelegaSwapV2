# LB006 — Liquidity Building Authority and Treasury Boundaries

**Status:** `LB006_IMPLEMENTED_WITH_MAINNET_BINDING_BLOCKERS`  
**Mission:** LB006 — Execution Authorizer V1 + Treasury Fee Sink V1  
**Baseline start SHA:** `d48418fc7702197e9dc13469b86207d26db7fa28`  
**Depends on:** LB001–LB005  

**Separation of claims:**

| Claim | Status |
| --- | --- |
| Contract boundary implemented (Authorizer + Sink + Factory hardening) | **YES** |
| Mainnet production binding verified (autonomous signer + canonical receiver + Runtime ingestion) | **NO** |

TEST-ONLY Foundry `vm.sign` keys and mock Treasury receivers are **not** production evidence for LB-G03/LB-G04.

---

## 1. Implementation Summary

LB006 delivers the two infrastructural contract boundaries required before economic Liquidity Building execution:

1. **`LiquidityBuildingExecutionAuthorizerV1`** — immutable EIP-712 / EIP-1271 verifier; no custody; no replay storage; no signer rotation; no relayer awareness (`contracts/liquidity-building/LiquidityBuildingExecutionAuthorizerV1.sol`).
2. **`LiquidityBuildingTreasuryFeeSinkV1`** — atomic exact-fee forwarder Program → immutable contract Treasury receiver; idempotent settlement receipts; no withdrawal (`contracts/liquidity-building/LiquidityBuildingTreasuryFeeSinkV1.sol`).
3. **Factory hardening** — constructor rejects incompatible Authorizer/Sink (`LiquidityBuildingFactoryV1.sol` `_requireCompatibleAuthorizer` / `_requireCompatibleTreasurySink`).

Not implemented (deferred): `executeLiquidityBuilding`, swap, add-liquidity, epoch accounting, rolling cap, Program→Sink call, runtime worker, broadcaster, frontend, mainnet deployment.

---

## 2. Infrastructure Discovery

### 2.1 Execution authority discovery

| Candidate | Type | Public address | Non-exportable evidence | EIP-712 capable | Mainnet status | Verdict |
| --- | --- | --- | --- | --- | --- | --- |
| KERL HOT_SIGNER (env vault pattern) | Human-operable hot EOA model | Configured via `KERL_MAINNET_SIGNER_ADDRESS` (not hardcoded) | None — preferred model is hot signer (`signer-audit.ts`) | Off-chain ethers typed-data possible | Partial / unsafe for LB | **Rejected for LB authority** |
| KERL KMS_HSM | Policy enum only | N/A | Adapter **MISSING** (`signer-audit.ts` `kms_hsm` status MISSING) | Not implemented | Not provisioned | **AUTONOMOUS_AUTHORITY_NOT_FOUND** (adapter gap) |
| EIP-1271 authority contract (mainnet) | Contract | Not found in-repo / on-chain for LB | N/A | Would be compatible with Authorizer | Not deployed | **Not found** |
| Foundry `vm.sign` test EOA | Test-only | Derived in tests | N/A | Yes (test) | Local only | **TEST-ONLY — NOT KMS PRODUCTION EVIDENCE** |

**KERL / KMS evidence pack**

| Field | Finding |
| --- | --- |
| Candidate authority | None production-ready for LB |
| Public address | Not bound |
| EOA / EIP-1271 | Authorizer supports both; production authority unset |
| KMS/HSM status | Policy type `KMS_HSM` exists; adapter missing (`apps/web/src/lib/kerl-signing-gate/signer-audit.ts`) |
| Exportability | No non-exportable KMS key wired |
| Signing algorithm | secp256k1 expected; DER→r,s,v + low-s normalization **not implemented** in-repo for KMS |
| EIP-712 compatibility | Authorizer domain ready; runtime must hash identical struct |
| Signature normalization | Required for future KMS path; gap recorded |
| Runtime readiness | Not ready for LB intent signing |
| Broadcast capability | No permissionless LB relay worker |
| Verdict | **`AUTONOMOUS_AUTHORITY_NOT_FOUND`** |

**Discovery outcome (Authorizer binding):** `PRODUCTION_BINDING_NOT_FOUND`  
**Contract code:** implemented and tested.

### 2.2 Treasury receiver discovery

Probed at UTC `2026-07-19T16:15:55Z` against BSC mainnet RPC `https://bsc-dataseed.binance.org` (block ~`110929507`).

| Candidate | Address | Chain | Bytecode | Contract role | Runtime binding | Authority | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- |
| MELEGA_VAULT_BSC | `0xb2d57B1A40E61AAb3F88361228E1188E0fB6A21C` | 56 | 9883 bytes | Named “Vault” in indexer constants only | No LB fee-sink wiring | Unknown | **Rejected** — name ≠ proven LB fee receiver |
| MELEGA_TREASURY_BSC | `0xb6436EF4c7f76bE0f26c0C5C9dB72F2689abF65b` | 56 | 23 bytes (`0xef0100` + address — EIP-7702 delegation designator) | Not a durable intake contract | Unproven for LB | N/A | **Rejected** |
| MELEGA_FEE_COLLECTOR_BSC | `0xb5a8707FfA045E0FC7db6eFC63161e853C80139a` | 56 | 0 (EOA) | Fee collector label | Wrapper-style collector pattern | EOA | **Rejected** — EOA forbidden for Sink receiver |
| Smart-router chain-56 treasuryCollector | — | 56 | — | Registry shows `treasuryCollectorPublished: false` / null collector for 56 | Missing | — | **Rejected** |
| LB006 mock receiver | Test deploy | Local | Present | TEST ONLY | None | Test | **Not production** |

**Discovery outcome (Treasury receiver):** `PRODUCTION_BINDING_NOT_FOUND`

### 2.3 Treasury HTTP verification

Base: `https://treasury.melega.ai` — timestamp UTC `2026-07-19T16:15:55Z`.

| Endpoint | Method | Status | Content type | Machine response | Auth | Verdict |
| --- | --- | --- | --- | --- | --- | --- |
| `/api/v1/health` | GET | 200 | `text/html; charset=utf-8` (body is JSON provenance) | JSON health/provenance present | None observed | **PARTIAL** — alive, not LB-specific |
| `/api/v1/economic-quote` | GET | 200 | HTML SPA | SPA HTML, not quote JSON | Unknown | **NOT READY** for LB |
| `/api/v1/execution-authorization` | GET | 200 | HTML SPA | SPA HTML | Unknown | **NOT READY** |
| `/api/v1/execution-ticket` | GET | 200 | HTML SPA | SPA HTML | Unknown | **NOT READY** |
| `/api/v1/receipt` | GET | 400 | HTML ctype; body JSON `{"ok":false,"reason":"MISSING_BATCH_ID"}` | Batch receipt API exists; not LB `LiquidityBuildingFeeSettled` ingestion | Batch id required | **PARTIAL** — generic receipt; **no LB settlement ingestion** |
| (same paths) | OPTIONS | 200 | — | CORS/options ok | — | Informational only |

No economic quotes, tickets, or fabricated receipts were submitted.

**Discovery outcome (Runtime receipt ingestion):** `PRODUCTION_BINDING_PARTIAL` (health + generic receipt batch API; no LB mapping).

---

## 3. Execution Authorizer Architecture

File: `contracts/liquidity-building/LiquidityBuildingExecutionAuthorizerV1.sol`

| Property | Evidence |
| --- | --- |
| Non-upgradeable | No proxy / no upgrade function |
| No owner/admin | No Ownable; `test_09_noOwnerAdmin` |
| No custody | No token transfers |
| No nonce / replay storage | Empty storage layout (immutables only) |
| No signer setter | Constructor-only `signingAuthority` (L47–54); `test_08_noSignerSetter` |
| No relayer logic | Validation ignores `msg.sender` |
| EOA + EIP-1271 | `_isValidSignatureNow` via ECDSA + IERC1271 (OZ SignatureChecker requires ≥0.8.24; mirrored under 0.8.20) |
| Versioned | `AUTHORIZER_VERSION` / `authorizerVersion()` |

---

## 4. Immutable Authority

Constructor input `signingAuthority_`:

- non-zero (`ZeroAuthority`);
- immutable;
- EOA or contract (`authorityType` from `code.length` at deploy);
- no setter / rotation / fallback.

Replacement requires a **new Authorizer + new Factory version**.

---

## 5. ExecutionIntent V1

Struct frozen in `ILiquidityBuildingExecutionAuthorizerV1.ExecutionIntentV1` (field order immutable without type-hash migration).

Schema constant: `keccak256("LIQUIDITY_BUILDING_EXECUTION_INTENT_V1")`  
Exposed: `executionIntentSchemaVersion()`, `executionIntentTypeHash()`.

| Field | Unit | Source | Signed meaning | Authorizer validation | Future Program validation | Replay role | Economic role |
| --- | --- | --- | --- | --- | --- | --- | --- |
| schemaVersion | bytes32 | protocol | Intent schema | == V1 | same | schema bind | — |
| chainId | uint256 | chain | Chain binding | == `block.chainid` | same | cross-chain | — |
| factory | address | factory | Factory bind | non-zero | == Program.factory | cross-factory | — |
| factoryVersion | bytes32 | factory | Version bind | domain salt | match | version bind | — |
| program | address | program | verifyingContract | non-zero | == `address(this)` | cross-program | — |
| pair / projectToken / quoteAsset | address | state | Market identity | non-zero; tokens ≠ | match storage | identity | path |
| epoch window / blocks / reserves / flows | various | runtime | Observation decision | structural windows | economic + finality | epoch | G path |
| strategyMode / effectiveStrategyRateBps | enum/bps | runtime | Strategy decision | mode≤1; rate≤10000 | ceiling / mode | — | spend rate |
| grossQuoteTarget / maximumProjectTokenIn | base | runtime | Exact economic targets | structural only | LB003 clamps | — | swap bounds |
| configNonce / executionNonce | uint | program | Config freshness | none | match / unused | digest uniqueness | — |
| decisionDeadline / maximumGasPrice | s/wei | runtime | Liveness / gas | deadline | gasprice | time | — |
| observationRoot / excludedFlowCommitment | bytes32 | runtime | Observation integrity | none | optional | — | audit |
| treasuryAuthorizationReference | bytes32 | Treasury | Settlement ref | none | passed to Sink | — | fee auth |

---

## 6. EIP-712 Domain and Type Hash

Per-Program domain:

- `name`: `Melega Liquidity Building`
- `version`: `1`
- `chainId`: `block.chainid`
- `verifyingContract`: `intent.program`
- `salt`: `keccak256(abi.encode(authorizer, factory, factoryVersion))`

Digest: `keccak256("\x19\x01" ‖ domainSeparator ‖ structHash)`  
View: `domainSeparatorFor(program, factory, factoryVersion)`  
Relayer address is **not** in the domain.

---

## 7. EOA/KMS Compatibility

| Path | Status |
| --- | --- |
| EOA secp256k1 (65-byte r,s,v) | Implemented via OZ `ECDSA.tryRecoverCalldata` (low-s enforced by OZ) |
| KMS DER → r/s → low-s → v → 65-byte | **Gap** — no in-repo KMS adapter; required for future autonomous runtime |
| Foundry `vm.sign` | **TEST-ONLY EOA SIGNATURE — NOT KMS PRODUCTION EVIDENCE** |

---

## 8. EIP-1271 Compatibility

Contract authority classified at deploy. Validation is `view`. Mock coverage: magic accept/reject, revert, mutated digest, classification (`test_33`–`test_37`). Authorizer state is not mutated by callbacks.

---

## 9. Permissionless Relay Boundary

Frozen model:

```
autonomous runtime signs ExecutionIntent
  → any address submits intent to Program (future LB007)
  → Program calls Authorizer
  → relayer identity does not enter economic calculation
```

Authorizer does not know relayer `msg.sender`, has no allowlist, pays no gas, stores no broadcast nonce. Melega broadcaster (future) is **liveness only**.

---

## 10. Treasury Fee Sink Architecture

File: `LiquidityBuildingTreasuryFeeSinkV1.sol`

| Property | Evidence |
| --- | --- |
| Immutable `treasuryReceiver` | Constructor; must have code (rejects EOA) |
| No owner / withdrawal / rescue / setter | `test_43`–`test_45` |
| `nonReentrant` | OZ ReentrancyGuard |
| Idempotent | `_settled[settlementKey]` |
| Exact-delta | Receiver balance delta == `amount` |
| No local fee custody | Sink balance unchanged across successful settle |
| Direct donation | Stuck; not accounted; not withdrawable |

---

## 11. Canonical Program Validation

On settle, Sink verifies (`settleLiquidityBuildingFee`):

- `msg.sender` has bytecode;
- `program.programId() == programId`;
- `program.quoteAsset() == quoteAsset`;
- `factory.isRegisteredProgram(msg.sender)`;
- `factory.treasuryFeeSink() == address(this)`.

**Residual risk:** a fake Factory can spam receipts toward this Sink’s immutable receiver. Treasury Runtime **must** filter by canonical LB Factory address. No admin Factory allowlist added (by design).

---

## 12. Atomic Fee Transfer

Sequence: validate → settlement key → reject duplicate → mark settled → measure balances → `trySafeTransferFrom(Program → treasuryReceiver)` → require sink balance unchanged → require exact receiver delta → store receipt → emit → return.

Fee never economically rests in the Sink.

---

## 13. Idempotency and Receipt

```
settlementKey = keccak256(abi.encode(chainId, sink, program, programId, executionId))
settlementReceipt = keccak256(abi.encode(chainId, sink, treasuryReceiver, program, programId, executionId, quoteAsset, amount, authorizationReference, settlementKey))
```

Second settle with same key fails regardless of amount/quote/authRef variation (`test_75`–`test_78`).

---

## 14. Treasury Runtime Reconciliation

Future mapping (not implemented):

```
LiquidityBuildingFeeSettled (on-chain)
  → tx receipt
  → settlementReceipt (bytes32)
  → Treasury Runtime ingestion (future LB endpoint)
  → Treasury Runtime receipt / D99 accounting
  → Program read-model reconciliation
```

Distinguish:

1. **On-chain settlement receipt** — `settlementReceipt` from Sink (implemented).
2. **Runtime ingestion receipt** — HTTP/batch acknowledgement (generic `/api/v1/receipt` exists; **not** LB-mapped).
3. **Economic accounting receipt** — D99 books (not verified for LB).

On-chain event ≠ Runtime D99 receipt.

---

## 15. Factory Dependency Hardening

`LiquidityBuildingFactoryV1` constructor now requires:

- Authorizer: schema V1, non-zero type hash, non-zero authority, `authorityType()` callable;
- Sink: version `LiquidityBuildingTreasuryFeeSinkV1`, receiver non-zero with code.

LB005 mock `LB005MockCodeDependency` updated with compatibility views so LB005 tests continue to pass without changing Program custody/lifecycle.

---

## 16. Events and Errors

**Event:** `LiquidityBuildingFeeSettled` (indexed settlementKey, programId, executionId).

**Authorizer errors:** ZeroAuthority, InvalidSchemaVersion, WrongChain, InvalidIntentAddress, InvalidTokenPair, InvalidEpochWindow, InvalidObservationRange, ExpiredDecision, InvalidStrategyMode, InvalidStructuralStrategyRate, InvalidSignature.

**Sink errors:** ZeroTreasuryReceiver, TreasuryReceiverWithoutCode, InvalidProgramCaller, InvalidProgramId, InvalidExecutionId, InvalidQuoteAsset, ZeroFeeAmount, InvalidAuthorizationReference, ProgramIdentityMismatch, ProgramQuoteMismatch, UnregisteredProgram, IncompatibleFactorySink, SettlementAlreadyCompleted, TreasuryTransferFailed, UnsupportedQuoteTransferBehavior, SettlementInvariantFailure.

**Factory errors (new):** IncompatibleAuthorizer, IncompatibleTreasurySink.

---

## 17. Threat Model

| Threat | Mitigation | Residual risk | Severity |
| --- | --- | --- | --- |
| Compromised KMS signer | Future Program economic bounds | Max spend until Program checks | HIGH until LB007 |
| Malicious EIP-1271 signer | Same | Same | HIGH until LB007 |
| Old signature | Future `configNonce` | Until Program enforces | MEDIUM |
| Cross-program / chain / factory / authorizer replay | EIP-712 domain + salt | Covered | — |
| Signature mutation | ECDSA/1271 reject | — | — |
| Malicious relayer | Cannot alter signed fields | Liveness only | LOW |
| Fake Program calling Sink | Registry + identity checks | Fake Factory spam | MEDIUM (Runtime filter) |
| Fake Factory | Runtime canonical filter required | Receipt spam | MEDIUM |
| Duplicate settlement | Idempotency key | — | — |
| Fee-on-transfer quote | Exact delta reject | — | — |
| Receiver token callback | nonReentrant + settled-before-transfer | — | — |
| Treasury receiver compromised | Funds reach immutable destination | Institutional | HIGH institutional |
| Sink direct donation | Stuck, unaccounted | Dust loss | LOW |
| Fake authorization ref | Recorded on-chain; Runtime must validate | Until Runtime | HIGH (G04C) |
| Runtime unavailable | Future Program must skip/revert before economic cycle | Liveness | HIGH until LB007 |
| Signer unavailable | Liveness failure; no custody loss | Liveness | HIGH (G03B) |

---

## 18. Test Coverage

Suite: `test/liquidity-building/LB006AuthorityTreasuryBoundaries.t.sol`  
Mocks: `test/liquidity-building/mocks/LB006TestDependencies.sol` (TEST ONLY / NOT PRODUCTION)

| Category | Cases | Result |
| --- | --- | --- |
| Authorizer construction/metadata | 1–9 | PASS |
| EIP-712 domain | 10–17 | PASS |
| EOA signatures | 18–32 | PASS |
| EIP-1271 | 33–37 | PASS |
| Sink construction | 38–45 | PASS |
| Successful settlement | 46–57 | PASS |
| Settlement failures | 58–74 | PASS |
| Idempotency | 75–80 | PASS |
| Factory hardening + LB005 path | 81–88 | PASS |
| Fuzz/property | 8 properties × 256 runs | PASS |
| Mainnet-fork read-only | `test_mainnetFork_*` | PASS (LOCAL FORK — NOT DEPLOYMENT) |

Regression: LB003 31 PASS; LB005 23 PASS (`--fuzz-runs 256`).

---

## 19. Mainnet-Fork Evidence

- RPC: `BNB_MAINNET_RPC_URL` or `https://bsc-dataseed.binance.org`
- Chain 56 verified; Melega Factory/Router code present; MARCO/WBNB pair code present
- Local deploy of Authorizer (TEST-ONLY authority) + Sink (TEST-ONLY receiver)
- Intent signed locally and validated; **no swap / add-liquidity / mainnet broadcast**

**LOCAL FORK VALIDATION — NOT MAINNET DEPLOYMENT**

---

## 20. Mainnet Binding Status

| Boundary | Contract | Infrastructure | Binding |
| --- | --- | --- | --- |
| Authorizer | Implemented | Autonomous signer missing | **BLOCKED** |
| Sink | Implemented | Canonical receiver missing | **BLOCKED** |
| Runtime ingestion | Event defined | LB receipt path missing | **BLOCKED** |
| Relay | Boundary frozen | Worker missing | **OPEN (liveness)** |

---

## 21. Open Blockers

| ID | Before LB006 | Contract status | Infrastructure status | After LB006 | Verification |
| --- | --- | --- | --- | --- | --- |
| LB-G02 | OPEN | Program execution not implemented | — | OPEN | LB007 |
| LB-G03A | OPEN (part of G03) | Authorizer contract | — | **CLOSED (code)** | forge tests |
| LB-G03B | OPEN | — | Autonomous production signing | OPEN / BLOCKING | KMS/EIP-1271 provision |
| LB-G03C | OPEN | — | Permissionless relay liveness | OPEN | Worker |
| LB-G04A | OPEN (part of G04) | Sink contract | — | **CLOSED (code)** | forge tests |
| LB-G04B | OPEN | — | Canonical Treasury receiver | OPEN / BLOCKING | On-chain + config proof |
| LB-G04C | OPEN | — | Runtime receipt ingestion for LB | OPEN / BLOCKING | Runtime mapping |
| LB-G07 | OPEN | — | Stale Pancake router | OPEN | Router purge |
| LB-G08 | OPEN | — | Quote floors | OPEN | Policy |
| LB-G09 | OPEN | — | Stable gas path | OPEN | Path |
| LB-G10 | OPEN | — | Finality evidence | OPEN | Infra |

### New gaps

| ID | Gap | Severity | Evidence | Required fix | Owner | Verification |
| --- | --- | --- | --- | --- | --- | --- |
| LB-G11 | KMS DER→Ethereum signature normalization for LB intents | HIGH | No adapter in `kerl-signing-gate` | Implement non-exportable KMS signer + normalization | Runtime | Signed digest against Authorizer |
| LB-G12 | LB-specific Treasury Runtime receipt ingestion | HIGH | `/api/v1/receipt` is batch-generic | Map `LiquidityBuildingFeeSettled` → Runtime | Treasury Runtime | End-to-end reconcile |

---

## 22. Recommended Next Mission

**LB007 — Liquidity Building Bounded Atomic Execution Engine**

Implement Program permissionless execution ingress, ExecutionIntent verification, replay/config/epoch protection, exact-output Melega swap, atomic success-fee settlement, post-swap matching, add-liquidity to LP recipient, residual accounting, rolling 24h cap, and LB003 economic invariants — without autonomous runtime or UI.

---

## Build evidence (session)

| Item | Value |
| --- | --- |
| Compiler | solc 0.8.20, optimizer 200, via_ir |
| Authorizer deployed bytecode | 2869 bytes |
| Sink deployed bytecode | 3105 bytes |
| Factory deployed bytecode | 8052 bytes |
| Authorizer storage | empty (immutables only) |
| Sink storage | `_settled` slot 0; `_records` slot 1 |
| Forbidden-authority scan | No human ops authority / EOA receiver / local fee custody introduced (comment matches only) |

**Confirmations**

- `NO HUMAN OPERATIONAL AUTHORITY INTRODUCED`
- `NO EOA TREASURY RECEIVER INTRODUCED`
- `NO LOCAL FEE CUSTODY INTRODUCED`
