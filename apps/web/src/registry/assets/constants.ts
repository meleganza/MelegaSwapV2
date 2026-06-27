import { AssetCapabilities } from './types'

export const ASSET_REGISTRY_AS_OF = '2026-06-26'

export const ASSET_REGISTRY_DISCLAIMER =
  'Listed ≠ audited. Static asset registry MVP — automated verification not live. Observed = legacy-indexed data only.'

export const ASSET_REGISTRY_API_VERSION = '0.1.0'

export const CHAIN_LABELS: Record<number, string> = {
  1: 'Ethereum',
  56: 'BSC',
  137: 'Polygon',
  8453: 'Base',
}

export const CHAIN_EXPLORER_TOKEN_URL: Record<number, (address: string) => string> = {
  1: (address) => `https://etherscan.io/token/${address}`,
  56: (address) => `https://bscscan.com/token/${address}`,
  137: (address) => `https://polygonscan.com/token/${address}`,
  8453: (address) => `https://basescan.org/token/${address}`,
}

export const ASSET_CAPABILITY_LABELS: Record<keyof AssetCapabilities, string> = {
  tradable: 'Tradable',
  liquidity: 'Liquidity',
  farm: 'Farm',
  pool: 'Pool (staking)',
  lock: 'Lock',
  governance: 'Governance',
  smartdrop: 'SmartDrop',
  radar: 'Radar',
  space: 'Space',
  labs: 'Labs',
  treasury: 'Treasury',
}

export const ASSET_TYPE_LABELS: Record<import('./types').AssetType, string> = {
  fungible: 'Fungible Token',
  lp: 'LP Token',
  nft: 'NFT',
  stable: 'Stable Asset',
  wrapped: 'Wrapped Asset',
}

export const buildUai = (assetType: string, chainId: number, address: string, version = 1): string =>
  `uai://melega/asset/${assetType}/${chainId}/${address}@${version}`
