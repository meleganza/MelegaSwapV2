/**
 * KERL DEX execution gateway — Phase 1 dry-run ownership boundaries.
 */
export const GATEWAY_OWNERSHIP = {
  owns: [
    'KERL instruction dry-run acceptance',
    'instruction contract validation (via ingress validator)',
    'dry-run execution evidence production',
    'dry-run execution report production',
    'execution tracker dry-run lifecycle recording',
    'execution suppression guarantees',
  ],
  mustNeverOwn: [
    'adapter dispatch',
    'wallet interaction',
    'transaction submission',
    'receipt polling',
    'route selection',
    'settlement normalization',
    'treasury submission',
    'settlement events',
    'instruction production',
    'KERL runtime integration',
    'public API exposure',
  ],
} as const

export const GATEWAY_FORBIDDEN_ROUTING_IMPORTS = [
  '@pancakeswap/smart-router',
  'useBestTrade',
  'useIsSmartRouterBetter',
  'useTradeInfo',
  'getBestTrade',
  'hooks/Trades',
  'fetchBestPriceWithRouter',
  'lib/smart-execution',
  'lib/routing-layer',
  'createSmartSwapExecutionInstruction',
  'createV2SwapExecutionInstruction',
  'createBridgeExecutionInstruction',
] as const

export const GATEWAY_FORBIDDEN_TREASURY_IMPORTS = [
  'lib/economic-runtime',
  'economic-runtime',
  'treasury',
  'TreasuryRuntime',
  'economic-activation',
  'lib/economic-activation',
  'settlementEvent',
  'SettlementEvent',
] as const

export const GATEWAY_FORBIDDEN_KERL_IMPORTS = [
  'kerl/runtime',
  'lib/kerl',
  'KERLRuntime',
  'kerl-runtime',
] as const

export const GATEWAY_FORBIDDEN_SETTLEMENT_FIELDS = [
  'settlement',
  'settlementEvent',
  'settlementStatus',
  'settlementAmount',
  'treasury',
  'treasurySku',
  'treasurySubmission',
  'normalizedProceeds',
  'missionLogic',
] as const
