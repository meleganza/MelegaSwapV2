import { useMemo } from 'react'
import useSWR from 'swr'
import { Transaction, TransactionType } from 'state/info/types'
import { useProtocolTransactionsSWR, useTokenDataSWR } from 'state/info/hooks'
import { getTokenAddress } from 'views/Swap/components/Chart/utils'
import { MARCO_BSC_ADDRESS, isMarcoSymbol } from 'design-system/melega/constants/brand'
import type { DataReasonCode } from 'lib/data-policy/dataReasonCodes'
import { fetchMarcoPublicMarket } from 'lib/trade-market/fetchPublicTokenMarket'
import type { TradeDataMissingReason } from './tradeRuntime/buildTradeMachinePayload'

export interface TradeSwapRow {
  id: string
  time: string
  wallet: string
  pair: string
  amount: string
  received?: string
  direction: 'buy' | 'sell'
  route?: string
}

export interface TradePairStat {
  id: string
  label: string
  value?: string
  change?: string
  changePositive?: boolean
  reasonCode?: DataReasonCode
}

export interface TradeDataMachinePayload {
  schema: 'melega.trade.market.v1'
  schemaVersion: '1.0.0'
  module: 'trade'
  subgraphTransactions: 'loading' | 'ready' | 'empty'
  tokenMetrics: 'loading' | 'ready' | 'missing'
  reasonCodes: Partial<Record<string, DataReasonCode>>
  dataSources: string[]
  primaryActions: string[]
  runtimeLinks: string[]
  missingReason: TradeDataMissingReason
  missingReasonDetail?: string
  timestamp: string
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

const shortenWallet = (address: string): string => {
  if (!address || address.length < 10) return address || '—'
  return `${address.slice(0, 6)}…${address.slice(-4)}`
}

const formatUsd = (value: number): string | undefined => {
  if (!value || value <= 0) return undefined
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`
  return `$${value.toFixed(2)}`
}

const formatPct = (value: number): { text: string; positive: boolean } | undefined => {
  if (!Number.isFinite(value)) return undefined
  const sign = value >= 0 ? '+' : ''
  return { text: `${sign}${value.toFixed(2)}%`, positive: value >= 0 }
}

const swapDirection = (tx: Transaction, quoteSymbol?: string): 'buy' | 'sell' => {
  if (quoteSymbol && tx.token1Symbol === quoteSymbol && tx.amountToken1 > 0) return 'buy'
  if (quoteSymbol && tx.token0Symbol === quoteSymbol && tx.amountToken0 > 0) return 'buy'
  return tx.amountToken0 >= tx.amountToken1 ? 'sell' : 'buy'
}

const formatTokenAmount = (value: number, symbol: string): string | undefined => {
  if (!value || value <= 0) return undefined
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M ${symbol}`
  if (value >= 1_000) return `${(value / 1_000).toFixed(2)}K ${symbol}`
  return `${value.toFixed(4)} ${symbol}`
}

const swapRouteLabel = (tx: Transaction): string => `${tx.token0Symbol}→${tx.token1Symbol}`

const matchesPair = (tx: Transaction, token0?: string, token1?: string): boolean => {
  if (!token0 || !token1) return true
  const symbols = new Set([tx.token0Symbol.toUpperCase(), tx.token1Symbol.toUpperCase()])
  return symbols.has(token0.toUpperCase()) && symbols.has(token1.toUpperCase())
}

function resolveCanonicalOutputAddress(outputSymbol?: string, outputAddress?: string): string | undefined {
  if (outputAddress) return getTokenAddress(outputAddress)
  if (isMarcoSymbol(outputSymbol)) return MARCO_BSC_ADDRESS
  return undefined
}

export const useTradeTerminalData = (inputSymbol?: string, outputSymbol?: string, outputAddress?: string) => {
  const transactions = useProtocolTransactionsSWR()
  const resolvedOutput = resolveCanonicalOutputAddress(outputSymbol, outputAddress)
  const tokenAddress = resolvedOutput
  const tokenData = useTokenDataSWR(tokenAddress)
  const isMarcoRoute =
    isMarcoSymbol(outputSymbol) ||
    !outputSymbol ||
    resolvedOutput?.toLowerCase() === MARCO_BSC_ADDRESS.toLowerCase()
  const { data: publicMarket } = useSWR(
    isMarcoRoute ? 'trade-marco-coingecko-market' : null,
    fetchMarcoPublicMarket,
    { refreshInterval: 120_000, revalidateOnFocus: false },
  )

  const formatCompactUsd = (value?: number): string | undefined => {
    if (value === undefined || value === null || !Number.isFinite(value) || value <= 0) return undefined
    if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`
    if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`
    return `$${value.toFixed(2)}`
  }

  const formatSupply = (value?: number): string | undefined => {
    if (value === undefined || !Number.isFinite(value) || value <= 0) return undefined
    if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(2)}B`
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`
    return value.toLocaleString()
  }

