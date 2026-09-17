import fs from 'fs'
import path from 'path'
import type { OnchainRegistry } from 'lib/onchain-registry'
import { classifyAmmPair, filterDiscoverablePairs, paginatePairs, searchPairs, sortPairsDefault } from './classify'
import type { ClassifiedAmmPair } from '../types'
import { loadRegistryFromDisk, resolveOnchainRegistry } from '../registry/store'

/** Default page for explorer-style pair lists. */
export const DEFAULT_AMM_PAIRS_PAGE_SIZE = 50
/**
 * Observation consumers request the Factory tradeable universe in one page.
 * The on-chain registry is ~516 pairs / ~505 tradeable — a 100-row cap silently
 * dropped ~80% of that universe from trending pair-index membership.
 */
export const MAX_AMM_PAIRS_PAGE_SIZE = 600

export function resolveAmmPairsPageSize(pageSize?: number): number {
  const requested = Number(pageSize)
  if (!Number.isFinite(requested) || requested <= 0) return DEFAULT_AMM_PAIRS_PAGE_SIZE
  return Math.min(MAX_AMM_PAIRS_PAGE_SIZE, Math.floor(requested))
}

const REGISTRY_PATH = path.join(process.cwd(), 'public', 'registry', 'onchain', 'bsc-mainnet.json')

let cachedPairs: ClassifiedAmmPair[] | null = null
let cachedRegistrySource: string | null = null

export function loadRegistryFromDiskFile(): OnchainRegistry | null {
  return loadRegistryFromDisk()
}

export async function loadRegistryAsync(): Promise<{ registry: OnchainRegistry | null; source: string }> {
  const resolved = await resolveOnchainRegistry()
  if (resolved.registry) return { registry: resolved.registry, source: resolved.source }
  if (!fs.existsSync(REGISTRY_PATH)) return { registry: null, source: 'none' }
  try {
    return {
      registry: JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8')) as OnchainRegistry,
      source: 'disk',
    }
  } catch {
    return { registry: null, source: 'none' }
  }
}

export function loadClassifiedAmmPairs(): ClassifiedAmmPair[] {
  if (cachedPairs) return cachedPairs
  const registry = loadRegistryFromDiskFile()
  if (!registry?.amm?.pairs?.length) return []
  cachedPairs = registry.amm.pairs.map(classifyAmmPair)
  cachedRegistrySource = 'disk'
  return cachedPairs
}

export async function loadClassifiedAmmPairsAsync(): Promise<{
  pairs: ClassifiedAmmPair[]
  source: string
}> {
  if (cachedPairs && cachedRegistrySource) {
    return { pairs: cachedPairs, source: cachedRegistrySource }
  }
  const { registry, source } = await loadRegistryAsync()
  if (!registry?.amm?.pairs?.length) return { pairs: [], source }
  cachedPairs = registry.amm.pairs.map(classifyAmmPair)
  cachedRegistrySource = source
  return { pairs: cachedPairs, source }
}

export function queryAmmPairs(params: {
  q?: string
  page?: number
  pageSize?: number
  classification?: string
}) {
  let rows = filterDiscoverablePairs(loadClassifiedAmmPairs())
  if (params.classification) rows = rows.filter((p) => p.classification === params.classification)
  if (params.q) rows = searchPairs(rows, params.q)
  rows = sortPairsDefault(rows)
  return paginatePairs(rows, params.page ?? 1, resolveAmmPairsPageSize(params.pageSize))
}

export async function queryAmmPairsAsync(params: {
  q?: string
  page?: number
  pageSize?: number
  classification?: string
}) {
  const { pairs, source } = await loadClassifiedAmmPairsAsync()
  let rows = filterDiscoverablePairs(pairs)
  if (params.classification) rows = rows.filter((p) => p.classification === params.classification)
  if (params.q) rows = searchPairs(rows, params.q)
  rows = sortPairsDefault(rows)
  return { ...paginatePairs(rows, params.page ?? 1, resolveAmmPairsPageSize(params.pageSize)), source }
}

export function selectTopAmmPair(): ClassifiedAmmPair | undefined {
  const rows = sortPairsDefault(filterDiscoverablePairs(loadClassifiedAmmPairs()))
  return rows.find((p) => p.classification === 'tradeable') ?? rows[0]
}

export function clearAmmPairCache() {
  cachedPairs = null
  cachedRegistrySource = null
}
