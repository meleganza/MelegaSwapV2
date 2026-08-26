/**
 * Factory-enumerated AMM pairs for wallet LP discovery on every LIVE Melega chain.
 * Extends tracked-pair scanning so historical Melega LPs are balance-gated
 * even when the pair was never user-saved.
 *
 * BNB retains the historical index; the other chains use their canonical factory.
 */

import { useMemo } from 'react'
import { CurrencyAmount, ERC20Token, Pair } from '@pancakeswap/sdk'
import useSWR from 'swr'
import { getAddress } from '@ethersproject/address'
import { isMelegaCapabilityEnabled } from 'config/melegaChainRegistry'

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

export type FactoryLiquidityPairEntry = {
  tokens: [ERC20Token, ERC20Token]
  pairAddress: string
}

const FACTORY_FETCH_TIMEOUT_MS = 25_000

function isSupportedFactoryChain(chainId?: number): chainId is number {
  return chainId != null && isMelegaCapabilityEnabled(chainId, 'swap')
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

function pairToTokens(pair: WalletPositionPair, chainId: number): [ERC20Token, ERC20Token] | null {
  const a = safeAddress(pair.token0)
  const b = safeAddress(pair.token1)
  if (!a || !b) return null
  const t0 = new ERC20Token(
    chainId,
    a,
    pair.token0Decimals ?? 18,
    pair.symbol0 || 'T0',
    pair.symbol0 || 'Token0',
  )
  const t1 = new ERC20Token(
    chainId,
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
  factoryPairEntries: FactoryLiquidityPairEntry[]
  factoryLpBalancesRaw: Record<string, string>
  factoryPairsByAddress: Record<string, Pair>
  factoryPairAddressByTokenKey: Record<string, string>
  factoryPairCount: number | null
  isLoading: boolean
  error: string | null
  factoryEnabled: boolean
} {
  const factoryEnabled = Boolean(enabled && isSupportedFactoryChain(chainId))
  const { data, error, isLoading } = useSWR(
    factoryEnabled && account
      ? `/api/indexer/liquidity-positions?account=${encodeURIComponent(account)}&chainId=${chainId}&retry=${retryNonce}`
      : null,
    fetchWalletFactoryPairs,
    { revalidateOnFocus: false, dedupingInterval: 60_000 },
  )

  const factoryTokenPairs = useMemo(() => {
    if (!data?.rows?.length) return []
    const seen = new Set<string>()
    const out: [ERC20Token, ERC20Token][] = []
    for (const row of data.rows) {
      const tokens = pairToTokens(row, chainId as number)
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
  }, [data, chainId])

  const factoryPairEntries = useMemo(() => {
    const seen = new Set<string>()
    const out: FactoryLiquidityPairEntry[] = []
    for (const row of data?.rows ?? []) {
      const pairAddress = safeAddress(row.pairAddress)
      const tokens = pairToTokens(row, chainId as number)
      if (!pairAddress || !tokens) continue
      const key = pairAddress.toLowerCase()
      if (seen.has(key)) continue
      seen.add(key)
      out.push({ tokens, pairAddress })
    }
    return out
  }, [data, chainId])

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
      const tokens = pairToTokens(row, chainId as number)
      if (!pairAddress || !tokens || row.reserve0Raw == null || row.reserve1Raw == null) continue
      try {
        pairs[pairAddress.toLowerCase()] = new Pair(
          CurrencyAmount.fromRawAmount(tokens[0], row.reserve0Raw),
          CurrencyAmount.fromRawAmount(tokens[1], row.reserve1Raw),
        )
      } catch {
        // One malformed legacy row must not hide sibling wallet positions.
      }
    }
    return pairs
  }, [data, chainId])

  const factoryPairAddressByTokenKey = useMemo(() => {
    const addresses: Record<string, string> = {}
    for (const row of data?.rows ?? []) {
      const pairAddress = safeAddress(row.pairAddress)
      const tokens = pairToTokens(row, chainId as number)
      if (!pairAddress || !tokens) continue
      const key = [tokens[0].address, tokens[1].address]
        .map((address) => address.toLowerCase())
        .sort()
        .join('-')
      addresses[key] = pairAddress
    }
    return addresses
  }, [data, chainId])

  return {
    factoryTokenPairs,
    factoryPairEntries,
    factoryLpBalancesRaw,
    factoryPairsByAddress,
    factoryPairAddressByTokenKey,
    factoryPairCount: data?.scannedPairs ?? null,
    isLoading: factoryEnabled && isLoading && !data,
    error: error ? (error instanceof Error ? error.message : String(error)) : null,
    factoryEnabled,
  }
}
