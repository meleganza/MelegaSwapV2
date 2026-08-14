export type GlobalSearchCategory =
  | 'page'
  | 'token'
  | 'farm'
  | 'pool'
  | 'project'
  | 'contract'
  | 'collectible'

export type GlobalSearchAction = {
  label: string
  href: string
}

export interface GlobalSearchEntry {
  id: string
  label: string
  subtitle?: string
  href: string
  category: GlobalSearchCategory
  /** Lowercase haystack for matching (label, aliases, addresses, etc.). */
  searchableText: string
  scoreBoost?: number
  /** Canonical identity — never merge same symbol across chains. */
  chainId?: number | null
  address?: string | null
  logoUrl?: string | null
  verified?: boolean
  actions?: GlobalSearchAction[]
}

export interface GlobalSearchResult extends GlobalSearchEntry {
  score: number
}
