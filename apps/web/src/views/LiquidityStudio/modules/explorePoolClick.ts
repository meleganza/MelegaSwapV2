/**
 * Explore Pools → Add Liquidity identity.
 * Pair identity is chainId + pair address + token0 + token1.
 * Explorer links use the chain registry origin only. No invented host.
 */
import { ERC20Token, Native, WNATIVE } from '@pancakeswap/sdk'
import type { Currency } from '@pancakeswap/sdk'
import { getMelegaChain, getMelegaFactoryAddress, isMelegaCapabilityEnabled } from 'config/melegaChainRegistry'
import { getChainId } from 'config/chains'
import { lookupCanonicalToken } from 'lib/canonical-token-registry'
import { isAddress } from 'utils'
import { isNativeCurrencyId } from 'hooks/nativeCurrencyIds'

export type LiquidityPairSelection = {
  chainId: number
  pairAddress: string | null
  token0: string
  token1: string
  symbol0?: string
  symbol1?: string
}

export type ExploreAddQuery =
  | { kind: 'empty' }
  | { kind: 'unsupported'; chainId: number | null }
  | { kind: 'pair'; key: string; selection: LiquidityPairSelection }

const EXPLORER_ORIGIN = /^https:\/\/[a-z0-9.-]+(?::\d+)?$/i
const SAFE_SYMBOL = /^[A-Za-z][A-Za-z0-9.]{0,11}$/

/** Accept lowercase and mixed-case input. Never let a bad checksum poison the address cache. */
function checksumAddress(raw: string | undefined | null): string | false {
  if (!raw) return false
  const trimmed = raw.trim()
  if (!/^0x[a-fA-F0-9]{40}$/.test(trimmed)) return false
  return isAddress(trimmed.toLowerCase())
}

/** On-chain wrapped symbols that differ from the SDK label but are the same contract. */
const WRAPPED_SYMBOL_ALIASES: Record<number, ReadonlySet<string>> = {
  1: new Set(['WETH']),
  56: new Set(['WBNB']),
  137: new Set(['WMATIC', 'WPOL']),
  8453: new Set(['WETH']),
  42161: new Set(['WETH']),
  43114: new Set(['WAVAX']),
}

export function isSupportedLiquidityChain(chainId: number): boolean {
  return isMelegaCapabilityEnabled(chainId, 'swap') && Boolean(getMelegaFactoryAddress(chainId))
}

export function parseLiquidityChainId(raw: string | undefined): number | null {
  if (!raw) return null
  const trimmed = raw.trim()
  if (!trimmed) return null
  if (/^\d+$/.test(trimmed)) {
    const id = Number(trimmed)
    return Number.isSafeInteger(id) && id > 0 ? id : null
  }
  const named = getChainId(trimmed)
  return named == null ? null : named
}

function queryValue(raw: unknown): string | undefined {
  if (typeof raw === 'string' && raw.trim()) return raw.trim()
  if (Array.isArray(raw) && typeof raw[0] === 'string' && raw[0].trim()) return raw[0].trim()
  return undefined
}

function safeSymbol(raw: string | undefined): string | undefined {
  const trimmed = raw?.trim()
  if (!trimmed || !SAFE_SYMBOL.test(trimmed)) return undefined
  return trimmed
}

function nativeSymbols(chainId: number): Set<string> {
  const out = new Set<string>()
  const registry = getMelegaChain(chainId)?.nativeCurrency.symbol
  if (registry) out.add(registry.toUpperCase())
  try {
    out.add(Native.onChain(chainId).symbol.toUpperCase())
  } catch {
    // Chain has no SDK native. Registry symbol above is the only native label.
  }
  if (chainId === 137) {
    out.add('MATIC')
    out.add('POL')
  }
  return out
}

function indexedSymbolAllowed(chainId: number, raw: string | undefined): string | undefined {
  const symbol = safeSymbol(raw)
  if (!symbol) return undefined
  if (nativeSymbols(chainId).has(symbol.toUpperCase())) return undefined
  return symbol
}

export function canonicalWrappedSymbol(chainId: number, indexedSymbol?: string): string | null {
  const wrapped = WNATIVE[chainId]
  if (!wrapped) return null
  const indexed = safeSymbol(indexedSymbol)?.toUpperCase()
  const aliases = WRAPPED_SYMBOL_ALIASES[chainId]
  if (indexed && aliases?.has(indexed)) return indexed
  return wrapped.symbol
}

export function explorePoolContractUrl(chainId: number, pairAddress: string | undefined | null): string | null {
  if (!isSupportedLiquidityChain(chainId)) return null
  const chain = getMelegaChain(chainId)
  const origin = chain?.explorer?.replace(/\/+$/, '')
  if (!origin || !EXPLORER_ORIGIN.test(origin)) return null
  const checksum = checksumAddress(pairAddress)
  if (!checksum) return null
  return `${origin}/address/${checksum}`
}

export function buildExplorePoolAddHref(input: {
  chainId?: number
  pairAddress?: string | null
  token0?: string
  token1?: string
  symbol0?: string
  symbol1?: string
}): string {
  const token0 = checksumAddress(input.token0)
  const token1 = checksumAddress(input.token1)
  if (!token0 || !token1 || input.chainId == null || !isSupportedLiquidityChain(input.chainId)) return '/add'
  const params = new URLSearchParams()
  params.set('chain', String(input.chainId))
  const pair = checksumAddress(input.pairAddress)
  if (pair) params.set('pair', pair)
  const symbol0 = indexedSymbolAllowed(input.chainId, input.symbol0)
  const symbol1 = indexedSymbolAllowed(input.chainId, input.symbol1)
  if (symbol0) params.set('symbol0', symbol0)
  if (symbol1) params.set('symbol1', symbol1)
  return `/add/${token0}/${token1}?${params.toString()}`
}

