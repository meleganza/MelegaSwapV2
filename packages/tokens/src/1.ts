import { ChainId, WETH9, ERC20Token } from '@pancakeswap/sdk'
import { DAI_ETH, USDC, USDT, WBTC_ETH } from '@pancakeswap/tokens'

export const ethereumTokens = {
  weth: WETH9[ChainId.ETHEREUM],
  usdt: USDT[ChainId.ETHEREUM],
  usdc: USDC[ChainId.ETHEREUM],
  wbtc: WBTC_ETH,
  dai: DAI_ETH,
}
