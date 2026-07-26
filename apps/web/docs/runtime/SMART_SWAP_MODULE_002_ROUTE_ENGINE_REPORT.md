# Smart Swap Module 002 — Route Engine

## Final verdict

**SMART_SWAP_MODULE_002_ROUTE_ENGINE_CERTIFIED**

## Mission

`SMART_SWAP_MODULE_002_ROUTE_ENGINE`

## Certified base

| Item | Value |
| --- | --- |
| Module 001 | `SMART_SWAP_MODULE_001_HERO_CERTIFIED` tip `ea4a82f5` |
| Architecture | `47892a9d` |
| Global product | `94d4979a` |
| Branch | `smart-swap-module-002-route-engine` |

## Scope

Runtime model + adapter + ranking + tests + evidence only.

- No final UI / redesign  
- No SmartSwapForm changes  
- No contract changes  
- No fee / economics changes  
- No second DEX / registry / indexer  

## Ownership

| Concern | Owner |
| --- | --- |
| Route intelligence / comparison / explanation | Smart Swap Route Engine (Module 002) |
| Execution / contracts | DEX Router (wallet-signed) |
| Fee settlement | Treasury Runtime |
| Economic attribution | KERL |

## Model

`SmartSwapRoute` fields: `routeId`, tokens, `hops`, `pools`, `expectedOutput*`, `priceImpact`, `gasEstimate`, `feeEstimate` (LP display only), `confidence`, `source`, `freshness`, `warnings`, `explanation`.

Route types: `DIRECT` · `MULTI_HOP` · `NATIVE` · `STABLE` · `UNSUPPORTED`.

Failures (never empty success): `NO_ROUTE` · `PARTIAL_ROUTE_DATA` · `QUOTE_UNAVAILABLE` · `LIQUIDITY_UNAVAILABLE` · `NETWORK_UNAVAILABLE` · `UNSUPPORTED_PAIR`.

## Ranking

Explainable weights: output 45% · impact 25% · gas 10% · reliability 20%.

Label: **recommended route** with factual score breakdown — never “best route guaranteed”.

Gas unavailable does not block quote comparison.

## Library

`apps/web/src/lib/smart-swap-route-engine/`

## Instant vs Smart

Both surfaces continue to use `SmartSwapForm`. Module 002 is the Smart Swap intelligence layer; Instant Swap may omit route UI.

## Tests / build

- Vitest Module 002 — pass  
- Architecture / Module 001 freeze guards — pass  
- `yarn build` — pass  

## Mission commit

`PENDING_MISSION_COMMIT`

## Delivery

Push only. No merge. No deploy.

---

**SMART_SWAP_MODULE_002_ROUTE_ENGINE_CERTIFIED**
