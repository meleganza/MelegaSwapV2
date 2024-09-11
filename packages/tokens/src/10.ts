import { ChainId, WETH9, ERC20Token } from '@pancakeswap/sdk'

export const optimismTokens = {
  weth: WETH9[ChainId.OPTIMISM],
  usdt: new ERC20Token(
    ChainId.OPTIMISM,
    '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58',
    6,
    'USDT',
    'Tether USD',
    'https://tether.to/',
  ),
  usdc: new ERC20Token(
    ChainId.OPTIMISM,
    '0x7F5c764cBc14f9669B88837ca1490cCa17c31607',
    6,
    'USDC.e',
    'USDCoin (Bridged from Ethereum)',
    '',
  ),
  wbtc: new ERC20Token(
    ChainId.OPTIMISM,
    '0x68f180fcCe6836688e9084f035309E29Bf0A2095',
    8,
    'WBTC',
    'Wrapped BTC',
    '',
  ),
  dai: new ERC20Token(
    ChainId.OPTIMISM,
    '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
    18,
    'DAI',
    'Dai Stablecoin',
    '',
  ),
}
