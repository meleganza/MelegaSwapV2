import { ChainId, ERC20Token } from '@pancakeswap/sdk'

const WBNB = '0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd'
const USDT = '0x337610d27c682E347C9cD60BD4b3b107C9d34dDd'
const MARCO = '0x963556de0eb8138E97A85F0A86eE0acD159D210b'

export const bscTestnetTokens = {
  wbnb: new ERC20Token(ChainId.BSC_TESTNET, WBNB, 18, 'WBNB', 'Wrapped BNB', 'https://testnet.binance.org/'),
  bnb: new ERC20Token(ChainId.BSC_TESTNET, WBNB, 18, 'tBNB', 'Test BNB', 'https://testnet.binance.org/'),
  usdt: new ERC20Token(ChainId.BSC_TESTNET, USDT, 18, 'USDT', 'Tether USD', 'https://tether.to/'),
  marco: new ERC20Token(ChainId.BSC_TESTNET, MARCO, 18, 'MARCO', 'MELEGA', 'https://melega.finance/'),
}
