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
  yup: new ERC20Token(
    ChainId.BASE,
    '0x12418743a0AbdE7EEB5cb83185DaB9431278dA09',
    18,
    'YUP',
    'YUP',
    'https://www.yuptoken.fun/',
  ),
  aero: new ERC20Token(
    ChainId.BASE,
    '0x940181a94A35A4569E4529A3CDfB74e38FD98631',
    18,
    'AERO',
    'Aerodrome',
    'https://aerodrome.finance/',
  ),
  brett: new ERC20Token(
    ChainId.BASE,
    '0x532f27101965dd16442E59d40670FaF5eBB142E4',
    18,
    'BRETT',
    'Brett',
    'https://www.basedbrett.com/',
  ),
  clonereth: new ERC20Token(
    ChainId.BASE,
    '0xb145510f535D964994ee595100a32Fb1Ec057D85',
    18,
    'RETH',
    'Rocket Pool ETH',
    'https://www.clonedtokens.fun/',
  ),
  clonezro: new ERC20Token(
    ChainId.BASE,
    '0x7d78269Ba8c29561335590882CbBe39B4Ba92CF3',
    18,
    'ZRO',
    'LayerZero',
    'https://www.clonedtokens.fun/',
  ),
}
