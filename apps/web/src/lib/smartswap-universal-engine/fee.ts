export const PROTOCOL_FEE_STATE = {
  FEE_UNAVAILABLE: 'FEE_UNAVAILABLE',
  FEE_PREVIEW_ONLY: 'FEE_PREVIEW_ONLY',
  FEE_ENFORCEABLE: 'FEE_ENFORCEABLE',
  FEE_VERIFIED: 'FEE_VERIFIED',
} as const

export type ProtocolFeeState = (typeof PROTOCOL_FEE_STATE)[keyof typeof PROTOCOL_FEE_STATE]

export interface ProtocolFeeFact {
  state: ProtocolFeeState
  /** Policy bps when known (D87 20/30 or gas-fee 2500). Never invented. */
  bps: number | null
  formulaId: string | null
  amountRaw: string | null
  assetSymbol: string | null
  recipient: string | null
  collectionProven: boolean
  atomicWithSwap: boolean
  productionExecutionEligible: boolean
  gapCode: string | null
}

export const SMARTSWAP_PROTOCOL_FEE_ENFORCEMENT_GAP = 'SMARTSWAP_PROTOCOL_FEE_ENFORCEMENT_GAP' as const

export function emptyFeeFact(state: ProtocolFeeState, gapCode: string | null = null): ProtocolFeeFact {
  return {
    state,
    bps: null,
    formulaId: null,
    amountRaw: null,
    assetSymbol: null,
    recipient: null,
    collectionProven: false,
    atomicWithSwap: false,
    productionExecutionEligible: false,
    gapCode,
  }
}

/**
 * A fee may never be marked collected unless collection is proven.
 * Preview numbers are not proof.
 */
export function evaluateProtocolFeeState(input: {
  calculated: boolean
  displayedInFrozenUx: boolean
  includedInExecutionPlan: boolean
  collectionEnforceable: boolean
  destinationCanonical: boolean
  collectionProven: boolean
  atomicWithSwap: boolean
}): ProtocolFeeFact {
  const collectionProven = input.collectionProven && input.collectionEnforceable && input.destinationCanonical
  if (collectionProven && !input.atomicWithSwap) {
    return emptyFeeFact(
      PROTOCOL_FEE_STATE.FEE_UNAVAILABLE,
      'NON_ATOMIC_FEE_CANNOT_BE_MARKED_COLLECTED',
    )
  }
  if (collectionProven && input.atomicWithSwap) {
    return {
      state: PROTOCOL_FEE_STATE.FEE_VERIFIED,
      bps: null,
      formulaId: null,
      amountRaw: null,
      assetSymbol: null,
      recipient: null,
      collectionProven: true,
      atomicWithSwap: true,
      productionExecutionEligible: true,
      gapCode: null,
    }
  }
  if (
    input.calculated &&
    input.displayedInFrozenUx &&
    input.includedInExecutionPlan &&
    input.collectionEnforceable &&
    input.destinationCanonical &&
    input.atomicWithSwap
  ) {
    return {
      state: PROTOCOL_FEE_STATE.FEE_ENFORCEABLE,
      bps: null,
      formulaId: null,
      amountRaw: null,
      assetSymbol: null,
      recipient: null,
      collectionProven: false,
      atomicWithSwap: true,
      productionExecutionEligible: true,
      gapCode: null,
    }
  }
  if (input.calculated && input.displayedInFrozenUx && !input.collectionEnforceable) {
    return {
      ...emptyFeeFact(PROTOCOL_FEE_STATE.FEE_PREVIEW_ONLY, SMARTSWAP_PROTOCOL_FEE_ENFORCEMENT_GAP),
      productionExecutionEligible: false,
    }
  }
  return emptyFeeFact(PROTOCOL_FEE_STATE.FEE_UNAVAILABLE, SMARTSWAP_PROTOCOL_FEE_ENFORCEMENT_GAP)
}

export function markFeeCollected(fact: ProtocolFeeFact): ProtocolFeeFact {
  if (fact.state !== PROTOCOL_FEE_STATE.FEE_VERIFIED || !fact.collectionProven) {
    throw new Error('FEE_COLLECTION_CLAIM_FORBIDDEN')
  }
  return fact
}

export function canMarkRouteProductionCapable(fact: ProtocolFeeFact): boolean {
  return (
    fact.productionExecutionEligible &&
    (fact.state === PROTOCOL_FEE_STATE.FEE_ENFORCEABLE || fact.state === PROTOCOL_FEE_STATE.FEE_VERIFIED)
  )
}
