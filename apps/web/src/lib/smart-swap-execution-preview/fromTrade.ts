/**
 * Adapt TradeWithStableSwap-like shapes into preview input (read-only).
 * Does not execute, sign, or call Router.
 */

import { MARCO_BSC_ADDRESS } from 'design-system/melega/constants/brand'
import type { SmartSwapHop, SmartSwapPoolRef, SmartSwapTokenRef } from 'lib/smart-swap-route-engine'
import type { SmartSwapExecutionPreviewInput } from './types'

type CurrencyLike = {
  symbol?: string
  decimals?: number
  chainId?: number
  isNative?: boolean
  address?: string
  wrapped?: { address?: string }
}

type TradeLike = {
  inputAmount?: {
    toExact?: () => string
    quotient?: { toString?: () => string }
    currency?: CurrencyLike
  }
  outputAmount?: {
    toExact?: () => string
    quotient?: { toString?: () => string }
    currency?: CurrencyLike
  }
  route?: {
    path?: CurrencyLike[]
    pairs?: Array<{
      token0?: { symbol?: string; address?: string }
      token1?: { symbol?: string; address?: string }
      liquidityToken?: { address?: string }
      stableSwapAddress?: string
    }>
  }
}

function tokenRef(c: CurrencyLike | undefined, fallbackSymbol: string): SmartSwapTokenRef {
  const address = c?.isNative
    ? c.wrapped?.address ?? '0x0000000000000000000000000000000000000000'
    : c?.address ?? '0x0000000000000000000000000000000000000000'
  return {
    chainId: c?.chainId ?? 56,
    address,
    symbol: c?.symbol ?? fallbackSymbol,
    decimals: c?.decimals ?? 18,
    isNative: Boolean(c?.isNative),
  }
}

/**
 * Build Module 003 preview input from a live trade object.
 * Gas is left unset unless provided — never invented.
 */
export function buildPreviewInputFromTrade(params: {
  trade: TradeLike | null | undefined
  slippageBips: number
  gasUnits?: number | null
  priceImpactPercent?: number | null
  freshness?: string | null
  nowIso?: string
  stale?: boolean
}): SmartSwapExecutionPreviewInput | null {
  const {
    trade,
    slippageBips,
    gasUnits = null,
    priceImpactPercent = null,
    freshness = null,
    nowIso,
    stale,
  } = params

  if (!trade?.inputAmount?.currency || !trade?.outputAmount?.currency) return null

  const inputToken = tokenRef(trade.inputAmount.currency, 'IN')
  const outputToken = tokenRef(trade.outputAmount.currency, 'OUT')
  const expectedOutputRaw = trade.outputAmount.quotient?.toString?.() ?? null
  if (!expectedOutputRaw) return null

  const path = trade.route?.path ?? []
  const pairs = trade.route?.pairs ?? []
  const pathSymbols = path.map((t) => t.symbol ?? '—')

  const pools: SmartSwapPoolRef[] = pairs.map((pair) => {
    const address = pair.stableSwapAddress ?? pair.liquidityToken?.address ?? '0x0'
    return {
      address,
      kind: pair.stableSwapAddress ? 'stable' : 'v2',
      token0: pair.token0?.address ?? path[0]?.address ?? inputToken.address,
      token1: pair.token1?.address ?? path[path.length - 1]?.address ?? outputToken.address,
    }
  })

  const hops: SmartSwapHop[] = pools.map((pool, i) => ({
    index: i,
    pool,
    tokenIn: path[i]?.address ?? (i === 0 ? inputToken.address : pools[i - 1]?.token1 ?? inputToken.address),
    tokenOut:
      path[i + 1]?.address ?? (i === pools.length - 1 ? outputToken.address : pools[i]?.token1 ?? outputToken.address),
  }))

  const outAddr = outputToken.address.toLowerCase()
  const isBuyMarco = outAddr === MARCO_BSC_ADDRESS.toLowerCase()

  return {
    routeId: hops.length
      ? `trade-${inputToken.symbol}-${outputToken.symbol}-${hops.length}h`
      : `trade-${inputToken.symbol}-${outputToken.symbol}`,
    inputAmount: trade.inputAmount.toExact?.() ?? '0',
    inputToken,
    outputToken,
    expectedOutputRaw,
    expectedOutputFormatted: trade.outputAmount.toExact?.() ?? null,
    slippageBips,
    priceImpactPercent,
    gasUnits,
    hops,
    pools,
    pathSymbols: pathSymbols.length >= 2 ? pathSymbols : [inputToken.symbol, outputToken.symbol],
    freshness,
    isBuyMarco,
    partialData: hops.length === 0,
    stale,
    nowIso,
  }
}
