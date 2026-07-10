import { ChainId, ERC20Token, Native } from '@pancakeswap/sdk'
import { bscTestnetTokens } from '@pancakeswap/tokens'
import { BSC_TESTNET_ADDRESSES } from 'config/constants/bscTestnet'

export const TESTNET_LIQUIDITY_ROUTE = '/testnet/liquidity'

export const TESTNET_LIQUIDITY_CHAIN_ID = ChainId.BSC_TESTNET

export type TestnetTokenOption = {
  id: string
  symbol: string
  address: string
  isNative: boolean
}

export const TESTNET_TOKEN_OPTIONS: TestnetTokenOption[] = [
  { id: 'MARCO', symbol: 'MARCO', address: BSC_TESTNET_ADDRESSES.marco, isNative: false },
  { id: 'WBNB', symbol: 'WBNB (tBNB)', address: BSC_TESTNET_ADDRESSES.wbnb, isNative: true },
  { id: 'USDT', symbol: 'USDT', address: BSC_TESTNET_ADDRESSES.usdt, isNative: false },
]

export const RUNTIME_LABELS = {
  router: BSC_TESTNET_ADDRESSES.router,
  factory: BSC_TESTNET_ADDRESSES.factory,
  treasuryIntake: BSC_TESTNET_ADDRESSES.treasuryIntake,
  wrapper: null as string | null,
  network: 'BNB Testnet',
  chainId: BSC_TESTNET_ADDRESSES.chainId,
}

export function getTokenOption(id: string): TestnetTokenOption {
  return TESTNET_TOKEN_OPTIONS.find((t) => t.id === id) ?? TESTNET_TOKEN_OPTIONS[0]
}

export function erc20ForOption(option: TestnetTokenOption): ERC20Token {
  if (option.id === 'MARCO') return bscTestnetTokens.marco
  if (option.id === 'USDT') return bscTestnetTokens.usdt
  return bscTestnetTokens.wbnb
}

export function currencyForOption(option: TestnetTokenOption) {
  if (option.isNative) return Native.onChain(TESTNET_LIQUIDITY_CHAIN_ID)
  return erc20ForOption(option)
}