  const displayInput = inputSymbol ?? 'BNB'
  const displayOutput = isMarcoSymbol(outputSymbol) || !outputSymbol ? 'MARCO' : outputSymbol

  const recentSwaps = useMemo((): TradeSwapRow[] => {
    if (!transactions?.length) return []
    return transactions
      .filter((tx) => tx.type === TransactionType.SWAP)
      .filter((tx) => matchesPair(tx, displayInput, displayOutput))
      .slice(0, 12)
      .map((tx) => {
        const receivedSymbol = displayOutput ?? tx.token1Symbol
        const receivedAmount =
          receivedSymbol === tx.token1Symbol
            ? formatTokenAmount(tx.amountToken1, tx.token1Symbol)
            : formatTokenAmount(tx.amountToken0, tx.token0Symbol)
        return {
          id: tx.hash,
          time: formatTimeAgo(tx.timestamp),
          wallet: shortenWallet(tx.sender),
          pair: `${tx.token0Symbol} / ${tx.token1Symbol}`,
          amount: formatUsd(tx.amountUSD) ?? '—',
          received: receivedAmount,
          direction: swapDirection(tx, displayOutput),
          route: swapRouteLabel(tx),
        }
      })
  }, [transactions, displayInput, displayOutput])

  const pairStats = useMemo((): TradePairStat[] => {
    const volChange = formatPct(tokenData?.volumeUSDChange ?? NaN)
    const liqChange = formatPct(tokenData?.liquidityUSDChange ?? NaN)
    const txChange = formatPct(tokenData?.txCountChange ?? NaN)

    const volumeValue = formatUsd(tokenData?.volumeUSD ?? publicMarket?.volume24hUsd ?? 0)
    const liquidityValue = formatUsd(tokenData?.liquidityUSD ?? 0)
    const mcapValue = formatCompactUsd(publicMarket?.marketCapUsd)
    const fdvValue = formatCompactUsd(publicMarket?.fdvUsd)
    const supplyValue = formatSupply(publicMarket?.circulatingSupply)

    const volumeReason: DataReasonCode | undefined =
      tokenData === undefined && !publicMarket
        ? 'SUBGRAPH_LOADING'
        : !tokenData?.exists && !publicMarket?.volume24hUsd
          ? 'PAIR_NOT_INDEXED'
          : !tokenData?.volumeUSD && !publicMarket?.volume24hUsd
            ? 'NO_EVENTS_INDEXED'
            : undefined

    const liquidityReason: DataReasonCode | undefined =
      tokenData === undefined
        ? 'SUBGRAPH_LOADING'
        : !tokenData.exists
          ? 'PAIR_NOT_INDEXED'
          : !tokenData.liquidityUSD
            ? 'NO_POOL_FOUND'
            : undefined

    const tradesReason: DataReasonCode | undefined =
      tokenData === undefined
        ? 'SUBGRAPH_LOADING'
        : !tokenData.exists
          ? 'PAIR_NOT_INDEXED'
          : !tokenData.txCount
            ? 'NO_EVENTS_INDEXED'
            : undefined

    const mcapReason: DataReasonCode | undefined = mcapValue ? undefined : 'EXPLORER_SOURCE_MISSING'
    const fdvReason: DataReasonCode | undefined = fdvValue ? undefined : 'EXPLORER_SOURCE_MISSING'
    const supplyReason: DataReasonCode | undefined = supplyValue ? undefined : 'EXPLORER_SOURCE_MISSING'

    return [
      {
        id: 'volume',
        label: '24H Volume',
        value: volumeValue,
        change: volChange?.text,
        changePositive: volChange?.positive,
        reasonCode: volumeReason,
      },
      {
        id: 'liquidity',
        label: 'Liquidity',
        value: liquidityValue,
        change: liqChange?.text,
        changePositive: liqChange?.positive,
        reasonCode: liquidityReason,
      },
      {
        id: 'marketCap',
        label: 'Market Cap',
        value: mcapValue,
        reasonCode: mcapReason,
      },
      {
        id: 'fdv',
        label: 'FDV',
        value: fdvValue,
        reasonCode: fdvReason,
      },
      {
        id: 'supply',
        label: 'Circulating',
        value: supplyValue,
        reasonCode: supplyReason,
      },
      {
        id: 'transactions',
        label: '24H Trades',
        value: tokenData?.txCount ? tokenData.txCount.toLocaleString() : undefined,
        change: txChange?.text,
        changePositive: txChange?.positive,
        reasonCode: tradesReason,
      },
      {
        id: 'holders',
        label: 'Holders',
        value: undefined,
        reasonCode: 'EXPLORER_SOURCE_MISSING',
      },
    ]
  }, [tokenData, publicMarket])

