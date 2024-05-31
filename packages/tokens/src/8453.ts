import { ChainId, WETH9, ERC20Token } from '@pancakeswap/sdk'
import { USDC, DAI, CAKE } from '@pancakeswap/tokens'

export const baseTokens = {
  weth: WETH9[ChainId.BASE],
  usdc: USDC[ChainId.BASE],
  dai: DAI[ChainId.BASE],
  cake: CAKE[ChainId.BASE],
  syrup: new ERC20Token(
    ChainId.BASE,
    '0xE00D9037552C537200DA56DC009A21b81bB8b298',
    18,
    'MRT',
    'MARCO Reward Token',
    'https://melega.finance/',
  ),
}
