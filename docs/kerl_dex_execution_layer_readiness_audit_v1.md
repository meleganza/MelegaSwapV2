# KERL DEX Execution Layer Readiness Audit v1

**Mission:** KERL DEX Phase 1 — Execution Layer Readiness Audit  
**Repository:** MelegaSwapV2 (`design-system-foundation` branch as of 2026-07-02)  
**Auditor scope:** Read-only repository inspection — no implementation changes  
**Authoritative constraint:** KERL decides. Melega DEX executes. Execution never decides.

---

## Executive Summary

Melega DEX is a mature PancakeSwap-derived DEX with **live on-chain execution** for swap, liquidity add/remove, bridge burn, farms stake/harvest, and syrup pools. Treasury Runtime exists only as a **Phase 2 read model** (`execution_enabled: false`). **No KERL references exist** in the repository.

The repository contains **strong execution primitives** (contract call builders, gas estimation, transaction submission, receipt polling) but **no canonical KERL execution boundary**. Routing, quote selection, asset/chain policy, and slippage decisions are **embedded inside the same modules that submit transactions**. Smart Economic Execution (`lib/smart-execution/`) is correctly isolated as illustrative-only and must never be wired to live swap.

**Classification:** `PARTIALLY_READY_FOR_KERL_EXECUTION_LAYER`

**Final verdict:** `KERL_DEX_EXECUTION_LAYER_NOT_READY`

---

## 1. Repository Audit

### 1.1 Architecture Overview

| Layer | Location | Role today |
|-------|----------|------------|
| Pages / routes | `apps/web/src/pages/` | Thin wrappers → view screens |
| Presentation shells | `views/HomeTrade/`, `views/Trade/`, `views/LiquidityStudio/`, `views/FarmsStudio/` | UI-only (recent missions); **do not execute** |
| Live swap | `views/Swap/`, `state/swap/` | Quote + route + execute (coupled) |
| Smart router package | `packages/smart-router/` | Route discovery engine |
| Swap SDK | `packages/swap-sdk/` | V2 calldata encoding |
| Bridge | `views/Bridge/` | Cross-chain burn execution (orphaned route) |
| Liquidity | `views/AddLiquidity/`, `views/RemoveLiquidity/`, `state/mint/`, `state/burn/` | LP mint/burn execution |
| Farms / pools | `views/Farms/`, `state/farms/`, `views/Pools/`, `state/pools/` | MasterChef / SousChef execution |
| Wallet | `utils/wagmi.ts`, `hooks/useAuth.tsx`, `Providers.tsx` | Signing infrastructure |
| Treasury | `lib/economic-runtime/`, `lib/economic-activation/`, registry JSON | Read model only — **not settlement** |
| Illustrative execution | `lib/smart-execution/`, `/execution` page | Sample route ranking — **not live** |
| Capability inventory | `lib/dex-capability-audit/audit-data.ts` | Prior audit — confirms separation intent |
| Event intake guardrails | `lib/real-event-intake/event-intake-safety.ts` | Blocks `router_execute`, `swap_execute` from intake |

### 1.2 KERL / Treasury Presence

| Signal | Finding |
|--------|---------|
| KERL | **Zero references** in code, docs, or registry |
| Treasury Runtime | Phase 2 PLANNED; `execution_enabled: false`; no indexed amounts |
| Settlement normalization | **Not implemented** — only on-chain tx receipts in Redux |
| Smart execution treasury sample | `execution-candidates.ts` includes rejected illustrative "Ecosystem Treasury Route" |

### 1.3 Presentation vs Execution Separation (Recent Work)

Home, Trade, Liquidity Studio, and Farms Studio use **independent presentation shells** with preview/mock data. These shells are **not** execution surfaces and are safe from KERL contamination **as long as they remain disconnected** from `SmartSwapForm`, `useSwapCallback`, and router hooks.

---

## 2. Existing Execution Components

### 2.1 Swap

