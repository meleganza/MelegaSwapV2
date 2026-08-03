# MELEGASWAP_V2_ARBITRUM_AND_AVALANCHE_FOUNDER_ADDRESS_RECOVERY_AND_LIVE_EXECUTION

**Branch:** `melegaswap-v2-multichain-execution-program`  
**Baseline:** Ethereum LIVE @ `b643369f`

## Phase 1 — Arbitrum LIVE

### Verdict
**MELEGASWAP_V2_ARBITRUM_LIVE**

### Founder addresses verified on 42161
| Role | Address | Result |
|------|---------|--------|
| Factory | `0x816ddf4e751dfe6a5e65837f721c5fd971108ede` | code OK |
| Multicall | `0xcA11bde05977b3631167028862bE2a173976CA11` | responds |
| Router | `0x149ee9245e5ed52a89ea777d19ad3a5d87873680` | `factory()` + `WETH()` OK; coherent with Factory |
| Vault | `0x2541DBEa199a22501D75EA141627776Bd4EefC80` | code OK |
| Pool deploy | `0x64935e2A3d8F3840445fB2DdF37FBBfc3b292EFe` | code OK |
| MasterBuilder (Founder) | `0xeF3E56e434e273dC84A58f02209c154216D005cb` | code OK, poolLength=1 |
| MasterBuilder (farms SSOT) | `0x0Ac09AbdC688fd67863bf0f62DD0e243dbdf6894` | poolLength=14 matches `farms/constants/42161.ts` |
| Stale router | `0x3BC722…` | **0 bytecode — rejected** |

### MARCO
Verified on 42161 at `0x963556de0eb8138E97A85F0A86eE0acD159D210b` — name MELEGA, symbol MARCO, decimals 18. Not a BSC-only mislabel.

### LIVE switcher
BNB · Base · Polygon · Ethereum · **Arbitrum**

### Unchanged
- Liquidity Builder: BETA · BNB only
- Fee economics: 25% of estimated gas → MELEGA TREASURY EOA as native ETH on Arbitrum

## Phase 2 — Avalanche (gates incomplete)

See Avalanche evidence files. Narrow blocker after Founder-address verification:

**AVALANCHE_ROUTER_ADDRESS_REQUIRED**

Founder-labeled Router `0x149ee924…` on Avalanche is **MRT** (MARCO Reward Token), not a V2 router.  
Candidate `0xeF3E56e4…` exposes `factory()`/`WETH()` but `factory()` points to undeployed `0xabd7a070…`.  
Factory `0xFF8EBf8…` has code (`allPairsLength=0`) and needs a coherent V2 Router bound to it.  
MARCO recovered at `0x8c880e839f3cacf60f11612087babd3307a33720` (vault.token()).
