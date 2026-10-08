/**
 * When the chain read does not finish, a token already in the canonical registry
 * or the Melega factory inventory can still be identified. This does not invent
 * metadata for an unknown contract.
 */
import { lookupCanonicalToken } from 'lib/canonical-token-registry'
import { loadClassifiedAmmPairs } from 'lib/bsc-indexer/pairs/registry'

export type ListedTokenIdentitySource = 'factory' | 'canonical-registry'

export type ListedDexHint = {
  listed: boolean
  name: string | null
  symbol: string | null
  logo: string | null
}

export type ListedTokenFallback = {
  source: ListedTokenIdentitySource
  name: string
  symbol: string
  decimals: number | null
  logo: string | null
  listed: boolean
  factoryListed: boolean
}

function clean(value: string | null | undefined): string {
  return typeof value === 'string' ? value.trim() : ''
}

/** Tradeable Melega factory inventory from the existing on-chain pair registry. */
export function factoryListsToken(chainId: number, contract: string): boolean {
  if (chainId !== 56) return false
  const target = contract.trim().toLowerCase()
  if (!/^0x[a-fA-F0-9]{40}$/.test(target)) return false
  return loadClassifiedAmmPairs().some((pair) => {
    if (pair.classification !== 'tradeable' && pair.classification !== 'liquidity_present') return false
    return pair.token0 === target || pair.token1 === target
  })
}

export function resolveListedTokenFallback(
  chainId: number,
  contract: string,
  dex: ListedDexHint,
): ListedTokenFallback | null {
  const canonical = lookupCanonicalToken(chainId, contract)
  const factoryListed = factoryListsToken(chainId, contract)
  if (!canonical && !factoryListed) return null
  const name = clean(canonical?.name) || clean(dex.name)
  const symbol = clean(canonical?.symbol) || clean(dex.symbol)
  if (!name || !symbol) return null
  return {
    source: factoryListed ? 'factory' : 'canonical-registry',
    name,
    symbol,
    decimals: canonical?.decimals ?? null,
    logo: canonical?.logo ?? dex.logo,
    listed: Boolean(dex.listed || factoryListed || canonical),
    factoryListed,
  }
}
