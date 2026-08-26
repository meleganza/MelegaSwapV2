import { useEffect, useMemo, useState } from 'react'
import { emitCivilizationEvent } from 'lib/civilization-runtime/event-bus'
import { Currency, CurrencyAmount, ERC20Token, Pair, Percent, Price, Token, WNATIVE } from '@pancakeswap/sdk'
import { BUSD, USDC, USDT } from '@pancakeswap/tokens'
import { useAccount } from 'wagmi'
import { useActiveChainId } from 'hooks/useActiveChainId'
import useBUSDPrice from 'hooks/useBUSDPrice'
import useTotalSupply from 'hooks/useTotalSupply'
import { PairState, usePairs } from 'hooks/usePairs'
import { useTokenBalancesWithLoadingIndicator } from 'state/wallet/hooks'
import { useMultipleContractSingleData } from 'state/multicall/hooks'
import ERC20_INTERFACE from 'config/abi/erc20'
import { toV2LiquidityToken, useTrackedTokenPairs } from 'state/user/hooks'
import { useLPTokensWithBalanceByAccount } from 'views/Swap/StableSwap/hooks/useStableConfig'
import { multiplyPriceByAmount } from 'utils/prices'
import { useCanonicalMarketSnapshot } from 'lib/market-data'
import {
  computeUnderlyingAmount,
  OWNERSHIP_SOURCE_DIRECT_WALLET_LP,
  type WalletLpOwnershipSource,
} from './walletLpPositionMath'
import { useFactoryLiquidityTokenPairs } from './useFactoryLiquidityTokenPairs'

/** Deterministic wallet LP hydration lifecycle (UI never freezes on partial state). */
export type LiquidityPositionsPhase = 'connecting' | 'fetching' | 'ready' | 'empty' | 'error'

const POSITIONS_FETCH_TIMEOUT_MS = 12_000

export interface LiquidityPositionRow {
  id: string
  pair: Pair
  pairLabel: string
  lpBalance: CurrencyAmount<Token>
  isStable?: boolean
  chainId?: number
  pairAddress?: string
  walletAddress?: string
  ownershipSource?: WalletLpOwnershipSource
  totalSupply?: CurrencyAmount<Token>
  totalSupplyRaw?: string
  usdValue?: number
  usdValuationSource?: 'canonical-price-graph'
}

/** Batched LP totalSupply is authoritative when present and nonzero. */
export function resolvePositionTotalSupply(
  batched?: CurrencyAmount<Token>,
  fallback?: CurrencyAmount<Token>,
): CurrencyAmount<Token> | undefined {
  if (batched && !batched.equalTo(0)) return batched
  if (fallback && !fallback.equalTo(0)) return fallback
  return undefined
}

export function computePositionPoolShare(
  totalSupply?: CurrencyAmount<Token>,
  userBalance?: CurrencyAmount<Token>,
): Percent | undefined {
  if (!totalSupply || !userBalance || totalSupply.equalTo(0)) return undefined
  return new Percent(userBalance.quotient, totalSupply.quotient)
}

/** Isolate SDK LIQUIDITY/invariant throws so one metric cannot blank sibling state. */
export function safeGetLiquidityDeposited(
  pair?: Pair,
  totalSupply?: CurrencyAmount<Token>,
  userBalance?: CurrencyAmount<Token>,
): [CurrencyAmount<Currency> | undefined, CurrencyAmount<Currency> | undefined] {
  if (!pair || !totalSupply || !userBalance) return [undefined, undefined]
  let token0Deposited: CurrencyAmount<Currency> | undefined
  let token1Deposited: CurrencyAmount<Currency> | undefined
  try {
    token0Deposited = pair.getLiquidityValue(pair.token0, totalSupply, userBalance, false)
  } catch {
    token0Deposited = undefined
  }
  try {
    token1Deposited = pair.getLiquidityValue(pair.token1, totalSupply, userBalance, false)
  } catch {
    token1Deposited = undefined
  }
  return [token0Deposited, token1Deposited]
}

/**
 * The wallet-scoped factory scan can finish before the SDK's broader pair
 * hydration. For withdrawals, real reserves + LP balance + totalSupply are
 * already sufficient and must remain authoritative instead of showing dashes.
 */
