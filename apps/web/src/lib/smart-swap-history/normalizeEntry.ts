/**
 * Normalize authoritative wallet / handoff snapshots into SmartSwapHistoryEntry.
 * Never invents fees, gas, routes, or KERL rewards.
 */

import type {
  SmartSwapHistoryEconomicAttributionState,
  SmartSwapHistoryEntry,
  SmartSwapHistoryExecutionStatus,
  SmartSwapHistoryFeeState,
  SmartSwapHistoryHopDisplay,
} from './types'

/** Minimal wallet tx shape — avoids importing Redux into pure tests. */
export interface SmartSwapHistoryTxSnapshot {
  hash: string
  type?: string
  from?: string
  summary?: string | null
  addedTime?: number
  confirmedTime?: number
  receipt?: { status?: number } | null
  settlementHandoffContext?: {
    amount?: string
    fee?: string
    asset?: { symbol?: string; address?: string }
    kerlConstitutional?: { correlationId?: string; kerlPackageId?: string } | null
    smartRouter?: {
      protocolFeeBps?: number
      smartRouterSwapRouted?: Record<string, unknown>
    } | null
  } | null
  /** Optional recorded route path symbols — only when system stored them. */
  recordedRouteSymbols?: string[] | null
  /** Optional recorded gas used — only when factual; never estimated. */
  gasUsed?: string | null
  failureReason?: string | null
}

function parseSwapSummary(summary?: string | null): {
  inputAmount: string | null
  inputSymbol: string | null
  outputAmount: string | null
  outputSymbol: string | null
} {
  if (!summary) {
    return { inputAmount: null, inputSymbol: null, outputAmount: null, outputSymbol: null }
  }
  // e.g. "Swap 100 USDT for 0.98 BNB"
  const m = summary.match(/Swap\s+([\d.,]+)\s+(\S+)\s+for\s+([\d.,]+)\s+(\S+)/i)
  if (m) {
    return {
      inputAmount: m[1],
      inputSymbol: m[2].replace(/\.+$/, ''),
      outputAmount: m[3],
      outputSymbol: m[4].replace(/\.+$/, ''),
    }
  }
  const loose = summary.match(/Swap\s+(.+?)\s+for\s+(.+)/i)
  if (loose) {
    const left = loose[1].trim().split(/\s+/)
    const right = loose[2].trim().split(/\s+/)
    return {
      inputAmount: left.length >= 2 ? left.slice(0, -1).join(' ') : null,
      inputSymbol: left.length >= 1 ? left[left.length - 1] : null,
      outputAmount: right.length >= 2 ? right.slice(0, -1).join(' ') : null,
      outputSymbol: right.length >= 1 ? right[right.length - 1] : null,
    }
  }
  return { inputAmount: null, inputSymbol: null, outputAmount: null, outputSymbol: null }
}

function executionStatus(tx: SmartSwapHistoryTxSnapshot): SmartSwapHistoryExecutionStatus {
  if (!tx.receipt) return 'PENDING'
  if (tx.receipt.status === 1) return 'SUCCESS'
  if (tx.receipt.status === 0) return 'FAILED'
  return 'UNAVAILABLE'
}

function feeState(tx: SmartSwapHistoryTxSnapshot): {
  protocolFee: string | null
  feeState: SmartSwapHistoryFeeState
} {
  const fee = tx.settlementHandoffContext?.fee
  const symbol = tx.settlementHandoffContext?.asset?.symbol
  if (fee && symbol) {
    return { protocolFee: `${fee} ${symbol}`, feeState: 'AVAILABLE' }
  }
  if (fee) {
    return { protocolFee: fee, feeState: 'PARTIAL' }
  }
  if (tx.settlementHandoffContext?.smartRouter?.protocolFeeBps != null) {
    return {
      protocolFee: `${tx.settlementHandoffContext.smartRouter.protocolFeeBps} bps`,
      feeState: 'PARTIAL',
    }
  }
  return { protocolFee: null, feeState: 'UNAVAILABLE' }
}

