/**
 * KAP-006C/E — Accepted LP submit deferral.
 *
 * liquidityRuntime is the canonical Civilization Liquidity owner for LP mint/burn UX.
 * Wallet submit for mint/burn remains direct via router contract hooks because
 * execution-ingress does not yet support liquidity-domain dispatch
 * (ingress validator rejects domain !== swap|bridge).
 *
 * Constitutional boundaries preserved:
 * - No settlement authority
 * - No reward authority (Farms/Pools own rewards separately)
 * - No Treasury computation
 * - No Gravity computation
 * - No Opportunity Truth
 */
export const LP_SUBMIT_DEFERRAL = {
  canonicalOwner: 'liquidityRuntime',
  canonicalRoute: '/liquidity-studio',
  submitPath: 'direct-wallet-router',
  ingressSupported: false,
  deferralReason: 'execution-ingress-unsupported-liquidity-domain',
  forbiddenAuthorities: [
    'settlement',
    'treasury-settlement-computation',
    'reward-computation',
    'gravity-computation',
    'opportunity-truth',
  ] as const,
} as const

export function assertLpSubmitDeferralDocumented(): boolean {
  return (
    LP_SUBMIT_DEFERRAL.canonicalOwner === 'liquidityRuntime' &&
    LP_SUBMIT_DEFERRAL.ingressSupported === false &&
    LP_SUBMIT_DEFERRAL.forbiddenAuthorities.includes('settlement')
  )
}
