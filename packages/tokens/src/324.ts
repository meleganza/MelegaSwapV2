import { ChainId, WETH9, ERC20Token } from '@pancakeswap/sdk'

export const zksyncTokens = {
  weth: WETH9[ChainId.ZKSYNC],
  usdc: new ERC20Token(
    ChainId.ZKSYNC,
    '0x3355df6D4c9C3035724Fd0e3914dE96A5a83aaf4',
    6,
    'USDC',
    'USDCoin',
    '',
  ),
  usdt: new ERC20Token(
    ChainId.ZKSYNC,
    '0x493257fD37EDB34451f62EDf8D2a0C418852bA4C',
    6,
    'USDT',
    'Tether USD',
    '',
  ),
}