| Path | Purpose | Current responsibility | Public interfaces | Key dependencies | KERL-consumable? | DEX-only? | Routing risk? | Treasury risk? |
|------|---------|---------------------|-------------------|------------------|------------------|-----------|---------------|----------------|
| `views/Swap/SmartSwap/index.tsx` | SmartSwap UI | Orchestrates quote path selection + commit | `SmartSwapForm` | `useBestTrade`, `useTradeInfo`, commit buttons | **No** — decides route | Yes (UI) | **High** | Low |
| `views/Swap/SmartSwap/hooks/useBestTrade.ts` | Quote engine hook | Calls `getBestTradeExactIn/Out` | `useBestTrade`, `useBestTradeFromChain` | `@pancakeswap/smart-router/evm` | **No** — pure routing | Yes | **Critical** | Low |
| `packages/smart-router/evm/getBestTrade.ts` | Router package | V2 + StableSwap path search | `getBestTradeExactIn/Out` | SDK pairs, stable configs | **No** | Yes | **Critical** | Low |
| `hooks/Trades.ts` | V2 trades | `Trade.bestTradeExactIn/Out` on pairs | `useTradeExactIn/Out` | `@pancakeswap/sdk` | **No** | Yes | **Critical** | Low |
| `views/Swap/SmartSwap/hooks/useIsSmartRouterBetter.tsx` | Path comparator | Chooses Smart Router vs V2 | `useIsSmartRouterBetter` | trade outputs | **No** | Yes | **Critical** | Low |
| `views/Swap/SmartSwap/hooks/useTradeInfo.ts` | Active trade picker | Sets `fallbackV2` flag | `useTradeInfo` | smart + V2 trades | **No** | Yes | **Critical** | Low |
| `views/Swap/SmartSwap/hooks/useSwapCallArguments.ts` | Calldata builder | Encodes `swap`/`swapMulti` for Smart Router | `useSwapCallArguments`, `SwapCall` | `useSmartRouterContract`, slippage math | **Partial** — if inputs are KERL-supplied | Yes | Medium (slippage applied here) | Low |
| `hooks/useSwapCallArguments.ts` | V2 calldata | `Router.swapCallParameters` | same pattern | `useRouterContract` | **Partial** | Yes | Medium | Low |
| `views/Swap/SmartSwap/hooks/useSwapCallback.ts` | Tx submitter | Gas estimate → contract call → `addTransaction` | `useSwapCallback`, `SwapCallbackState` | wagmi account, gas price | **Partial** — execution tail | Yes | Low | Low |
| `hooks/useSwapCallback.ts` | V2/stable submitter | Same pattern for V2/StableSwap | same | router/stable contracts | **Partial** | Yes | Low | Low |
| `views/Swap/SmartSwap/components/SmartSwapCommitButton.tsx` | User trigger | Approval + confirm + `swapCallback()` | default export | hooks above | **No** — UI-driven full stack | Yes | **High** (UI decides when) | Low |
| `state/swap/` | Form state | Currency pair, amounts, recipient | `useSwapState`, `useDerivedSwapInfo` | Redux | **No** | Yes | Medium | Low |
| `state/swap/fetch/fetchBestPriceWithRouter.ts` | Off-chain quote API | POST `/smartRouter` | `getBestPriceWithRouter` | HTTP (handler missing in repo) | **No** | Yes | **Critical** | Low |
| `views/Trade/components/TradeSmartRouteBox.tsx` | Trade UI mock | Static "Best Route" display | component | none | N/A | Yes (mock) | None | None |

**Swap flow today:** UI → quote/route discovery → slippage adjustment → user confirm → contract call → Redux tx hash → global receipt poller.

### 2.2 Bridge

