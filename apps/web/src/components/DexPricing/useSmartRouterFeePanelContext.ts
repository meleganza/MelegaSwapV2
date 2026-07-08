import { useMemo } from 'react'
import { useActiveChainId } from 'hooks/useActiveChainId'
import {
  getMarcoRegistryEntry,
  getTreasuryCollectorEntry,
  getUnderlyingRouterEntry,
  MELEGA_SMART_ROUTER_PHASE,
  readSmartRouterChainProfile,
} from 'lib/melega-smart-router'

export function useSmartRouterFeePanelContext() {
  const { chainId } = useActiveChainId()

  return useMemo(() => {
    if (!chainId) return null

    const marco = getMarcoRegistryEntry(chainId)
    const collector = getTreasuryCollectorEntry(chainId)
    const execution = getUnderlyingRouterEntry(chainId)
    const profile = readSmartRouterChainProfile(chainId)

    return {
      phase: MELEGA_SMART_ROUTER_PHASE,
      executionRouter: execution.routerAddress ?? '—',
      executionRouterLabel: profile?.executionRouterLabel ?? 'PancakeSwap Smart Router',
      wrapperStatus: profile?.wrapperStatus ?? 'planned',
      wrapperAddress: profile?.wrapperAddress ?? 'Planned (not deployed)',
      protocolWrapperLabel: `Phase 1 ${MELEGA_SMART_ROUTER_PHASE.current} → Target ${MELEGA_SMART_ROUTER_PHASE.target}`,
      collectorAddress: collector.collectorAddress ?? 'Not published',
      collectorSource: collector.source,
      collectorRegistryVersion: collector.registryVersion ?? '—',
      marcoAddress: marco.marcoTokenAddress ?? '—',
      marcoSource: marco.source,
      marcoRegistryVersion: marco.registryVersion ?? '—',
    }
  }, [chainId])
}
