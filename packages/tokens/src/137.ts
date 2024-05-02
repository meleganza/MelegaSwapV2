import { ChainId, WETH9, ERC20Token } from '@pancakeswap/sdk'
import { DAI_POLYGON, CAKE, USDC, USDT, WBTC_POLYGON } from '@pancakeswap/tokens'

export const polygonTokens = {
  wmatic: WETH9[ChainId.POLYGON],
  usdt: USDT[ChainId.POLYGON],
  usdc: USDC[ChainId.POLYGON],
  wbtc: WBTC_POLYGON,
  dai: DAI_POLYGON,
  weth: new ERC20Token(
    ChainId.POLYGON,
    '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
    18,
    'WETH',
    'Wrapped Ether',
  ),
  gtoken: CAKE[ChainId.POLYGON],
}
