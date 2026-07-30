/**
 * Canonical Melega DEX 24H USD volume — WBNB-side notional only, once per swap.
 * Candle `quoteVolume` is token1 amount and must NOT be treated as WBNB unless token1 is WBNB.
 */

export const WBNB_BSC = '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c'

export type PairVolumeContribution = {
  pairAddress: string
  token0: string
  token1: string
  baseVolume: number
  quoteVolume: number
  wbnbVolume: number
  usdVolume: number | null
  priced: boolean
  priceSource: 'bnb-usd' | 'unpriced'
  reason?: string
}

export function isWbnbAddress(addr?: string | null): boolean {
  return Boolean(addr && addr.toLowerCase() === WBNB_BSC)
}

/** Extract WBNB-side volume from UniswapV2-style base(token0)/quote(token1) candle totals. */
export function wbnbVolumeFromPairSides(input: {
  token0: string
  token1: string
  baseVolume: number
  quoteVolume: number
}): { wbnbVolume: number; priced: boolean; reason?: string } {
  const t0 = (input.token0 || '').toLowerCase()
  const t1 = (input.token1 || '').toLowerCase()
  const base = Number(input.baseVolume) || 0
  const quote = Number(input.quoteVolume) || 0
  if (t1 === WBNB_BSC) {
    return { wbnbVolume: quote > 0 ? quote : 0, priced: quote > 0 }
  }
  if (t0 === WBNB_BSC) {
    return { wbnbVolume: base > 0 ? base : 0, priced: base > 0 }
  }
  return { wbnbVolume: 0, priced: false, reason: 'neither-side-wbnb' }
}

export function pairContributionUsd(input: {
  pairAddress: string
  token0: string
  token1: string
  baseVolume: number
  quoteVolume: number
  bnbUsd: number | null | undefined
}): PairVolumeContribution {
  const { wbnbVolume, priced, reason } = wbnbVolumeFromPairSides(input)
  const bnbUsd = input.bnbUsd
  const usd =
    priced && bnbUsd != null && Number.isFinite(bnbUsd) && bnbUsd > 0 ? wbnbVolume * bnbUsd : null
  return {
    pairAddress: input.pairAddress.toLowerCase(),
    token0: input.token0.toLowerCase(),
    token1: input.token1.toLowerCase(),
    baseVolume: Number(input.baseVolume) || 0,
    quoteVolume: Number(input.quoteVolume) || 0,
    wbnbVolume,
    usdVolume: usd,
    priced: usd != null && usd > 0,
    priceSource: usd != null && usd > 0 ? 'bnb-usd' : 'unpriced',
    reason,
  }
}

/** Jump detection — retain last-good when total jumps by >1000× vs prior with sparse pairs. */
export function isVolumeAnomaly(input: {
  nextUsd: number
  lastGoodUsd: number | null | undefined
  pricedPairCount: number
}): boolean {
  if (!(input.nextUsd > 0)) return false
  if (input.lastGoodUsd == null || !(input.lastGoodUsd > 0)) {
    // Absolute magnitude guard without prior: > $10B on few pairs is implausible for this DEX.
    return input.nextUsd > 10_000_000_000 && input.pricedPairCount <= 8
  }
  const ratio = input.nextUsd / input.lastGoodUsd
  return ratio > 1000 || ratio < 1 / 1000
}

export function sumPricedUsd(rows: PairVolumeContribution[]): {
  totalUsd: number
  unpricedWbnb: number
  pricedPairCount: number
} {
  let totalUsd = 0
  let unpricedWbnb = 0
  let pricedPairCount = 0
  for (const row of rows) {
    if (row.usdVolume != null && row.usdVolume > 0) {
      totalUsd += row.usdVolume
      pricedPairCount += 1
    } else {
      unpricedWbnb += row.wbnbVolume
    }
  }
  return { totalUsd, unpricedWbnb, pricedPairCount }
}
