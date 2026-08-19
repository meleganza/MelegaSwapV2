/**
 * Canonical asset identity. Never route by ticker/symbol alone.
 */

import {
  EXECUTION_DOMAIN,
  EVM_CHAIN_IDS,
  SOLANA_CLUSTER,
  type ExecutionNetwork,
  evmNetwork,
  networkKey,
  solanaNetwork,
} from './domain'

export const NATIVE_ASSET_REF = 'native' as const

export type AssetLocation =
  | { kind: 'native' }
  | { kind: 'contract'; address: string }
  | { kind: 'mint'; mint: string }

export interface CanonicalAssetId {
  domain: ExecutionNetwork['domain']
  network: ExecutionNetwork
  location: AssetLocation
  /** Display-only. Never used as identity. */
  symbol?: string
  decimals?: number
  wrappedOf?: CanonicalAssetId
}

const EVM_ADDRESS_RE = /^0x[a-fA-F0-9]{40}$/
const SOLANA_MINT_RE = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/

export function normalizeEvmAddress(address: string): string {
  const trimmed = address.trim()
  if (!EVM_ADDRESS_RE.test(trimmed)) {
    throw new Error(`INVALID_EVM_ASSET_ADDRESS:${address}`)
  }
  return trimmed.toLowerCase()
}

export function normalizeSolanaMint(mint: string): string {
  const trimmed = mint.trim()
  if (!SOLANA_MINT_RE.test(trimmed)) {
    throw new Error(`INVALID_SOLANA_MINT:${mint}`)
  }
  return trimmed
}

export function evmNative(chainId: number, symbol?: string, decimals = 18): CanonicalAssetId {
  return {
    domain: EXECUTION_DOMAIN.EVM,
    network: evmNetwork(chainId),
    location: { kind: 'native' },
    symbol,
    decimals,
  }
}

export function evmContract(chainId: number, address: string, symbol?: string, decimals?: number): CanonicalAssetId {
  return {
    domain: EXECUTION_DOMAIN.EVM,
    network: evmNetwork(chainId),
    location: { kind: 'contract', address: normalizeEvmAddress(address) },
    symbol,
    decimals,
  }
}

export function solanaMint(mint: string, symbol?: string, decimals?: number, cluster = SOLANA_CLUSTER.MAINNET): CanonicalAssetId {
  return {
    domain: EXECUTION_DOMAIN.SOLANA,
    network: solanaNetwork(cluster),
    location: { kind: 'mint', mint: normalizeSolanaMint(mint) },
    symbol,
    decimals,
  }
}

export function solanaNative(symbol = 'SOL', decimals = 9, cluster = SOLANA_CLUSTER.MAINNET): CanonicalAssetId {
  return {
    domain: EXECUTION_DOMAIN.SOLANA,
    network: solanaNetwork(cluster),
    location: { kind: 'native' },
    symbol,
    decimals,
  }
}

export function assetIdentityKey(asset: CanonicalAssetId): string {
  const net = networkKey(asset.network)
  if (asset.location.kind === 'native') return `${net}:native`
  if (asset.location.kind === 'contract') return `${net}:contract:${asset.location.address}`
  return `${net}:mint:${asset.location.mint}`
}

export function assetsEqual(a: CanonicalAssetId, b: CanonicalAssetId): boolean {
  return assetIdentityKey(a) === assetIdentityKey(b)
}

export function assertNotSymbolIdentity(symbol: string, assets: CanonicalAssetId[]): CanonicalAssetId[] {
  const matches = assets.filter((asset) => asset.symbol?.toUpperCase() === symbol.toUpperCase())
  if (matches.length > 1) {
    const keys = matches.map(assetIdentityKey)
    if (new Set(keys).size !== keys.length) {
      throw new Error(`SYMBOL_COLLISION_UNRESOLVED:${symbol}`)
    }
  }
  return matches
}

/** Well-known examples that MUST remain distinguishable. */
export const CANONICAL_EXAMPLE_ASSETS = {
  nativeBnb: evmNative(EVM_CHAIN_IDS.BSC, 'BNB', 18),
  wbnb: evmContract(EVM_CHAIN_IDS.BSC, '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c', 'WBNB', 18),
  nativeEth: evmNative(EVM_CHAIN_IDS.ETHEREUM, 'ETH', 18),
  weth: evmContract(EVM_CHAIN_IDS.ETHEREUM, '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', 'WETH', 18),
  usdcBase: evmContract(EVM_CHAIN_IDS.BASE, '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', 'USDC', 6),
  usdcBnb: evmContract(EVM_CHAIN_IDS.BSC, '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d', 'USDC', 18),
  usdcSolana: solanaMint('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', 'USDC', 6),
} as const

export function distinguishSymbolCollisions(): Record<string, string> {
  return {
    nativeBnb: assetIdentityKey(CANONICAL_EXAMPLE_ASSETS.nativeBnb),
    wbnb: assetIdentityKey(CANONICAL_EXAMPLE_ASSETS.wbnb),
    nativeEth: assetIdentityKey(CANONICAL_EXAMPLE_ASSETS.nativeEth),
    weth: assetIdentityKey(CANONICAL_EXAMPLE_ASSETS.weth),
    usdcBase: assetIdentityKey(CANONICAL_EXAMPLE_ASSETS.usdcBase),
    usdcBnb: assetIdentityKey(CANONICAL_EXAMPLE_ASSETS.usdcBnb),
    usdcSolana: assetIdentityKey(CANONICAL_EXAMPLE_ASSETS.usdcSolana),
  }
}
