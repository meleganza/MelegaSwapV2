import useSWR from 'swr'
import { useMemo } from 'react'
import { useProtocolTransactionsIndexer } from 'lib/runtime-indexing'
import { LIVE_ACTIVITY_WINDOW_SEC } from 'lib/data-truth/ontology'
import type { Transaction } from 'state/info/types'
import { TransactionType } from 'state/info/types'
import {
  mergeCanonicalProtocolActivity,
  type CanonicalProtocolActivityRow,
  type ProtocolSourceType,
} from 'lib/protocolActivityModel'

export type { CanonicalProtocolActivityRow } from 'lib/protocolActivityModel'

type ProtocolApiEvent = {
  chainId?: number
  sourceType: ProtocolSourceType
  contractAddress?: string
  eventType: string
  transactionHash: string
  logIndex?: number
  blockNumber: number
  timestamp: number
  wallet?: string
  assetAddresses?: string[]
  resolvedSymbols?: string[]
  amounts?: string[]
  pairOrPoolIdentity?: string
  explorerUrl: string
}

export interface ProtocolActivityMergeStats {
  total: number
  within24h: number
  amm: number
  masterchef: number
  smartchef: number
}

export interface UseProtocolActivityFeedResult {
  rows: CanonicalProtocolActivityRow[]
  totalCount: number
  ammCount: number
  masterchefCount: number
  smartchefCount: number
  newestTimestamp?: number
  oldestTimestamp?: number
  duplicatesRemoved: number
  mergeStats: ProtocolActivityMergeStats
  indexerState: ReturnType<typeof useProtocolTransactionsIndexer>['indexerState']
  isActivityIndexing: boolean
  isLoading: boolean
  isError: boolean
  protocolError?: string
}

async function fetchProtocolEvents(): Promise<ProtocolApiEvent[]> {
  const res = await fetch('/api/protocol/activity?limit=40')
  if (!res.ok) return []
  const json = (await res.json()) as { events?: ProtocolApiEvent[] }
  return json.events ?? []
}

function canonicalRowFromApi(event: ProtocolApiEvent): CanonicalProtocolActivityRow {
  return {
    chainId: event.chainId ?? 56,
    sourceType: event.sourceType,
    eventType: event.eventType,
    transactionHash: event.transactionHash,
    logIndex: event.logIndex ?? 0,
    blockNumber: event.blockNumber,
    timestamp: event.timestamp,
    wallet: event.wallet,
    contractAddress: event.contractAddress,
    pairOrPoolIdentity: event.pairOrPoolIdentity,
    assetAddresses: event.assetAddresses,
    resolvedSymbols: event.resolvedSymbols,
    amounts: event.amounts,
    explorerUrl: event.explorerUrl,
  }
}

function canonicalRowFromAmmTransaction(tx: Transaction, chainId = 56): CanonicalProtocolActivityRow | undefined {
  const eventType =
    tx.type === TransactionType.SWAP
      ? 'Swap'
      : tx.type === TransactionType.MINT
        ? 'Mint'
        : tx.type === TransactionType.BURN
          ? 'Burn'
          : undefined
  if (!eventType) return undefined

  const symbols = [tx.token0Symbol, tx.token1Symbol].filter(Boolean) as string[]
  const addresses = [tx.token0Address, tx.token1Address].filter(Boolean) as string[]

  return {
    chainId,
    sourceType: 'amm',
    eventType,
    transactionHash: tx.hash,
    logIndex: -1,
    blockNumber: 0,
    timestamp: Number(tx.timestamp),
    wallet: tx.sender,
    assetAddresses: addresses,
    resolvedSymbols: symbols,
    amounts: [String(tx.amountToken0 ?? 0), String(tx.amountToken1 ?? 0)],
    pairOrPoolIdentity: symbols.length >= 2 ? `${symbols[0]} / ${symbols[1]}` : undefined,
    explorerUrl: `https://bscscan.com/tx/${tx.hash}`,
  }
}

