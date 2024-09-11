import { ethers } from "ethers"
import { Contract } from '@ethersproject/contracts'
import BigNumber from 'bignumber.js'
import { DEFAULT_TOKEN_DECIMAL, DEFAULT_GAS_LIMIT } from 'config'

export const burn = async (bridgeContract: Contract, pid, amount, gasPrice, gasLimit?: number) => {
  const value = new BigNumber(amount).times(pid === 3 ? 10**6 : DEFAULT_TOKEN_DECIMAL).toString()
  return bridgeContract.burn(pid, value, {
    gasLimit: gasLimit || DEFAULT_GAS_LIMIT,
    gasPrice,
  })
}

export const burnETH = async (bridgeContract: Contract, pid, amount, gasPrice, gasLimit?: number) => {
  return bridgeContract.burnETH(pid, {
    value: ethers.utils.parseEther(new BigNumber(amount).toString()),
    gasLimit: gasLimit || DEFAULT_GAS_LIMIT,
    gasPrice,
  })
}
