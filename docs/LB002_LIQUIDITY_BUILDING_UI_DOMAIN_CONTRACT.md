# LB002 — Liquidity Building UI Contract & Domain Model

**Status:** FROZEN (V1 product contract)  
**Mission:** LB002 — documentation only  
**Depends on:** `docs/LB001_LIQUIDITY_BUILDING_REPOSITORY_AUDIT.md`  
**Branch baseline:** `main` @ `8489eeacd7c4bfa05d00a7fe1046733093236407`  
**Scope:** UI contract, domain model, glossary, state machines, metrics, copy — **no application code**

---

## 0. Purpose and non-goals

This document is the single frozen specification for Liquidity Building V1. Subsequent smart-contract, runtime, and frontend missions must conform to it.

**Does:** close product-domain gap **LB-G01** (no Liquidity Building domain).  
**Does not:** resolve **LB-G02**, **LB-G03**, **LB-G04**, **LB-G07** (carried forward as Known External Blockers).

**Forbidden foundations:** Pancake stale router at `packages/smart-router/evm/constants/exchange.ts:10` must not be used as Liquidity Building design basis. Melega Router/Factory from LB001 are canonical.

---

## 1. Frozen product positioning

| Field | Value |
| --- | --- |
| Name | **Liquidity Building** |
| Public definition | Transform your project’s token reserve into real liquidity, automatically and progressively. |
| Short description | Use your available token supply to build liquidity from real market demand. |
| Destination | Melega DEX → Liquidity Studio → Liquidity Building |
| Placement | New `LsPanel` in `AreaRight` after AI Advisor — `LiquidityStudioScreen.tsx:200-207` |

**Not:** buyback, price support, growth guarantee, market making, price manipulation, separate platform, new dashboard, multi-DEX (V1).

---

## 2. Non-negotiable decisions (already approved)

### 2.1 Configuration fields (owner-editable)

1. Token  
2. Token Budget  
3. Strategy  
4. Epoch Duration  

DEX, pair, quote asset, pool liquidity, LP ownership, fee, and protections are **detected or protocol-determined** (read-only in setup).

### 2.2 Strategy

| Mode | Role |
| --- | --- |
| **Full AI — Recommended** | Default. Engine decides whether to execute and how much within protocol safety limits. |
| **Dynamic Range** | Owner sets only `minimumRate` and `maximumRate`. Engine picks effective rate inside range. |

`protocolStrategyCeiling` is **not** invented here; closed in LB003+.

Validation semantics:

```
minimumRate > 0
maximumRate >= minimumRate
maximumRate <= protocolStrategyCeiling   // ceiling TBD later
```

### 2.3 Epoch duration

| Label | Canonical seconds | Default |
| --- | --- | --- |
| 5 minutes | `300` | **Yes** |
| 15 minutes | `900` | |
| 30 minutes | `1800` | |
| 1 hour | `3600` | |

### 2.4 Fee

**5% success fee on quote assets acquired through Liquidity Building.**

```
melegaFee = grossQuoteAcquired × 1000 / 10_000
```

Rounding policy: **required to be closed in smart-contract mission** (not fixed here).

Fee **does not** apply to: deposit, unused budget, epochs with no successful quote acquisition.  
Fee is **not** taken in project token. Separate from gas, swap fee, slippage.  
Settles only after real quote acquisition via canonical Treasury Runtime / D99 path (integration still blocked by LB-G04).

### 2.5 LP ownership

Default: **Owner-controlled liquidity**, **Unlocked**.  
Initial LP recipient: authenticated project owner.  
Lock: optional, post-activation.

### 2.6 Program end

Continues until: budget depleted | owner stop | owner pause | safety pause | blocking error.  
No mandatory liquidity target or end date in V1.

---

## 3. Existing repository evidence (reuse justification)

| Finding | File | Lines | Existing behavior | LB002 decision |
| --- | --- | --- | --- | --- |
| Card insertion point | `apps/web/src/views/LiquidityStudio/LiquidityStudioScreen.tsx` | 200-207 | `AreaRight` stacks Market + Advisor `LsPanel`s | Insert LB card as third sibling after Advisor |
| Panel primitive | `.../liquidityStudioPrimitives.tsx` | 9-34, 36-44 | `LsPanel`, `LsPanelTitle` | Reuse for LB card shell |
| Badge pattern | `liquidityStudioPrimitives.tsx` | 55-70 | `LsPreviewBadge` | Reuse for status / AI Powered badges |
| Primary CTA | `liquidityStudioPrimitives.tsx` | 72-76 | `LsPrimaryBtn` | Primary actions |
| Connect wallet CTA | `LiquidityBuilderPanel.tsx` | 364, 430 | `ConnectWalletButton` when disconnected | Same pattern for LB when wallet required |
| Phase / error model | `useLiquidityMintRuntime.tsx` | 57-101, 273-304 | Runtime phase + error object | Separate `TransactionPhase` from program state |
| Activity rows | `LiquidityActivityTable.tsx` | ~223 | Status cell | Inform LB Activity model |
| LP submit deferral | `lib/liquidity-runtime/lpSubmitDeferral.ts` | 16-21 | Direct wallet router; ingress unsupported | Document as LB-G02; do not pretend ingress owns LB |
| Implicit pair create | LB001 + `AddLiquidity/index.tsx` | 241-276 | First `addLiquidity*` creates pair | No-pool CTA = seed add-liquidity path, not fake `createPair` |
| LP recipient today | `AddLiquidity/index.tsx` | 259, 273 | Recipient = connected `account` | LB default recipient = owner; must be program-bound later |
| Stale Pancake router | `packages/smart-router/evm/constants/exchange.ts` | 10 | BSC = Pancake `0x10ED43…` | LB-G07; never design LB against it |
| Chain page gate | `pages/liquidity-studio.tsx` | 6 | `SUPPORT_MULTI_CHAINS` | Wrong-chain UX: Switch Network |
| AI Advisor panel | `AILiquidityAdvisorPanel.tsx` | 58-93 | Right-rail `LsPanel` | Visual sibling for LB card |

---

## 4. Known External Blockers (carried forward)

