import { useEffect, useMemo, useState } from 'react'
import { emitCivilizationEvent } from 'lib/civilization-runtime/event-bus'
import { Currency, CurrencyAmount, ERC20Token, Pair, Percent, Price, Token } from '@pancakeswap/sdk'
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
import { OWNERSHIP_SOURCE_DIRECT_WALLET_LP, type WalletLpOwnershipSource } from './walletLpPositionMath'
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

  const tokenPairsWithLiquidityTokens = useMemo(
    () => {
      if (!enabled) return []
      const out = factoryPairEntries.map(({ tokens, pairAddress }) => ({
        tokens,
        liquidityToken: new ERC20Token(tokens[0].chainId, pairAddress, 18, 'MLP', 'Melega LP Token'),
      }))
      if (factoryScanComplete) return out

      const seenAddresses = new Set(out.map(({ liquidityToken }) => liquidityToken.address.toLowerCase()))
      for (const tokens of trackedTokenPairs) {
        const liquidityToken = toV2LiquidityToken(tokens)
        if (seenAddresses.has(liquidityToken.address.toLowerCase())) continue
        seenAddresses.add(liquidityToken.address.toLowerCase())
        out.push({ tokens, liquidityToken })
      }
      return out
    },
    [enabled, factoryPairEntries, factoryScanComplete, trackedTokenPairs],
  )

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
    liquidityTokensWithBalances.forEach(({ liquidityToken }, index) => {
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
        totalSupplyRaw,
        totalSupply: liquidityTotalSupplyFromRaw(liquidityToken, totalSupplyRaw),
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

  const positions = useMemo(() => [...v2Positions, ...stablePositions], [v2Positions, stablePositions])
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

  const [token0Deposited, token1Deposited] = useMemo(
    () => safeGetLiquidityDeposited(position?.pair, totalSupply, userBalance),
    [position?.pair, totalSupply, userBalance],
  )

  const usdValue = usePositionUsdValue(position?.pair.token0, position?.pair.token1, token0Deposited, token1Deposited)

  const poolShare = useMemo(
    () => computePositionPoolShare(totalSupply, userBalance),
    [totalSupply, userBalance],
  )

  return { token0Deposited, token1Deposited, usdValue, poolShare }
}
