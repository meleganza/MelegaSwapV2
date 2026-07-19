# LB004 — Liquidity Building Contract Architecture

**Status:** FROZEN (V1 architecture) — not mainnet-ready  
**Mission:** LB004 — smart-contract architecture & security specification  
**Depends on:** LB001 audit · LB002 UI/domain · LB003 economic math  
**Baseline:** `main` @ `ba0316734cd4912c7ae210a93f886787e9ff89ed`  
**Artifact only:** this document — **no production Solidity**

Open blockers LB-G02…G10 remain open unless disposition below explicitly reclassifies impact (never “closed” without implementation evidence).

---

## 1. Executive Architecture Decision

Liquidity Building V1 is an **immutable, versioned Factory** that deploys **isolated per-program EIP-1167 clones** of a non-upgradeable Program implementation. Each Program:

- custodians **only** that program’s project-token budget and quote residual;
- validates **EIP-712 ExecutionIntent** via a **canonical Execution Authorizer** (contract-bound; no human hot wallet authority);
- accepts **permissionless relay** of valid intents;
- executes **atomically**: exact-out swap → Treasury fee settle → addLiquidity → LP to `lpRecipient` → accounting;
- never holds LP in the happy path;
- never uses Pancake stale router (`packages/smart-router/evm/constants/exchange.ts:10`);
- binds only Melega Factory `0xb7E584…039C` and Router `0xc25033…EAB3`.

**Epoch policy freeze:** `V1_SINGLE_EXECUTION_PER_EPOCH`.

**Mainnet remains blocked** at least by: Treasury fee sink (LB-G04), authorizer+runtime (LB-G03), quote floors (LB-G08), implementation+audit, low-value real cycle.

```
Versioned Factory / Registry (immutable)
        │ CREATE2 + EIP-1167 clone + initialize
        ▼
Per-Program Contract (isolated custody)
        ├── budget / lifecycle / configNonce
        ├── exact-out swap via Melega Router
        ├── fee → ILiquidityBuildingTreasuryFeeSinkV1
        ├── addLiquidity → LP to lpRecipient
        └── residual + rolling-cap accounting

External: Melega Factory · Melega Router · Pair · Authorizer · Treasury Fee Sink
```

---

## 2. Existing Contract Patterns

| Existing pattern | File/lines | Reusable | Risk | LB004 decision |
| --- | --- | --- | --- | --- |
| Solidity 0.8.20 + via_ir | `foundry.toml:7-10` | Yes | — | Same toolchain |
| OZ 5.6.1 | `lib/openzeppelin-contracts/package.json`; `foundry.lock` | Yes | — | Use OZ Clones, SafeERC20, ReentrancyGuard, ECDSA/EIP712 |
| Ownable + Pausable | `MelegaSmartRouterWrapper.sol:6-16,97-101` | Partial | Local owner pause ≠ LB admin | Program uses **owner-of-program** only; Factory has **no economic admin** |
| SafeERC20 | Wrapper + adapters | Yes | — | Deposits + Router approvals |
| ReentrancyGuard | Wrapper `:8,16` | Yes | — | Program `nonReentrant` on execution/deposit/withdraw |
| Custom errors | Wrapper `:30-34` | Yes | — | Prefer custom errors (no require strings in production LB) |
| Events PascalCase | Wrapper `:36-70` | Yes | — | LB event freeze §24 |
| Immutable fee collector address | Wrapper `:25,91` | Pattern only | Address may be EOA today | LB **forbids EOA fee sink**; requires contract sink |
| Treasury handoff TS | `apps/web/src/lib/treasury-handoff/` | Off-chain only | Not on-chain settle | Informs sink interface; does not satisfy LB-G04 |
| KERL signing gate | `kerl-signing-gate/` | Conceptual | HOT_SIGNER; KMS missing | Authorizer interface separate; no human authority |
| CREATE2 pair compute | `packages/swap-sdk/.../pair.ts:15-50` | Off-chain verify | — | On-chain: `factory.getPair` only |
| EIP-712 / EIP-1271 / Clones in `contracts/` | **Not found** | Introduce | New surface | Introduce via OZ in LB005+ |
| AccessControl / proxies / LP locker | **Not found** | — | — | Do not invent local admin roles |
| LP deferral | `lpSubmitDeferral.ts:16-29` | Evidence LB-G02 | Ingress unsupported | Dedicated Program path; not KERL ingress |
| Stale Pancake router | `smart-router/.../exchange.ts:10` | Forbidden | Wrong DEX | Core never imports it |

### Negative evidence (searched, not found)

- Canonical on-chain authority registry for LB  
- EIP-1271 authority already deployed for LB  
- Production Treasury **fee sink** Solidity contract  
- Global on-chain safety/governance pause for LB  
- Versioned factory pattern in-repo  
- Reusable LP locker contract  

---

## 3. Deployment Topology ADR

### ADR-LB004-01 — Program Deployment Topology

