import type { EnrichedProjectRecord } from 'registry/projects/discovery'
import type { TrendingFilterChip } from '../trendingStudioData'

export const TRENDING_RUNTIME_SCHEMA = 'melega.trending-runtime.v1' as const

export interface TrendingMachinePayload {
  schema: typeof TRENDING_RUNTIME_SCHEMA
  generatedAt: string
  filter: TrendingFilterChip
  indexedProjects: number
  cards: Array<{
    rank: number
    slug: string
    symbol: string
    signal: string
    provenance: string
    projectHref: string
    radarHref?: string
  }>
  availability: {
    whaleMonitor: 'unavailable'
    smartMoney: 'unavailable'
    marketMomentum: 'unavailable' | 'partial'
  }
  featured?: {
    slug: string
    runtimeSignal: string
    score: number
    confidence: number
  }
}

export function buildTrendingMachine(input: {
  projects: EnrichedProjectRecord[]
  filter: TrendingFilterChip
  cards: Array<{ rank: number; slug: string; symbol: string; signal: string; provenance: string; projectHref: string; radarHref?: string }>
  featured?: { slug: string; runtimeSignal: string; score: number; confidence: number }
}): TrendingMachinePayload {
  return {
    schema: TRENDING_RUNTIME_SCHEMA,
    generatedAt: new Date().toISOString(),
    filter: input.filter,
    indexedProjects: input.projects.length,
    cards: input.cards,
    availability: {
      whaleMonitor: 'unavailable',
      smartMoney: 'unavailable',
      marketMomentum: input.projects.length > 0 ? 'partial' : 'unavailable',
    },
    featured: input.featured,
  }
}
