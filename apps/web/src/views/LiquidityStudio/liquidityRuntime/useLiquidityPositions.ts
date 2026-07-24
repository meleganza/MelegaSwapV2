import { useEffect, useMemo } from 'react'
import { emitCivilizationEvent } from 'lib/civilization-runtime/event-bus'
import { Currency, CurrencyAmount, ERC20Token, Pair, Percent, Token } from '@pancakeswap/sdk'
import { useAccount } from 'wagmi'
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

export function useLiquidityPositions() {
  const { address: account } = useAccount()
  const trackedTokenPairs = useTrackedTokenPairs()
  const { factoryTokenPairs, factoryPairCount } = useFactoryLiquidityTokenPairs(Boolean(account))

  /** Tracked + factory-enumerated pairs (deduped). Balance gate hides empty LPs. */
  const discoveryTokenPairs = useMemo(() => {
    const seen = new Set<string>()
    const out: [ERC20Token, ERC20Token][] = []
    for (const tokens of [...trackedTokenPairs, ...factoryTokenPairs]) {
      const key = pairKey(tokens)
      if (seen.has(key)) continue
      seen.add(key)
      out.push(tokens)
    }
    return out
  }, [trackedTokenPairs, factoryTokenPairs])

  const tokenPairsWithLiquidityTokens = useMemo(
    () => discoveryTokenPairs.map((tokens) => ({ liquidityToken: toV2LiquidityToken(tokens), tokens })),
    [discoveryTokenPairs],
  )

  const liquidityTokens = useMemo(
    () => tokenPairsWithLiquidityTokens.map((tpwlt) => tpwlt.liquidityToken),
    [tokenPairsWithLiquidityTokens],
  )

  const [v2PairsBalances, fetchingV2PairBalances] = useTokenBalancesWithLoadingIndicator(
    account ?? undefined,
    liquidityTokens,
  )

  const stablePairs = useLPTokensWithBalanceByAccount(account)

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
  const isLoading = Boolean(account) && v2IsLoading

  useEffect(() => {
    emitCivilizationEvent('liquidity_position_changed', 'liquidity', {
      positionCount: positions.length,
      account: account ?? null,
    })
  }, [positions.length, account])

  return { positions, isLoading, account, factoryPairCount, discoveryPairCount: discoveryTokenPairs.length }
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
