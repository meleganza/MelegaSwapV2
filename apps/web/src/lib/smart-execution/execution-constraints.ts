import { ExecutionConstraint } from './execution-types'

export const SMART_EXECUTION_VERSION = '0.1.0'

export const SMART_EXECUTION_AS_OF = '2026-06-28'

export const SMART_EXECUTION_DISCLAIMER =
  'Illustrative Smart Economic Execution read model only. Sample candidates — no live routing, on-chain quotes, or swap execution.'

/** Execution-quality dimensions that define user-facing outcome quality. */
export const EXECUTION_QUALITY_DIMENSIONS = [
  'price_quality',
  'slippage_risk',
  'gas_efficiency',
  'liquidity_confidence',
  'venue_health',
  'canonical_alignment',
] as const

/** Civilization benefit is tracked separately and cannot override execution quality. */
export const CIVILIZATION_DIMENSION = 'civilization_benefit' as const

/** Reject when execution quality trails the best candidate by this many points. */
export const MATERIAL_QUALITY_GAP = 8

/** Hard floor for venue health — below this always rejects. */
export const MINIMUM_VENUE_HEALTH = 50

export const EXECUTION_CONSTRAINTS: ExecutionConstraint[] = [
  {
    id: 'civilization_never_overrides_quality',
    label: 'Civilization Benefit Constraint',
    rule: 'Civilization benefit must NEVER override execution quality.',
    enforced: true,
  },
  {
    id: 'material_worse_rejected',
    label: 'Material Quality Gap',
    rule: `Candidates materially worse for the user (execution quality gap ≥ ${MATERIAL_QUALITY_GAP}) are rejected even if ecosystem benefit is higher.`,
    enforced: true,
  },
  {
    id: 'venue_health_floor',
    label: 'Venue Health Floor',
    rule: `Venue health below ${MINIMUM_VENUE_HEALTH} rejects the candidate regardless of civilization benefit.`,
    enforced: true,
  },
  {
    id: 'illustrative_only',
    label: 'Illustrative Read Model',
    rule: 'All candidates are static samples — not live prices, routes, or on-chain quotes.',
    enforced: true,
  },
]