export function liquidityAddDeepLinkPreservesPair(query: {
  view?: unknown
  token0?: unknown
  token1?: unknown
}): boolean {
  const view = queryValue(query.view)
  if (view !== 'add') return false
  const token0 = queryValue(query.token0)
  const token1 = queryValue(query.token1)
  return Boolean(checksumAddress(token0) && checksumAddress(token1))
}

export function parseExploreAddQuery(
  query: Record<string, unknown>,
  walletChainId?: number | null,
): ExploreAddQuery {
  const token0Raw = queryValue(query.token0)
  const token1Raw = queryValue(query.token1)
  const chainRaw = queryValue(query.chain)
  const pairRaw = queryValue(query.pair)
  const symbol0 = queryValue(query.symbol0)
  const symbol1 = queryValue(query.symbol1)
  if (!token0Raw && !token1Raw && !chainRaw && !pairRaw) return { kind: 'empty' }

  const parsedChain = chainRaw ? parseLiquidityChainId(chainRaw) : null
  if (chainRaw && (parsedChain == null || !isSupportedLiquidityChain(parsedChain))) {
    return { kind: 'unsupported', chainId: parsedChain }
  }

  const token0 = checksumAddress(token0Raw)
  const token1 = checksumAddress(token1Raw)
  if (!token0 || !token1) return { kind: 'empty' }

  const chainId =
    parsedChain ?? (walletChainId != null && isSupportedLiquidityChain(walletChainId) ? walletChainId : null)
  if (chainId == null) return { kind: 'unsupported', chainId: parsedChain }
  const pairAddress = checksumAddress(pairRaw) || null
  const selection: LiquidityPairSelection = {
    chainId,
    pairAddress,
    token0,
    token1,
    symbol0: indexedSymbolAllowed(chainId, symbol0),
    symbol1: indexedSymbolAllowed(chainId, symbol1),
  }
  return {
    kind: 'pair',
    key: `${chainId}:${(pairAddress ?? '').toLowerCase()}:${token0.toLowerCase()}:${token1.toLowerCase()}`,
    selection,
  }
}

export function buildLiquidityInputCurrency(
  chainId: number,
  addressOrId: string,
  indexedSymbol?: string,
): Currency | null {
  if (!isSupportedLiquidityChain(chainId)) return null
  const nativeId = addressOrId.trim()
  if (nativeId && isNativeCurrencyId(nativeId, undefined, chainId)) {
    try {
      return Native.onChain(chainId)
    } catch {
      return null
    }
  }
  const checksum = checksumAddress(addressOrId)
  if (!checksum) return null
  const wrapped = WNATIVE[chainId]
  if (wrapped && checksum.toLowerCase() === wrapped.address.toLowerCase()) {
    const symbol = canonicalWrappedSymbol(chainId, indexedSymbol) ?? wrapped.symbol
    return new ERC20Token(chainId, wrapped.address, wrapped.decimals, symbol, wrapped.name)
  }
  const canonical = lookupCanonicalToken(chainId, checksum)
  if (canonical?.symbol && !/^0x/i.test(canonical.symbol)) {
    return new ERC20Token(chainId, checksum, canonical.decimals, canonical.symbol, canonical.name || canonical.symbol)
  }
  const indexed = indexedSymbolAllowed(chainId, indexedSymbol)
  if (indexed) return new ERC20Token(chainId, checksum, 18, indexed, indexed)
  return new ERC20Token(chainId, checksum, 18, 'Token', 'Token')
}

export function resolveLiquidityInputDisplay(input: {
  chainId: number
  addressOrId: string
  indexedSymbol?: string
  walletChainId?: number | null
  live?: Currency | null
}): Currency | null {
  const seeded = buildLiquidityInputCurrency(input.chainId, input.addressOrId, input.indexedSymbol)
  if (!seeded) return input.live ?? null
  if (input.walletChainId == null || input.walletChainId !== input.chainId) return seeded
  const live = input.live
  if (!live || live.chainId !== input.chainId) return seeded
  if (seeded.isNative && live.isNative) return live
  if (seeded.isToken && live.isToken && live.address.toLowerCase() === seeded.address.toLowerCase()) {
    const wrapped = WNATIVE[input.chainId]
    const alias = canonicalWrappedSymbol(input.chainId, input.indexedSymbol)
    if (wrapped && live.address.toLowerCase() === wrapped.address.toLowerCase() && alias && alias !== live.symbol) {
      return seeded
    }
    return live
  }
  return seeded
}

/** True when a manual token pick is a different asset than the explore selection. */
export function manualCurrencyReplacesSelection(
  selection: LiquidityPairSelection,
  currency: Currency,
  side: 'A' | 'B',
): boolean {
  const expected = (side === 'A' ? selection.token0 : selection.token1).toLowerCase()
  if (!currency.isToken) return true
  if (currency.chainId !== selection.chainId) return true
  return currency.address.toLowerCase() !== expected
}
