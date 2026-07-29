import { FORBIDDEN_HANDOFF_PAYLOAD_FIELDS } from '../../treasury-handoff/ownership'
import type { ExecutionManifest } from '../execution-manifest/types'
import { FSC_01_POLICY_REF, D87_PRICING_REF } from '../types'
import type { CivilizationRouteType, TreasuryHandoffPreparedEvent } from './types'
import { DEX_ECONOMIC_AUTHORITY, MELEGA_TREASURY_WALLET_LABEL } from 'config/dexEconomicAuthority'

/** Phase 5 — handoff metadata only. Treasury Runtime is decommissioned. */
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
    collectorAddress: input.collectorAddress ?? DEX_ECONOMIC_AUTHORITY.beneficiaryAddress,
    protocolFee: input.executionManifest.protocolFee !== '—' ? input.executionManifest.protocolFee : null,
    handoffPath: '/api/treasury/settlement-events',
    settlementOwnedBy: 'NONE',
    forbiddenLocalSplit: true,
  }
}

export function getTreasuryRuntimeIntegrationStatus() {
  return {
    owner: MELEGA_TREASURY_WALLET_LABEL,
    status: DEX_ECONOMIC_AUTHORITY.treasuryRuntime.status,
    authority: DEX_ECONOMIC_AUTHORITY.treasuryRuntime.authority,
    runtime_dependency: DEX_ECONOMIC_AUTHORITY.treasuryRuntime.runtime_dependency,
    replacement_beneficiary: DEX_ECONOMIC_AUTHORITY.beneficiaryAddress,
    dexRole: ['route classification', 'protocol fee metadata', 'execution manifest'],
    treasuryRole: ['decommissioned — no settlement authority'],
    intakePath: '/api/treasury/settlement-events',
    upstreamPath: null,
    configured: false,
    d90Defined: false,
    d99Defined: false,
    forbiddenDexFields: [...FORBIDDEN_HANDOFF_PAYLOAD_FIELDS],
    route: 'Labs → Smart Router → non-custodial wallet execution',
    bypassAllowed: true,
  }
}
