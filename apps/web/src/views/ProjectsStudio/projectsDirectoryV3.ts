/**
 * Projects Directory V3 — multi-axis discovery query + pagination constants.
 * Trending is a Sort ranking mode (one control). Status never duplicates it.
 */
import type { ProjectPreviewCard } from './projectsStudioData'

export const PROJECTS_DIRECTORY_VERSION = 'v3' as const
export const PROJECTS_INITIAL_PAGE_SIZE = 28
export const PROJECTS_PAGE_INCREMENT = 28
export const PROJECTS_SCROLL_KEY = 'melega-projects-directory-scroll'

export const DIRECTORY_STATUS = ['All', 'Featured', 'Boosted', 'Verified', 'New'] as const
export const DIRECTORY_CHAINS = [
  'All Chains',
  'BSC',
  'Base',
  'Polygon',
  'Ethereum',
  'Arbitrum',
  'Avalanche',
] as const
export const DIRECTORY_CATEGORIES = [
  'All',
  'AI',
  'DeFi',
  'Gaming',
  'Infrastructure',
  'Meme',
  'RWA',
] as const
export const DIRECTORY_SORT = [
  'Trending',
  'Newest',
  'Price Change',
  'Liquidity',
  'Volume',
  'Holders',
] as const

export type DirectoryStatus = (typeof DIRECTORY_STATUS)[number]
export type DirectoryChain = (typeof DIRECTORY_CHAINS)[number]
export type DirectoryCategory = (typeof DIRECTORY_CATEGORIES)[number]
export type DirectorySort = (typeof DIRECTORY_SORT)[number]

export type ProjectsDirectoryQuery = {
  status: DirectoryStatus
  chain: DirectoryChain
  category: DirectoryCategory
  sort: DirectorySort
  search: string
}

export const DEFAULT_DIRECTORY_QUERY: ProjectsDirectoryQuery = {
  status: 'All',
  chain: 'All Chains',
  category: 'All',
  sort: 'Trending',
  search: '',
}

const CHAIN_MATCH: Record<string, (c: ProjectPreviewCard) => boolean> = {
  BSC: (c) =>
    c.chainId === 56 ||
    c.chains.some((x) => /^(BNB|BSC)$/i.test(x)),
  Base: (c) => c.chainId === 8453 || c.chains.some((x) => /^Base$/i.test(x)),
  Polygon: (c) => c.chainId === 137 || c.chains.some((x) => /^Polygon$/i.test(x)),
  Ethereum: (c) =>
    c.chainId === 1 || c.chains.some((x) => /^(ETH|Ethereum)$/i.test(x)),
  Arbitrum: (c) =>
    c.chainId === 42161 || c.chains.some((x) => /^(ARB|Arbitrum)$/i.test(x)),
  Avalanche: (c) =>
    c.chainId === 43114 || c.chains.some((x) => /^(AVAX|Avalanche)$/i.test(x)),
}

function metricNumber(card: ProjectPreviewCard, label: string): number {
  const raw = card.metrics.find((m) => m.label === label || (label === 'Volume' && m.label === 'Volume 24h'))?.value
  if (!raw || raw === '—' || raw === 'Unavailable') return 0
  const cleaned = raw.replace(/[$,\s]/g, '').toUpperCase()
  const mult = cleaned.endsWith('B') ? 1e9 : cleaned.endsWith('M') ? 1e6 : cleaned.endsWith('K') ? 1e3 : 1
  const n = parseFloat(cleaned)
  return Number.isFinite(n) ? n * mult : 0
}

