import poolsConfig, { livePools1, livePools8453, livePools137 } from 'config/constants/pools'
import masterChef from 'config/abi/masterchef.json'
import sousChefABI from 'config/abi/sousChef.json'
import erc20ABI from 'config/abi/erc20.json'
import multicall, { multicallv3 } from 'utils/multicall'
import { getMasterchefContract } from 'utils/contractHelpers'
import { getAddress, getMulticallAddress } from 'utils/addressHelpers'
import BigNumber from 'bignumber.js'
import uniq from 'lodash/uniq'
import fromPairs from 'lodash/fromPairs'
import multiCallAbi from 'config/abi/Multicall.json'
import { ChainId } from '@pancakeswap/sdk'
import { Masterchef__factory } from 'config/abi/types'

// const masterChefContract = getMasterchefContract()
// Pool 0, Cake / Cake is a different kind of contract (master chef)

// base
const nonBnbPoolsOnEth = livePools1.filter((pool) => pool.stakingToken.symbol !== 'WETH')
const bnbPoolsOnEth = livePools1.filter((pool) => pool.stakingToken.symbol === 'WETH')
const nonMasterPoolsOnEth = livePools1.filter((pool) => pool.sousId !== 0)
// BNB pools use the native BNB token (wrapping ? unwrapping is done at the contract level)
const nonBnbPools = poolsConfig.filter((pool) => pool.stakingToken.symbol !== 'WBNB')
const bnbPools = poolsConfig.filter((pool) => pool.stakingToken.symbol === 'WBNB')
const nonMasterPoolsBnb = poolsConfig.filter((pool) => pool.sousId !== 0)
// base
const nonBnbPoolsOnBase = livePools8453.filter((pool) => pool.stakingToken.symbol !== 'WETH')
const bnbPoolsOnBase = livePools8453.filter((pool) => pool.stakingToken.symbol === 'WETH')
const nonMasterPoolsOnBase = livePools8453.filter((pool) => pool.sousId !== 0)
// Polygon
const nonBnbPoolsOnPolygon = livePools137.filter((pool) => pool.stakingToken.symbol !== 'WMATIC')
const bnbPoolsOnPolygon = livePools137.filter((pool) => pool.stakingToken.symbol === 'WMATIC')
const nonMasterPoolsOnPolygon = livePools137.filter((pool) => pool.sousId !== 0)

export const fetchUserMasterChefStakeBalance = async (account, chainId) => {
  const masterChefContract = getMasterchefContract(undefined, chainId)
  const calls = [
    {
      address: masterChefContract.address,
      name: 'userInfo',
      params: ['0', account],
    },
  ]

  const masterChefPoolAmount = await multicall(masterChef, calls, chainId)
  // const { amount: masterChefPoolAmount } = await masterChefContract.userInfo('0', account)
  return { '0': new BigNumber(masterChefPoolAmount?.[0]?.[0]?._hex).toJSON() }
}

export const fetchUserMasterChefPendingReward = async (account, chainId?: number) => {
  const masterChefContract = getMasterchefContract(undefined, chainId)
  const calls = [
    {
      address: masterChefContract.address,
      name: 'pendingDexToken',
      params: ['0', account],
    },
  ]
  const pendingReward = await multicall(masterChef, calls, chainId)
  // const pendingReward = await masterChefContract.pendingDexToken('0', account)
  return { '0': new BigNumber(pendingReward.toString()).toJSON() }
}

export const fetchPoolsAllowance = async (account, chainId) => {
  const nonNativePools =
    chainId === 1 ? nonBnbPoolsOnEth
      : chainId === 137 ? nonBnbPoolsOnPolygon
        : chainId === 8453 ? nonBnbPoolsOnBase
          : nonBnbPools

  const calls = nonNativePools.map((pool) => ({
    address: pool.stakingToken.address,
    name: 'allowance',
    params: [account, getAddress(pool.contractAddress, chainId)],
  }))
  const allowances = await multicall(erc20ABI, calls, chainId)
  
  return fromPairs(nonNativePools.map((pool, index) => [pool.sousId, new BigNumber(allowances[index]).toJSON()]))
}

