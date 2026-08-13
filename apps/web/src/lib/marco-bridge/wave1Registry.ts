import type { MarcoBridgeNetwork, MarcoBridgeNetworkId, MarcoBridgeRoute } from './types'

/**
 * Founder-controlled public execution gate. Product deployment and protocol
 * activation are deliberately independent. This must remain false until the
 * explicit MARCO_BRIDGE_PUBLIC_ACTIVATION_AUTHORIZED release.
 */
export const MARCO_BRIDGE_PUBLIC_ACTIVATION_AUTHORIZED = false as const

export const MARCO_SHARED_DECIMALS = 6 as const

export const MARCO_WAVE1_NETWORKS: Record<MarcoBridgeNetworkId, MarcoBridgeNetwork> = {
  bnb: {
    id: 'bnb',
    name: 'BNB Smart Chain',
    shortName: 'BNB',
    walletFamily: 'evm',
    chainId: 56,
    layerZeroEid: 30102,
    decimals: 18,
    sharedDecimals: MARCO_SHARED_DECIMALS,
    nativeFeeSymbol: 'BNB',
    identity: {
      consumerTokenOrMint: '0x963556de0eb8138E97A85F0A86eE0acD159D210b',
      protocolContractOrStore: '0xC92B49ddF9312cbfc01Ad397963dF915C7a2399E',
    },
    explorerAddressUrl: 'https://bscscan.com/address/',
    explorerTransactionUrl: 'https://bscscan.com/tx/',
    certified: true,
    publiclyActive: false,
    executionEnabled: false,
    protectivePaused: false,
  },
  base: {
    id: 'base',
    name: 'Base',
    shortName: 'Base',
    walletFamily: 'evm',
    chainId: 8453,
    layerZeroEid: 30184,
    decimals: 18,
    sharedDecimals: MARCO_SHARED_DECIMALS,
    nativeFeeSymbol: 'ETH',
    identity: {
      consumerTokenOrMint: '0xa2c8b941542AE0599774D1661CB7B773BC0e79C7',
      protocolContractOrStore: '0xa2c8b941542AE0599774D1661CB7B773BC0e79C7',
    },
    explorerAddressUrl: 'https://basescan.org/address/',
    explorerTransactionUrl: 'https://basescan.org/tx/',
    certified: true,
    publiclyActive: false,
    executionEnabled: false,
    protectivePaused: false,
  },
  solana: {
    id: 'solana',
    name: 'Solana',
    shortName: 'Solana',
    walletFamily: 'solana',
    chainId: null,
    layerZeroEid: 30168,
    decimals: 9,
    sharedDecimals: MARCO_SHARED_DECIMALS,
    nativeFeeSymbol: 'SOL',
    identity: {
      consumerTokenOrMint: '6SWgjmuTyPAcYYU77Mzf1gE6QA7ZcZsbsfiThz2cW1VF',
      protocolContractOrStore: '7L8x99W1yVVgtsu3wWy9DgD9ysnnfF4XXhdKhUrQxEuW',
    },
    explorerAddressUrl: 'https://solscan.io/account/',
    explorerTransactionUrl: 'https://solscan.io/tx/',
    certified: true,
    publiclyActive: false,
    executionEnabled: false,
    protectivePaused: true,
  },
  robinhood: {
    id: 'robinhood',
    name: 'Robinhood Chain',
    shortName: 'Robinhood',
    walletFamily: 'evm',
    chainId: 4663,
    layerZeroEid: 30416,
    decimals: 18,
    sharedDecimals: MARCO_SHARED_DECIMALS,
    nativeFeeSymbol: 'Native gas',
    identity: {
      consumerTokenOrMint: '0x803925DacEcCc32343cdac0C731dB07a1A384bFB',
      protocolContractOrStore: '0x803925DacEcCc32343cdac0C731dB07a1A384bFB',
    },
    certified: true,
    publiclyActive: false,
    executionEnabled: false,
    protectivePaused: false,
  },
}

const DIRECT_ROUTE_PAIRS: Array<[MarcoBridgeNetworkId, MarcoBridgeNetworkId]> = [
  ['bnb', 'base'],
  ['base', 'bnb'],
  ['bnb', 'solana'],
  ['solana', 'bnb'],
  ['bnb', 'robinhood'],
  ['robinhood', 'bnb'],
]

export const MARCO_WAVE1_ROUTES: readonly MarcoBridgeRoute[] = DIRECT_ROUTE_PAIRS.map(([from, to]) => ({
  id: `${from}-${to}`,
  from,
  to,
  direct: true,
  certified: true,
  publiclyActive: false,
  executionEnabled: false,
}))

export function getMarcoBridgeNetwork(id: MarcoBridgeNetworkId): MarcoBridgeNetwork {
  return MARCO_WAVE1_NETWORKS[id]
}

export function getMarcoBridgeRoute(from: MarcoBridgeNetworkId, to: MarcoBridgeNetworkId): MarcoBridgeRoute | null {
  return MARCO_WAVE1_ROUTES.find((route) => route.from === from && route.to === to) ?? null
}

export function explainUnsupportedRoute(from: MarcoBridgeNetworkId, to: MarcoBridgeNetworkId): string {
  if (from === to) return 'Choose two different networks.'
  if (from !== 'bnb' && to !== 'bnb') {
    return 'This journey requires two separate bridges through BNB. Complete the first delivery before starting the second.'
  }
  return 'This route is not part of certified MARCO Wave-1.'
}

export function isMarcoBridgeExecutionEnabled(route: MarcoBridgeRoute): boolean {
  const source = getMarcoBridgeNetwork(route.from)
  const destination = getMarcoBridgeNetwork(route.to)
  return Boolean(
    MARCO_BRIDGE_PUBLIC_ACTIVATION_AUTHORIZED &&
      route.certified &&
      route.publiclyActive &&
      route.executionEnabled &&
      source.publiclyActive &&
      source.executionEnabled &&
      destination.publiclyActive &&
      destination.executionEnabled &&
      !source.protectivePaused &&
      !destination.protectivePaused,
  )
}
