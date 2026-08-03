# MELEGASWAP_V2_AVALANCHE_FIRST_MARKET_SEED_AND_SWAP_PROOF

**Verdict:** `MELEGASWAP_V2_AVALANCHE_FIRST_MARKET_AND_SWAP_BLOCKED`

**Mode:** Founder-signed live canary  
**Branch:** `mission-avalanche-first-market-seed-and-swap-proof`

## Baseline (measured)

| Item | Value |
|------|--------|
| Router | `0x5A38b0B75C2E199fD8098710594115A35ABb6c7F` |
| Factory | `0xFF8EBf8edf1C533A02d066f852788773BdCD631C` |
| MARCO | `0x8C880e839f3CAcf60F11612087BAbd3307A33720` |
| WAVAX | `0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7` |
| Factory `allPairsLength` | **0** |
| `getPair(MARCO,WAVAX)` | zero address |
| Deployer AVAX | ≈ 0.248 |
| Deployer MARCO | non-zero |
| Deployer WAVAX | 0 |
| Private key in agent env | **absent** |
| Browser wallet MCP | **unavailable** |

## Blocker

`FOUNDER_WALLET_SIGNATURE_REQUIRED`

Mission forbids KMS, server signer, and automatic broadcast. Pair creation, liquidity, Smart Swap, and protocol-fee settlement all require Founder wallet `0xB6eEb3ab9695979F5b2Ef6Df4112e63212E33EE0` to connect on Avalanche (43114) and sign in the browser.

## What shipped (readiness)

1. `FounderAvalancheLiveSeedPanel` — approve MARCO → `addLiquidityETH` → capture pair → quote → settle 25% AVAX fee to Treasury → `swapExactETHForTokens` (wallet-signed only).
2. `verifyAvalancheFirstMarket.ts` — read-only RPC verification helper for post-seed checks.
3. Unit gates for addresses, fee formula, seed calldata, evidence pack presence.
4. Evidence pack under this directory (all required JSON + this report).

## Not claimed

- No fabricated pair address, TVL, reserves, swap hash, or fee hash.
- No second Router/Factory deploy.
- No contract modification.

## Unblock path

1. Ship / use a build that includes Avalanche LIVE + seed panel.
2. Open `/runtime/deployment/?chain=avalanche`.
3. Connect Founder deployer on Avalanche.
4. Click **Seed pair · liquidity · fee · swap** and approve each wallet prompt.
5. Re-run RPC verification + Smart Swap product checks; replace evidence with factual hashes.

## Final verdict

```
MELEGASWAP_V2_AVALANCHE_FIRST_MARKET_AND_SWAP_BLOCKED
```
