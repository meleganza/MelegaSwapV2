# Contract Preservation Map — MelegaSwapV2

**Purpose:** Frozen reference of all on-chain addresses and config sources detected in the repository.  
**Rule:** Phase 1 restyle must **not** modify any address, pid, LP pair, init code hash, or reward logic encoded here.

**Canonical sources:**
- Routers: `apps/web/src/config/constants/exchange.ts`, `apps/web/src/views/Swap/SmartSwap/utils/exchange.ts`
- Factory / init hash: `packages/swap-sdk/src/constants.ts`
- Contracts map: `apps/web/src/config/constants/contracts.ts`
- MasterChef (farms): `packages/farms/src/const.ts` + `contracts.ts`
- Multicall: `packages/multicall/index.ts`
- Tokens (MARCO): `packages/tokens/src/common.ts`
- Farms: `packages/farms/constants/{chainId}.ts`
- Pools: `apps/web/src/config/constants/pools.tsx`

---

## Chain 1 — Ethereum

| Role | Address |
|------|---------|
| **chainId** | 1 |
| **Router** | `0xFF8EBf8edf1C533A02d066f852788773BdCD631C` |
| **Factory** | `0x149EE9245E5eD52a89Ea777d19AD3A5D87873680` ⚠️ |
| **Init code hash** | `0x70bab120b879463f253c7412d8c12623f1aa971a04d97ba3ffd0e5f5c42e1405` |
| **WETH (native wrapper)** | `0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2` |
| **MARCO** | `0x5911Dc98a9E1A4FfFD802C3A57cdA6bbd26Cdb76` |
| **MRT (syrup)** | `0x816ddF4e751dfE6A5e65837F721C5fD971108eDE` |
| **MasterChef** | `0x585364c747CaF6cF6441656F803796230fb1d61c` |
| **cakeVault** | `0x4C11221D39FcE56D12E46deC799F73029859B974` |
| **Multicall** | `0xcA11bde05977b3631167028862bE2a173976CA11` |
| **nonBSC vault** | `0x2e71B2688019ebdFDdE5A45e6921aaebb15b25fb` |

### Farms (`packages/farms/constants/1.ts`) — 5 pools

| pid | LP / symbol | LP address |
|----:|-------------|------------|
| 0 | MARCO (token-only) | `0x5911Dc98a9E1A4FfFD802C3A57cdA6bbd26Cdb76` |
| 1 | MARCO-WETH LP | `0x7f0183D7C1B0365A3580ecBdB2f0D8DB2D693c5E` |
| 2 | USDC-WETH LP | `0x15F6b6B609Cc2e3d8E4a355c76C99B3956954664` |
| 3 | LOCO-WETH LP | `0x2ee39e16735B194006739C79785EF6F20ADBB007` |
| 4 | RKIT-WETH LP | `0xD3871eDa34472Dd428B24d9A5051f9665D73E1C5` |

### Live pools (`livePools1`) — 3 entries

Includes sousId 0 (MARCO→MARCO on MasterChef) and sousId 1 (MARCO→LOCO on `0x7bEF06FbF542B928bB3C70981d5667e81cB95c36`).

---

## Chain 56 — BNB Smart Chain (primary)

| Role | Address |
|------|---------|
| **chainId** | 56 |
| **Router (V2)** | `0xc25033218D181b27D4a2944Fbb04FC055da4EAB3` |
| **Smart router** | `0xC6665d98Efd81f47B03801187eB46cbC63F328B0` |
| **Factory** | `0xb7E5848e1d0CB457f2026670fCb9BbdB7e9E039C` |
| **Init code hash** | `0x5547397b1a1ae1e97b89728e7a77fdc2a6b167647566f81793b3b72fb8fde0f5` |
| **WBNB** | `0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c` |
| **MARCO** | `0x963556de0eb8138E97A85F0A86eE0acD159D210b` |
| **MRT (syrup)** | `0x69Df07E21484c9b64EB4dE08494d6e6C2aa63491` |
| **MasterChef** | `0x41D5487836452d23f2c467070244E5842B412794` |
| **sousChef (pid 0 pool)** | `0x6ab8463a4185b80905e05a9ff80a2d6b714b9e95` (also used as default sousChef ref) |
| **cakeVault** | `0xb2d57B1A40E61AAb3F88361228E1188E0fB6A21C` |
| **cakeFlexibleSideVault** | `0x615e896A8C2CA8470A2e9dc2E9552998f8658Ea0` |
| **iCake** | `0x3C458828D1622F5f4d526eb0d24Da8C4Eb8F07b1` |
| **Zap** | `0xD4c4a7C55c9f7B3c48bafb6E8643Ba79F42418dF` |
| **Stable swap info** | `0xa680d27f63Fa5E213C502d1B3Ca1EB6a3C1b31D6` |
| **ifov3 (ILO)** | `0xabB5176ad486019fb0F7564d9F7C9510999c779A` |
| **Nft** | `0x2A0356b52d33c5e359eF289B8Da37eD73A6C9CE5` |
| **nftmarket** | `0xCE00744CC00C10B81C33c59Cc5a4a6A2abD68cc3` |
| **dragonNftcrane** | `0x5bAe04d049B5f94B6a86478D478E36bfB9BCC818` |
| **nftstakingcrane** | `0x23e70F1dc70024e6622E81E9192a8A093BB8a737` |
| **Multicall** | `0xcA11bde05977b3631167028862bE2a173976CA11` |