| Field | Content |
| --- | --- |
| **Decision** | **Model B — Immutable EIP-1167 clone per program** |
| **Alternatives** | A full bytecode per program; C singleton mappings |
| **Evidence** | No existing clone/proxy in `contracts/`; OZ 5.6.1 Clones available; custody isolation required by mission |
| **Security** | Isolated storage per program; implementation **immutable** for factory version; no proxy admin; initialize once |
| **Gas** | Clone deploy ≪ full bytecode; execution gas ≈ full contract |
| **Mainnet** | CREATE2 deterministic `program` addresses; registry indexing |
| **Rejected A** | Higher deploy gas; no security gain over clone with immutable impl |
| **Rejected C** | Shared custody blast radius; storage collision / audit complexity; forbidden unless proven — **not proven** |

Factory stores immutable `implementation`. `createProgram` → `Clones.cloneDeterministic` → `initialize(...)` atomically → register. If initialize fails, entire create reverts (no orphan clone).

---

## 4. Contract Responsibility ADR

### ADR-LB004-02 — Contract Responsibility Split

| Component | Responsibility | Custody | Mutable admin? |
| --- | --- | --- | --- |
| **LiquidityBuildingFactoryV1** | Version, Melega deps, quote policy, authorizer, Treasury sink refs, CREATE2 clone+init, uniqueness registry, discovery | None (no tokens) | **No** — immutable deployment |
| **LiquidityBuildingProgramV1** (clone) | Budget custody, lifecycle, strategy/epoch/LP recipient, configNonce, caps, atomic execution, residuals, owner cmds | Project token budget + quote residual only | Owner cmds only on **that** program |
| **DEX math** | Internal **library** (or inlined) mirroring LB003 / Melega 9975/10000 | None | — |
| **Router/Factory/Pair** | Canonical Melega externals | N/A | — |
| **ILiquidityBuildingExecutionAuthorizerV1** | Validate EIP-712 digest / EIP-1271 | **No assets, no allowance** | Rotation only via **new factory version** or canonical registry if later exists |
| **ILiquidityBuildingTreasuryFeeSinkV1** | Pull/push exact fee; emit settlement receipt | Fee after settle | Sink’s own immutability rules |
| **LP Locker** | **Out of core** | — | Owner locks post-delivery elsewhere |

No mutable adapter registry. No shared vault.

---

## 5. Custody Model

| Asset | Program may hold? | Rule |
| --- | --- | --- |
| Project token | Yes | Deposited budget + token residual returned from addLiquidity |
| Quote residual | Yes | Post-fee leftover carried for future addLiquidity; withdraw after STOPPED |
| LP | **No** (happy path) | Router mints to `lpRecipient` |
| Treasury fee after settle | **No** | Must leave in same tx |
| Other programs’ assets | **No** | — |
| Arbitrary ERC-20 / unexpected BNB | Not as budget | `recoverNonBudgetToken` owner-only: **excludes** project token, quote residual accounting balance, LP; does not alter metrics |
| Executor/relayer funds | **No** | Relayer pays gas only |

---

## 6. Roles and Authority

| Role | Powers | Forbidden |
| --- | --- | --- |
| **Program owner** | deposit/addBudget, activate, pause/resume, updateStrategy/epoch/lpRecipient, withdrawUnused, stop, withdrawStoppedAssets, recoverNonBudgetToken | Move fee destination; override execution amounts; mint LP to self via execution override; bypass LB003 bounds |
| **Execution Authorizer** | Attest typed intent validity | Custody, allowances, choosing G/recipient/fee sink |
| **Relayer (any address)** | Submit `execute(intent, signature)` | Discretion; pause without verifiable condition |
| **Treasury Fee Sink** | Accept exact fee + emit receipt | Hold project budget |
| **Factory deployer** | One-time deploy of immutable factory | Post-deploy economic control |
| **Global emergency** | **None in V1** (see ADR-06) | — |

**Prohibited:** human hot wallet executor, funded ops EOA, multisig that decides executions, admin that changes recipient/fee/strategy of live executions, EOA fee fallback.

---

## 7. Lifecycle and UI-State Mapping

### On-chain enum (minimal)

```
enum Lifecycle { Created, Ready, Active, Paused, SafetyPaused, Stopped }
```

| LB002 ProgramStatus | On-chain source | Runtime-derived | UI behavior |
| --- | --- | --- | --- |
| NOT_ACTIVE | no program | — | Inactive card |
| SETUP_REQUIRED | none / Created | pair missing, token verdict | Setup / Create Pool |
| AWAITING_APPROVAL | Created/Ready | allowance < deposit | Approve CTA |
| AWAITING_DEPOSIT | Created | `totalDeposited==0` | Deposit CTA |
| READY | **Ready** | budget>0, not activated | Activate |
| ACTIVE | **Active** | — | Active card |
| PAUSED | **Paused** | — | Resume |
| SAFETY_PAUSED | **SafetyPaused** | reason code | Safety banner |
| BUDGET_DEPLETED | Active/Paused | remaining below floor / zero executable | Add Budget |
| STOPPED | **Stopped** | — | Terminal |
| ERROR | **not stored** | read-model / failed tx | Retry; revert leaves prior lifecycle |