function sortCards(cards: ProjectPreviewCard[], sort: DirectorySort): ProjectPreviewCard[] {
  const next = [...cards]
  switch (sort) {
    case 'Newest':
      return next.sort((a, b) => (b.listedAtMs ?? 0) - (a.listedAtMs ?? 0))
    case 'Price Change':
      return next.sort((a, b) => Math.abs(b.change24hPct ?? 0) - Math.abs(a.change24hPct ?? 0))
    case 'Liquidity':
      return next.sort((a, b) => metricNumber(b, 'Liquidity') - metricNumber(a, 'Liquidity'))
    case 'Volume':
      return next.sort((a, b) => metricNumber(b, 'Volume') - metricNumber(a, 'Volume'))
    case 'Holders':
      return next.sort((a, b) => metricNumber(b, 'Holders') - metricNumber(a, 'Holders'))
    case 'Trending':
    default:
      return next.sort((a, b) => {
        const rank = (c: ProjectPreviewCard) => {
          if (c.boosted) return 0
          if (c.rankingLayer === 'organic') return 1
          if (c.featured) return 2
          return 3
        }
        const ra = rank(a)
        const rb = rank(b)
        if (ra !== rb) return ra - rb
        const aPct = Math.abs(a.change24hPct ?? 0)
        const bPct = Math.abs(b.change24hPct ?? 0)
        if (aPct !== bPct) return bPct - aPct
        return b.rating - a.rating
      })
  }
}

export function applyProjectsDirectoryQuery(
  cards: ProjectPreviewCard[],
  query: ProjectsDirectoryQuery,
): ProjectPreviewCard[] {
  let next = cards

  switch (query.status) {
    case 'Featured':
      next = next.filter((c) => c.featured === true || c.rankingLayer === 'featured')
      break
    case 'Boosted':
      next = next.filter((c) => c.boosted === true || c.rankingLayer === 'boosted')
      break
    case 'Verified':
      next = next.filter((c) => c.verified === true || c.status === 'verified')
      break
    case 'New':
      next = next.filter((c) => c.status === 'new' || c.registryTier === 'pending')
      break
    default:
      break
  }

  if (query.chain !== 'All Chains') {
    const match = CHAIN_MATCH[query.chain]
    if (match) next = next.filter(match)
  }

  if (query.category !== 'All') {
    const cat = query.category.toLowerCase()
    next = next.filter(
      (c) =>
        c.category.toLowerCase().includes(cat) ||
        (c.sectorTags ?? []).some((t) => t.toLowerCase().includes(cat)),
    )
  }

  const q = query.search.trim().toLowerCase()
  if (q) {
    next = next.filter((c) => {
      const hay = `${c.name} ${c.symbol ?? ''} ${c.slug} ${c.contractAddress ?? ''} ${c.category} ${c.chains.join(' ')}`.toLowerCase()
      return hay.includes(q)
    })
  }

  return sortCards(next, query.sort)
}

export function formatListedAgo(listedAtMs?: number | null, nowMs = Date.now()): string | null {
  if (listedAtMs == null || !Number.isFinite(listedAtMs) || listedAtMs <= 0) return null
  const delta = Math.max(0, nowMs - listedAtMs)
  const mins = Math.floor(delta / 60_000)
  if (mins < 60) return `Listed ${Math.max(1, mins)}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 48) return `Listed ${hours}h ago`
  const days = Math.floor(hours / 24)
  return `Listed ${days}d ago`
}

export function buildSwapHref(opts: {
  address?: string | null
  chainId?: number | null
  source?: string
}): string {
  if (!opts.address) return '/swap'
  const q = new URLSearchParams({
    outputCurrency: opts.address,
    source: opts.source ?? 'projects-directory',
  })
  if (opts.chainId && Number.isFinite(opts.chainId)) {
    q.set('chain', String(opts.chainId))
  }
  return `/swap?${q.toString()}`
}

/** Canonical market identity — same symbol on different chains stays distinct. */
export function projectMarketIdentity(card: Pick<ProjectPreviewCard, 'chainId' | 'contractAddress' | 'id'>): string {
  const addr = card.contractAddress?.toLowerCase()
  if (card.chainId && addr) return `${card.chainId}:${addr}`
  return card.id
}
