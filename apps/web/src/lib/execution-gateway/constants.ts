/** KERL Live Integration Phase 1 — legacy manifest value; see lib/execution-modes for mode architecture. */
export const EXECUTION_MODE_DRY_RUN_ONLY = 'DRY_RUN_ONLY' as const

export const EXECUTION_AUTHORITY_DEX = 'dex' as const

export const GATEWAY_ERROR_CODES = {
  INACTIVE: 'GATEWAY_INACTIVE',
  VALIDATION_FAILED: 'GATEWAY_VALIDATION_FAILED',
  UNSUPPORTED_TYPE: 'GATEWAY_UNSUPPORTED_TYPE',
  DRY_RUN_FAILED: 'GATEWAY_DRY_RUN_FAILED',
} as const

export const DRY_RUN_SUPPRESSION_REASON =
  'KERL Live Integration Phase 1 — execution intentionally suppressed (DRY_RUN_ONLY)'
