export const SMART_SWAP_EXECUTION_HANDOFF_OWNERSHIP = {
  module: 'SMART_SWAP_MAINNET_EXECUTION_HANDOFF',
  owns: [
    'certified handoff gate',
    'readiness validation presentation',
    'explicit confirmation boundary',
  ],
  doesNotOwn: [
    'Router contracts',
    'SmartSwapForm core architecture',
    'route ranking',
    'fee calculation',
    'D87 / FSC-01',
    'Treasury Runtime settlement',
    'KERL attribution',
    'automatic signing',
    'automatic broadcast',
    'token registry',
  ],
  flow: [
    'Execution Preview',
    'Readiness Validation',
    'Certified Handoff',
    'Wallet Signature (user)',
    'Broadcast (wallet)',
    'Receipt',
  ],
  engine: 'SmartSwapForm remains the execution engine — handoff certifies readiness only',
} as const
