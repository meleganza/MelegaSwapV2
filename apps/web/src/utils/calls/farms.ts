import { Contract } from '@ethersproject/contracts'
import BigNumber from 'bignumber.js'
import { DEFAULT_TOKEN_DECIMAL, DEFAULT_GAS_LIMIT } from 'config'

const options = {
  gasLimit: DEFAULT_GAS_LIMIT,
}

export const stakeFarm = async (masterChefContract: Contract, pid, amount, gasPrice?: string, gasLimit?: number) => {
  // const value = new BigNumber(amount).times(DEFAULT_TOKEN_DECIMAL).toString()
  // if (pid !== 0) {
  //   return masterChefContract.deposit(pid, value, {
  //     gasLimit: gasLimit || DEFAULT_GAS_LIMIT,
  //     gasPrice,
  //   })
  // }

  // return masterChefContract.enterStaking(value, options)
  const value = new BigNumber(amount).times(DEFAULT_TOKEN_DECIMAL).toString()
  if (pid === 0) {
    const tx = await masterChefContract.enterStaking(value, {
      ...options,
      gasPrice,
    })
    // const receipt = await tx.wait()
    // return receipt.status
    return tx
  }

  const tx = await masterChefContract.deposit(pid, value, options)
  // const receipt = await tx.wait()
  // return receipt.status
  return tx
}

export const unstakeFarm = async (masterChefContract, pid, amount, gasPrice?: string, gasLimit?: number) => {
  const value = new BigNumber(amount).times(DEFAULT_TOKEN_DECIMAL).toString()
  if (pid === 0) {
    const tx = await masterChefContract.leaveStaking(value, options)
    const receipt = await tx.wait()
    return receipt
  }

  const tx = await masterChefContract.withdraw(pid, value, options)
  const receipt = await tx.wait()
  return receipt.status
}

export const harvestFarm = async (masterChefContract, pid, gasPrice?: string) => {
  if (pid === 0) {
    const tx = await await masterChefContract.leaveStaking('0', options)
    const receipt = await tx.wait()
    // return receipt.status
    return tx
  }

  const tx = await masterChefContract.deposit(pid, '0', options)
  const receipt = await tx.wait()
  // return receipt.status
  return tx
}
