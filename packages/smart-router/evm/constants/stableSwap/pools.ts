import { ChainId } from '@pancakeswap/sdk'

import { StableSwapPool } from '../../types/pool'
import { pools as ethereumPools } from './1'
import { pools as bscPools } from './56'
import { pools as bscTestnetPools } from './97'

export type StableSwapPoolMap<TChainId extends number> = {
  [chainId in TChainId]: StableSwapPool[]
}

export const poolMap: StableSwapPoolMap<ChainId> = {
  [ChainId.ETHEREUM]: ethereumPools,
  [ChainId.ARBITRUM]: [],
  [ChainId.POLYGON]: [],
  [ChainId.BSC]: bscPools,
  [ChainId.SHIMMER2]: [],
  [ChainId.AVAX]: [],
  [ChainId.FANTOM]: [],
  [ChainId.CRONOS]: [],
  [ChainId.PULSE]: [],
  [ChainId.OPTIMISM]: [],
  [ChainId.BASE]: [],
  [ChainId.ZKSYNC]: []
}