Reverts **must not** persist `ERROR`.

`TransactionPhase` remains UI/runtime only (LB002).

---

## 8. Program Creation and Identity

**Who creates:** any address may call Factory `createProgram`, but `owner` param must be `msg.sender` (or explicit owner = msg.sender only in V1 — **freeze: owner = msg.sender**).

**Initialize binds:** owner, projectToken, quoteAsset, pair, lpRecipient(=owner), strategy, epochDuration, configNonce=1, factoryVersion, domain deps.

**Uniqueness (non-terminal):** one active non-Stopped program per  
`keccak256(owner, projectToken, quoteAsset, pair)`  
After **Stopped**, a new program may be created (new address / new programId).

**programId:**

```
programId = keccak256(
  abi.encode(
    chainId,
    factoryVersion,
    factoryAddress,
    owner,
    projectToken,
    quoteAsset,
    pair,
    salt  // factory nonce or CREATE2 salt
  )
)
```

Never use symbol/name. Pair must satisfy `melegaFactory.getPair(project,quote)==pair`, reserves > 0, quote enabled in factory policy.

**Existing pair required** for create/activate. No-pool is external (§28).

---

## 9. Owner Command Model

| Command | Allowed lifecycle | Effects | configNonce++ | Invalidates prior intents |
| --- | --- | --- | --- | --- |
| `depositBudget` / `addBudget` | Created→Ready; Active; Paused; SafetyPaused (policy: **allow add in SafetyPaused**); not Stopped | SafeERC20 delta enforce; ↑ totalDeposited, remaining | No | No |
| `activate` | Ready → Active | emits Activated | No | No |
| `pause` | Active → Paused | — | **Yes** | Yes |
| `resume` | Paused → Active | — | **Yes** | Yes |
| `updateStrategy` | Active/Paused | future epochs only | **Yes** | Yes |
| `updateEpochDuration` | Active/Paused | future only | **Yes** | Yes |
| `updateLpRecipient` | **Paused** only; no in-flight (atomic so N/A); non-zero | future executions | **Yes** | Yes |
| `withdrawUnusedBudget` | Paused / SafetyPaused / Stopped (rules) | ↓ remaining, ↑ withdrawnUnused | No* | No |
| `stop` | Active/Paused/SafetyPaused → Stopped | terminal | **Yes** | Yes |
| `withdrawStoppedAssets` | Stopped | unused project + quote residual | No | — |

\*Optional nonce bump on withdraw unused — **freeze: no** (does not change execution params).

**Race:** if execution mined before update → valid under old config; history immutable. If update first → old intent fails `StaleConfigNonce`.

---

## 10. Execution Authorization ADR

### ADR-LB004-03 — Execution Authorization and Permissionless Relay

| Field | Content |
| --- | --- |
| **Decision** | Autonomous runtime builds EIP-712 intent → **Authorizer** validates (prefer **EIP-1271 contract**; interim autonomous non-exportable KMS key **only as authorizer signer**, never custodian) → **any** address relays `execute` |
| **Rejected** | Human hot wallet; exclusive Melega broadcaster ACL; Program-held private key; relayer economic discretion |
| **Evidence** | No on-chain EIP-1271 authority found; KERL gate is off-chain (`kerl-signing-gate/`); KMS adapter missing |
| **Security** | Signer: no assets, no allowance, cannot set recipient/fee/G beyond signed digest; Program revalidates LB003 bounds |
| **Liveness** | Melega relayer helpful but **not** exclusive |
| **LB-G03** | Privileged-broadcast dependency **eliminated**; autonomous **liveness** still required → severity becomes **liveness** until relayer exists |

Authorizer interface:

```solidity
interface ILiquidityBuildingExecutionAuthorizerV1 {
    function isValidSignature(bytes32 digest, bytes calldata signature)
        external view returns (bytes4); // EIP-1271 magic
}
```

Factory immutably stores `authorizer`. Rotation ⇒ **new factory version**.

---

## 11. EIP-712 ExecutionIntent

**Domain:** `name="MelegaLiquidityBuilding"`, `version=factoryVersion`, `chainId`, `verifyingContract=program`.

**Typehash fields (signed):**

