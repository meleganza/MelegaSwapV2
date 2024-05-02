import { useCallback } from 'react'
// import { useWeb3React } from '@pancakeswap/wagmi'
import { burn, burnETH } from 'utils/calls'
import { useBridge } from 'hooks/useContract'
import { useGasPrice } from 'state/user/hooks'
// import { useOraclePrice } from 'views/Farms/hooks/useFetchOraclePrice'

const useBurnToken = (pid: number, isNative = false) => {
  const gasPrice = useGasPrice()
  const bridgeContract = useBridge()

  const handleStake = useCallback(
    async (amount: string) => {
      if (isNative) {
        return burnETH(bridgeContract, pid, amount, gasPrice)  
      }
      return burn(bridgeContract, pid, amount, gasPrice)
    },
    [bridgeContract, pid, gasPrice, isNative],
  )

  return { onStake: handleStake }
}

export default useBurnToken