function kerlState(tx: SmartSwapHistoryTxSnapshot): SmartSwapHistoryEconomicAttributionState {
  const kerl = tx.settlementHandoffContext?.kerlConstitutional
  if (kerl?.kerlPackageId || kerl?.correlationId) return 'RECORDED'
  if (tx.settlementHandoffContext) return 'PENDING'
  return 'UNAVAILABLE'
}

function routeMemory(tx: SmartSwapHistoryTxSnapshot): {
  routeId: string | null
  routeHops: SmartSwapHistoryHopDisplay[]
  liquiditySources: string[]
} {
  // Only show used-route memory when the system recorded path symbols.
  // Never claim "best route" or invent hops after the fact.
  const symbols = tx.recordedRouteSymbols?.filter(Boolean)
  if (symbols && symbols.length >= 2) {
    const hops: SmartSwapHistoryHopDisplay[] = []
    hops.push({ kind: 'token', label: symbols[0] })
    for (let i = 0; i < symbols.length - 1; i++) {
      hops.push({ kind: 'pool', label: `${symbols[i]}/${symbols[i + 1]}` })
      if (i < symbols.length - 2) hops.push({ kind: 'token', label: symbols[i + 1] })
    }
    hops.push({ kind: 'token', label: symbols[symbols.length - 1] })
    return {
      routeId: `recorded-${symbols.join('-')}`,
      routeHops: hops,
      liquiditySources: hops.filter((h) => h.kind === 'pool').map((h) => h.label),
    }
  }
  return { routeId: null, routeHops: [], liquiditySources: [] }
}

export function normalizeSmartSwapHistoryEntry(tx: SmartSwapHistoryTxSnapshot): SmartSwapHistoryEntry | null {
  if (tx.type && tx.type !== 'swap') return null

  const parsed = parseSwapSummary(tx.summary)
  const ctx = tx.settlementHandoffContext
  const inputSymbol = parsed.inputSymbol ?? ctx?.asset?.symbol ?? '—'
  const outputSymbol = parsed.outputSymbol ?? '—'
  const inputAmount = parsed.inputAmount ?? ctx?.amount ?? null
  const outputAmount = parsed.outputAmount
  const status = executionStatus(tx)
  const fees = feeState(tx)
  const route = routeMemory(tx)
  const ts = tx.confirmedTime ?? tx.addedTime
  const timestamp = ts ? new Date(ts).toISOString() : null
  const gasUsed = tx.gasUsed && tx.gasUsed !== '' ? tx.gasUsed : null

  return {
    transactionHash: tx.hash,
    timestamp,
    inputToken: {
      symbol: inputSymbol,
      address: ctx?.asset?.address ?? null,
    },
    outputToken: {
      symbol: outputSymbol,
      address: null,
    },
    inputAmount,
    outputAmount,
    routeId: route.routeId,
    routeHops: route.routeHops,
    liquiditySources: route.liquiditySources,
    executionStatus: status,
    failureReason: status === 'FAILED' ? tx.failureReason ?? 'Failed' : null,
    protocolFee: fees.protocolFee,
    feeState: fees.feeState,
    economicAttributionState: kerlState(tx),
    gasUsed,
    gasState: gasUsed ? 'AVAILABLE' : 'UNAVAILABLE',
    source: 'wallet',
    freshness: timestamp,
    explorerHint: tx.hash,
  }
}

export function normalizeSmartSwapHistoryEntries(
  txs: SmartSwapHistoryTxSnapshot[],
  account?: string | null,
): SmartSwapHistoryEntry[] {
  const filtered = account
    ? txs.filter((tx) => !tx.from || tx.from.toLowerCase() === account.toLowerCase())
    : txs
  const entries: SmartSwapHistoryEntry[] = []
  for (const tx of filtered) {
    const entry = normalizeSmartSwapHistoryEntry(tx)
    if (entry) entries.push(entry)
  }
  return entries
}
