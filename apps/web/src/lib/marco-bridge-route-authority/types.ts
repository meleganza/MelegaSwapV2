import type { CanonicalRouteId } from './constants'

export type MarcoBridgeNetworkFamily = 'evm' | 'solana' | string

export type MarcoBridgeNetwork = {
  id: string
  name: string
  family: MarcoBridgeNetworkFamily
  chain_id: number | null
  eid: number
  model: string
  token: string
  token_decimals: number
  endpoint_contract: string
  requires_approval: boolean
  paused: boolean
}

export type MarcoBridgeRoute = {
  from: string
  to: string
  certified: boolean
  publicly_active: boolean
  execution_enabled: boolean
  paused: boolean
  reason?: string
}

export type MarcoBridgeRouteStateData = {
  binding_version: string
  updated_at: string
  hub: string
  shared_with: string[]
  global_execution_enabled: boolean
  networks: MarcoBridgeNetwork[]
  routes: MarcoBridgeRoute[]
}

export type MarcoBridgeRouteStateResponse = {
  schema_version: string
  portal_version: string
  updated_at: string
  source: string
  provenance: string
  data: MarcoBridgeRouteStateData
  canonical_url: string
  notice?: string
}

export type RouteAvailabilityStatus =
  | 'executable'
  | 'prepared_inactive'
  | 'paused'
  | 'inactive'
  | 'unavailable'

export type DerivedRouteStatus = {
  id: CanonicalRouteId
  from: string
  to: string
  certified: boolean
  publiclyActive: boolean
  executionEnabled: boolean
  paused: boolean
  reason?: string
  /** True only when global + route flags allow live execution. */
  executable: boolean
  status: RouteAvailabilityStatus
}

export type MarcoBridgeAuthoritySnapshot = {
  ok: true
  fetchedAt: number
  globalExecutionEnabled: boolean
  networks: MarcoBridgeNetwork[]
  routes: DerivedRouteStatus[]
  executableRouteCount: number
  bindingVersion: string
  updatedAt: string
  source: string
}

export type MarcoBridgeAuthorityFailure = {
  ok: false
  fetchedAt: number
  error: string
  reason:
    | 'fetch_failed'
    | 'invalid_response'
    | 'validation_failed'
    | 'legacy_identity'
    | 'stale_cache_cleared'
}

export type MarcoBridgeAuthorityResult = MarcoBridgeAuthoritySnapshot | MarcoBridgeAuthorityFailure
