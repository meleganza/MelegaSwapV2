import { ChainId, WETH9, ERC20Token } from '@pancakeswap/sdk'

export const pulseTokens = {
  weth: WETH9[ChainId.PULSE],
  usdt: new ERC20Token(
    ChainId.PULSE,
    '0x0Cb6F5a34ad42ec934882A05265A7d5F59b51A2f',
    6,
    'USDT',
    'Tether USD from Ethereum',
    'https://tether.to/',
  ),
  usdc: new ERC20Token(
    ChainId.PULSE,
    '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    6,
    'USDC',
    'USDCoin',
    '',
  ),
  wbtc: new ERC20Token(
    ChainId.PULSE,
    '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
    8,
    'WBTC',
    'Wrapped BTC',
    '',
  ),
  dai: new ERC20Token(
    ChainId.PULSE,
    '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    18,
    'DAI',
    'Dai Stablecoin',
    '',
  ),
}
