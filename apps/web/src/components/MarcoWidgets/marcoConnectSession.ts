export const MARCO_CONNECT_FALLBACK_LABEL = 'MARCO CONNECT'

export function shortenWagmiAddress(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`
}

export function resolveMarcoConnectNavbarState(address?: string | null): {
  connected: boolean
  label: string
} {
  if (address) {
    return { connected: true, label: shortenWagmiAddress(address) }
  }
  return { connected: false, label: MARCO_CONNECT_FALLBACK_LABEL }
}

/**
 * Official MARCO Passport / widget disconnect or teardown must never own the
 * canonical EVM session. Only the DEX wallet user action may call wagmi disconnect.
 */
export function onMarcoPassportDisconnect(evmDisconnect?: () => void): void {
  void evmDisconnect
}