| ID | Current status | Effect on UI/domain contract | Required later mission |
| --- | --- | --- | --- |
| LB-G02 | Open — LP deferred from execution-ingress | UI must not claim ingress-executed LP; activation path remains program-defined | Runtime/contract architecture |
| LB-G03 | Open — KERL non-broadcast; no LB executor | “AI Powered” is capability copy, **not** proof an executor is live; hide execution CTAs until cutover | Bounded executor mission |
| LB-G04 | Open — Treasury fee/quote not machine-integrated | Fee shown as protocol fact; settlement status may be `unavailable` | Treasury binding mission |
| LB-G07 | Open — stale Pancake router in smart-router package | LB domain forbids that address as Melega destination | Package alignment / import audit |

Documenting LB002 **does not** resolve these blockers.

---

## 5. Canonical glossary

| Term | Definition | Unit | Source of truth | UI use | Machine use | Forbidden / misleading |
| --- | --- | --- | --- | --- | --- | --- |
| Project Token | ERC-20 the owner dedicates to LB | address + symbol | Token metadata + program | Setup Token | `projectToken` | “coin to pump” |
| Quote Asset | Counter-asset of the Melega pair (USDT/WBNB/USDC if supported) | address | Detected pair | Read-only | `quoteAsset` | Arbitrary “stable” without detection |
| Pair | Melega constant-product pool for project+quote | address | Factory/CREATE2 + reserves | Read-only | `pair` | Pancake pair |
| Token Budget | Amount of project token dedicated to the program | base units | Deposits | Setup | `TokenBudget` | “investment return” |
| Initial Token Budget | First confirmed deposit | base units | On-chain deposit event | Metrics | `initialDepositedBudget` | Simulated deposit |
| Added Budget | Sum of later confirmed deposits | base units | On-chain | Metrics | `addedBudget` | — |
| Total Deposited Budget | initial + added | base units | Derived | Metrics | `totalDepositedBudget` | — |
| Remaining Token Budget | Still available, excluding pending reservation | base units | Program accounting | Active card | `remainingBudget` | Wallet balance alone |
| Tokens Sold | Project tokens consumed by successful swap | base units | Swap receipt/event | Activity | `tokensSold` | Intended sale |
| Tokens Matched into LP | Project tokens used in successful add-liquidity | base units | Add-liq receipt | Metrics | `tokensMatchedIntoLP` | Planned match |
| Observed Buy Flow | Raw buy volume in observation window | quote or token as defined by engine | Observation evidence | Advanced/activity | `observedBuys` | Eligible flow |
| Observed Sell Flow | Raw sell volume | same | Observation | Advanced | `observedSells` | — |
| Excluded Flow | Volume excluded (incl. internal LB ops) | same | Classification | Hidden or advanced | `excludedBuys/Sells` | “all volume” |
| Eligible Buy/Sell Flow | After exclusion rules | same | Classification | Advanced | `eligibleBuys/Sells` | Observed = eligible |
| Eligible Net Buy Flow | eligibleBuys − eligibleSells (engine definition) | same | Classification | Decision evidence | `eligibleNetBuyFlow` | Guaranteed demand |
| Epoch | Fixed observation/decision window | seconds + id | Config + clock/blocks | Active | `EpochState` | “guaranteed trade each epoch” |
| Strategy Rate | Effective rate chosen for epoch | dimensionless / bps as defined later | Decision | Manage/active | `effectiveStrategyRate` | Owner-forced each epoch in Full AI |
| Execution Decision | Engine output for an epoch | enum | Decision record | Activity | `ExecutionDecision` | Unsigned “AI tip” |
| Execution Tranche | One bounded on-chain attempt within a decision | id | Execution | Activity | tranche id | — |
| Gross Quote Acquired | Quote received from successful swap | quote base units | Event/balance delta | Metrics | `grossQuoteAcquired` | Expected quote |
| Melega Success Fee | Fee on gross quote | quote base units | Fee settlement | Metrics | `melegaFee` | Deposit fee |
| Net Quote Available | gross − fee | quote base units | Derived | Metrics | `netQuoteAvailable` | — |
| Net Quote Added | Quote actually used in add-liquidity | quote base units | Add-liq receipt | Metrics | `netQuoteAdded` | Available ≠ added |
| Quote Residual | Net available not added | quote base units | Accounting | Activity | `quoteResidual` | Lost funds implication without evidence |
| Net Liquidity Built | **Not a single simulated number**; always expose `tokensMatchedIntoLP` + `netQuoteAdded` | dual | Receipts | Active card | dual fields | Fake USD TVL |
| LP Received | LP tokens received by recipient | LP base units | Event/balance delta | Metrics | `lpReceived` | Expected LP |
| LP Recipient | Address that receives LP | address | Program config | Read-only | `lpRecipient` | Router address |
| LP Owner | Controlling owner of LP rights | address | Program / lock | Manage | `lpOwner` | Protocol treasury by default |
| LP Status | Unlocked / locked / permanent | enum | LPPosition | Active | `lpStatus` | — |
| Safety Pause | Protocol/runtime automatic pause | bool + reason | SafetyState | Banner | `SAFETY_PAUSED` | Same as owner pause |
| Unused Budget | Withdrawable remaining per rules | base units | Accounting | Manage | withdrawable | Entire wallet |
| Execution Receipt | Verified record of an execution | structured | On-chain + runtime | Activity | `ExecutionRecord` | Pending tx as receipt |

---

## 6. UI information architecture

**Route:** `/liquidity-studio` only — no new route.  
**Shell:** new `LsPanel` in `AreaRight` after `AILiquidityAdvisorPanel`.

### 6.1 Textual wireframes (content hierarchy)

**Common mobile behavior:** card stacks in right-rail flow; primary CTA full-width (`LsPrimaryBtn` pattern); secondary actions as outline/ghost; long metrics wrap; explorer links open externally.

#### 1) Inactive card
```
[Liquidity Building]     [AI Powered] [Not Active]
Use your available token supply to build liquidity from real market demand.
• Budget-based execution
• Dynamic AI strategy
• Automatic Melega DEX liquidity
• Owner-controlled LP
[Start Building Liquidity]
```
Primary: Start. Hidden: Pause/Manage/Activity until activated path.

#### 2) Token selected
Shows token metadata + compatibility verdict + detected pair summary. Primary: Continue. Secondary: Change token.

#### 3) Setup required
Four fields wizard (Token → Budget → Strategy → Epoch) + read-only auto panel. Primary: Review / Continue.

