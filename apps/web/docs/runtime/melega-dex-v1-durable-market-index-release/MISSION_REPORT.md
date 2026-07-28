# MELEGA_DEX_V1_DURABLE_MARKET_INDEX_AND_FOUNDER_ACCEPTANCE_RELEASE

## Verdict (pre-production gate)

Code + live local certification complete. Production DEPLOYED verdict requires merge + cron self-heal progress (documented in `deployment-record.json`).

## Root cause (measured)

`pairSyncEngine.scanRange` used flat `topics: [SWAP, MINT, BURN]` → eth_getLogs AND across topic slots → **0 AMM matches**. Coverage advanced to ~100% while Swap stayed at 3. Secondary: truncated `Burn(address,uint256,uint256)` topic.

Proof: `_topics-proof.json` — verified block AND=0 / OR=1; 22 Swaps in last 100k with correct Swap topic.

## Repair

1. `ammPairEventTopicsOrFilter()` → `[[SWAP,MINT,BURN]]`
2. Correct Uniswap V2 Burn signature
3. Self-heal clears false-complete coverage when Swap≤3 & coverage≥90%
4. Founder WBNB pairs prioritized in Tier-1
5. `/api/indexer/featured-markets` + Featured rail last-good
6. Explore Pools merges tier-metrics volume + `LP_HOLDERS_FEE`
7. Health exposes `marketIndex` readiness object

## Live cycles (BSC mainnet, local durable FS)

| Cycle | Swaps | lastIndexedBlock | addedEvents |
|------|------:|-----------------:|------------:|
| 1 | 39 | 112692692 | 39 |
| 2 | 39 | 112692937 | 0 |
| 3 | 39 | 112692963 | 0 |

Idempotent: unique IDs stable; no duplicates; checkpoint never reset to 0.

## Gates

- Indexer topic/integrity/home/liquidity tests: pass
- `next build`: pass
- Forbidden contract/execution files: untouched

## Lineage

- Base founder acceptance: `946460b1`
- Branch: `melega-dex-v1-durable-market-index-and-founder-acceptance-release`
