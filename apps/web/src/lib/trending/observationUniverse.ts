import { isQuoteTokenAddress, pickTrendingBaseToken } from './tierTrendingModel'

export type ObservationPairInput = {
  token0?: string
  token1?: string
  classification?: string
  active?: boolean
}

/**
 * Factory tradeable bases that market observation may probe.
 * Quote / wrapped / stable plumbing is excluded. Ranking formulas are unchanged.
 */
export function collectTradeableObservationAddresses(pairs: ObservationPairInput[]): string[] {
  const addresses = new Set<string>()
  for (const pair of pairs) {
    if (pair.classification && pair.classification !== 'tradeable') continue
    if (pair.active === false) continue
    const base = pickTrendingBaseToken(pair.token0 ?? '', pair.token1 ?? '')
    if (!base || isQuoteTokenAddress(base)) continue
    addresses.add(base.toLowerCase())
  }
  return [...addresses]
}

export function mergeObservationAddresses(...groups: Array<Iterable<string> | undefined>): string[] {
  const addresses = new Set<string>()
  for (const group of groups) {
    if (!group) continue
    for (const address of group) {
      const key = address?.toLowerCase()
      if (key && /^0x[a-f0-9]{40}$/.test(key) && !isQuoteTokenAddress(key)) {
        addresses.add(key)
      }
    }
  }
  return [...addresses]
}
