import { useState, useEffect } from 'react'
import { useFarms, usePriceCakeBusd } from 'state/farms/hooks'
import { useAppDispatch } from 'state'
import { fetchFarmsPublicDataAsync } from 'state/farms'
import BigNumber from 'bignumber.js'
import { DeserializedFarm, FarmWithStakedValue } from '@pancakeswap/farms'
import { getFarmConfig } from '@pancakeswap/farms/constants'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { getMasterChefAddress } from 'utils/addressHelpers'
import { compareYieldTruthDesc } from 'lib/data-truth/yieldTruthRanking'
import { getFarmApr } from 'utils/apr'

enum FetchStatus {
  NOT_FETCHED = 'not-fetched',
  FETCHING = 'fetching',
  SUCCESS = 'success',
  FAILED = 'failed',
}

const useGetTopFarmsByApr = (isIntersecting: boolean) => {
  const dispatch = useAppDispatch()
  const { chainId } = useActiveChainId()
  const { data: farms, regularCakePerBlock } = useFarms()
  const [fetchStatus, setFetchStatus] = useState(FetchStatus.NOT_FETCHED)
  const [topFarms, setTopFarms] = useState<FarmWithStakedValue[]>([])
  const cakePriceBusd = usePriceCakeBusd()

  useEffect(() => {
    setFetchStatus(FetchStatus.NOT_FETCHED)
    setTopFarms([])
  }, [chainId])

  useEffect(() => {
    const fetchFarmData = async () => {
      if (!chainId || !getMasterChefAddress(chainId)) {
        setFetchStatus(FetchStatus.SUCCESS)
        setTopFarms([])
        return
      }
      setFetchStatus(FetchStatus.FETCHING)
      try {
        const farmsConfig = await getFarmConfig(chainId)
        const activeFarms = (farmsConfig ?? []).filter(
          (farm) => farm.pid !== 0 && String(farm.multiplier ?? '1X').toUpperCase() !== '0X',
        )
        if (activeFarms.length === 0) {
          setFetchStatus(FetchStatus.SUCCESS)
          setTopFarms([])
          return
        }
        await dispatch(
          fetchFarmsPublicDataAsync({
            pids: activeFarms.map((farm) => farm.pid),
            chainId,
            flag: 'pkg',
          }),
        )
        setFetchStatus(FetchStatus.SUCCESS)
      } catch (e) {
        console.error(e)
        setFetchStatus(FetchStatus.FAILED)
      }
    }

    if (isIntersecting && fetchStatus === FetchStatus.NOT_FETCHED) {
      fetchFarmData()
    }
  }, [dispatch, fetchStatus, isIntersecting, chainId])

  useEffect(() => {
    const getTopFarmsByApr = (farmsState: DeserializedFarm[]) => {
      if (!chainId) return
      const farmsWithPrices = farmsState.filter(
        (farm) => farm.pid !== 0 && farm.lpTotalInQuoteToken && farm.quoteTokenPriceBusd,
      )
      const farmsWithApr: FarmWithStakedValue[] = farmsWithPrices.map((farm) => {
        const totalLiquidity = new BigNumber(farm.lpTotalInQuoteToken).times(farm.quoteTokenPriceBusd)
        const { cakeRewardsApr, lpRewardsApr } = getFarmApr(
          chainId,
          new BigNumber(farm.poolWeight),
          cakePriceBusd,
          totalLiquidity,
          farm.lpAddress,
          regularCakePerBlock,
        )
        // Attach liquidity so Home TVL (farm.liquidity) can display factual USD —
        // mirrors FarmsStudio enrichFarmsWithApr. Never invent: only when both inputs exist.
        return { ...farm, apr: cakeRewardsApr, lpRewardsApr, liquidity: totalLiquidity }
      })

      const sortedByTruth = [...farmsWithApr].sort((a, b) => {
        const tvlA = a.liquidity?.toNumber?.() ?? 0
        const tvlB = b.liquidity?.toNumber?.() ?? 0
        const aprA = (a.apr ?? 0) + (a.lpRewardsApr ?? 0)
        const aprB = (b.apr ?? 0) + (b.lpRewardsApr ?? 0)
        const volA = a.lpRewardsApr && a.lpRewardsApr > 0 ? a.lpRewardsApr : 0
        const volB = b.lpRewardsApr && b.lpRewardsApr > 0 ? b.lpRewardsApr : 0
        return compareYieldTruthDesc(
          { sortTvl: tvlA, sortApr: aprA > 0 ? aprA : -1, sortVolume: volA },
          { sortTvl: tvlB, sortApr: aprB > 0 ? aprB : -1, sortVolume: volB },
        )
      })
      setTopFarms(sortedByTruth.slice(0, 5))
    }

    if (fetchStatus === FetchStatus.SUCCESS && topFarms.length === 0 && farms?.length) {
      getTopFarmsByApr(farms)
    }
  }, [farms, fetchStatus, cakePriceBusd, regularCakePerBlock, topFarms.length, chainId])

  return { topFarms, fetchStatus }
}

export default useGetTopFarmsByApr
