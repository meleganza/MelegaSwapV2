import type { CanonicalMmnNetwork, CanonicalMmnRoute, CanonicalMmnRouteState } from './routeAuthority'
import { SOLANA_OFT_PROGRAM_ID } from './solanaUnpause'
import type { MarcoBridgeNetworkId } from './types'
import { localRouteActivationEnabled, MARCO_WAVE1_NETWORKS } from './wave1Registry'

/**
 * Certified application binding for the BNB-hub MARCO OFT pair:
 * BNB Smart Chain (chainId 56 / EID 30102) ↔ Solana (EID 30168).
 *
 * On-chain store pause is the infrastructure truth. This binding does not flip
 * global_execution_enabled and does not open Solana↔Base, Solana↔Robinhood, or
 * any other direct Solana route.
 */
export const CANONICAL_BNB_SOLANA_GATE = {
  from: 'bnb',
  to: 'solana',
  srcChainId: 56,
  srcEid: 30102,
  dstEid: 30168,
  token: MARCO_WAVE1_NETWORKS.bnb.marcoIdentity,
  oftAdapter: MARCO_WAVE1_NETWORKS.bnb.endpointContract,
  programId: SOLANA_OFT_PROGRAM_ID,
  mint: MARCO_WAVE1_NETWORKS.solana.marcoIdentity,
  store: MARCO_WAVE1_NETWORKS.solana.endpointContract,
  recipientExample: '2LxBuA9o3AwNyFnXsqbZnKFzyuw9WarYydknQXQieRzb',
  recipientAtaExample: 'Ga2zsrDSs9TaCtUo1LVT3CoAmJQHpEVpSDk1E1C4mGSK',
  extraOptions: '0x',
  unpauseTx: '4CDyThR9JDebAqQPHW4bAZ7VkHJcrnn6MATFbAQMrBS7cFk6dyVPQ7LXUzK8Yw6YGJC3gwGsXC9iyjCYFhivuxQ3',
} as const

/**
 * Certified snapshot after the historical SetPause(paused=false) transaction.
 * Audit metadata only — never used as runtime pause truth.
 */
export const CANONICAL_SOLANA_OFT_STORE_PAUSED = false

export const CANONICAL_BNB_SOLANA_GATE_REASON = 'Canonical BNB→Solana application gate is active.'
export const CANONICAL_SOLANA_BNB_GATE_REASON = 'Canonical Solana→BNB application gate is active.'
export const CANONICAL_BNB_ROBINHOOD_GATE_REASON = 'Canonical BNB→Robinhood application gate is active.'
export const CANONICAL_ROBINHOOD_BNB_GATE_REASON = 'Canonical Robinhood→BNB application gate is active.'
export const CANONICAL_BNB_ARC_GATE_REASON = 'Canonical BNB→Arc application gate is active.'
export const CANONICAL_ARC_BNB_GATE_REASON = 'Canonical Arc→BNB application gate is active.'

export function isCanonicalBnbSolanaRoute(from: MarcoBridgeNetworkId, to: MarcoBridgeNetworkId): boolean {
  return from === CANONICAL_BNB_SOLANA_GATE.from && to === CANONICAL_BNB_SOLANA_GATE.to
}

export function isCanonicalSolanaBnbRoute(from: MarcoBridgeNetworkId, to: MarcoBridgeNetworkId): boolean {
  return from === 'solana' && to === 'bnb'
}

export function isCanonicalBnbSolanaHubRoute(from: MarcoBridgeNetworkId, to: MarcoBridgeNetworkId): boolean {
  return isCanonicalBnbSolanaRoute(from, to) || isCanonicalSolanaBnbRoute(from, to)
}

export function isCanonicalBnbRobinhoodHubRoute(from: MarcoBridgeNetworkId, to: MarcoBridgeNetworkId): boolean {
  return (from === 'bnb' && to === 'robinhood') || (from === 'robinhood' && to === 'bnb')
}

export function isCanonicalBnbArcHubRoute(from: MarcoBridgeNetworkId, to: MarcoBridgeNetworkId): boolean {
  return (from === 'bnb' && to === 'arc') || (from === 'arc' && to === 'bnb')
}

