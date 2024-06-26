import { ChainId, WETH9, ERC20Token } from '@pancakeswap/sdk'
import { USDC, DAI, CAKE } from '@pancakeswap/tokens'

export const baseTokens = {
  weth: WETH9[ChainId.BASE],
  usdc: USDC[ChainId.BASE],
  dai: DAI[ChainId.BASE],
  cake: CAKE[ChainId.BASE],
  syrup: new ERC20Token(
    ChainId.BASE,
    '0x816ddF4e751dfE6A5e65837F721C5fD971108eDE',
    18,
    'MRT',
    'MARCO Reward Token',
    'https://melega.finance/',
  ),
  syrup: new ERC20Token(
    ChainId.BASE,
    '0x12418743a0AbdE7EEB5cb83185DaB9431278dA09',
    18,
    'YUP',
    'YUP',
    'https://www.yuptoken.fun/',
  ),
}
