import { ChainId, WETH9, ERC20Token } from '@pancakeswap/sdk'

export const fantomTokens = {
  weth: WETH9[ChainId.FANTOM],
  usdc: new ERC20Token(
    ChainId.FANTOM,
    '0x04068DA6C83AFCFA0e13ba15A6696662335D5B75',
    6,
    'USDC',
    'USDCoin',
    '',
  ),
  wbtc: new ERC20Token(
    ChainId.FANTOM,
    '0xf1648C50d2863f780c57849D812b4B7686031A3D',
    8,
    'WBTC',
    'Wrapped BTC',
    '',
  ),
}
