# LB001 — Liquidity Building Repository Audit & Integration Map

**Mission:** LB001 (analysis only — no application code changes)  
**Repository:** `meleganza/MelegaSwapV2` (local checkout)  
**Observed UTC:** 2026-07-19T12:25:37Z  
**Commit audited:** `dc7a5d8b3bfdb2a5e9ec901d876655162ea4aba0`  
**Branch:** `main`

---

## LB001 FINAL REPORT

### 1. Verdict

**LB001_MAINNET_GAPS_FOUND**

Liquidity Studio, Melega Factory/Router, and user-wallet add-liquidity are real and mainnet-bound. Canonical Melega addresses match repository production bindings and were verified on-chain at block `110898799`. Liquidity Building cannot be shipped as an autonomous budget→LP product yet: there is no LB program contract/runtime, LP submit is explicitly deferred off execution-ingress, Treasury machine APIs for economic-quote/execution-authorization are not wired into this repo as durable LB bindings, and add-liquidity remains a human-wallet direct-router path. The insertion point for a Liquidity Building card is identified without inventing a new dashboard.

### 2. Repository Baseline

| Field | Value |
| --- | --- |
| Repository | MelegaSwapV2 (`package.json` name still `pancake-frontend`) |
| Branch | `main` |
| Commit SHA | `dc7a5d8b3bfdb2a5e9ec901d876655162ea4aba0` |
| Working tree | Dirty before LB001 (many unrelated modified/untracked runtime docs, env audits, KERL WIP). LB001 adds only this document. |
| Package manager | Yarn (`yarn.lock`); `package-lock.json` also present |
| Monorepo | Turbo (`turbo.json`) + `apps/web` + `packages/*` + Foundry `contracts/` |
| Stack verified | Next.js **13.0.7**; wagmi **^0.10.10**; ethers **v5 modular** (`@ethersproject/*`); React **^18.2.0**; TypeScript **^4.9.4**; Vitest; Foundry solc **0.8.20** |
| Build/test tooling | `apps/web`: `dev`/`build`/`test`/`lint`/`typechain`; root Foundry `foundry.toml`; Vercel `vercel.json` |

### 3. Relevant Repository Map

| Path | Relevance |
| --- | --- |
| `apps/web/src/pages/liquidity-studio.tsx` | Studio page entry |
| `apps/web/src/views/LiquidityStudio/**` | Studio UI + runtime hooks |
| `apps/web/src/lib/liquidity-runtime/**` | Canonical LP ownership / deferral |
| `apps/web/src/views/AddLiquidity/**` | Classic add-liquidity |
| `apps/web/src/hooks/usePairs.ts` | CREATE2 + reserves |
| `apps/web/src/hooks/useApproveCallback.ts` | Approvals |
| `apps/web/src/utils/exchange.ts` | Router contract helper |
| `apps/web/src/config/constants/exchange.ts` | Melega `ROUTER_ADDRESS` |
| `apps/web/src/config/constants/contracts.ts` | MasterChef / Vault |
| `apps/web/src/config/abi/IPancakeRouter02.json` | Router ABI |
| `packages/swap-sdk/src/constants.ts` | Melega `FACTORY_ADDRESS` + INIT_CODE_HASH |
| `packages/smart-router/evm/constants/exchange.ts` | **Stale Pancake router** on BSC |
| `apps/web/src/utils/wagmi.ts` | Wallet client |
| `apps/web/src/state/transactions/**` | Receipt polling + treasury handoff |
| `apps/web/src/lib/treasury-handoff/**` | Settlement proxy client |
| `apps/web/src/pages/api/treasury/settlement-events.ts` | Treasury proxy |
| `apps/web/src/lib/bsc-indexer/**` | Pair/event indexer |
| `apps/web/src/lib/kerl-*/**` | KERL ticket/plan/signing (swap-oriented) |
| `contracts/` + `script/` + `test/` + `foundry.toml` | Smart Router Wrapper workspace |
| `docs/` | Existing document home (this file) |

### 4. Liquidity Studio Integration Point

