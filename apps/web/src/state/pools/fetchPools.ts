import BigNumber from 'bignumber.js'
import fromPairs from 'lodash/fromPairs'
// import { BigNumber as EthersBigNumber } from '@ethersproject/bignumber'
import poolsConfig, { livePools1, livePools8453, livePools137 } from 'config/constants/pools'
import sousChefABI from 'config/abi/sousChef.json'
import erc20ABI from 'config/abi/erc20.json'
import multicall, { multicallv2 } from 'utils/multicall'
import { getAddress } from 'utils/addressHelpers'
// import { BIG_ZERO } from '@pancakeswap/utils/bigNumber'
// import chunk from 'lodash/chunk'
// import sousChef from '../../config/abi/sousChef.json'
// import sousChefV3 from '../../config/abi/sousChefV3.json'

const livePoolsWithEndBsc = poolsConfig.filter((p) => p?.sousId !== 0 && !p?.isFinished)
const livePoolsWithEndEth = livePools1.filter((p) => p?.sousId !== 0 && !p?.isFinished)
const livePoolsWithEndBase = livePools8453.filter((p) => p?.sousId !== 0 && !p?.isFinished)
const livePoolsWithEndPolygon = livePools137.filter((p) => p?.sousId !== 0 && !p?.isFinished)

const startEndBlockCallsOnEth = livePoolsWithEndEth.flatMap((poolConfig) => {
  return [
    {
      address: getAddress(poolConfig?.contractAddress, 1),
      name: 'startBlock',
    },
    {
      address: getAddress(poolConfig.contractAddress, 1),
      name: 'bonusEndBlock',
    },
  ]
})

const startEndBlockCallsOnBsc = livePoolsWithEndBsc.flatMap((poolConfig) => {
  return [
    {
      address: getAddress(poolConfig?.contractAddress, 56),
      name: 'startBlock',
    },
    {
      address: getAddress(poolConfig.contractAddress, 56),
      name: 'bonusEndBlock',
    },
  ]
})

const startEndBlockCallsOnPolygon = livePoolsWithEndPolygon.flatMap((poolConfig) => {
  return [
    {
      address: getAddress(poolConfig?.contractAddress, 137),
      name: 'startBlock',
    },
    {
      address: getAddress(poolConfig.contractAddress, 137),
      name: 'bonusEndBlock',
    },
  ]
})

const startEndBlockCallsOnBase = livePoolsWithEndBase.flatMap((poolConfig) => {
  return [
    {
      address: getAddress(poolConfig?.contractAddress, 8453),
      name: 'startBlock',
    },
    {
      address: getAddress(poolConfig.contractAddress, 8453),
      name: 'bonusEndBlock',
    },
  ]
})

export const fetchPoolsBlockLimits = async (chainId) => {
  const startEndBlockRaw = await multicall(
    sousChefABI,
    chainId === 1 ? startEndBlockCallsOnEth
      : chainId === 137 ? startEndBlockCallsOnPolygon
        : chainId === 8453 ? startEndBlockCallsOnBase
          : startEndBlockCallsOnBsc,
    chainId,
  )
  const startEndBlockResult = startEndBlockRaw.reduce((resultArray, item, index) => {
    const chunkIndex = Math.floor(index / 2)

    if (!resultArray[chunkIndex]) {
      // eslint-disable-next-line no-param-reassign
      resultArray[chunkIndex] = [] // start a new chunk
    }

    resultArray[chunkIndex].push(item)

    return resultArray
  }, [])
  const livePools =
    chainId === 1 ? livePoolsWithEndEth
      : chainId === 137 ? livePoolsWithEndPolygon
        : chainId === 8453 ? livePoolsWithEndBase
          : livePoolsWithEndBsc

  return livePools.map((cakePoolConfig, index) => {
    const [[startBlock], [endBlock]] = startEndBlockResult[index]
    return {
      sousId: cakePoolConfig.sousId,
      startBlock: startBlock.toNumber(),
      endBlock: endBlock.toNumber(),
    }
  })
}

const poolsBalanceOf = poolsConfig.map((poolConfig) => {
  return {
    address: poolConfig.stakingToken.address,
    name: 'balanceOf',
    params: [getAddress(poolConfig.contractAddress)],
  }
})

const poolsBalanceOfOnEth = livePools1.map((poolConfig) => {
  return {
    address: poolConfig.stakingToken.address,
    name: 'balanceOf',
    params: [getAddress(poolConfig.contractAddress, 1)],
  }
})

const poolsBalanceOfOnPolygon = livePools137.map((poolConfig) => {
  return {
    address: poolConfig.stakingToken.address,
    name: 'balanceOf',
    params: [getAddress(poolConfig.contractAddress, 137)],
  }
})

const poolsBalanceOfOnBase = livePools8453.map((poolConfig) => {
  return {
    address: poolConfig.stakingToken.address,
    name: 'balanceOf',
    params: [getAddress(poolConfig.contractAddress, 8453)],
  }
})

export const fetchPoolsTotalStaking = async (chainId: number) => {
  const poolsTotalStaked = await multicall(
    erc20ABI,
    chainId === 1 ? poolsBalanceOfOnEth
      : chainId === 137 ? poolsBalanceOfOnPolygon
        : chainId === 8453 ? poolsBalanceOfOnBase
          : poolsBalanceOf,
    chainId,
  )

  const pools =
    chainId === 1 ? livePools1
      : chainId === 137 ? livePools137
        : chainId === 8453 ? livePools8453
          : poolsConfig

  return pools.map((p, index) => ({
    sousId: p.sousId,
    totalStaked: new BigNumber(poolsTotalStaked[index]).toJSON(),
  }))
}