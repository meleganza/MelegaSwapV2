/**
 * LIST hero statistics — real registry / market counts only.
 * Never hardcode showcase numbers. Unavailable → null → UI shows "—".
 */
import { useMemo } from 'react'
import useSWR from 'swr'
import { SUPPORT_MULTI_CHAINS } from 'config/constants/supportChains'
import defaultTokenList from 'config/constants/tokenLists/pancake-default.tokenlist.json'
import { getAllProjects } from 'registry/projects/getAllProjects'

export type ListHeroStatKey = 'listedTokens' | 'projects' | 'markets' | 'networks'

export type ListHeroStats = Record<ListHeroStatKey, string | null>

type PairCountPayload = { rows?: unknown[]; total?: number; count?: number }

async function fetchTradeablePairCount(): Promise<number | null> {
  try {
    const res = await fetch('/api/indexer/pairs?pageSize=1&classification=tradeable')
    if (!res.ok) return null
    const json = (await res.json()) as PairCountPayload
    if (json.total != null && Number.isFinite(Number(json.total))) return Number(json.total)
    if (json.count != null && Number.isFinite(Number(json.count))) return Number(json.count)
    if (Array.isArray(json.rows)) return json.rows.length
    return null
  } catch {
    return null
  }
}

function countListedTokens(): number {
  const tokens = (defaultTokenList.tokens ?? []) as { chainId?: number }[]
  return tokens.filter((t) => t.chainId === 56).length
}

function countProjects(): number {
  return getAllProjects().length
}

function countNetworks(): number {
  // Visible Melega product networks — BSC is the live DEX venue.
  return Math.max(1, SUPPORT_MULTI_CHAINS.filter((id) => id === 56).length)
}

export function useListHeroStats(): ListHeroStats {
  const { data: markets } = useSWR('list-hero-markets', fetchTradeablePairCount, {
    revalidateOnFocus: false,
    dedupingInterval: 120_000,
  })

  return useMemo(() => {
    const listed = countListedTokens()
    const projects = countProjects()
    const networks = countNetworks()
    return {
      listedTokens: listed > 0 ? String(listed) : null,
      projects: projects > 0 ? String(projects) : null,
      markets: markets != null && markets > 0 ? String(markets) : null,
      networks: networks > 0 ? String(networks) : null,
    }
  }, [markets])
}

export function formatListHeroStat(value: string | null | undefined): string {
  if (value == null || value === '') return '—'
  return value
}
