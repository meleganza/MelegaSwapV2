import type { CanonicalMmnRouteState } from './routeAuthority'
import { SOLANA_OFT_PROGRAM_ID } from './solanaUnpause'
import type { MarcoBridgeNetworkId } from './types'
import { MARCO_WAVE1_NETWORKS } from './wave1Registry'

/**
 * Certified application binding for the single public MARCO OFT Adapter route:
 * BNB Smart Chain (chainId 56 / EID 30102) → Solana (EID 30168).
 *
 * On-chain store pause is the infrastructure truth. This binding does not flip
 * global_execution_enabled and does not open Solana source, Base, or Robinhood
 * direct Solana routes.
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

export function isCanonicalBnbSolanaRoute(from: MarcoBridgeNetworkId, to: MarcoBridgeNetworkId): boolean {
  return from === CANONICAL_BNB_SOLANA_GATE.from && to === CANONICAL_BNB_SOLANA_GATE.to
}

export function applyCanonicalBnbSolanaApplicationGate(
  authority: CanonicalMmnRouteState,
  input: { solanaStorePaused: boolean },
): CanonicalMmnRouteState {
  const solanaStorePaused = input.solanaStorePaused
  return {
    ...authority,
    networks: authority.networks.map((network) =>
      network.id === 'solana' ? { ...network, paused: solanaStorePaused } : network,
    ),
    routes: authority.routes.map((route) => {
      if (isCanonicalBnbSolanaRoute(route.from, route.to)) {
        return {
          ...route,
          paused: solanaStorePaused,
          publicly_active: !solanaStorePaused,
          execution_enabled: !solanaStorePaused,
          reason: solanaStorePaused ? 'Solana OFT store is paused.' : CANONICAL_BNB_SOLANA_GATE_REASON,
        }
      }
      if (route.from === 'solana' || route.to === 'solana') {
        return {
          ...route,
          publicly_active: false,
          execution_enabled: false,
          reason: 'Only the canonical BNB→Solana route is publicly activated.',
        }
      }
      return route
    }),
  }
}
