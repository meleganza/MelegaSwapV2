# MelegaSwapV2 — Phase 1 Repository Audit Report

**Repository:** [meleganza/MelegaSwapV2](https://github.com/meleganza/MelegaSwapV2/)  
**Audit date:** 2026-06-26  
**Scope:** Read-only inspection for safe “Melega DEX” frontend restyle  
**Code modified during audit:** None

---

## Executive summary

MelegaSwapV2 is a **Yarn + Turborepo monorepo** forked from PancakeSwap frontend (`pancake-frontend`). The production app lives in `apps/web` (Next.js 13, pages router). Core DeFi behavior is driven by **`@pancakeswap/*` workspace packages** (SDK, farms, tokens, smart-router, multicall, wagmi adapters).

The UI is already partially rebranded to **Melega** (meta titles, logo path, MARCO token), but many **PancakeSwap / MelegaSwap** strings, assets, and package names remain. A Phase 1 restyle can proceed as **frontend-only** work without touching on-chain addresses or farm/pool/LP configs.

**Pre-existing config risks** (documented, not introduced by restyle): stale router constants in `packages/smart-router`, possible Ethereum factory address collision with Base MasterChef, and ILO wired to live `ifov3` contract on BSC.

---

## 1. Stack identification

| Area | Finding |
|------|---------|
| **Monorepo** | Turborepo 1.7 + Yarn workspaces (`apps/*`, `packages/*`) |
| **Primary app** | `apps/web` only (README references aptos/blog apps not present in repo) |
| **Framework** | Next.js **13.0.7** (pages router), React **18.2** |
| **Language** | TypeScript **4.9** |
| **Package manager** | **Yarn** (Volta pins Node **16.18.0**; README suggests Node 18) |
| **Styling** | styled-components 5, `@vanilla-extract` (`packages/ui`), `@pancakeswap/uikit` |
| **State** | Redux Toolkit, jotai, SWR, redux-persist |
| **Build / dev** | Root: `yarn dev`, `yarn build`, `yarn start` (turbo filters `web`) |
| **App build** | `apps/web`: `next dev`, `next build`, `next start` |
| **Tests** | Vitest (app + packages), lint via ESLint/stylelint |
| **ABI codegen** | typechain → `apps/web/src/config/abi/types` (postinstall) |

### Routing structure (Next.js pages)

| Route | Module | Status |
|-------|--------|--------|
| `/` | Home | Active |
| `/swap` | Swap (SmartSwap + StableSwap) | Active |
| `/liquidity`, `/add/*`, `/remove/*`, `/find` | Liquidity | Active |
| `/farms`, `/farms/history` | Farms | Active |
| `/pools`, `/pools/history` | Pools (sousChef + vaults) | Active |
| `/ilo` | ILO (IFO v3 contract UI) | Active (BSC-gated) |
| `/nft`, `/viewNFTs`, `/nftmarket` | NFT mint / wallet / market | Active (BSC-gated) |
| `/info/*` | Analytics / subgraph info | Pages exist; **menu entry commented out** |
| `/451` | Geo-block page | Active (middleware) |
| `/_mp/farms`, `/_mp/pools` | Mobile-optimized layouts | Present |
| Bridge views | `apps/web/src/views/Bridge/` | **No `/bridge` page**; menu commented out |

### Web3 libraries

| Library | Role |
|---------|------|
| **wagmi 0.10** + **ethers v5** | Wallet connect, providers, signers |
| **`@pancakeswap/sdk`** (`packages/swap-sdk`) | ChainId, pairs, trades, factory/init hash |
| **`@pancakeswap/smart-router`** | Route discovery, stable swap, V2 fallback |
| **`@pancakeswap/multicall`** | Multicall2/3 batch reads |
| **`@pancakeswap/wagmi`** | Binance / Blocto / Trust connectors |
| **typechain** | Typed contract bindings |

### Config file locations

| Config | Primary path(s) |
|--------|-----------------|
| **Chain IDs enum** | `packages/swap-sdk/src/constants.ts` |
| **Wagmi chains (active wallet networks)** | `apps/web/src/utils/wagmi.ts` |
| **Feature chain gating** | `apps/web/src/config/constants/supportChains.ts` |
| **Router (swap / LP — canonical)** | `apps/web/src/config/constants/exchange.ts` |
| **Smart router (BSC only)** | `apps/web/src/views/Swap/SmartSwap/utils/exchange.ts` |
| **Factory + init code hash** | `packages/swap-sdk/src/constants.ts` |
| **Stale smart-router exchange constants** | `packages/smart-router/evm/constants/exchange.ts` ⚠️ |
| **All contract address maps** | `apps/web/src/config/constants/contracts.ts` |
| **Address getters** | `apps/web/src/utils/addressHelpers.ts` |
| **Token definitions** | `packages/tokens/src/{chainId}.ts`, `common.ts` |
| **Default token list JSON** | `apps/web/src/config/constants/tokenLists/pancake-default.tokenlist.json` |
| **Token list URLs / merge logic** | `apps/web/src/config/constants/lists.ts`, `apps/web/src/state/lists/hooks.ts` |
| **Farm configs** | `packages/farms/constants/{chainId}.ts` |
| **MasterChef map (farms pkg)** | `packages/farms/src/const.ts` |
| **Pool / sousChef configs** | `apps/web/src/config/constants/pools.tsx` |
| **ILO legacy IFO list** | `apps/web/src/config/constants/ifo.ts` (not used by live ILO UI) |
| **ILO live contract** | `contracts.ts` → `ifov3`, read via `useGetPublicIfoData` |
| **Multicall addresses** | `packages/multicall/index.ts` |
| **RPC overrides** | `apps/web/src/utils/wagmi.ts`, `NEXT_PUBLIC_NODE_PRODUCTION` |
| **Subgraph / info endpoints** | `apps/web/src/config/constants/endpoints.ts` |
| **Menu / navigation** | `apps/web/src/components/Menu/config/config.ts` |
| **SEO / meta** | `apps/web/next-seo.config.ts`, `apps/web/src/config/constants/meta.ts` |
| **Theme / colors** | `packages/ui/css/vars.css.ts`, `packages/ui/tokens/` |

### Wallet connectors (active)

MetaMask, Injected, Coinbase Wallet, Binance Wallet, Blocto, Ledger, Trust Wallet, Gnosis Safe. **WalletConnect is commented out** in `wagmi.ts`.

---

## 2. Active chains vs. legacy configs

### Wallet-enabled chains (`apps/web/src/utils/wagmi.ts`)

| chainId | Network |
|--------:|---------|
| 56 | BNB Smart Chain |
| 8453 | Base |
| 137 | Polygon |
| 1 | Ethereum |

### Feature-supported chains (`supportChains.ts`)

| Feature | chainIds |
|---------|----------|
| Multi-chain / farms | 1, 56, 8453, 137 |
| ILO | 56 only |
| NFT | 56 only |
| Zap | 56 only |

### Farm config files present (including non-wallet chains)

| chainId | File | ~Farm entries (`pid:`) |
|--------:|------|------------------------|
| 1 | `packages/farms/constants/1.ts` | 5 |
| 56 | `packages/farms/constants/56.ts` | 385 |
| 137 | `packages/farms/constants/137.ts` | 53 |
| 8453 | `packages/farms/constants/8453.ts` | 30 |
| 42161 | `packages/farms/constants/42161.ts` | 14 |
| 148 | `packages/farms/constants/148.ts` | 9 |

Arbitrum (42161) and Shimmer2 (148) have farm configs and MasterChef entries in `contracts.ts` but are **not** in the active wagmi chain list.

---

## 3. Feature map

### Active user-facing modules

| Module | Entry | Contract dependency |
|--------|-------|---------------------|
| **Swap** | `/swap` | Router, factory, pairs, optional smart router + stable swap (BSC) |
| **Liquidity** | `/liquidity`, `/add`, `/remove` | Router, factory, LP tokens |
| **Farms** | `/farms` | MasterChef, LP pairs, MARCO rewards |
| **Pools** | `/pools` | sousChef per pool, cakeVault, flexible vault |
| **ILO** | `/ilo` | **ifov3** contract (on-chain dynamic presale) |
| **NFT** | `/nft`, `/viewNFTs`, `/nftmarket` | Nft, nftmarket, dragonNft contracts (BSC) |
| **Home** | `/` | Mostly frontend; links to ILO |
| **Chart** | External (Coingecko, Dex Guru) | None |
| **Wallet** | Global menu | wagmi connectors |
| **Token lists** | Swap / search modals | Local JSON + optional remote lists (currently empty URLs) |
| **Analytics / Info** | `/info/*` | TheGraph / BitQuery (Pancake-origin endpoints) |

### Present but inactive / obsolete in navigation

| Module | Notes |
|--------|-------|
| **Bridge** | Full view under `views/Bridge/`; no page route; `bridge` contract in `contracts.ts` |
| **IFO (legacy)** | `ifo.ts` Pancake-era configs; **not** driving `/ilo` |
| **Prediction, Lottery, Voting, Teams, Profile** | Commented menu / no routes |
| **Limit orders** | Gelato dependency present; route commented |
| **Game / Flip / Dice** | Commented |
| **Presale / Launchpad / Multisender / KYC** | Commented |

### ILO isolation assessment

- Live ILO reads **`ifov3`** at `0xabB5176ad486019fb0F7564d9F7C9510999c779A` (BSC) via multicall (`useGetPublicIfoData`).
- Does **not** depend on swap router/factory for rendering; contributions use dedicated IFO UI + contract.
- **Hiding ILO from menu** is frontend-safe; **removing** the module should wait until product confirms no active sale on `ifov3`.

---

## 4. Risk classification

| Change area | Classification | Notes |
|-------------|----------------|-------|
| Logo, favicon, `/images/logo.png` | **SAFE_FRONTEND_ONLY** | `LogoWithText.tsx` already points here |
| `next-seo`, `meta.ts`, page titles | **SAFE_FRONTEND_ONLY** | Partially Melega already |
| Home copy (`MelegaSwap` → `Melega DEX`) | **SAFE_FRONTEND_ONLY** | `views/Home/components/SalesSection/data.ts`, etc. |
| Menu labels, footer, help email | **SAFE_FRONTEND_ONLY** | |
| Theme colors (`packages/ui/css/vars.css.ts`) | **SAFE_FRONTEND_ONLY** | KIRI-aligned palette OK |
| Localization JSON (`public/locales/*`) | **SAFE_FRONTEND_ONLY** | Large surface; search-replace with care |
| Coinbase `appName: 'PancakeSwap'` in wagmi | **SAFE_FRONTEND_ONLY** | Wallet display string only |
| `@pancakeswap/*` package names | **DO_NOT_TOUCH** (Phase 1) | Renaming breaks imports; out of scope |
| `ROUTER_ADDRESS` in `exchange.ts` | **CONTRACT_CRITICAL** | Do not change |
| `SMART_ROUTER_ADDRESS` (BSC) | **CONTRACT_CRITICAL** | Do not change |
| `FACTORY_ADDRESS_MAP` / `INIT_CODE_HASH_MAP` | **CONTRACT_CRITICAL** | Do not change |
| `contracts.ts` (all addresses) | **CONTRACT_CRITICAL** | Do not change |
| `packages/farms/constants/*` | **CONTRACT_CRITICAL** | LP addresses, pids, tokens |
| `pools.tsx` sousChef / vault addresses | **CONTRACT_CRITICAL** | Do not change |
| `pancake-default.tokenlist.json` | **CONFIG_SENSITIVE** | Token addresses must stay; name/logoURI may change |
| `packages/tokens/src/*` | **CONFIG_SENSITIVE** | Addresses immutable; symbols/names cosmetic only |
| `supportChains.ts` | **CONFIG_SENSITIVE** | Gating only; changing can hide features |
| `wagmi.ts` chain list / RPCs | **CONFIG_SENSITIVE** | Affects wallet network support |
| `packages/smart-router/.../exchange.ts` | **DO_NOT_TOUCH** | Stale Pancake defaults; not canonical; risky to edit without swap QA |
| ILO `/ilo` route + `ifov3` | **CONTRACT_CRITICAL** | Live presale contract |
| NFT routes + contracts | **CONTRACT_CRITICAL** | Active BSC feature |
| Subgraph URLs (`endpoints.ts`) | **CONFIG_SENSITIVE** | Analytics only; Pancake-origin |
| `middleware.ts` geo block | **CONFIG_SENSITIVE** | Compliance |
| `BLOCKED_ADDRESSES` (OFAC) | **DO_NOT_TOUCH** | Compliance |

---

## 5. Branding state (current)

| Asset / string | Current value |
|----------------|---------------|
| SEO default title | `Melega` |
| Meta suffix | `MelegaExchange` |
| Logo component | `/images/logo.png` (alt: Melega) |
| Home hero copy | Still says **MelegaSwap** in multiple places |
| Native reward token | **MARCO** (BSC `0x963556de0eb8138E97A85F0A86eE0acD159D210b`) |
| Package scope | Still `@pancakeswap/*` internally |
| README title | MelegaSwap Frontend |
| Coinbase connector | `appName: 'PancakeSwap'` |

---

## 6. Known pre-existing technical notes

1. **Dual router config:** Canonical routers live in `apps/web/src/config/constants/exchange.ts`. `packages/smart-router/evm/constants/exchange.ts` still lists PancakeSwap BSC router `0x10ED43C718714eb63d5aA57B78B54704E256024E` — differs from Melega BSC router `0xc25033218D181b27D4a2944Fbb04FC055da4EAB3`.
2. **Ethereum factory address** in SDK (`0x149EE9245E5eD52a89Ea777d19AD3A5D87873680`) matches **Base MasterChef** in `contracts.ts`, not Ethereum MasterChef (`0x585364c747CaF6cF6441656F803796230fb1d61c`). Documented for preservation; **do not “fix” during restyle** without on-chain verification.
3. **Info subgraphs** still point to PancakeSwap TheGraph names — info pages work only if those subgraphs index Melega contracts (verify separately).
4. **Remote token lists** (`lists.ts`) are empty arrays; app relies on bundled `pancake-default.tokenlist.json`.

---

## 7. Packages inventory

```
apps/web
packages: capital, farms, hooks, localization, multicall, smart-router,
          swap-sdk, swap-sdk-core, token-lists, tokens, ui, ui-wallets,
          uikit, utils, wagmi, worker-utils, eslint-config, tsconfig
```

---

## 8. Audit verdict

```
MELEGASWAPV2_AUDIT_READY_FOR_SAFE_RESTYLE
```

Phase 1 may proceed with **visible rebrand only** (MelegaSwap → Melega DEX, KIRI-aligned styling, copy, SEO, assets). No blockers prevent starting restyle work. Follow `CONTRACT_PRESERVATION_MAP.md` and `PHASE_1_SAFE_RESTYLE_PLAN.md` for execution guardrails.

**Non-blocking follow-ups (post–Phase 1):** router constant deduplication QA, factory address verification on Ethereum, info subgraph health check, ILO product decision.
