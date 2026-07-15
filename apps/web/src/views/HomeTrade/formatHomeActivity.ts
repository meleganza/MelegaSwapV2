import type { CanonicalProtocolActivityRow, ProtocolSourceType } from 'lib/protocolActivityModel'
import { protocolActivityDedupKey } from 'lib/protocolActivityModel'

export interface HomeActivityDisplayRow {
  id: string
  eventLabel?: string
  identity: string
  primaryLine: string
  secondaryLine?: string
  amountText?: string
  wallet?: string
  walletShort?: string
  timestamp: number
  explorerUrl?: string
  sourceLabel: 'AMM' | 'MASTERCHEF' | 'SMARTCHEF'
}

const KNOWN_SYMBOLS: Record<string, string> = {
  '0x963556de0eb8138e97a85f0a86ee0acd159d210b': 'MARCO',
  '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c': 'WBNB',
  '0x55d398326f99059ff775485246999027b3197955': 'USDT',
  '0xe9e7cea3dedca5984780bafc599bd69add087d56': 'BUSD',
  '0x8ac76a51cc950d9822d68b83fe1ad97b32ce580d': 'USDC',
}

const SUPPORTED_EVENT_LABELS = [
  'Swap',
  'Liquidity added',
  'Liquidity removed',
  'Farm deposit',
  'Farm withdrawal',
  'Emergency withdrawal',
  'Pool deposit',
  'Pool withdrawal',
] as const

function normalizeEventType(eventType: string): string {
  return eventType.trim().toUpperCase().replace(/[\s-]+/g, '_')
}

function shortenWallet(address?: string): string | undefined {
  if (!address || address.length < 10) return undefined
  return `${address.slice(0, 6)}…${address.slice(-4)}`
}

function shortenAddress(address?: string): string | undefined {
  if (!address || address.length < 10) return undefined
  return `${address.slice(0, 6)}…${address.slice(-4)}`
}

function resolveSymbol(address?: string): string | undefined {
  if (!address) return undefined
  return KNOWN_SYMBOLS[address.toLowerCase()]
}

function isFullRawAddress(value: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(value.trim())
}

function uniqueSymbols(symbols: string[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const symbol of symbols) {
    const trimmed = symbol.trim()
    if (!trimmed) continue
    const key = trimmed.toUpperCase()
    if (seen.has(key)) continue
    seen.add(key)
    out.push(trimmed)
  }
  return out
}

function resolveEventLabel(sourceType: ProtocolSourceType, eventType: string): string | undefined {
  const normalized = normalizeEventType(eventType)
  if (sourceType === 'amm') {
    if (normalized === 'SWAP') return 'Swap'
    if (normalized === 'MINT' || normalized === 'LIQUIDITYADD') return 'Liquidity added'
    if (normalized === 'BURN' || normalized === 'LIQUIDITYREMOVE') return 'Liquidity removed'
    return undefined
  }
  if (sourceType === 'masterchef') {
    if (normalized === 'DEPOSIT') return 'Farm deposit'
    if (normalized === 'WITHDRAW') return 'Farm withdrawal'
    if (normalized === 'EMERGENCY_WITHDRAW') return 'Emergency withdrawal'
    return undefined
  }
  if (sourceType === 'smartchef') {
    if (normalized === 'DEPOSIT') return 'Pool deposit'
    if (normalized === 'WITHDRAW') return 'Pool withdrawal'
    return undefined
  }
  return undefined
}

function resolveSourceLabel(sourceType: ProtocolSourceType): HomeActivityDisplayRow['sourceLabel'] {
  if (sourceType === 'amm') return 'AMM'
  if (sourceType === 'masterchef') return 'MASTERCHEF'
  return 'SMARTCHEF'
}

function resolvePairSymbols(row: CanonicalProtocolActivityRow): string | undefined {
  const resolved = uniqueSymbols(row.resolvedSymbols ?? [])
  if (resolved.length >= 2) return `${resolved[0]} / ${resolved[1]}`

  const fromAddresses = uniqueSymbols(
    (row.assetAddresses ?? []).map((address) => resolveSymbol(address) ?? '').filter(Boolean),
  )
  if (fromAddresses.length >= 2) return `${fromAddresses[0]} / ${fromAddresses[1]}`

  return undefined
}

