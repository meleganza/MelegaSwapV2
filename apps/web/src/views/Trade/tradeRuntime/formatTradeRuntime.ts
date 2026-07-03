import { Currency, CurrencyAmount, Percent } from '@pancakeswap/sdk'
import { RouteType } from '@pancakeswap/smart-router/evm'
import { getFullDisplayBalance } from '@pancakeswap/utils/formatBalance'
import { Field } from 'state/swap/actions'
import type { useTradeInfo } from 'views/Swap/SmartSwap/hooks/useTradeInfo'

type TradeInfo = NonNullable<ReturnType<typeof useTradeInfo>>

export function formatAmount(amount?: CurrencyAmount<Currency>): string | undefined {
  if (!amount) return undefined
  return `${getFullDisplayBalance(amount, amount.currency.decimals, 6)} ${amount.currency.symbol}`
}

export function formatPercent(percent?: Percent): string | undefined {
  if (!percent) return undefined
  return `${percent.toFixed(2)}%`
}

export function routePathLabels(tradeInfo: TradeInfo | null | undefined): string[] {
  if (!tradeInfo?.route?.path?.length) return []
  return tradeInfo.route.path.map((c) => c.symbol ?? '?')
}

export function routeHopLabel(tradeInfo: TradeInfo | null | undefined): string {
  if (!tradeInfo?.route?.path?.length) return '—'
  return routePathLabels(tradeInfo).join(' → ')
}

export function routerSourceLabel(tradeInfo: TradeInfo | null | undefined, smartRouter: boolean): string {
  if (!tradeInfo) return '—'
  if (smartRouter && !tradeInfo.fallbackV2) {
    const type = (tradeInfo.route as { routeType?: RouteType })?.routeType
    if (type === RouteType.V2) return 'MelegaSwap V2'
    if (type === RouteType.V3) return 'MelegaSwap V3'
    if (type === RouteType.STABLE) return 'StableSwap'
    if (type === RouteType.MIXED) return 'Melega Smart Router'
    return 'Melega Smart Router'
  }
  return 'MelegaSwap V2'
}

export function chainLabel(chainId?: number): string {
  if (chainId === 56) return 'BNB Chain'
  if (chainId === 1) return 'Ethereum'
  if (chainId === 137) return 'Polygon'
  if (chainId === 8453) return 'Base'
  return chainId ? `Chain ${chainId}` : '—'
}

export function compareOutputDelta(
  smartOut?: CurrencyAmount<Currency>,
  v2Out?: CurrencyAmount<Currency>,
): string | undefined {
  if (!smartOut || !v2Out) return undefined
  const smart = Number(smartOut.toSignificant(8))
  const v2 = Number(v2Out.toSignificant(8))
  if (!Number.isFinite(smart) || !Number.isFinite(v2) || v2 <= 0) return undefined
  const pct = ((smart - v2) / v2) * 100
  if (Math.abs(pct) < 0.01) return 'Parity with V2'
  const sign = pct >= 0 ? '+' : ''
  return `${sign}${pct.toFixed(2)}% vs V2`
}

export function minReceivedLabel(tradeInfo: TradeInfo | null | undefined): string | undefined {
  return formatAmount(tradeInfo?.slippageAdjustedAmounts?.[Field.OUTPUT])
}

export function estimatedGasLabel(gasPriceWei: string, gasUnits = 220_000): string | undefined {
  if (!gasPriceWei || gasPriceWei === '0') return undefined
  try {
    const cost = (BigInt(gasPriceWei) * BigInt(gasUnits)) / BigInt(1e18)
    const asNum = Number(cost) / 1e18
    if (!Number.isFinite(asNum) || asNum <= 0) return undefined
    return `~${asNum < 0.001 ? asNum.toFixed(6) : asNum.toFixed(4)} BNB`
  } catch {
    return undefined
  }
}
