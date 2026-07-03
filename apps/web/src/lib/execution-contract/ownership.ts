/**
 * KERL DEX execution contract ownership — Phase 3 hardened rules.
 */
export const EXECUTION_CONTRACT_OWNERSHIP = {
  executionLayerOwns: [
    'wallet submission',
    'adapter dispatch',
    'transaction hash capture',
    'receipt observation',
    'execution evidence',
    'execution status',
    'execution errors',
    'execution reports (lifecycle only)',
  ],
  executionLayerMustNeverOwn: [
    'route selection',
    'asset policy',
    'chain policy',
    'slippage selection',
    'trade optimization',
    'settlement normalization',
    'treasury submission',
    'mission logic',
    'instruction production',
  ],
} as const

/**
 * Routing engine imports forbidden inside execution layer.
 */
export const EXECUTION_FORBIDDEN_ROUTING_IMPORTS = [
  '@pancakeswap/smart-router',
  'useBestTrade',
  'useIsSmartRouterBetter',
  'useTradeInfo',
  'getBestTrade',
  'hooks/Trades',
  'fetchBestPriceWithRouter',
  'lib/smart-execution',
  'lib/routing-layer/createSwapExecutionInstruction',
  'createSmartSwapExecutionInstruction',
  'createV2SwapExecutionInstruction',
  'createBridgeExecutionInstruction',
] as const

/**
 * Treasury / economic runtime imports forbidden inside execution layer.
 */
export const EXECUTION_FORBIDDEN_TREASURY_IMPORTS = [
  'lib/economic-runtime',
  'economic-runtime',
  'treasury',
  'TreasuryRuntime',
  'economic-activation',
  'lib/economic-activation',
] as const
