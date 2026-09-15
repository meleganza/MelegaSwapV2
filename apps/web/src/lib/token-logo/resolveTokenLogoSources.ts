import { getAddress } from '@ethersproject/address'
import uriToHttp from '@pancakeswap/utils/uriToHttp'
import { getTokenLogoURLByAddress } from 'utils/getTokenLogoURL'
import { isMarcoSymbol, MARCO_LOGO_URI } from 'design-system/melega/constants/brand'
import { localBscTokenLogoCandidates } from './localTokenLogoPath'

export interface TokenLogoInput {
  symbol?: string | null
  name?: string | null
  address?: string | null
  chainId?: number | null
  logoURI?: string | null
}

const MELEGA_CDN_LOGO = 'https://www.melega.finance/images/melega.png'

/** Cache resolved source lists by chainId + address (never cross-chain reuse). */
const resolvedByIdentity = new Map<string, string[]>()

function pushUnique(sources: string[], seen: Set<string>, url?: string | null) {
  if (!url || seen.has(url)) return
  seen.add(url)
  sources.push(url)
}

function identityKey(chainId: number, address: string): string {
  try {
    return `${chainId}:${getAddress(address).toLowerCase()}`
  } catch {
    return `${chainId}:${address.toLowerCase()}`
  }
}

/**
 * Ordered fallback URLs for a token avatar.
 * Priority:
 * 1. canonical project logo (logoURI)
 * 2. chain token logo directory (local / chain-scoped CDN)
 * 3. indexed metadata / CDN paths
 * 4. caller falls back to deterministic neutral avatar
 *
 * The full token-list payload deliberately stays outside this synchronous UI
 * helper; search/project records pass their canonical logoURI explicitly.
 * Never uses a logo from the same address on another chain.
 */
export function resolveTokenLogoSources(input: TokenLogoInput): string[] {
  const sources: string[] = []
  const seen = new Set<string>()

  // Brand MARCO / Melega — always prefer official brand asset when symbol matches.
  if (isMarcoSymbol(input.symbol, input.name)) {
    pushUnique(sources, seen, MARCO_LOGO_URI)
    pushUnique(sources, seen, MELEGA_CDN_LOGO)
  }

  // 1. Canonical project / explicit logo
  if (input.logoURI) {
    uriToHttp(input.logoURI).forEach((url) => pushUnique(sources, seen, url))
  }

  if (input.address && input.chainId) {
    let normalized: string
    let checksummed: string
    try {
      checksummed = getAddress(input.address)
      normalized = checksummed.toLowerCase()
    } catch {
      normalized = input.address.toLowerCase()
      checksummed = input.address
    }

    // 2. Chain token logo directory (local historical first on BSC)
    if (input.chainId === 56) {
      localBscTokenLogoCandidates(input.address).forEach((url) => pushUnique(sources, seen, url))
    }
    pushUnique(sources, seen, `/images/${input.chainId}/tokens/${checksummed}.png`)
    pushUnique(sources, seen, `/images/${input.chainId}/tokens/${normalized}.png`)

    // 3. Indexed metadata / CDN (chain-scoped helpers)
    pushUnique(sources, seen, getTokenLogoURLByAddress(normalized, input.chainId))
    // The historical unscoped Melega token directory contains BSC assets.
    // Never reuse an equal address from that directory on another chain.
    if (input.chainId === 56) {
      pushUnique(sources, seen, `https://melega.finance/images/tokens/${normalized}.png`)
    }

    const cacheKey = identityKey(input.chainId, input.address)
    resolvedByIdentity.set(cacheKey, [...sources])
  }

  return sources
}

export function resolvePrimaryTokenLogoSource(input: TokenLogoInput): string | undefined {
  return resolveTokenLogoSources(input)[0]
}

/** Test helper — clear identity cache between cases. */
export function clearTokenLogoIdentityCache(): void {
  resolvedByIdentity.clear()
}
