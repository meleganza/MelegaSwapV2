import { useMemo, useState } from 'react'
import useSWR from 'swr'
import BigNumber from 'bignumber.js'
import { CurrencyAmount, ERC20Token, Pair, WNATIVE } from '@pancakeswap/sdk'
import { BUSD, USDC, USDT } from '@pancakeswap/tokens'
import { useAccount } from 'wagmi'
import { getAddress } from '@ethersproject/address'
import { MELEGA_CHAIN_REGISTRY } from 'config/melegaChainRegistry'
import { useCanonicalMarketSnapshot } from 'lib/market-data'
import { deriveUsdUnitPrices, type LiquidityPositionRow, type LiquidityPositionsPhase } from './useLiquidityPositions'
import { computeUnderlyingAmount, OWNERSHIP_SOURCE_DIRECT_WALLET_LP } from './walletLpPositionMath'

export const SUPPORTED_LIQUIDITY_CHAIN_IDS = MELEGA_CHAIN_REGISTRY.filter(
  (chain) => chain.status === 'LIVE' && chain.capabilities.swap && Boolean(chain.contracts.factory),
).map((chain) => chain.chainId)

export type LiquidityChainReadState = 'LOADING' | 'READY' | 'EMPTY' | 'UNAVAILABLE' | 'ERROR' | 'TIMED_OUT'

export type LiquidityChainStatus = {
  chainId: number
  state: LiquidityChainReadState
  positionCount: number
  scannedPairs: number | null
  error?: string
}

export type MultichainPositionApiRow = {
  pairAddress: string
  token0: string
  token1: string
  symbol0?: string
  symbol1?: string
  token0Decimals?: number
  token1Decimals?: number
  reserve0Raw?: string
  reserve1Raw?: string
  totalSupplyRaw?: string
  lpBalanceRaw?: string
}

export type LiquidityChainResult = {
  chainId: number
  state: Exclude<LiquidityChainReadState, 'LOADING'>
  scannedPairs: number | null
  rows: MultichainPositionApiRow[]
  error?: string
}

type PriceAnchorsByChain = Record<number, Record<string, number>>

const FETCH_TIMEOUT_MS = 25_000

async function fetchChainPositions(
  account: string,
  chainId: number,
  retryNonce: number,
): Promise<LiquidityChainResult> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
  try {
    const response = await fetch(
      `/api/indexer/liquidity-positions?account=${encodeURIComponent(account)}&chainId=${chainId}&retry=${retryNonce}`,
      { signal: controller.signal },
    )
    const payload = (await response.json()) as {
      status?: string
      scannedPairs?: number
      rows?: MultichainPositionApiRow[]
      error?: string
    }
    if (!response.ok) {
      return {
        chainId,
        state: response.status === 400 ? 'UNAVAILABLE' : 'ERROR',
        scannedPairs: payload.scannedPairs ?? null,
        rows: [],
        error: payload.error ?? `Liquidity discovery failed (${response.status})`,
      }
    }
    const rows = payload.rows ?? []
    return {
      chainId,
      state: rows.length > 0 ? 'READY' : 'EMPTY',
      scannedPairs: payload.scannedPairs ?? null,
      rows,
    }
  } catch (error) {
    const timedOut = error instanceof Error && error.name === 'AbortError'
    return {
      chainId,
      state: timedOut ? 'TIMED_OUT' : 'ERROR',
      scannedPairs: null,
      rows: [],
      error: timedOut
        ? 'Liquidity discovery timed out'
        : error instanceof Error
        ? error.message
        : 'Liquidity discovery failed',
    }
  } finally {
    clearTimeout(timer)
  }
}

export async function fetchMultichainLiquidityPositions(
  account: string,
  retryNonce: number,
): Promise<LiquidityChainResult[]> {
  return Promise.all(SUPPORTED_LIQUIDITY_CHAIN_IDS.map((chainId) => fetchChainPositions(account, chainId, retryNonce)))
}

export function multichainLiquidityCacheKey(account: string, retryNonce: number): [string, string, number] {
  return ['wallet-liquidity-multichain', account.toLowerCase(), retryNonce]
}