export function canonicalArcNetworkBinding(): CanonicalMmnNetwork {
  const arc = MARCO_WAVE1_NETWORKS.arc
  return {
    id: 'arc',
    name: arc.label,
    family: 'evm',
    chain_id: arc.chainId,
    eid: arc.layerZeroEid,
    model: 'evm_oft',
    token: arc.marcoIdentity,
    token_decimals: arc.tokenDecimals,
    endpoint_contract: arc.endpointContract,
    requires_approval: false,
    paused: false,
  }
}

function certifiedArcHubRoute(from: 'bnb' | 'arc', to: 'bnb' | 'arc'): CanonicalMmnRoute {
  return {
    from,
    to,
    certified: true,
    publicly_active: false,
    execution_enabled: false,
    paused: false,
    reason: 'Certified BNB↔Arc LayerZero route.',
  }
}

/** Bind certified Arc Mainnet when live MMN has not published the network yet. */
export function withCertifiedArcBinding(authority: CanonicalMmnRouteState): CanonicalMmnRouteState {
  const networks = authority.networks.some((network) => network.id === 'arc')
    ? authority.networks
    : [...authority.networks, canonicalArcNetworkBinding()]
  const routes = [...authority.routes]
  if (!routes.some((route) => route.from === 'bnb' && route.to === 'arc')) {
    routes.push(certifiedArcHubRoute('bnb', 'arc'))
  }
  if (!routes.some((route) => route.from === 'arc' && route.to === 'bnb')) {
    routes.push(certifiedArcHubRoute('arc', 'bnb'))
  }
  return { ...authority, networks, routes }
}

export function applyCanonicalBnbSolanaApplicationGate(
  authority: CanonicalMmnRouteState,
  input: { solanaStorePaused: boolean },
): CanonicalMmnRouteState {
  const bound = withCertifiedArcBinding(authority)
  const solanaStorePaused = input.solanaStorePaused
  return {
    ...bound,
    networks: bound.networks.map((network) =>
      network.id === 'solana' ? { ...network, paused: solanaStorePaused } : network,
    ),
    routes: bound.routes.map((route) => {
      if (isCanonicalBnbSolanaHubRoute(route.from, route.to)) {
        return {
          ...route,
          paused: solanaStorePaused,
          publicly_active: !solanaStorePaused,
          execution_enabled: !solanaStorePaused,
          reason: solanaStorePaused
            ? 'Solana OFT store is paused.'
            : isCanonicalSolanaBnbRoute(route.from, route.to)
            ? CANONICAL_SOLANA_BNB_GATE_REASON
            : CANONICAL_BNB_SOLANA_GATE_REASON,
        }
      }
      if (route.from === 'solana' || route.to === 'solana') {
        return {
          ...route,
          publicly_active: false,
          execution_enabled: false,
          reason: 'Only the certified BNB↔Solana hub pair is publicly activated.',
        }
      }
      if (isCanonicalBnbRobinhoodHubRoute(route.from, route.to)) {
        const source = bound.networks.find((network) => network.id === route.from)
        const destination = bound.networks.find((network) => network.id === route.to)
        const paused = Boolean(route.paused || source?.paused || destination?.paused)
        const active =
          !paused &&
          route.certified === true &&
          localRouteActivationEnabled(route.from, route.to) &&
          Boolean(source && destination)
        return {
          ...route,
          publicly_active: active,
          execution_enabled: active,
          reason: active
            ? route.from === 'robinhood'
              ? CANONICAL_ROBINHOOD_BNB_GATE_REASON
              : CANONICAL_BNB_ROBINHOOD_GATE_REASON
            : route.reason,
        }
      }
      if (isCanonicalBnbArcHubRoute(route.from, route.to)) {
        const source = bound.networks.find((network) => network.id === route.from)
        const destination = bound.networks.find((network) => network.id === route.to)
        const paused = Boolean(route.paused || source?.paused || destination?.paused)
        const active =
          !paused &&
          route.certified === true &&
          localRouteActivationEnabled(route.from, route.to) &&
          Boolean(source && destination)
        return {
          ...route,
          publicly_active: active,
          execution_enabled: active,
          reason: active
            ? route.from === 'arc'
              ? CANONICAL_ARC_BNB_GATE_REASON
              : CANONICAL_BNB_ARC_GATE_REASON
            : route.reason,
        }
      }
      return route
    }),
  }
}
