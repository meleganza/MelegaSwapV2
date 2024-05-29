import { useCallback } from 'react'
import { BIG_ZERO } from '@pancakeswap/utils/bigNumber'
import { useMasterchef, useSousChef } from 'hooks/useContract'
import { DEFAULT_GAS_LIMIT } from 'config'
import { useGasPrice } from 'state/user/hooks'
import { harvestFarm } from 'utils/calls'
import { useWeb3React } from '@pancakeswap/wagmi'
import { updateUserBalance, updateUserPendingReward } from 'state/pools'
import { useActiveChainId } from 'hooks/useActiveChainId'

const options = {
  gasLimit: DEFAULT_GAS_LIMIT,
}

const harvestPool = async (sousChefContract, gasPrice) => {
  return sousChefContract.deposit('0', { ...options, gasPrice })
}

const harvestPoolBnb = async (sousChefContract, gasPrice) => {
  return sousChefContract.deposit({
    ...options,
    value: BIG_ZERO,
    gasPrice,
  })
}

const useHarvestPool = (sousId, isUsingBnb = false) => {
  const { account } = useWeb3React()
  const sousChefContract = useSousChef(sousId)
  const masterChefContract = useMasterchef()
  const { chainId } = useActiveChainId()
  const gasPrice = useGasPrice()

  const handleHarvest = useCallback(async () => {
    if (sousId === 0) {
      await harvestFarm(masterChefContract, 0)
    } else if (isUsingBnb) {
      return harvestPoolBnb(sousChefContract, gasPrice)
    } else {
      return harvestPool(sousChefContract, gasPrice)
    }
    dispatch(updateUserPendingReward({ sousId, account, chainId }))
    dispatch(updateUserBalance({ sousId, account, chainId }))
  }, [isUsingBnb, sousChefContract, gasPrice])

  return { onReward: handleHarvest }
}

export default useHarvestPool
function dispatch(arg0: any) {
  throw new Error('Function not implemented.')
}

