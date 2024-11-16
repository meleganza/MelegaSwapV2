import { ChainId, WETH9, ERC20Token } from '@pancakeswap/sdk'
import { DAI_ETH, USDC, USDT, WBTC_ETH } from '@pancakeswap/tokens'

export const ethereumTokens = {
  weth: WETH9[ChainId.ETHEREUM],
  usdt: USDT[ChainId.ETHEREUM],
  usdc: USDC[ChainId.ETHEREUM],
  wbtc: WBTC_ETH,
  dai: DAI_ETH,
  cake: new ERC20Token(
    ChainId.ETHEREUM,
    '0x5911Dc98a9E1A4FfFD802C3A57cdA6bbd26Cdb76',
    18,
    'MARCO',
    'MELEGA',
    'https://melega.finance/',
  ),
  syrup: new ERC20Token(
    ChainId.ETHEREUM,
    '0x816ddF4e751dfE6A5e65837F721C5fD971108eDE',
    18,
    'MRT',
    'MARCO Reward Token',
    'https://melega.finance/',
  ),
  loco: new ERC20Token(
    ChainId.ETHEREUM,
    '0x3F6bd76e4D5289D63F72ef46Dfb53048985f9bA8',
    18,
    'LOCO',
    'LOCO',
    'https://locotoken.fun/',
  ),
  code: new ERC20Token(
    ChainId.ETHEREUM,
    '0x283344eEA472f0fE04d6f722595A2fFFEfE1901A',
    13,
    'CODE',
    'Code Token',
    'http://code0x.io/',
  ),
  rkit: new ERC20Token(
    ChainId.ETHEREUM,
    '0xbcBf0609abDb86c00f71c9D471905D3C1981B835',
    18,
    'RKIT',
    'Rawkit',
    'http://www.rawkit.xyz/',
  ),
}