#### 4) No pool detected (`SETUP_REQUIRED` / `NO_MELEGA_POOL`)
```
No Melega DEX pool detected
Create a standard Melega DEX pool before activating Liquidity Building.
[Create Pool & Continue]
```
Read-only: recommended quote, seed guidance placeholders (no fake amounts), steps list.

#### 5) Awaiting approval
Primary: Approve Token. Show TransactionPhase. Secondary: Cancel setup (if allowed).

#### 6) Awaiting deposit
Primary: Deposit Budget (or Deposit Budget & Start when activation combined). Multi-tx progress honest.

#### 7) Ready
Program configured & funded; not yet ACTIVE. Primary: Activate / Start (if separate). Or already combined into deposit path.

#### 8) Active
See §12 Active card contract.

#### 9) Paused (owner)
Banner: Paused by owner. Primary: Resume. Manage available.

#### 10) Safety paused
Banner: Liquidity Building paused for safety + reason. Resume only when clearable.

#### 11) Budget depleted
Status BUDGET_DEPLETED. Primary: Add Budget or Stop/Withdraw per rules. No execution CTAs.

#### 12) Stopped
Terminal. View Activity. No Pause/Resume.

#### 13) Error
Status ERROR + reason. Primary: Retry if retryable; else Manage/Stop.

#### 14) Activity view
Timeline (§21). Filter: all / owner txs / executions / safety.

#### 15) Manage view
§13 Manage contract.

**Risk messages:** never “guaranteed liquidity growth”, “support the price”, “risk-free”.

**Wallet disconnected:** replace primary with Connect Wallet (Builder pattern).  
**Wrong chain:** Switch Network.  
**Runtime unavailable:** show copy; do not invent metrics; keep program state; TransactionPhase IDLE.

---

## 7. Inactive card contract (frozen)

**Order / emphasis:**

1. Title: Liquidity Building (display typography / `LsPanelTitle`)  
2. Badges: `AI Powered` (capability), `Not Active` (status)  
3. Body definition sentence  
4. Four capability bullets (not live metrics)  
5. Primary CTA: **Start Building Liquidity**

| Condition | Behavior |
| --- | --- |
| Wallet disconnected | CTA → Connect Wallet; setup blocked |
| Wrong chain | CTA → Switch Network |
| Runtime unavailable | CTA disabled or “Temporarily unavailable”; no fake Active |

**AI Powered** ≠ live executor proof (LB-G03).

---

## 8. Setup flow (four fields)

### Step 1 — Token
Copy: **Select or paste token address**

Auto-detected: address, name, symbol, decimals, total supply, wallet balance, detected pair, detected quote asset, current pool liquidity, **token compatibility verdict**.

### Step 2 — Token Budget
Copy: **How many tokens do you want to dedicate?**  
Support: **Only the deposited budget can be used. Unused tokens remain withdrawable.**

Validation: amount > 0; ≤ wallet balance; raw base units; decimals respected; Max fills balance; insufficient balance blocks; allowance required before deposit; **fee-on-transfer → reject** (`FEE_ON_TRANSFER_DETECTED`).

### Step 3 — Strategy
- Full AI — Recommended (default)  
- Dynamic Range (min/max rates; ceiling TBD)

Copies per §2.2.

### Step 4 — Epoch Duration
Options: 5m (default), 15m, 30m, 1h → `300|900|1800|3600`.

---

## 9. Automatic read-only information

| Field | Available | Loading | Pair missing | RPC down | Unverifiable | Unsupported token |
| --- | --- | --- | --- | --- | --- | --- |
| Liquidity destination | Melega DEX (canonical) | skeleton | still Melega | still Melega | “Unverified” | hide activation |
| Detected pair | address/link | skeleton | “No pool detected” | “Unavailable” | “Unverified” | n/a |
| Quote asset | symbol/address | skeleton | recommendation only | Unavailable | Unverified | n/a |
| Current pool liquidity | reserves-derived | skeleton | “—” | Unavailable | Unverified | n/a |
| Strategy protection | protocol limits label | — | — | — | “Limits pending ratification” if ceiling unset | — |
| LP ownership | Owner-controlled | — | — | — | — | — |
| LP recipient | owner address | — | — | — | — | — |
| Melega success fee | 5% of acquired quote | — | — | — | — | — |
| Program end | budget/stop/pause/safety/error | — | — | — | — | — |

**No simulated numbers.**

---

## 10. Review contract

Show before activation: project token, budget, strategy (+ range), epoch, destination, pair, quote, pool liquidity, LP recipient, LP status (Unlocked), fee, end condition, **required transaction sequence**.

CTA: **Deposit Budget & Start**

Honest multi-tx: Approve (if needed) → Deposit → Activate (may merge deposit+activate on-chain later; UI must not fake atomicity if separate).

---

## 11. No-pool flow

Program state: `SETUP_REQUIRED`  
Reason: `NO_MELEGA_POOL`

Copy:

- **No Melega DEX pool detected**  
- Create a standard Melega DEX pool before activating Liquidity Building.

CTA: **Create Pool & Continue**

Meaning (aligned with LB001 implicit create):

```
quote recommendation → seed calculation → approval → initial addLiquidity
→ pair confirmation → return to Liquidity Building setup
```

**Do not** promise a standalone `createPair` transaction.

Read-only (values produced later by live math — **no amounts frozen here**):

- recommended quote asset (USDT | WBNB | USDC if fully supported)  
- minimum viable seed (TBD)  
- recommended seed (TBD)  
- initial LP recipient (owner)  
- expected steps list  

---

## 12. Program state machine

### 12.1 ProgramStatus (exact)

`NOT_ACTIVE` | `SETUP_REQUIRED` | `AWAITING_APPROVAL` | `AWAITING_DEPOSIT` | `READY` | `ACTIVE` | `PAUSED` | `SAFETY_PAUSED` | `BUDGET_DEPLETED` | `STOPPED` | `ERROR`

### 12.2 TransactionPhase (separate)

`IDLE` | `SIGNATURE_REQUIRED` | `SUBMITTED` | `PENDING` | `CONFIRMING` | `SUCCEEDED` | `FAILED` | `REPLACED` | `CANCELLED`

TransactionPhase **must not** be stored as ProgramStatus.

