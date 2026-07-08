import type { ExecutionManifest } from './execution-manifest'
import { buildCapabilityManifest } from './capability-manifest'
import { resolveSmartRouterPolicies, resolvePricingPolicy } from './policy-engine'
import { getTreasuryCollectorEntry } from './treasuryCollectorRegistry'

/** What can this Smart Router do? */
export function describeSmartRouterCapabilities(chainId?: number) {
  return buildCapabilityManifest(chainId)
}

/** What happened during this swap? */
export function describeExecution(manifest: ExecutionManifest) {
  return manifest
}

/** Why was this fee charged? */
export function explainFeeCharge(buyMarcoApplied: boolean) {
  const pricing = resolvePricingPolicy()
  return {
    question: 'Why was this fee charged?',
    pricingPolicy: pricing.policyRef,
    policyVersion: pricing.version,
    appliedBps: buyMarcoApplied ? pricing.protocolFeeBuyMarcoBps : pricing.protocolFeeStandardBps,
    standardBps: pricing.protocolFeeStandardBps,
    buyMarcoBps: pricing.protocolFeeBuyMarcoBps,
    buyMarcoRule: pricing.buyMarcoRule,
    reason: buyMarcoApplied
      ? 'BUY MARCO incentive: output token matches chain MARCO address.'
      : 'Standard D87 protocol fee applies.',
    lpFeePolicy: pricing.lpFeePolicy,
    lpFeeNote: pricing.lpFeeNote,
  }
}

/** Why was Treasury selected? */
export function explainTreasurySelection(chainId: number) {
  const collector = getTreasuryCollectorEntry(chainId)
  const policies = resolveSmartRouterPolicies(chainId)
  return {
    question: 'Why was Treasury selected?',
    treasuryPolicy: policies.treasury.policyRef,
    collectorAddress: collector.collectorAddress ?? null,
    collectorSource: collector.source,
    collectorStatus: collector.status,
    registryVersion: collector.registryVersion,
    resolutionOrder: policies.registry.find((r) => r.policyRef === 'treasury-runtime-registry')?.resolutionOrder,
    reason:
      collector.collectorAddress
        ? `Collector resolved from ${collector.source} registry for chain ${chainId}.`
        : 'Treasury Runtime collector not yet published — swaps blocked until publication.',
  }
}
