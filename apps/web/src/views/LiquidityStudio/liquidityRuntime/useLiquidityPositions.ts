import { useMemo } from 'react'
import { Currency, CurrencyAmount, Pair, Percent, Token } from '@pancakeswap/sdk'
import { useAccount } from 'wagmi'
import useBUSDPrice from 'hooks/useBUSDPrice'
import useTotalSupply from 'hooks/useTotalSupply'
import { PairState, usePairs } from 'hooks/usePairs'
import { useTokenBalancesWithLoadingIndicator } from 'state/wallet/hooks'
import { toV2LiquidityToken, useTrackedTokenPairs } from 'state/user/hooks'
import { useLPTokensWithBalanceByAccount } from 'views/Swap/StableSwap/hooks/useStableConfig'
import { multiplyPriceByAmount } from 'utils/prices'

export interface LiquidityPositionRow {
  id: string
  pair: Pair
  pairLabel: string
  lpBalance: CurrencyAmount<Token>
  isStable?: boolean
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

  const tokenPairsWithLiquidityTokens = useMemo(
    () => trackedTokenPairs.map((tokens) => ({ liquidityToken: toV2LiquidityToken(tokens), tokens })),
    [trackedTokenPairs],
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
    return v2Pairs
      .map((entry, index) => {
        const [, pair] = entry
        if (!pair) return null
        const userBalance = v2PairsBalances[pair.liquidityToken.address]
        if (!userBalance?.greaterThan(0)) return null
        return {
          id: pair.liquidityToken.address,
          pair,
          pairLabel: `${pair.token0.symbol} / ${pair.token1.symbol}`,
          lpBalance: userBalance,
          isStable: false,
        }
      })
      .filter(Boolean) as LiquidityPositionRow[]
  }, [v2Pairs, v2PairsBalances])

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

  return { positions, isLoading, account }
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
