import BigNumber from 'bignumber.js'
import poolsConfig, {
  livePools1,
  livePools8453,
  livePools137,
  livePools42161,
  livePools43114,
} from 'config/constants/pools'
import sousChefABI from 'config/abi/sousChef.json'
import erc20ABI from 'config/abi/erc20.json'
import multicall from 'utils/multicall'
import { getAddress } from 'utils/addressHelpers'

type PoolConfig = (typeof poolsConfig)[number]

function stakingTokenAddress(pool: PoolConfig, chainId: number): string {
  const raw = pool.stakingToken?.address as unknown
  if (typeof raw === 'string') return raw
  if (raw && typeof raw === 'object') return getAddress(raw as PoolConfig['contractAddress'], chainId)
  return ''
}

/** Pools with a resolvable SmartChef + stake token on the active chain only. */
function poolsForChain(chainId: number): PoolConfig[] {
  const list: PoolConfig[] =
    chainId === 1
      ? livePools1
      : chainId === 137
        ? livePools137
        : chainId === 8453
          ? livePools8453
          : chainId === 42161
            ? livePools42161
            : chainId === 43114
              ? livePools43114
              : poolsConfig

  return list.filter((pool) => {
    if (!pool || pool.sousId === 0) return false
    const chef = getAddress(pool.contractAddress, chainId)
    const stake = stakingTokenAddress(pool, chainId)
    return Boolean(chef && chef.length >= 42 && stake && stake.length >= 42)
  })
}

function livePoolsWithEnd(chainId: number): PoolConfig[] {
  return poolsForChain(chainId).filter((p) => !p?.isFinished)
}

function startEndBlockCalls(chainId: number) {
  return livePoolsWithEnd(chainId).flatMap((poolConfig) => {
    const address = getAddress(poolConfig.contractAddress, chainId)
    return [
      { address, name: 'startBlock' },
      { address, name: 'bonusEndBlock' },
    ]
  })
}

function balanceOfCalls(chainId: number) {
  return poolsForChain(chainId).map((poolConfig) => ({
    address: stakingTokenAddress(poolConfig, chainId),
    name: 'balanceOf',
    params: [getAddress(poolConfig.contractAddress, chainId)],
  }))
}

function rewardPerBlockCalls(chainId: number) {
  return livePoolsWithEnd(chainId).map((poolConfig) => ({
    address: getAddress(poolConfig.contractAddress, chainId),
    name: 'rewardPerBlock',
  }))
}

export const fetchPoolsBlockLimits = async (chainId: number) => {
  const livePools = livePoolsWithEnd(chainId)
  const calls = startEndBlockCalls(chainId)
  if (!calls.length) return []

  const startEndBlockRaw = await multicall(sousChefABI, calls, chainId)

  const startEndBlockResult = startEndBlockRaw.reduce((resultArray, item, index) => {
    const chunkIndex = Math.floor(index / 2)
    if (!resultArray[chunkIndex]) {
      // eslint-disable-next-line no-param-reassign
      resultArray[chunkIndex] = []
    }
    resultArray[chunkIndex].push(item)
    return resultArray
  }, [] as unknown[][])

  return livePools.map((cakePoolConfig, index) => {
    const chunk = startEndBlockResult[index]
    const startBlock = chunk?.[0]?.[0]
    const endBlock = chunk?.[1]?.[0]
    return {
      sousId: cakePoolConfig.sousId,
      startBlock: startBlock?.toNumber?.() ?? 0,
      endBlock: endBlock?.toNumber?.() ?? 0,
    }
  })
}

export const fetchPoolsTotalStaking = async (chainId: number) => {
  const pools = poolsForChain(chainId)
  const calls = balanceOfCalls(chainId)
  if (!calls.length) return []

  const poolsTotalStaked = await multicall(erc20ABI, calls, chainId)

  return pools.map((p, index) => ({
    sousId: p.sousId,
    totalStaked: new BigNumber(poolsTotalStaked[index]).toJSON(),
  }))
}

export const fetchPoolsRewardPerBlock = async (chainId: number) => {
  const livePools = livePoolsWithEnd(chainId)
  const calls = rewardPerBlockCalls(chainId)
  if (!calls.length) return []
  const raw = await multicall(sousChefABI, calls, chainId)
  return livePools.map((p, index) => ({
    sousId: p.sousId,
    rewardPerBlock: new BigNumber(raw[index]).toJSON(),
  }))
}
