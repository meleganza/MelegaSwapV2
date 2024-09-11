import { Percent } from '@pancakeswap/swap-sdk-core'
import { ERC20Token } from './entities/token'

export enum ChainId {
  ETHEREUM = 1,
  BSC = 56,
  BASE = 8453,
  POLYGON = 137,
  ARBITRUM = 42161,
  SHIMMER2 = 148,
  AVAX = 43114,
  FANTOM = 250,
  CRONOS = 25,
  PULSE = 369,
  OPTIMISM = 10,
  ZKSYNC = 324,
}

export const ZERO_PERCENT = new Percent('0')
export const ONE_HUNDRED_PERCENT = new Percent('1')

export const FACTORY_ADDRESS = '0xb7E5848e1d0CB457f2026670fCb9BbdB7e9E039C'

export const FACTORY_ADDRESS_MAP: Record<number, string> = {
  [ChainId.ETHEREUM]: "0x149EE9245E5eD52a89Ea777d19AD3A5D87873680",
  [ChainId.BSC]: FACTORY_ADDRESS,
  [ChainId.BASE]: "0x78fA7Fa39CF6544DD9768A75d8Ad8C45854aE530",
  [ChainId.POLYGON]: "0x2541DBEa199a22501D75EA141627776Bd4EefC80",
}
export const INIT_CODE_HASH = '0x5547397b1a1ae1e97b89728e7a77fdc2a6b167647566f81793b3b72fb8fde0f5'

export const INIT_CODE_HASH_MAP: Record<number, string> = {
  [ChainId.ETHEREUM]: "0x70bab120b879463f253c7412d8c12623f1aa971a04d97ba3ffd0e5f5c42e1405",
  [ChainId.BSC]: INIT_CODE_HASH,
  [ChainId.BASE]: "0x1e6e24914b2abfdd5ec33609095c9b570a9e1dc137992c0995bb45f57cf1932a",
  [ChainId.POLYGON]: "0x8c114e6d042bd14975f9a4dfbeb0c15c35a0b30acf8e0bd3432b551b131c46b1",
}

export const WETH9 = {
  [ChainId.ETHEREUM]: new ERC20Token(
    ChainId.ETHEREUM,
    '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    18,
    'WETH',
    'Wrapped Ether',
    'https://weth.io'
  ),
  [ChainId.BSC]: new ERC20Token(
    ChainId.BSC,
    '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
    18,
    'WBNB',
    'Wrapped BNB',
    'https://binance.com'
  ),
  [ChainId.BASE]: new ERC20Token(
    ChainId.BASE,
    '0x4200000000000000000000000000000000000006',
    18,
    'WETH',
    'Wrapped Ether',
    'https://weth.io'
  ),
  [ChainId.POLYGON]: new ERC20Token(
    ChainId.POLYGON,
    '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
    18,
    'WMATIC',
    'Wrapped Matic',
    'https://polygon.technology/'
  ),
  [ChainId.ARBITRUM]: new ERC20Token(
    ChainId.ARBITRUM,
    '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
    18,
    'WETH',
    'Wrapped Ether',
    'https://weth.io'
  ),
  [ChainId.ZKSYNC]: new ERC20Token(
    ChainId.ZKSYNC,
    '0x5AEa5775959fBC2557Cc8789bC1bf90A239D9a91',
    18,
    'WETH',
    'Wrapped Ether',
    'https://weth.io'
  ),
  [ChainId.OPTIMISM]: new ERC20Token(
    ChainId.OPTIMISM,
    '0x4200000000000000000000000000000000000006',
    18,
    'WETH',
    'Wrapped Ether',
    'https://weth.io'
  ),
  [ChainId.FANTOM]: new ERC20Token(
    ChainId.FANTOM,
    '0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83',
    18,
    'WFTM',
    'Wrapped Fantom',
    ''
  ),
  [ChainId.AVAX]: new ERC20Token(
    ChainId.AVAX,
    '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7',
    18,
    'WAVAX',
    'Wrapped AVAX',
    ''
  ),
  [ChainId.CRONOS]: new ERC20Token(
    ChainId.CRONOS,
    '0x5C7F8A570d578ED84E63fdFA7b1eE72dEae1AE23',
    18,
    'WCRO',
    'Wrapped CRO',
    ''
  ),
  [ChainId.PULSE]: new ERC20Token(
    ChainId.PULSE,
    '0xA1077a294dDE1B09bB078844df40758a5D0f9a27',
    18,
    'WPLS',
    'Wrapped Pulse',
    ''
  ),
  [ChainId.SHIMMER2]: new ERC20Token(
    ChainId.SHIMMER2,
    '0x16bb40487386d83E042968FDDF2e72475eddF837',
    18,
    'WSMR',
    'Wrapped Shimmer',
    ''
  ),
}