  const pairPrice = useMemo(() => {
    if (!tokenData?.priceUSD) return undefined
    return {
      value: tokenData.priceUSD,
      change24h: tokenData.priceUSDChange,
      formatted: `$${tokenData.priceUSD < 0.01 ? tokenData.priceUSD.toFixed(6) : tokenData.priceUSD.toFixed(4)}`,
    }
  }, [tokenData])

  const missingReason = useMemo((): TradeDataMissingReason => {
    if (tokenData === undefined) return null
    if (!tokenAddress) return 'route_not_configured'
    if (!tokenData.exists) return 'pair_not_indexed'
    if (!transactions?.length && !tokenData.volumeUSD) return 'subgraph_empty'
    return null
  }, [tokenData, tokenAddress, transactions])

  const missingReasonDetail = useMemo((): string | undefined => {
    if (missingReason === 'pair_not_indexed') return 'MARCO/BNB pair not indexed in Melega subgraph'
    if (missingReason === 'subgraph_empty') return 'Subgraph returned no historical candles or swap events'
    if (missingReason === 'route_not_configured') return 'Output token route not configured'
    if (pairStats.find((s) => s.id === 'holders')?.reasonCode === 'EXPLORER_SOURCE_MISSING') {
      return missingReason ? undefined : 'Holder count requires explorer API — not wired'
    }
    return undefined
  }, [missingReason, pairStats])

  const machine = useMemo((): TradeDataMachinePayload => {
    const reasonCodes: Partial<Record<string, DataReasonCode>> = {}
    pairStats.forEach((stat) => {
      if (stat.reasonCode) reasonCodes[stat.id] = stat.reasonCode
    })
    return {
      schema: 'melega.trade.market.v1',
      schemaVersion: '1.0.0',
      module: 'trade',
      subgraphTransactions:
        transactions === undefined ? 'loading' : transactions.length > 0 ? 'ready' : 'empty',
      tokenMetrics:
        tokenData === undefined ? 'loading' : tokenData.exists ? 'ready' : 'missing',
      reasonCodes,
      dataSources: ['melega-subgraph', 'on-chain-multicall', 'presence-registry'],
      primaryActions: ['view_chart', 'view_recent_swaps', 'swap'],
      runtimeLinks: ['/command-center', '/liquidity-studio', '/trending'],
      missingReason,
      missingReasonDetail,
      timestamp: new Date().toISOString(),
    }
  }, [transactions, tokenData, pairStats, missingReason, missingReasonDetail])

  const isIndexingSwaps = transactions === undefined && recentSwaps.length === 0
  const isIndexingMetrics = tokenData === undefined && Boolean(tokenAddress)

  return {
    recentSwaps,
    pairStats,
    pairPrice,
    machine,
    missingReason,
    missingReasonDetail,
    canonicalOutputAddress: resolvedOutput,
    displayInput,
    displayOutput,
    isIndexing: isIndexingSwaps,
    isIndexingMetrics,
    hasSwapData: transactions !== undefined,
    swapEmptyReason: transactions !== undefined && recentSwaps.length === 0 ? 'NO_EVENTS_INDEXED' : undefined,
    tokenExists: tokenData?.exists,
  }
}

export default useTradeTerminalData
