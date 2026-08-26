import type { MarcoBridgeNetwork, MarcoBridgeNetworkId, MarcoBridgeRoute } from './types'

/**
 * The single consumer-side source of truth for MARCO Wave-1.
 *
 * These values mirror the canonical public MMN route authority. Every live quote
 * revalidates them against that authority before performing an eth_call.
 */
export const MARCO_WAVE1_NETWORKS: Record<MarcoBridgeNetworkId, MarcoBridgeNetwork> = {
  bnb: {
    id: 'bnb',
    label: 'BNB Smart Chain',
    shortLabel: 'BNB',
    walletFamily: 'evm',
    chainId: 56,
    layerZeroEid: 30102,
    marcoIdentity: '0x963556de0eb8138E97A85F0A86eE0acD159D210b',
    endpointContract: '0xC92B49ddF9312cbfc01Ad397963dF915C7a2399E',
    tokenDecimals: 18,
    sharedDecimals: 6,
    nativeFeeSymbol: 'BNB',
    explorerUrl: 'https://bscscan.com',
  },
  base: {
    id: 'base',
    label: 'Base',
    shortLabel: 'Base',
    walletFamily: 'evm',
    chainId: 8453,
    layerZeroEid: 30184,
    marcoIdentity: '0xa2c8b941542AE0599774D1661CB7B773BC0e79C7',
    endpointContract: '0xa2c8b941542AE0599774D1661CB7B773BC0e79C7',
    tokenDecimals: 18,
    sharedDecimals: 6,
    nativeFeeSymbol: 'ETH',
    explorerUrl: 'https://basescan.org',
  },
  solana: {
    id: 'solana',
    label: 'Solana',
    shortLabel: 'Solana',
    walletFamily: 'solana',
    chainId: null,
    layerZeroEid: 30168,
    marcoIdentity: '6SWgjmuTyPAcYYU77Mzf1gE6QA7ZcZsbsfiThz2cW1VF',
    endpointContract: '7L8x99W1yVVgtsu3wWy9DgD9ysnnfF4XXhdKhUrQxEuW',
    tokenDecimals: 9,
    sharedDecimals: 6,
    nativeFeeSymbol: 'SOL',
    explorerUrl: 'https://solscan.io',
    protectivePaused: true,
  },
  robinhood: {
    id: 'robinhood',
    label: 'Robinhood Chain',
    shortLabel: 'Robinhood',
    walletFamily: 'evm',
    chainId: 4663,
    layerZeroEid: 30416,
    marcoIdentity: '0x803925DacEcCc32343cdac0C731dB07a1A384bFB',
    endpointContract: '0x803925DacEcCc32343cdac0C731dB07a1A384bFB',
    tokenDecimals: 18,
    sharedDecimals: 6,
    nativeFeeSymbol: 'ETH',
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
  const blockers: string[] = []
  if (!MARCO_WAVE1_PUBLIC_ACTIVATION.enabled) blockers.push('Explicit public activation gate')
  if (MARCO_WAVE1_NETWORKS.solana.protectivePaused) blockers.push('Solana infrastructure pause')
  return blockers
}
