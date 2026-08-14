/**
 * Canonical Listed Projects count for Home KPIs.
 * Unique valid indexed project tokens — not the static Featured/Project Page catalog.
 */

import defaultTokenList from 'config/constants/tokenLists/pancake-default.tokenlist.json'
import { getTradeSurfaceAssets, getCanonicalIndexedAssets } from 'lib/dex-asset-index'
import {
  MELEGA_FACTORY_BSC,
  MELEGA_ROUTER_BSC,
} from 'lib/bsc-indexer/constants'

const ZERO = '0x0000000000000000000000000000000000000000'
const SYSTEM_CONTRACTS = new Set([
  MELEGA_FACTORY_BSC.toLowerCase(),
  MELEGA_ROUTER_BSC.toLowerCase(),
  ZERO,
])

/** Native-adjacent quote infrastructure — not “projects” for the Listed Projects KPI. */
const QUOTE_INFRA = new Set([
  '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c', // WBNB
  '0x55d398326f99059ff775485246999027b3197955', // USDT
  '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d', // USDC
  '0xe9e7cea3dedca5984780bafc599bd69add087d56', // BUSD
  '0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c', // BTCB
  '0x2170ed0880ac9a755fd29b2688956bd959f933f8', // ETH
])

type TokenListEntry = {
  chainId?: number
  address?: string
  symbol?: string
  name?: string
}

export type ListedProjectsCountResult = {
  chainId: 56
  rawDiscovered: number
  validTokenContracts: number
  duplicatesRemoved: number
  lpOrSystemExcluded: number
  quoteInfraExcluded: number
  finalCount: number
  provenance: string
  sources: string[]
  updatedAt: string
}

function isLpSymbol(symbol: string): boolean {
  const s = symbol.trim()
  return s.includes('-') || s.includes('/') || /lp$/i.test(s)
}

/**
 * Measure unique indexed project tokens eligible for DEX discovery.
 * Dedupes by chainId + normalized address. Does not hardcode a target count.
 */
export function measureListedProjectsCount(): ListedProjectsCountResult {
  const seen = new Set<string>()
  let raw = 0
  let duplicates = 0
  let excludedLpSystem = 0
  let excludedQuote = 0

  const consider = (address: string | undefined, symbol: string | undefined, sourceTag: string) => {
    raw += 1
    if (!address) {
      excludedLpSystem += 1
      return
    }
    const addr = address.toLowerCase()
    if (!/^0x[a-f0-9]{40}$/.test(addr) || SYSTEM_CONTRACTS.has(addr)) {
      excludedLpSystem += 1
      return
    }
    if (symbol && isLpSymbol(symbol)) {
      excludedLpSystem += 1
      return
    }
    if (QUOTE_INFRA.has(addr)) {
      excludedQuote += 1
      return
    }
    if (seen.has(addr)) {
      duplicates += 1
      return
    }
    seen.add(addr)
    void sourceTag
  }

  for (const t of (defaultTokenList.tokens ?? []) as TokenListEntry[]) {
    if (t.chainId !== 56) continue
    consider(t.address, t.symbol, 'tokenlist')
  }
  for (const a of getTradeSurfaceAssets()) {
    consider(a.address, a.symbol, 'trade-surface')
  }
  for (const a of getCanonicalIndexedAssets()) {
    consider(a.address, a.symbol, 'canonical-index')
  }

  return {
    chainId: 56,
    rawDiscovered: raw,
    validTokenContracts: seen.size,
    duplicatesRemoved: duplicates,
    lpOrSystemExcluded: excludedLpSystem,
    quoteInfraExcluded: excludedQuote,
    finalCount: seen.size,
    provenance:
      'Union of pancake-default tokenlist (56) + dex-asset-index trade/canonical surfaces; deduped by address; LP/system/quote-infra excluded',
    sources: ['pancake-default.tokenlist.json', 'dex-asset-index'],
    updatedAt: new Date().toISOString(),
  }
}

export function getListedProjectsCount(): number {
  return measureListedProjectsCount().finalCount
}