### 12.3 Per-state contract

#### NOT_ACTIVE
| Aspect | Contract |
| --- | --- |
| Technical meaning | No program instance bound to this owner/token context |
| User label | Not Active |
| Reason codes | none required; may show WALLET_NOT_CONNECTED / WRONG_CHAIN / RUNTIME_UNAVAILABLE as UI gates |
| Entries | Default landing; after STOPPED when starting a new program (new programId) |
| Exits | start setup → SETUP_REQUIRED |
| Primary CTA | Start Building Liquidity |
| Secondary | none required |
| Required data | product copy only |
| Optional data | none |
| Refresh | stay NOT_ACTIVE unless read model shows an existing program |
| Other wallet | same inactive marketing card |
| Wrong chain | Switch Network before setup |

#### SETUP_REQUIRED
| Aspect | Contract |
| --- | --- |
| Technical meaning | Owner is configuring; activation preconditions incomplete |
| User label | Setup required |
| Reason codes | NO_MELEGA_POOL, TOKEN_NOT_SUPPORTED, UNSUPPORTED_QUOTE_ASSET, INSUFFICIENT_SEED, TOKEN_VALIDATION_INCONCLUSIVE, … |
| Entries | from NOT_ACTIVE; return from Create Pool path |
| Exits | approval path → AWAITING_APPROVAL; if allowance ok → AWAITING_DEPOSIT; reject → stay SETUP_REQUIRED or ERROR |
| Primary CTA | Continue / Create Pool & Continue / Review |
| Secondary | Change token |
| Required data | token (or empty), compatibility verdict, pair detection result |
| Optional data | partial strategy/epoch drafts |
| Refresh | restore draft if persisted; never invent ACTIVE |
| Other wallet | read-only or restart setup |
| Wrong chain | Switch Network |

#### AWAITING_APPROVAL
| Aspect | Contract |
| --- | --- |
| Technical meaning | ERC-20 allowance insufficient for deposit/execution custody path |
| User label | Approve required |
| Reason codes | TRANSACTION_REVERTED, RECEIPT_NOT_CONFIRMED on failure |
| Entries | from SETUP_REQUIRED when allowance required |
| Exits | approval confirmed → AWAITING_DEPOSIT (or READY if deposit already done) |
| Primary CTA | Approve Token |
| Secondary | Cancel (returns SETUP_REQUIRED if rules allow) |
| Required data | token, spender target (protocol), required amount or max policy |
| Optional data | TransactionPhase |
| Refresh | re-check allowance; if already approved advance |
| Other wallet | Approve disabled |
| Wrong chain | Switch Network |

#### AWAITING_DEPOSIT
| Aspect | Contract |
| --- | --- |
| Technical meaning | Program configured; budget not yet deposited (or insufficient for start) |
| User label | Deposit required |
| Reason codes | TRANSACTION_REVERTED, RECEIPT_NOT_CONFIRMED |
| Entries | after approval or when allowance already ok |
| Exits | deposit confirmed → READY or ACTIVE (if Deposit Budget & Start combines activation) |
| Primary CTA | Deposit Budget or Deposit Budget & Start |
| Secondary | View transaction sequence |
| Required data | budget amount, owner, token |
| Optional data | multi-step progress |
| Refresh | confirm deposit receipts before advancing |
| Other wallet | Deposit disabled |
| Wrong chain | Switch Network |

#### READY
| Aspect | Contract |
| --- | --- |
| Technical meaning | Funded and configured; not yet ACTIVE (when activation is a separate command) |
| User label | Ready |
| Reason codes | RUNTIME_UNAVAILABLE may block activation |
| Entries | after deposit without auto-activate |
| Exits | ACTIVATE → ACTIVE |
| Primary CTA | Start / Activate |
| Secondary | Withdraw unused (if allowed before activate), Manage draft |
| Required data | full review fields |
| Optional data | — |
| Refresh | stay READY until activate receipt |
| Other wallet | Activate disabled |
| Wrong chain | Switch Network |

#### ACTIVE
| Aspect | Contract |
| --- | --- |
| Technical meaning | Program eligible for epoch observation/decision/execution |
| User label | Active |
| Reason codes | execution skip reasons do **not** exit ACTIVE |
| Entries | activate; resume from PAUSED; safety cleared |
| Exits | pause → PAUSED; safety → SAFETY_PAUSED; budget 0 → BUDGET_DEPLETED; stop → STOPPED; blocking → ERROR |
| Primary CTA | View Activity (or Pause as primary action group) |
| Secondary | Pause, Manage |
| Required data | dual liquidity built, remaining budget, strategy, epoch, LP status, last execution, next eligible epoch |
| Optional data | observed flow advanced |
| Refresh | rehydrate metrics from read model; mark stale |
| Other wallet | owner actions hidden; metrics may still display if public later |
| Wrong chain | mutating CTAs blocked |

#### PAUSED
| Aspect | Contract |
| --- | --- |
| Technical meaning | Owner-requested halt of new executions |
| User label | Paused |
| Reason codes | PROGRAM_PAUSED for execution attempts |
| Entries | owner PAUSE from ACTIVE |
| Exits | RESUME → ACTIVE; safety → SAFETY_PAUSED; stop → STOPPED |
| Primary CTA | Resume |
| Secondary | Manage, View Activity, Withdraw unused (rules) |
| Required data | pausedAt, owner |
| Optional data | owner note |
| Refresh | remain PAUSED until resume receipt |
| Other wallet | Resume disabled |
| Wrong chain | Switch Network |

#### SAFETY_PAUSED
| Aspect | Contract |
| --- | --- |
| Technical meaning | Protocol/runtime halted executions for safety |
| User label | Paused for safety |
| Reason codes | **mandatory** SAFETY_PAUSED + underlying detection code |
| Entries | automatic from ACTIVE/PAUSED |
| Exits | only after clearable=true and verified clear → ACTIVE or prior owner PAUSED |
| Primary CTA | View reason / Retry when clearable |
| Secondary | View Activity; Stop (if allowed) |
| Required data | SafetyState full |
| Optional data | evidence links |
| Refresh | re-check clearable; never owner Resume while uncleared |
| Other wallet | no clear authority |
| Wrong chain | Switch Network |

