import { useEffect, useMemo, useState } from 'react'
import { emitCivilizationEvent } from 'lib/civilization-runtime/event-bus'
import { Currency, CurrencyAmount, ERC20Token, Pair, Percent, Token } from '@pancakeswap/sdk'
import { useAccount } from 'wagmi'
import { useActiveChainId } from 'hooks/useActiveChainId'
import useBUSDPrice from 'hooks/useBUSDPrice'
import useTotalSupply from 'hooks/useTotalSupply'
import { PairState, usePairs } from 'hooks/usePairs'
import { useTokenBalancesWithLoadingIndicator } from 'state/wallet/hooks'
import { toV2LiquidityToken, useTrackedTokenPairs } from 'state/user/hooks'
import { useLPTokensWithBalanceByAccount } from 'views/Swap/StableSwap/hooks/useStableConfig'
import { multiplyPriceByAmount } from 'utils/prices'
import {
  OWNERSHIP_SOURCE_DIRECT_WALLET_LP,
  type WalletLpOwnershipSource,
} from './walletLpPositionMath'
import { useFactoryLiquidityTokenPairs } from './useFactoryLiquidityTokenPairs'

/** Deterministic wallet LP hydration lifecycle (UI never freezes on partial state). */
export type LiquidityPositionsPhase = 'connecting' | 'fetching' | 'ready' | 'empty' | 'error'

const POSITIONS_FETCH_TIMEOUT_MS = 12_000

function pairKey(tokens: [ERC20Token, ERC20Token]): string {
  return [tokens[0].address, tokens[1].address]
    .map((a) => a.toLowerCase())
    .sort()
    .join('-')
}

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
}

