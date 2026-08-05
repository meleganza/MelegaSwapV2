/**
 * Portfolio runtime — parallel factual domain loads.
 * Wallet + liquidity / farms / pools only.
 */
import { useEffect, useMemo, useRef, useState } from 'react'
import { useAccount, useNetwork } from 'wagmi'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { usePassportLiquidityPositions } from 'views/PassportStudio/usePassportLiquidityPositions'
import { useFarmsStakingRuntime } from 'views/FarmsStudio/farmsRuntime/useFarmsStakingRuntime'
import { usePoolsStakingRuntime } from 'views/PoolsStudio/poolsRuntime/usePoolsStakingRuntime'
import { buildFarmsWalletPositionsViewModel } from 'views/FarmsStudio/modules/buildFarmsWalletPositions'
import { buildPoolsWalletPositionsViewModel } from 'views/PoolsStudio/modules/buildPoolsWalletPositions'
import type { FarmsWalletPosition } from 'views/FarmsStudio/modules/farmsMyFarmsTypes'
import type { PoolsWalletPosition } from 'views/PoolsStudio/modules/poolsMyPositionsTypes'
import { buildPortfolioViewModel, type PortfolioViewModel } from './buildPortfolioViewModel'
import { clearOnWalletChange, portfolioCacheKey, shouldRejectStaleResponse } from './portfolioState'
import { shortenAddress } from '../helpers'

export type UsePortfolioRuntimeOptions = {
  forceFarmsUnavailable?: boolean
  forcePoolsUnavailable?: boolean
}

