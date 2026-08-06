import type { GlobalSearchEntry, GlobalSearchResult } from './types'

const CHAIN_SHORT: Record<number, string> = {
  1: 'Ethereum',
  56: 'BSC',
  137: 'Polygon',
  8453: 'Base',
  42161: 'Arbitrum',
  43114: 'Avalanche',
}

const tokenize = (query: string): string[] =>
  query
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length > 0)

const escapeRegExp = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const scoreEntry = (entry: GlobalSearchEntry, tokens: string[]): number => {
  if (!tokens.length) return 0

  const label = entry.label.toLowerCase()
  const haystack = entry.searchableText
  let matchScore = 0

  tokens.forEach((token) => {
    if (label === token) matchScore += 120
    else if (label.startsWith(token)) matchScore += 80
    else if (new RegExp(`\\b${escapeRegExp(token)}\\b`).test(haystack)) matchScore += 50
    else if (haystack.includes(token)) matchScore += 25
  })

  if (matchScore === 0) return 0
  return matchScore + (entry.scoreBoost ?? 0)
}

/** Canonical identity for tokens/contracts: chainId + address. */
export function canonicalSearchIdentityKey(entry: Pick<GlobalSearchEntry, 'category' | 'chainId' | 'address' | 'href' | 'label' | 'id'>): string {
  if ((entry.category === 'token' || entry.category === 'contract') && entry.chainId != null && entry.address) {
    return `${entry.category}:${entry.chainId}:${entry.address.toLowerCase()}`
  }
  if (entry.category === 'project') {
    return `project:${entry.href}`
  }
  return `${entry.category}:${entry.href}:${entry.label}`
}

export function chainLabelForSearch(chainId?: number | null): string | null {
  if (chainId == null) return null
  return CHAIN_SHORT[chainId] ?? `Chain ${chainId}`
}

/** Prefer currently selected wallet chain, then BSC, then others. */
export function rankByPreferredChain(chainId: number | null | undefined, preferredChainId?: number | null): number {
  if (chainId == null) return 0
  if (preferredChainId != null && chainId === preferredChainId) return 40
  if (chainId === 56) return 20
  if (chainId === 8453) return 12
  if (chainId === 137) return 10
  if (chainId === 42161 || chainId === 43114) return 8
  if (chainId === 1) return 4
  return 2
}

export const searchGlobal = (
  index: GlobalSearchEntry[],
  query: string,
  limit = 12,
  preferredChainId?: number | null,
): GlobalSearchResult[] => {
  const trimmed = query.trim()
  const tokens = tokenize(trimmed)
  if (!tokens.length) return []

  const results: GlobalSearchResult[] = []

  if (/^0x[a-fA-F0-9]{6,}$/.test(trimmed)) {
    const normalized = trimmed.toLowerCase()
    const contractHits = index.filter(
      (entry) =>
        entry.searchableText.includes(normalized) ||
        entry.label.toLowerCase() === normalized,
    )
    if (contractHits.length) {
      contractHits.forEach((entry) => {
        results.push({ ...entry, score: 200 })
      })
    } else {
      results.push({
        id: `wallet-${normalized}`,
        label: trimmed,
        subtitle: 'Wallet or contract address — open Radar intelligence',
        href: `/radar?contract=${encodeURIComponent(trimmed)}`,
        category: 'contract',
        searchableText: normalized,
        score: 150,
      })
    }
  }

  const scored = index
    .map((entry) => {
      const matchScore = scoreEntry(entry, tokens)
      if (matchScore <= 0) return { ...entry, score: 0 }
      return {
        ...entry,
        score: matchScore + rankByPreferredChain(entry.chainId ?? null, preferredChainId),
      }
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.label.localeCompare(b.label))

  const seen = new Set<string>()
  const projectSlugsWithToken = new Set<string>()
  const deduped: GlobalSearchResult[] = []

  for (const result of [...results, ...scored].sort((a, b) => b.score - a.score || a.label.localeCompare(b.label))) {
    const key = canonicalSearchIdentityKey(result)
    if (seen.has(key)) continue

    // Avoid project + token rows for the same slug when token already covers that chain.
    if (result.category === 'project') {
      const slug = result.href.replace(/^\/@/, '').replace(/\/$/, '')
      if (projectSlugsWithToken.has(slug.toLowerCase())) continue
    }
    if (result.category === 'token' && result.href) {
      const projectAction = result.actions?.find((a) => a.label === 'Open Project')
      const slug = projectAction?.href?.replace(/^\/@/, '').replace(/\/$/, '')
      if (slug) projectSlugsWithToken.add(slug.toLowerCase())
    }

    seen.add(key)
    deduped.push(result)
    if (deduped.length >= limit) break
  }

  return deduped
}
