# LB005 — Liquidity Building Core Contracts

**Status:** IMPLEMENTED WITH BLOCKERS (custody/lifecycle only — not mainnet-ready)  
**Baseline:** `main` @ `2fe176bec0f98f05ae74d42477c04aa161fe8626`  
**Verdict intent:** `LB005_CORE_IMPLEMENTED_WITH_BLOCKERS`

---

## 1. Implementation Summary

LB005 delivers the **immutable Factory + EIP-1167 Program clone** core: deterministic registration, isolated project-token custody, exact balance-delta deposits, owner lifecycle, strategy/epoch/LP recipient, configNonce, stop, and withdrawals. **No** swap, Treasury settle, Authorizer calls, ExecutionIntent, or `execute()`.

---

## 2. Repository and Toolchain

| Item | Value | Evidence |
| --- | --- | --- |
| Foundry root | repo root / `contracts` | `foundry.toml:2-7` |
| Solidity | 0.8.20 | `foundry.toml:7` |
| OpenZeppelin | 5.6.1 | `lib/openzeppelin-contracts/package.json` |
| Clones | OZ `Clones.sol` | Factory import |
| Initializable | OZ `proxy/utils/Initializable.sol` | Program |
| SafeERC20 | OZ | Program deposits/withdrawals |
| ReentrancyGuard | OZ 5.x storage guard | Clone-safe: entered iff slot `== 2`; zero storage OK |

**Reentrancy decision:** No upgradeable package installed. Documented that OZ `ReentrancyGuard` treats uninitialized (0) as not-entered; first use sets `NOT_ENTERED=1`. Verified via reentrancy mock test.

---

## 3. Contract Files

| File | Role |
| --- | --- |
| `contracts/liquidity-building/LiquidityBuildingFactoryV1.sol` | Production Factory |
| `contracts/liquidity-building/LiquidityBuildingProgramV1.sol` | Production Program implementation |
| `contracts/liquidity-building/interfaces/ILiquidityBuildingFactoryV1.sol` | Factory iface + `LBTypes` + Melega pair/factory ifaces |
| `contracts/liquidity-building/interfaces/ILiquidityBuildingProgramV1.sol` | Program iface + `ProgramView` |
| `test/liquidity-building/LB005CoreContracts.t.sol` | Tests |
| `test/liquidity-building/mocks/LB005TestDependencies.sol` | TEST ONLY mocks |
| `docs/LB005_LIQUIDITY_BUILDING_CORE_CONTRACTS.md` | This doc |

---

## 4. Factory Architecture

- **No owner/admin/setters.**
- Immutable: Melega Factory/Router, Authorizer, Treasury Fee Sink, implementation, protocol params, `factoryVersion`, `deploymentChainId`.
- Quote policies constructor-only; decimals checked via `IERC20Metadata`.
- `createProgram`: `owner=msg.sender`; `getPair` must equal supplied pair; reserves > 0; unique non-terminal base key; generation++; CREATE2 clone; atomic `initialize`; registry events.
- After STOPPED, active slot cleared on next create; historical programs remain registered.

---

## 5. Program Clone Architecture

- Implementation constructor: `_disableInitializers()`.
- Clone `initialize` once: identity, strategy, epoch, `configNonce=1`, `Created`.
- Custody: project token budget only (+ future `quoteResidual` path).
- No Router/Treasury/Authorizer interactions.

---

## 6. Immutable Protocol Configuration

| Parameter | Value | Mutable |
| --- | --- | --- |
| successFeeBps | 500 | No |
| strategyCeilingBps | 5000 | No |
| operatingCurveImpactBps | 40 | No |
| hardCurveImpactBps | 100 | No |
| hardEffectiveDeviationBps | 150 | No |
| decisionExecutionDriftBps | 100 | No |
| swapSlippageOperatingBps | 50 | No |
| hardSlippageBps | 100 | No |
| remainingBudgetEpochCapBps | 500 | No |
| totalBudgetEpochCapBps | 200 | No |
| rolling24hTotalBudgetCapBps | 2000 | No |
| maximumGasCostShareBps | 1000 | No |
| initialFinalityDepth | 15 | No |
| maxSuccessfulExecutionsPerEpoch | 1 | No |

---

## 7. Quote Asset Policy

Constructor array of `QuoteAssetPolicy`. Test floors marked **TEST-ONLY POLICY VALUE — NOT A MAINNET QUOTE FLOOR**. Production floors remain **LB-G08**. `GasConversionMode.NotActive` used in tests (**LB-G09**).

---

## 8. Program Identity and Generations

```
baseKey = keccak256(abi.encode(owner, projectToken, quoteAsset, pair))
programId = keccak256(abi.encode(chainId, factory, factoryVersion, baseKey, generation))
salt = programId
```