#### BUDGET_DEPLETED
| Aspect | Contract |
| --- | --- |
| Technical meaning | remaining + reserved = 0 with no further executable budget |
| User label | Budget depleted |
| Reason codes | none required |
| Entries | from ACTIVE when budget exhausted |
| Exits | ADD_BUDGET → ACTIVE (or READY/ACTIVE per rules); STOP → STOPPED |
| Primary CTA | Add Budget |
| Secondary | Manage, View Activity, Withdraw unused (if residual rules), Stop |
| Required data | cumulative metrics, zero remaining |
| Optional data | — |
| Refresh | confirm remaining=0 from SoT |
| Other wallet | Add Budget disabled |
| Wrong chain | Switch Network |

#### STOPPED
| Aspect | Contract |
| --- | --- |
| Technical meaning | Terminal program lifecycle |
| User label | Stopped |
| Reason codes | optional stop reason |
| Entries | STOP command |
| Exits | none (new program = new programId → NOT_ACTIVE/SETUP) |
| Primary CTA | View Activity |
| Secondary | Withdraw unused if still allowed by rules |
| Required data | stoppedAt, final metrics |
| Optional data | — |
| Refresh | remain STOPPED |
| Other wallet | read-only |
| Wrong chain | read-only |

#### ERROR
| Aspect | Contract |
| --- | --- |
| Technical meaning | Blocking failure requiring owner/runtime attention |
| User label | Error |
| Reason codes | **mandatory** |
| Entries | blocking setup/exec/settlement failures |
| Exits | Retry → prior recoverable state; Stop → STOPPED |
| Primary CTA | Retry (if retryable) |
| Secondary | View Transaction, Manage, Stop |
| Required data | reasonCode, last failed tx if any |
| Optional data | support evidence |
| Refresh | re-evaluate retryability from SoT |
| Other wallet | Retry disabled |
| Wrong chain | Switch Network |

**Skipped epoch:** decision SKIP/WAIT with execution skip reason → program remains **ACTIVE**.  
**TransactionPhase** may be PENDING during txs without changing ProgramStatus until confirmed transition.

---

## 13. State transition table

| Current | Trigger | Preconditions | Tx required | Next | Failure | User copy |
| --- | --- | --- | --- | --- | --- | --- |
| NOT_ACTIVE | start setup | — | no | SETUP_REQUIRED | — | Start building |
| SETUP_REQUIRED | token unsupported | verdict reject | no | SETUP_REQUIRED / ERROR | — | Token not supported |
| SETUP_REQUIRED | pool missing | no pair | no | SETUP_REQUIRED + NO_MELEGA_POOL | — | No Melega DEX pool detected |
| SETUP_REQUIRED | pool created | pair confirmed | addLiquidity path | SETUP_REQUIRED (continue) | ERROR | Pool ready — continue setup |
| SETUP_REQUIRED | approval requested | allowance needed | approve | AWAITING_APPROVAL | ERROR | Approve token |
| AWAITING_APPROVAL | approval confirmed | receipt | approve | AWAITING_DEPOSIT or READY | ERROR | Approved |
| AWAITING_DEPOSIT | budget deposited | receipt | deposit | READY or ACTIVE | ERROR | Budget deposited |
| READY | program activated | funded | activate | ACTIVE | ERROR | Liquidity Building is active |
| ACTIVE | epoch skipped | decision SKIP/WAIT | no | ACTIVE | — | Epoch skipped — no eligible flow |
| ACTIVE | execution completed | receipt | exec | ACTIVE | ERROR | Execution completed |
| ACTIVE | owner pause | owner | pause | PAUSED | ERROR | Paused by owner |
| PAUSED | owner resume | owner | resume | ACTIVE | ERROR | Resumed |
| ACTIVE/PAUSED | safety pause | protocol | maybe | SAFETY_PAUSED | — | Paused for safety |
| SAFETY_PAUSED | safety cleared | verified | resume/clear | ACTIVE or PAUSED | ERROR | Safety cleared |
| ACTIVE/PAUSED | add budget | owner | deposit | same | ERROR | Budget added |
| ACTIVE/PAUSED | update strategy | owner; future epochs | update | same | ERROR | Strategy updated for future epochs |
| ACTIVE/PAUSED | update epoch | owner; future | update | same | ERROR | Epoch updated for future periods |
| ACTIVE | budget depleted | remaining=0 | no | BUDGET_DEPLETED | — | Budget depleted |
| * | withdraw unused | rules allow | withdraw | same/STOPPED | ERROR | Unused budget withdrawn |
| * | stop program | owner | stop | STOPPED | ERROR | Program stopped |
| * | execution error | failed receipt | — | ERROR or ACTIVE+reason | ERROR | Execution failed |
| * | runtime unavailable | LB-G03/G02 | no | keep state | — | Runtime temporarily unavailable |
| SETUP | Treasury auth unavailable | LB-G04 | no | SETUP/ERROR | — | Treasury settlement unavailable |

---

## 14. Reason-code contract

