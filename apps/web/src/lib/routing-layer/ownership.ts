/**
 * Routing layer ownership — KERL Phase 2 boundary.
 * Routing decides WHAT to execute. Execution decides HOW to submit.
 */
export const ROUTING_LAYER_OWNERSHIP = {
  owns: [
    'route discovery',
    'quote selection',
    'protocol comparison (smart router vs V2)',
    'slippage tolerance input (user setting)',
    'trade path assembly',
    'price impact derivation from local route',
    'execution instruction production (from routing output)',
  ],
  mustNeverOwn: [
    'wallet transaction submission',
    'gas estimation for submission',
    'transaction receipt polling',
    'execution evidence persistence',
    'settlement normalization',
    'treasury actions',
  ],
} as const

export const ROUTING_FORBIDDEN_IN_EXECUTION_LAYER = [
  '@pancakeswap/smart-router',
  'useBestTrade',
  'useIsSmartRouterBetter',
  'useTradeInfo',
  'getBestTrade',
  'hooks/Trades',
  'fetchBestPriceWithRouter',
  'lib/smart-execution',
] as const