---

## 9. Clone Initialization Safety

| Property | Status |
| --- | --- |
| Implementation locked | Pass |
| Atomic init in create tx | Pass |
| Reinit blocked | Pass |
| Predicted == deployed | Pass |
| Unofficial clone not registered | Pass |
| Storage isolation | Pass |

---

## 10. Lifecycle

`Created → Ready (first deposit) → Active ↔ Paused → Stopped`  
`stop()` also allowed from Created/Ready/SafetyPaused.  
`resume` only from `Paused` (not SafetyPaused).  
ERROR not stored.

---

## 11. Owner Commands

| Action | From | To | Nonce | Event |
| --- | --- | --- | --- | --- |
| depositBudget | Created | Ready | +1 | BudgetDeposited |
| addBudget | Ready/Active/Paused/SafetyPaused | same | +1 | BudgetAdded |
| activate | Ready | Active | +1 | ProgramActivated |
| pause | Active | Paused | +1 | ProgramPaused |
| resume | Paused | Active | +1 | ProgramResumed |
| updateStrategy/Epoch | Created/Ready/Active/Paused | same | +1 | Strategy/EpochUpdated |
| updateLpRecipient | Created/Ready/Paused/SafetyPaused | same | +1 | LpRecipientUpdated |
| withdrawUnusedBudget | Ready/Paused/SafetyPaused | same | +1 | BudgetWithdrawn |
| stop | any non-Stopped | Stopped | +1 | ProgramStopped |
| withdrawStoppedAssets | Stopped | Stopped | no | BudgetWithdrawn / QuoteResidualWithdrawn |

---

## 12. Token-Budget Custody

Exact `balanceAfter - balanceBefore == amount` on deposit. Owner-only deposits. Direct donations ignored by accounting.

**Token policy (honest):** Exact-balance-transfer tokens supported. Fee-on-transfer and balance-inconsistent behavior rejected. SafeERC20 accepts no-return tokens **if** balance delta is exact.

---

## 13. Standard-Token Enforcement

Covered by tests: fee-on-transfer, false-return, reentrancy callback, insolvency via rebase burn.

---

## 14. Accounting and Solvency

```
remaining + sold + matched + withdrawnUnused = totalDeposited
```

In LB005: `sold=matched=0`. Execution counters immutable zeros (no setters). `isSolvent`: `balance >= remainingBudget`.

---

## 15. LP Recipient Control

Defaults to owner at create. Updates forbidden while Active. Third parties cannot update.

---

## 16. Events and Errors

Events: ProgramCreated, BudgetDeposited/Added, Activated/Paused/Resumed, Strategy/Epoch/LpRecipient Updated, BudgetWithdrawn, QuoteResidualWithdrawn, ProgramStopped.

| Custom error | LB002 mapping |
| --- | --- |
| UnsupportedQuoteAsset | UNSUPPORTED_QUOTE_ASSET |
| PairMissing / NonCanonicalPair | NO_MELEGA_POOL |
| UnsupportedTokenBehavior | FEE_ON_TRANSFER / NON_STANDARD |
| InvalidLifecycle / ProgramIsStopped | PROGRAM_PAUSED / STOPPED |
| InsufficientBudget | — |
| InsolventProgram | — |

---

## 17. Security Properties

- No Factory admin  
- No dependency setters  
- No `execute` stub  
- No unlimited approvals  
- No recovery sweep (deferred — residual risk: stuck non-budget tokens)  
- Forbidden-authority scan: see mission report  

---

## 18. Test Coverage

`LB005CoreContracts` — 23 tests (18 deterministic suites covering multi-assert cases + 5 fuzz properties × 256 runs). LB003 reference: 31 pass.

---

## 19. Mainnet-Fork Validation

Not executed in this mission run (no guaranteed `BNB_MAINNET_RPC_URL` in CI path). Optional fork remains deferred — **not invented**.

---

## 20. Open Blockers

| ID | After LB005 |
| --- | --- |
| LB-G02 | OPEN — execution deferred |
| LB-G03 | OPEN — Authorizer/relay not implemented |
| LB-G04 | OPEN BLOCKER — production Treasury Sink absent (test doubles ≠ close) |
| LB-G07 | OPEN — package untouched |
| LB-G08 | OPEN — production floors not supplied |
| LB-G09 | OPEN — stable conversion absent |
| LB-G10 | OPEN — finality pending |

---

## 21. Deferred Execution Scope

Not implemented: Authorizer, EIP-712, swap, Treasury settlement, addLiquidity, LP mint, rolling execution cap, safety attestation.

---

## 22. Recommended Next Implementation

**LB006 — Liquidity Building Execution Authorizer & Treasury Fee Sink**
