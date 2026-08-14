export const SMART_SWAP_AI_ASSISTANCE_OWNERSHIP = {
  module: 'SMART_SWAP_MODULE_006_AI_ASSISTANCE',
  owns: ['explanation', 'education', 'contextual assistance'],
  doesNotOwn: [
    'route selection',
    'swap execution',
    'transaction mutation',
    'fee calculation or mutation',
    'Treasury settlement',
    'KERL attribution',
    'user decision override',
    'financial advice',
    'portfolio management',
    'custody',
    'signing',
  ],
  engines: {
    routesQuotesExecution: 'Smart Swap Engine / SmartSwapForm',
    fees: 'Canonical fee engine',
    settlement: 'NONE',
    economicAttribution: 'KERL',
  },
  principle: 'AI is an assistant — optional, non-blocking, explanation only',
} as const