| Field | Type | Unit | Source | On-chain validation |
| --- | --- | --- | --- | --- |
| schemaVersion | uint256 | — | protocol | == V1 |
| chainId | uint256 | — | chain | == block.chainid |
| factoryVersion | bytes32 | — | factory | match |
| programId | bytes32 | — | program | match |
| program | address | — | self | == address(this) |
| pair | address | — | state | == stored pair |
| projectToken | address | — | state | match |
| quoteAsset | address | — | state | match |
| epochId | bytes32 | — | runtime | unused epoch |
| epochStartTimestamp | uint64 | s | runtime | consistent window |
| epochEndTimestamp | uint64 | s | runtime | ≥ start |
| observationStartBlock | uint64 | — | runtime | ≤ end |
| observationEndBlock | uint64 | — | runtime | ≤ block.number − finality |
| anchorBlock | uint64 | — | runtime | ≤ head − finality; not future |
| anchorProjectReserve | uint256 | base | pair @ anchor | drift vs live |
| anchorQuoteReserve | uint256 | base | pair @ anchor | drift vs live |
| eligibleNetBuyFlow | uint256 | quote base | runtime | ≥ target path |
| strategyMode | uint8 | enum | state | match + range |
| effectiveStrategyRateBps | uint16 | bps | runtime | ≤ ceiling; in Dynamic Range |
| grossQuoteTarget | uint256 | quote | runtime | == clamped; Program **must not** substitute different G |
| maximumProjectTokenIn | uint256 | project | runtime | ≥ getAmountIn(G); ≤ budget path |
| configNonce | uint64 | — | state | == current |
| executionNonce | uint64 | — | program counter | unused / match |
| strategyEngineVersion | bytes32 | — | runtime | recorded |
| decisionDeadline | uint64 | s | runtime | ≥ block.timestamp |
| maximumGasPrice | uint256 | wei | runtime | tx.gasprice ≤ |
| treasuryAuthorizationReference | bytes32 | — | Treasury | passed to sink |
| observationCommitment | bytes32 | — | runtime | optional integrity |
| finalityDepth | uint16 | blocks | factory param | ≥ factory min (15) |
| trancheIndex | uint8 | — | always 0 in V1 | must be 0 |

**Not signed:** presentation metrics, USD, UI labels.

Replay prevented by domain + `program` + `epochId` + `executionNonce` + consumed digest set.

---

## 12. Replay and Epoch Protection

**Freeze: `V1_SINGLE_EXECUTION_PER_EPOCH`.**

| Rule | Behavior |
| --- | --- |
| Success | Marks `epochId` consumed; stores digest |
| Revert | Epoch **not** consumed; retry allowed |
| Replacement tx | Same digest; at most one success |
| configNonce change | Old digests invalid |
| Tranche | `trancheIndex` must be 0; no second tranche in V1 |

LB003’s optional cross-block tranche is **deferred** to a future factory version if empirical need appears.

---

## 13. Finality and Observation Boundary

```
Runtime observes finalized Swap logs
  → classifies Eligible Net Buy (LB003)
  → signs commitment
Contract verifies signature + hard economic bounds
  (does not re-scan historical logs)
```

Validates: blocks not future; `anchorBlock ≤ head − finalityDepth`; deadline; pair; drift ≤ 100 bps; configNonce; epoch uniqueness; caps; impact; strategy ceiling.

**finalityDepth initial = 15** (LB-G10 activation parameter). Executor cannot reduce. New factory version may change.

Runtime-detected reorg → recommend `safetyPause` via **signed SafetyAttestation** (authorizer) or on-chain detectable invariant failure — not arbitrary relayer pause.

---

## 14. Atomic Execution Flow

**All-or-revert.** `nonReentrant`. Preferred CEI: validate + effects bookkeeping staging → interactions → finalize effects + events.

```
1  require Lifecycle.Active
2  verify EIP-712 + authorizer
3  verify configNonce, epoch unused, digest unused
4  verify finality, deadline, gasprice
5  read live reserves; orient X/Y
6  verify drift vs anchor ≤ 100 bps
7  verify strategy, curve impact, effective deviation, budget, epoch/day caps, floors
8  require intent.grossQuoteTarget executable as-is (no free re-clamp by executor)
9  approve Router exact maximumProjectTokenIn (forceApprove)
10 swapTokensForExactTokens(G, amountInMax, path, program, deadline)
11 measure dxActual, GActual (==G for exact-out success)
12 fee = floor(GActual * 500 / 10000)
13 settle fee via Treasury sink (pull exact fee) — MUST succeed
14 quoteForLiq = quoteResidual + (GActual - fee)
15 compute matchedBound; approve Router
16 addLiquidity(..., lpRecipient, deadline)
17 require LP recipient evidence / amounts
18 clear Router allowances to 0
19 update remaining, sold, matched, residuals, rolling cap, cumulatives
20 mark epoch+digest consumed
21 emit ExecutionCompleted + TreasuryFeeSettled
```

Failure of swap, Treasury settle, addLiquidity, LP evidence, or invariant ⇒ **full revert** (no leftover fee wallet, no LP without fee, no fee without swap accounted).

---

## 15. Treasury Fee Boundary ADR

### ADR-LB004-04 — Treasury Fee Settlement Boundary

| Field | Content |
| --- | --- |
| **Decision** | Immutable factory-bound `ILiquidityBuildingTreasuryFeeSinkV1`; Program transfers exact fee then calls settle (or sink pulls with exact allowance); receipt required |
| **Rejected** | EOA collector; local fee accrual; off-chain-only fee; complete LP before settle |
| **Evidence** | Wrapper uses address collector (`MelegaSmartRouterWrapper.sol:25`) — **insufficient** for LB; no production sink contract found |
| **LB-G04** | Remains **BLOCKER** until sink deployed+verified+wired |

