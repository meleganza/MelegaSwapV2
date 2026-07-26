/**
 * Presentation-only gas estimate copy.
 * Unavailable must not look like a hard execution error.
 */

export type GasEstimateUiState = 'available' | 'estimating' | 'unavailable'

export function resolveGasEstimateUiState(input: {
  availability: 'available' | 'unavailable' | 'partial' | string
  units: number | null | undefined
  estimating?: boolean
}): GasEstimateUiState {
  if (input.estimating) return 'estimating'
  if (input.availability === 'available' && input.units != null) return 'available'
  return 'unavailable'
}

export function formatGasEstimateDisplay(input: {
  availability: 'available' | 'unavailable' | 'partial' | string
  units: number | null | undefined
  estimating?: boolean
  /** Optional human amount e.g. "0.00045 BNB" when known */
  amountLabel?: string | null
}): { state: GasEstimateUiState; title: string; detail: string; tone: 'ok' | 'muted' | 'warn' } {
  const state = resolveGasEstimateUiState(input)
  if (state === 'estimating') {
    return { state, title: 'Estimating gas…', detail: '', tone: 'muted' }
  }
  if (state === 'available') {
    const value =
      input.amountLabel?.trim() ||
      (input.units != null ? `${input.units} units` : '—')
    return { state, title: 'Estimated gas', detail: value, tone: 'ok' }
  }
  return {
    state,
    title: 'Gas estimate unavailable',
    detail: 'Transaction will be simulated by wallet before signing.',
    tone: 'muted',
  }
}
