import { ChainId } from '@pancakeswap/sdk'
import { BSC_TESTNET_ADDRESSES } from 'config/constants/bscTestnet'

const MAINNET_EXPLORER = 'https://bscscan.com'
const TESTNET_EXPLORER = BSC_TESTNET_ADDRESSES.explorer

export function getBlockExplorerBaseUrl(chainId?: number): string {
  if (chainId === ChainId.BSC_TESTNET) return TESTNET_EXPLORER
  if (chainId === ChainId.BSC) return MAINNET_EXPLORER
  if (chainId === ChainId.ETHEREUM) return 'https://etherscan.io'
  if (chainId === ChainId.POLYGON) return 'https://polygonscan.com'
  if (chainId === ChainId.BASE) return 'https://basescan.org'
  return MAINNET_EXPLORER
}

export function getAddressExplorerUrl(address: string, chainId?: number): string {
  const base = getBlockExplorerBaseUrl(chainId)
  return `${base}/address/${address}`
}

export function getTokenExplorerUrl(address: string, chainId?: number): string {
  const base = getBlockExplorerBaseUrl(chainId)
  return `${base}/token/${address}`
}

export function getTxExplorerUrl(txHash: string, chainId?: number): string {
  const base = getBlockExplorerBaseUrl(chainId)
  return `${base}/tx/${txHash}`
}
