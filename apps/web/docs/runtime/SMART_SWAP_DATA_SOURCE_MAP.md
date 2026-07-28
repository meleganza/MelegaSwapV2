# Smart Swap — Data Source Map

Architecture 000 lock. One owner per concern. No duplicated sources.

## Canonical sources

| Concern | Single owner | Path / system | Consumers |
| --- | --- | --- | --- |
| Token identity | Canonical Token Registry | `lib/canonical-token-registry` | Swap, Liquidity, Pools, Farms, Passport, Search, Home |
| Logos | Canonical Asset Resolver | `lib/dex-asset-index` / `resolveAssetLogo` | All product surfaces |
| Liquidity reserves (quotes) | On-chain pair `getReserves` | `packages/smart-router/evm/onchain/getPairs.ts` | `getBestTrade` / Smart Swap quotes |
| Route selection (mainnet) | Smart-router package + `useBestTrade` | `packages/smart-router/evm`, `views/Swap/SmartSwap/hooks` | Instant + Smart surfaces |
| Route selection (KRMP 97) | KERL | `lib/kerl-constitutional` | Testnet constitutional path |
| Factory / pair inventory | DEX indexer + factory readers | Indexer APIs / studio runtimes | Liquidity / Pools / Farms / analytics |
| Price for swaps | Trade math from reserves | smart-router trade computation | Preview UI |
| Protocol fee policy | D87 ratified codex | `lib/d87-pricing/codex/ratified.ts` | Adapter / pricing surfaces |
| Protocol fee amounts (DEX) | Melega Smart Router adapter | `lib/melega-smart-router/protocolFee.ts` | Manifests / handoff metadata |
| LP fee | Pair fee constant + trade breakdown | `config/constants/exchange.ts` `BASE_FEE`; SmartSwap `exchange.ts` helpers | Details UI |
| Treasury collector address | Registry resolution | `treasuryCollectorRegistry` / KERL / env | Adapter / wrapper prep |
| Settlement truth | Treasury Runtime | External Runtime via `/api/treasury/settlement-events` | History / status rail |
| Economic attribution | KERL / civilization policy | `civilization-router`, KERL docs | Compliance / blocked routes |
| Project identity | Project Registry | `registry/projects/*` | Project swap cards / destinations |
| Wallet balances | Wallet provider + chain reads | Connected account | Input max / approvals |

## Explicit non-sources

| Anti-pattern | Status |
| --- | --- |
| Product-local token lists for Smart Swap identity | Forbidden — use Canonical Token Registry |
| Hardcoded “best route” without reserve-backed trade | Forbidden |
| UI-only price oracles as swap settlement prices | Forbidden for execution |
| DEX-local FSC-01 amount tables as settlement truth | Forbidden |
| Liquidity Building FeeSink as D87 swap collector | Distinct path — must not be conflated |

## Indexer vs execution

| System | Role for Smart Swap |
| --- | --- |
| Indexer | Inventory / coverage / analytics evidence |
| Pair reserves (RPC multicall) | Quote / route math for execution |
| Factory pagination UIs | Discovery for other products — not a second quote engine |

Quotes for execution must remain reserve-backed (or KERL-owned on chain 97). Indexer absence must degrade to honest unavailable — never fabricated liquidity.