| Item | Evidence |
| --- | --- |
| Route | `/liquidity-studio` — `apps/web/src/pages/liquidity-studio.tsx:1-8` |
| Screen | `LiquidityStudioScreen` — `.../LiquidityStudioScreen.tsx:185-221` |
| Nav | Shell TRADE → Liquidity Studio — `apps/web/src/app-shell/config/navigation.ts:48-74` |
| Canonical owner | `liquidityRuntime` / route constant — `lib/liquidity-runtime/canonicalOwnership.ts:1-8` |
| Component tree | Header + grid: Builder, Preview, Right (Market + Advisor), Activity, TopPools, LP Info |
| **Exact card insertion** | After `AILiquidityAdvisorPanel` inside `AreaRight` — `LiquidityStudioScreen.tsx:200-207` (insert sibling `LsPanel` after line 206) |
| Primitives | Local `LsPanel` / `LsPrimaryBtn` — `components/liquidityStudioPrimitives.tsx:9-34`; shared Melega studio tokens |
| Wallet gating | `useAccount` + ConnectWalletButton vs `LsPrimaryBtn` — `useLiquidityMintRuntime.tsx` / `LiquidityBuilderPanel.tsx` |
| Chain gating | `LiquidityStudioPage.chains = SUPPORT_MULTI_CHAINS` — `liquidity-studio.tsx:6` |

Do **not** create a new dashboard or route for V1 card insertion.

### 5. Current DEX Integration

#### Factory
- Address: `0xb7E5848e1d0CB457f2026670fCb9BbdB7e9E039C` — `packages/swap-sdk/src/constants.ts:23-27`
- Runtime: CREATE2 pair address via `Pair.getAddress` — `packages/swap-sdk/src/entities/pair.ts:27-60`
- On-chain: bytecode present; `getPair(MARCO,WBNB)` → `0x7286c16c3c05d4c17b689be7948ec4fa4e861d1e`
- Reuse for LB: **YES** (pair existence / CREATE2). Risk: UI does not call live `getPair` for mint path.

#### Router
- Address: `0xc25033218D181b27D4a2944Fbb04FC055da4EAB3` — `apps/web/src/config/constants/exchange.ts:8-9`
- ABI: Pancake-compatible `IPancakeRouter02.json`
- On-chain: bytecode present; `factory()` and `WETH()` match canonical Factory/WBNB
- Reuse for LB: **YES** for `addLiquidity*` / swaps. Risk: stale Pancake router in `packages/smart-router/evm/constants/exchange.ts:10`.

#### Pair detection
- Primary UI: CREATE2 + multicall `getReserves` — `hooks/usePairs.ts:31-67`
- Indexer/KERL: `factory.getPair` eth_call — `bsc-indexer/indexer/canonicalTierPairs.ts:48-54`
- Reuse: **YES**. Risk: CREATE2 depends on correct INIT_CODE_HASH (`swap-sdk` constants).

#### Pair creation
- Mainnet UI: **no client `createPair`**; first `addLiquidity*` creates pair on-chain when missing — `AddLiquidity/index.tsx:241-276`, `useLiquidityMintRuntime.tsx:519`
- Explicit `createPair` only on **testnet** tooling — `views/TestnetLiquidity/useTestnetLiquidityRuntime.ts`
- Reuse: **extend** router-implicit create; do not assume dedicated createPair CTA on mainnet.

#### Reserve reading
- Multicall `getReserves` — `usePairs.ts:49-67`
- Indexer raw selector `0x0902f1ac` — `canonicalTierPairs.ts:57-62`

#### Swap
- Classic + Smart Router paths exist; KERL quote/signing for swaps — separate from LP mint.
- LB fee path will need a **bounded sell** path (reuse router swap), not the LP mint path alone.

