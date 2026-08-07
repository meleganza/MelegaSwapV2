import { getAddress } from '@ethersproject/address'
import { Token } from '@pancakeswap/sdk'
import uriToHttp from '@pancakeswap/utils/uriToHttp'
import { getTokenLogoPosition, getTokenLogoURLByAddress } from 'utils/getTokenLogoURL'
import { isMarcoSymbol, MARCO_LOGO_URI } from 'design-system/melega/constants/brand'
import pancakeDefaultList from 'config/constants/tokenLists/pancake-default.tokenlist.json'
import { localBscTokenLogoCandidates } from './localTokenLogoPath'

export interface TokenLogoInput {
  symbol?: string | null
  name?: string | null
  address?: string | null
  chainId?: number | null
  logoURI?: string | null
}

const MELEGA_CDN_LOGO = 'https://www.melega.finance/images/melega.png'

const tokenListLogoByKey = new Map<string, string>()
for (const token of pancakeDefaultList.tokens) {
  if (token.logoURI && token.address && token.chainId) {
    try {
      const key = `${token.chainId}:${getAddress(token.address).toLowerCase()}`
      tokenListLogoByKey.set(key, token.logoURI)
    } catch {
      // skip invalid list entries
    }
  }
}

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
 * 3. canonical token list (chainId + address)
 * 4. indexed metadata / CDN paths
 * 5. caller falls back to deterministic neutral avatar
 *
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
    try {
      normalized = getAddress(input.address).toLowerCase()
    } catch {
      normalized = input.address.toLowerCase()
    }

    // 2. Chain token logo directory (local historical first on BSC)
    if (input.chainId === 56) {
      localBscTokenLogoCandidates(input.address).forEach((url) => pushUnique(sources, seen, url))
    }
    pushUnique(sources, seen, `/images/${input.chainId}/tokens/${normalized}.png`)

    // 3. Canonical token list — keyed by chainId + address only
    const listLogo = tokenListLogoByKey.get(`${input.chainId}:${normalized}`)
    if (listLogo) {
      uriToHttp(listLogo).forEach((url) => pushUnique(sources, seen, url))
    }

    // 4. Indexed metadata / CDN (chain-scoped helpers)
    pushUnique(sources, seen, getTokenLogoURLByAddress(normalized, input.chainId))
    pushUnique(sources, seen, `https://melega.finance/images/tokens/${normalized}.png`)
    pushUnique(
      sources,
      seen,
      getTokenLogoPosition(new Token(input.chainId, normalized, 18, input.symbol ?? 'TKN', input.name ?? 'Token')),
    )

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
