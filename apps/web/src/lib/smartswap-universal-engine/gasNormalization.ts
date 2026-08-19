/**
 * Same-chain gas comparison. Never compare raw units across chains.
 * Without a factual native→output conversion, gas stays incomparable.
 */

export interface SameChainGasInput {
  venueId: string
  chainId: number
  gasUnits: string | null
  gasCostInOutputRaw: string | null
}

export interface SameChainGasNormalization {
  comparable: boolean
  reason: string
  costsInOutputRaw: Record<string, string | null>
}

export function normalizeSameChainGas(
  candidates: SameChainGasInput[],
  chainId: number,
): SameChainGasNormalization {
  const sameChain = candidates.filter((row) => row.chainId === chainId)
  const costs: Record<string, string | null> = {}
  for (const row of sameChain) costs[row.venueId] = row.gasCostInOutputRaw
  const haveOutputTerms = sameChain.every((row) => row.gasCostInOutputRaw != null)
  if (haveOutputTerms && sameChain.length > 0) {
    return { comparable: true, reason: 'gas-cost-in-output-units', costsInOutputRaw: costs }
  }
  return {
    comparable: false,
    reason: 'GAS_UNCOMPARABLE_NO_OUTPUT_CONVERSION',
    costsInOutputRaw: costs,
  }
}
