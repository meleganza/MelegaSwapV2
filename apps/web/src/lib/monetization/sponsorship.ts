/**
 * Sponsored / Featured / Trending suggestion labels for Search, Swap, Token selector.
 * Presentation only — does not alter token lists or swap routing.
 */
export type SuggestionKind = 'featured' | 'trending' | 'sponsored'

export type TokenSuggestion = {
  kind: SuggestionKind
  label: 'Featured' | 'Trending' | 'Sponsored'
  symbol: string
  name: string
  /** Optional contract — when present, selector can deep-link */
  address: `0x${string}` | null
  chainId: number
  href?: string
}

/** RC Sprint 1 curated suggestions — factual Melega identities, clearly labelled. */
export const TOKEN_SUGGESTIONS: readonly TokenSuggestion[] = [
  {
    kind: 'featured',
    label: 'Featured',
    symbol: 'MARCO',
    name: 'MARCO',
    address: '0x963556de0eb8138E97A85F0A86eE0acD159D210b',
    chainId: 56,
    href: '/project-hq/marco',
  },
  {
    kind: 'trending',
    label: 'Trending',
    symbol: 'WBNB',
    name: 'Wrapped BNB',
    address: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
    chainId: 56,
  },
  {
    kind: 'sponsored',
    label: 'Sponsored',
    symbol: 'USDT',
    name: 'Tether USD',
    address: '0x55d398326f99059fF775485246999027B3197955',
    chainId: 56,
  },
] as const

export function suggestionsForQuery(query: string): TokenSuggestion[] {
  const q = query.trim().toLowerCase()
  if (!q) return [...TOKEN_SUGGESTIONS]
  return TOKEN_SUGGESTIONS.filter(
    (s) =>
      s.symbol.toLowerCase().includes(q) ||
      s.name.toLowerCase().includes(q) ||
      (s.address && s.address.toLowerCase().includes(q)),
  )
}

export function suggestionLabelCopy(kind: SuggestionKind): string {
  if (kind === 'featured') return 'Featured'
  if (kind === 'trending') return 'Trending'
  return 'Sponsored'
}
