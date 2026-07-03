/**
 * Execution layer ownership — KERL Phase 3 contract.
 * Execution submits and tracks. Execution never routes or settles.
 */
export const EXECUTION_LAYER_OWNERSHIP = {
  owns: [
    'wallet execution',
    'transaction submission',
    'adapter dispatch (given instruction)',
    'gas estimation for submission',
    'execution receipts (raw EVM)',
    'execution status (client-side)',
    'execution evidence (DEX-owned, not settlement)',
    'execution reports (lifecycle only)',
    'transaction error surfacing',
    'execution error classification',
  ],
  mustNeverOwn: [
    'route selection',
    'quote comparison',
    'asset policy',
    'chain policy',
    'slippage policy (KERL-owned in future)',
    'protocol optimization',
    'settlement normalization',
    'treasury actions',
    'mission logic',
    'instruction production',
  ],
} as const
