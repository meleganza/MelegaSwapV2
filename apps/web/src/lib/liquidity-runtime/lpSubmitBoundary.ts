/**
 * KAP-006E — LP submit constitutional boundary.
 *
 * liquidityRuntime is the canonical Civilization Liquidity owner.
 * LP mint/burn wallet submission remains a direct router path because
 * execution-ingress does not support the liquidity instruction domain
 * (ingress validator rejects non SmartSwap/V2Swap/BridgeBurn types).
 *
 * Deferred: routing LP submit through execution-ingress when/if liquidity
 * adapters are added to ingress without expanding settlement or reward authority.
 *
 * This path must never:
 * - compute Treasury settlement
 * - compute Farms/Pools rewards
 * - claim Civilization Liquidity ownership for reward products
 */
export const LP_SUBMIT_BOUNDARY_MARKER = 'liquidity-runtime-direct-submit-deferred' as const

export const LP_SUBMIT_BOUNDARY = {
  canonicalOwner: 'liquidityRuntime' as const,
  submitPath: 'direct-router-mint-burn' as const,
  ingressSupported: false,
  deferredReason: 'execution-ingress unsupported instruction domain: liquidity',
  settlementAuthority: false,
  rewardAuthority: false,
} as const