```solidity
interface ILiquidityBuildingTreasuryFeeSinkV1 {
    function settleLiquidityBuildingFee(
        bytes32 programId,
        bytes32 executionId,
        address quoteAsset,
        uint256 amount,
        bytes32 authorizationReference
    ) external returns (bytes32 settlementReceipt);
}
```

| Aspect | Freeze |
| --- | --- |
| Caller | Program only (sink should check `msg.sender` is registered program or allowlisted factory children) |
| Amount | Exact `fee`; no over-allowance |
| Reentrancy | Sink must be nonReentrant / checks-effects; Program already nonReentrant |
| Duplicate | `executionId` unique in sink |
| Failure | Entire LB execution reverts |

---

## 16. DEX Interaction Boundary

- Router: Melega `0xc25033…EAB3` immutable on Factory/Program  
- Factory: `0xb7E584…039C` for `getPair` canonicality  
- Primitive: `swapTokensForExactTokens` only for LB sell  
- `addLiquidity` / `addLiquidityETH` only as needed for WBNB quote  
- Path length 2: project ↔ quote  
- Math library: LB003 coefficients 9975/10000  
- **Never** `packages/smart-router/.../exchange.ts` Pancake address  

---

## 17. Budget and Residual Accounting

**Boundary invariant (end of every successful tx):**

```
remaining + tokensSold + tokensMatched + withdrawnUnused = totalDeposited
reservedForExecution = 0  // reservation only in-memory mid-tx
```

| Event | Accounting |
| --- | --- |
| Deposit | +totalDeposited, +remaining |
| Sold | −remaining, +tokensSold |
| Matched | −remaining, +tokensMatched |
| Token residual return | +remaining (not matched) |
| Withdraw unused | −remaining, +withdrawnUnused |

**Quote:**

```
quoteAvailableForLiquidity = priorQuoteResidual + currentNetQuote
currentNetQuote = GActual − fee   // only this portion was fee-assessed
```

Residual never re-feeed. Matching limited by project remaining. Unused quote → new `quoteResidual`.  
Withdraw quote residual only after **Stopped**. Not withdrawable while Active.

---

## 18. Rolling 24h ADR

### ADR-LB004-05 — Rolling 24h Accounting

| Field | Content |
| --- | --- |
| **Decision** | **Conservative hourly ring buffer** — 25 buckets × 1 hour (covers ≥24h; **explicitly slightly >24h**) |
| **Rejected** | Unbounded exact queue (DoS/gas); 5-min ring (higher SSTORE); off-chain enforcement |
| **Bound** | Loop ≤ 25 iterations |
| **Conservatism** | Sum of buckets that may overlap the last 24h window — never underestimates |
| **Cap** | `rollingConsumed + thisTx ≤ totalDeposited * 2000 / 10000` |

Each success adds `tokensSold+tokensMatched` into `bucket[hourIndex % 25]`, decaying old buckets when index advances across gaps.

---

## 19. Quote Asset Policy

Stored **immutably on Factory version** (not admin setter):

| Asset | Address (56) | Enabled V1 |
| --- | --- | --- |
| WBNB | `0xbb4CdB…095c` | Yes (gas path direct) |
| USDT | `0x55d398…7955` | Yes **iff** floors ratified + gas path (LB-G08/G09) |
| USDC | `0x8AC76a…580d` | Same gate |

Per asset: decimals, minGrossQuoteFloor, minReserveFloor, gasConversionMode (`NATIVE`|`STABLE_PENDING`), enabled.

Floor changes ⇒ **new factory/policy version**; no retroactive rewrite of executions. Existing programs keep creation-time floors via factoryVersion binding.

---

## 20. Safety Pause and Emergency Boundary

### Owner pause
Owner → `Paused`; blocks execute; bumps configNonce.

### Safety pause
Triggers (verifiable): reserve/pair/recipient/accounting invariant fail; authorizer SafetyAttestation (reorg); Treasury incompatibility detected; token balance inconsistency.

Emits `ProgramSafetyPaused(reasonCode)`. Withdraw unused may remain allowed (freeze: **yes** for project unused; quote residual only after stop). Resume requires: owner tx + clear condition + optional clear attestation + **configNonce++**.

Relayer cannot arbitrary safety-pause.

### ADR-LB004-06 — Global Emergency Boundary

| Field | Content |
| --- | --- |
| **Decision** | **No global authority in V1** |
| **Rejected** | Local multisig/EOA pause; inventing governance |
| **Evidence** | No canonical Melega global safety SC found for LB |
| **If later** | Only contract-bound pause-of-new-executions; **never** custody/fee/recipient |

---

## 21. Immutability and Migration ADR

### ADR-LB004-07 — Immutability and Versioned Migration

