import type { Transaction } from 'state/info/types'
import { TransactionType } from 'state/info/types'
import type { TransactionDetails } from 'state/transactions/reducer'
import type { SettlementReference } from 'lib/treasury-handoff'
import { formatSettlementUserLabel } from './formatSettlementStatus'

export type TradeHistorySource = 'wallet' | 'protocol'
export type TradeHistoryRowStatus = 'confirmed' | 'pending' | 'failed'

export interface TradeHistoryRow {
  id: string
  source: TradeHistorySource
  txHash: string
  pair: string
  amount: string
  received?: string
  status: TradeHistoryRowStatus
  settlementStatus: ReturnType<typeof formatSettlementUserLabel>
  settlementId?: string
  time: string
}

const formatTimeAgo = (timestamp: string | number): string => {
  const ts = typeof timestamp === 'string' ? Number(timestamp) : timestamp
  if (!ts || Number.isNaN(ts)) return '—'
  const seconds = Math.floor(Date.now() / 1000 - ts)
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

const formatWalletTime = (tx: TransactionDetails): string => {
  const ts = tx.confirmedTime ?? tx.addedTime
  if (!ts) return '—'
  const seconds = Math.floor((Date.now() - ts) / 1000)
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

const formatUsd = (value: number): string | undefined => {
  if (!value || value <= 0) return undefined
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`
  return `$${value.toFixed(2)}`
}

const formatTokenAmount = (value: number, symbol: string): string | undefined => {
  if (!value || value <= 0) return undefined
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M ${symbol}`
  if (value >= 1_000) return `${(value / 1_000).toFixed(2)}K ${symbol}`
  return `${value.toFixed(4)} ${symbol}`
}

function walletRowStatus(tx: TransactionDetails): TradeHistoryRowStatus {
  if (!tx.receipt) return 'pending'
  return tx.receipt.status === 1 ? 'confirmed' : 'failed'
}

function settlementFromRef(ref?: SettlementReference | null) {
  if (!ref) {
    return { settlementStatus: formatSettlementUserLabel({ settlementStatus: 'none', treasuryRuntimeEndpointStatus: 'not_configured' }) }
  }
  return {
    settlementStatus: formatSettlementUserLabel({
      txHash: ref.txHash,
      settlementStatus: ref.settlementStatus,
      settlementId: ref.settlementId,
      machineCode: ref.machineCode,
      treasuryRuntimeEndpointStatus: ref.treasuryRuntimeEndpointStatus,
    }),
    settlementId: ref.settlementId,
  }
}

function parseWalletPair(tx: TransactionDetails): string {
  const summary = tx.summary ?? tx.translatableSummary?.text ?? ''
  const swapMatch = summary.match(/Swap\s+(.+?)\s+for\s+(.+)/i)
  if (swapMatch) return `${swapMatch[1]} / ${swapMatch[2]}`
  const addMatch = summary.match(/Add\s+(.+)/i)
  if (addMatch) return addMatch[1]
  const symbol = tx.settlementHandoffContext?.asset.symbol
  return symbol ? `${symbol} swap` : 'Swap'
}

function parseWalletAmount(tx: TransactionDetails): string {
  const ctx = tx.settlementHandoffContext
  if (ctx?.amount) return `${ctx.amount} ${ctx.asset.symbol}`
  return tx.summary ?? '—'
}

export function buildWalletHistoryRows(
  transactions: TransactionDetails[],
  settlementByHash: Record<string, SettlementReference | undefined>,
): TradeHistoryRow[] {
  return transactions
    .filter((tx) => tx.type === 'swap')
    .sort((a, b) => (b.confirmedTime ?? b.addedTime) - (a.confirmedTime ?? a.addedTime))
    .slice(0, 20)
    .map((tx) => {
      const ref = settlementByHash[tx.hash]
      const settlement = settlementFromRef(ref)
      return {
        id: `wallet-${tx.hash}`,
        source: 'wallet' as const,
        txHash: tx.hash,
        pair: parseWalletPair(tx),
        amount: parseWalletAmount(tx),
        status: walletRowStatus(tx),
        settlementStatus: settlement.settlementStatus,
        settlementId: settlement.settlementId,
        time: formatWalletTime(tx),
      }
    })
}

export function buildProtocolHistoryRows(
  transactions: Transaction[] | undefined,
  inputSymbol?: string,
  outputSymbol?: string,
): TradeHistoryRow[] {
  if (!transactions?.length) return []

  const matchesPair = (tx: Transaction): boolean => {
    if (!inputSymbol || !outputSymbol) return true
    const symbols = new Set([tx.token0Symbol.toUpperCase(), tx.token1Symbol.toUpperCase()])
    return symbols.has(inputSymbol.toUpperCase()) && symbols.has(outputSymbol.toUpperCase())
  }

  return transactions
    .filter((tx) => tx.type === TransactionType.SWAP)
    .filter(matchesPair)
    .slice(0, 12)
    .map((tx) => {
      const receivedSymbol = outputSymbol ?? tx.token1Symbol
      const receivedAmount =
        receivedSymbol === tx.token1Symbol
          ? formatTokenAmount(tx.amountToken1, tx.token1Symbol)
          : formatTokenAmount(tx.amountToken0, tx.token0Symbol)
      return {
        id: `protocol-${tx.hash}`,
        source: 'protocol' as const,
        txHash: tx.hash,
        pair: `${tx.token0Symbol} / ${tx.token1Symbol}`,
        amount: formatUsd(tx.amountUSD) ?? '—',
        received: receivedAmount,
        status: 'confirmed' as const,
        settlementStatus: 'No settlement data' as const,
        time: formatTimeAgo(tx.timestamp),
      }
    })
}

export function mergeTradeHistoryRows(walletRows: TradeHistoryRow[], protocolRows: TradeHistoryRow[]): TradeHistoryRow[] {
  const seen = new Set(walletRows.map((r) => r.txHash.toLowerCase()))
  const merged = [...walletRows]
  protocolRows.forEach((row) => {
    if (!seen.has(row.txHash.toLowerCase())) merged.push(row)
  })
  return merged.slice(0, 24)
}
