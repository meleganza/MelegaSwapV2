/** KAP-006C — DEX as Civilization Economic Exchange Engine. */
export const KAP_006C_MARKER = 'KAP-006C_DEX_GRAVITY_IMPLEMENTED' as const

/** KAP-006E — compliance closure on KAP-006D partial findings. */
export const KAP_006E_MARKER = 'KAP-006E_DEX_GRAVITY_COMPLIANCE_CLOSED' as const

export const DEX_GRAVITY_SCHEMA_VERSION = '1.0.0' as const

export const MELEGA_DEX_SCHEMA = 'melega.dex.v1' as const
export const MELEGA_LIQUIDITY_SCHEMA = 'melega.liquidity.v1' as const
export const MELEGA_EXECUTION_SCHEMA = 'melega.execution.v1' as const
export const MELEGA_EXCHANGE_RECEIPT_SCHEMA = 'melega.exchange-receipt.v1' as const
export const MELEGA_DEX_EXECUTION_RECEIPT_SCHEMA = 'melega.dex-execution-receipt.v1' as const

export const EXCHANGE_RECEIPT_SCHEMA_ALIASES = [
  MELEGA_EXCHANGE_RECEIPT_SCHEMA,
  MELEGA_DEX_EXECUTION_RECEIPT_SCHEMA,
] as const

export const DEX_DELEGATED_AUTHORITIES = [
  'Core/G001',
  'Treasury',
  'Signal',
  'Radar',
  'Labs',
] as const

export const DEX_FORBIDDEN_AUTHORITIES = [
  'Civilization Gravity',
  'Treasury settlement computation',
  'Settlement Truth',
  'Opportunity Truth',
  'Signal Gateway authority',
  'Radar authority',
  'Labs productive planning',
  'reward computation',
  'cashback computation',
  'market making',
  'arbitrage',
  'trading bots',
] as const

export const DEX_CANONICAL_PIPELINES = [
  'routing_pipeline',
  'execution_pipeline',
  'liquidity_pipeline',
  'machine_surface_pipeline',
] as const
