/**
 * Smart Swap token wallet actions — watchAsset + copy address.
 * Does not participate in routing, fee settlement, or swap execution.
 */

export type SmartSwapWatchAssetPayload = {
  address: string
  symbol: string
  decimals: number
  /** Canonical logo only — never arbitrary remote URLs from untrusted metadata. */
  image?: string
}

export type SmartSwapWatchAssetRequest = {
  method: 'wallet_watchAsset'
  params: {
    type: 'ERC20'
    options: {
      address: string
      symbol: string
      decimals: number
      image?: string
    }
  }
}
