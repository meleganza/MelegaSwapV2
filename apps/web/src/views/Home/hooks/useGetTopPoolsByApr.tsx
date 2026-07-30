import { useState, useEffect, useMemo } from 'react'
import { useAppDispatch } from 'state'
import { VaultKey } from 'state/types'
import { fetchCakeVaultFees, fetchPoolsPublicDataAsync, fetchCakeVaultPublicData } from 'state/pools'
import { usePoolsWithVault } from 'state/pools/hooks'
import { useInitialBlock } from 'state/block/hooks'
import { FetchStatus } from 'config/constants/types'
import { Pool } from '@pancakeswap/uikit'
import { Token } from '@pancakeswap/sdk'
import { getBalanceNumber } from '@pancakeswap/utils/formatBalance'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { usePollFarmsWithUserData } from 'state/farms/hooks'
import { useCurrentBlock } from 'state/block/hooks'
import { derivePoolLifecycle } from 'lib/data-truth/poolLifecycle'
import { evaluateTopPoolsAprEligibility } from 'views/PoolsStudio/poolsRuntime/poolsAprRules'
import { getAprData } from 'views/Pools/helpers'

function factualPoolApr(pool: Pool.DeserializedPool<Token>): number | undefined {
  if (pool.apr && pool.apr > 0) return pool.apr
  const { apr } = getAprData(pool, 0)
  return apr > 0 ? apr : undefined
}

const useGetTopPoolsByApr = (isIntersecting: boolean) => {
  const dispatch = useAppDispatch()
  const { chainId } = useActiveChainId()
  usePollFarmsWithUserData()

  const [fetchStatus, setFetchStatus] = useState(FetchStatus.Idle)
  const initialBlock = useInitialBlock()
  const currentBlock = useCurrentBlock()
  const { pools } = usePoolsWithVault(chainId)

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
    const candidates = (pools ?? []).filter(
      (pool) => pool && pool.sousId !== 0 && pool.vaultKey !== VaultKey.CakeVault,
    )
    const ranked = candidates
      .map((pool) => {
        const apr = factualPoolApr(pool)
        const staked =
          pool.totalStaked && pool.stakingToken
            ? getBalanceNumber(pool.totalStaked, pool.stakingToken.decimals)
            : 0
        const tvlUsd = staked > 0 ? staked * (pool.stakingTokenPrice ?? 0) : 0
        const life = derivePoolLifecycle(pool, currentBlock)
        const eligibility = evaluateTopPoolsAprEligibility({
          rewarding: life.rewarding,
          emissionActive: life.rewarding,
          apr,
          tvlUsd,
          rewardPriceUsd: pool.earningTokenPrice ?? null,
          stakePriceUsd: pool.stakingTokenPrice ?? null,
        })
        return { pool, apr: apr ?? 0, tvlUsd, eligibility }
      })
      .filter((row) => row.eligibility.eligible)
      .sort((a, b) => {
        const aprDiff = b.apr - a.apr
        if (aprDiff !== 0) return aprDiff
        const tvlDiff = b.tvlUsd - a.tvlUsd
        if (tvlDiff !== 0) return tvlDiff
        const idA = String(a.pool.contractAddress || a.pool.sousId).toLowerCase()
        const idB = String(b.pool.contractAddress || b.pool.sousId).toLowerCase()
        return idA.localeCompare(idB)
      })
      .slice(0, 5)
      .map((row) => row.pool)

    return ranked
  }, [pools, currentBlock])

  return { setTopPools: () => undefined, topPools, fetchStatus }
}

export default useGetTopPoolsByApr
