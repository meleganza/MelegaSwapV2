/**
 * KERL DEX dry-run handoff consumer — Phase 3 error codes.
 */
export const HANDOFF_PACKAGE_VERSION = '1.0.0' as const

export const HANDOFF_MODE_DRY_RUN = 'dry_run' as const

export const HANDOFF_TRANSMITTED_INTERNAL_TEST = 'internal-test' as const

export const HANDOFF_ERROR_CODES = {
  INVALID_PACKAGE: 'HANDOFF_INVALID_PACKAGE',
  LIVE_MODE: 'HANDOFF_LIVE_MODE_REJECTED',
  MISSING_MANIFEST: 'HANDOFF_MISSING_DRY_RUN_MANIFEST',
  MISSING_INSTRUCTION: 'HANDOFF_MISSING_PROPOSED_INSTRUCTION',
  MANIFEST_VIOLATION: 'HANDOFF_MANIFEST_VIOLATION',
  EXECUTION_IMPLIED: 'HANDOFF_EXECUTION_IMPLIED',
  WALLET_IMPLIED: 'HANDOFF_WALLET_INTERACTION_IMPLIED',
  TRANSACTION_HASH_IMPLIED: 'HANDOFF_TRANSACTION_HASH_IMPLIED',
  RECEIPT_IMPLIED: 'HANDOFF_RECEIPT_IMPLIED',
  SETTLEMENT_IMPLIED: 'HANDOFF_SETTLEMENT_IMPLIED',
  TREASURY_IMPLIED: 'HANDOFF_TREASURY_IMPLIED',
  UNSUPPORTED_VERSION: 'HANDOFF_UNSUPPORTED_PACKAGE_VERSION',
} as const

export const HANDOFF_FORBIDDEN_EXECUTION_FIELDS = [
  'transactionHash',
  'txHash',
  'receipt',
  'settlement',
  'settlementEvent',
  'settlementStatus',
  'treasurySubmission',
  'treasury',
  'walletSignature',
  'signedTransaction',
  'submittedAt',
] as const

export const HANDOFF_FORBIDDEN_WALLET_VALUES = [
  'submit',
  'sign',
  'signing',
  'connected',
  'pending',
] as const