function toFinitePositive(value: BigNumber): number | undefined {
  if (!value.isFinite() || !value.isPositive()) return undefined
  const number = value.toNumber()
  return Number.isFinite(number) && number > 0 ? number : undefined
}

function computeUsd(reserve0: string, reserve1: string, price0?: number, price1?: number): number | undefined {
  if (price0 == null || price1 == null) return undefined
  return toFinitePositive(new BigNumber(reserve0).times(price0).plus(new BigNumber(reserve1).times(price1)))
}

function safeAddress(value?: string): string | null {
  try {
    return value ? getAddress(value) : null
  } catch {
    return null
  }
}

export function positionIdentity(chainId: number, pairAddress: string): string {
  return `${chainId}:${pairAddress.toLowerCase()}`
}

export function buildMultichainLiquidityPositions(
  results: LiquidityChainResult[],
  anchorsByChain: PriceAnchorsByChain,
): LiquidityPositionRow[] {
  const byIdentity = new Map<string, LiquidityPositionRow>()

  for (const result of results) {
    if (result.state !== 'READY') continue
    const hydrated: Array<{ row: MultichainPositionApiRow; pair: Pair; lpToken: ERC20Token; identity: string }> = []
    for (const row of result.rows) {
      const pairAddress = safeAddress(row.pairAddress)
      const token0Address = safeAddress(row.token0)
      const token1Address = safeAddress(row.token1)
      if (
        !pairAddress ||
        !token0Address ||
        !token1Address ||
        !row.lpBalanceRaw ||
        row.lpBalanceRaw === '0' ||
        row.reserve0Raw == null ||
        row.reserve1Raw == null
      ) {
        continue
      }
      try {
        const token0 = new ERC20Token(
          result.chainId,
          token0Address,
          row.token0Decimals ?? 18,
          row.symbol0 || 'T0',
          row.symbol0 || 'Token 0',
        )
        const token1 = new ERC20Token(
          result.chainId,
          token1Address,
          row.token1Decimals ?? 18,
          row.symbol1 || 'T1',
          row.symbol1 || 'Token 1',
        )
        const pair = new Pair(
          CurrencyAmount.fromRawAmount(token0, row.reserve0Raw),
          CurrencyAmount.fromRawAmount(token1, row.reserve1Raw),
        )
        hydrated.push({
          row,
          pair,
          lpToken: new ERC20Token(result.chainId, pairAddress, 18, 'MLP', 'Melega LP Token'),
          identity: positionIdentity(result.chainId, pairAddress),
        })
      } catch {
        // A malformed row cannot invalidate sibling positions on this or another chain.
      }
    }

    const edges = hydrated.map(({ pair }) => ({
      token0: pair.token0.address,
      token1: pair.token1.address,
      reserve0: Number(pair.reserve0.toSignificant(12)),
      reserve1: Number(pair.reserve1.toSignificant(12)),
    }))
    const prices = deriveUsdUnitPrices(edges, anchorsByChain[result.chainId] ?? {})

    for (const { row, pair, lpToken, identity } of hydrated) {
      if (byIdentity.has(identity)) continue
      try {
        const lpBalance = CurrencyAmount.fromRawAmount(lpToken, row.lpBalanceRaw as string)
        const totalSupply = row.totalSupplyRaw ? CurrencyAmount.fromRawAmount(lpToken, row.totalSupplyRaw) : undefined
        const price0 = prices[pair.token0.address.toLowerCase()]
        const price1 = prices[pair.token1.address.toLowerCase()]
        const poolTvlUsd = computeUsd(pair.reserve0.toExact(), pair.reserve1.toExact(), price0, price1)
        let usdValue: number | undefined
        if (row.totalSupplyRaw && BigInt(row.totalSupplyRaw) > BigInt(0) && price0 != null && price1 != null) {
          const amount0 = CurrencyAmount.fromRawAmount(
            pair.token0,
            computeUnderlyingAmount(
              BigInt(pair.reserve0.quotient.toString()),
              BigInt(row.lpBalanceRaw as string),
              BigInt(row.totalSupplyRaw),
            ).toString(),
          )
          const amount1 = CurrencyAmount.fromRawAmount(
            pair.token1,
            computeUnderlyingAmount(
              BigInt(pair.reserve1.quotient.toString()),
              BigInt(row.lpBalanceRaw as string),
              BigInt(row.totalSupplyRaw),
            ).toString(),
          )
          usdValue = computeUsd(amount0.toExact(), amount1.toExact(), price0, price1)
        }
        byIdentity.set(identity, {
          id: identity,
          pair,
          pairLabel: `${pair.token0.symbol} / ${pair.token1.symbol}`,
          lpBalance,
          isStable: false,
          chainId: result.chainId,
          pairAddress: lpToken.address,
          ownershipSource: OWNERSHIP_SOURCE_DIRECT_WALLET_LP,
          totalSupply,
          totalSupplyRaw: row.totalSupplyRaw,
          poolTvlUsd,
          poolTvlSource: poolTvlUsd != null ? 'factory-reserves-canonical-price-graph' : undefined,
          usdValue,
          usdValuationSource: usdValue != null ? 'canonical-price-graph' : undefined,
        })
      } catch {
        // Keep processing exact sibling rows when one balance/supply payload is malformed.
      }
    }
  }
  return [...byIdentity.values()]
}

