import { ChainId, WETH9, ERC20Token } from '@pancakeswap/sdk'

export const avaxTokens = {
  weth: WETH9[ChainId.AVAX],
  usdt: new ERC20Token(
    ChainId.AVAX,
    '0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7',
    6,
    'USDT',
    'Tether USD',
    'https://tether.to/',
  ),
  usdc: new ERC20Token(
    ChainId.AVAX,
    '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E',
    6,
    'USDC.e',
    'USDCoin (Bridged from Ethereum)',
    '',
  ),
  wbtc: new ERC20Token(
    ChainId.AVAX,
    '0x50b7545627a5162F82A992c33b87aDc75187B218',
    8,
    'WBTC',
    'Wrapped BTC',
    '',
  ),
  dai: new ERC20Token(
    ChainId.AVAX,
    '0xd586E7F844cEa2F87f50152665BCbc2C279D8d70',
    18,
    'DAI.e',
    'Dai.e Token',
    '',
  ),
}
