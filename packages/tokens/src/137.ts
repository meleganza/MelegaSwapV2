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
  xoxo: new ERC20Token(
    ChainId.POLYGON,
    '0x0d15DCEe3923AaaB74aAF7E1f70Fd964FC2a0deB',
    18,
    'XOXO',
    'XOXO'
  ),
  cake: CAKE[ChainId.POLYGON],
  dc4: new ERC20Token(
    ChainId.POLYGON,
    '0x07287971C67c5FD87B9421D17e12162f2b952Cc5',
    18,
    '4DC',
    '4DC'
  ),
  cake: CAKE[ChainId.POLYGON],
  teddy: new ERC20Token(
    ChainId.POLYGON,
    '0x9f673304965ce717a068f2361bDBf0e81443038d',
    18,
    'BEAR',
    'TEDDY'
  )
}
