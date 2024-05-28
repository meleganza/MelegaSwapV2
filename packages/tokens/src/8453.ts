import { ChainId, WETH9, ERC20Token } from '@pancakeswap/sdk'
import { USDC, DAI, CAKE } from '@pancakeswap/tokens'

export const baseTokens = {
  weth: WETH9[ChainId.BASE],
  usdc: USDC[ChainId.BASE],
  dai: DAI[ChainId.BASE],
  cake: CAKE[ChainId.BASE],
  syrup: new ERC20Token(
    ChainId.BASE,
    '0x0A4a5FE133958B0A11A47E964706Ef871d9df25A',
    18,
    'MRT',
    'MARCO Reward Token',
    'https://melega.finance/',
  ),
}