function resolveIdentity(row: CanonicalProtocolActivityRow): string {
  const pairSymbols = resolvePairSymbols(row)
  if (pairSymbols) return pairSymbols

  const identity = row.pairOrPoolIdentity?.trim()
  if (identity && !isFullRawAddress(identity)) return identity

  const resolved = uniqueSymbols(row.resolvedSymbols ?? [])
  if (resolved.length === 1) return resolved[0]!

  const fromAddresses = uniqueSymbols(
    (row.assetAddresses ?? []).map((address) => resolveSymbol(address) ?? '').filter(Boolean),
  )
  if (fromAddresses.length === 1) return fromAddresses[0]!

  const shortenedContract = shortenAddress(row.contractAddress)
  if (shortenedContract) return shortenedContract

  if (identity) {
    const left = resolveSymbol(row.assetAddresses?.[0]) ?? shortenAddress(row.assetAddresses?.[0])
    const right = resolveSymbol(row.assetAddresses?.[1]) ?? shortenAddress(row.assetAddresses?.[1])
    if (left && right) return `${left} / ${right}`
    return identity
  }

  return 'Unknown activity'
}

function trimTrailingZeros(value: string): string {
  if (!value.includes('.')) return value
  return value.replace(/\.?0+$/, '')
}

function formatTokenAmount(rawAmount: string, symbol: string): string | undefined {
  const amount = Number(rawAmount)
  if (!Number.isFinite(amount) || amount <= 0) return undefined

  let formatted: string
  if (amount >= 1_000_000) formatted = `${(amount / 1_000_000).toFixed(2)}M`
  else if (amount >= 1_000) formatted = `${(amount / 1_000).toFixed(2)}K`
  else if (amount >= 1) formatted = amount.toFixed(4)
  else if (amount >= 0.0001) formatted = amount.toFixed(6)
  else formatted = amount.toExponential(2)

  const compact = trimTrailingZeros(formatted)
  if (!compact || compact === '0') return undefined
  return `${compact} ${symbol}`.trim()
}

function resolveAmountSymbols(row: CanonicalProtocolActivityRow): string[] {
  const resolved = uniqueSymbols(row.resolvedSymbols ?? [])
  if (resolved.length >= (row.amounts?.length ?? 0)) return resolved

  return (row.amounts ?? []).map((_, index) => {
    const resolvedSymbol = row.resolvedSymbols?.[index]?.trim()
    if (resolvedSymbol) return resolvedSymbol
    const addressSymbol = resolveSymbol(row.assetAddresses?.[index])
    if (addressSymbol) return addressSymbol
    return `Token ${index + 1}`
  })
}

function resolveAmountText(row: CanonicalProtocolActivityRow): string | undefined {
  const amounts = row.amounts ?? []
  if (!amounts.length) return undefined

  const symbols = resolveAmountSymbols(row)
  const parts = amounts
    .map((amount, index) => formatTokenAmount(amount, symbols[index] ?? `Token ${index + 1}`))
    .filter((part): part is string => Boolean(part))

  return parts.length ? parts.join(' · ') : undefined
}

function isValidTransactionHash(hash?: string): hash is string {
  return typeof hash === 'string' && /^0x[a-fA-F0-9]{64}$/.test(hash)
}

function resolveExplorerUrl(row: CanonicalProtocolActivityRow): string | undefined {
  if (!isValidTransactionHash(row.transactionHash)) return undefined
  const existing = row.explorerUrl?.trim()
  if (existing && /^https:\/\/bscscan\.com\/tx\/0x[a-fA-F0-9]{64}$/.test(existing)) return existing
  return `https://bscscan.com/tx/${row.transactionHash.toLowerCase()}`
}

function buildPrimaryLine(eventLabel: string | undefined, identity: string): string {
  if (eventLabel && eventLabel !== identity) return `${eventLabel} · ${identity}`
  return identity
}

function buildSecondaryLine(walletShort?: string, amountText?: string): string | undefined {
  const parts = [walletShort, amountText].filter((part): part is string => Boolean(part))
  return parts.length ? parts.join(' · ') : undefined
}

export function formatHomeActivityRow(row: CanonicalProtocolActivityRow): HomeActivityDisplayRow {
  const eventLabel = resolveEventLabel(row.sourceType, row.eventType)
  const identity = resolveIdentity(row)
  const amountText = resolveAmountText(row)
  const wallet = row.wallet?.trim() || undefined
  const walletShort = shortenWallet(wallet)

  return {
    id: protocolActivityDedupKey(row),
    eventLabel,
    identity,
    primaryLine: buildPrimaryLine(eventLabel, identity),
    secondaryLine: buildSecondaryLine(walletShort, amountText),
    amountText,
    wallet,
    walletShort,
    timestamp: Number.isFinite(row.timestamp) ? row.timestamp : 0,
    explorerUrl: resolveExplorerUrl(row),
    sourceLabel: resolveSourceLabel(row.sourceType),
  }
}

export function formatHomeActivityRows(rows: readonly CanonicalProtocolActivityRow[]): HomeActivityDisplayRow[] {
  return rows.map(formatHomeActivityRow)
}

export const supportedHomeActivityEventLabels = SUPPORTED_EVENT_LABELS

export const homeActivityIdentityFallbackOrder = [
  'pair symbols',
  'farm identity',
  'pool identity',
  'resolved token symbols',
  'shortened contract address',
] as const
