/**
 * Fee enforcement methods a venue adapter may declare.
 * M2 documents capability. Does not deploy wrappers or collect.
 */

export const FEE_ENFORCEMENT_METHOD = {
  NATIVE_INSIDE_EXECUTION: 'NATIVE_INSIDE_EXECUTION',
  WRAPPER_ROUTER: 'WRAPPER_ROUTER',
  AGGREGATOR_SUPPORTED: 'AGGREGATOR_SUPPORTED',
  SETTLEMENT_CONTRACT: 'SETTLEMENT_CONTRACT',
  NOT_ENFORCEABLE: 'NOT_ENFORCEABLE',
} as const

export type FeeEnforcementMethod = (typeof FEE_ENFORCEMENT_METHOD)[keyof typeof FEE_ENFORCEMENT_METHOD]

export const CANONICAL_SMARTSWAP_FEE_BENEFICIARY = '0xb6436EF4c7f76bE0f26c0C5C9dB72F2689abF65b' as const

export function assertCanonicalFeeBeneficiary(address: string | null | undefined): string {
  if (!address || address.toLowerCase() !== CANONICAL_SMARTSWAP_FEE_BENEFICIARY.toLowerCase()) {
    throw new Error('FEE_BENEFICIARY_NOT_CANONICAL')
  }
  return CANONICAL_SMARTSWAP_FEE_BENEFICIARY
}

export function adapterMayNotSubstituteBeneficiary(proposed: string | null | undefined): void {
  assertCanonicalFeeBeneficiary(proposed)
}
