import { useState, useEffect, useMemo } from 'react'
import { useAppDispatch } from 'state'
import { VaultKey } from 'state/types'
import { fetchCakeVaultFees, fetchPoolsPublicDataAsync, fetchCakeVaultPublicData } from 'state/pools'
import { fetchFarmsPublicDataAsync } from 'state/farms'
import { usePoolsWithVault } from 'state/pools/hooks'
import { useInitialBlock } from 'state/block/hooks'
import { FetchStatus } from 'config/constants/types'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { usePollFarmsWithUserData, usePriceCakeBusd } from 'state/farms/hooks'
import { useCurrentBlock } from 'state/block/hooks'
import { getFarmConfig } from '@pancakeswap/farms/constants'
import { derivePoolLifecycle } from 'lib/data-truth/poolLifecycle'
import {
  resolvePoolAprPercent,
  resolvePoolTvlUsd,
} from 'lib/data-truth/yieldMetricHelpers'

/**
 * Resolve farm PIDs that bootstrap token USD prices for SmartChef TVL/APR.
 * Mirrors Pools Studio `getActiveFarms` intent — farm public data must land
 * before `fetchPoolsPublicDataAsync` or stakingTokenPrice stays 0.
 */
async function resolvePriceHelperFarmPids(chainId: number): Promise<number[]> {
  const farmsConfig = await getFarmConfig(chainId)
  if (!farmsConfig?.length) return []
  // Prefer price-helper pairs + any farm whose token may price a pool stake/earn asset.
  // Fall back to all non-zero PIDs so Home never skips the farm→price pipeline.
  const helpers = farmsConfig.filter(
    ({ token, pid, quoteToken }) =>
      pid !== 0 &&
      ((token.symbol === 'MARCO' && (quoteToken.symbol === 'BNB' || quoteToken.symbol === 'WBNB' || quoteToken.symbol === 'WETH')) ||
        (token.symbol === 'BNB' && quoteToken.symbol === 'BUSD') ||
        (token.symbol === 'WBNB' && quoteToken.symbol === 'BUSD') ||
        (token.symbol === 'WETH' && (quoteToken.symbol === 'USDC' || quoteToken.symbol === 'USDT')) ||
        (token.symbol === 'CAKE' && (quoteToken.symbol === 'WBNB' || quoteToken.symbol === 'WETH'))),
  )
  const pids = (helpers.length > 0 ? helpers : farmsConfig.filter((f) => f.pid !== 0)).map((f) => f.pid)
  return [...new Set(pids)]
}

/**
 * Top pools for Home — factual ranking by TVL → APR.
 * Farm public data is fetched first so pool stake/earn prices exist (same order as Pools Studio).
 * Includes pools with certified TVL even when APR is unavailable.
 */
const useGetTopPoolsByApr = (isIntersecting: boolean) => {
  const dispatch = useAppDispatch()
  const { chainId } = useActiveChainId()
  usePollFarmsWithUserData()

  const [fetchStatus, setFetchStatus] = useState(FetchStatus.Idle)
  const initialBlock = useInitialBlock()
  const currentBlock = useCurrentBlock()
  const { pools } = usePoolsWithVault(chainId)
  const cakePriceBusd = usePriceCakeBusd({ forceMainnet: true })
  const marcoUsd = cakePriceBusd?.toNumber?.()

  useEffect(() => {
    setFetchStatus(FetchStatus.Idle)
  }, [chainId])

  useEffect(() => {
    const fetchPoolsPublicData = async () => {
      setFetchStatus(FetchStatus.Fetching)
      try {
        // 1) Farm prices first — required for getTokenPricesFromFarm inside pool public fetch.
        const pids = await resolvePriceHelperFarmPids(chainId)
        if (pids.length > 0) {
          await dispatch(fetchFarmsPublicDataAsync({ pids, chainId, flag: 'pkg' }))
        }
        // 2) Then pools + vault (same order as useFetchPublicPoolsData).
        await Promise.all([
          dispatch(fetchCakeVaultFees({ chainId })),
          dispatch(fetchCakeVaultPublicData({ chainId })),
          dispatch(fetchPoolsPublicDataAsync(initialBlock, chainId)),
        ])
        setFetchStatus(FetchStatus.Fetched)
      } catch (e) {
        console.error(e)
        setFetchStatus(FetchStatus.Failed)
      }
    }

    if (isIntersecting && fetchStatus === FetchStatus.Idle && initialBlock > 0) {
      fetchPoolsPublicData()
    }
  }, [dispatch, fetchStatus, isIntersecting, initialBlock, chainId])

  const topPools = useMemo(() => {
    const hints = { marcoUsd: marcoUsd && marcoUsd > 0 ? marcoUsd : undefined }
    const candidates = (pools ?? []).filter(
      (pool) => pool && pool.sousId !== 0 && pool.vaultKey !== VaultKey.CakeVault,
    )
    const ranked = candidates
      .map((pool) => {
        const apr = resolvePoolAprPercent(pool) ?? 0
        const tvlUsd = resolvePoolTvlUsd(pool, hints)
        const life = derivePoolLifecycle(pool, currentBlock)
        return { pool, apr, tvlUsd, life }
      })
      .filter(
        (row) =>
          row.tvlUsd > 0 ||
          row.apr > 0 ||
          row.life.rewarding ||
          row.life.active ||
          Boolean(row.pool.earningToken?.symbol),
      )
      .sort((a, b) => {
        if (b.tvlUsd !== a.tvlUsd) return b.tvlUsd - a.tvlUsd
        if (b.apr !== a.apr) return b.apr - a.apr
        const idA = String(a.pool.contractAddress || a.pool.sousId).toLowerCase()
        const idB = String(b.pool.contractAddress || b.pool.sousId).toLowerCase()
        return idA.localeCompare(idB)
      })
      .slice(0, 8)
      .map((row) => row.pool)

    return ranked
  }, [pools, currentBlock, marcoUsd])

  return { setTopPools: () => undefined, topPools, fetchStatus }
}

export default useGetTopPoolsByApr