#### Add liquidity (E2E)
| Step | File:lines |
| --- | --- |
| Derive amounts / validate | `state/mint/hooks.ts:63-247` |
| Pair/reserves | `hooks/usePairs.ts` via mint hooks |
| Allowance | `hooks/useTokenAllowance.ts:7-16` |
| Approve | `hooks/useApproveCallback.ts:40-115` → spender `ROUTER_ADDRESS` |
| Slippage / deadline | `utils/exchange.ts:25-32`; `hooks/useTransactionDeadline.ts:8-14`; defaults `config/constants/index.ts:13-15` |
| Router tx | `AddLiquidity/index.tsx:233-305` (`addLiquidity` / `addLiquidityETH`, recipient=`account`) |
| Studio parallel | `useLiquidityMintRuntime.tsx:232-494` |
| Receipt | `state/transactions/updater.tsx:54-78` |
| Refresh | Clear inputs / multicall remount; `addPair` local — `AddLiquidity/index.tsx:302-341` |

#### LP receipt
- LP minted to **connected wallet** (`account`); no custom recipient UI on mainnet add path — `AddLiquidity/index.tsx:259,273`.

### 6. Wallet and Transaction Architecture

| Concern | Finding | Evidence |
| --- | --- | --- |
| Provider | wagmi 0.10 client | `utils/wagmi.ts:220-339` |
| Signer | User wallet (browser); ethers v5 Contract | AddLiquidity / Studio |
| Connectors | MetaMask, Injected, Coinbase, Safe, Ledger, Trust, Blocto; WC disabled | `wagmi.ts:326-339` |
| Chain switch | `useSwitchNetwork` | `hooks/useSwitchNetwork.ts:24-44` |
| Approvals | MaxUint256 / exact via `useApproveCallback` | `useApproveCallback.ts` |
| Receipt | Polling updater | `state/transactions/updater.tsx` |
| Notifications | Transaction state + UI modals | AddLiquidity confirm modals |
| Authority findings | **Human wallet required for LP**; KERL hot signer exists as env policy but **broadcast disabled**; testnet executor private key is operator CLI only | `lpSubmitDeferral.ts:16-21`; `kerl-signing-gate`; `scripts/kerl-first-testnet-execution.ts` |

### 7. Mainnet Address Verification

Observed: chain_id **56**, block **110898799**, RPC `https://bsc-dataseed.binance.org`, UTC `2026-07-19T12:25:22Z`.

| Component | Canonical | Repository | On-chain code | Runtime binding | Verdict |
| --- | --- | --- | --- | --- | --- |
| Factory | `0xb7E584…039C` | `packages/swap-sdk/src/constants.ts:23` | present (len 21706) | CREATE2 / indexer | **MATCH** |
| Router | `0xc25033…EAB3` | `config/constants/exchange.ts:9` | present (len 35692) | `useRouterContract` | **MATCH** |
| Masterbuilder | `0x41D548…2794` | `contracts.ts:13` (`masterChef`) | present | Farms/MasterChef | **MATCH** (role = MasterChef, not LB executor) |
| Vault | `0xb2d57B…A21C` | `contracts.ts:87` (`cakeVault`) | present | Vault UI | **MATCH** (not LB fee sink by default) |
| WBNB | `0xbb4CdB…095c` | swap-sdk WNATIVE | present | wrap/native LP | **MATCH** |
| USDT | `0x55d398…7955` | tokens package | present | quote candidate | **MATCH** |
| USDC | `0x8AC76a…580d` | tokens package | present | quote candidate | **MATCH** |
| Pancake Router (stale) | n/a | `packages/smart-router/evm/constants/exchange.ts:10` = `0x10ED43…` | n/a | package map | **MISMATCH RISK** if imported for BSC |

Verified view calls: `router.factory()` → Factory; `router.WETH()` → WBNB; `factory.getPair(MARCO,WBNB)` → known pair. MasterChef responds to `owner()` selector (`0xb6eeb3…`).

### 8. Smart-Contract Workspace

| Item | Status |
| --- | --- |
| Toolchain | **Foundry** (`foundry.toml`) — Hardhat/Truffle **absent** |
| Sources | `contracts/MelegaSmartRouterWrapper.sol` + adapters/mocks |
| Tests | `test/*.t.sol` including fork tests |
| Deploy | `script/DeployMelegaSmartRouterWrapper.s.sol` |
| Verify | etherscan config in `foundry.toml` (BSC 56) |
| Frontend ABI sync | `apps/web/scripts/smart-router/publish-wrapper-abi.mjs` |
| Missing for LB | No Liquidity Building program/budget/epoch contracts; no LP-domain Foundry sources |

