import { ChainId, JSBI, Percent, Token, WNATIVE } from '@pancakeswap/sdk'
import { BigNumber } from '@ethersproject/bignumber'
import { bscTokens, USDC, USDT, WBTC_ETH, DAI_ETH, WBTC_ARB, DAI_BASE, DAI_ARB, CAKE, arbitrumTokens, shimmer2Tokens, WBTC_POLYGON, DAI_POLYGON, optimismTokens, baseTokens, zksyncTokens, avaxTokens, fantomTokens, cronosTokens, pulseTokens} from '@pancakeswap/tokens'
import { ChainMap, ChainTokenList } from './types'

export const ROUTER_ADDRESS: ChainMap<string> = {
  [ChainId.ETHEREUM]: '0xac6495Faa2f209B7d07A4e5E0595df8221626DFA',
  [ChainId.BSC]: '0xc25033218D181b27D4a2944Fbb04FC055da4EAB3',
  [ChainId.BASE]: '0x1B30D21354a082EeBC66c4C5E56320759f7994e5',
  [ChainId.POLYGON]: '0xac6495Faa2f209B7d07A4e5E0595df8221626DFA',
}

// used to construct intermediary pairs for trading
export const BASES_TO_CHECK_TRADES_AGAINST: ChainTokenList = {
  [ChainId.ETHEREUM]: [WNATIVE[ChainId.ETHEREUM], USDC[ChainId.ETHEREUM], USDT[ChainId.ETHEREUM], WBTC_ETH],
  [ChainId.BSC]: [
    bscTokens.wbnb,
    bscTokens.cake,
    bscTokens.busd,
    bscTokens.usdt,
    bscTokens.btcb,
    bscTokens.eth,
    bscTokens.usdc,
  ],
  [ChainId.BASE]: [WNATIVE[ChainId.BASE], USDC[ChainId.BASE], DAI_BASE],
  [ChainId.ARBITRUM]: [WNATIVE[ChainId.ARBITRUM], USDC[ChainId.ARBITRUM], USDT[ChainId.ARBITRUM], WBTC_ARB],
  [ChainId.POLYGON]: [WNATIVE[ChainId.POLYGON], USDC[ChainId.POLYGON], USDT[ChainId.POLYGON], WBTC_POLYGON],
}

/**
 * Additional bases for specific tokens
 * @example { [WBTC.address]: [renBTC], [renBTC.address]: [WBTC] }
 */
export const ADDITIONAL_BASES: { [chainId in ChainId]?: { [tokenAddress: string]: Token[] } } = {
  [ChainId.ETHEREUM]: {
    // SNFTS-SFUND
    [bscTokens.snfts.address]: [bscTokens.sfund],
  },
  [ChainId.BSC]: {
    // SNFTS-SFUND
    [bscTokens.snfts.address]: [bscTokens.sfund],
  },
  [ChainId.BASE]: {
    // SNFTS-SFUND
    [baseTokens.cake.address]: [baseTokens.weth],
  },
  [ChainId.POLYGON]: {
    // SNFTS-SFUND
    [bscTokens.snfts.address]: [bscTokens.sfund],
  },
}

/**
 * Some tokens can only be swapped via certain pairs, so we override the list of bases that are considered for these
 * tokens.
 * @example [AMPL.address]: [DAI, WNATIVE[ChainId.BSC]]
 */
export const CUSTOM_BASES: { [chainId in ChainId]?: { [tokenAddress: string]: Token[] } } = {
  [ChainId.BSC]: {},
  [ChainId.BASE]: {},
}

// used for display in the default list when adding liquidity
export const SUGGESTED_BASES: ChainTokenList = {
  [ChainId.ETHEREUM]: [WNATIVE[ChainId.ETHEREUM], USDC[ChainId.ETHEREUM], USDT[ChainId.ETHEREUM], WBTC_ETH, DAI_ETH],
  [ChainId.BSC]: [WNATIVE[ChainId.BSC], bscTokens.usdt, bscTokens.usdc, bscTokens.dai, bscTokens.eth, bscTokens.btcb, bscTokens.cake],
  [ChainId.BASE]: [WNATIVE[ChainId.BASE], baseTokens.usdc, baseTokens.dai],
  [ChainId.OPTIMISM]: [WNATIVE[ChainId.OPTIMISM], optimismTokens.usdc, optimismTokens.usdt, optimismTokens.wbtc, optimismTokens.dai],
  [ChainId.ZKSYNC]: [zksyncTokens.usdc, zksyncTokens.usdt],
  [ChainId.FANTOM]: [fantomTokens.usdc, fantomTokens.wbtc],
  [ChainId.CRONOS]: [cronosTokens.usdc, cronosTokens.usdt],
  [ChainId.PULSE]: [pulseTokens.usdc, pulseTokens.usdt],
  [ChainId.AVAX]: [avaxTokens.usdc, avaxTokens.usdt],
  [ChainId.POLYGON]: [WNATIVE[ChainId.POLYGON], USDC[ChainId.POLYGON], USDT[ChainId.POLYGON], WBTC_POLYGON, DAI_POLYGON],
  [ChainId.ARBITRUM]: [WNATIVE[ChainId.ARBITRUM], USDC[ChainId.ARBITRUM], USDT[ChainId.ARBITRUM], arbitrumTokens.arb, DAI_ARB, WBTC_ARB],
  [ChainId.SHIMMER2]: [shimmer2Tokens.smr, shimmer2Tokens.gtoken, shimmer2Tokens.usdc, shimmer2Tokens.usdt, shimmer2Tokens.wbtc, shimmer2Tokens.eth],
}

