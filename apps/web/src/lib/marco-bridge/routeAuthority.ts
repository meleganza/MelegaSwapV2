import { applyLiveSolanaPauseOverlay, readLiveSolanaOftPaused } from './solanaUnpause'
import { MARCO_WAVE1_DIRECT_ROUTES, MARCO_WAVE1_NETWORKS } from './wave1Registry'
import type { MarcoBridgeNetworkId } from './types'

export const CANONICAL_MMN_ROUTE_STATE_URL = 'https://marco.melega.ai/api/public/bridge/route-state'

export type CanonicalMmnNetwork = {
  id: MarcoBridgeNetworkId
  name: string
  family: 'evm' | 'solana'
  chain_id: number | null
  eid: number
  model: 'evm_oft_adapter' | 'evm_oft' | 'solana_oft'
  token: string
  token_decimals: number
  endpoint_contract: string
  requires_approval: boolean
  paused: boolean
}

export type CanonicalMmnRoute = {
  from: MarcoBridgeNetworkId
  to: MarcoBridgeNetworkId
  certified: boolean
  publicly_active: boolean
  execution_enabled: boolean
  paused: boolean
  reason: string
}

export type CanonicalMmnRouteState = {
  binding_version: string
  updated_at: string
  hub: 'bnb'
  global_execution_enabled: boolean
  networks: CanonicalMmnNetwork[]
  routes: CanonicalMmnRoute[]
}

type CanonicalMmnEnvelope = {
  schema_version: string
  provenance: string
  data: CanonicalMmnRouteState
}

const sameIdentity = (left: string, right: string, family: 'evm' | 'solana') =>
  family === 'evm' ? left.toLowerCase() === right.toLowerCase() : left === right

export function assertCanonicalRouteAuthority(payload: unknown): CanonicalMmnRouteState {
  if (!payload || typeof payload !== 'object') throw new Error('Canonical MMN route authority returned invalid data.')
  const envelope = payload as Partial<CanonicalMmnEnvelope>
  if (envelope.schema_version !== '1' || envelope.provenance !== 'canonical_registry' || !envelope.data) {
    throw new Error('Canonical MMN route authority provenance is invalid.')
  }

  const state = envelope.data
  if (state.hub !== 'bnb') {
    throw new Error('Canonical MMN hub must remain BNB.')
  }
  if (!Array.isArray(state.networks) || !Array.isArray(state.routes)) {
    throw new Error('Canonical MMN route authority is incomplete.')
  }
  if (state.networks.some((network) => network.chain_id === 62831)) {
    throw new Error('Retired Robinhood chain ID 62831 is forbidden.')
  }

  for (const id of Object.keys(MARCO_WAVE1_NETWORKS) as MarcoBridgeNetworkId[]) {
    const expected = MARCO_WAVE1_NETWORKS[id]
    const actual = state.networks.find((network) => network.id === id)
    if (!actual) throw new Error(`Canonical MMN network ${id} is missing.`)
    if (
      actual.family !== expected.walletFamily ||
      actual.chain_id !== expected.chainId ||
      actual.eid !== expected.layerZeroEid ||
      actual.token_decimals !== expected.tokenDecimals ||
      !sameIdentity(actual.token, expected.marcoIdentity, actual.family) ||
      !sameIdentity(actual.endpoint_contract, expected.endpointContract, actual.family)
    ) {
      throw new Error(`Canonical MMN binding mismatch for ${id}.`)
    }
  }

  const base = state.networks.find((network) => network.id === 'base')
  const robinhood = state.networks.find((network) => network.id === 'robinhood')
  const retiredAdapter = MARCO_WAVE1_NETWORKS.bnb.endpointContract.toLowerCase()
  if (base?.token.toLowerCase() === retiredAdapter || robinhood?.token.toLowerCase() === retiredAdapter) {
    throw new Error('Retired BNB adapter cannot be used as Base or Robinhood canonical MARCO.')
  }
  if (
    state.routes.some(
      (route) =>
        (route.from === 'base' || route.to === 'base') && (route.publicly_active || route.execution_enabled),
    )
  ) {
    throw new Error('Base MMN routes must remain disabled.')
  }
  for (const expected of MARCO_WAVE1_DIRECT_ROUTES) {
    const actual = state.routes.find((route) => route.from === expected.from && route.to === expected.to)
    if (!actual?.certified) throw new Error(`Canonical MMN route ${expected.from}->${expected.to} is not certified.`)
  }

  return state
}

export async function fetchCanonicalRouteAuthority(fetcher: typeof fetch = fetch): Promise<CanonicalMmnRouteState> {
  const response = await fetcher(CANONICAL_MMN_ROUTE_STATE_URL, {
    method: 'GET',
    headers: { accept: 'application/json' },
    cache: 'no-store',
  })
  if (!response.ok) throw new Error(`Canonical MMN route authority failed with HTTP ${response.status}.`)
  const state = assertCanonicalRouteAuthority(await response.json())
  try {
    return applyLiveSolanaPauseOverlay(state, await readLiveSolanaOftPaused())
  } catch {
    return applyLiveSolanaPauseOverlay(state, true)
  }
}
