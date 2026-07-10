import { BSC_TESTNET_ADDRESSES } from 'config/constants/bscTestnet'

export const VALIDATE_CHAIN_ID = 97
export const VALIDATE_CHAIN_HEX = '0x61'

export const WRAPPER_ADDRESS = '0x9D2451b30102B098570bfCeae0E8b8C9Fd2bb2Db'
export const PAIR_MARCO_WBNB = '0x6eFCe8f5C7Fb3B979A6a2Be4a62DB4A055c666E0'

export const ADDR = {
  ...BSC_TESTNET_ADDRESSES,
  wrapper: WRAPPER_ADDRESS,
  pairMarcoWbnb: PAIR_MARCO_WBNB,
}

export type RouteId = 'BUY_MARCO' | 'SELL_MARCO' | 'STANDARD_SWAP'

export type RouteDef = {
  id: RouteId
  title: string
  description: string
  inputLabel: string
  defaultAmount: string
  expectedFeeBps: number
  inputIsNative: boolean
  inputToken: string | null
  outputToken: string
  path: string[]
  liquidityPair?: [string, string]
}

export const ROUTES: RouteDef[] = [
  {
    id: 'BUY_MARCO',
    title: 'BUY_MARCO',
    description: 'tBNB → MARCO',
    inputLabel: 'tBNB amount',
    defaultAmount: '0.01',
    expectedFeeBps: 20,
    inputIsNative: true,
    inputToken: null,
    outputToken: BSC_TESTNET_ADDRESSES.marco,
    path: [BSC_TESTNET_ADDRESSES.wbnb, BSC_TESTNET_ADDRESSES.marco],
    liquidityPair: [BSC_TESTNET_ADDRESSES.marco, BSC_TESTNET_ADDRESSES.wbnb],
  },
  {
    id: 'SELL_MARCO',
    title: 'SELL_MARCO',
    description: 'MARCO → WBNB',
    inputLabel: 'MARCO amount',
    defaultAmount: '100',
    expectedFeeBps: 30,
    inputIsNative: false,
    inputToken: BSC_TESTNET_ADDRESSES.marco,
    outputToken: BSC_TESTNET_ADDRESSES.wbnb,
    path: [BSC_TESTNET_ADDRESSES.marco, BSC_TESTNET_ADDRESSES.wbnb],
    liquidityPair: [BSC_TESTNET_ADDRESSES.marco, BSC_TESTNET_ADDRESSES.wbnb],
  },
  {
    id: 'STANDARD_SWAP',
    title: 'STANDARD_SWAP',
    description: 'tBNB → USDT',
    inputLabel: 'tBNB amount',
    defaultAmount: '0.01',
    expectedFeeBps: 30,
    inputIsNative: true,
    inputToken: null,
    outputToken: BSC_TESTNET_ADDRESSES.usdt,
    path: [BSC_TESTNET_ADDRESSES.wbnb, BSC_TESTNET_ADDRESSES.usdt],
    liquidityPair: [BSC_TESTNET_ADDRESSES.usdt, BSC_TESTNET_ADDRESSES.wbnb],
  },
]

export function txExplorerUrl(txHash: string) {
  return `${BSC_TESTNET_ADDRESSES.explorer}/tx/${txHash}`
}

export function addressExplorerUrl(address: string) {
  return `${BSC_TESTNET_ADDRESSES.explorer}/address/${address}`
}
