import { ChainId, WETH9, ERC20Token } from '@pancakeswap/sdk'
import { DAI_POLYGON, CAKE, USDC, USDT, WBTC_POLYGON } from '@pancakeswap/tokens'

export const polygonTokens = {
  wmatic: WETH9[ChainId.POLYGON],
  usdt: USDT[ChainId.POLYGON],
  usdc: USDC[ChainId.POLYGON],
  wbtc: WBTC_POLYGON,
  dai: DAI_POLYGON,
  syrup: new ERC20Token(
    ChainId.BASE,
    '0x83A2af056bd05758d5BC704a6Cc7166769E9c939',
    18,
    'MRT',
    'MARCO Reward Token',
    'https://melega.finance/',
  ),
  weth: new ERC20Token(
    ChainId.POLYGON,
    '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
    18,
    'WETH',
    'Wrapped Ether',
  ),
  cake: CAKE[ChainId.POLYGON],
}