export const WBNB = {
  [ChainId.ETHEREUM]: new ERC20Token(
    ChainId.ETHEREUM,
    '0x418D75f65a02b3D53B2418FB8E1fe493759c7605',
    18,
    'WBNB',
    'Wrapped BNB',
    'https://www.binance.org'
  ),
  [ChainId.BSC]: new ERC20Token(
    ChainId.BSC,
    '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
    18,
    'WBNB',
    'Wrapped BNB',
    'https://www.binance.org'
  ),
  [ChainId.BASE]: new ERC20Token(
    ChainId.BASE,
    '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
    18,
    'WBNB',
    'Wrapped BNB',
    'https://www.binance.org'
  ),
  [ChainId.POLYGON]: new ERC20Token(
    ChainId.POLYGON,
    '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
    18,
    'WBNB',
    'Wrapped BNB',
    'https://www.binance.org'
  ),
}

export const WNATIVE: Record<number, ERC20Token> = {
  [ChainId.ETHEREUM]: WETH9[ChainId.ETHEREUM],
  [ChainId.BSC]: WBNB[ChainId.BSC],
  [ChainId.BASE]: WETH9[ChainId.BASE],
  [ChainId.POLYGON]: WETH9[ChainId.POLYGON],
  [ChainId.ARBITRUM]: WETH9[ChainId.ARBITRUM],
  [ChainId.SHIMMER2]: WETH9[ChainId.SHIMMER2],
  [ChainId.AVAX]: WETH9[ChainId.AVAX],
  [ChainId.FANTOM]: WETH9[ChainId.FANTOM],
  [ChainId.CRONOS]: WETH9[ChainId.CRONOS],
  [ChainId.ZKSYNC]: WETH9[ChainId.ZKSYNC],
  [ChainId.OPTIMISM]: WETH9[ChainId.OPTIMISM],
  [ChainId.PULSE]: WETH9[ChainId.PULSE],
}

export const NATIVE: Record<
  number,
  {
    name: string
    symbol: string
    decimals: number
  }
> = {
  [ChainId.ETHEREUM]: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  [ChainId.BSC]: { name: 'Binance Chain Native Token', symbol: 'BNB', decimals: 18 },
  [ChainId.BASE]: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  [ChainId.POLYGON]: { name: 'Matic', symbol: 'MATIC', decimals: 18 },
  [ChainId.ARBITRUM]: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  [ChainId.OPTIMISM]: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  [ChainId.ZKSYNC]: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  [ChainId.CRONOS]: { name: 'Cronos', symbol: 'CRO', decimals: 18 },
  [ChainId.FANTOM]: { name: 'Fantom', symbol: 'FTM', decimals: 18 },
  [ChainId.AVAX]: { name: 'Avax', symbol: 'AVAX', decimals: 18 },
  [ChainId.PULSE]: { name: 'Pulse', symbol: 'PLS', decimals: 18 },
  [ChainId.SHIMMER2]: { name: 'Shimmer', symbol: 'SMR', decimals: 18 },
}
