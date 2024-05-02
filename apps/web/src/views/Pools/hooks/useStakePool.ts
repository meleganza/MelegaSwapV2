import { useCallback } from 'react'
import BigNumber from 'bignumber.js'
import { DEFAULT_TOKEN_DECIMAL, DEFAULT_GAS_LIMIT } from 'config'
import { getFullDecimalMultiplier } from '@pancakeswap/utils/getFullDecimalMultiplier'
import { useMasterchef, useSousChef } from 'hooks/useContract'
import { useGasPrice } from 'state/user/hooks'
import { useAppDispatch } from 'state'
import { useWeb3React } from '@pancakeswap/wagmi'
import { stakeFarm } from 'utils/calls'
import { updateUserBalance, updateUserStakedBalance } from 'state/pools'
import { BIG_TEN } from '@pancakeswap/utils/bigNumber'

const options = {
  gasLimit: DEFAULT_GAS_LIMIT,
}

const sousStake = async (sousChefContract, amount, gasPrice?: string, decimals?: any) => {
  // const tx = await sousChefContract.deposit(new BigNumber(amount).times(BIG_TEN.pow(decimals)).toString(), options)
  // const receipt = await tx.wait()
  // return receipt.status
  return sousChefContract.deposit(new BigNumber(amount).times(getFullDecimalMultiplier(decimals)).toString(), {
    ...options,
    gasPrice,
  })

}

const sousStakeBnb = async (sousChefContract, amount, gasPrice?: string) => {
  return sousChefContract.deposit(new BigNumber(amount).times(DEFAULT_TOKEN_DECIMAL).toString(), {
    ...options,
    gasPrice,
  })
}

const useStakePool = (sousId: number, isUsingBnb = false) => {
  const dispatch = useAppDispatch()
  const { account } = useWeb3React()
  const masterChefContract = useMasterchef()
  const sousChefContract = useSousChef(sousId)
  const gasPrice = useGasPrice()
  
  const handleStake = useCallback(
    async (amount: string, decimals: any) => {
      if (sousId === 0) {
        // const amount_ = amount.mul(BIG_TEN)
        await stakeFarm(masterChefContract, 0, amount, gasPrice)
      } else if (isUsingBnb) {
        await sousStakeBnb(sousChefContract, amount)
      } else {
        return sousStake(sousChefContract, amount, gasPrice, decimals)
      }
      dispatch(updateUserStakedBalance({ sousId, account }))
      dispatch(updateUserBalance({sousId, account}))
    },
    [account, dispatch, isUsingBnb, masterChefContract, sousChefContract, sousId],
  )

  return { onStake: handleStake }
}

export default useStakePool
