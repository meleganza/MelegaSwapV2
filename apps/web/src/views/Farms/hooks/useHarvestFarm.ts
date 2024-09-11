import { useCallback } from 'react'
import { harvestFarm } from 'utils/calls'
import { useMasterchef } from 'hooks/useContract'
import { useGasPrice } from 'state/user/hooks'

const useHarvestFarm = (farmPid: number, chainId) => {
  const masterChefContract = useMasterchef(undefined, chainId)
  const gasPrice = useGasPrice()
  const handleHarvest = useCallback(async () => {
    return harvestFarm(masterChefContract, farmPid, gasPrice)
  }, [farmPid, masterChefContract, gasPrice])

  return { onReward: handleHarvest }
}

export default useHarvestFarm