// used to construct the list of all pairs we consider by default in the frontend
export const BASES_TO_TRACK_LIQUIDITY_FOR: ChainTokenList = {
  [ChainId.ETHEREUM]: [USDC[ChainId.ETHEREUM], WNATIVE[ChainId.ETHEREUM], USDT[ChainId.ETHEREUM], WBTC_ETH],
  [ChainId.POLYGON]: [USDC[ChainId.POLYGON], WNATIVE[ChainId.POLYGON], USDT[ChainId.POLYGON], WBTC_POLYGON],
  [ChainId.ARBITRUM]: [USDC[ChainId.ARBITRUM], WNATIVE[ChainId.ARBITRUM], USDT[ChainId.ARBITRUM], WBTC_ARB],
  [ChainId.BSC]: [bscTokens.wbnb, bscTokens.dai, bscTokens.busd, bscTokens.usdt, bscTokens.cake],
  [ChainId.BASE]: [baseTokens.weth, baseTokens.dai, baseTokens.usdc, baseTokens.cake],
  [ChainId.SHIMMER2]: [shimmer2Tokens.smr, shimmer2Tokens.gtoken, shimmer2Tokens.usdc, shimmer2Tokens.usdt, shimmer2Tokens.wbtc, shimmer2Tokens.eth],
}

export const PINNED_PAIRS: { readonly [chainId in ChainId]?: [Token, Token][] } = {
  [ChainId.ETHEREUM]: [
    [WNATIVE[ChainId.ETHEREUM], USDC[ChainId.ETHEREUM]],
    [WBTC_ETH, WNATIVE[ChainId.ETHEREUM]],
    [WNATIVE[ChainId.ETHEREUM], USDT[ChainId.ETHEREUM]],
  ],
  [ChainId.BSC]: [
    [bscTokens.cake, bscTokens.wbnb],
    [bscTokens.busd, bscTokens.usdt],
    [bscTokens.dai, bscTokens.usdt],
  ],
  [ChainId.BASE]: [
    [baseTokens.weth, baseTokens.cake],
    [baseTokens.usdc, baseTokens.cake],
    [baseTokens.dai, baseTokens.usdc],
  ],
  [ChainId.POLYGON]: [
    [WNATIVE[ChainId.POLYGON], USDC[ChainId.POLYGON]],
    [WBTC_POLYGON, WNATIVE[ChainId.POLYGON]],
    [WNATIVE[ChainId.POLYGON], USDT[ChainId.POLYGON]],
  ],
  [ChainId.ARBITRUM]: [
    [WNATIVE[ChainId.ARBITRUM], USDC[ChainId.ARBITRUM]],
    [WBTC_ARB, WNATIVE[ChainId.ARBITRUM]],
    [WNATIVE[ChainId.ARBITRUM], USDT[ChainId.ARBITRUM]],
  ],
  [ChainId.SHIMMER2]: [
    [shimmer2Tokens.gtoken, shimmer2Tokens.smr],
    [shimmer2Tokens.smr, shimmer2Tokens.usdt],
    [shimmer2Tokens.smr, shimmer2Tokens.usdt],
  ],
}

export const BIG_INT_ZERO = JSBI.BigInt(0)
export const BIG_INT_TEN = JSBI.BigInt(10)

// one basis point
export const BIPS_BASE = JSBI.BigInt(10000)
export const ONE_BIPS = new Percent(JSBI.BigInt(1), BIPS_BASE)
// used for warning states
export const ALLOWED_PRICE_IMPACT_LOW: Percent = new Percent(JSBI.BigInt(100), BIPS_BASE) // 1%
export const ALLOWED_PRICE_IMPACT_MEDIUM: Percent = new Percent(JSBI.BigInt(300), BIPS_BASE) // 3%
export const ALLOWED_PRICE_IMPACT_HIGH: Percent = new Percent(JSBI.BigInt(500), BIPS_BASE) // 5%
// if the price slippage exceeds this number, force the user to type 'confirm' to execute
export const PRICE_IMPACT_WITHOUT_FEE_CONFIRM_MIN: Percent = new Percent(JSBI.BigInt(1000), BIPS_BASE) // 10%
// for non expert mode disable swaps above this
export const BLOCKED_PRICE_IMPACT_NON_EXPERT: Percent = new Percent(JSBI.BigInt(1500), BIPS_BASE) // 15%

// used to ensure the user doesn't send so much BNB so they end up with <.01
export const MIN_BNB: JSBI = JSBI.exponentiate(BIG_INT_TEN, JSBI.BigInt(16)) // .01 BNB
export const BETTER_TRADE_LESS_HOPS_THRESHOLD = new Percent(JSBI.BigInt(50), BIPS_BASE)

export const ZERO_PERCENT = new Percent('0')
export const ONE_HUNDRED_PERCENT = new Percent('1')

export const BASE_FEE = new Percent(JSBI.BigInt(25), BIPS_BASE)
export const INPUT_FRACTION_AFTER_FEE = ONE_HUNDRED_PERCENT.subtract(BASE_FEE)

// BNB
export const DEFAULT_INPUT_CURRENCY = 'BNB'
// CAKE
export const DEFAULT_OUTPUT_CURRENCY = '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82'

export const EXCHANGE_PAGE_PATHS = ['/swap', 'liquidity', '/add', '/find', '/remove']