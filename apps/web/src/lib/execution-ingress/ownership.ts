/**
 * KERL DEX internal instruction ingress — Phase 5 ownership boundaries.
 */
export const INGRESS_OWNERSHIP = {
  owns: [
    'instruction integrity validation',
    'supported adapter selection',
    'dispatch to injected execution adapters',
    'lifecycle recording via execution tracker',
    'execution report return',
  ],
  mustNeverOwn: [
    'route selection',
    'asset policy',
    'chain policy',
    'slippage selection',
    'trade optimization',
    'settlement normalization',
    'treasury submission',
    'instruction production',
    'KERL runtime integration',
    'settlement events',
    'public API exposure',
  ],
} as const

export const INGRESS_FORBIDDEN_ROUTING_IMPORTS = [
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

export const INGRESS_FORBIDDEN_TREASURY_IMPORTS = [
  'lib/economic-runtime',
  'economic-runtime',
  'treasury',
  'TreasuryRuntime',
  'economic-activation',
  'lib/economic-activation',
  'settlementEvent',
  'SettlementEvent',
] as const

export const INGRESS_FORBIDDEN_KERL_IMPORTS = [
  'kerl/runtime',
  'lib/kerl',
  'KERLRuntime',
  'kerl-runtime',
] as const

export const INGRESS_FORBIDDEN_SETTLEMENT_FIELDS = [
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