| Field | Content |
| --- | --- |
| **Decision** | Factory+implementation immutable; **no** Transparent/UUPS admin; fixes via new factory version |
| **Migration** | Owner stops old → withdraws → creates new program voluntarily; LP already delivered stays with owner; history stays on old address |
| **Rejected** | Upgradeable proxies; forced migration; implementation swap under existing clones |

`factoryVersion` bytes32 on factory; frontend discovers via registry events.

---

## 22. Storage Model

### Factory
`version`, `implementation`, `melegaFactory`, `melegaRouter`, `authorizer`, `treasuryFeeSink`, `finalityDepth`, `protocolStrategyCeiling`, quotePolicies mapping, `programs[programId]`, `activeKey[owner][project][quote][pair]`, `programCount`, `createSalt`.

### Program
Immutable-like after init: `programId`, `owner`, `projectToken`, `quoteAsset`, `pair`, `factory`.  
Mutable: `lpRecipient`, `lifecycle`, `strategy`, `epochDuration`, `configNonce`, budget fields, `quoteResidual`, cumulatives (gross/fee/quoteAdded/lpMinted), `executionCount`, `lastExecutionId`, `usedEpoch[epochId]`, `usedDigest[digest]`, hourly ring, `safetyReason`.

Pack where safe; do not drop economic fields for gas micro-opts.

---

## 23. Interface Freeze

Pseudo-Solidity (documentation only — **not** added to `contracts/` in LB004):

```solidity
interface ILiquidityBuildingFactoryV1 {
    function createProgram(
        address projectToken,
        address quoteAsset,
        address pair,
        StrategyConfig calldata strategy,
        uint32 epochDurationSeconds
    ) external returns (address program, bytes32 programId);

    function getProgram(bytes32 programId) external view returns (address);
    function activeProgram(address owner, address projectToken, address quoteAsset, address pair)
        external view returns (address);
    function quotePolicy(address quoteAsset) external view returns (QuoteAssetPolicy memory);
    function factoryVersion() external view returns (bytes32);
}

interface ILiquidityBuildingProgramV1 {
    function depositBudget(uint256 amount) external;
    function activate() external;
    function pause() external;
    function resume() external;
    function updateStrategy(StrategyConfig calldata strategy) external;
    function updateEpochDuration(uint32 seconds_) external;
    function updateLpRecipient(address newRecipient) external;
    function withdrawUnusedBudget(uint256 amount) external;
    function stop() external;
    function withdrawStoppedAssets() external;
    function execute(ExecutionIntent calldata intent, bytes calldata signature) external;
    function safetyPause(bytes32 reasonCode, bytes calldata attestation) external;
    function clearSafetyAndResume(bytes calldata clearAttestation) external;
    function recoverNonBudgetToken(address token, uint256 amount, address to) external;

    function getProgramView() external view returns (ProgramView memory);
}

interface ILiquidityBuildingExecutionAuthorizerV1 {
    function isValidSignature(bytes32 digest, bytes calldata signature) external view returns (bytes4);
}

interface ILiquidityBuildingTreasuryFeeSinkV1 {
    function settleLiquidityBuildingFee(
        bytes32 programId,
        bytes32 executionId,
        address quoteAsset,
        uint256 amount,
        bytes32 authorizationReference
    ) external returns (bytes32 settlementReceipt);
}
```

Use real Melega `IPancakeRouter02` / Factory / Pair ABIs already in-repo — do not fork incompatible variants.

`execute` caller: any; lifecycle Active; validates §11–14; effects §14; events ExecutionCompleted, TreasuryFeeSettled; errors from §25.

---

## 24. Event Freeze

| Event | Key indexed fields |
| --- | --- |
| ProgramCreated | programId, owner, program, pair |
| BudgetDeposited / BudgetAdded | programId, amount, totalDeposited |
| ProgramActivated / Paused / Resumed | programId |
| ProgramSafetyPaused / Cleared | programId, reasonCode |
| StrategyUpdated / EpochDurationUpdated / LpRecipientUpdated | programId, configNonce |
| ExecutionCompleted | programId, executionId, epochId, dx, G, fee, matched, quoteAdded, tokenResidual, quoteResidual, lpMinted, lpRecipient |
| TreasuryFeeSettled | programId, executionId, amount, receipt |
| BudgetWithdrawn / QuoteResidualWithdrawn | programId, amount |
| ProgramStopped | programId |

Avoid huge arrays in events. Sufficient for indexing, Treasury recon, LP evidence.

---

## 25. Custom Error Freeze