| Code | Category | User copy | Retryable | Severity | Owner action | Auto recovery |
| --- | --- | --- | --- | --- | --- | --- |
| NO_MELEGA_POOL | Setup | No Melega DEX pool detected | yes | HIGH | Create Pool & Continue | after pair confirm |
| UNSUPPORTED_QUOTE_ASSET | Setup | Quote asset not supported | yes | HIGH | Change token/pair context | no |
| INSUFFICIENT_SEED | Setup | Seed too small to create pool | yes | MEDIUM | Adjust seed | no |
| TOKEN_NOT_SUPPORTED | Setup | Token not supported | no | HIGH | Choose another token | no |
| WRONG_CHAIN | Setup | Switch to BNB Smart Chain | yes | HIGH | Switch Network | on correct chain |
| WALLET_NOT_CONNECTED | Setup | Connect wallet | yes | HIGH | Connect | on connect |
| FEE_ON_TRANSFER_DETECTED | Token | Fee-on-transfer tokens are not supported | no | HIGH | — | no |
| REBASING_TOKEN | Token | Rebasing tokens are not supported | no | HIGH | — | no |
| NON_STANDARD_TRANSFER | Token | Non-standard transfers are not supported | no | HIGH | — | no |
| TRADING_DISABLED | Token | Trading appears disabled | yes | HIGH | — | if trading enables |
| TRANSFER_RESTRICTED | Token | Transfers appear restricted | no | HIGH | — | no |
| BLACKLIST_BEHAVIOR | Token | Blacklist behavior detected | no | HIGH | — | no |
| MAX_TRANSACTION_RESTRICTION | Token | Max transaction restriction detected | no | HIGH | — | no |
| MAX_WALLET_RESTRICTION | Token | Max wallet restriction detected | no | HIGH | — | no |
| TOKEN_VALIDATION_INCONCLUSIVE | Token | Token validation inconclusive | yes | MEDIUM | Retry validation | no override |
| NO_ELIGIBLE_NET_BUY_FLOW | Execution | Epoch skipped — no eligible net buy flow | auto next epoch | LOW | — | next epoch |
| BELOW_MINIMUM_EXECUTION | Execution | Epoch skipped — below minimum execution | auto | LOW | — | next epoch |
| PRICE_IMPACT_LIMIT | Execution | Skipped — price impact limit | auto | MEDIUM | — | next epoch |
| SLIPPAGE_LIMIT | Execution | Failed/skipped — slippage limit | yes | MEDIUM | Retry / wait | possible |
| INSUFFICIENT_POOL_RESERVES | Execution | Insufficient pool reserves | yes | HIGH | — | when reserves recover |
| BUDGET_EPOCH_LIMIT | Execution | Epoch budget limit reached | auto | LOW | — | next epoch |
| BUDGET_DAILY_LIMIT | Execution | Daily budget limit reached | later | MEDIUM | — | next day |
| GAS_NOT_ECONOMIC | Execution | Skipped — gas not economic | auto | LOW | — | next epoch |
| EPOCH_ALREADY_EXECUTED | Execution | Epoch already executed | no | MEDIUM | — | — |
| PROGRAM_PAUSED | Execution | Program paused | after resume | MEDIUM | Resume | no |
| SAFETY_PAUSED | Execution | Paused for safety | after clear | HIGH | Wait / review | when clearable |
| RUNTIME_UNAVAILABLE | Execution | Runtime temporarily unavailable | yes | HIGH | Retry later | when runtime up |
| TREASURY_AUTHORIZATION_UNAVAILABLE | Execution | Treasury authorization unavailable | yes | HIGH | Retry later | LB-G04 |
| TREASURY_SETTLEMENT_FAILED | Execution | Treasury settlement failed | yes | HIGH | Retry settlement path | ops |
| TRANSACTION_REVERTED | Execution | Transaction reverted | yes | HIGH | Retry | no |
| RECEIPT_NOT_CONFIRMED | Execution | Receipt not confirmed | yes | MEDIUM | Wait / check explorer | confirm |

---

## 15. Action availability matrix

| Action | Visible states | Preconditions | Owner-only | Tx | Result | Hidden when |
| --- | --- | --- | --- | --- | --- | --- |
| Start Building Liquidity | NOT_ACTIVE | — | no | no | SETUP_REQUIRED | ACTIVE+ |
| Connect Wallet | any mutating need | disconnected | no | no | connected | connected |
| Switch Network | wrong chain | wrong chain | no | no | correct chain | correct chain |
| Create Pool & Continue | SETUP_REQUIRED+NO_MELEGA_POOL | token ok | yes | addLiquidity path | pair exists | pair exists |
| Approve Token | AWAITING_APPROVAL | allowance low | yes | approve | allowance | approved |
| Deposit Budget | AWAITING_DEPOSIT / Manage | funded path | yes | deposit | budget↑ | stopped |
| Deposit Budget & Start | review / AWAITING_DEPOSIT | ready sequence | yes | multi | ACTIVE/READY | already active |
| View Activity | ACTIVE+ (and STOPPED) | program exists | no* | no | activity | NOT_ACTIVE |
| Pause | ACTIVE | owner | yes | pause | PAUSED | not ACTIVE |
| Resume | PAUSED | owner; not safety | yes | resume | ACTIVE | SAFETY_PAUSED uncleared |
| Manage | ACTIVE/PAUSED/BUDGET_DEPLETED | owner | yes | no | manage sheet | NOT_ACTIVE |
| Add Budget | ACTIVE/PAUSED/BUDGET_DEPLETED | owner | yes | deposit | budget↑ | STOPPED |
| Change Strategy | ACTIVE/PAUSED | owner | yes | update | future epochs | STOPPED |
| Change Epoch | ACTIVE/PAUSED | owner | yes | update | future | STOPPED |
| Withdraw Unused Budget | PAUSED/BUDGET_DEPLETED/STOPPED rules | withdrawable>0 | yes | withdraw | unused↓ | none withdrawable |
| Stop Program | ACTIVE/PAUSED/SAFETY*/ERROR | owner | yes | stop | STOPPED | already STOPPED |
| Manage LP | ACTIVE+ with LP | LP>0 | yes | maybe | LP sheet | no LP |
| Keep Unlocked | Manage LP | unlocked | yes | no | stay unlocked | locked |
| Lock Liquidity | Manage LP | unlocked; lock available | yes | lock | locked | lock not shipped |
| Retry | ERROR / failed phase | retryable reason | yes | varies | prior state | non-retryable |
| View Transaction | activity entries | txHash | no | no | explorer | no hash |

\*Non-owner may view limited public read model if exposed later; V1 assume owner session.

No decorative CTAs. Hide unimplemented actions until cutover (e.g. Lock Liquidity if locker not ready).

---

## 16. Active card contract (frozen)

```
Liquidity Building                    [ACTIVE]
Liquidity built     → tokensMatchedIntoLP + netQuoteAdded (dual; no fake aggregate)
Budget remaining
Current pool liquidity
Strategy
Epoch
LP status
Last execution
Next eligible epoch
[View Activity] [Pause] [Manage]
```

| Metric priority | Unit | Notes |
| --- | --- | --- |
| 1 Liquidity built | dual base units | Never simulated USD |
| 2 Budget remaining | project token base | Exclude reserved pending |
| 3 Current pool liquidity | reserves | Stale badge if freshness exceeded |
| 4 Strategy / Epoch | labels | |
| 5 LP status | enum | |
| 6 Last execution | time + link | Empty: “No executions yet” |
| 7 Next eligible epoch | timestamp | **Not a guarantee of a trade** |