New LB contracts can live in this Foundry workspace **or** an external contracts repo — current workspace is wrapper-centric.

### 9. Backend, API and Runtime

| Component | Status | Evidence |
| --- | --- | --- |
| Next API | Yes (indexer, treasury proxy, KERL read APIs, pools classification) | `pages/api/**` |
| `/api/liquidity/*` | **Absent** | glob search |
| Database | Vercel Blob + JSON file for indexer; no Postgres/Supabase/Redis workers | `lib/bsc-indexer/storage` |
| Indexer | BSC logs/pairs/candles | `pages/api/indexer/*` |
| Workers/schedulers | Indexer cron auth; no LB epoch worker | `pages/api/indexer/run.ts` |
| Execution model for LP | **direct-wallet-router**; ingress unsupported | `lpSubmitDeferral.ts:16-21` |
| Receipt model | Client tx store + treasury swap handoff | `transactions/` + `treasury-handoff/` |

### 10. Treasury and Fee Settlement

| Item | Evidence |
| --- | --- |
| Base | `https://treasury.melega.ai` (docs / env) |
| DEX integration that **calls** | POST same-origin `/api/treasury/settlement-events` → `{TREASURY_RUNTIME_URL}/api/public/treasury/settlement-events` — `treasury-handoff/config.ts:1-16`, `pages/api/treasury/settlement-events.ts` |
| HTTP probes (UTC 2026-07-19T12:25:37Z) | `/api/v1/health` → **200** JSON provenance; `/api/v1/economic-quote` → **200 HTML SPA** (not machine API body); `/api/v1/execution-authorization` → **200 HTML**; `/api/v1/execution-ticket` → **200 HTML**; `/api/v1/receipt` → **400** `MISSING_BATCH_ID` (machine); `/api/public/treasury/health` → **404** |
| KERL local auth | In-memory Maps — not durable Treasury — `kerl-execution-ticket/prerequisites.ts` |
| Fee destination for LB 5% | **Not configured** in DEX as Liquidity Building fee receiver |
| Mainnet verdict | Settlement handoff path exists for **swaps**; LB success-fee settlement path **missing** |

### 11. Autonomous Execution Candidates

| Candidate | Authority | Bounds | Signer | Idempotency | Reusable | Verdict |
| --- | --- | --- | --- | --- | --- | --- |
| User wallet LP mint | User | Router + UI | Browser wallet | Tx hash | **YES** for manual ops | Not constitutional for LB autonomy |
| KERL signing gate | KERL policy | Swap packages; broadcast=false | HOT_SIGNER env | Attempt store | PARTIAL (pre-broadcast only) | **BLOCKER** for autonomous LB broadcast |
| Genesis testnet executor | Operator CLI | Testnet armed flags | `KERL_TESTNET_EXECUTOR_PRIVATE_KEY` | Script | NO for mainnet LB | Human/operator |
| wrapperExecutor | User/signer | Wrapper swaps | Injected signer | Local | Swap only | Not LP program |
| Indexer cron | Ops | Read/index | None | Chunked sync | Discovery only | Not executor |

**Evidence-based recommendation (not decision):** prefer **bounded on-chain program + permissionless/keeper trigger with non-discretionary calldata** over human hot wallets. Existing KERL gate is swap-oriented and non-broadcasting — **extend with new LB-specific on-chain bounds**, do not reuse operator private keys.

### 12. Data and Machine-Readable Models

| Reusable | Evidence |
| --- | --- |
| Zod in app | `apps/web` dep `zod` |
| Wallet portfolio contracts | `lib/wallet-portfolio/contracts.ts` |
| Indexer pair/event types | `lib/bsc-indexer/types` |
| KERL ticket/plan schemas | `melega.kerl-*.v1` |
| Capability / registry JSON | `public/registry/**` |

