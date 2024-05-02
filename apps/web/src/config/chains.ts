import { ChainId } from '@pancakeswap/sdk'
import memoize from 'lodash/memoize'
import invert from 'lodash/invert'

export const CHAIN_QUERY_NAME = {
  [ChainId.ETHEREUM]: 'ethereum',
  [ChainId.ARBITRUM]: 'arbitrum',
  [ChainId.BSC]: 'bsc',
  [ChainId.POLYGON]: 'polygon',
  [ChainId.SHIMMER2]: 'shimmerevm',
  [ChainId.BASE]: 'base',
  [ChainId.OPTIMISM]: 'optimism',
  [ChainId.ZKSYNC]: 'zksync',
  [ChainId.FANTOM]: 'fantom',
  [ChainId.AVAX]: 'avalanche',
  [ChainId.CRONOS]: 'cronos',
  [ChainId.PULSE]: 'pulse',
} satisfies Record<ChainId, string>

export const SUPPORTED_CHAINS = [ChainId.BSC, ChainId.ARBITRUM, ChainId.POLYGON, ChainId.OPTIMISM, ChainId.AVAX, ChainId.FANTOM, ChainId.BASE, ChainId.CRONOS, ChainId.ZKSYNC, ChainId.PULSE]

const CHAIN_QUERY_NAME_TO_ID = invert(CHAIN_QUERY_NAME)

export const getChainId = memoize((chainName: string) => {
  if (!chainName) return undefined
  return CHAIN_QUERY_NAME_TO_ID[chainName] ? +CHAIN_QUERY_NAME_TO_ID[chainName] : undefined
})
