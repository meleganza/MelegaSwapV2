import type { SmartSwapWatchAssetPayload, SmartSwapWatchAssetRequest } from './types'
import { isCanonicalWatchAssetImage } from './buildWatchAssetPayload'

export function toWatchAssetRequest(payload: SmartSwapWatchAssetPayload): SmartSwapWatchAssetRequest {
  const image = payload.image && isCanonicalWatchAssetImage(payload.image) ? payload.image : undefined
  return {
    method: 'wallet_watchAsset',
    params: {
      type: 'ERC20',
      options: {
        address: payload.address,
        symbol: payload.symbol,
        decimals: payload.decimals,
        ...(image ? { image } : {}),
      },
    },
  }
}

/** Prompt MetaMask / compatible wallet to track the ERC-20 token. */
export async function requestWatchAsset(payload: SmartSwapWatchAssetPayload): Promise<boolean> {
  if (typeof window === 'undefined' || !window.ethereum?.request) {
    throw new Error('No EIP-1193 wallet available')
  }
  const req = toWatchAssetRequest(payload)
  const result = await window.ethereum.request(req as any)
  return Boolean(result)
}

export function canRequestWatchAsset(): boolean {
  if (typeof window === 'undefined') return false
  // @ts-ignore
  if (window?.ethereum?.isSafePal) return false
  return Boolean(
    window?.ethereum &&
      // @ts-ignore
      (window.ethereum.isMetaMask ||
        // @ts-ignore
        window.ethereum.isTrust ||
        // @ts-ignore
        window.ethereum.isCoinbaseWallet ||
        // @ts-ignore
        window.ethereum.isTokenPocket),
  )
}
