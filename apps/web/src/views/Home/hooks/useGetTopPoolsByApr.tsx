import { useState, useEffect, useMemo } from 'react'
import { useAppDispatch } from 'state'
import { VaultKey } from 'state/types'
import { fetchCakeVaultFees, fetchPoolsPublicDataAsync, fetchCakeVaultPublicData } from 'state/pools'
import { usePoolsWithVault } from 'state/pools/hooks'
import { useInitialBlock } from 'state/block/hooks'
import { FetchStatus } from 'config/constants/types'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { usePollFarmsWithUserData, usePriceCakeBusd } from 'state/farms/hooks'
import { useCurrentBlock } from 'state/block/hooks'
import { derivePoolLifecycle } from 'lib/data-truth/poolLifecycle'
import {
  resolvePoolAprPercent,
  resolvePoolTvlUsd,
} from 'lib/data-truth/yieldMetricHelpers'

/**
 * Top pools for Home — factual ranking by TVL → APR.
 * Includes pools with certified TVL even when APR is unavailable (eligibility
 * is not required for listing; APR display stays gated separately on Home).
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
    const fetchPoolsPublicData = async () => {
      setFetchStatus(FetchStatus.Fetching)
      try {
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