### Farms (`packages/farms/constants/56.ts`) — 385 pid entries

First entries (preserve order and addresses):

| pid | LP symbol | LP address |
|----:|-----------|------------|
| 0 | MARCO | `0x963556de0eb8138E97A85F0A86eE0acD159D210b` |
| 1 | MARCO-BNB LP | `0x7286c16c3c05d4c17B689bE7948Ec4Fa4e861d1E` |
| 2 | BUSD-BNB LP | `0x564863b0267d9fed9c7d414113d7dd60cf4b253e` |
| 3 | GIOTTO-BNB LP | `0x443f2e9A5877e2896d1248288c73AA6B7402fbBe` |
| … | *(382 additional farms in file)* | *(see file)* |

### Live pools (`livePools56`) — 163 sousChef pools

Default export merges `livePools56` + `finishedPools`. Each entry has per-chain `contractAddress` map — **full list in `pools.tsx`**.

---

## Chain 137 — Polygon

| Role | Address |
|------|---------|
| **chainId** | 137 |
| **Router** | `0x64935e2A3d8F3840445fB2DdF37FBBfc3b292EFe` |
| **Factory** | `0x2541DBEa199a22501D75EA141627776Bd4EefC80` |
| **Init code hash** | `0x8c114e6d042bd14975f9a4dfbeb0c15c35a0b30acf8e0bd3432b551b131c46b1` |
| **WMATIC (WNATIVE)** | `0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270` |
| **MARCO** | `0xD3e28c74177B812d1543A406aD1A97ee3C398AC2` |
| **MRT (syrup)** | `0x83A2af056bd05758d5BC704a6Cc7166769E9c939` |
| **MasterChef** | `0x130d2BD998767B6091352dd71fEABa4460846D94` |
| **cakeVault** | `0xd70bff1e6354c49adff9b0c9608364dcd2d5deb6` |
| **bridge** | `0x7a6c09B4852a7FbD96CA7282B793184f2BCbB1D7` |
| **Multicall** | `0xcA11bde05977b3631167028862bE2a173976CA11` |

### Farms — 53 pid entries

| pid | LP symbol | LP address |
|----:|-----------|------------|
| 0 | MARCO | `0xD3e28c74177B812d1543A406aD1A97ee3C398AC2` |
| 1 | MARCO-MATIC LP | `0xD072576d3FD16f7112d11E4c7DA394939eC8c970` |
| 2 | USDT-MATIC LP | `0x762a784E1906E5d630d8C46883eA03c0cbF486A8` |
| … | *(50 more in file)* | |

### Live pools (`livePools137`) — 17 entries

---

## Chain 8453 — Base

| Role | Address |
|------|---------|
| **chainId** | 8453 |
| **Router** | `0x1B30D21354a082EeBC66c4C5E56320759f7994e5` |
| **Factory** | `0x78fA7Fa39CF6544DD9768A75d8Ad8C45854aE530` |
| **Init code hash** | `0x1e6e24914b2abfdd5ec33609095c9b570a9e1dc137992c0995bb45f57cf1932a` |
| **WETH** | `0x4200000000000000000000000000000000000006` |
| **MARCO** | `0x56e46bE7714550A4Cb7bD0863BaB2680c099d8d7` |
| **MRT (syrup)** | `0x816ddF4e751dfE6A5e65837F721C5fD971108eDE` |
| **MasterChef** | `0x149EE9245E5eD52a89Ea777d19AD3A5D87873680` |
| **cakeVault** | `0xFF8EBf8edf1C533A02d066f852788773BdCD631C` |
| **Multicall** | `0x4fe5CBf4658d6Ca76431dD05D2D7aD6BbCD20891` |

### Farms — 30 pid entries

| pid | LP symbol | LP address |
|----:|-----------|------------|
| 0 | MARCO | `0x56e46bE7714550A4Cb7bD0863BaB2680c099d8d7` |
| 1 | MARCO-WETH LP | `0x170442A83Fa4837Df61D9C4296732bF45AA9030C` |
| 2 | USDC-WETH LP | `0xf2157F527Ad7572691d25371838cbE040e93cDD3` |
| … | *(27 more in file)* | |

### Live pools (`livePools8453`) — 12 entries

---

