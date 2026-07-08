export type GlobalSearchCategory =
  | 'page'
  | 'token'
  | 'farm'
  | 'pool'
  | 'project'
  | 'contract'
  | 'collectible'

export interface GlobalSearchEntry {
  id: string
  label: string
  subtitle?: string
  href: string
  category: GlobalSearchCategory
  /** Lowercase haystack for matching (label, aliases, addresses, etc.). */
  searchableText: string
  scoreBoost?: number
}

export interface GlobalSearchResult extends GlobalSearchEntry {
  score: number
}
