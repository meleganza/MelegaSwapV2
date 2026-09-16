export const MARCO_CONNECT_FALLBACK_LABEL = 'MARCO CONNECT'

export type MarcoConnectMCreditsState = {
  available?: string | number | null
  currency?: string | null
  known?: boolean
}

export type MarcoConnectSpendAuthorization = {
  ok: boolean
  mcreditsAuthorization?: string
  merchantOrderRef?: string
  maxAmountMinor?: string
  expiresAt?: string
  error?: { code?: string; message?: string }
}

export type MarcoConnectSpendSdk = {
  getState: () => {
    connected?: boolean
    mCredits?: MarcoConnectMCreditsState | null
  }
  refresh?: () => Promise<unknown> | unknown
  connect?: () => Promise<unknown> | unknown
  authorizeMCreditsSpend?: (input: {
    merchantOrderRef: string
    maxAmountMinor: string
  }) => Promise<MarcoConnectSpendAuthorization>
}

let activeMarcoConnectSdk: MarcoConnectSpendSdk | null = null

/** Registers the already-mounted header MARCO Connect SDK for Boost checkout. */
export function registerActiveMarcoConnectSdk(sdk: MarcoConnectSpendSdk | null): void {
  activeMarcoConnectSdk = sdk
}

export function getActiveMarcoConnectSdk(): MarcoConnectSpendSdk | null {
  return activeMarcoConnectSdk
}

export function readMCreditsAvailable(
  state: { mCredits?: MarcoConnectMCreditsState | null } | null | undefined,
): number | null {
  const credits = state?.mCredits
  if (!credits || credits.known === false || credits.available == null || credits.available === '') return null
  const value = typeof credits.available === 'number' ? credits.available : Number(credits.available)
  return Number.isFinite(value) ? value : null
}

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