Skipped epoch copy: **Epoch skipped — no eligible net buy flow** (or specific reason).  
Runtime unavailable: show banner; keep ACTIVE; no fake Last execution update.

---

## 17. Manage contract

| Action | Allowed states | Economic effect | Tx | Confirm | Risk | Next | Evidence |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Add Budget | ACTIVE/PAUSED/BUDGET_DEPLETED | ↑ deposited | deposit | yes | irreversible dedicate | same | deposit event |
| Change Strategy | ACTIVE/PAUSED | future only | update | yes | changes future decisions | same | config event |
| Change Epoch | ACTIVE/PAUSED | future only | update | yes | cadence change | same | config event |
| Resume | PAUSED | enables exec | resume | no/light | — | ACTIVE | resume event |
| Withdraw Unused | per rules | ↓ remaining | withdraw | yes | — | same/STOPPED | withdraw event |
| Stop | ACTIVE/PAUSED/… | terminal | stop | yes strong | ends program | STOPPED | stop event |
| Manage LP | when LP>0 | custody | maybe | — | — | — | LP events |
| Lock LP | unlocked | lock | lock | yes | may be irreversible | locked | lock tx |

Strategy/Epoch changes **must not** rewrite historical receipts or metrics.

---

## 18. Safety pause vs owner pause

| | PAUSED | SAFETY_PAUSED |
| --- | --- | --- |
| Who | Owner | Protocol/runtime |
| New executions | No | No |
| Unused budget | Per protocol rules | Per protocol rules |
| Reason code | optional owner note | **mandatory** |
| Resume | Owner anytime (if not also safety) | Only after condition cleared & verified |
| Copy | Paused by owner | **Liquidity Building paused for safety** |

Skipped epoch ≠ safety pause.

---

## 19. Domain model

### LiquidityBuildingProgram
`programId`, `chainId` (56 V1), `owner`, `projectToken`, `quoteAsset`, `pair`, `strategy`, `epochDurationSeconds`, `programStatus`, `createdAt`, `activatedAt`, `pausedAt`, `stoppedAt`, `currentEpoch`, `lpRecipient`, `safetyState`

### TokenBudget
`initialDepositedBudget`, `addedBudget`, `totalDepositedBudget`, `remainingBudget`, `reservedForPendingExecution`, `tokensSold`, `tokensMatchedIntoLP`, `withdrawnUnusedBudget`

**Invariant:**

```
remaining + reserved + tokensSold + tokensMatched + withdrawnUnused
  = totalDeposited
```

(± explicitly accounted rounding residuals)

### StrategyConfig
- `FULL_AI`  
- `DYNAMIC_RANGE` `{ minimumRate, maximumRate }`

### EpochState
`epochId`, `start`, `end`, `observationFinalized`, `decisionStatus`, `executionStatus`, `executionId`, `skipReason`, `executionCount`

### FlowObservation
observed/excluded/eligible buys & sells, `eligibleNetBuyFlow`, block range, evidence source

### ExecutionDecision
`decisionId`, `epochId`, `decisionType` ∈ {`EXECUTE`,`EXECUTE_IN_TRANCHES`,`WAIT`,`SKIP`,`SAFETY_PAUSE`}, `effectiveStrategyRate`, intended sale/acquisition, max price impact, slippage, deadline, reason, `strategyEngineVersion`, `onChainValidationStatus`

### ExecutionRecord
ids, txHash, block, tokensSold, grossQuote, feePaid, netQuoteAvailable, tokensMatched, netQuoteAdded, residuals, lpReceived, lpRecipient, statuses

### FeeSettlement
basis, `500` bps, amount, quoteAsset, destination, auth/ticket/Treasury receipt refs, txHash, status

### LPPosition
pair, lpToken, recipient, owner, amount, status, lock fields

### SafetyState
`active`, `reasonCode`, `detectedAt`, `evidence`, `clearable`, `clearedAt`, `clearedByMechanism`

---

## 20. Authority separation

```
Observed market flow
→ Eligible flow classification
→ Strategy decision          (AI may propose)
→ On-chain bounded validation
→ Execution trigger
→ Transaction execution
→ Receipt verification
→ Accounting
```

Rules:

- AI proposes; does not set recipient/fee/budget/limits  
- Economic limits enforced on-chain  
- Executor has **no free economic discretion**  
- Same epoch cannot execute twice (`EPOCH_ALREADY_EXECUTED`)  
- Internal LB operations excluded from observed eligible flow  
- No human operational wallet in the model  
- Owner controls program; cannot rewrite history  

Executor choice (permissionless vs worker) deferred to architecture mission — **not** decided here.

---

## 21. Metric contract and formulas

| Metric | Formula / rule | Source class |
| --- | --- | --- |
| Initial Token Budget | First confirmed deposit | on-chain authoritative |
| Added Budget | Σ later deposits | on-chain |
| Total Deposited | initial + added | derived |
| Remaining | available excl. reserved pending | on-chain/accounting |
| Tokens Sold | successful swap consumed | receipt-derived |
| Tokens Matched | successful add-liq project token | receipt-derived |
| Gross Quote Acquired | swap received | receipt/event/balance delta |
| Melega Fee Paid | `gross × 1000 / 10000` (+ rounding TBD) | settlement |
| Net Quote Available | gross − fee | derived |
| Net Quote Added | quote in successful add-liq | receipt |
| Liquidity built | **dual:** tokensMatched + netQuoteAdded | receipt |
| LP Received | LP delta to recipient | receipt/event |

Aggregated “value” in quote terms only if derived from **successful add-liquidity ratio**, never from simulated mid price.

---

## 22. Data provenance matrix

| Field | Source of truth | On-chain | Runtime | Cache | Stale policy | UI fallback |
| --- | --- | --- | --- | --- | --- | --- |
| programStatus | program contract/state | view/events | may mirror | short | refetch on focus | last known + stale |
| remainingBudget | program accounting | balances/events | reconcile | short | block lag badge | “Unavailable” |
| tokensSold | execution receipts | swap events | sum | yes | reorg-safe depth | “—” |
| grossQuoteAcquired | execution | swap events | sum | yes | same | “—” |
| melegaFee | FeeSettlement | transfer/receipt | — | yes | settle confirm | “Pending settlement” / unavailable (LB-G04) |
| pool liquidity | pair reserves | getReserves | — | very short | mark stale | “Unavailable” |
| eligibleNetBuyFlow | observation+classification | evidence refs | derived w/ evidence | epoch | epoch-bound | hide or “Not ready” |
| nextEligibleEpoch | schedule | time/blocks | derived | no long | — | time only; no promise |
| AI decision detail | decision record | validation status | engine | — | — | presentation-only extras |

