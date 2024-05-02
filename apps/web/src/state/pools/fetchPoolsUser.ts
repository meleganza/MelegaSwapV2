import poolsConfig from 'config/constants/pools'
import sousChefABI from 'config/abi/sousChef.json'
import erc20ABI from 'config/abi/erc20.json'
import multicall, { multicallv3 } from 'utils/multicall'
import { getMasterchefContract } from 'utils/contractHelpers'
import { getAddress, getMulticallAddress } from 'utils/addressHelpers'
import BigNumber from 'bignumber.js'
import uniq from 'lodash/uniq'
import fromPairs from 'lodash/fromPairs'
import multiCallAbi from 'config/abi/Multicall.json'
const masterChefContract = getMasterchefContract()

// Pool 0, Cake / Cake is a different kind of contract (master chef)
// BNB pools use the native BNB token (wrapping ? unwrapping is done at the contract level)
const nonBnbPools = poolsConfig.filter((pool) => pool.stakingToken.symbol !== 'WBNB')
const bnbPools = poolsConfig.filter((pool) => pool.stakingToken.symbol === 'WBNB')
const nonMasterPools = poolsConfig.filter((pool) => pool.sousId !== 0)

const multicallAddress = getMulticallAddress()

export const fetchUserMasterChefStakeBalance = async (account) => {
  const { amount: masterChefPoolAmount } = await masterChefContract.userInfo('0', account)
  return { '0': new BigNumber(masterChefPoolAmount.toString()).toJSON() }
}

export const fetchUserMasterChefPendingReward = async (account) => {
  const pendingReward = await masterChefContract.pendingDexToken('0', account)
  return { '0': new BigNumber(pendingReward.toString()).toJSON() }
}

export const fetchPoolsAllowance = async (account) => {
  const calls = nonBnbPools.map((pool) => ({
    address: pool.stakingToken.address,
    name: 'allowance',
    params: [account, getAddress(pool.contractAddress)],
  }))

  const allowances = await multicall(erc20ABI, calls)
  return fromPairs(nonBnbPools.map((pool, index) => [pool.sousId, new BigNumber(allowances[index]).toJSON()]))
}

export const fetchUserBalances = async (account) => {
  // Non BNB pools
  const tokens = uniq(nonBnbPools.map((pool) => pool.stakingToken.address))

  const tokenBalanceCalls = tokens.map((token) => ({
    abi: erc20ABI,
    address: token,
    name: 'balanceOf',
    params: [account],
  }))
  const bnbBalanceCall = {
    abi: multiCallAbi,
    address: multicallAddress,
    name: 'getEthBalance',
    params: [account],
  }
  const tokenBnbBalancesRaw = await multicallv3({ calls: [...tokenBalanceCalls, bnbBalanceCall] })
  const bnbBalance = tokenBnbBalancesRaw.pop()
  const tokenBalances = fromPairs(tokens.map((token, index) => [token, tokenBnbBalancesRaw[index]]))

  const poolTokenBalances = fromPairs(
    nonBnbPools
      .map((pool) => {
        if (!tokenBalances[pool.stakingToken.address]) return null
        return [pool.sousId, new BigNumber(tokenBalances[pool.stakingToken.address]).toJSON()]
      })
      .filter(Boolean),
  )

  // BNB pools
  const bnbBalanceJson = new BigNumber(bnbBalance.toString()).toJSON()
  const bnbBalances = fromPairs(bnbPools.map((pool) => [pool.sousId, bnbBalanceJson]))
  if (bnbPools.length == 0) {
    return { ...poolTokenBalances }
  } else {
    return { ...poolTokenBalances, ...bnbBalances }
  }
}

export const fetchUserStakeBalances = async (account) => {
  const calls = nonMasterPools.map((p) => ({
    address: getAddress(p.contractAddress),
    name: 'userInfo',
    params: [account],
  }))
  const userInfo = await multicall(sousChefABI, calls)

  const masterChefStakeBalance = await fetchUserMasterChefStakeBalance(account)
  return {
    ...fromPairs(
      nonMasterPools.map((pool, index) => [pool.sousId, new BigNumber(userInfo[index].amount._hex).toJSON()]),
    ),
    ...masterChefStakeBalance,
  }
}

export const fetchUserPendingRewards = async (account) => {
  const calls = nonMasterPools.map((p) => ({
    address: getAddress(p.contractAddress),
    name: 'pendingReward',
    params: [account],
  }))
  const res = await multicall(sousChefABI, calls)
  const masterChefPendingReward = await fetchUserMasterChefPendingReward(account)
  return {
    ...fromPairs(nonMasterPools.map((pool, index) => [pool.sousId, new BigNumber(res[index]).toJSON()])),
    ...masterChefPendingReward,
  }
}