| Custom error | LB002 reason code (approx) |
| --- | --- |
| UnauthorizedOwner | — |
| InvalidLifecycle | PROGRAM_PAUSED / STOPPED |
| InvalidDomainOrChain | WRONG_CHAIN |
| NonCanonicalPair | NO_MELEGA_POOL |
| UnsupportedQuoteAsset | UNSUPPORTED_QUOTE_ASSET |
| UnsupportedTokenBehavior | FEE_ON_TRANSFER / NON_STANDARD |
| ZeroAmount | — |
| InsufficientBudget | — |
| StaleConfigNonce | — |
| InvalidSignature | — |
| ExpiredDecision | — |
| UnfinalizedAnchor | — |
| ReserveDriftExceeded | — |
| PriceImpactExceeded | PRICE_IMPACT_LIMIT |
| StrategyLimitExceeded | — |
| EpochCapExceeded | BUDGET_EPOCH_LIMIT |
| RollingCapExceeded | BUDGET_DAILY_LIMIT |
| DuplicateEpoch | EPOCH_ALREADY_EXECUTED |
| DuplicateExecution | — |
| InvalidExactOutAmount | — |
| TreasurySettlementFailed | TREASURY_SETTLEMENT_FAILED |
| AddLiquidityFailed | — |
| LpRecipientMismatch | — |
| AccountingInvariantFailed | — |
| SafetyPaused | SAFETY_PAUSED |
| ProgramStopped | — |

---

## 26. Formal Invariant Mapping

| Invariant | Program | Factory | Authorizer | Treasury | Runtime | Evidence |
| --- | --- | --- | --- | --- | --- | --- |
| Budget conservation | ✓ | | | | | events+storage |
| No overspend | ✓ | | | | propose | revert |
| Fee correctness | ✓ | | | ✓ amount | | settle+events |
| Quote conservation | ✓ | | | | | ExecutionCompleted |
| Token exec conservation | ✓ | | | | | mid-tx |
| LP evidence | ✓ | | | | | Mint/delta |
| No double epoch | ✓ | | | | | usedEpoch |
| No double execution | ✓ | | | | | digest |
| Internal-flow exclusion | | | | | ✓ | observation commit |
| Historical immutability | ✓ | | | | | no rewrite |
| Recipient immutability | ✓ | | | | | state+nonce |
| Treasury basis immutability | ✓ fee bps | ✓ sink addr | | | | factory immutables |
| Price-impact bound | ✓ | | | | | revert |
| Deadline | ✓ | | | | | revert |
| Rolling cap | ✓ | | | | | ring |
| Strategy ceiling | ✓ | ✓ param | | | | |
| Pair canonicality | ✓ | ✓ | | | | getPair |

---

## 27. Threat Model

| ID | Asset at risk | Attack path | LB003 bound | On-chain mitigation | Runtime mitigation | Residual | Severity |
| --- | --- | --- | --- | --- | --- | --- | --- |
| T01 | Budget | Compromised signer invents E | impact/caps | Revalidate impact, caps, drift; cannot raise G | Attestation ops | False E within caps | **HIGH** — residual within daily 20% |
| T02 | Budget | Signer maxes daily cap | rolling 20% | Enforce ring | Monitor | Bounded loss | HIGH mitigated |
| T03 | None custody | Relayer mutates calldata | — | Signature over full intent | — | DoS only | MEDIUM |
| T04 | Wrong recipient | Old intent after LP update | nonce | StaleConfigNonce | — | — | HIGH mitigated |
| T05 | Strategy | Old intent after strategy update | nonce | Same | — | — | HIGH mitigated |
| T06 | Price | Reserve manip / sandwich | drift 100; impact 100 | Drift+impact+deadline | Private relay optional | MEV residual | HIGH mitigated/residual MEV |
| T07 | Fee/budget | Treasury reentrancy | atomic | nonReentrant both sides | — | Malicious sink | **BLOCKER** until sink audited |
| T08 | Accounting | Partial addLiquidity | residuals | Measure actuals; revert on invariant | — | — | HIGH mitigated |
| T09 | Budget | FoT / rebase token | delta deposit | UnsupportedTokenBehavior | Off-chain scanner | — | HIGH mitigated |
| T10 | Dilution | Direct token donation | — | Donations not credited to budget | — | Dust | LOW |
| T11 | Quote | Direct quote donation | — | Not credited as fee-paid residual without rules; accounting separate | — | Edge | MEDIUM |
| T12 | Double spend | Duplicate epoch | epoch map | DuplicateEpoch | — | — | HIGH mitigated |
| T13 | Obs integrity | Reorg after observe | finality 15 | Safety attestation / pause | Reorg watch | LB-G10 | MEDIUM |
| T14 | Allowance | Router residue | clear approvals | forceApprove 0 | — | — | HIGH mitigated |
| T15 | Eco | Wrong quote floor | floors | Factory policy | Ratify LB-G08 | **BLOCKER** activation | BLOCKER |
| T16 | Eco | Bad gas-stable convert | — | Only tx.gasprice bound on-chain | LB-G09 path | Stable gated | BLOCKER stable |
| T17 | Init | Clone init takeover | — | Atomic factory init; initializer modifier | — | — | HIGH mitigated |
| T18 | CREATE2 | Collision | — | Permissionless salt registry uniqueness | — | — | MEDIUM |
| T19 | Race | Owner stop vs execute | — | Same-block order; stop bumps nonce | — | Ordering | MEDIUM |
| T20 | Fake pair | Non-Melega pair | getPair | NonCanonicalPair | — | — | HIGH mitigated |
| T21 | Cross-chain replay | Same digest | EIP-712 chainId+program | Domain separator | — | — | HIGH mitigated |
| T22 | DoS | Relayer spam fails | — | Failed≠consume epoch; gas grief | Rate limit | Grief gas | MEDIUM |
| T23 | Compromised owner | Drain via withdraw/stop | owner rights | Expected custody owner | Wallet security | Owner risk | HIGH residual (inherent) |