Never permanent SoT: local optimistic UI state alone.

---

## 23. Machine-readable read model

### `LiquidityBuildingProgramReadModelV1` (document schema — no TS/endpoint)

Required keys:

- `schemaVersion`: `"LiquidityBuildingProgramReadModelV1"`  
- `chainId`: `56`  
- `programId`, `owner`  
- `projectToken` `{ address, symbol, decimals }`  
- `quoteAsset` `{ address, symbol, decimals }`  
- `pair`  
- `programStatus`, `reasonCode`  
- `budget` (all amounts **decimal strings in base units** + `decimals`)  
- `strategy`  
- `epoch`  
- `observedFlow` (nullable)  
- `latestDecision` (nullable)  
- `cumulativeExecutionMetrics`  
- `latestExecution` (nullable)  
- `lpPosition` (nullable)  
- `safetyState`  
- `treasurySettlementState`  
- `transactionReferences[]`  
- `freshness` `{ sourceBlock, generatedAt }`  

**No JavaScript number for token amounts. No simulated example values.**

---

## 24. Owner command model

| Command | Auth | Allowed states | Inputs | On-chain effect | Event | Idempotency | Failure | UI confirm | History |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ADD_BUDGET | owner | ACTIVE/PAUSED/BUDGET_DEPLETED | amount | deposit↑ | BudgetAdded | keyed deposit | ERROR/reason | yes | immutable |
| ACTIVATE | owner | READY | — | ACTIVE | Activated | once | ERROR | yes | immutable |
| PAUSE | owner | ACTIVE | — | PAUSED | Paused | — | ERROR | light | immutable |
| RESUME | owner | PAUSED | — | ACTIVE | Resumed | — | ERROR | light | immutable |
| UPDATE_STRATEGY | owner | ACTIVE/PAUSED | config | future | StrategyUpdated | versioned | ERROR | yes | no rewrite past |
| UPDATE_EPOCH | owner | ACTIVE/PAUSED | seconds | future | EpochUpdated | versioned | ERROR | yes | no rewrite past |
| WITHDRAW_UNUSED_BUDGET | owner | per rules | amount≤unused | withdraw | UnusedWithdrawn | keyed | ERROR | yes | immutable |
| STOP | owner | non-STOPPED | — | STOPPED | Stopped | once | ERROR | strong | immutable |
| UPDATE_LP_RECIPIENT | owner | before LP or per rules | address | recipient | RecipientUpdated | — | ERROR | yes | constrained |
| LOCK_LP | owner | unlocked LP | lock params | locked | LpLocked | — | ERROR | yes | may be permanent |

---

## 25. Activity model

Timeline entry types: informational | owner tx | execution tx | Treasury receipt | safety | failed attempt.

Events: program created; token approved; budget deposited; activated; epoch observed; epoch skipped; execution decided; swap completed; fee settled; liquidity added; LP received; strategy/epoch changed; budget added; paused; resumed; safety paused; unused withdrawn; stopped; LP locked.

---

## 26. Token compatibility (frozen)

**Policy:** Standard ERC-20 supported. Non-standard rejected with explicit reason.  
**No owner override** of incompatible verdict.

| Verdict | Meaning | UI | Retry |
| --- | --- | --- | --- |
| SUPPORTED | proceed | green/ok | — |
| REJECTED | reason code | block setup | only with different token |
| INCONCLUSIVE | `TOKEN_VALIDATION_INCONCLUSIVE` | block activation | Retry validation |

---

## 27. Copy catalog (public)

| Surface | Copy |
| --- | --- |
| Inactive title | Liquidity Building |
| Inactive badge | AI Powered / Not Active |
| Inactive body | Use your available token supply to build liquidity from real market demand. |
| Bullets | Budget-based execution · Dynamic AI strategy · Automatic Melega DEX liquidity · Owner-controlled LP |
| CTA | Start Building Liquidity |
| Token step | Select or paste token address |
| Budget step | How many tokens do you want to dedicate? |
| Budget support | Only the deposited budget can be used. Unused tokens remain withdrawable. |
| Full AI | Automatically decides whether to execute and how much to use within protocol safety limits. |
| Dynamic Range | Set a minimum and maximum strategy rate. The engine selects the effective rate for each eligible epoch. |
| Fee | 5% success fee on quote assets acquired through Liquidity Building. |
| LP ownership | Owner-controlled liquidity · Unlocked |
| Review CTA | Deposit Budget & Start |
| No pool | No Melega DEX pool detected |
| No pool support | Create a standard Melega DEX pool before activating Liquidity Building. |
| No pool CTA | Create Pool & Continue |
| Token rejected | Token not supported for Liquidity Building. |
| Inconclusive | Token validation inconclusive. Retry validation. |
| Active | ACTIVE |
| Paused | Paused by owner |
| Safety | Liquidity Building paused for safety |
| Budget depleted | Budget depleted |
| Stopped | Program stopped |
| Epoch skipped | Epoch skipped — no eligible net buy flow |
| Runtime unavailable | Runtime temporarily unavailable |
| Treasury unavailable | Treasury settlement unavailable |
| Tx failed | Transaction failed |
| Execution success | Execution completed |
| Add budget | Add budget |
| Withdraw unused | Withdraw unused budget |
| Lock | Lock liquidity |

**Banned phrases:** guaranteed; support/defend/increase the price; buyback; risk-free; automatic profit; guaranteed liquidity growth.

---

## 28. Schema note for implementers

Amounts: **string integers in base units** + `decimals` field.  
Chain V1: **56**.  
DEX V1: **Melega only**.  
Pool V1: **constant-product only**.

---

## Document control

| Item | Value |
| --- | --- |
| Artifact | `docs/LB002_LIQUIDITY_BUILDING_UI_DOMAIN_CONTRACT.md` |
| Supersedes | none (complements LB001) |
| Next mission | LB003 — Economic Math, Safety Bounds & Execution Invariants |