export function useMultichainLiquidityPositions(enabled = true) {
  const { address: account } = useAccount()
  const canonicalMarket = useCanonicalMarketSnapshot()
  const [retryNonce, setRetryNonce] = useState(0)
  const { data, error, isLoading } = useSWR(
    enabled && account ? multichainLiquidityCacheKey(account, retryNonce) : null,
    () => fetchMultichainLiquidityPositions(account as string, retryNonce),
    { revalidateOnFocus: false, dedupingInterval: 60_000 },
  )

  const anchorsByChain = useMemo(() => {
    const output: PriceAnchorsByChain = {}
    for (const chainId of SUPPORTED_LIQUIDITY_CHAIN_IDS) {
      const anchors: Record<string, number> = {}
      const add = (address?: string, price = 1) => {
        if (address && Number.isFinite(price) && price > 0) anchors[address.toLowerCase()] = price
      }
      add(USDT[chainId]?.address)
      add(USDC[chainId]?.address)
      add(BUSD[chainId]?.address)
      if (chainId === 56) {
        add('0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3')
        add('0x4BD17003473389A42DAF6a0a729f6Fdb328BbBd7')
        add('0xc5f0f7b66764F6ec8C8Dff7BA683102295E16409')
        add(WNATIVE[56]?.address, canonicalMarket.bnbUsd)
        canonicalMarket.featured.forEach((market) => add(market.tokenAddress, market.priceUsd))
      }
      output[chainId] = anchors
    }
    return output
  }, [canonicalMarket.bnbUsd, canonicalMarket.featured])

  const positions = useMemo(() => buildMultichainLiquidityPositions(data ?? [], anchorsByChain), [data, anchorsByChain])
  const chainStatuses: LiquidityChainStatus[] = SUPPORTED_LIQUIDITY_CHAIN_IDS.map((chainId) => {
    const result = data?.find((item) => item.chainId === chainId)
    return {
      chainId,
      state: result?.state ?? (error ? 'ERROR' : 'LOADING'),
      positionCount: result?.rows.length ?? 0,
      scannedPairs: result?.scannedPairs ?? null,
      error: result?.error,
    }
  })
  const settled = data != null || Boolean(error)
  const positionsPhase: LiquidityPositionsPhase =
    !enabled || !account
      ? 'connecting'
      : !settled || isLoading
      ? 'fetching'
      : positions.length > 0
      ? 'ready'
      : chainStatuses.every((status) => status.state === 'EMPTY')
      ? 'empty'
      : 'error'

  return {
    positions,
    isLoading: positionsPhase === 'fetching',
    positionsPhase,
    positionsTimedOut: chainStatuses.some((status) => status.state === 'TIMED_OUT'),
    retryPositions: () => setRetryNonce((nonce) => nonce + 1),
    account,
    chainStatuses,
  }
}
