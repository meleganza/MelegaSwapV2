import { MARCO_WAVE1_NETWORKS } from 'lib/marco-bridge/wave1Registry'

export type MarcoPayNetworkId = 'bnb' | 'polygon' | 'robinhood' | 'arc' | 'solana'
export type MarcoPayWalletFamily = 'evm' | 'solana'

export const MARCO_PAY_EVM_TREASURY = '0xb6436EF4c7f76bE0f26c0C5C9dB72F2689abF65b'
export const MARCO_PAY_SOLANA_TREASURY = '2LxBuA9o3AwNyFnXsqbZnKFzyuw9WarYydknQXQieRzb'

export type MarcoPayNetwork = {
  id: MarcoPayNetworkId
  label: string
  walletFamily: MarcoPayWalletFamily
  chainId: number | null
  providerNetwork: string
  tokenAddress: string
  tokenDecimals: number
  treasuryWallet: string
}

const network = (id: MarcoPayNetworkId): MarcoPayNetwork => {
  const source = MARCO_WAVE1_NETWORKS[id]
  return {
    id,
    label: source.label,
    walletFamily: source.walletFamily,
    chainId: source.chainId,
    providerNetwork: id,
    tokenAddress: source.marcoIdentity,
    tokenDecimals: source.tokenDecimals,
    treasuryWallet: source.walletFamily === 'solana' ? MARCO_PAY_SOLANA_TREASURY : MARCO_PAY_EVM_TREASURY,
  }
}

export const MARCO_PAY_NETWORKS: Readonly<Record<MarcoPayNetworkId, MarcoPayNetwork>> = {
  bnb: network('bnb'),
  polygon: network('polygon'),
  robinhood: network('robinhood'),
  arc: network('arc'),
  solana: network('solana'),
}

export const MARCO_PAY_NETWORK_LIST = [
  MARCO_PAY_NETWORKS.bnb,
  MARCO_PAY_NETWORKS.polygon,
  MARCO_PAY_NETWORKS.robinhood,
  MARCO_PAY_NETWORKS.arc,
  MARCO_PAY_NETWORKS.solana,
] as const

export function parseMarcoPayNetworkId(value: unknown): MarcoPayNetworkId | null {
  const id = typeof value === 'string' ? value.trim().toLowerCase() : ''
  return Object.prototype.hasOwnProperty.call(MARCO_PAY_NETWORKS, id) ? (id as MarcoPayNetworkId) : null
}

export function resolveMarcoPayNetwork(input: {
  networkId?: unknown
  chainId?: unknown
}): MarcoPayNetwork | null {
  const byId = parseMarcoPayNetworkId(input.networkId)
  if (byId) return MARCO_PAY_NETWORKS[byId]
  const numeric =
    typeof input.chainId === 'number'
      ? input.chainId
      : typeof input.chainId === 'string' && /^\d+$/.test(input.chainId)
      ? Number(input.chainId)
      : null
  return MARCO_PAY_NETWORK_LIST.find((item) => item.chainId === numeric && numeric != null) ?? null
}

export function sameMarcoPayWallet(a: string | null | undefined, b: string | null | undefined): boolean {
  if (!a || !b) return false
  if (a.startsWith('0x') || b.startsWith('0x')) return a.trim().toLowerCase() === b.trim().toLowerCase()
  return a.trim() === b.trim()
}
