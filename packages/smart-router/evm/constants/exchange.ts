import { ChainId, Token, WBNB, WNATIVE } from '@pancakeswap/sdk'
import { bscTokens, BUSD, USDC, USDT } from '@pancakeswap/tokens'

import { ChainMap, ChainTokenList } from '../types'

export const ROUTER_ADDRESS: ChainMap<string> = {
  [ChainId.ETHEREUM]: '0x3BC722f252C7bAE2f55647e49aDcB9d33Ff6eBcC',
  [ChainId.ARBITRUM]: '0x3BC722f252C7bAE2f55647e49aDcB9d33Ff6eBcC',
  [ChainId.POLYGON]: '0x3BC722f252C7bAE2f55647e49aDcB9d33Ff6eBcC',
  [ChainId.BSC]: '0x10ED43C718714eb63d5aA57B78B54704E256024E',
  [ChainId.SHIMMER2]: '',
  [ChainId.AVAX]: '',
  [ChainId.FANTOM]: '',
  [ChainId.CRONOS]: '',
  [ChainId.PULSE]: '',
  [ChainId.OPTIMISM]: '',
  [ChainId.BASE]: '',
  [ChainId.ZKSYNC]: ''
}

export const STABLE_SWAP_INFO_ADDRESS: ChainMap<string> = {
  [ChainId.ETHEREUM]: '',
  [ChainId.ARBITRUM]: '',
  [ChainId.POLYGON]: '',
  [ChainId.BSC]: '0xa680d27f63Fa5E213C502d1B3Ca1EB6a3C1b31D6',
  [ChainId.SHIMMER2]: '',
  [ChainId.AVAX]: '',
  [ChainId.FANTOM]: '',
  [ChainId.CRONOS]: '',
  [ChainId.PULSE]: '',
  [ChainId.OPTIMISM]: '',
  [ChainId.BASE]: '',
  [ChainId.ZKSYNC]: ''
}

// used to construct intermediary pairs for trading
export const BASES_TO_CHECK_TRADES_AGAINST: ChainTokenList = {
  [ChainId.ETHEREUM]: [
    WNATIVE[ChainId.ETHEREUM],
    USDC[ChainId.ETHEREUM],
    USDT[ChainId.ETHEREUM],
    BUSD[ChainId.ETHEREUM],
    WBNB[ChainId.ETHEREUM],
  ],
  [ChainId.POLYGON]: [
    WNATIVE[ChainId.POLYGON],
    USDC[ChainId.POLYGON],
    USDT[ChainId.POLYGON],
  ],
  [ChainId.ARBITRUM]: [
    WNATIVE[ChainId.ARBITRUM],
    USDC[ChainId.ARBITRUM],
    USDT[ChainId.ARBITRUM],
  ],
  [ChainId.BSC]: [
    bscTokens.wbnb,
    bscTokens.cake,
    bscTokens.busd,
    bscTokens.usdt,
    bscTokens.btcb,
    bscTokens.eth,
    bscTokens.usdc,
  ],
  [ChainId.SHIMMER2]: [],
  [ChainId.AVAX]: [],
  [ChainId.FANTOM]: [],
  [ChainId.CRONOS]: [],
  [ChainId.PULSE]: [],
  [ChainId.OPTIMISM]: [],
  [ChainId.BASE]: [],
  [ChainId.ZKSYNC]: []
}

/**
 * Additional bases for specific tokens
 * @example { [WBTC.address]: [renBTC], [renBTC.address]: [WBTC] }
 */
export const ADDITIONAL_BASES: {
  [chainId in ChainId]?: { [tokenAddress: string]: Token[] }
} = {
  [ChainId.BSC]: {
    // SNFTS-SFUND
    [bscTokens.snfts.address]: [bscTokens.sfund],
  },
}

/**
 * Some tokens can only be swapped via certain pairs, so we override the list of bases that are considered for these
 * tokens.
 * @example [AMPL.address]: [DAI, WNATIVE[ChainId.BSC]]
 */
export const CUSTOM_BASES: {
  [chainId in ChainId]?: { [tokenAddress: string]: Token[] }
} = {
  [ChainId.BSC]: {},
}

// used for display in the default list when adding liquidity
export const SUGGESTED_BASES: ChainTokenList = {
  [ChainId.ETHEREUM]: [USDC[ChainId.ETHEREUM], WBNB[ChainId.ETHEREUM], BUSD[ChainId.ETHEREUM], USDT[ChainId.ETHEREUM]],
  [ChainId.ARBITRUM]: [USDC[ChainId.ARBITRUM], USDT[ChainId.ARBITRUM]],
  [ChainId.POLYGON]: [USDC[ChainId.POLYGON], USDT[ChainId.POLYGON]],
  [ChainId.BSC]: [bscTokens.busd, bscTokens.cake, bscTokens.btcb],
  [ChainId.SHIMMER2]: [],
  [ChainId.AVAX]: [],
  [ChainId.FANTOM]: [],
  [ChainId.CRONOS]: [],
  [ChainId.PULSE]: [],
  [ChainId.OPTIMISM]: [],
  [ChainId.BASE]: [],
  [ChainId.ZKSYNC]: []
}

// used to construct the list of all pairs we consider by default in the frontend
export const BASES_TO_TRACK_LIQUIDITY_FOR: ChainTokenList = {
  [ChainId.ETHEREUM]: [
    USDC[ChainId.ETHEREUM],
    WNATIVE[ChainId.ETHEREUM],
    BUSD[ChainId.ETHEREUM],
    USDT[ChainId.ETHEREUM],
    WBNB[ChainId.ETHEREUM],
  ],
  [ChainId.ARBITRUM]: [
    USDC[ChainId.ARBITRUM],
    WNATIVE[ChainId.ARBITRUM],
    USDT[ChainId.ARBITRUM],
  ],
  [ChainId.POLYGON]: [
    USDC[ChainId.POLYGON],
    WNATIVE[ChainId.POLYGON],
    USDT[ChainId.POLYGON],
  ],
  [ChainId.BSC]: [bscTokens.wbnb, bscTokens.dai, bscTokens.busd, bscTokens.usdt, bscTokens.cake],
  [ChainId.SHIMMER2]: [],
  [ChainId.AVAX]: [],
  [ChainId.FANTOM]: [],
  [ChainId.CRONOS]: [],
  [ChainId.PULSE]: [],
  [ChainId.OPTIMISM]: [],
  [ChainId.BASE]: [],
  [ChainId.ZKSYNC]: []
}

export const PINNED_PAIRS: {
  readonly [chainId in ChainId]?: [Token, Token][]
} = {
  [ChainId.ETHEREUM]: [
    [WNATIVE[ChainId.ETHEREUM], USDC[ChainId.ETHEREUM]],
    [WBNB[ChainId.ETHEREUM], USDC[ChainId.ETHEREUM]],
    [WBNB[ChainId.ETHEREUM], BUSD[ChainId.ETHEREUM]],
    [WBNB[ChainId.ETHEREUM], USDT[ChainId.ETHEREUM]],
    [WBNB[ChainId.ETHEREUM], WNATIVE[ChainId.ETHEREUM]],
  ],
  [ChainId.BSC]: [
    [bscTokens.cake, bscTokens.wbnb],
    [bscTokens.busd, bscTokens.usdt],
    [bscTokens.dai, bscTokens.usdt],
  ],
}