| Missing for LB | Notes |
| --- | --- |
| Program status / budget / epoch / fee / LP lock models | Not present as domain types |
| Source of truth for “liquidity built” | Must be on-chain events + indexer; avoid local-only metrics |

### 13. Token Compatibility

| Token behavior | Current handling | Evidence | V1 recommendation | Severity |
| --- | --- | --- | --- | --- |
| Standard ERC-20 | Supported on addLiquidity | AddLiquidity path | **Supported** | — |
| Fee-on-transfer | No FoT addLiquidity path; wrapper blocks FoT swaps | AddLiquidity; `MelegaSmartRouterWrapper.sol` FoT revert | **Reject with explicit reason** | HIGH |
| Rebasing | No dedicated detector | KERL allowlist only | **Reject unknown** | HIGH |
| Honeypot | AvengerDao risk API optional; no simulator | `pages/api/risk/**` | Optional gate; fail closed if unknown material | MEDIUM |
| Native BNB | `addLiquidityETH` | `AddLiquidity/index.tsx:250-262` | Support as quote via WBNB | — |
| Decimals | ERC20 multicall metadata | Tokens hooks | Require readable decimals | MEDIUM |

### 14. Security Findings

| Topic | Status |
| --- | --- |
| Allowance | MaxUint256 common — risk for LB budgets if reused blindly |
| Slippage | Default 50 bps; first mint uses 0 slippage mins |
| Deadline | Default 20 minutes |
| Price impact | Pair-derived; no LB epoch impact policy |
| Reentrancy | Router/pair UniV2 assumptions; LB program must add guards |
| Recipient control | LP → `account` only today; LB needs **owner-controlled LP recipient** bound on-chain |
| Authority | Human wallet for LP; KERL signer non-broadcast |
| Double execution | No LB idempotency key at program layer |
| Budget accounting | Not implemented |
| Internal-volume exclusion | Not implemented (required for Eligible Net Buy Flow later) |

### 15. End-to-End Integration Map

#### Current (verified)

| Layer | Current component | File/lines | Runtime status | Reuse for LB | Required change | Risk |
| --- | --- | --- | --- | --- | --- | --- |
| Route | `/liquidity-studio` | `pages/liquidity-studio.tsx:1-8` | Active | YES | Insert card | Low |
| Card rail | Market + Advisor | `LiquidityStudioScreen.tsx:200-207` | Active | YES | Add LB card sibling | Low |
| Wallet | wagmi account | `wagmi.ts` / Studio hooks | Active | PARTIAL | LB autonomy ≠ user wallet | HIGH |
| Token select | Studio builder | `LiquidityBuilderPanel` | Active | EXTEND | Budget token + quote | MEDIUM |
| Pair detect | CREATE2 + reserves | `usePairs.ts:31-67` | Active | YES | Prefer live getPair proof for LB | MEDIUM |
| Pair create | Implicit addLiquidity | `AddLiquidity/index.tsx:264-276` | Active | YES | Bound initial price policy | HIGH |
| Allowance | `useApproveCallback` | `useApproveCallback.ts` | Active | EXTEND | Program spender, not user router only | HIGH |
| Router call | `addLiquidity*` | `AddLiquidity/index.tsx:233-305` | Active | YES for final LP add | LB needs sell+fee+match first | HIGH |
| Tx track | transactions updater | `updater.tsx` | Active | YES | — | Low |
| Persistence | Local tx + indexer blob | indexer storage | Partial | EXTEND | Program events | HIGH |
| Treasury | Swap settlement proxy | `treasury-handoff/**` | Partial | EXTEND | LB 5% fee settlement | BLOCKER |

#### Proposed (integration points only — no code)

