import { useCallback } from 'react'
import { unstakeFarm } from 'utils/calls'
import { useMasterchef } from 'hooks/useContract'
import { useGasPrice } from 'state/user/hooks'

const useUnstakeFarms = (pid: number, chainId) => {
  const gasPrice = useGasPrice()
  const masterChefContract = useMasterchef(undefined, chainId)

  const handleUnstake = useCallback(
    async (amount: string) => {
      return unstakeFarm(masterChefContract, pid, amount, gasPrice)
    },
    [masterChefContract, pid, gasPrice],
  )
  return { onUnstake: handleUnstake }
}

export default useUnstakeFarms
