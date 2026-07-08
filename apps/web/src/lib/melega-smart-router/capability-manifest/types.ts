/** Phase 2.5 — self-describing Smart Router capability manifest. */

export const CAPABILITY_MANIFEST_SCHEMA = 'melega.capabilities.smart-router.v1' as const

export type CapabilityId =
  | 'BUY_MARCO'
  | 'SELL_MARCO'
  | 'STANDARD_SWAP'
  | 'LP_SEPARATION'
  | 'TREASURY_HANDOFF'
  | 'REGISTRY_LOOKUP'
  | 'CHAIN_ROUTING'
  | 'EXACT_INPUT'
  | 'EXACT_OUTPUT'
  | 'FEE_ON_TRANSFER'
  | 'MULTICHAIN'
  | 'WRAPPER'
  | 'ADAPTER'

export type CapabilityState = 'supported' | 'planned' | 'blocked'

export interface CapabilityEntry {
  id: CapabilityId
  supported: boolean
  planned: boolean
  blocked: boolean
  reason: string
  introducedIn: string
  deprecatedIn: string | null
}

export interface CapabilityManifest {
  schema: typeof CAPABILITY_MANIFEST_SCHEMA
  version: string
  chainId?: number
  capabilities: CapabilityEntry[]
}
