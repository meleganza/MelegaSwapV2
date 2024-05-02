import { useEffect, useMemo } from 'react'
import { useAccount } from 'wagmi'
import { useWeb3React } from '@pancakeswap/wagmi'
import { batch, useSelector } from 'react-redux'
import { useAppDispatch } from 'state'
import { useFastRefreshEffect, useSlowRefreshEffect } from 'hooks/useRefreshEffect'
import { featureFarmApiAtom, useFeatureFlag } from 'hooks/useFeatureFlag'
import { FAST_INTERVAL } from 'config/constants'
import useSWRImmutable from 'swr/immutable'
import { getFarmConfig } from '@pancakeswap/farms/constants'
import { livePools } from 'config/constants/pools'
import { Pool } from '@pancakeswap/uikit'
import { Token } from '@pancakeswap/sdk'

import { useActiveChainId } from 'hooks/useActiveChainId'
import {
  fetchPoolsPublicDataAsync,
  fetchPoolsUserDataAsync,
  fetchCakeVaultPublicData,
  fetchCakeVaultUserData,
  fetchCakeVaultFees,
  // fetchPoolsStakingLimitsAsync,
  fetchUserIfoCreditDataAsync,
  fetchIfoPublicDataAsync,
  fetchCakeFlexibleSideVaultPublicData,
  fetchCakeFlexibleSideVaultUserData,
  fetchCakeFlexibleSideVaultFees,
  fetchCakePoolUserDataAsync,
  fetchCakePoolPublicDataAsync,
} from '.'
import { State, VaultKey } from '../types'
import { fetchFarmsPublicDataAsync } from '../farms'
import {
  makePoolWithUserDataLoadingSelector,
  makeVaultPoolByKey,
  poolsWithVaultSelector,
  ifoCreditSelector,
  ifoCeilingSelector,
  makeVaultPoolWithKeySelector,
} from './selectors'
import BigNumber from 'bignumber.js'

const lPoolAddresses = livePools.filter(({ sousId }) => sousId !== 0).map(({ earningToken }) => earningToken.address)

// Only fetch farms for live pools
const getActiveFarms = async (chainId: number) => {
  const farmsConfig = await getFarmConfig(chainId)
  return farmsConfig
    .filter(
      ({ token, pid, quoteToken }) =>
        pid !== 0 &&
        ((token.symbol === 'MARCO' && quoteToken.symbol === 'BNB') ||
          (token.symbol === 'BNB' && quoteToken.symbol === 'BUSD') ||
          lPoolAddresses.find((poolAddress) => poolAddress === token.address)),
    )
    .map((farm) => farm.pid)
}

const getCakePriceFarms = async (chainId: number) => {
  const farmsConfig = await getFarmConfig(chainId)
  return farmsConfig
    .filter(
      ({ token, pid, quoteToken }) =>
        pid !== 0 &&
        ((token.symbol === 'CAKE' && quoteToken.symbol === 'WBNB') ||
          (token.symbol === 'BUSD' && quoteToken.symbol === 'WBNB')),
    )
    .map((farm) => farm.pid)
}

export const useFetchPublicPoolsData = () => {
  const dispatch = useAppDispatch()
  const { chainId } = useActiveChainId()
  const farmFlag = useFeatureFlag(featureFarmApiAtom)

  useSlowRefreshEffect(
    (currentBlock) => {
      const fetchPoolsDataWithFarms = async () => {
        const activeFarms = await getActiveFarms(chainId)
        await dispatch(fetchFarmsPublicDataAsync({ pids: activeFarms, chainId, flag: farmFlag }))
        batch(() => {
          dispatch(fetchPoolsPublicDataAsync(currentBlock, chainId))
          // dispatch(fetchPoolsStakingLimitsAsync())
        })
      }

      fetchPoolsDataWithFarms()
    },
    [dispatch, chainId, farmFlag],
  )
}

export const usePool = (sousId: number): { pool: Pool.DeserializedPool<Token>; userDataLoaded: boolean } => {
  const poolWithUserDataLoadingSelector = useMemo(() => makePoolWithUserDataLoadingSelector(sousId), [sousId])
  return useSelector(poolWithUserDataLoadingSelector)
}

export const usePoolsWithVault = () => {
  return useSelector(poolsWithVaultSelector)
}

export const useDeserializedPoolByVaultKey = (vaultKey) => {
  const vaultPoolWithKeySelector = useMemo(() => makeVaultPoolWithKeySelector(vaultKey), [vaultKey])

  return useSelector(vaultPoolWithKeySelector)
}

export const usePoolsPageFetch = () => {
  const { address: account } = useAccount()
  const dispatch = useAppDispatch()
  
  useFetchPublicPoolsData()

  useFastRefreshEffect(() => {
    batch(() => {
      dispatch(fetchCakeVaultPublicData())
      dispatch(fetchCakeFlexibleSideVaultPublicData())
      dispatch(fetchIfoPublicDataAsync())
      if (account) {
        dispatch(fetchPoolsUserDataAsync(account))
        dispatch(fetchCakeVaultUserData({ account }))
        dispatch(fetchCakeFlexibleSideVaultUserData({ account }))
      }
    })
  }, [account, dispatch])

  useEffect(() => {
    batch(() => {
      dispatch(fetchCakeVaultFees())
      dispatch(fetchCakeFlexibleSideVaultFees())
    })
  }, [dispatch])
}

