export const SMART_SWAP_HISTORY_OWNERSHIP = {
  module: 'SMART_SWAP_MODULE_005_HISTORY',
  owns: [
    'Smart Swap execution presentation',
    'route memory presentation',
    'execution explanation',
    'transparency history',
  ],
  doesNotOwn: [
    'transaction truth (blockchain)',
    'wallet transaction store mutation',
    'fee settlement records',
    'KERL attribution calculation',
    'second blockchain indexer',
    'fake history',
    'local execution database',
    'custody',
    'signing',
    'swap execution',
  ],
  dataSources: [
    'wallet Redux swap transactions',
    'settlementHandoffContext fee / KERL meta when present',
    'settlement references (display only)',
  ],
  engine: 'SmartSwapForm unchanged — history is read-only memory',
} as const
