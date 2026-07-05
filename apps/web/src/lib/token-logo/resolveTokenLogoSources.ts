import { getAddress } from '@ethersproject/address'
import { Token } from '@pancakeswap/sdk'
import uriToHttp from '@pancakeswap/utils/uriToHttp'
import { getTokenLogoPosition, getTokenLogoURLByAddress } from 'utils/getTokenLogoURL'
import { isMarcoSymbol, MARCO_LOGO_URI } from 'design-system/melega/constants/brand'
import pancakeDefaultList from 'config/constants/tokenLists/pancake-default.tokenlist.json'

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

function pushUnique(sources: string[], seen: Set<string>, url?: string | null) {
  if (!url || seen.has(url)) return
  seen.add(url)
  sources.push(url)
}

/** Ordered fallback URLs for a token avatar — MARCO first, then list/registry/CDN/local. */
export function resolveTokenLogoSources(input: TokenLogoInput): string[] {
  const sources: string[] = []
  const seen = new Set<string>()

  if (isMarcoSymbol(input.symbol, input.name)) {
    pushUnique(sources, seen, MARCO_LOGO_URI)
    pushUnique(sources, seen, MELEGA_CDN_LOGO)
  }

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

    const listKey = `${input.chainId}:${normalized}`
    const listLogo = tokenListLogoByKey.get(listKey)
    if (listLogo) {
      uriToHttp(listLogo).forEach((url) => pushUnique(sources, seen, url))
    }

    pushUnique(sources, seen, getTokenLogoURLByAddress(normalized, input.chainId))
    pushUnique(sources, seen, `https://melega.finance/images/tokens/${normalized}.png`)
    pushUnique(
      sources,
      seen,
      getTokenLogoPosition(new Token(input.chainId, normalized, 18, input.symbol ?? 'TKN', input.name ?? 'Token')),
    )
  }

  return sources
}

export function resolvePrimaryTokenLogoSource(input: TokenLogoInput): string | undefined {
  return resolveTokenLogoSources(input)[0]
}
