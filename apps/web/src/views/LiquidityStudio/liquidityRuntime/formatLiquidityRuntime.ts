import { BigNumber } from '@ethersproject/bignumber'
import { Currency, CurrencyAmount, Percent } from '@pancakeswap/sdk'
import { PoolData } from 'state/info/types'

export const formatUsd = (value?: number | null): string => {
  if (value === undefined || value === null || !Number.isFinite(value) || value <= 0) return '—'
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`
  return `$${value.toFixed(2)}`
}

export const formatPct = (value?: number | null, digits = 2): string => {
  if (value === undefined || value === null || !Number.isFinite(value)) return '—'
  return `${value.toFixed(digits)}%`
}

export const formatPctChange = (value?: number | null): string | undefined => {
  if (value === undefined || value === null || !Number.isFinite(value)) return undefined
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(2)}%`
}

export const formatAmount = (amount?: CurrencyAmount<Currency> | null, fallback = '0.0'): string => {
  if (!amount || amount.equalTo(0)) return fallback
  const sig = amount.toSignificant(6)
  return sig.length > 12 ? amount.toFixed(4) : sig
}

export const formatPercentShare = (pct?: Percent | null): string => {
  if (!pct) return '0.00%'
  return `${pct.toFixed(2)}%`
}

export const formatSlippage = (bps: number): string => `${(bps / 100).toFixed(2)}%`

export const formatGasEstimate = (gasPrice?: BigNumber | null): string => {
  if (!gasPrice) return '—'
  const wei = gasPrice.mul(350_000)
  const gwei = parseFloat(wei.toString()) / 1e18
  if (gwei < 0.001) return '<0.001 BNB'
  return `~${gwei.toFixed(4)} BNB`
}

export const pairLabel = (a?: Currency | null, b?: Currency | null): string => {
  const symA = a?.symbol ?? '?'
  const symB = b?.symbol ?? '?'
  return `${symA} / ${symB}`
}

export const ratioLabels = (
  amountA?: CurrencyAmount<Currency>,
  amountB?: CurrencyAmount<Currency>,
  price?: { toSignificant: (sig: number) => string },
): { left: string; right: string; leftPct: number; rightPct: number } => {
  const a = amountA ? parseFloat(amountA.toSignificant(6)) : 0
  const b = amountB ? parseFloat(amountB.toSignificant(6)) : 0
  if (!a && !b) return { left: '50', right: '50', leftPct: 50, rightPct: 50 }
  const rate = price ? parseFloat(price.toSignificant(6)) || 1 : 1
  const normalizedA = a * rate
  const total = normalizedA + b
  if (total <= 0) return { left: '50', right: '50', leftPct: 50, rightPct: 50 }
  const leftPct = Math.round((normalizedA / total) * 100)
  return { left: String(leftPct), right: String(100 - leftPct), leftPct, rightPct: 100 - leftPct }
}

export const poolMetricsFromData = (pool?: PoolData) => ({
  tvl: formatUsd(pool?.liquidityUSD),
  tvlChange: formatPctChange(pool?.liquidityUSDChange),
  volume: formatUsd(pool?.volumeUSD),
  volumeChange: formatPctChange(pool?.volumeUSDChange),
  apr: formatPct(pool?.lpApr7d),
  aprChange: formatPctChange(pool?.lpApr7dChange),
  fees: formatUsd(pool?.lpFees24h),
  feesChange: formatPctChange(pool?.lpFees24hChange),
})

export const estimateImpermanentLossPct = (priceChangePct = 0): string => {
  if (!Number.isFinite(priceChangePct) || priceChangePct === 0) return '0.00%'
  const r = 1 + priceChangePct / 100
  if (r <= 0) return '—'
  const il = (2 * Math.sqrt(r)) / (1 + r) - 1
  return `${(il * 100).toFixed(2)}%`
}