export function usePortfolioRuntime(options: UsePortfolioRuntimeOptions = {}): {
  model: PortfolioViewModel
  generation: number
  cacheKeys: Record<string, string>
} {
  const { address, isConnecting, isReconnecting } = useAccount()
  const { chainId: activeChainId } = useActiveChainId()
  const { chain } = useNetwork()
  const chainId = activeChainId ?? chain?.id ?? null

  const liquidityVm = usePassportLiquidityPositions()
  const farmsRuntime = useFarmsStakingRuntime()
  const poolsRuntime = usePoolsStakingRuntime()

  const generationRef = useRef(0)
  const scopeRef = useRef<{ wallet: string | null; chainId: number | null }>({
    wallet: null,
    chainId: null,
  })
  const lastGoodFarms = useRef<{
    wallet: string
    chainId: number
    positions: FarmsWalletPosition[]
  } | null>(null)
  const lastGoodPools = useRef<{
    wallet: string
    chainId: number
    positions: PoolsWalletPosition[]
  } | null>(null)

  const [walletEpoch, setWalletEpoch] = useState(0)

  useEffect(() => {
    const prev = scopeRef.current
    const nextWallet = address ?? null
    const changed = clearOnWalletChange({
      previousWallet: prev.wallet,
      nextWallet,
    })
    const chainChanged = prev.chainId != null && chainId != null && prev.chainId !== chainId
    if (changed || chainChanged) {
      generationRef.current += 1
      lastGoodFarms.current = null
      lastGoodPools.current = null
      setWalletEpoch((n) => n + 1)
    }
    scopeRef.current = { wallet: nextWallet, chainId }
  }, [address, chainId])

  const farmsVm = useMemo(() => {
    const requestGeneration = generationRef.current
    const account = address ?? null
    if (
      shouldRejectStaleResponse({
        requestWallet: account,
        requestChainId: chainId,
        currentWallet: scopeRef.current.wallet,
        currentChainId: scopeRef.current.chainId,
        requestGeneration,
        currentGeneration: generationRef.current,
      })
    ) {
      return buildFarmsWalletPositionsViewModel({
        account: null,
        chainId: null,
        portfolioFarms: [],
        userDataLoaded: false,
        farmsLoading: false,
        generation: requestGeneration,
        previous: null,
      })
    }

    if (options.forceFarmsUnavailable) {
      return buildFarmsWalletPositionsViewModel({
        account,
        chainId,
        portfolioFarms: [],
        userDataLoaded: true,
        farmsLoading: false,
        generation: requestGeneration,
        previous: null,
        sourcesFailed: true,
      })
    }

    const prior = lastGoodFarms.current
    const previous =
      prior &&
      account &&
      chainId &&
      prior.wallet.toLowerCase() === account.toLowerCase() &&
      prior.chainId === chainId
        ? prior.positions
        : null

    const vm = buildFarmsWalletPositionsViewModel({
      account,
      chainId,
      portfolioFarms: farmsRuntime.portfolioFarms ?? [],
      userDataLoaded: farmsRuntime.userDataLoaded,
      farmsLoading:
        farmsRuntime.phase === 'loading_farms' || farmsRuntime.phase === 'reading_wallet',
      generation: requestGeneration,
      previous,
      previousWallet: prior?.wallet,
      previousChainId: prior?.chainId,
      sourcesFailed: farmsRuntime.phase === 'error',
    })

    if (
      (vm.state === 'ready' || vm.state === 'partial' || vm.state === 'empty' || vm.state === 'stale') &&
      account &&
      chainId
    ) {
      lastGoodFarms.current = { wallet: account, chainId, positions: vm.positions }
    }
    return vm
  }, [
    address,
    chainId,
    farmsRuntime.portfolioFarms,
    farmsRuntime.userDataLoaded,
    farmsRuntime.phase,
    options.forceFarmsUnavailable,
    walletEpoch,
  ])

  const poolsVm = useMemo(() => {
    const requestGeneration = generationRef.current
    const account = address ?? null
    if (
      shouldRejectStaleResponse({
        requestWallet: account,
        requestChainId: chainId,
        currentWallet: scopeRef.current.wallet,
        currentChainId: scopeRef.current.chainId,
        requestGeneration,
        currentGeneration: generationRef.current,
      })
    ) {
      return buildPoolsWalletPositionsViewModel({
        account: null,
        chainId: null,
        portfolioPools: [],
        userDataLoaded: false,
        poolsLoading: false,
        generation: requestGeneration,
        previous: null,
      })
    }

    if (options.forcePoolsUnavailable) {
      return buildPoolsWalletPositionsViewModel({
        account,
        chainId,
        portfolioPools: [],
        userDataLoaded: true,
        poolsLoading: false,
        generation: requestGeneration,
        previous: null,
        sourcesFailed: true,
      })
    }

    const prior = lastGoodPools.current
    const previous =
      prior &&
      account &&
      chainId &&
      prior.wallet.toLowerCase() === account.toLowerCase() &&
      prior.chainId === chainId
        ? prior.positions
        : null

    const vm = buildPoolsWalletPositionsViewModel({
      account,
      chainId,
      portfolioPools: poolsRuntime.portfolioPools ?? [],
      userDataLoaded: poolsRuntime.userDataLoaded,
      poolsLoading:
        poolsRuntime.phase === 'reading_wallet' || poolsRuntime.phase === 'loading_pools',
      generation: requestGeneration,
      previous,
      previousWallet: prior?.wallet,
      previousChainId: prior?.chainId,
      sourcesFailed: poolsRuntime.phase === 'error',
    })

    if (
      (vm.state === 'ready' || vm.state === 'partial' || vm.state === 'empty' || vm.state === 'stale') &&
      account &&
      chainId
    ) {
      lastGoodPools.current = { wallet: account, chainId, positions: vm.positions }
    }
    return vm
  }, [
    address,
    chainId,
    poolsRuntime.portfolioPools,
    poolsRuntime.userDataLoaded,
    poolsRuntime.phase,
    options.forcePoolsUnavailable,
    walletEpoch,
  ])

  const walletConnected = Boolean(address)
  const scopedLiquidity = !address || !walletConnected ? [] : liquidityVm.positions
  const scopedFarms = !address ? [] : farmsVm.positions
  const scopedPools = !address ? [] : poolsVm.positions

  const model = useMemo(
    () =>
      buildPortfolioViewModel({
        wallet: {
          connected: walletConnected,
          loading: Boolean(isConnecting || isReconnecting),
          address: address ?? null,
          shortened: address ? shortenAddress(address) : null,
        },
        chainId,
        liquidity: scopedLiquidity,
        farms: scopedFarms,
        pools: scopedPools,
        domains: {
          liquidityLoading: liquidityVm.loading,
          farmsLoading: farmsVm.state === 'loading',
          poolsLoading: poolsVm.state === 'loading',
          anyDomainError: farmsVm.state === 'unavailable' || poolsVm.state === 'unavailable',
          anyDomainPartial:
            farmsVm.state === 'partial' ||
            farmsVm.state === 'stale' ||
            poolsVm.state === 'partial' ||
            poolsVm.state === 'stale' ||
            scopedLiquidity.some((p) => p.freshness === 'partial' || p.freshness === 'stale'),
          hasLastGoodPositions:
            (farmsVm.state === 'stale' && farmsVm.positions.length > 0) ||
            (poolsVm.state === 'stale' && poolsVm.positions.length > 0),
          farmsUnavailable: farmsVm.state === 'unavailable',
          poolsUnavailable: poolsVm.state === 'unavailable',
        },
      }),
    [
      walletConnected,
      address,
      isConnecting,
      isReconnecting,
      chainId,
      scopedLiquidity,
      scopedFarms,
      scopedPools,
      liquidityVm.loading,
      farmsVm,
      poolsVm,
    ],
  )

  const cacheKeys = useMemo(
    () => ({
      liquidity: portfolioCacheKey({ chainId, wallet: address ?? null, domain: 'liquidity' }),
      farms: portfolioCacheKey({ chainId, wallet: address ?? null, domain: 'farms' }),
      pools: portfolioCacheKey({ chainId, wallet: address ?? null, domain: 'pools' }),
      rewards: portfolioCacheKey({ chainId, wallet: address ?? null, domain: 'rewards' }),
    }),
    [address, chainId],
  )

  return { model, generation: generationRef.current, cacheKeys }
}
