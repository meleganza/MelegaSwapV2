import { getMarcoRegistryEntry } from './marcoRegistry'
import { getTreasuryCollectorEntry } from './treasuryCollectorRegistry'
import { getUnderlyingRouterEntry } from './underlyingRouterRegistry'
import { MELEGA_SMART_ROUTER_ARCHITECTURE } from './types'

export function getSmartRouterReadiness(chainId: number) {
  const marco = getMarcoRegistryEntry(chainId)
  const collector = getTreasuryCollectorEntry(chainId)
  const router = getUnderlyingRouterEntry(chainId)

  const blockers: string[] = []
  if (marco.status === 'missing') blockers.push('BLOCKED_CONFIG_MARCO_TOKEN_MISSING')
  if (!collector.collectorAddress || collector.status !== 'active') {
    blockers.push('BLOCKED_TREASURY_COLLECTOR_MISSING')
  }
  if (router.status === 'missing') blockers.push('BLOCKED_UNDERLYING_ROUTER_MISSING')

  return {
    architecture: MELEGA_SMART_ROUTER_ARCHITECTURE,
    chainId,
    ready: blockers.length === 0,
    blockers,
    marco,
    collector,
    router,
  }
}

export function getMultiChainArchitectureNotes() {
  return {
    evm: {
      phase1: [56, 97],
      planned: [1, 137, 8453],
      note: 'Chain-specific router adapters, MARCO registry entries, and treasury collectors required per chain.',
    },
    solana: {
      status: 'non_evm_architecture_note_only',
      note: 'Solana requires a separate non-EVM settlement and routing architecture. Not in Phase 1 scope.',
    },
  }
}
