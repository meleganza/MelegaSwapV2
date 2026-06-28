# Mission 13 — DEX Capability Audit

**Date:** 2026-06-28  
**Branch audited:** `mission12-user-launch-listing-layer`  
**Type:** Repository audit only — no code behavior changes  
**Verdict:** `MISSION_13_DEX_CAPABILITY_AUDIT_READY`

---

## Executive Summary

MelegaSwapV2 retains a **full legacy PancakeSwap fork** for core DEX operations (swap, liquidity, farms, pools) plus a **new constitutional registry stack** (Missions 01–12). Before any factory or write-flow mission, the repository already exposes:

| Layer | Status |
|-------|--------|
| Swap + Smart Router | **LIVE** (4 chains) |
| Add / remove liquidity | **LIVE** (4 chains) |
| Pool creation (first LP) | **LIVE** via `/add` |
| Farms (participate) | **LIVE** (4 chains) |
| Staking pools (participate) | **LIVE** (4 chains) |
| ILO / IFO | **LIVE** (BSC only) |
| Token import (local) | **PARTIAL** |
| Protocol token listing | **MISSING** |
| Farm / pool creation (user) | **MISSING** |
| Registry / launch read models | **PARTIAL** (indexed, no admin UI) |

**Recommended Mission 14:** DEX Factory Write Layer — connect Mission 12 capabilities to existing LIVE flows first; define governance ops for farm/pool allocation; never duplicate router, MasterChef, or wallet surfaces.

Machine manifest: `/registry/capabilities/dex-capability-audit.json`

---

## Audit Method

1. Route inspection (`apps/web/src/pages/`)
2. View and state layer tracing
3. Config inspection (`supportChains.ts`, `lists.ts`, `ifo.ts`, registry modules)
4. Cross-reference with Mission 12 User Launch read model
5. Read-only inspection of forbidden surfaces (not modified)

---

## Capability Matrix

| # | Capability | Status | Route | Reusable | Risk |
|---|------------|--------|-------|----------|------|
| 1 | Token listing | PARTIAL | `/swap` (import) | Yes | medium |
| 2 | Token metadata / logo submission | MISSING | — | No | medium |
| 3 | Token list management | CONFIG_ONLY | — | Yes | high |
| 4 | Add liquidity | LIVE | `/add` | Yes | low |
| 5 | Remove liquidity | LIVE | `/remove` | Yes | low |
| 6 | Create liquidity pool | LIVE | `/add` | Yes | low |
| 7 | Create farm | MISSING | `/farms` (browse) | Yes | **critical** |
| 8 | Farm configuration | CONFIG_ONLY | — | Yes | high |
| 9 | Create staking pool | MISSING | `/pools` (browse) | Yes | **critical** |
| 10 | Pool configuration | CONFIG_ONLY | — | Yes | high |
| 11 | ILO / launch flow | LIVE | `/ilo`, `/launch`, `/new-project` | Yes | medium |
| 12 | NFT routes | LIVE | `/nft`, `/viewNFTs`, `/nftmarket` | Yes | low |
| 13 | Swap routing | LIVE | `/swap` | Yes | **critical** |
| 14 | Smart router usage | LIVE | `/swap` (toggle) | Yes | **critical** |
| 15 | Wallet integration | LIVE | global | Yes | **critical** |
| 16 | Chain support | LIVE | per-page `.chains` | Yes | medium |
| 17 | Admin / config flows | PARTIAL | registry routes | Yes | medium |

---

## Detailed Findings

### 1. Token listing — PARTIAL

- **Files:** `components/SearchModal/ImportToken.tsx`, `ManageTokens.tsx`, `state/user/hooks/useUserAddedTokens.ts`, `registry/assets/`
- **Route:** Import via swap currency modal
- **Contract:** ERC-20/BEP-20 on-chain (user-supplied address)
- **Config:** Bundled token list JSON; asset registry for MARCO discovery
- **Availability:** Users import tokens into local session. No protocol listing submission.
- **Reuse:** Yes — import flow is production
- **Extension:** Yes — needs Labs/list governance pipeline
- **Risk:** medium
- **Next:** Wire Mission 12 `submit_token_metadata` to real governance, not local import

### 2. Token metadata / logo submission — MISSING

- **Files:** `components/Logo/`, `lib/user-launch/launch-read-model.ts`
- **Route:** None
- **Contract:** None
- **Config:** Logos from `@pancakeswap/tokens` + bundled JSON
- **Availability:** No upload UI
- **Reuse:** No
- **Extension:** Yes
- **Risk:** medium
- **Next:** Define Labs → CDN → list ingestion before UI

### 3. Token list management — CONFIG_ONLY

