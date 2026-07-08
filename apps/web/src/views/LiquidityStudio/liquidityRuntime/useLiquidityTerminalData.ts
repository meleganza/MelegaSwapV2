import { useMemo } from 'react'
import orderBy from 'lodash/orderBy'
import { Transaction, TransactionType } from 'state/info/types'
import { usePoolDatasSWR } from 'state/info/hooks'
import useTopPoolAddresses from 'state/info/queries/pools/topPools'
import { buildIndexerActivityDiagnostic } from 'lib/runtime-integrity'
import { useProtocolTransactionsIndexer } from 'lib/runtime-indexing'
import { formatPct, formatUsd } from './formatLiquidityRuntime'

export interface LiquidityActivityRow {
  id: string
  time: string
  pair: string
  action: 'Add' | 'Remove'
  amount: string
  lp: string
  status: string
  tone: 'green' | 'yellow' | 'red'
}

export interface LiquidityMarketMetric {
  label: string
  value: string
  delta?: string
}

export interface LiquidityTopPoolRow {
  id: string
  pair: string
  apr: string
  tvl: string
  href: string
}

const formatTimeAgo = (timestamp: string): string => {
  const ts = Number(timestamp)
  if (!ts || Number.isNaN(ts)) return '—'
  const seconds = Math.floor(Date.now() / 1000 - ts)
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

const formatTokenAmount = (value: number, symbol: string): string => {
  if (!value || value <= 0) return '—'
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M ${symbol}`
  if (value >= 1_000) return `${(value / 1_000).toFixed(2)}K ${symbol}`
  return `${value.toFixed(4)} ${symbol}`
}

const matchesPair = (tx: Transaction, symbolA?: string, symbolB?: string): boolean => {
  if (!symbolA || !symbolB) return true
  const symbols = new Set([tx.token0Symbol.toUpperCase(), tx.token1Symbol.toUpperCase()])
  return symbols.has(symbolA.toUpperCase()) && symbols.has(symbolB.toUpperCase())
}

export const useLiquidityTerminalData = (
  poolAddress?: string,
  symbolA?: string,
  symbolB?: string,
) => {
  const { transactions, indexerState, isActivityIndexing } = useProtocolTransactionsIndexer()
  const topAddresses = useTopPoolAddresses()
  const poolAddresses = useMemo(() => {
    const addrs = [...topAddresses]
    if (poolAddress && !addrs.includes(poolAddress)) addrs.unshift(poolAddress)
    return addrs.slice(0, 8)
  }, [topAddresses, poolAddress])

  const poolDatas = usePoolDatasSWR(poolAddresses)
  const selectedPool = useMemo(
    () => (poolAddress ? poolDatas.find((p) => p?.address?.toLowerCase() === poolAddress.toLowerCase()) : poolDatas[0]),
    [poolDatas, poolAddress],
  )

  const activityRows = useMemo((): LiquidityActivityRow[] => {
    if (!transactions?.length) return []
    return transactions
      .filter((tx) => tx.type === TransactionType.MINT || tx.type === TransactionType.BURN)
      .filter((tx) => matchesPair(tx, symbolA, symbolB))
      .slice(0, 12)
      .map((tx) => {
        const isAdd = tx.type === TransactionType.MINT
        const primaryAmount = isAdd
          ? formatTokenAmount(Math.max(tx.amountToken0, tx.amountToken1), tx.amountToken0 >= tx.amountToken1 ? tx.token0Symbol : tx.token1Symbol)
          : formatTokenAmount(Math.max(tx.amountToken0, tx.amountToken1), tx.amountToken0 >= tx.amountToken1 ? tx.token0Symbol : tx.token1Symbol)
        return {
          id: tx.hash,
          time: formatTimeAgo(tx.timestamp),
          pair: `${tx.token0Symbol} / ${tx.token1Symbol}`,
          action: isAdd ? 'Add' : 'Remove',
          amount: primaryAmount,
          lp: formatUsd(tx.amountUSD) ?? '—',
          status: 'Confirmed',
          tone: 'green' as const,
        }
      })
  }, [transactions, symbolA, symbolB])

  const marketMetrics = useMemo((): LiquidityMarketMetric[] => {
    const pool = selectedPool
    return [
      { label: 'TVL', value: formatUsd(pool?.liquidityUSD), delta: pool?.liquidityUSDChange != null ? `${pool.liquidityUSDChange >= 0 ? '+' : ''}${pool.liquidityUSDChange.toFixed(2)}%` : undefined },
      { label: '24H Volume', value: formatUsd(pool?.volumeUSD), delta: pool?.volumeUSDChange != null ? `${pool.volumeUSDChange >= 0 ? '+' : ''}${pool.volumeUSDChange.toFixed(2)}%` : undefined },
      { label: 'Pool APR', value: formatPct(pool?.lpApr7d) },
      { label: 'Fees Generated', value: formatUsd(pool?.lpFees24h) },
    ]
  }, [selectedPool])

  const topPools = useMemo((): LiquidityTopPoolRow[] => {
    return poolDatas
      .filter(Boolean)
      .slice(0, 3)
      .map((pool) => ({
        id: pool.address,
        pair: `${pool.token0.symbol} / ${pool.token1.symbol}`,
        apr: formatPct(pool.lpApr7d),
        tvl: formatUsd(pool.liquidityUSD),
        href: `/add/${pool.token0.address}/${pool.token1.address}`,
      }))
  }, [poolDatas])

  const advisorItems = useMemo(() => {
    const best = topPools[0]
    const pool = selectedPool
    const health =
      pool && pool.liquidityUSD > 100_000 && pool.volumeUSD > 10_000
        ? 'Stable'
        : pool
          ? 'Moderate'
          : 'Indexing'
  const risk =
      pool && pool.lpApr7d > 50
        ? 'Elevated'
        : pool && pool.lpApr7d > 20
          ? 'Moderate'
          : 'Low'
    return [
      { label: 'Pool Health', value: health, tone: health === 'Stable' ? 'green' as const : 'gold' as const },
      { label: 'Best Opportunity', value: best?.pair ?? '—', tone: 'gold' as const },
      { label: 'Risk', value: risk, tone: risk === 'Low' ? 'green' as const : 'gold' as const },
    ]
  }, [selectedPool, topPools])

  const activityDiagnostic = useMemo(() => {
    if (isActivityIndexing) {
      return buildIndexerActivityDiagnostic({
        title: 'Last indexed activity unavailable',
        source: indexerState.source,
        indexer: indexerState.indexer,
        lastAttempt: indexerState.lastAttempt,
        reason: indexerState.reason ?? 'Subgraph transactions loading',
      })
    }
    if (activityRows.length > 0) return undefined
    return buildIndexerActivityDiagnostic({
      source: indexerState.source,
      indexer: indexerState.indexer,
      lastAttempt: indexerState.lastAttempt,
      reason:
        symbolA && symbolB
          ? `No mint/burn events indexed for ${symbolA}/${symbolB}`
          : 'No liquidity mint/burn events indexed in current subgraph window',
    })
  }, [isActivityIndexing, activityRows.length, symbolA, symbolB, indexerState])

  return {
    activityRows,
    marketMetrics,
    topPools,
    advisorItems,
    selectedPool,
    activityDiagnostic,
    isIndexing: isActivityIndexing,
    isLoadingPools: topAddresses.length > 0 && poolDatas.length === 0 && isActivityIndexing,
  }
}

export default useLiquidityTerminalData
