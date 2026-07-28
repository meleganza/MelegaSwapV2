/**
 * SMART_SWAP_MODULE_002 — ownership boundary (intelligence only).
 */

export const SMART_SWAP_ROUTE_ENGINE_OWNERSHIP = {
  module: 'SMART_SWAP_MODULE_002_ROUTE_ENGINE',
  owns: [
    'route intelligence',
    'route presentation model',
    'route comparison / ranking',
    'execution explanation',
    'route confidence scoring',
  ],
  doesNotOwn: [
    'swap execution',
    'Router contract calls',
    'wallet signing',
    'fee settlement',
    'FSC-01 waterfall',
    'Treasury settlement truth',
    'KERL economic attribution',
    'custody',
    'independent liquidity inventory',
  ],
  dataSources: [
    'Canonical Token Registry (identity)',
    'DEX smart-router / pair reserves (quotes)',
    'Existing TradeWithStableSwap / V2 trade snapshots',
    'Liquidity indexer (inventory evidence only — not a second quote engine)',
  ],
  forbiddenClaims: ['best route guaranteed', 'best price guaranteed', 'zero slippage', 'risk free'],
  surfaces: {
    instantSwap: 'Simple execution experience — may omit route intelligence UI',
    smartSwap: 'Route intelligence layer over the same SmartSwapForm engine',
  },
} as const