function usePositionUsdValue(
  currency0?: Currency,
  currency1?: Currency,
  token0Deposited?: CurrencyAmount<Currency>,
  token1Deposited?: CurrencyAmount<Currency>,
): number | undefined {
  const token0Price = useBUSDPrice(currency0)
  const token1Price = useBUSDPrice(currency1)
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

export function useLiquidityPositions(enabled = true) {
  const { address: account } = useAccount()
  const effectiveAccount = enabled ? account : undefined
  const { chainId } = useActiveChainId()
  const trackedTokenPairs = useTrackedTokenPairs()
  const {
    factoryTokenPairs,
    factoryPairCount,
    isLoading: factoryLoading,
    factoryEnabled,
  } = useFactoryLiquidityTokenPairs(Boolean(effectiveAccount), chainId)

  /** Tracked + factory-enumerated pairs (deduped). Balance gate hides empty LPs. */
  const discoveryTokenPairs = useMemo(() => {
    const seen = new Set<string>()
    const out: [ERC20Token, ERC20Token][] = []
    if (!enabled) return out
    for (const tokens of [...trackedTokenPairs, ...factoryTokenPairs]) {
      const key = pairKey(tokens)
      if (seen.has(key)) continue
      seen.add(key)
      out.push(tokens)
    }
    return out
  }, [enabled, trackedTokenPairs, factoryTokenPairs])

  const tokenPairsWithLiquidityTokens = useMemo(
    () => discoveryTokenPairs.map((tokens) => ({ liquidityToken: toV2LiquidityToken(tokens), tokens })),
    [discoveryTokenPairs],
  )

  const liquidityTokens = useMemo(
    () => tokenPairsWithLiquidityTokens.map((tpwlt) => tpwlt.liquidityToken),
    [tokenPairsWithLiquidityTokens],
  )

  const [v2PairsBalances, fetchingV2PairBalances] = useTokenBalancesWithLoadingIndicator(
    effectiveAccount,
    liquidityTokens,
  )

  const stablePairs = useLPTokensWithBalanceByAccount(effectiveAccount)

  const liquidityTokensWithBalances = useMemo(
    () =>
      tokenPairsWithLiquidityTokens.filter(({ liquidityToken }) =>
        v2PairsBalances[liquidityToken.address]?.greaterThan('0'),
      ),
    [tokenPairsWithLiquidityTokens, v2PairsBalances],
  )

  const v2Pairs = usePairs(liquidityTokensWithBalances.map(({ tokens }) => tokens))
  const v2IsLoading =
    fetchingV2PairBalances ||
    factoryLoading ||
    v2Pairs?.length < liquidityTokensWithBalances.length ||
    Boolean(v2Pairs?.length && v2Pairs.every(([pairState]) => pairState === PairState.LOADING))

  const v2Positions = useMemo((): LiquidityPositionRow[] => {
    if (!v2Pairs) return []
    const byPair = new Map<string, LiquidityPositionRow>()
    v2Pairs.forEach((entry) => {
      const [, pair] = entry
      if (!pair) return
      const pairAddress = pair.liquidityToken.address
      const userBalance = v2PairsBalances[pairAddress]
      if (!userBalance?.greaterThan(0)) return
      const key = pairAddress.toLowerCase()
      if (byPair.has(key)) return
      byPair.set(key, {
        id: pairAddress,
        pair,
        pairLabel: `${pair.token0.symbol} / ${pair.token1.symbol}`,
        lpBalance: userBalance,
        isStable: false,
        chainId: pair.liquidityToken.chainId,
        pairAddress,
        walletAddress: account,
        ownershipSource: OWNERSHIP_SOURCE_DIRECT_WALLET_LP,
      })
    })
    return [...byPair.values()]
  }, [v2Pairs, v2PairsBalances, account])

  const stablePositions = useMemo((): LiquidityPositionRow[] => {
    if (!stablePairs?.length) return []
    return stablePairs
      .map((stablePair) => {
        const balance = v2PairsBalances[stablePair.liquidityToken.address]
        if (!balance?.greaterThan(0)) {
          return {
            id: stablePair.liquidityToken.address,
            pair: stablePair as unknown as Pair,
            pairLabel: `${stablePair.token0.symbol} / ${stablePair.token1.symbol}`,
            lpBalance: stablePair.liquidityToken,
            isStable: true,
          }
        }
        return {
          id: stablePair.liquidityToken.address,
          pair: stablePair as unknown as Pair,
          pairLabel: `${stablePair.token0.symbol} / ${stablePair.token1.symbol}`,
          lpBalance: balance,
          isStable: true,
        }
      })
      .filter(Boolean) as LiquidityPositionRow[]
  }, [stablePairs, v2PairsBalances])

  const positions = useMemo(() => [...v2Positions, ...stablePositions], [v2Positions, stablePositions])
  const rawLoading = enabled && Boolean(effectiveAccount) && v2IsLoading

  const [timedOut, setTimedOut] = useState(false)
  const [retryNonce, setRetryNonce] = useState(0)

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
    discoveryPairCount: discoveryTokenPairs.length,
    factoryEnabled,
  }
}

export function useLiquidityPositionDetails(position?: LiquidityPositionRow) {
  const totalSupply = useTotalSupply(position?.pair.liquidityToken)
  const userBalance = position?.lpBalance

  const [token0Deposited, token1Deposited] = useMemo(() => {
    if (!position?.pair || !totalSupply || !userBalance) return [undefined, undefined]
    return [
      position.pair.getLiquidityValue(position.pair.token0, totalSupply, userBalance, false),
      position.pair.getLiquidityValue(position.pair.token1, totalSupply, userBalance, false),
    ]
  }, [position?.pair, totalSupply, userBalance])

  const usdValue = usePositionUsdValue(
    position?.pair.token0,
    position?.pair.token1,
    token0Deposited,
    token1Deposited,
  )

  const poolShare = useMemo(() => {
    if (!totalSupply || !userBalance || totalSupply.equalTo(0)) return undefined
    return new Percent(userBalance.quotient, totalSupply.quotient)
  }, [totalSupply, userBalance])

  return { token0Deposited, token1Deposited, usdValue, poolShare }
}
