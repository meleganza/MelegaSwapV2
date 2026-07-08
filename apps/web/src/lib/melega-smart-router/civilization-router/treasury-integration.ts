import { isTreasuryRuntimeConfigured } from '../../treasury-handoff/config'
import { FORBIDDEN_HANDOFF_PAYLOAD_FIELDS } from '../../treasury-handoff/ownership'
import type { ExecutionManifest } from '../execution-manifest/types'
import { FSC_01_POLICY_REF, D87_PRICING_REF } from '../types'
import type { CivilizationRouteType, TreasuryHandoffPreparedEvent } from './types'

/** Phase 5 — Smart Router prepares handoff; Treasury Runtime owns settlement. */
export function buildTreasuryHandoffPrepared(input: {
  routeType: CivilizationRouteType
  chainId: number
  executionManifest: ExecutionManifest
  collectorAddress: string | null
}): TreasuryHandoffPreparedEvent | undefined {
  if (input.executionManifest.status === 'blocked') return undefined

  return {
    routeType: input.routeType,
    chainId: input.chainId,
    executionId: input.executionManifest.executionId,
    treasuryPolicyRef: FSC_01_POLICY_REF,
    pricingRef: D87_PRICING_REF,
    collectorAddress: input.collectorAddress,
    protocolFee: input.executionManifest.protocolFee !== '—' ? input.executionManifest.protocolFee : null,
    handoffPath: '/api/treasury/settlement-events',
    settlementOwnedBy: 'Treasury Runtime',
    forbiddenLocalSplit: true,
  }
}

export function getTreasuryRuntimeIntegrationStatus() {
  const configured = isTreasuryRuntimeConfigured()
  return {
    owner: 'Treasury Runtime',
    dexRole: ['route classification', 'protocol fee metadata', 'execution manifest', 'handoff preparation'],
    treasuryRole: ['FSC-01 settlement', 'D90', 'D99', 'referral settlement', 'accounting', 'treasury routing'],
    intakePath: '/api/treasury/settlement-events',
    upstreamPath: '/api/public/treasury/settlement-events',
    configured,
    d90Defined: false,
    d99Defined: false,
    forbiddenDexFields: [...FORBIDDEN_HANDOFF_PAYLOAD_FIELDS],
    route: 'Labs → Smart Router → Treasury Runtime → D99 → D90 → Treasury',
    bypassAllowed: false,
  }
}
