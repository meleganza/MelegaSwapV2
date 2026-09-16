/**
 * Resolve Create Pool wizard tokens through the existing canonical registry /
 * default token list. Exact symbol match only — CAKE must not resolve to MARCO.
 */
import { WBNB } from '@pancakeswap/sdk'
import defaultTokenList from 'config/constants/tokenLists/pancake-default.tokenlist.json'
import { MARCO_BSC_ADDRESS, MARCO_LOGO_URI } from 'design-system/melega/constants/brand'
import { getCanonicalTokenRegistry } from 'lib/canonical-token-registry'
import { localBscTokenLogoPath } from 'lib/token-logo/localTokenLogoPath'
import { TOKEN_OPTIONS } from './createPoolWizardState'

type TokenListEntry = {
  chainId: number
  address: string
  symbol: string
  name?: string
  logoURI?: string
}

export type CreatePoolWizardTokenMeta = {
  symbol: string
  address: string
  chainId: number
  logoURI?: string
}

const BSC = 56

function exactListMatch(symbol: string): TokenListEntry | undefined {
  const needle = symbol.trim().toUpperCase()
  return ((defaultTokenList.tokens ?? []) as TokenListEntry[]).find(
    (token) => token.chainId === BSC && token.symbol.trim().toUpperCase() === needle,
  )
}

function exactRegistryMatch(symbol: string) {
  const needle = symbol.trim().toUpperCase()
  return getCanonicalTokenRegistry().find(
    (token) => token.chainId === BSC && token.symbol.trim().toUpperCase() === needle,
  )
}

export function resolveCreatePoolWizardToken(symbol: string): CreatePoolWizardTokenMeta | null {
  const upper = symbol.trim().toUpperCase()
  if (!upper) return null

  if (upper === 'MARCO') {
    return {
      symbol: 'MARCO',
      address: MARCO_BSC_ADDRESS,
      chainId: BSC,
      logoURI: MARCO_LOGO_URI,
    }
  }

  if (upper === 'BNB') {
    const address = WBNB[BSC].address
    const listed = exactListMatch('WBNB') ?? exactListMatch('BNB')
    return {
      symbol: 'BNB',
      address,
      chainId: BSC,
      logoURI: listed?.logoURI ?? localBscTokenLogoPath(address),
    }
  }

  const listed = exactListMatch(upper)
  if (listed?.address) {
    return {
      symbol: upper,
      address: listed.address,
      chainId: listed.chainId,
      logoURI: listed.logoURI ?? localBscTokenLogoPath(listed.address),
    }
  }

  const registry = exactRegistryMatch(upper)
  if (registry?.address) {
    return {
      symbol: upper,
      address: registry.address,
      chainId: registry.chainId,
      logoURI: registry.logo ?? localBscTokenLogoPath(registry.address),
    }
  }

  return null
}

export function resolveCreatePoolWizardTokenMap(
  symbols: readonly string[] = TOKEN_OPTIONS,
): Record<string, CreatePoolWizardTokenMeta> {
  const out: Record<string, CreatePoolWizardTokenMeta> = {}
  for (const symbol of symbols) {
    const meta = resolveCreatePoolWizardToken(symbol)
    if (meta) out[symbol] = meta
  }
  return out
}