export function safeGetLiquidityDepositedFromRaw(
  pair?: Pair,
  totalSupplyRaw?: string,
  userBalance?: CurrencyAmount<Token>,
): [CurrencyAmount<Currency> | undefined, CurrencyAmount<Currency> | undefined] {
  if (!pair || !totalSupplyRaw || !userBalance) return [undefined, undefined]
  try {
    const supply = BigInt(totalSupplyRaw)
    const walletLp = BigInt(userBalance.quotient.toString())
    if (supply <= BigInt(0) || walletLp <= BigInt(0)) return [undefined, undefined]
    const amount0 = computeUnderlyingAmount(BigInt(pair.reserve0.quotient.toString()), walletLp, supply)
    const amount1 = computeUnderlyingAmount(BigInt(pair.reserve1.quotient.toString()), walletLp, supply)
    return [
      CurrencyAmount.fromRawAmount(pair.token0, amount0.toString()),
      CurrencyAmount.fromRawAmount(pair.token1, amount1.toString()),
    ]
  } catch {
    return [undefined, undefined]
  }
}

type PriceGraphEdge = {
  token0: string
  token1: string
  reserve0: number
  reserve1: number
}

/** Propagate trusted USD anchors through real factory reserves. */
export function deriveUsdUnitPrices(edges: PriceGraphEdge[], anchors: Record<string, number>): Record<string, number> {
  const prices: Record<string, number> = {}
  Object.entries(anchors).forEach(([address, price]) => {
    if (Number.isFinite(price) && price > 0) prices[address.toLowerCase()] = price
  })

  for (let pass = 0; pass < edges.length; pass += 1) {
    let changed = false
    for (const edge of edges) {
      if (!(edge.reserve0 > 0) || !(edge.reserve1 > 0)) continue
      const token0 = edge.token0.toLowerCase()
      const token1 = edge.token1.toLowerCase()
      const price0 = prices[token0]
      const price1 = prices[token1]
      if (price0 != null && price1 == null) {
        const next = (edge.reserve0 * price0) / edge.reserve1
        if (Number.isFinite(next) && next > 0) {
          prices[token1] = next
          changed = true
        }
      } else if (price1 != null && price0 == null) {
        const next = (edge.reserve1 * price1) / edge.reserve0
        if (Number.isFinite(next) && next > 0) {
          prices[token0] = next
          changed = true
        }
      }
    }
    if (!changed) break
  }
  return prices
}

export function depositedUsdFromPricedSides(
  token0Deposited?: CurrencyAmount<Currency>,
  token1Deposited?: CurrencyAmount<Currency>,
  token0Price?: Price<Currency, Currency>,
  token1Price?: Price<Currency, Currency>,
): number | undefined {
  const token0USD =
    token0Deposited && token0Price
      ? multiplyPriceByAmount(token0Price, parseFloat(token0Deposited.toSignificant(6)))
      : null
  const token1USD =
    token1Deposited && token1Price
      ? multiplyPriceByAmount(token1Price, parseFloat(token1Deposited.toSignificant(6)))
      : null
  if (token0USD != null && token1USD != null) return token0USD + token1USD
  return token0USD ?? token1USD ?? undefined
}

function liquidityTotalSupplyFromRaw(token: Token, raw?: string): CurrencyAmount<Token> | undefined {
  if (!raw) return undefined
  try {
    const amount = CurrencyAmount.fromRawAmount(token, raw)
    return amount.equalTo(0) ? undefined : amount
  } catch {
    return undefined
  }
}

function usePositionUsdValue(
  currency0?: Currency,
  currency1?: Currency,
  token0Deposited?: CurrencyAmount<Currency>,
  token1Deposited?: CurrencyAmount<Currency>,
): number | undefined {
  const token0Price = useBUSDPrice(currency0)
  const token1Price = useBUSDPrice(currency1)
  return depositedUsdFromPricedSides(token0Deposited, token1Deposited, token0Price, token1Price)
}

