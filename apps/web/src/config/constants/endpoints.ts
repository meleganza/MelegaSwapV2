import { ChainId } from '@pancakeswap/sdk'

export const INFO_CLIENT = 'https://proxy-worker.pancake-swap.workers.dev/bsc-exchange'

export const INFO_CLIENT_ETH = 'https://api.thegraph.com/subgraphs/name/pancakeswap/exhange-eth'
export const BLOCKS_CLIENT = 'https://api.thegraph.com/subgraphs/name/pancakeswap/blocks'
export const BLOCKS_CLIENT_ETH = 'https://api.thegraph.com/subgraphs/name/blocklytics/ethereum-blocks'
export const STABLESWAP_SUBGRAPH_CLIENT = 'https://api.thegraph.com/subgraphs/name/pancakeswap/exchange-stableswap'
export const GRAPH_HEALTH = 'https://api.thegraph.com/index-node/graphql'

export const BIT_QUERY = 'https://graphql.bitquery.io'

export const ACCESS_RISK_API = '/api/risk'

export const CELER_API = 'https://api.celerscan.com/scan'

export const INFO_CLIENT_WITH_CHAIN = {
  [ChainId.ETHEREUM]: INFO_CLIENT_ETH,
}

export const BLOCKS_CLIENT_WITH_CHAIN = {
  [ChainId.ETHEREUM]: BLOCKS_CLIENT_ETH,
}

export const ASSET_CDN = 'https://assets.pancakeswap.finance'
