import { ChainId } from '@pancakeswap/sdk'

/** @deprecated Dead Pancake proxy — do not use. Kept for audit references only. */
export const LEGACY_INFO_CLIENT = 'https://proxy-worker.pancake-swap.workers.dev/bsc-exchange'

/** Melega BSC subgraph — unset until NEXT_PUBLIC_MELEGA_SUBGRAPH_URL is deployed. */
export const MELEGA_SUBGRAPH_URL = process.env.NEXT_PUBLIC_MELEGA_SUBGRAPH_URL?.trim() || ''

export const INFO_CLIENT = MELEGA_SUBGRAPH_URL

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
