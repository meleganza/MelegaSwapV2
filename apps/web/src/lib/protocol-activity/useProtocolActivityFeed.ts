import useSWR from 'swr'
import { useProtocolTransactionsIndexer } from 'lib/runtime-indexing'
import type { Transaction } from 'state/info/types'
import { TransactionType } from 'state/info/types'

export interface ProtocolActivityRow {
  id: string
  sourceType: 'amm' | 'masterchef' | 'smartchef'
  eventType: string
  transactionHash: string
  blockNumber: number
  timestamp: number
  wallet?: string
  context: string
  value?: string
  explorerUrl: string
}

async function fetchProtocolEvents(): Promise<ProtocolActivityRow[]> {
  const res = await fetch('/api/protocol/activity?limit=40')
  if (!res.ok) return []
  const json = (await res.json()) as {
    events?: Array<{
      sourceType: 'amm' | 'masterchef' | 'smartchef'
      eventType: string
      transactionHash: string
      blockNumber: number
      timestamp: number
      wallet?: string
      pairOrPoolIdentity?: string
      explorerUrl: string
    }>
  }
  return (json.events ?? []).map((e, i) => ({
    id: `protocol-${e.transactionHash}-${i}`,
    sourceType: e.sourceType,
    eventType: e.eventType,
    transactionHash: e.transactionHash,
    blockNumber: e.blockNumber,
    timestamp: e.timestamp,
    wallet: e.wallet,
    context: e.pairOrPoolIdentity ?? e.eventType,
    explorerUrl: e.explorerUrl,
  }))
}

function ammToRow(tx: Transaction): ProtocolActivityRow {
  const label =
    tx.type === TransactionType.SWAP
      ? 'Swap'
      : tx.type === TransactionType.MINT
        ? 'Mint'
        : tx.type === TransactionType.BURN
          ? 'Burn'
          : 'AMM'
  return {
    id: `amm-${tx.hash}`,
    sourceType: 'amm',
    eventType: label,
    transactionHash: tx.hash,
    blockNumber: 0,
    timestamp: Number(tx.timestamp),
    wallet: tx.sender,
    context: `${tx.token0Symbol ?? ''} / ${tx.token1Symbol ?? ''}`.trim(),
    value: tx.amountUSD > 0 ? String(tx.amountUSD) : undefined,
    explorerUrl: `https://bscscan.com/tx/${tx.hash}`,
  }
}

export function useProtocolActivityFeed() {
  const { transactions, indexerState, isActivityIndexing } = useProtocolTransactionsIndexer()
  const { data: protocolEvents = [], isLoading } = useSWR('protocol-activity-feed', fetchProtocolEvents, {
    revalidateOnFocus: false,
    dedupingInterval: 60_000,
  })

  const rows = useMemoMergedActivity(transactions ?? [], protocolEvents)

  return {
    rows,
    indexerState,
    isActivityIndexing: isActivityIndexing || isLoading,
  }
}

function useMemoMergedActivity(amm: Transaction[], protocol: ProtocolActivityRow[]): ProtocolActivityRow[] {
  const seen = new Set<string>()
  const merged: ProtocolActivityRow[] = []
  for (const tx of amm) {
    const row = ammToRow(tx)
    const key = `56:${row.transactionHash}`
    if (seen.has(key)) continue
    seen.add(key)
    merged.push(row)
  }
  for (const row of protocol) {
    const key = `56:${row.transactionHash}:${row.eventType}`
    if (seen.has(key)) continue
    seen.add(key)
    merged.push(row)
  }
  return merged.sort((a, b) => b.timestamp - a.timestamp).slice(0, 40)
}
