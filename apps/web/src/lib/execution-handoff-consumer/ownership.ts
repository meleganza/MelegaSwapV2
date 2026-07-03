/**
 * KERL DEX dry-run handoff consumer — Phase 3 ownership boundaries.
 */
export const HANDOFF_CONSUMER_OWNERSHIP = {
  owns: [
    'KERL dry-run handoff package validation',
    'handoff manifest integrity checks',
    'proposed instruction extraction',
    'certified dry-run handshake validation',
    'compatibility certification verification',
    'routing to execution gateway (DRY_RUN_ONLY)',
    'dry-run execution report return',
  ],
  mustNeverOwn: [
    'adapter dispatch',
    'wallet interaction',
    'transaction submission',
    'receipt polling',
    'settlement normalization',
    'treasury submission',
    'settlement events',
    'Swarm runtime integration',
    'public API exposure',
    'UI route exposure',
    'live execution',
  ],
} as const

export const HANDOFF_FORBIDDEN_ROUTING_IMPORTS = [
  '@pancakeswap/smart-router',
  'useBestTrade',
  'lib/routing-layer',
  'createSmartSwapExecutionInstruction',
  'createV2SwapExecutionInstruction',
  'createBridgeExecutionInstruction',
] as const

export const HANDOFF_FORBIDDEN_TREASURY_IMPORTS = [
  'lib/economic-runtime',
  'economic-runtime',
  'treasury',
  'TreasuryRuntime',
  'economic-activation',
  'settlementEvent',
  'SettlementEvent',
] as const

export const HANDOFF_FORBIDDEN_KERL_RUNTIME_IMPORTS = [
  'kerl/runtime',
  'lib/kerl',
  'KERLRuntime',
  'kerl-runtime',
  'swarm/runtime',
  'SwarmRuntime',
] as const

export const HANDOFF_FORBIDDEN_UI_IMPORTS = [
  'views/',
  'components/Menu',
  'pages/',
  'app-shell',
] as const

export const HANDOFF_FORBIDDEN_DISPATCH_IMPORTS = [
  'dispatchExecutionInstruction',
] as const
