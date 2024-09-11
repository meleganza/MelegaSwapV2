import { useCallback } from 'react'
import { DEFAULT_GAS_LIMIT } from 'config'
import { parseUnits } from '@ethersproject/units'
import { useMasterchef, useSousChef } from 'hooks/useContract'
import { useGasPrice } from 'state/user/hooks'
import { unstakeFarm } from 'utils/calls'

const options = {
  gasLimit: DEFAULT_GAS_LIMIT,
}

const sousUnstake = (sousChefContract: any, amount: string, decimals: number, gasPrice: string) => {
  const units = parseUnits(amount, decimals)
  return sousChefContract.withdraw(units.toString(), {
    ...options,
    gasPrice,
  })
}

const sousEmergencyUnstake = (sousChefContract: any, gasPrice: string) => {
  return sousChefContract.emergencyWithdraw({ ...options, gasPrice })
}

const useUnstakePool = (sousId: number, enableEmergencyWithdraw = false, chainId?: number) => {
  const sousChefContract = sousId === 0 ? useMasterchef(undefined, chainId) : useSousChef(sousId, chainId)
  const gasPrice = useGasPrice()
  
  const handleUnstake = useCallback(
    async (amount: string, decimals: number) => {
      if (sousId === 0) {
        return await unstakeFarm(sousChefContract, 0, amount)
      } else if (enableEmergencyWithdraw) {
        return sousEmergencyUnstake(sousChefContract, gasPrice)
      }

      return sousUnstake(sousChefContract, amount, decimals, gasPrice)
    },
    [enableEmergencyWithdraw, sousChefContract, gasPrice],
  )

  return { onUnstake: handleUnstake }
}

export default useUnstakePool