export const useCakeVaultUserData = () => {
  const { address: account } = useAccount()
  const dispatch = useAppDispatch()

  useFastRefreshEffect(() => {
    if (account) {
      dispatch(fetchCakeVaultUserData({ account }))
    }
  }, [account, dispatch])
}

export const useCakeVaultPublicData = () => {
  const dispatch = useAppDispatch()
  useFastRefreshEffect(() => {
    dispatch(fetchCakeVaultPublicData())
  }, [dispatch])
}

export const useFetchIfo = () => {
  const { account, chainId } = useWeb3React()
  const dispatch = useAppDispatch()
  const farmFlag = useFeatureFlag(featureFarmApiAtom)

  useSWRImmutable(
    'fetchIfoPublicData',
    async () => {
      const cakePriceFarms = await getCakePriceFarms(chainId)
      await dispatch(fetchFarmsPublicDataAsync({ pids: cakePriceFarms, chainId, flag: farmFlag }))
      batch(() => {
        dispatch(fetchCakePoolPublicDataAsync())
        dispatch(fetchCakeVaultPublicData())
        dispatch(fetchIfoPublicDataAsync())
      })
    },
    {
      refreshInterval: FAST_INTERVAL,
    },
  )

  useSWRImmutable(
    account && ['fetchIfoUserData', account],
    async () => {
      batch(() => {
        dispatch(fetchCakePoolUserDataAsync(account))
        dispatch(fetchCakeVaultUserData({ account }))
        dispatch(fetchUserIfoCreditDataAsync(account))
      })
    },
    {
      refreshInterval: FAST_INTERVAL,
    },
  )

  useSWRImmutable('fetchCakeVaultFees', async () => {
    dispatch(fetchCakeVaultFees())
  })
}

export const useCakeVault = () => {
  return useVaultPoolByKey(VaultKey.CakeVault)
}

export const useCakeVault1 = () => {
  const {
    totalShares: totalSharesAsString,
    pricePerFullShare: pricePerFullShareAsString,
    totalDexTokenInVault: totalDexTokenInVaultAsString,
    estimatedDexTokenBountyReward: estimatedDexTokenBountyRewardAsString,
    totalPendingDexTokenHarvest: totalPendingDexTokenHarvestAsString,
    fees: { performanceFee, callFee, withdrawalFee, withdrawalFeePeriod },
    userData: {
      isLoading,
      userShares: userSharesAsString,
      dexTokenAtLastUserAction: dexTokenAtLastUserActionAsString,
      lastDepositedTime,
      lastUserActionTime,
    },
  } = useSelector((state: State) => state.pools.cakeVault)
  const estimatedDexTokenBountyReward = useMemo(() => {
    return new BigNumber(estimatedDexTokenBountyRewardAsString)
  }, [estimatedDexTokenBountyRewardAsString])

  const totalPendingDexTokenHarvest = useMemo(() => {
    return new BigNumber(totalPendingDexTokenHarvestAsString)
  }, [totalPendingDexTokenHarvestAsString])

  const totalShares = useMemo(() => {
    return new BigNumber(totalSharesAsString)
  }, [totalSharesAsString])

  const pricePerFullShare = useMemo(() => {
    return new BigNumber(pricePerFullShareAsString)
  }, [pricePerFullShareAsString])

  const totalDexTokenInVault = useMemo(() => {
    return new BigNumber(totalDexTokenInVaultAsString)
  }, [totalDexTokenInVaultAsString])

  const userShares = useMemo(() => {
    return new BigNumber(userSharesAsString)
  }, [userSharesAsString])

  const dexTokenAtLastUserAction = useMemo(() => {
    return new BigNumber(dexTokenAtLastUserActionAsString)
  }, [dexTokenAtLastUserActionAsString])

  return {
    totalShares,
    pricePerFullShare,
    totalDexTokenInVault,
    estimatedDexTokenBountyReward,
    totalPendingDexTokenHarvest,
    fees: {
      performanceFee,
      callFee,
      withdrawalFee,
      withdrawalFeePeriod,
    },
    userData: {
      isLoading,
      userShares,
      dexTokenAtLastUserAction,
      lastDepositedTime,
      lastUserActionTime,
    },
  }
}


export const useVaultPoolByKey = (key: VaultKey) => {
  const vaultPoolByKey = useMemo(() => makeVaultPoolByKey(key), [key])

  return useSelector(vaultPoolByKey)
}

export const useIfoCredit = () => {
  return useSelector(ifoCreditSelector)
}

export const useIfoCeiling = () => {
  return useSelector(ifoCeilingSelector)
}