export function useLiquidityPositions(enabled = true) {
  const { address: account } = useAccount()
  const effectiveAccount = enabled ? account : undefined
  const { chainId } = useActiveChainId()
  const [timedOut, setTimedOut] = useState(false)
  const [retryNonce, setRetryNonce] = useState(0)
  const trackedTokenPairs = useTrackedTokenPairs()
  const canonicalMarket = useCanonicalMarketSnapshot()
  const {
    factoryPairEntries,
    factoryLpBalancesRaw,
    factoryPairsByAddress,
    factoryPairCount,
    isLoading: factoryLoading,
    factoryEnabled,
    error: factoryError,
  } = useFactoryLiquidityTokenPairs(Boolean(effectiveAccount), chainId, effectiveAccount, retryNonce)
  const factoryScanComplete = factoryEnabled && factoryPairCount !== null && !factoryError

  const tokenPairsWithLiquidityTokens = useMemo(() => {
    if (!enabled) return []
    const out = factoryPairEntries.map(({ tokens, pairAddress, totalSupplyRaw }) => ({
      tokens,
      liquidityToken: new ERC20Token(tokens[0].chainId, pairAddress, 18, 'MLP', 'Melega LP Token'),
      totalSupplyRaw,
    }))
    if (factoryScanComplete) return out

    const seenAddresses = new Set(out.map(({ liquidityToken }) => liquidityToken.address.toLowerCase()))
    for (const tokens of trackedTokenPairs) {
      const liquidityToken = toV2LiquidityToken(tokens)
      if (seenAddresses.has(liquidityToken.address.toLowerCase())) continue
      seenAddresses.add(liquidityToken.address.toLowerCase())
      out.push({ tokens, liquidityToken, totalSupplyRaw: undefined })
    }
    return out
  }, [enabled, factoryPairEntries, factoryScanComplete, trackedTokenPairs])

  const liquidityTokens = useMemo(
    () => tokenPairsWithLiquidityTokens.map((tpwlt) => tpwlt.liquidityToken),
    [tokenPairsWithLiquidityTokens],
  )

  const [v2PairsBalances, fetchingV2PairBalances] = useTokenBalancesWithLoadingIndicator(
    effectiveAccount,
    liquidityTokens,
  )

  // The server-side factory scan is authoritative for the LP balances it found.
  // Merge those values immediately so a stalled global multicall cannot hide a
  // valid position that has already been certified by the wallet-scoped scan.
  const effectiveV2PairBalances = useMemo(() => {
    const balances = { ...v2PairsBalances }
    for (const { liquidityToken } of tokenPairsWithLiquidityTokens) {
      const raw = factoryLpBalancesRaw[liquidityToken.address.toLowerCase()]
      if (!raw) continue
      balances[liquidityToken.address] = CurrencyAmount.fromRawAmount(liquidityToken, raw)
    }
    return balances
  }, [v2PairsBalances, factoryLpBalancesRaw, tokenPairsWithLiquidityTokens])

  const stablePairs = useLPTokensWithBalanceByAccount(effectiveAccount)

  const liquidityTokensWithBalances = useMemo(
    () =>
      tokenPairsWithLiquidityTokens.filter(({ liquidityToken }) =>
        effectiveV2PairBalances[liquidityToken.address]?.greaterThan('0'),
      ),
    [tokenPairsWithLiquidityTokens, effectiveV2PairBalances],
  )

  const lpSupplyAddresses = useMemo(
    () => liquidityTokensWithBalances.map(({ liquidityToken }) => liquidityToken.address),
    [liquidityTokensWithBalances],
  )
  const lpTotalSupplyCalls = useMultipleContractSingleData(lpSupplyAddresses, ERC20_INTERFACE, 'totalSupply')
  const batchedTotalSupplyRawByAddress = useMemo(() => {
    const out: Record<string, string> = {}
    liquidityTokensWithBalances.forEach(({ liquidityToken }, i) => {
      const raw = lpTotalSupplyCalls?.[i]?.result?.[0]?.toString()
      if (raw) out[liquidityToken.address.toLowerCase()] = raw
    })
    return out
  }, [liquidityTokensWithBalances, lpTotalSupplyCalls])

  const v2Pairs = usePairs(liquidityTokensWithBalances.map(({ tokens }) => tokens))
  const factoryOwnedPairsHydrated =
    liquidityTokensWithBalances.length > 0 &&
    liquidityTokensWithBalances.every(({ liquidityToken }) =>
      Boolean(factoryPairsByAddress[liquidityToken.address.toLowerCase()]),
    )
  const v2IsLoading =
    (!factoryScanComplete && fetchingV2PairBalances) ||
    factoryLoading ||
    (!factoryOwnedPairsHydrated &&
      (v2Pairs?.length < liquidityTokensWithBalances.length ||
        Boolean(v2Pairs?.length && v2Pairs.every(([pairState]) => pairState === PairState.LOADING))))

  const v2Positions = useMemo((): LiquidityPositionRow[] => {
    if (!v2Pairs) return []
    const byPair = new Map<string, LiquidityPositionRow>()
    liquidityTokensWithBalances.forEach(({ liquidityToken, totalSupplyRaw: serverTotalSupplyRaw }, index) => {
      const [, livePair] = v2Pairs[index] ?? []
      const pair = factoryPairsByAddress[liquidityToken.address.toLowerCase()] ?? livePair
      if (!pair) return
      const pairAddress = liquidityToken.address
      const userBalance = effectiveV2PairBalances[pairAddress]
      if (!userBalance?.greaterThan(0)) return
      const key = pairAddress.toLowerCase()
      if (byPair.has(key)) return
      const totalSupplyRaw = batchedTotalSupplyRawByAddress[key]
      byPair.set(key, {
        id: pairAddress,
        pair,
        pairLabel: `${pair.token0.symbol} / ${pair.token1.symbol}`,
        lpBalance: userBalance,
        isStable: false,
        chainId: liquidityToken.chainId,
        pairAddress,
        walletAddress: account,
        ownershipSource: OWNERSHIP_SOURCE_DIRECT_WALLET_LP,
        totalSupplyRaw: serverTotalSupplyRaw ?? totalSupplyRaw,
        totalSupply: liquidityTotalSupplyFromRaw(liquidityToken, serverTotalSupplyRaw ?? totalSupplyRaw),
      })
    })
    return [...byPair.values()]
  }, [
    v2Pairs,
    effectiveV2PairBalances,
    account,
    batchedTotalSupplyRawByAddress,
    factoryPairsByAddress,
    liquidityTokensWithBalances,
  ])

  const stablePositions = useMemo((): LiquidityPositionRow[] => {
    if (!stablePairs?.length) return []
    return stablePairs
      .map((stablePair) => {
        const balance = effectiveV2PairBalances[stablePair.liquidityToken.address]
        if (!balance?.greaterThan(0)) return null
        const totalSupplyRaw = batchedTotalSupplyRawByAddress[stablePair.liquidityToken.address.toLowerCase()]
        const pair = stablePair as unknown as Pair
        return {
          id: stablePair.liquidityToken.address,
          pair,
          pairLabel: `${stablePair.token0.symbol} / ${stablePair.token1.symbol}`,
          lpBalance: balance,
          isStable: true,
          totalSupplyRaw,
          totalSupply: liquidityTotalSupplyFromRaw(pair.liquidityToken, totalSupplyRaw),
        }
      })
      .filter(Boolean) as LiquidityPositionRow[]
  }, [stablePairs, effectiveV2PairBalances, batchedTotalSupplyRawByAddress])

  const basePositions = useMemo(() => [...v2Positions, ...stablePositions], [v2Positions, stablePositions])
  const positions = useMemo(() => {
    if (!basePositions.length) return basePositions
    const anchors: Record<string, number> = {}
    const addAnchor = (address?: string, price = 1) => {
      if (address) anchors[address.toLowerCase()] = price
    }
    addAnchor(USDT[chainId as number]?.address)
    addAnchor(USDC[chainId as number]?.address)
    addAnchor(BUSD[chainId as number]?.address)
    // BNB-native USD comes from the certified canonical market snapshot.
    if (chainId === 56 && canonicalMarket.bnbUsd) addAnchor(WNATIVE[56]?.address, canonicalMarket.bnbUsd)
    // Additional canonical BNB stables used by historical Melega pools.
    if (chainId === 56) {
      addAnchor('0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3') // DAI
      addAnchor('0x4BD17003473389A42DAF6a0a729f6Fdb328BbBd7') // VAI
      addAnchor('0xc5f0f7b66764F6ec8C8Dff7BA683102295E16409') // FDUSD
    }
    canonicalMarket.featured.forEach((market) => addAnchor(market.tokenAddress, market.priceUsd))

    const edges: PriceGraphEdge[] = basePositions.map((position) => ({
      token0: position.pair.token0.address,
      token1: position.pair.token1.address,
      reserve0: Number(position.pair.reserve0.toSignificant(12)),
      reserve1: Number(position.pair.reserve1.toSignificant(12)),
    }))
    const prices = deriveUsdUnitPrices(edges, anchors)

    return basePositions.map((position) => {
      const [amount0, amount1] = safeGetLiquidityDepositedFromRaw(
        position.pair,
        position.totalSupplyRaw,
        position.lpBalance,
      )
      const price0 = prices[position.pair.token0.address.toLowerCase()]
      const price1 = prices[position.pair.token1.address.toLowerCase()]
      if (!amount0 || !amount1 || price0 == null || price1 == null) return position
      const value = Number(amount0.toSignificant(12)) * price0 + Number(amount1.toSignificant(12)) * price1
      if (!Number.isFinite(value) || value < 0) return position
      return { ...position, usdValue: value, usdValuationSource: 'canonical-price-graph' as const }
    })
  }, [basePositions, canonicalMarket.bnbUsd, canonicalMarket.featured, chainId])
  const rawLoading = enabled && Boolean(effectiveAccount) && v2IsLoading

  // Reset timeout when wallet / chain / load cycle / manual retry changes.
  useEffect(() => {
    setTimedOut(false)
  }, [account, chainId, retryNonce])

  useEffect(() => {
    if (!account || !rawLoading || positions.length > 0) {
      if (!rawLoading) setTimedOut(false)
      return undefined
    }
    const timer = window.setTimeout(() => setTimedOut(true), POSITIONS_FETCH_TIMEOUT_MS)
    return () => window.clearTimeout(timer)
  }, [account, rawLoading, positions.length, chainId, retryNonce])

  const isLoading = rawLoading && !timedOut

  const positionsPhase: LiquidityPositionsPhase = !enabled
    ? 'empty'
    : !account
    ? 'connecting'
    : timedOut && positions.length === 0
    ? 'error'
    : isLoading
    ? 'fetching'
    : positions.length > 0
    ? 'ready'
    : 'empty'

  const retryPositions = () => setRetryNonce((n) => n + 1)

  useEffect(() => {
    if (!enabled) return
    emitCivilizationEvent('liquidity_position_changed', 'liquidity', {
      positionCount: positions.length,
      account: account ?? null,
      phase: positionsPhase,
      timedOut,
      factoryEnabled,
      chainId: chainId ?? null,
    })
  }, [enabled, positions.length, account, positionsPhase, timedOut, factoryEnabled, chainId])

  return {
    positions,
    isLoading,
    positionsPhase,
    positionsTimedOut: timedOut,
    retryPositions,
    account,
    factoryPairCount,
    discoveryPairCount: tokenPairsWithLiquidityTokens.length,
    factoryEnabled,
  }
}

export function useLiquidityPositionDetails(position?: LiquidityPositionRow) {
  const fallbackTotalSupply = useTotalSupply(position?.pair.liquidityToken)
  const userBalance = position?.lpBalance
  const totalSupply = resolvePositionTotalSupply(position?.totalSupply, fallbackTotalSupply)

  const [token0Deposited, token1Deposited] = useMemo(() => {
    const direct = safeGetLiquidityDepositedFromRaw(position?.pair, position?.totalSupplyRaw, userBalance)
    if (direct[0] && direct[1]) return direct
    return safeGetLiquidityDeposited(position?.pair, totalSupply, userBalance)
  }, [position?.pair, position?.totalSupplyRaw, totalSupply, userBalance])

  const liveUsdValue = usePositionUsdValue(position?.pair.token0, position?.pair.token1, token0Deposited, token1Deposited)
  const usdValue = position?.usdValue ?? liveUsdValue

  const poolShare = useMemo(() => computePositionPoolShare(totalSupply, userBalance), [totalSupply, userBalance])

  return { token0Deposited, token1Deposited, usdValue, poolShare }
}