- **Files:** `config/constants/lists.ts`, `tokenLists/*.json`, `state/lists/`
- **Route:** None (runtime list state only)
- **Contract:** None
- **Config:** `OFFICIAL_LISTS = []`, `DEFAULT_ACTIVE_LIST_URLS = []` — remote lists disabled
- **Availability:** Bundled JSON + user imports only
- **Reuse:** Yes
- **Extension:** Yes — list governance undefined
- **Risk:** high
- **Next:** Decide Melega-curated vs remote list strategy

### 4. Add liquidity — LIVE

- **Files:** `pages/add/[[...currency]].tsx`, `views/AddLiquidity/`, `state/mint/`
- **Route:** `/add`
- **Contract:** V2 Router + Factory; StableSwap for stable pairs
- **Config:** `exchange.ts` ROUTER_ADDRESS; `SUPPORT_MULTI_CHAINS`
- **Availability:** Live 4-chain, wallet required, real on-chain
- **Reuse:** Yes — Mission 12 already links here
- **Extension:** No
- **Risk:** low

### 5. Remove liquidity — LIVE

- **Files:** `pages/remove/[[...currency]].tsx`, `views/RemoveLiquidity/`, `state/burn/`
- **Route:** `/remove`
- **Contract:** V2 Router + LP pairs
- **Config:** `exchange.ts`
- **Availability:** Live 4-chain
- **Reuse:** Yes
- **Extension:** No
- **Risk:** low

### 6. Create liquidity pool — LIVE

- **Files:** `views/AddLiquidity/ChoosePair.tsx`, `state/mint/hooks.ts`
- **Route:** `/add` (first liquidity creates pair)
- **Contract:** Factory.createPair implicit
- **Config:** `exchange.ts` FACTORY_ADDRESS
- **Availability:** Same as add liquidity — no separate wizard
- **Reuse:** Yes — Mission 12 `create_pool` → `/add` is correct
- **Extension:** No
- **Risk:** low

### 7. Create farm — MISSING

- **Files:** `views/Farms/`, `packages/farms/`, `lib/user-launch/`
- **Route:** `/farms` (participate only)
- **Contract:** MasterChef (protocol-governed)
- **Config:** `@pancakeswap/farms`, `contracts.ts` masterChef
- **Availability:** No user farm deploy. Mission 12 BLOCKED.
- **Reuse:** Yes — participate flow
- **Extension:** Yes — governance ops required
- **Risk:** **critical**
- **Next:** Mission 14 ops layer — never fake user farm deploy

### 8. Farm configuration — CONFIG_ONLY

- **Files:** `packages/farms/`, `state/farms/`, `config/constants/lpAprs/`
- **Route:** None
- **Contract:** MasterChef per chain
- **Config:** Package farm definitions
- **Availability:** Code deploy only
- **Reuse:** Yes
- **Extension:** Yes
- **Risk:** high

### 9. Create staking pool — MISSING

- **Files:** `views/Pools/`, `config/constants/pools.tsx`, `state/pools/`
- **Route:** `/pools` (participate only)
- **Contract:** Sous Chef / SmartChef / CakeVault
- **Config:** `pools.tsx` static definitions
- **Availability:** No user pool creation
- **Reuse:** Yes — stake/harvest flow
- **Extension:** Yes
- **Risk:** **critical**

### 10. Pool configuration — CONFIG_ONLY

- **Files:** `config/constants/pools.tsx`, `views/Pools/`
- **Route:** None
- **Contract:** Sous Chef per pool entry
- **Config:** Static sousId, addresses, tokens
- **Availability:** Code deploy only
- **Reuse:** Yes
- **Extension:** Yes
- **Risk:** high

### 11. ILO / launch flow — LIVE

- **Files:** `pages/ilo.tsx`, `views/Ilos/`, `config/constants/ifo.ts`, `pages/launch/`, `pages/new-project/`
- **Route:** `/ilo` (BSC IFO), `/launch` (read-model), `/new-project` (activation)
- **Contract:** IFO contracts via ifo.ts
- **Config:** ifosConfig; user-launch; economic-activation
- **Availability:** Legacy IFO live BSC; Labs handoff planned
- **Reuse:** Yes
- **Extension:** Yes — bridge IFO with Labs
- **Risk:** medium

### 12. NFT routes — LIVE

- **Files:** `pages/nft/`, `viewNFTs.tsx`, `nftmarket.tsx`, `contracts.ts` (Nft)
- **Route:** `/nft`, `/viewNFTs`, `/nftmarket`
- **Contract:** BSC NFT contracts
- **Config:** `SUPPORT_CHAIN_NFT` = BSC
- **Availability:** Mint BSC-only; view/market broader
- **Reuse:** Yes
- **Extension:** No (out of factory scope)
- **Risk:** low

### 13. Swap routing — LIVE

- **Files:** `views/Swap/`, `state/swap/`, `config/constants/exchange.ts`
- **Route:** `/swap`
- **Contract:** V2 Router, pairs, StableSwap
- **Config:** exchange.ts — **forbidden modification surface**
- **Availability:** Production swap on 4 chains
- **Reuse:** Yes
- **Extension:** No
- **Risk:** **critical**