| Path | Purpose | Current responsibility | Public interfaces | Key dependencies | KERL-consumable? | DEX-only? | Routing risk? | Treasury risk? |
|------|---------|---------------------|-------------------|------------------|------------------|-----------|---------------|----------------|
| `views/Bridge/BridgeForm/index.tsx` | Bridge UI | Token select, fee display, burn trigger | default export | bridge hooks | **No** — full stack | Yes | Medium (chain pair implicit) | **Critical** if treasury wired |
| `views/Bridge/hooks/useBurnToken.ts` | Burn executor | `burn`/`burnETH` calls | `useBurnToken` | bridge contract | **Partial** — execution tail | Yes | Low | Low |
| `utils/calls/bridge.ts` | Call helpers | Low-level burn encoding | `burn`, `burnETH` | ethers contract | **Yes** (with KERL instruction) | Yes | Low | Low |
| `hooks/useContract.ts` (`useBridge`) | Contract binding | Returns signed bridge instance | `useBridge` | `contracts.ts` addresses | Yes (binding) | Yes | Low | Low |
| `config/abi/bridge.json` | ABI | `KronoSwapBridge` interface | ABI | — | Yes | Yes | Low | Low |
| `config/constants/contracts.ts` (`bridge`) | Addresses | chains 137, 13600 | config | — | DEX config — **not KERL policy** | Yes | Low | Low |
| `components/stargate/` | Stargate widget | LayerZero embed (unused) | widget | 3rd party | **No** | Yes | High | Medium |
| `utils/mpBridge.ts` | Mini-program IPC | Wallet bridge, not asset bridge | helpers | — | N/A | Yes | None | None |
| `lib/submission-review-intake/bridge-read-model.ts` | Workflow bridge | Submission pipeline mapping | read model | — | **No** (not on-chain) | Yes | None | None |

**Note:** `views/Bridge/` has **no active `pages/bridge` route** — bridge code exists but is not mounted in production routing.

### 2.3 Liquidity

| Path | Purpose | Current responsibility | Public interfaces | Key dependencies | KERL-consumable? | DEX-only? | Routing risk? | Treasury risk? |
|------|---------|---------------------|-------------------|------------------|------------------|-----------|---------------|----------------|
| `pages/add/[[...currency]].tsx` | Add LP route | Page wrapper | page | `AddLiquidity` | N/A | Yes | Low | Low |
| `views/AddLiquidity/index.tsx` | Add liquidity UI + tx | Pair selection, ratio, `addLiquidity`/`addLiquidityETH` | default export | router, mint state | **No** — user decides pair/ratio | Yes | Medium | Low |
| `views/AddLiquidity/AddStableLiquidity/` | Stable add | Stable pool add flow | components | stable contracts | **No** | Yes | Medium | Low |
| `state/mint/` | Mint state | LP deposit calculations | hooks | pairs, reserves | **No** | Yes | Medium | Low |
| `pages/remove/[[...currency]].tsx` | Remove LP route | Page wrapper | page | `RemoveLiquidity` | N/A | Yes | Low | Low |
| `views/RemoveLiquidity/index.tsx` | Remove liquidity + tx | `removeLiquidity*` methods | default export | router, burn state | **No** | Yes | Low | Low |
| `views/LiquidityStudio/` | Presentation shell | Mock liquidity UI — **no execution** | `LiquidityStudioScreen` | tokens only | N/A | Yes (preview) | None | None |

### 2.4 Routing (Decision Layer — Must Not Be KERL Execution)

| Path | Purpose | Must remain outside KERL execution |
|------|---------|-----------------------------------|
| `packages/smart-router/**` | Multi-hop + stable route search | **Yes — KERL owns routing** |
| `packages/swap-sdk/src/entities/trade.ts`, `route.ts` | V2 Trade/Route entities | **Yes** |
| `hooks/Trades.ts` | V2 pair graph + best trade | **Yes** |
| `views/Swap/SmartSwap/hooks/useBestTrade.ts` | App-level quote hook | **Yes** |
| `views/Swap/SmartSwap/hooks/useTradeInfo.ts` | Smart vs V2 selection | **Yes** |
| `views/Swap/SmartSwap/hooks/useIsSmartRouterBetter.tsx` | Output comparison | **Yes** |
| `state/user/smartRouter.ts` | User stable-swap preference | **Yes** (user pref ≠ KERL) |
| `config/constants/exchange.ts` | `ROUTER_ADDRESS`, `BASES_TO_CHECK_TRADES_AGAINST` | **Yes** (DEX deployment config, not policy engine) |
| `lib/smart-execution/**` | Illustrative economic routing | **Yes** — already isolated |