export const fetchUserBalances = async (account, chainId?: number) => {
  // Non BNB pools
  const nonNativePools =
    chainId === 1 ? nonBnbPoolsOnEth
      : chainId === 137 ? nonBnbPoolsOnPolygon
        : chainId === 8453 ? nonBnbPoolsOnBase
          : nonBnbPools

  const tokens = uniq(nonNativePools.map((pool) => pool.stakingToken.address))

  const tokenBalanceCalls = tokens.map((token) => ({
    abi: erc20ABI,
    address: token,
    name: 'balanceOf',
    params: [account],
  }))

  const bnbBalanceCall = {
    abi: multiCallAbi,
    address: getMulticallAddress(chainId),
    name: 'getEthBalance',
    params: [account],
  }

  const tokenBnbBalancesRaw = await multicallv3({ calls: [...tokenBalanceCalls, bnbBalanceCall], chainId })

  const bnbBalance = tokenBnbBalancesRaw.pop()
  const tokenBalances = fromPairs(tokens.map((token, index) => [token, tokenBnbBalancesRaw[index]]))

  const poolTokenBalances = fromPairs(
    nonNativePools
      .map((pool) => {

        if (!tokenBalances[pool.stakingToken.address]) return null
        return [pool.sousId, new BigNumber(tokenBalances[pool.stakingToken.address]).toJSON()]
      })
      .filter(Boolean),
  )


  // BNB pools
  const nativePools =
    chainId === 1 ? bnbPoolsOnEth
      : chainId === 137 ? bnbPoolsOnPolygon
        : chainId === 8453 ? bnbPoolsOnBase
          : bnbPools
  const bnbBalanceJson = new BigNumber(bnbBalance.toString()).toJSON()
  const bnbBalances = fromPairs(nativePools.map((pool) => [pool.sousId, bnbBalanceJson]))

  if (nativePools.length == 0) {
    return { ...poolTokenBalances }
  } else {
    return { ...poolTokenBalances, ...bnbBalances }
  }
}

export const fetchUserStakeBalances = async (account, chainId: number) => {

  const nonMasterPools =
    chainId === 1 ? nonMasterPoolsOnEth
      : chainId === 137 ? nonMasterPoolsOnPolygon
        : chainId === 8453 ? nonMasterPoolsOnBase
          : nonMasterPoolsBnb
  const calls = nonMasterPools.map((p) => ({
    address: getAddress(p.contractAddress, chainId),
    name: 'userInfo',
    params: [account],
  }))

  const userInfo = await multicall(sousChefABI, calls, chainId)
  const masterChefStakeBalance = await fetchUserMasterChefStakeBalance(account, chainId)
  return {
    ...fromPairs(
      nonMasterPools.map((pool, index) => [pool.sousId, new BigNumber(userInfo[index].amount._hex).toJSON()]),
    ),
    ...masterChefStakeBalance,
  }
}

export const fetchUserPendingRewards = async (account: string, chainId?: number) => {
  const nonMasterPools =
    chainId === 1 ? nonMasterPoolsOnEth
      : chainId === 137 ? nonMasterPoolsOnPolygon
        : chainId === 8453 ? nonMasterPoolsOnBase
          : nonMasterPoolsBnb
  const calls = nonMasterPools.map((p) => ({
    address: getAddress(p.contractAddress, chainId),
    name: 'pendingReward',
    params: [account],
  }))
  const res = await multicall(sousChefABI, calls, chainId)
  const masterChefPendingReward = await fetchUserMasterChefPendingReward(account, chainId)

  return {
    ...fromPairs(nonMasterPools.map((pool, index) => [pool.sousId, new BigNumber(res[index]).toJSON()])),
    ...masterChefPendingReward,
  }
}
