/**
 * LIST_MODULE_001 — hero statistics.
 * Never hardcode showcase numbers. Unavailable → null → UI shows "—".
 */
export type ListHeroStatKey = 'listedTokens' | 'projects' | 'marketCap' | 'networks'

export type ListHeroStats = Record<ListHeroStatKey, string | null>

export function useListHeroStats(): ListHeroStats {
  /* Live aggregate feed not wired for MODULE_001 — honest unavailable state. */
  return {
    listedTokens: null,
    projects: null,
    marketCap: null,
    networks: null,
  }
}

export function formatListHeroStat(value: string | null | undefined): string {
  if (value == null || value === '') return '—'
  return value
}