function splitSourceBuckets(apiEvents: ProtocolApiEvent[], supplementAmm: CanonicalProtocolActivityRow[]) {
  const amm: CanonicalProtocolActivityRow[] = []
  const masterchef: CanonicalProtocolActivityRow[] = []
  const smartchef: CanonicalProtocolActivityRow[] = []

  for (const event of apiEvents) {
    const row = canonicalRowFromApi(event)
    if (row.sourceType === 'masterchef') masterchef.push(row)
    else if (row.sourceType === 'smartchef') smartchef.push(row)
    else amm.push(row)
  }

  for (const row of supplementAmm) amm.push(row)

  return { amm, masterchef, smartchef }
}

function finiteTimestampBounds(rows: CanonicalProtocolActivityRow[]): {
  newestTimestamp?: number
  oldestTimestamp?: number
} {
  const timestamps = rows
    .map((row) => row.timestamp)
    .filter((timestamp) => Number.isFinite(timestamp) && timestamp > 0)
  if (!timestamps.length) return {}
  return {
    newestTimestamp: Math.max(...timestamps),
    oldestTimestamp: Math.min(...timestamps),
  }
}

function countWithin24h(rows: CanonicalProtocolActivityRow[]): number {
  const nowSec = Math.floor(Date.now() / 1000)
  return rows.filter(
    (row) =>
      Number.isFinite(row.timestamp) &&
      row.timestamp > 0 &&
      nowSec - row.timestamp >= 0 &&
      nowSec - row.timestamp <= LIVE_ACTIVITY_WINDOW_SEC,
  ).length
}

export function useProtocolActivityFeed(): UseProtocolActivityFeedResult {
  const { transactions, indexerState, isActivityIndexing } = useProtocolTransactionsIndexer()
  const {
    data: protocolEvents = [],
    isLoading: protocolLoading,
    error: protocolError,
  } = useSWR('protocol-activity-feed', fetchProtocolEvents, {
    revalidateOnFocus: false,
    dedupingInterval: 60_000,
  })

  const supplementAmm = useMemo(
    () =>
      (transactions ?? [])
        .map((tx) => canonicalRowFromAmmTransaction(tx))
        .filter((row): row is CanonicalProtocolActivityRow => row != null),
    [transactions],
  )

  const sourceBuckets = useMemo(
    () => splitSourceBuckets(protocolEvents, supplementAmm),
    [protocolEvents, supplementAmm],
  )

  const merged = useMemo(
    () =>
      mergeCanonicalProtocolActivity({
        amm: sourceBuckets.amm,
        masterchef: sourceBuckets.masterchef,
        smartchef: sourceBuckets.smartchef,
      }),
    [sourceBuckets],
  )

  const timestampBounds = useMemo(() => finiteTimestampBounds(merged.rows), [merged.rows])

  const ammCount = sourceBuckets.amm.length
  const masterchefCount = sourceBuckets.masterchef.length
  const smartchefCount = sourceBuckets.smartchef.length
  const totalCount = merged.rows.length

  const mergeStats = useMemo(
    (): ProtocolActivityMergeStats => ({
      total: totalCount,
      within24h: countWithin24h(merged.rows),
      amm: ammCount,
      masterchef: masterchefCount,
      smartchef: smartchefCount,
    }),
    [totalCount, merged.rows, ammCount, masterchefCount, smartchefCount],
  )

  const isLoading = protocolLoading || isActivityIndexing
  const isError = protocolError instanceof Error
  const protocolErrorMessage =
    protocolError instanceof Error ? protocolError.message : protocolError ? String(protocolError) : undefined

  return {
    rows: merged.rows,
    totalCount,
    ammCount,
    masterchefCount,
    smartchefCount,
    newestTimestamp: timestampBounds.newestTimestamp,
    oldestTimestamp: timestampBounds.oldestTimestamp,
    duplicatesRemoved: merged.duplicatesRemoved,
    mergeStats,
    indexerState,
    isActivityIndexing: isLoading,
    isLoading,
    isError,
    protocolError: protocolErrorMessage,
  }
}