**HIGH/BLOCKER without full mitigate:** T01 residual (bounded), T07 sink, T15 floors, T16 stable gas, T23 owner key (inherent).

---

## 28. No-Pool Limited Amendment

### LB002 LIMITED AMENDMENT — NO-POOL INITIAL RATIO

- Base LB setup fields **unchanged** (Token, Budget, Strategy, Epoch).  
- **Only** no-pool subflow asks owner for: quote asset, project seed, quote seed, resulting initial ratio.  
- UI must state owner sets **initial price**.  
- Core Program **never** creates pair.  
- Activate/create requires existing Melega pair with reserves.

---

## 29. Mainnet Deployment Gates

| Gate | Required evidence | Blocking |
| --- | --- | --- |
| Canonical Melega Factory | code+ABI+address | **Yes** |
| Canonical Melega Router | code+ABI+address | **Yes** |
| Pair canonicality | getPair | **Yes** |
| Quote policy versioned | factory immutables | **Yes** |
| Quote floors ratified | base-unit table | **Yes** (LB-G08) |
| Treasury fee sink | deployed+verified | **Yes** (LB-G04) |
| Execution authorizer | autonomous non-exportable | **Yes** |
| Permissionless relay interface | tests | **Yes** |
| Finality depth ops evidence | metrics | Before activation (LB-G10) |
| Stable gas path | verified | Before USDT/USDC (LB-G09) |
| Contract verification | source match | **Yes** |
| No admin EOA fee/recipient | role scan | **Yes** |
| Low-value mainnet cycle | receipt+LP+Treasury | Definition of Done |

No zero-address / placeholder / EOA fee fallback.

---

## 30. Blocker Disposition

| ID | Architecture effect | Status after LB004 | Next mission | Verification |
| --- | --- | --- | --- | --- |
| LB-G02 | Dedicated Program `execute` ingress defined | **OPEN** (design only) | LB005–LB006 execution | Live execute path |
| LB-G03 | Exclusive broadcaster removed; liveness remains | **OPEN** — security→**liveness** reclass pending relay | Relayer/runtime | Permissionless execute observed |
| LB-G04 | Sink interface frozen | **OPEN BLOCKER** | Treasury sink deploy | Settlement in atomic tx |
| LB-G07 | Core ignores stale router | **OPEN** (frontend package) | Package cleanup | Import audit |
| LB-G08 | Policy slots exist; values missing | **OPEN** activation | Economic ratification | Floors in factory |
| LB-G09 | WBNB separable; stables gated | **OPEN** | Pin conversion path | eth_call path |
| LB-G10 | finalityDepth=15 initial | **OPEN** | Infra metrics | Reorg study |

---

## 31. Recommended Implementation Sequence

1. **LB005** — Factory, clone deploy, custody, deposit delta, lifecycle, owner cmds, configNonce, stop/withdraw (**no** swap/Treasury/addLiquidity yet)  
2. **LB006** — ExecutionIntent, authorizer wiring, replay, economic validation library  
3. **LB007** — Atomic swap + fee sink + addLiquidity + residuals + rolling cap  
4. **LB008** — Integration tests, mainnet dry gates, low-value cycle  

---

## Deposit enforcement (detail)

```
balBefore = balanceOf(program)
SafeERC20.transferFrom(owner, program, amount)
received = balanceOf(program) - balBefore
require(received == amount) else UnsupportedTokenBehavior
```

Also: zero revert; insufficient allowance; false-return; no-return via SafeERC20; no deposit when Stopped; addBudget allowed Active/Paused/SafetyPaused.

---

## Allowance policy

- No unlimited approvals  
- Approve Router exact amounts per step  
- `forceApprove` zero-before-set when needed  
- Reset to 0 after success; revert clears via atomicity  
- No approve to relayer/signer; Treasury only exact fee  

---

## Gas-economics boundary

| Layer | Responsibility |
| --- | --- |
| Runtime | Estimate gas share ≤ 10% net liquidity quote; WBNB direct; stables need LB-G09 |
| On-chain | `tx.gasprice ≤ intent.maximumGasPrice` only |
| Not claimed | Perfect pre-knowledge of final gas used |

---

## Document control

| Item | Value |
| --- | --- |
| Next mission | LB005 — Core Contracts: Factory, Program Custody & Owner Lifecycle |
| Production code changed | **None** |
