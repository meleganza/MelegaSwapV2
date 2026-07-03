/**
 * KERL DEX internal execution contract — schema version.
 * Increment only on breaking contract changes.
 */
export const EXECUTION_INSTRUCTION_SCHEMA_VERSION = '1.0' as const

export const EXECUTION_CONTRACT_VERSION = '1.0' as const

export const INSTRUCTION_SOURCE_DEX_ROUTING = 'dex-routing' as const

export const INSTRUCTION_SOURCE_KERL_PREVIEW = 'kerl-preview' as const

export const INSTRUCTION_SOURCE_MANUAL = 'manual' as const

/**
 * Fields that must never appear on execution reports or evidence surfaces.
 * Reports describe submission lifecycle only — not settlement or treasury outcomes.
 */
export const SETTLEMENT_FORBIDDEN_FIELDS = [
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
