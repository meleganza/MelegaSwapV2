/**
 * Execution tracker ownership — DEX-owned, execution-only.
 */
export const EXECUTION_TRACKER_OWNERSHIP = {
  owns: [
    'instruction ↔ execution correlation',
    'execution lifecycle events',
    'transaction hash capture',
    'receipt reference observation',
    'execution evidence persistence (lifecycle only)',
    'execution report finalization',
    'status transition recording',
  ],
  mustNeverOwn: [
    'route selection',
    'settlement normalization',
    'settlement events',
    'treasury submission',
    'mission logic',
    'instruction production',
    'receipt polling',
    'wallet connection policy',
  ],
} as const

export const TRACKER_FORBIDDEN_ROUTING_IMPORTS = [
  '@pancakeswap/smart-router',
  'useBestTrade',
  'useTradeInfo',
  'getBestTrade',
  'hooks/Trades',
  'lib/routing-layer',
  'createSmartSwapExecutionInstruction',
  'createV2SwapExecutionInstruction',
  'createBridgeExecutionInstruction',
] as const

export const TRACKER_FORBIDDEN_TREASURY_IMPORTS = [
  'lib/economic-runtime',
  'economic-runtime',
  'TreasuryRuntime',
  'economic-activation',
  'lib/economic-activation',
  'settlementEvent',
  'SettlementEvent',
] as const

export const TRACKER_FORBIDDEN_SETTLEMENT_FIELDS = [
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
