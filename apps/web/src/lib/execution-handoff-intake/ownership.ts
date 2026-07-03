/**
 * KERL DEX registry handoff intake — Phase 7A ownership boundaries.
 */
export const REGISTRY_INTAKE_OWNERSHIP = {
  owns: [
    'local registry JSON artifact loading (filesystem only)',
    'registry artifact shape and URL safety validation',
    'routing to performCertifiedDryRunHandshake()',
    'dry-run ExecutionReport return',
  ],
  mustNeverOwn: [
    'remote URL fetch',
    'Swarm runtime integration',
    'wallet interaction',
    'adapter dispatch',
    'transaction submission',
    'receipt polling',
    'settlement normalization',
    'treasury submission',
    'public API exposure',
    'UI route exposure',
    'live execution',
  ],
} as const

export const REGISTRY_INTAKE_FORBIDDEN_IMPORTS = [
  'fetch(',
  'axios',
  'swarm/runtime',
  'kerl/runtime',
  'dispatchExecutionInstruction',
  'trackExecutionSubmission',
  'views/',
  'pages/api',
] as const
