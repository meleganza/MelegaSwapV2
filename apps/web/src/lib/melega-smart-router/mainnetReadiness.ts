import { resolveTreasuryCollector } from './registry/resolveTreasuryCollector'
import { resolveMarcoToken } from './registry/resolveMarcoToken'
import { readSmartRouterChainProfile } from './registry/smartRouterRegistry'
import { MELEGA_SMART_ROUTER_PHASE } from './types'

export type ReadinessLevel = 'READY' | 'PARTIAL' | 'BLOCKED'

export interface ReadinessRow {
  id: string
  label: string
  level: ReadinessLevel
  reason: string
}

export function buildMainnetReadinessMatrix(chainId = 56): ReadinessRow[] {
  const collector = resolveTreasuryCollector(chainId)
  const marco = resolveMarcoToken(chainId)
  const profile = readSmartRouterChainProfile(chainId)

  return [
    {
      id: 'wrapper_abi',
      label: 'Wrapper ABI',
      level: 'READY',
      reason: 'ABI draft published at lib/melega-smart-router/wrapper/MelegaSmartRouterWrapper.abi.json',
    },
    {
      id: 'wrapper_contract',
      label: 'Wrapper contract',
      level: 'BLOCKED',
      reason: 'Solidity not deployed — Phase 2 spec only',
    },
    {
      id: 'treasury_registry',
      label: 'Treasury Registry',
      level: collector.collectorAddress ? 'PARTIAL' : 'PARTIAL',
      reason: collector.collectorAddress
        ? `Collector resolved via ${collector.resolution.source}`
        : 'Runtime registry published but collector address not indexed',
    },
    {
      id: 'marco_registry',
      label: 'MARCO Registry',
      level: marco.marcoTokenAddress ? 'READY' : 'BLOCKED',
      reason: marco.marcoTokenAddress
        ? `MARCO resolved via ${marco.resolution.source}`
        : 'MARCO address missing for chain',
    },
    {
      id: 'collector_registry',
      label: 'Collector Registry',
      level: collector.status === 'active' ? 'PARTIAL' : 'BLOCKED',
      reason:
        collector.status === 'active'
          ? 'Env fallback active — Runtime publication still required for mainnet'
          : 'BLOCKED_TREASURY_COLLECTOR_MISSING',
    },
    {
      id: 'runtime_registry',
      label: 'Runtime Registry',
      level: 'PARTIAL',
      reason: 'Read model at /registry/treasury/index.json — collector publication pending',
    },
    {
      id: 'kerl_registry',
      label: 'KERL Registry',
      level: 'PARTIAL',
      reason: 'MARCO assets indexed; collector publication not indexed',
    },
    {
      id: 'treasury_runtime',
      label: 'Treasury Runtime',
      level: 'PARTIAL',
      reason: 'Handoff receipt path live; FSC-01 settlement external',
    },
    {
      id: 'pancake_integration',
      label: 'Pancake integration',
      level: profile?.executionRouter ? 'READY' : 'BLOCKED',
      reason: profile?.executionRouter
        ? `Execution router ${profile.executionRouter}`
        : 'Underlying router missing for chain',
    },
    {
      id: 'adapter_phase',
      label: `Phase 1 ${MELEGA_SMART_ROUTER_PHASE.current}`,
      level: 'READY',
      reason: 'Economic adapter live — not removed in Phase 2',
    },
    {
      id: 'target_wrapper',
      label: `Phase 2 target ${MELEGA_SMART_ROUTER_PHASE.target}`,
      level: 'PARTIAL',
      reason: 'Specification + ABI draft complete; deployment pending',
    },
    {
      id: 'swap_ui',
      label: 'Swap UI',
      level: 'READY',
      reason: 'Fee disclosure explains execution router, wrapper target, registry sources',
    },
    {
      id: 'pricing_ui',
      label: 'Pricing UI',
      level: 'READY',
      reason: '/pricing-fees surface with D87 matrix',
    },
    {
      id: 'tests',
      label: 'Tests',
      level: 'READY',
      reason: 'Adapter + registry resolution tests passing',
    },
    {
      id: 'security_review',
      label: 'Security review',
      level: 'BLOCKED',
      reason: 'Wrapper security model documented — formal review not completed',
    },
    {
      id: 'audit',
      label: 'Audit',
      level: 'BLOCKED',
      reason: 'No wrapper contract to audit yet',
    },
    {
      id: 'mainnet_deployment',
      label: 'Mainnet deployment',
      level: 'BLOCKED',
      reason: 'Wrapper deploy + Runtime collector publication required',
    },
  ]
}

export function getPhase2Verdict(matrix: ReadinessRow[]): string {
  const blocked = matrix.filter((r) => r.level === 'BLOCKED')
  const ready = matrix.filter((r) => r.level === 'READY')
  if (blocked.some((r) => r.id === 'wrapper_contract' || r.id === 'mainnet_deployment')) {
    if (ready.length >= 6) return 'MELEGA_SMART_ROUTER_PHASE2_PARTIAL'
    return 'MELEGA_SMART_ROUTER_PHASE2_BLOCKED'
  }
  return 'MELEGA_SMART_ROUTER_PHASE2_READY'
}
