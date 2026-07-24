/**
 * PASSPORT_MODULE_003 — Assets view-model contract.
 * Crypto, M-Credits, linked wallets, and actions remain conceptually separate.
 */

export type AssetsCardAvailability =
  | 'ready'
  | 'empty'
  | 'unavailable'
  | 'wallet_not_connected'
  | 'partial'

export type PassportCryptoAssetRow = {
  symbol: string
  balance: string
  valueUsd: string | null
  chain: string | null
  wallet: string | null
  trend: string | null
}

export type PassportLinkedWalletRow = {
  name: string
  chain: string
  addressShort: string
  connection: string
  primary: boolean
}

export type PassportQuickAction = {
  id: string
  label: string
  href: string | null
  supported: boolean
  reason?: string
}

export type PassportAssetsViewModel = {
  loading: boolean
  walletConnected: boolean
  crypto: {
    availability: AssetsCardAvailability
    rows: readonly PassportCryptoAssetRow[]
    status: string
  }
  mCredits: {
    availability: AssetsCardAvailability
    balance: string
    status: string
    receivingAccount: string
    topUpSupported: boolean
    spendSupported: boolean
    historySupported: boolean
  }
  wallets: {
    availability: AssetsCardAvailability
    rows: readonly PassportLinkedWalletRow[]
    status: string
  }
  actions: {
    availability: AssetsCardAvailability
    items: readonly PassportQuickAction[]
    status: string
  }
}

export const ASSETS_UNAVAILABLE = '—' as const
export const ASSETS_NOT_AVAILABLE = 'Not Available' as const
