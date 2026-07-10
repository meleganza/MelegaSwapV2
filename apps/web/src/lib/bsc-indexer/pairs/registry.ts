import fs from 'fs'
import path from 'path'
import type { OnchainRegistry } from 'lib/onchain-registry'
import { classifyAmmPair, filterDiscoverablePairs, paginatePairs, searchPairs, sortPairsDefault } from './classify'
import type { ClassifiedAmmPair } from '../types'

const REGISTRY_PATH = path.join(process.cwd(), 'public', 'registry', 'onchain', 'bsc-mainnet.json')

let cachedPairs: ClassifiedAmmPair[] | null = null

export function loadRegistryFromDisk(): OnchainRegistry | null {
  try {
    if (!fs.existsSync(REGISTRY_PATH)) return null
    return JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8')) as OnchainRegistry
  } catch {
    return null
  }
}

export function loadClassifiedAmmPairs(): ClassifiedAmmPair[] {
  if (cachedPairs) return cachedPairs
  const registry = loadRegistryFromDisk()
  if (!registry?.amm?.pairs?.length) return []
  cachedPairs = registry.amm.pairs.map(classifyAmmPair)
  return cachedPairs
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
  return paginatePairs(rows, params.page ?? 1, Math.min(100, params.pageSize ?? 50))
}

export function selectTopAmmPair(): ClassifiedAmmPair | undefined {
  const rows = sortPairsDefault(filterDiscoverablePairs(loadClassifiedAmmPairs()))
  return rows.find((p) => p.classification === 'tradeable') ?? rows[0]
}