### 2.5 Farms / Pools / Staking (DEX Earn — Outside KERL Phase 1 Scope)

| Path | Purpose | KERL note |
|------|---------|-----------|
| `views/Farms/`, `state/farms/`, `packages/farms/` | MasterChef stake/harvest/compound | **DEX-only earn execution** — not swap/bridge/liquidity |
| `views/FarmsStudio/` | Mock farms UI | Safe preview shell |
| `views/Pools/`, `state/pools/` | Syrup pool staking | DEX-only |
| `views/Farms/hooks/useStakeFarms.ts`, `useHarvestFarm.ts` | On-chain farm actions | Execution without KERL boundary |

KERL authoritative constraints list swap, bridge, liquidity — **farms/staking should remain DEX-only** unless KERL scope expands.

### 2.6 Wallet, Chain, Token Lists

| Path | Purpose | KERL-consumable? | Risk |
|------|---------|------------------|------|
| `utils/wagmi.ts` | Chain + connector config (56, 8453, 137, 1) | **Infrastructure only** — KERL picks chain; DEX signs | Chain policy leakage if DEX switches chain autonomously |
| `hooks/useAuth.tsx`, `useActiveWeb3React.ts` | Connect / switch network | Infrastructure | Wallet/connect dependency |
| `hooks/useSwitchNetwork.ts` | Network switch | Infrastructure | User/UI may switch away from KERL intent |
| `config/constants/supportChains.ts` | Feature gates per chain | DEX deployment matrix | Not KERL policy |
| `config/constants/lists.ts`, `state/lists/` | Token list merge + import | **Asset discovery** — KERL owns accepted assets | Asset policy leakage if DEX filters independently |
| `packages/tokens/`, `tokenLists/*.json` | Bundled token metadata | Config | Low |

### 2.7 Quote Preview, Slippage, Gas, Status, Errors, Logs

| Concern | Path | Owner today | KERL vs DEX |
|---------|------|-------------|-------------|
| Quote preview | `AdvancedSwapDetails.tsx`, `RouterViewer.tsx`, `computeTradePriceBreakdown` | DEX (derived from local route) | **KERL should supply quote**; DEX may display KERL-provided preview only |
| Slippage | `state/user/hooks` (`useUserSlippageTolerance`), applied in `useSwapCallArguments` | DEX user setting | **KERL should supply bounds**; DEX applies to calldata only |
| Gas estimation | Inside `useSwapCallback` (`estimateGas`) | DEX | DEX may estimate; KERL may supply gas hints |
| Tx status | `state/transactions/reducer.ts`, `updater.tsx` | DEX client | DEX owns **execution status** exposure |
| Receipts | `transactions/updater.tsx` → `finalizeTransaction` | DEX client | DEX owns **execution receipt** — not settlement event |
| Errors | `transactionErrorToUserReadableMessage.ts`, `useCatchTxError.tsx` | DEX | DEX owns execution error surfacing |
| Analytics | `utils/log.ts` (`logSwap`, `logTx`), Sentry | DEX observability | Must not emit treasury-normalized payloads |
| API log stub | `pages/api/_log/[...params].ts` | No persistence | Low |

### 2.8 Treasury / Settlement References

| Path | Purpose | Contamination risk |
|------|---------|-------------------|
| `lib/economic-runtime/` | Activation timeline, `executionEnabled: false` | **None** — read only |
| `lib/economic-activation/` | Pipeline metadata incl. `treasury_runtime` stage | **None** |
| `public/registry/activation/*.json` | Serialized activation | **None** |
| `lib/smart-execution/execution-candidates.ts` | Sample "Treasury Runtime" route | **Medium** if wired to live swap — currently rejected by constraints |
| `docs/ORGAN_00_ECONOMIC_INTELLIGENCE_ENGINE.md` | Treasury truth hierarchy | Documentation only |
| `views/Graph/`, `registry/query/` | Treasury attribution placeholders | **None** — not indexed |

