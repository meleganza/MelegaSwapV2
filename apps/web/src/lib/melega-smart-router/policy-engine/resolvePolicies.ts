import { D87_DEX_PRICING_RATIFIED, FSC_01 } from 'lib/d87-pricing/codex/ratified'
import { getMarcoRegistryEntry } from '../marcoRegistry'
import { getTreasuryCollectorEntry } from '../treasuryCollectorRegistry'
import { getUnderlyingRouterEntry } from '../underlyingRouterRegistry'
import { MELEGA_SMART_ROUTER_ARCHITECTURE, MELEGA_SMART_ROUTER_PHASE } from '../types'
import { getKerlRegistryVersion } from '../registry/kerlRegistry'
import { getSmartRouterRegistryVersion } from '../registry/smartRouterRegistry'
import { getTreasuryRuntimeRegistryVersion } from '../registry/runtimeRegistry'
import { readSmartRouterChainProfile } from '../registry/smartRouterRegistry'
import {
  POLICY_ENGINE_SCHEMA,
  POLICY_ENGINE_VERSION,
  type SmartRouterPolicyBundle,
} from './types'

export function resolvePricingPolicy() {
  const swap = D87_DEX_PRICING_RATIFIED.services.swap
  return {
    policyRef: 'D87_DEX_PRICING_RATIFIED' as const,
    version: D87_DEX_PRICING_RATIFIED.version,
    protocolFeeStandardBps: swap.protocolFeeStandardBps,
    protocolFeeBuyMarcoBps: swap.protocolFeeBuyMarcoBps,
    buyMarcoRule: swap.buyMarcoRule,
    lpFeePolicy: D87_DEX_PRICING_RATIFIED.lpFee.policy,
    lpFeeNote: D87_DEX_PRICING_RATIFIED.lpFee.note,
  }
}

export function resolveTreasuryPolicy() {
  return {
    policyRef: 'FSC-01' as const,
    version: FSC_01.version,
    dexPolicy: FSC_01.dexPolicy,
    owner: FSC_01.owner,
    settlementOwner: 'Treasury Runtime',
  }
}

export function resolveRegistryPolicies() {
  return [
    {
      policyRef: 'smart-router-registry' as const,
      version: getSmartRouterRegistryVersion(),
      resolutionOrder: ['runtime', 'kerl', 'env', 'static-dev'],
      disclaimer: 'Smart Router registry is read-only. DEX never fabricates addresses.',
    },
    {
      policyRef: 'treasury-runtime-registry' as const,
      version: getTreasuryRuntimeRegistryVersion(),
      resolutionOrder: ['treasury-runtime', 'kerl', 'env'],
      disclaimer: 'Treasury Runtime owns collector truth.',
    },
    {
      policyRef: 'kerl-registry' as const,
      version: getKerlRegistryVersion(),
      resolutionOrder: ['kerl', 'env', 'static-dev'],
      disclaimer: 'KERL attestation for MARCO and treasury metadata.',
    },
  ]
}

export function resolveExecutionPolicy() {
  return {
    policyRef: 'melega.execution-policy.v1' as const,
    version: POLICY_ENGINE_VERSION,
    architecture: MELEGA_SMART_ROUTER_ARCHITECTURE,
    targetArchitecture: MELEGA_SMART_ROUTER_PHASE.target,
    exactInput: 'supported' as const,
    exactOutput: 'blocked' as const,
    feeOnTransfer: 'blocked' as const,
    settlementLayer: 'treasury-runtime' as const,
  }
}

export function resolveCompliancePolicy() {
  return {
    policyRef: 'melega.compliance-policy.v1' as const,
    version: POLICY_ENGINE_VERSION,
    dexOwnsSettlement: false as const,
    forwardsGrossProtocolFeeOnly: true as const,
    forbiddenLocalOperations: [
      'fee waterfall splits',
      'referral distribution',
      'buyback execution',
      'FSC-01 settlement',
    ],
  }
}

export function resolveChainPolicy(chainId: number) {
  const profile = readSmartRouterChainProfile(chainId)
  const marco = getMarcoRegistryEntry(chainId)
  const collector = getTreasuryCollectorEntry(chainId)
  const router = getUnderlyingRouterEntry(chainId)

  return {
    policyRef: 'melega.chain-policy.v1' as const,
    version: POLICY_ENGINE_VERSION,
    chainId,
    chainName: profile?.chainName ?? `chain-${chainId}`,
    executionRouter: router.routerAddress,
    wrapperStatus: profile?.wrapperStatus ?? 'planned',
    collectorStatus: collector.status,
    marcoStatus: marco.status,
  }
}

/** Resolve the full policy bundle for a chain — execution consumes policies, not constants. */
export function resolveSmartRouterPolicies(chainId?: number): SmartRouterPolicyBundle {
  return {
    schema: POLICY_ENGINE_SCHEMA,
    engineVersion: POLICY_ENGINE_VERSION,
    pricing: resolvePricingPolicy(),
    treasury: resolveTreasuryPolicy(),
    registry: resolveRegistryPolicies(),
    execution: resolveExecutionPolicy(),
    compliance: resolveCompliancePolicy(),
    chain: chainId ? resolveChainPolicy(chainId) : undefined,
  }
}
