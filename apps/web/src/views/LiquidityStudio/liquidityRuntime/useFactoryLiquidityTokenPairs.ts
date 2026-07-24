/**
 * Factory-enumerated AMM pairs for wallet LP discovery.
 * Extends tracked-pair scanning so historical Melega LPs are balance-gated
 * even when the pair was never user-saved.
 */

import { useMemo } from 'react'
import { ERC20Token } from '@pancakeswap/sdk'
import useSWR from 'swr'
import { getAddress } from '@ethersproject/address'
import type { ClassifiedAmmPair } from 'lib/bsc-indexer/types'
import { MELEGA_CHAIN_ID } from 'lib/bsc-indexer/constants'

type PairsPage = {
  status?: string
  total?: number
  rows?: ClassifiedAmmPair[]
  error?: string
}

const PAGE_SIZE = 100
const MAX_PAGES = 40

async function fetchAllFactoryPairs(): Promise<ClassifiedAmmPair[]> {
  const all: ClassifiedAmmPair[] = []
  let page = 1
  let total = Infinity

  while (all.length < total && page <= MAX_PAGES) {
    const res = await fetch(`/api/indexer/pairs?page=${page}&pageSize=${PAGE_SIZE}`)
    if (!res.ok) {
      if (page === 1) return []
      break
    }
    const data = (await res.json()) as PairsPage
    const rows = data.rows ?? []
    total = typeof data.total === 'number' ? data.total : all.length + rows.length
    all.push(...rows)
    if (rows.length === 0) break
    page += 1
  }

  return all
}

function safeAddress(value?: string): string | null {
  if (!value) return null
  try {
    return getAddress(value)
  } catch {
    return null
  }
}

function pairToTokens(pair: ClassifiedAmmPair): [ERC20Token, ERC20Token] | null {
  const a = safeAddress(pair.token0)
  const b = safeAddress(pair.token1)
  if (!a || !b) return null
  const t0 = new ERC20Token(MELEGA_CHAIN_ID, a, 18, pair.symbol0 || 'T0', pair.symbol0 || 'Token0')
  const t1 = new ERC20Token(MELEGA_CHAIN_ID, b, 18, pair.symbol1 || 'T1', pair.symbol1 || 'Token1')
  return [t0, t1]
}

export function useFactoryLiquidityTokenPairs(enabled: boolean): {
  factoryTokenPairs: [ERC20Token, ERC20Token][]
  factoryPairCount: number | null
  isLoading: boolean
  error: string | null
} {
  const { data, error, isLoading } = useSWR(
    enabled ? 'factory-liquidity-token-pairs-v1' : null,
    fetchAllFactoryPairs,
    { revalidateOnFocus: false, dedupingInterval: 60_000 },
  )

  const factoryTokenPairs = useMemo(() => {
    if (!data?.length) return []
    const seen = new Set<string>()
    const out: [ERC20Token, ERC20Token][] = []
    for (const row of data) {
      const tokens = pairToTokens(row)
      if (!tokens) continue
      const key = [tokens[0].address, tokens[1].address]
        .map((x) => x.toLowerCase())
        .sort()
        .join('-')
      if (seen.has(key)) continue
      seen.add(key)
      out.push(tokens)
    }
    return out
  }, [data])

  return {
    factoryTokenPairs,
    factoryPairCount: data ? data.length : null,
    isLoading: Boolean(enabled) && isLoading && !data,
    error: error ? (error instanceof Error ? error.message : String(error)) : null,
  }
}
