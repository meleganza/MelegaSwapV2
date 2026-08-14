/**
 * Factory-enumerated AMM pairs for wallet LP discovery (BNB indexer).
 * Extends tracked-pair scanning so historical Melega LPs are balance-gated
 * even when the pair was never user-saved.
 *
 * Base / non-BNB chains must NOT hit the BSC indexer — that freezes hydration.
 */

import { useMemo } from 'react'
import { CurrencyAmount, ERC20Token, Pair } from '@pancakeswap/sdk'
import useSWR from 'swr'
import { getAddress } from '@ethersproject/address'
import { MELEGA_CHAIN_ID } from 'lib/bsc-indexer/constants'

type WalletPositionPair = {
  pairAddress: string
  token0: string
  token1: string
  symbol0?: string
  symbol1?: string
  token0Decimals?: number
  token1Decimals?: number
  reserve0Raw?: string
  reserve1Raw?: string
  lpBalanceRaw?: string
}

type PositionsResponse = {
  status?: string
  scannedPairs?: number
  rows?: WalletPositionPair[]
  error?: string
}

const FACTORY_FETCH_TIMEOUT_MS = 10_000

function isBnbFactoryChain(chainId?: number): boolean {
  return chainId === 56 || chainId === 97
}

async function fetchWalletFactoryPairs(url: string): Promise<PositionsResponse> {
  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null
  const timer = controller != null ? setTimeout(() => controller.abort(), FACTORY_FETCH_TIMEOUT_MS) : null

  try {
    const res = await fetch(url, { signal: controller?.signal })
    if (!res.ok) throw new Error(`Wallet LP discovery failed (${res.status})`)
    return (await res.json()) as PositionsResponse
  } catch {
    throw new Error('Wallet LP discovery timed out')
  } finally {
    if (timer != null) clearTimeout(timer)
  }
}

function safeAddress(value?: string): string | null {
  if (!value) return null
  try {
    return getAddress(value)
  } catch {
    return null
  }
}

function pairToTokens(pair: WalletPositionPair): [ERC20Token, ERC20Token] | null {
  const a = safeAddress(pair.token0)
  const b = safeAddress(pair.token1)
  if (!a || !b) return null
  const t0 = new ERC20Token(
    MELEGA_CHAIN_ID,
    a,
    pair.token0Decimals ?? 18,
    pair.symbol0 || 'T0',
    pair.symbol0 || 'Token0',
  )
  const t1 = new ERC20Token(
    MELEGA_CHAIN_ID,
    b,
    pair.token1Decimals ?? 18,
    pair.symbol1 || 'T1',
    pair.symbol1 || 'Token1',
  )
  return [t0, t1]
}

export function useFactoryLiquidityTokenPairs(
  enabled: boolean,
  chainId?: number,
  account?: string,
  retryNonce = 0,
): {
  factoryTokenPairs: [ERC20Token, ERC20Token][]
  factoryLpBalancesRaw: Record<string, string>
  factoryPairsByAddress: Record<string, Pair>
  factoryPairAddressByTokenKey: Record<string, string>
  factoryPairCount: number | null
  isLoading: boolean
  error: string | null
  factoryEnabled: boolean
} {
  const factoryEnabled = Boolean(enabled && isBnbFactoryChain(chainId))
  const { data, error, isLoading } = useSWR(
    factoryEnabled && account
      ? `/api/indexer/liquidity-positions?account=${encodeURIComponent(account)}&retry=${retryNonce}`
      : null,
    fetchWalletFactoryPairs,
    { revalidateOnFocus: false, dedupingInterval: 60_000 },
  )

  const factoryTokenPairs = useMemo(() => {
    if (!data?.rows?.length) return []
    const seen = new Set<string>()
    const out: [ERC20Token, ERC20Token][] = []
    for (const row of data.rows) {
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

  const factoryLpBalancesRaw = useMemo(() => {
    const balances: Record<string, string> = {}
    for (const row of data?.rows ?? []) {
      const pairAddress = safeAddress(row.pairAddress)
      if (!pairAddress || !row.lpBalanceRaw || row.lpBalanceRaw === '0') continue
      balances[pairAddress.toLowerCase()] = row.lpBalanceRaw
    }
    return balances
  }, [data])

  const factoryPairsByAddress = useMemo(() => {
    const pairs: Record<string, Pair> = {}
    for (const row of data?.rows ?? []) {
      const pairAddress = safeAddress(row.pairAddress)
      const tokens = pairToTokens(row)
      if (!pairAddress || !tokens || row.reserve0Raw == null || row.reserve1Raw == null) continue
      try {
        pairs[pairAddress.toLowerCase()] = new Pair(
          CurrencyAmount.fromRawAmount(tokens[0], row.reserve0Raw),
          CurrencyAmount.fromRawAmount(tokens[1], row.reserve1Raw),
        )
      } catch {
        // A live pair fetch remains available when a stale registry row cannot be hydrated.
      }
    }
    return pairs
  }, [data])

  const factoryPairAddressByTokenKey = useMemo(() => {
    const addresses: Record<string, string> = {}
    for (const row of data?.rows ?? []) {
      const pairAddress = safeAddress(row.pairAddress)
      const tokens = pairToTokens(row)
      if (!pairAddress || !tokens) continue
      const key = [tokens[0].address, tokens[1].address]
        .map((address) => address.toLowerCase())
        .sort()
        .join('-')
      addresses[key] = pairAddress
    }
    return addresses
  }, [data])

  return {
    factoryTokenPairs,
    factoryLpBalancesRaw,
    factoryPairsByAddress,
    factoryPairAddressByTokenKey,
    factoryPairCount: data?.scannedPairs ?? null,
    isLoading: factoryEnabled && isLoading && !data,
    error: error ? (error instanceof Error ? error.message : String(error)) : null,
    factoryEnabled,
  }
}