## Chain 42161 — Arbitrum (config only; not in wagmi)

| Role | Address |
|------|---------|
| **chainId** | 42161 |
| **Router** | *(empty in smart-router constants)* |
| **Factory** | *(not in FACTORY_ADDRESS_MAP)* |
| **WETH** | `0x82aF49447D8a07e3bd95BD0d56f35241523fBab1` |
| **MARCO** | `0x963556de0eb8138E97A85F0A86eE0acD159D210b` (CAKE_ARB) |
| **MasterChef** | `0x0Ac09AbdC688fd67863bf0f62DD0e243dbdf6894` |
| **Multicall** | `0xcA11bde05977b3631167028862bE2a173976CA11` |

### Farms — 14 pid entries (`packages/farms/constants/42161.ts`)

---

## Chain 148 — Shimmer2 (config only; not in wagmi)

| Role | Address |
|------|---------|
| **chainId** | 148 |
| **WSMR (WNATIVE)** | `0x16bb40487386d83E042968FDDF2e72475eddF837` |
| **MARCO** | `0xC33FEdB84EE8aD97141eF6647D305c9FFBdC7cd6` |
| **MasterChef** | `0x43bF3ff3f6374aDaA914e9657959FAcb4D6d110c` |
| **Multicall** | `0x272219571f9E6104960BE987f2462804fBD12551` |
| **nonBSC vault** | `0xE6c904424417D03451fADd6E3f5b6c26BcC43841` |
| **bridge** | `0x69760b95C16d690b07234C2e3493e4b8167724E1` (chain 13600 key in contracts) |

### Farms — 9 pid entries (`packages/farms/constants/148.ts`)

---

## Additional multicall addresses (defined, not wallet-active)

| chainId | Network | Multicall |
|--------:|---------|-----------|
| 43114 | Avalanche | `0xcA11bde05977b3631167028862bE2a173976CA11` |
| 250 | Fantom | `0xcA11bde05977b3631167028862bE2a173976CA11` |
| 25 | Cronos | `0xcA11bde05977b3631167028862bE2a173976CA11` |
| 369 | Pulse | `0xcA11bde05977b3631167028862bE2a173976CA11` |
| 10 | Optimism | `0xcA11bde05977b3631167028862bE2a173976CA11` |
| 324 | zkSync | `0xcA11bde05977b3631167028862bE2a173976CA11` |

---

## Token list sources

| Source | Location | Status |
|--------|----------|--------|
| **Primary bundled list** | `apps/web/src/config/constants/tokenLists/pancake-default.tokenlist.json` | Active (2600+ tokens); logoURI → `melega.finance` |
| **Unsupported list** | `pancake-unsupported.tokenlist.json` | Merged for warnings |
| **Warning list** | `pancake-warning.tokenlist.json` | Merged for warnings |
| **Remote official lists** | `lists.ts` → `OFFICIAL_LISTS`, `ETH_URLS`, `BSC_URLS` | **Empty** (disabled) |
| **Pancake CDN URLs** | Constants in `lists.ts` (pancakeswap.finance) | Defined but not in active URLs |
| **Per-chain token defs** | `packages/tokens/src/{1,56,137,8453,...}.ts` | Used for farms, pools, UI |
| **CAKE/MARCO map** | `packages/tokens/src/common.ts` → `CAKE[chainId]` | Reward token across chains |

---

## Stale / non-canonical constants (do not use for preservation edits)

| File | Issue |
|------|-------|
| `packages/smart-router/evm/constants/exchange.ts` | BSC router `0x10ED43C718714eb63d5aA57B78B54704E256024E` (Pancake default) ≠ live Melega router |
| `apps/web/src/config/constants/ifo.ts` | Legacy Pancake IFO campaigns; `/ilo` uses `ifov3` on-chain instead |

---

## Preservation checklist (sign-off before any deploy)

- [ ] `exchange.ts` ROUTER_ADDRESS unchanged for 1, 56, 137, 8453
- [ ] `SMART_ROUTER_ADDRESS` BSC unchanged
- [ ] `FACTORY_ADDRESS_MAP` / `INIT_CODE_HASH_MAP` unchanged
- [ ] `contracts.ts` byte-identical for all deployed chain keys
- [ ] No edits to `packages/farms/constants/*.ts` LP addresses or pids
- [ ] No edits to `pools.tsx` contractAddress fields
- [ ] Token addresses in JSON/lists unchanged (names/logos only)
- [ ] `supportChains.ts` chain gating unchanged unless explicitly approved
- [ ] `wagmi.ts` CHAINS array unchanged

---

⚠️ **Ethereum factory note:** SDK maps chain 1 factory to `0x149EE9245E5eD52a89Ea777d19AD3A5D87873680`. This address is also Base MasterChef in `contracts.ts`. Treat as frozen config; verify on-chain before any future factory-related fix (out of Phase 1 scope).
