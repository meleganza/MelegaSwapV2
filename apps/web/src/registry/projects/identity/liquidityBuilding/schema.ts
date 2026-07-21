/**
 * PP007 — Liquidity Building Orchestration schema.
 * Discovery/navigation only — never duplicates LB runtime, wizard, or execution.
 */

export const PROJECT_LIQUIDITY_BUILDING_SCHEMA_VERSION = 'melega.project-liquidity-building.v1' as const
export const LIQUIDITY_BUILDING_RESOLVER_REVISION = 'PP007_LIQUIDITY_BUILDING_V1' as const
export const PROJECT_PAGE_LIQUIDITY_BUILDING_SUMMARY_EXTENSION = 'liquidityBuildingSummary.v1' as const

export const LIQUIDITY_BUILDING_CAPABILITY_ID = 'LIQUIDITY_BUILDING' as const

/** Certified product deep link restored by LB024 — do not invent alternate routes. */
export const LIQUIDITY_BUILDING_DESTINATION_HREF = '/liquidity-studio?view=building' as const

export const LB_ACTIVATION_STATES = ['ACTIVE', 'ACTIVATION_PENDING', 'BLOCKED', 'UNSUPPORTED', 'UNAVAILABLE'] as const
export type LbActivationState = (typeof LB_ACTIVATION_STATES)[number]

export const LB_CAPABILITY_STATUSES = ['AVAILABLE', 'UNAVAILABLE', 'PAUSED', 'UNSUPPORTED'] as const
export type LbCapabilityStatus = (typeof LB_CAPABILITY_STATUSES)[number]

export const LB_AVAILABILITIES = ['AVAILABLE', 'UNAVAILABLE', 'NOT_APPLICABLE', 'STALE', 'CONFLICTED'] as const
export type LbAvailability = (typeof LB_AVAILABILITIES)[number]

export const LB_SOURCE_CLASSES = [
  'CERTIFIED_RUNTIME_CONFIGURATION',
  'REGISTRY_CAPABILITY',
  'VENUE_REGISTRY',
  'PROJECT_DEPLOYMENT_MAPPING',
] as const
export type LbSourceClass = (typeof LB_SOURCE_CLASSES)[number]

export const LB_REASON_CODES = [
  'PROJECT_DOES_NOT_SUPPORT_LIQUIDITY_BUILDING',
  'RUNTIME_CONFIGURATION_MISSING',
  'ACTIVATION_BLOCKED',
  'ACTIVATION_PENDING',
  'DESTINATION_UNAVAILABLE',
  'CHAIN_UNSUPPORTED',
  'PARTIAL_RUNTIME_COVERAGE',
] as const
export type LbReasonCode = (typeof LB_REASON_CODES)[number]

export const LB_ORCHESTRATION_LIMITATIONS = [
  'Liquidity Building execution remains entirely inside the existing Liquidity Building / Liquidity Studio surface.',
  'This orchestration layer exposes discovery, activation state, and destination only.',
  'No simulation, wizard, contract calls, approvals, or transaction payloads are included.',
  'Activation may be pending or blocked while production gates remain closed — the destination still opens the certified product surface.',
] as const

/**
 * Deterministic certified bindings — Melega DEX + BSC from Liquidity Building V1 deployment inputs.
 * Not inferred from token symbols or marketing tags.
 */
export const CERTIFIED_LIQUIDITY_BUILDING_BINDINGS = [
  {
    projectSlug: 'melega-dex',
    chainIds: [56] as const,
    runtimeVersion: 'LiquidityBuildingV1',
    source: 'CERTIFIED_RUNTIME_CONFIGURATION' as const,
    destinationHref: LIQUIDITY_BUILDING_DESTINATION_HREF,
  },
] as const

/**
 * Certified activation snapshot mirrored from
 * `deployments/liquidity-building/chain-56/LiquidityBuildingV1.inputs.json`
 * (`deploymentReadinessState`). Kept static so Project Page bundles never import Node `fs`.
 */
export const CERTIFIED_LB_DEPLOYMENT_SNAPSHOT: {
  chainId: number
  runtimeVersion: string
  deploymentReadinessState: 'BLOCKED' | 'DEPLOYED' | 'VALID' | string
  sourcePath: string
} = {
  chainId: 56,
  runtimeVersion: 'LiquidityBuildingV1',
  deploymentReadinessState: 'BLOCKED',
  sourcePath: 'deployments/liquidity-building/chain-56/LiquidityBuildingV1.inputs.json',
}
