import { Currency, Token } from '@pancakeswap/sdk'
import { getAddress } from '@ethersproject/address'
import { getTokenLogoPosition } from 'utils/getTokenLogoURL'
import type { SmartSwapWatchAssetPayload } from './types'

const CANONICAL_ORIGIN = 'https://www.melega.finance'

/**
 * Absolute image URL allowed for wallet_watchAsset.
 * Only Melega-hosted `/images/...` token paths — never arbitrary logoURI hosts.
 */
export function resolveCanonicalWatchAssetImage(token: Token, origin: string = CANONICAL_ORIGIN): string | undefined {
  const local = getTokenLogoPosition(token)
  if (!local || !local.startsWith('/images/')) return undefined
  const base = origin.replace(/\/$/, '')
  return `${base}${local}`
}

export function isCanonicalWatchAssetImage(url: string | undefined | null): boolean {
  if (!url) return true
  try {
    const u = new URL(url)
    if (u.protocol !== 'https:') return false
    const hostOk = u.hostname === 'www.melega.finance' || u.hostname === 'melega.finance'
    return hostOk && u.pathname.startsWith('/images/')
  } catch {
    return false
  }
}

/**
 * Build wallet_watchAsset options from a Currency.
 * Native currencies return null (not ERC-20 watchable).
 */
export function buildWatchAssetPayload(
  currency: Currency | null | undefined,
  origin: string = CANONICAL_ORIGIN,
): SmartSwapWatchAssetPayload | null {
  if (!currency || currency.isNative) return null
  if (!(currency instanceof Token) && !('address' in currency)) return null

  const token = currency as Token
  let address: string
  try {
    address = getAddress(token.address)
  } catch {
    return null
  }

  const symbol = (token.symbol || 'TOKEN').slice(0, 11)
  const decimals = Number(token.decimals)
  if (!Number.isFinite(decimals) || decimals < 0 || decimals > 255) return null

  const image = resolveCanonicalWatchAssetImage(token, origin)
  if (image && !isCanonicalWatchAssetImage(image)) {
    return { address, symbol, decimals }
  }

  return {
    address,
    symbol,
    decimals,
    ...(image ? { image } : {}),
  }
}

export function buildWatchAssetPayloadFromFields(input: {
  address: string
  symbol: string
  decimals: number
  chainId: number
  origin?: string
}): SmartSwapWatchAssetPayload | null {
  try {
    const token = new Token(input.chainId, getAddress(input.address), input.decimals, input.symbol, input.symbol)
    return buildWatchAssetPayload(token, input.origin ?? CANONICAL_ORIGIN)
  } catch {
    return null
  }
}
