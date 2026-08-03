# MELEGASWAP_V2_ETHEREUM_ARBITRUM_AVALANCHE_FINAL_EXECUTION

**Branch:** `melegaswap-v2-polygon-full-reactivation-and-arbitrum-registry`  
**Baseline:** `231f979a`

## Verdicts

| Chain | Verdict | Commit |
|-------|---------|--------|
| Ethereum | **MELEGASWAP_V2_ETHEREUM_LIVE** | `66d1b65e` |
| Arbitrum | **MELEGASWAP_V2_ARBITRUM_LIVE** | `53811ea6` |
| Avalanche | **AVALANCHE_ROUTER_ADDRESS_REQUIRED** | (this commit) |

## Canonical MARCO (Founder)
- Ethereum `0x5911Dc98…cdb76` — verified
- Arbitrum `0x963556de…d210b` — verified
- Avalanche `0x8C880e83…33720` — verified

## Avalanche blocker (precise)
Founder-labeled Router `0x149ee924…` on 43114 is **MRT**, not a V2 router.  
Candidate `0xeF3E56e4…` exposes `factory()`/`WETH()` but `factory()` → undeployed `0xabd7a070…`.  
Factory / Multicall / MasterBuilder / Vault / Pool deploy / MARCO are recovered and wired under PREPARING.  
**Do not mark Avalanche LIVE with a broken Router.**

## Unchanged
Liquidity Builder: BETA · BNB only  
Fee: 25% estimated native gas → `0xb6436EF4…F65b`