| Block | Classification |
| --- | --- |
| Liquidity Building card in `AreaRight` | **extend** Studio UI |
| Setup flow (budget, quote, recipient, epochs) | **new required component** |
| Program contract (budget escrow, bounds, fee, LP recipient) | **new required component** (Foundry workspace candidate) |
| DEX adapter (swap + addLiquidity Melega router) | **reuse** router ABI + addresses; **extend** adapter layer |
| Execution trigger (permissionless/keeper) | **new required** / **blocked pending** bounded executor design |
| Treasury fee settlement (5% quote) | **extend** settlement handoff; **blocked pending** durable LB authorization/quote APIs |
| On-chain events → read model | **extend** indexer |
| Active card metrics | **new required** read model (on-chain sourced) |

### 16. Mainnet Gap Register

| ID | Gap | Severity | Evidence | Required fix | Owner | Verification |
| --- | --- | --- | --- | --- | --- | --- |
| LB-G01 | No Liquidity Building domain (contracts/API/UI) | BLOCKER | Search: no `Liquidity Building` product surface; Foundry sources wrapper-only | Design UI contract then program+adapter missions | MelegaSwapV2 + Smart Contracts | Spec + empty module checklist |
| LB-G02 | LP submit deferred off execution-ingress | BLOCKER | `lpSubmitDeferral.ts:16-21` | Either dedicated LB on-chain executor or explicit ingress domain for LB | Execution Runtime | Code path that does not require human wallet |
| LB-G03 | Autonomous signer cannot broadcast | BLOCKER | KERL signing `broadcast: false`; secrets unset in env | Bounded on-chain execution without discretionary hot key, or vault signer + broadcast mission | Execution Runtime | Signing→broadcast test on testnet first |
| LB-G04 | Treasury LB fee / economic-quote not integrated as machine client | BLOCKER | Repo calls settlement-events only; `/api/v1/economic-quote` returned HTML SPA at probe | Wire durable Treasury endpoints for LB fee quote/auth/receipt; document request schemas | Treasury Runtime | HTTP 200 JSON schema contract test |
| LB-G05 | LP recipient hardcoded to connected account | HIGH | `AddLiquidity/index.tsx:259,273` | Program-enforced owner recipient | Smart Contracts | Calldata recipient == owner setting |
| LB-G06 | FoT tokens not rejected on addLiquidity | HIGH | No FoT add path; classic addLiquidity only | Explicit compatibility gate before program deposit | MelegaSwapV2 | Reject FoT in UI+contract |
| LB-G07 | Stale Pancake router in smart-router package | HIGH | `packages/smart-router/evm/constants/exchange.ts:10` | Align BSC router to Melega or isolate imports | MelegaSwapV2 | Import graph audit |
| LB-G08 | No epoch worker / Eligible Net Buy Flow | HIGH | No LB epoch scheduler | Define observation+decision runtime after program | Execution Runtime | Epoch idempotency tests |
| LB-G09 | Masterbuilder/Vault not LB fee sinks | MEDIUM | Used as MasterChef/Vault | Do not assume fee destination; ratify fee receiver via Treasury | Founder Ratification + Treasury Runtime | Address binding doc |
| LB-G10 | CREATE2-only pair detection in UI | MEDIUM | `usePairs.ts` | Cross-check `factory.getPair` for LB critical paths | MelegaSwapV2 | Dual-proof test |
| LB-G11 | Dirty unrelated working tree | LOW | `git status` many files | Keep LB commits mission-scoped | MelegaSwapV2 | Clean PR hygiene |
| LB-G12 | Baseline `tsc` fails (pre-existing) | MEDIUM | `yarn tsc` exit 1 (React types noise) | Track as baseline; do not block map | MelegaSwapV2 | Isolate LB packages |

### 17. Minimum Implementation Sequence

