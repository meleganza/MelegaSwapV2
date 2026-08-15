import { useState, useEffect, useMemo } from 'react'
import { useAppDispatch } from 'state'
import { VaultKey } from 'state/types'
import { fetchCakeVaultFees, fetchPoolsPublicDataAsync, fetchCakeVaultPublicData } from 'state/pools'
import { fetchFarmsPublicDataAsync } from 'state/farms'
import { usePoolsWithVault } from 'state/pools/hooks'
import { useInitialBlock } from 'state/block/hooks'
import { FetchStatus } from 'config/constants/types'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { usePriceCakeBusd } from 'state/farms/hooks'
import { useCurrentBlock } from 'state/block/hooks'
import { getFarmConfig } from '@pancakeswap/farms/constants'
import { livePools1, livePools56, livePools8453, livePools137, livePools42161 } from 'config/constants/pools'
import { derivePoolLifecycle } from 'lib/data-truth/poolLifecycle'
import { resolvePoolAprPercent, resolvePoolTvlUsd } from 'lib/data-truth/yieldMetricHelpers'

function livePoolEarnAddresses(chainId: number): string[] {
  const cfg =
    chainId === 1
      ? livePools1
      : chainId === 56
      ? livePools56
      : chainId === 137
      ? livePools137
      : chainId === 42161
      ? livePools42161
      : livePools8453
  return (cfg ?? [])
    .filter(({ sousId }) => sousId !== 0)
    .map(({ earningToken }) => earningToken?.address)
    .filter(Boolean) as string[]
}

/**
 * Resolve farm PIDs that bootstrap token USD prices for SmartChef TVL/APR.
 * Mirrors Pools Studio `getActiveFarms` intent — farm public data must land
 * before `fetchPoolsPublicDataAsync` or stakingTokenPrice stays 0.
 */
async function resolvePriceHelperFarmPids(chainId: number, earningTokenAddresses: string[] = []): Promise<number[]> {
  const farmsConfig = await getFarmConfig(chainId)
  if (!farmsConfig?.length) return []
  // Mirror Pools Studio getActiveFarms: helpers + farms whose token prices a live pool earn asset.
  const earnSet = new Set(earningTokenAddresses.map((a) => a.toLowerCase()).filter(Boolean))
  const helpers = farmsConfig.filter(
    ({ token, pid, quoteToken }) =>
      pid !== 0 &&
      ((token.symbol === 'MARCO' &&
        (quoteToken.symbol === 'BNB' || quoteToken.symbol === 'WBNB' || quoteToken.symbol === 'WETH')) ||
        (token.symbol === 'BNB' && quoteToken.symbol === 'BUSD') ||
        (token.symbol === 'WBNB' && quoteToken.symbol === 'BUSD') ||
        (token.symbol === 'WETH' && (quoteToken.symbol === 'USDC' || quoteToken.symbol === 'USDT')) ||
        (token.symbol === 'CAKE' && (quoteToken.symbol === 'WBNB' || quoteToken.symbol === 'WETH')) ||
        (token.address && earnSet.has(token.address.toLowerCase()))),
  )
  const pids = (helpers.length > 0 ? helpers : farmsConfig.filter((f) => f.pid !== 0)).map((f) => f.pid)
  return [...new Set(pids)]
}

/**
 * Top pools for Home — factual ranking by TVL → APR.
 * Farm public data is fetched first so pool stake/earn prices exist (same order as Pools Studio).
 * Includes pools with certified TVL even when APR is unavailable.
 */
const useGetTopPoolsByApr = (isIntersecting: boolean, sharedFarmDataReady?: boolean) => {
  const dispatch = useAppDispatch()
  const { chainId } = useActiveChainId()

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
        // 1) Farm prices first — same earn-token expansion as Pools Studio getActiveFarms.
        if (sharedFarmDataReady !== true) {
          const pids = await resolvePriceHelperFarmPids(chainId, livePoolEarnAddresses(chainId))
          if (pids.length > 0) {
            await dispatch(fetchFarmsPublicDataAsync({ pids, chainId, flag: 'pkg' }))
          }
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

    const waitingForSharedFarmData = sharedFarmDataReady === false
    if (isIntersecting && !waitingForSharedFarmData && fetchStatus === FetchStatus.Idle && initialBlock > 0) {
      fetchPoolsPublicData()
    }
  }, [dispatch, fetchStatus, isIntersecting, initialBlock, chainId, sharedFarmDataReady])

  const topPools = useMemo(() => {
    const hints = { marcoUsd: marcoUsd && marcoUsd > 0 ? marcoUsd : undefined }
    const candidates = (pools ?? []).filter((pool) => pool && pool.sousId !== 0 && pool.vaultKey !== VaultKey.CakeVault)
    const ranked = candidates
      .map((pool) => {
        const apr = resolvePoolAprPercent(pool) ?? 0
        const tvlUsd = resolvePoolTvlUsd(pool, hints)
        const life = derivePoolLifecycle(pool, currentBlock)
        return { pool, apr, tvlUsd, life }
      })
      // Certified economics only — never surface inventory/skeleton names with empty TVL/APR.
      .filter((row) => !row.pool.isFinished && row.apr > 0)
      .sort((a, b) => {
        if (b.apr !== a.apr) return b.apr - a.apr
        if (b.tvlUsd !== a.tvlUsd) return b.tvlUsd - a.tvlUsd
        const idA = String(a.pool.contractAddress || a.pool.sousId).toLowerCase()
        const idB = String(b.pool.contractAddress || b.pool.sousId).toLowerCase()
        return idA.localeCompare(idB)
      })
      .slice(0, 3)
      .map((row) => row.pool)

    return ranked
  }, [pools, currentBlock, marcoUsd])

  return { setTopPools: () => undefined, topPools, fetchStatus }
}

export default useGetTopPoolsByApr
