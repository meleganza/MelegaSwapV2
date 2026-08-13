import {
  EXPECTED_NETWORK_IDENTITY,
  LEGACY_FORBIDDEN_CHAIN_IDS,
  LEGACY_RETIRED_BASE_RH_TOKEN,
  REQUIRED_NETWORK_IDS,
  ROUTE_ID_BY_PAIR,
} from './constants'
import type { MarcoBridgeNetwork, MarcoBridgeRoute, MarcoBridgeRouteStateResponse } from './types'

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function asBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean'
}

function asString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0
}

function asNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function normalizeAddress(value: string): string {
  return value.trim().toLowerCase()
}

function validateNetwork(raw: unknown): MarcoBridgeNetwork | null {
  if (!isObject(raw)) return null
  if (!asString(raw.id) || !asString(raw.name) || !asString(raw.family)) return null
  if (!asNumber(raw.eid)) return null
  const chainId = raw.chain_id === null ? null : asNumber(raw.chain_id) ? raw.chain_id : undefined
  if (chainId === undefined) return null
  if (!asString(raw.model) || !asString(raw.token) || !asString(raw.endpoint_contract)) return null
  if (!asNumber(raw.token_decimals) || !asBoolean(raw.requires_approval) || !asBoolean(raw.paused)) return null

  if (chainId !== null && LEGACY_FORBIDDEN_CHAIN_IDS.has(chainId)) return null

  return {
    id: raw.id,
    name: raw.name,
    family: raw.family,
    chain_id: chainId,
    eid: raw.eid,
    model: raw.model,
    token: raw.token,
    token_decimals: raw.token_decimals,
    endpoint_contract: raw.endpoint_contract,
    requires_approval: raw.requires_approval,
    paused: raw.paused,
  }
}

function validateRoute(raw: unknown): MarcoBridgeRoute | null {
  if (!isObject(raw)) return null
  if (!asString(raw.from) || !asString(raw.to)) return null
  if (!asBoolean(raw.certified) || !asBoolean(raw.publicly_active)) return null
  if (!asBoolean(raw.execution_enabled) || !asBoolean(raw.paused)) return null
  const pairKey = `${raw.from}>${raw.to}`
  if (!ROUTE_ID_BY_PAIR[pairKey]) return null
  return {
    from: raw.from,
    to: raw.to,
    certified: raw.certified,
    publicly_active: raw.publicly_active,
    execution_enabled: raw.execution_enabled,
    paused: raw.paused,
    reason: typeof raw.reason === 'string' ? raw.reason : undefined,
  }
}

function assertExpectedIdentity(network: MarcoBridgeNetwork): boolean {
  const expected = EXPECTED_NETWORK_IDENTITY[network.id as keyof typeof EXPECTED_NETWORK_IDENTITY]
  if (!expected) return false
  if (network.eid !== expected.eid) return false
  if (expected.chainId === null) {
    if (network.chain_id !== null) return false
  } else if (network.chain_id !== expected.chainId) {
    return false
  }
  return true
}

function assertNoLegacyTokenMisbind(networks: MarcoBridgeNetwork[]): boolean {
  for (const network of networks) {
    if (network.id === 'base' || network.id === 'robinhood') {
      if (normalizeAddress(network.token) === LEGACY_RETIRED_BASE_RH_TOKEN) return false
      if (normalizeAddress(network.endpoint_contract) === LEGACY_RETIRED_BASE_RH_TOKEN) return false
    }
  }
  return true
}

/**
 * Parse + validate Portal route-state. Fail closed on any uncertainty.
 * Does not infer availability from chain presence alone.
 */
export function parseAndValidateRouteState(input: unknown):
  | { ok: true; response: MarcoBridgeRouteStateResponse }
  | { ok: false; error: string; reason: 'invalid_response' | 'validation_failed' | 'legacy_identity' } {
  if (!isObject(input)) {
    return { ok: false, error: 'Route-state root is not an object', reason: 'invalid_response' }
  }
  if (!asString(input.schema_version) || !asString(input.source) || !asString(input.canonical_url)) {
    return { ok: false, error: 'Route-state missing schema fields', reason: 'invalid_response' }
  }
  if (!isObject(input.data)) {
    return { ok: false, error: 'Route-state missing data', reason: 'invalid_response' }
  }

  const data = input.data
  if (!asString(data.binding_version) || !asString(data.updated_at) || !asString(data.hub)) {
    return { ok: false, error: 'Route-state data missing identity fields', reason: 'invalid_response' }
  }
  if (!asBoolean(data.global_execution_enabled)) {
    return { ok: false, error: 'Route-state missing global_execution_enabled', reason: 'invalid_response' }
  }
  if (!Array.isArray(data.networks) || !Array.isArray(data.routes) || !Array.isArray(data.shared_with)) {
    return { ok: false, error: 'Route-state networks/routes malformed', reason: 'invalid_response' }
  }

  const networks: MarcoBridgeNetwork[] = []
  for (const item of data.networks) {
    const network = validateNetwork(item)
    if (!network) {
      return { ok: false, error: 'Route-state network failed validation', reason: 'validation_failed' }
    }
    networks.push(network)
  }

  for (const id of REQUIRED_NETWORK_IDS) {
    if (!networks.some((n) => n.id === id)) {
      return { ok: false, error: `Missing required network ${id}`, reason: 'validation_failed' }
    }
  }

  for (const network of networks) {
    if (!assertExpectedIdentity(network)) {
      return {
        ok: false,
        error: `Network ${network.id} identity mismatch (fail closed)`,
        reason: 'validation_failed',
      }
    }
  }

  if (!assertNoLegacyTokenMisbind(networks)) {
    return {
      ok: false,
      error: 'Legacy Base/Robinhood token identity present',
      reason: 'legacy_identity',
    }
  }

  const routes: MarcoBridgeRoute[] = []
  const seen = new Set<string>()
  for (const item of data.routes) {
    const route = validateRoute(item)
    if (!route) {
      return { ok: false, error: 'Unknown or invalid route pair', reason: 'validation_failed' }
    }
    const key = `${route.from}>${route.to}`
    if (seen.has(key)) {
      return { ok: false, error: 'Duplicate route pair', reason: 'validation_failed' }
    }
    seen.add(key)
    routes.push(route)
  }

  for (const key of Object.keys(ROUTE_ID_BY_PAIR)) {
    if (!seen.has(key)) {
      return { ok: false, error: `Missing canonical route ${key}`, reason: 'validation_failed' }
    }
  }

  const response: MarcoBridgeRouteStateResponse = {
    schema_version: input.schema_version,
    portal_version: asString(input.portal_version) ? input.portal_version : 'unknown',
    updated_at: asString(input.updated_at) ? input.updated_at : data.updated_at,
    source: input.source,
    provenance: asString(input.provenance) ? input.provenance : 'unknown',
    data: {
      binding_version: data.binding_version,
      updated_at: data.updated_at,
      hub: data.hub,
      shared_with: data.shared_with.filter((x): x is string => typeof x === 'string'),
      global_execution_enabled: data.global_execution_enabled,
      networks,
      routes,
    },
    canonical_url: input.canonical_url,
    notice: typeof input.notice === 'string' ? input.notice : undefined,
  }

  return { ok: true, response }
}