### 14. Smart router usage — LIVE

- **Files:** `views/Swap/SmartSwap/`, `config/abi/pancakeSwapSmartRouter.json`
- **Route:** `/swap` (optional toggle)
- **Contract:** Smart Router per chain
- **Config:** SMART_ROUTER_ADDRESS in exchange.ts
- **Availability:** Auto-better path with V2 fallback
- **Reuse:** Yes
- **Extension:** No
- **Risk:** **critical**
- **Note:** Separate from Mission 10 illustrative execution read model

### 15. Wallet integration — LIVE

- **Files:** `utils/wagmi.ts`, `components/WalletModal/`, `_app.tsx`
- **Route:** Global
- **Contract:** None
- **Config:** wagmi connectors — **forbidden modification surface**
- **Availability:** MetaMask, WC, Trust, Coinbase, Binance, Blocto, Ledger, Safe
- **Reuse:** Yes
- **Extension:** No
- **Risk:** **critical**

### 16. Chain support — LIVE

- **Files:** `supportChains.ts`, `wagmi.ts`, `NetworkModal.tsx`
- **Chains:** 1 (ETH), 56 (BSC), 137 (Polygon), 8453 (Base)
- **BSC-only:** ILO, NFT mint, Zap, `/find`
- **Reuse:** Yes
- **Extension:** Yes — align with Mission 11 presence
- **Risk:** medium

### 17. Admin / config-driven flows — PARTIAL

- **Files:** `registry/`, `lib/economic-*`, `lib/smart-execution/`, `lib/user-launch/`, `Menu/config/`
- **Routes:** `/projects`, `/assets`, `/venues`, `/events`, `/presence`, `/graph`, `/query`, `/execution`, `/launch`, `/new-project`
- **Contract:** None (read models)
- **Config:** Static registry + manifest writers
- **Availability:** No `/admin`. Registry explorers + launch console.
- **Reuse:** Yes
- **Extension:** Yes
- **Risk:** medium

---

## Highest-Risk Gaps

1. **create_farm** — MasterChef allocation is governance-only; fake UI would mislead users
2. **create_staking_pool** — pools.tsx is static; no user deploy path
3. **token_list_management** — remote lists disabled; listing governance undefined
4. **swap_routing / smart_router** — production-critical; must not be touched by factory missions
5. **wallet_integration** — production-critical forbidden surface

---

## Reusable Existing Flows

| Flow | Route | Mission 12 mapping |
|------|-------|-------------------|
| Add liquidity | `/add` | `create_liquidity` AVAILABLE_EXISTING_FLOW |
| Create pool | `/add` | `create_pool` AVAILABLE_EXISTING_FLOW |
| Remove liquidity | `/remove` | (not in launch console — add if needed) |
| Swap | `/swap` | (execution read-model separate) |
| Farms | `/farms` | `create_farm` BLOCKED → browse only |
| Staking pools | `/pools` | `create_staking_pool` PLANNED → participate |
| ILO | `/ilo` | legacy launch (BSC) |
| Activation | `/new-project` | `activate_economic_presence` LIVE |
| Launch console | `/launch` | capability matrix |
| Token import | swap modal | local session only |

---

## Forbidden Surfaces — Confirmed Untouched

This audit did **not** modify:

- `apps/web/src/config/constants/exchange.ts`
- `apps/web/src/config/constants/contracts.ts`
- `apps/web/src/config/constants/pools.tsx`
- `apps/web/src/utils/wagmi.ts`
- Token lists (`config/constants/tokenLists/`, `lists.ts`)
- Swap/router business logic (`views/Swap/SmartSwap/`, `state/swap/`)
- MasterChef / farms business logic (`views/Farms/`, `state/farms/`)
- Wallet integration (`components/WalletModal/`, `wagmi.ts`)

---

## Recommended Mission 14

**DEX Factory Write Layer**

1. Map Mission 12 capabilities to audited LIVE routes (no duplication)
2. Define governance ops workflow for farm/pool allocation (off-chain + config deploy)
3. Build token list submission pipeline (Labs → metadata → list JSON)
4. Keep router, MasterChef, pools.tsx, wagmi as consumption-only dependencies
5. Extend registry to reflect new venues/events when ops adds farms/pools

---

## Artifacts

| Artifact | Path |
|----------|------|
| This document | `docs/MISSION_13_DEX_CAPABILITY_AUDIT.md` |
| Machine manifest | `apps/web/public/registry/capabilities/dex-capability-audit.json` |
| Audit library | `apps/web/src/lib/dex-capability-audit/` |
| Generator | `apps/web/scripts/write-dex-capability-audit.ts` |

Regenerate manifest: `npx tsx apps/web/scripts/write-dex-capability-audit.ts`
