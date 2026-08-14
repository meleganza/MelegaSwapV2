import type { MarcoBridgeNetwork, MarcoBridgeNetworkId, MarcoBridgeRoute } from './types'

/**
 * Bridge configuration deliberately fails closed until the certified identities,
 * endpoints and explicit public activation gate are imported.
 */
export const MARCO_WAVE1_NETWORKS: Record<MarcoBridgeNetworkId, MarcoBridgeNetwork> = {
  bnb: {
    id: 'bnb',
    label: 'BNB Smart Chain',
    shortLabel: 'BNB',
    walletFamily: 'evm',
    chainId: 56,
    layerZeroEid: null,
    marcoIdentity: null,
    explorerUrl: 'https://bscscan.com',
  },
  base: {
    id: 'base',
    label: 'Base',
    shortLabel: 'Base',
    walletFamily: 'evm',
    chainId: 8453,
    layerZeroEid: null,
    marcoIdentity: null,
    explorerUrl: 'https://basescan.org',
  },
  solana: {
    id: 'solana',
    label: 'Solana',
    shortLabel: 'Solana',
    walletFamily: 'solana',
    chainId: null,
    layerZeroEid: null,
    marcoIdentity: null,
    explorerUrl: 'https://solscan.io',
    protectivePaused: true,
  },
  robinhood: {
    id: 'robinhood',
    label: 'Robinhood Chain',
    shortLabel: 'Robinhood',
    walletFamily: 'evm',
    chainId: null,
    layerZeroEid: null,
    marcoIdentity: null,
    explorerUrl: null,
  },
}

const direct = (from: MarcoBridgeNetworkId, to: MarcoBridgeNetworkId): MarcoBridgeRoute => ({
  from,
  to,
  direct: true,
  enabled: false,
})

export const MARCO_WAVE1_DIRECT_ROUTES: MarcoBridgeRoute[] = [
  direct('bnb', 'base'),
  direct('base', 'bnb'),
  direct('bnb', 'solana'),
  direct('solana', 'bnb'),
  direct('bnb', 'robinhood'),
  direct('robinhood', 'bnb'),
]

export const MARCO_WAVE1_PUBLIC_ACTIVATION = {
  enabled: false,
  certification: 'product-integration',
  solanaProtectivePauseRequired: true,
} as const

export function wave1ActivationBlockers(): string[] {
  const missing = Object.values(MARCO_WAVE1_NETWORKS).flatMap((network) => {
    const rows: string[] = []
    if (network.layerZeroEid == null) rows.push(`${network.label}: LayerZero EID`)
    if (!network.marcoIdentity) rows.push(`${network.label}: canonical MARCO identity`)
    if (network.walletFamily === 'evm' && network.chainId == null) rows.push(`${network.label}: chain ID`)
    return rows
  })
  if (!MARCO_WAVE1_PUBLIC_ACTIVATION.enabled) missing.push('Explicit public activation gate')
  return missing
}
