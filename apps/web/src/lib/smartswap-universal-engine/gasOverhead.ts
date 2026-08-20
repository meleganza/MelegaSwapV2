/**
 * Executor gas overhead vs a direct venue swap.
 * Band selection MUST NOT use this number. TOTAL_EXECUTION_COST may include it later.
 */

export const GAS_OVERHEAD_KIND = {
  LOCAL_SIMULATION: 'LOCAL_SIMULATION',
  FORK_UNAVAILABLE: 'FORK_UNAVAILABLE',
  SYNTHETIC: 'SYNTHETIC',
} as const

export interface GasOverheadObservation {
  kind: (typeof GAS_OVERHEAD_KIND)[keyof typeof GAS_OVERHEAD_KIND]
  venueId: string
  chainId: number
  directGasUnits: number | null
  feeEnforcedGasUnits: number | null
  overheadUnits: number | null
  overheadPercent: number | null
}

export function recordGasOverhead(input: {
  venueId: string
  chainId: number
  kind: GasOverheadObservation['kind']
  directGasUnits: number | null
  feeEnforcedGasUnits: number | null
}): GasOverheadObservation {
  const overhead =
    input.directGasUnits != null && input.feeEnforcedGasUnits != null
      ? input.feeEnforcedGasUnits - input.directGasUnits
      : null
  const overheadPercent =
    overhead != null && input.directGasUnits && input.directGasUnits > 0
      ? (overhead / input.directGasUnits) * 100
      : null
  return {
    kind: input.kind,
    venueId: input.venueId,
    chainId: input.chainId,
    directGasUnits: input.directGasUnits,
    feeEnforcedGasUnits: input.feeEnforcedGasUnits,
    overheadUnits: overhead,
    overheadPercent,
  }
}
