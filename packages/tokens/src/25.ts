import { ChainId, WETH9, ERC20Token } from '@pancakeswap/sdk'

export const cronosTokens = {
  weth: WETH9[ChainId.CRONOS],
  usdc: new ERC20Token(
    ChainId.CRONOS,
    '0xc21223249CA28397B4B6541dfFaEcC539BfF0c59',
    6,
    'USDC',
    'USDCoin',
    '',
  ),
  usdt: new ERC20Token(
    ChainId.CRONOS,
    '0x66e428c3f67a68878562e79A0234c1F83c208770',
    6,
    'USDT',
    'Tether USD',
    '',
  ),
}
