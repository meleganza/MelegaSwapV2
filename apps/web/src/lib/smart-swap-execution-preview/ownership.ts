export const SMART_SWAP_EXECUTION_PREVIEW_OWNERSHIP = {
  module: 'SMART_SWAP_MODULE_003_EXECUTION_PREVIEW',
  owns: ['execution explanation', 'preview presentation', 'route transparency'],
  doesNotOwn: [
    'swap execution',
    'Router contract calls',
    'fee settlement',
    'D87 / FSC-01 modification',
    'Treasury Runtime',
    'KERL attribution',
    'custody',
    'signing',
  ],
  slippageSource: 'existing useUserSlippageTolerance / swap settings',
  protocolFeeDisplay: 'D87 ratified bps — display only',
  engine: 'SmartSwapForm unchanged — preview consumes shared swap state',
} as const