**On-chain settlement** today = standard EVM tx success/failure. **No** civilization settlement event normalization exists in Melega DEX.

---

## 3. Future KERL Execution Boundary

### 3.1 Canonical Boundary Definition

The future **KERL Execution Layer boundary** inside Melega DEX is a **thin, instruction-driven execution façade** that:

1. Accepts a **KERL Execution Instruction** (external, immutable for the request lifecycle)
2. Validates instruction schema and wallet/chain readiness
3. Builds or forwards **pre-decided** calldata to the correct venue adapter
4. Submits the transaction via the connected wallet
5. Tracks **execution status** until terminal state
6. Emits an **Execution Report** (DEX-owned evidence)
7. **Never** discovers routes, never ranks venues, never applies asset/chain policy

```
┌─────────────────────────────────────────────────────────────┐
│                        KERL (external)                       │
│  Accepted Asset Policy · Accepted Chain Policy · Routing     │
│  Route Cost · Route Risk · Route Optimization · Versioning   │
└──────────────────────────┬──────────────────────────────────┘
                           │ ExecutionInstruction
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              Melega DEX — KERL Execution Layer               │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────┐  │
│  │ Instruction │→ │ Venue Adapter │→│ Wallet / Tx Submit  │  │
│  │  Validator  │  │  (swap/bridge/│  │  + Receipt Track   │  │
│  │             │  │   liquidity)  │  │                     │  │
│  └─────────────┘  └──────────────┘  └─────────────────────┘  │
│                           │                                    │
│                           ▼                                    │
│              ExecutionReport · ExecutionStatus · Receipt       │
└──────────────────────────┬──────────────────────────────────┘
                           │ (only if KERL/Treasury owner normalizes)
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              Treasury Runtime (external owner)                 │
│              Settlement Events (normalized)                    │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 What Melega DEX May Execute (Future)

| Domain | Allowed execution actions | Canonical adapter source (today) |
|--------|--------------------------|----------------------------------|
| **Swap** | Submit pre-built router/smart-router calldata; approve ERC-20 if instructed | `useSwapCallArguments` + `useSwapCallback` (refactored) |
| **Bridge** | Submit `burn`/`burnETH` with KERL-specified amounts/recipient | `utils/calls/bridge.ts` |
| **Liquidity** | Submit `addLiquidity*` / `removeLiquidity*` with KERL-specified amounts | `AddLiquidity` / `RemoveLiquidity` tx builders |
| **Status** | Poll mempool + receipt; expose pending/success/failed/reverted | `state/transactions/updater.tsx` |
| **Evidence** | Tx hash, chainId, blockNumber, gasUsed, logs, methodId, revert reason | Extend from `TransactionDetails` |

### 3.3 What Melega DEX Must Refuse to Decide

Per authoritative KERL constraints, Melega DEX must **never own**:

| Forbidden decision | Current leakage location |
|--------------------|-------------------------|
| Accepted Asset Policy | `state/lists/`, `ImportToken`, `BASES_TO_CHECK_TRADES_AGAINST` |
| Accepted Chain Policy | `wagmi.ts`, `useSwitchNetwork`, URL chain query |
| Route Selection | `useBestTrade`, `packages/smart-router`, `hooks/Trades` |
| Route Cost | Quote comparison in `useIsSmartRouterBetter` |
| Route Risk | Price impact guards in uikit + confirm modals (derived from local route) |
| Route Optimization | Smart Router vs V2 fallback in `useTradeInfo` |
| Routing Versioning | Smart execution manifest vs live router version drift |

### 3.4 Evidence Melega DEX Must Eventually Return

**ExecutionReport** (DEX-owned, not settlement):

```typescript
// Illustrative — not implemented
interface ExecutionReport {
  instructionId: string          // from KERL
  executionId: string            // DEX-generated
  domain: 'swap' | 'bridge' | 'liquidity'
  chainId: number
  status: 'submitted' | 'pending' | 'confirmed' | 'failed' | 'reverted'
  txHash?: string
  blockNumber?: number
  gasUsed?: string
  effectiveGasPrice?: string
  timestamp: string
  revertReason?: string
  receipt?: TransactionReceipt   // raw EVM evidence
  adapter: string                // e.g. 'pancake-smart-router-v1'
}
```

### 3.5 Execution Status Melega DEX Must Eventually Expose

| Status | Meaning | Owner |
|--------|---------|-------|
| `awaiting_wallet` | Instruction valid; wallet not connected | DEX |
| `awaiting_approval` | ERC-20 approval required | DEX |
| `simulating` | Gas/static call in progress | DEX |
| `submitted` | Tx hash obtained | DEX |
| `pending` | Awaiting confirmation | DEX |
| `confirmed` | Receipt success | DEX |
| `failed` | Submission or confirmation failed | DEX |
| `reverted` | On-chain revert | DEX |

### 3.6 Data Melega DEX Must Never Normalize

| Data type | Reason |
|-----------|--------|
| Settlement Events | Treasury Runtime owner only |
| Fee SKU attribution | Treasury / EIE domain |
| Civilization journal entries | Treasury domain |
| Route quality scores | KERL domain |
| Accepted asset/chain decisions | KERL policy domain |
| Economic presence / venue health rankings | KERL / registry read models |

### 3.7 Data That Must Never Reach Treasury Runtime Directly

| Source | Rule |
|--------|------|
| Raw `logSwap` / `logTx` payloads | Observability only — not settlement |
| Redux `TransactionDetails` | Client-local — not civilization ledger |
| Smart execution recommendation JSON | Illustrative — forbidden |
| UI preview amounts | Not settlement truth |
| DEX-derived route labels | Not settlement truth |

**Only** settlement-normalized events from the **designated owner** (KERL → Treasury pipeline) may enter Treasury Runtime.

---

## 4. Responsibility Separation

### 4.1 KERL vs Melega DEX vs Treasury

| Responsibility | KERL | Melega DEX | Treasury Runtime |
|----------------|------|------------|------------------|
| Route selection | **Owns** | Must refuse | — |
| Asset/chain policy | **Owns** | Must refuse | Reads compatibility |
| Execution instruction | **Produces** | **Consumes** | — |
| Calldata construction | May specify fully | **May build from instruction** | — |
| Wallet signing | — | **Owns** (infrastructure) | — |
| Tx submission | — | **Owns** | — |
| Execution status/receipt | — | **Owns** | — |
| Execution evidence (raw) | May read | **Owns** | — |
| Settlement normalization | May orchestrate | **Must not** | **Owns ledger** |
| Fee accounting | — | **Must not** | **Owns** |

### 4.2 Safe vs Unsafe Modules for Future Wiring

| Safe to wrap as execution adapters (after refactor) | Unsafe to expose to KERL |
|------------------------------------------------------|--------------------------|
| `utils/calls/bridge.ts` | `useBestTrade`, `getBestTrade*` |
| `packages/swap-sdk/src/router.ts` (encode only, given params) | `useIsSmartRouterBetter`, `useTradeInfo` |
| `useSwapCallback` (given fixed `SwapCall[]`) | `SmartSwapForm` orchestration |
| `state/transactions/updater.tsx` | `lib/smart-execution/*` |
| `hooks/useApproveCallback.ts` | `fetchBestPriceWithRouter` |
| Add/Remove liquidity tx builders (given amounts) | `state/lists/` as policy engine |

### 4.3 Existing Guardrails (Positive Signals)

1. **`lib/smart-execution/`** — explicit `illustrative: true`, `execution_enabled: false`
2. **`dex-capability-audit`** — documents that Mission 10 must stay separate from live routing
3. **`event-intake-safety.ts`** — blocks `router_execute`, `swap_execute` from intake
4. **`economic-runtime`** — `readOnly: true`, `executionEnabled: false`
5. **Presentation shells** — Home/Trade/Liquidity/Farms Studio isolated from live execution

---

## 5. Evidence and Receipt Gap Analysis

### 5.1 What Exists Today

| Capability | Implementation | Gap for KERL |
|------------|----------------|--------------|
| Tx hash capture | `useSwapCallback` returns hash; stored in Redux | No link to `instructionId` |
| Receipt polling | `state/transactions/updater.tsx` | Global poller — not domain-scoped |
| Receipt storage | `TransactionDetails.receipt` in Redux | Client-only, ephemeral, not structured report |
| Swap logging | `logSwap({ tradeType, ... })` | No instruction correlation; not durable |
| Tx logging | `logTx` → edge stub | No persistence |
| Confirm modal hash display | `ConfirmSwapModal` | UI-only feedback |
| Error translation | `transactionErrorToUserReadableMessage` | Not structured for KERL consumption |

### 5.2 Missing for KERL Integration

| Gap | Severity |
|-----|----------|
| No `ExecutionInstruction` schema or validator | **Blocker** |
| No instruction ↔ tx correlation ID | **Blocker** |
| No structured `ExecutionReport` export API | **Blocker** |
| No execution status state machine separate from Redux swap form | **High** |
| No settlement event emitter (correct — must not exist in DEX) | N/A (by design) |
| No replay-safe idempotency for instruction execution | **High** |
| Receipt evidence not chain-normalized (multi-chain) | **Medium** |
| No bridge execution report (bridge route orphaned) | **Medium** |

### 5.3 Receipt vs Settlement Distinction

| Layer | Current | Required |
|-------|---------|----------|
| **Execution receipt** | EVM `TransactionReceipt` in Redux | DEX exposes to KERL |
| **Execution report** | Does not exist | DEX creates from receipt |
| **Settlement event** | Does not exist in DEX | KERL/Treasury owner normalizes — **never DEX** |

---

## 6. Risks

### 6.1 Routing Decision Leakage — **CRITICAL**

Live swap path: `SmartSwapForm` → `useBestTrade` → `useTradeInfo` → `useIsSmartRouterBetter` → commit. **Entire stack must be bypassed** for KERL-driven execution. Accidental import of `useDerivedSwapInfo` into a KERL adapter would violate "execution never decides."

### 6.2 Asset Policy Leakage — **HIGH**

`state/lists/hooks.ts` merges bundled + user-imported tokens. `BASES_TO_CHECK_TRADES_AGAINST` in `exchange.ts` constrains routable bases. DEX currently **decides** tradable universe for routing.

### 6.3 Chain Policy Leakage — **HIGH**

`useActiveChainId` resolves chain from URL/session/wagmi. `useSwitchNetwork` allows user override. KERL instruction chain must be **authoritative**; DEX must reject mismatch.

### 6.4 Treasury Contamination — **LOW today, CRITICAL if miswired**

Treasury Runtime is read-only. Risk is **future wiring** of `smart-execution` treasury sample or `logSwap` enrichment with SKU fields into Treasury intake.

### 6.5 Settlement Ownership Leakage — **HIGH**

No settlement normalizer exists in DEX (good). Risk: treating `finalizeTransaction` success as treasury settlement without KERL normalization.

### 6.6 Bridge Ownership Ambiguity — **MEDIUM**

Three "bridge" concepts: (1) on-chain `KronoSwapBridge` burn, (2) Stargate widget (unused), (3) submission-review workflow bridge. KERL integration must target **(1) only** with explicit domain typing.

### 6.7 Swap Ownership Ambiguity — **MEDIUM**

V2 Router, Smart Router, and StableSwap each have separate call builders. KERL instruction must specify **venue + method** explicitly; DEX must not auto-select.

### 6.8 UI-Driven Execution Risks — **HIGH**

All live execution is triggered by React commit buttons bound to local routing state. KERL execution must not flow through `SmartSwapCommitButton` without full decoupling.

### 6.9 Wallet/Connect Dependency Risks — **MEDIUM**

Execution requires browser wallet via wagmi. Headless/server signing is not supported. KERL must account for wallet availability as pre-condition, not DEX policy.

---

## 7. Recommended DEX Implementation Sequence

**No implementation in this mission** — sequence for a future Phase 2:

### Phase A — Boundary scaffolding (no live path change)

1. Define `ExecutionInstruction`, `ExecutionReport`, `ExecutionStatus` types in `lib/kerl-execution/` (types only)
2. Add instruction validator (schema + chain/asset match against instruction, not local policy)
3. Document forbidden imports lint rule: execution layer must not import `smart-router`, `useBestTrade`, `Trades`

### Phase B — Adapter extraction

4. Extract **swap execution tail** from `useSwapCallback` → `executeSwapInstruction(instruction, swapCalls)`
5. Extract **bridge tail** from `utils/calls/bridge.ts` → `executeBridgeInstruction`
6. Extract **liquidity tail** from Add/Remove views → `executeLiquidityInstruction`
7. Keep existing UI paths calling old hooks — parallel code path only

### Phase C — Evidence layer

8. Add `ExecutionTracker` — instructionId ↔ txHash ↔ receipt ↔ terminal status
9. Expose read-only `getExecutionReport(executionId)` for KERL polling
10. Ensure `logSwap`/`logTx` include `instructionId` when present — **no treasury fields**

### Phase D — UI isolation

11. Add internal-only KERL execution entry (no public route) for integration testing
12. Verify presentation shells (Home/Trade/Liquidity/Farms Studio) remain disconnected
13. Confirm `lib/smart-execution/` stays illustrative — add CI grep guard

### Phase E — Hardening

14. Chain mismatch rejection (instruction.chainId !== wallet.chainId → fail fast)
15. Idempotency key on instructionId
16. Integration tests: instruction in → tx submitted → report out (testnet)
17. Explicit negative tests: execution module cannot import routing packages

### Explicitly out of scope for DEX

- Route discovery migration into KERL (KERL team)
- Settlement event schema (Treasury Runtime owner)
- Farms/pools staking (remain DEX-only unless KERL expands)

---

## 8. Final Readiness Verdict

### Classification

**`PARTIALLY_READY_FOR_KERL_EXECUTION_LAYER`**

### Rationale

| Ready signals | Not-ready blockers |
|---------------|-------------------|
| Live swap/bridge/liquidity execution primitives exist | No KERL execution boundary module |
| Treasury cleanly isolated (Phase 2 read-only) | Routing inseparable from execution in live UI |
| Smart execution correctly illustrative-only | No ExecutionInstruction / ExecutionReport contract |
| Event intake blocks unsafe execute payloads | No instruction-driven adapter layer |
| Prior dex-capability-audit documents separation intent | UI commit buttons own full decide+execute stack |
| Presentation shells isolated from execution | Receipt evidence not structured for KERL |
| Transaction receipt polling exists | Chain/asset policy embedded in DEX routing |

The repository is **partially ready** because proven on-chain execution tails, wallet infrastructure, and treasury isolation provide a foundation — but **architectural decoupling has not begun**. Connecting KERL today would immediately violate "KERL decides, Melega DEX executes" because every live user path still decides routes inside the DEX.

### Conditions for `KERL_DEX_EXECUTION_LAYER_READY` (future)

1. Instruction-driven execution façade exists and is the **only** KERL entry point
2. Live routing hooks are unreachable from KERL execution code path
3. Structured ExecutionReport with instruction correlation ships
4. Chain/asset validation checks instruction authority — not local DEX policy
5. CI/guard prevents `smart-router` / `useBestTrade` imports in execution layer
6. Treasury receives zero direct DEX payloads

---

**KERL_DEX_EXECUTION_LAYER_NOT_READY**