1. **LB002 — UI contract & domain glossary** — Objectives: card copy, states, fields, non-goals. Depends on LB001 insertion point. Repo: MelegaSwapV2 docs/UI. Reason: lock product surface before code. Mainnet impact: none.
2. **LB003 — On-chain program skeleton (Foundry)** — Budget escrow, recipient, fee bps, pause, events. Depends on fee receiver ratification. Repo: `contracts/`. Reason: authority must be on-chain. Mainnet: deploy later.
3. **LB004 — DEX adapter (swap + addLiquidity Melega)** — Reuse router/factory; no parallel DEX. Depends on LB003 interfaces. Repo: MelegaSwapV2. Mainnet: read-only first.
4. **LB005 — Studio card + read model wiring** — Insert card at `AreaRight`; display program metrics from events/indexer. Depends on LB003 events. Mainnet: views only.
5. **LB006 — Treasury success-fee settlement binding** — 5% on acquired quote; machine receipts. Depends on Treasury Runtime APIs. Repo: DEX + Treasury. Mainnet: fee path.
6. **LB007 — Bounded execution trigger** — Permissionless/keeper calling only program methods. Depends on LB003–6. Repo: Execution Runtime. Mainnet: no human hot wallet.
7. **LB008 — Epoch observation & Eligible Net Buy Flow V1** — Depends on indexer + program. Mainnet: observation then bounded sells.
8. **LB009 — Mainnet certification & monitors** — Address binding, fork tests, fee accounting proofs. Depends on all prior. Mainnet: production gate.

### 18. Commands and Tests Executed

| Command | Exit code | Result | Notes |
| --- | --- | --- | --- |
| `git branch --show-current` / `git rev-parse HEAD` / `git status --short` | 0 | `main` @ `dc7a5d8b…`; dirty tree | Baseline |
| `node` package.json version inspect | 0 | Next 13.0.7, wagmi 0.10.10 | Stack verified |
| `node` BSC `eth_chainId`/`eth_getCode`/view calls | 0 | chain 56, block 110898799, all canonical codes present | Read-only |
| `node` fetch Treasury `/api/v1/*` | 0 | health 200 JSON; quote/auth/ticket HTML; receipt 400 | Read-only |
| `yarn tsc --noEmit` (apps/web) | 1 | Pre-existing React type errors | Baseline; not fixed |
| Vitest full suite (background) | n/a / noisy | Not used as LB proof | Avoid dependency on dirty tree |

No installs, deploys, migrations, or mainnet writes.

### 19. Files Changed

`docs/LB001_LIQUIDITY_BUILDING_REPOSITORY_AUDIT.md` (this file only under LB001 authority).

### 20. Commit and Push

Filled after commit step below.

### 21. Recommended Next Mission

**LB002 — Liquidity Building UI Contract & Domain Model**  
Objective: define the Liquidity Building card states, fields, glossary, and non-goals for insertion into Liquidity Studio `AreaRight`, without implementing application code or contracts.

---

## Negative Evidence (searched, not found as LB product)

| Search | Result |
| --- | --- |
| `Liquidity Building` / `LiquidityBuilding` | No product module |
| `/api/liquidity` | Absent |
| Hardhat/Truffle | Absent |
| Supabase/Redis/BullMQ | Absent |
| Durable Treasury execution-authorization client for LB | Absent (KERL in-memory only) |
| `economic-quote` TypeScript client in DEX | Absent (HTTP returned SPA HTML) |

---

## Appendix — Critical Code Citations

Insertion point:

```200:207:apps/web/src/views/LiquidityStudio/LiquidityStudioScreen.tsx
          <AreaRight>
            <AreaMarket>
              <MarketIntelligencePanel />
            </AreaMarket>
            <AreaAdvisor>
              <AILiquidityAdvisorPanel />
            </AreaAdvisor>
          </AreaRight>
```

LP deferral:

```16:21:apps/web/src/lib/liquidity-runtime/lpSubmitDeferral.ts
export const LP_SUBMIT_DEFERRAL = {
  canonicalOwner: 'liquidityRuntime',
  canonicalRoute: '/liquidity-studio',
  submitPath: 'direct-wallet-router',
  ingressSupported: false,
  deferralReason: 'execution-ingress-unsupported-liquidity-domain',
```

Add liquidity recipient:

```264:274:apps/web/src/views/AddLiquidity/index.tsx
      estimate = routerContract.estimateGas.addLiquidity
      method = routerContract.addLiquidity
      args = [
        currencyA?.wrapped?.address ?? '',
        currencyB?.wrapped?.address ?? '',
        parsedAmountA.quotient.toString(),
        // ...
        account,
        deadline.toHexString(),
```
