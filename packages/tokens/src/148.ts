import { ChainId, WETH9, ERC20Token } from '@pancakeswap/sdk'
import { USDC, USDT, CAKE, WBTC_SMR } from './common'

export const shimmer2Tokens = {
  weth: WETH9[ChainId.SHIMMER2],
  usdt: USDT[ChainId.SHIMMER2],
  usdc: USDC[ChainId.SHIMMER2],
  wbtc: WBTC_SMR,
  gtoken: CAKE[ChainId.SHIMMER2],
  smr: new ERC20Token(
    ChainId.SHIMMER2,
    '0x1074010000000000000000000000000000000000',
    6,
    'SMR',
    'Shimmer',
    'https://shimmer.network/',
  ),
  eth: new ERC20Token(
    ChainId.SHIMMER2,
    '0x4638C9fb4eFFe36C49d8931BB713126063BF38f9',
    18,
    'ETH',
    'Ether',
    '',
  ),
  bnb: new ERC20Token(
    ChainId.SHIMMER2,
    '0x2A6F394085B8E33fbD9dcFc776BCE4ed95F1900D',
    18,
    'BNB',
    'BNB'
  ),
  matic: new ERC20Token(
    ChainId.SHIMMER2,
    '0xE6373A7Bb9B5a3e71D1761a6Cb4992AD8537Bf28',
    18,
    'MATIC',
    'Matic'
  ),
}
