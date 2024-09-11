import { useState, useEffect } from 'react'
import { ChainId } from '@pancakeswap/sdk'
import { useFarms, usePriceCakeBusd } from 'state/farms/hooks'
import { useAppDispatch } from 'state'
import { fetchFarmsPublicDataAsync, nonArchivedFarms } from 'state/farms'
import { getFarmApr } from 'utils/apr'
import BigNumber from 'bignumber.js'
import { orderBy } from 'lodash'
import { DeserializedFarm, FarmWithStakedValue } from '@pancakeswap/farms'
import { Farm } from 'state/types'
import { useActiveChainId } from 'hooks/useActiveChainId'

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
  const [topFarms, setTopFarms] = useState<FarmWithStakedValue[]>([null, null, null, null, null])
  const cakePriceBusd = usePriceCakeBusd()

  useEffect(() => {
    const fetchFarmData = async () => {
      setFetchStatus(FetchStatus.FETCHING)
      const activeFarms = nonArchivedFarms?.filter(
        (farm) => farm.quoteToken !== farm.token && farm.pid !== 0 && farm.multiplier !== '0X',
      )
      try {
        await dispatch(
          fetchFarmsPublicDataAsync({
            pids: activeFarms.map((farm) => farm.pid),
            chainId:
              chainId === 1 ? ChainId.ETHEREUM
                : chainId === 56 ? ChainId.BSC
                  : chainId === 137 ? ChainId.POLYGON
                    : ChainId.BASE,
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
  }, [dispatch, setFetchStatus, fetchStatus, topFarms, isIntersecting, chainId])

  useEffect(() => {
    const getTopFarmsByApr = (farmsState: DeserializedFarm[]) => {
      const farmsWithPrices = farmsState.filter((farm) => farm.lpTotalInQuoteToken && farm.quoteTokenPriceBusd) // FIME: Property 'busdPrice' does not exist on type 'Token'
      const farmsWithApr: FarmWithStakedValue[] = farmsWithPrices.map((farm) => {
        const totalLiquidity = new BigNumber(farm.lpTotalInQuoteToken).times(farm.quoteTokenPriceBusd) // FIXME: Property 'busdPrice' does not exist on type 'Token'
        const ChainID =
          chainId === 1 ? ChainId.ETHEREUM
            : chainId === 56 ? ChainId.BSC
              : chainId === 137 ? ChainId.POLYGON
                : ChainId.BASE
                
        const { cakeRewardsApr, lpRewardsApr } = getFarmApr(
          ChainID,
          new BigNumber(farm.poolWeight),
          cakePriceBusd,
          totalLiquidity,
          farm.lpAddress,
          regularCakePerBlock,
        )
        return { ...farm, apr: cakeRewardsApr, lpRewardsApr }
      })

      const sortedByApr = orderBy(farmsWithApr, (farm) => farm.apr + farm.lpRewardsApr, 'desc')
      setTopFarms(sortedByApr.slice(0, 5))
    }

    if (fetchStatus === FetchStatus.SUCCESS && !topFarms[0]) {
      getTopFarmsByApr(farms) // FIXME: Argument of type 'DeserializedFarm[]' is not assignable to parameter of type 'Farm[]'
    }

  }, [setTopFarms, farms, fetchStatus, cakePriceBusd, regularCakePerBlock, topFarms, chainId])

  return { topFarms }
}

export default useGetTopFarmsByApr
