/**
 * Decimal-safe USD valuation helpers for Featured / market surfaces.
 * Raw reserve ratios should use bigint; display conversion uses number only after scaling.
 */
import { formatCompactPriceUsd } from 'utils/formatCompactPrice'

const WBNB = '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c'

export function wbnbAddress(): string {
  return WBNB
}

/** tokenUSD = tokenBNB × bnbUSD (both must be finite and > 0). */
export function tokenUsdFromWbnbQuote(tokenPriceWbnb: number, bnbUsd: number): number | undefined {
  if (!(tokenPriceWbnb > 0) || !Number.isFinite(tokenPriceWbnb)) return undefined
  if (!(bnbUsd > 0) || !Number.isFinite(bnbUsd)) return undefined
  const usd = tokenPriceWbnb * bnbUsd
  return Number.isFinite(usd) && usd > 0 ? usd : undefined
}

export function quoteVolumeToUsd(volumeWbnb: number, bnbUsd: number): number | undefined {
  return tokenUsdFromWbnbQuote(volumeWbnb, bnbUsd)
}

/** FDV = totalSupply (human) × tokenUSD when both known. */
export function fullyDilutedValueUsd(totalSupplyHuman: number, tokenUsd: number): number | undefined {
  if (!(totalSupplyHuman > 0) || !Number.isFinite(totalSupplyHuman)) return undefined
  if (!(tokenUsd > 0) || !Number.isFinite(tokenUsd)) return undefined
  const fdv = totalSupplyHuman * tokenUsd
  return Number.isFinite(fdv) && fdv > 0 ? fdv : undefined
}

export function formatUsdCompact(value?: number | null): string {
  if (value == null || !Number.isFinite(value) || value < 0) return '—'
  if (value === 0) return '$0.00'
  if (value > 0 && value < 0.01) return '<$0.01'
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`
  if (value >= 1) return `$${value.toFixed(2)}`
  if (value >= 0.01) return `$${value.toFixed(4)}`
  return `$${value.toPrecision(3)}`
}

export function formatUsdPrice(value?: number | null): string {
  if (value == null || !Number.isFinite(value) || !(value > 0)) return 'Price updating'
  return formatCompactPriceUsd(value)
}
