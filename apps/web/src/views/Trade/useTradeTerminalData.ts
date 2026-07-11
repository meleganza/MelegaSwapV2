import { useMemo } from 'react'
import useSWR from 'swr'
import { Transaction, TransactionType } from 'state/info/types'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { useProtocolTransactionsIndexer } from 'lib/runtime-indexing'
import { useGetChainName, useTokenDataSWR } from 'state/info/hooks'
import { getTokenAddress } from 'views/Swap/components/Chart/utils'
import { MARCO_BSC_ADDRESS, isMarcoSymbol } from 'design-system/melega/constants/brand'
import { BSC_TESTNET_ADDRESSES } from 'config/constants/bscTestnet'
import type { DataReasonCode } from 'lib/data-policy/dataReasonCodes'
import { DATA_REASON_LABELS } from 'lib/data-policy/dataReasonCodes'
import { resolveHolderMetric, resolveHolderMachinePayload, useHolderCount } from 'lib/holder-count'
import { resolveSubgraphEndpointReport } from 'lib/runtime-indexing'
import { RUNTIME_UNAVAILABLE_LABEL } from 'lib/runtime-truth'
import { fetchMarcoPublicMarket } from 'lib/trade-market/fetchPublicTokenMarket'
import { useIndexerCandles } from 'lib/bsc-indexer/client/useIndexerCandles'
import { MARCO_WBNB_PAIR_BSC } from 'lib/bsc-indexer/constants'
import type { TradeDataMissingReason } from './tradeRuntime/buildTradeMachinePayload'

const SECONDS_24H = 86_400

async function fetchBnbUsdPrice(): Promise<number | undefined> {
  try {
    const res = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=binancecoin&vs_currencies=usd',
      { headers: { accept: 'application/json' } },
    )
    if (!res.ok) return undefined
    const json = (await res.json()) as { binancecoin?: { usd?: number } }
    const usd = json.binancecoin?.usd
    return usd != null && Number.isFinite(usd) && usd > 0 ? usd : undefined
  } catch {
    return undefined
  }
}

export interface TradeSwapRow {
  id: string
  time: string
  wallet: string
  pair: string
  amount: string
  amountReason?: string
  received?: string
  receivedReason?: string
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
  subgraphEndpoint?: string
  subgraphBlocker?: string
  tokenMetrics: 'loading' | 'ready' | 'missing'
  reasonCodes: Partial<Record<string, DataReasonCode>>
  dataSources: string[]
  primaryActions: string[]
  runtimeLinks: string[]
  missingReason: TradeDataMissingReason
  missingReasonDetail?: string
  holder_source: 'bscscan'
  holder_status: 'configured' | 'not_configured' | 'error'
  holder_reason?: string
  timestamp: string
}

const formatTimeAgo = (timestamp: string): string => {
  const ts = Number(timestamp)
  if (!ts || Number.isNaN(ts)) return RUNTIME_UNAVAILABLE_LABEL
  const seconds = Math.floor(Date.now() / 1000 - ts)
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

const shortenWallet = (address: string): string => {
  if (!address || address.length < 10) return RUNTIME_UNAVAILABLE_LABEL
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

function resolveCanonicalOutputAddress(
  chainId: number | undefined,
  outputSymbol?: string,
  outputAddress?: string,
): string | undefined {
  if (outputAddress) return getTokenAddress(outputAddress)
  if (isMarcoSymbol(outputSymbol)) {
    return chainId === 97 ? BSC_TESTNET_ADDRESSES.marco : MARCO_BSC_ADDRESS
  }
  return undefined
}

export const useTradeTerminalData = (inputSymbol?: string, outputSymbol?: string, outputAddress?: string) => {
  const { chainId } = useActiveChainId()
  const chainName = useGetChainName()
  const subgraphReport = useMemo(() => resolveSubgraphEndpointReport(), [])
  const useDurableIndexer = Boolean(chainName === 'BSC' && !subgraphReport.melegaNativeConfigured)
  const { transactions, indexerState, isActivityIndexing } = useProtocolTransactionsIndexer()
  const resolvedOutput = resolveCanonicalOutputAddress(chainId, outputSymbol, outputAddress)
  const tokenAddress = resolvedOutput
  const tokenData = useTokenDataSWR(tokenAddress)
  const { data: holderCount, isLoading: holderLoading } = useHolderCount(chainId, tokenAddress)
  const isMarcoRoute =
    isMarcoSymbol(outputSymbol) ||
    !outputSymbol ||
    resolvedOutput?.toLowerCase() === MARCO_BSC_ADDRESS.toLowerCase()
  const { data: publicMarket } = useSWR(
    isMarcoRoute ? 'trade-marco-coingecko-market' : null,
    fetchMarcoPublicMarket,
    { refreshInterval: 120_000, revalidateOnFocus: false },
  )
  const { candles: indexerCandles, status: indexerCandleStatus } = useIndexerCandles(
    useDurableIndexer && isMarcoRoute ? MARCO_WBNB_PAIR_BSC : undefined,
    '1H',
  )
  const { data: bnbUsdPrice } = useSWR(
    useDurableIndexer && isMarcoRoute ? 'trade-bnb-usd-coingecko' : null,
    fetchBnbUsdPrice,
    { refreshInterval: 120_000, revalidateOnFocus: false },
  )

  const indexerMetrics24h = useMemo(() => {
    if (!useDurableIndexer || !isMarcoRoute) return undefined
    const cutoff = Math.floor(Date.now() / 1000) - SECONDS_24H
    const recentCandles = indexerCandles.filter((c) => c.bucketTimestamp >= cutoff)
    const candlesForMetrics = recentCandles.length > 0 ? recentCandles : indexerCandles
    const quoteVolumeWbnb = candlesForMetrics.reduce((sum, c) => sum + (c.quoteVolume ?? 0), 0)
    const tradeCount = candlesForMetrics.reduce((sum, c) => sum + (c.tradeCount ?? 0), 0)
    const txCount24h =
      transactions?.filter((tx) => {
        const ts = Number(tx.timestamp)
        return tx.type === TransactionType.SWAP && Number.isFinite(ts) && ts >= cutoff
      }).length ?? 0
    const swapEventCount = indexerState.eventCounts?.Swap ?? 0
    const resolvedTradeCount = tradeCount > 0 ? tradeCount : txCount24h > 0 ? txCount24h : swapEventCount
    const volumeUsd =
      quoteVolumeWbnb > 0 && bnbUsdPrice != null && Number.isFinite(bnbUsdPrice)
        ? quoteVolumeWbnb * bnbUsdPrice
        : undefined
    const hasData = resolvedTradeCount > 0 || quoteVolumeWbnb > 0 || indexerCandleStatus === 'ready'
    if (!hasData) return undefined
    return {
      volumeUsd,
      quoteVolumeWbnb: quoteVolumeWbnb > 0 ? quoteVolumeWbnb : undefined,
      tradeCount: resolvedTradeCount,
      lastClose: indexerCandles[indexerCandles.length - 1]?.close,
    }
  }, [
    useDurableIndexer,
    isMarcoRoute,
    indexerCandles,
    transactions,
    indexerState.eventCounts,
    bnbUsdPrice,
    indexerCandleStatus,
  ])

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
          amount: formatUsd(tx.amountUSD) ?? RUNTIME_UNAVAILABLE_LABEL,
          amountReason:
            tx.amountUSD > 0 ? undefined : DATA_REASON_LABELS.NO_EVENTS_INDEXED,
          received: receivedAmount,
          receivedReason: receivedAmount ? undefined : 'Swap output amount not indexed',
          direction: swapDirection(tx, displayOutput),
          route: swapRouteLabel(tx),
        }
      })
  }, [transactions, displayInput, displayOutput])

  const pairStats = useMemo((): TradePairStat[] => {
    const volChange = formatPct(tokenData?.volumeUSDChange ?? NaN)
    const liqChange = formatPct(tokenData?.liquidityUSDChange ?? NaN)
    const txChange = formatPct(tokenData?.txCountChange ?? NaN)

    const indexedVolumeValue =
      indexerMetrics24h?.volumeUsd != null
        ? formatUsd(indexerMetrics24h.volumeUsd)
        : indexerMetrics24h?.quoteVolumeWbnb != null
          ? `${indexerMetrics24h.quoteVolumeWbnb < 0.01 ? indexerMetrics24h.quoteVolumeWbnb.toFixed(6) : indexerMetrics24h.quoteVolumeWbnb.toFixed(4)} WBNB`
          : undefined
    const indexedTradeValue =
      indexerMetrics24h?.tradeCount != null && indexerMetrics24h.tradeCount > 0
        ? indexerMetrics24h.tradeCount.toLocaleString()
        : undefined

    const volumeValue =
      indexedVolumeValue ?? formatUsd(tokenData?.volumeUSD ?? publicMarket?.volume24hUsd ?? 0)
    const liquidityValue = formatUsd(tokenData?.liquidityUSD ?? 0)
    const mcapValue = formatCompactUsd(publicMarket?.marketCapUsd)
    const fdvValue = formatCompactUsd(publicMarket?.fdvUsd)
    const supplyValue = formatSupply(publicMarket?.circulatingSupply)

    const volumeReason: DataReasonCode | undefined =
      indexedVolumeValue
        ? undefined
        : tokenData === undefined && subgraphReport.melegaNativeConfigured && !publicMarket
          ? 'SUBGRAPH_LOADING'
          : !tokenData?.exists && !publicMarket?.volume24hUsd
            ? 'PAIR_NOT_INDEXED'
            : !tokenData?.volumeUSD && !publicMarket?.volume24hUsd
              ? 'NO_EVENTS_INDEXED'
              : undefined

    const liquidityReason: DataReasonCode | undefined =
      tokenData === undefined && subgraphReport.melegaNativeConfigured
        ? 'SUBGRAPH_LOADING'
        : !tokenData?.exists
          ? 'PAIR_NOT_INDEXED'
          : !tokenData.liquidityUSD
            ? 'NO_POOL_FOUND'
            : undefined

    const tradesReason: DataReasonCode | undefined =
      indexedTradeValue
        ? undefined
        : tokenData === undefined && subgraphReport.melegaNativeConfigured
          ? 'SUBGRAPH_LOADING'
          : !tokenData?.exists
            ? 'PAIR_NOT_INDEXED'
            : !tokenData.txCount && !transactions?.length
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
        value: indexedTradeValue ?? (tokenData?.txCount ? tokenData.txCount.toLocaleString() : undefined),
        change: txChange?.text,
        changePositive: txChange?.positive,
        reasonCode: tradesReason,
      },
      {
        id: 'holders',
        label: 'Holders',
        value: !tokenAddress
          ? RUNTIME_UNAVAILABLE_LABEL
          : resolveHolderMetric(holderCount, holderLoading).display,
        reasonCode: !tokenAddress
          ? 'DATA_SOURCE_NOT_CONFIGURED'
          : holderLoading
            ? undefined
            : holderCount?.status === 'ready'
              ? undefined
              : 'EXPLORER_SOURCE_MISSING',
      },
    ]
  }, [tokenData, publicMarket, tokenAddress, holderCount, holderLoading, indexerMetrics24h, transactions, subgraphReport.melegaNativeConfigured])

  const pairPrice = useMemo(() => {
    if (tokenData?.priceUSD) {
      return {
        value: tokenData.priceUSD,
        change24h: tokenData.priceUSDChange,
        formatted: `$${tokenData.priceUSD < 0.01 ? tokenData.priceUSD.toFixed(6) : tokenData.priceUSD.toFixed(4)}`,
      }
    }
    const close = indexerMetrics24h?.lastClose
    if (close != null && close > 0 && Number.isFinite(close)) {
      if (bnbUsdPrice != null && Number.isFinite(bnbUsdPrice) && bnbUsdPrice > 0) {
        const priceUsd = close * bnbUsdPrice
        if (Number.isFinite(priceUsd) && priceUsd > 0) {
          return {
            value: priceUsd,
            change24h: undefined,
            formatted: `$${priceUsd < 0.01 ? priceUsd.toFixed(6) : priceUsd.toFixed(4)}`,
          }
        }
      }
      return {
        value: close,
        change24h: undefined,
        formatted: `${close < 0.01 ? close.toFixed(6) : close.toFixed(4)} WBNB`,
      }
    }
    return undefined
  }, [tokenData, indexerMetrics24h, bnbUsdPrice])

  const missingReason = useMemo((): TradeDataMissingReason => {
    if (useDurableIndexer && (transactions?.length || indexerCandles.length > 0)) return null
    if (tokenData === undefined) return null
    if (!tokenAddress) return 'route_not_configured'
    if (!tokenData.exists) return 'pair_not_indexed'
    if (!transactions?.length && !tokenData.volumeUSD) return 'subgraph_empty'
    return null
  }, [useDurableIndexer, tokenData, tokenAddress, transactions, indexerCandles.length])

  const missingReasonDetail = useMemo((): string | undefined => {
    if (missingReason === 'pair_not_indexed') return 'MARCO/BNB pair not indexed in Melega subgraph'
    if (missingReason === 'subgraph_empty') return 'Subgraph returned no historical candles or swap events'
    if (missingReason === 'route_not_configured') return 'Output token route not configured'
    const holdersStat = pairStats.find((s) => s.id === 'holders')
    if (holdersStat?.reasonCode === 'EXPLORER_SOURCE_MISSING' && holderCount?.status === 'unavailable') {
      return missingReason ? undefined : holderCount.diagnostic
    }
    return undefined
  }, [missingReason, pairStats, holderCount])

  const chartUnavailableDetail = useMemo((): string | undefined => {
    if (missingReason === 'pair_not_indexed') {
      return `Reason: Pair not indexed · Source: melega-subgraph · Indexer: ${indexerState.indexer}`
    }
    if (missingReason === 'subgraph_empty') {
      return `Reason: ${indexerState.reason ?? 'No indexed candles or swaps'} · Source: ${indexerState.source} · Indexer: ${indexerState.indexer}`
    }
    if (missingReason === 'route_not_configured') {
      return 'Reason: Output token route not configured · Source: trade-runtime'
    }
    if (indexerState.status === 'error' || indexerState.status === 'unavailable') {
      return `Reason: ${indexerState.reason ?? 'Chart data unavailable'} · Source: ${indexerState.source} · Indexer: ${indexerState.indexer}`
    }
    if (tokenData === undefined) {
      return `Reason: Token metrics loading · Source: melega-subgraph · Indexer: ${indexerState.indexer}`
    }
    return undefined
  }, [missingReason, indexerState, tokenData])

  const machine = useMemo((): TradeDataMachinePayload => {
    const reasonCodes: Partial<Record<string, DataReasonCode>> = {}
    pairStats.forEach((stat) => {
      if (stat.reasonCode) reasonCodes[stat.id] = stat.reasonCode
    })
    const holderMachine = resolveHolderMachinePayload(holderCount)
    return {
      schema: 'melega.trade.market.v1',
      schemaVersion: '1.0.0',
      module: 'trade',
      subgraphTransactions:
        indexerState.status === 'loading'
          ? 'loading'
          : transactions && transactions.length > 0
            ? 'ready'
            : 'empty',
      subgraphEndpoint: indexerState.configuredEndpoint,
      subgraphBlocker: indexerState.blockerCode,
      tokenMetrics:
        tokenData === undefined ? 'loading' : tokenData.exists ? 'ready' : 'missing',
      reasonCodes,
      dataSources: useDurableIndexer
        ? ['bsc-durable-indexer', 'on-chain-multicall', 'presence-registry']
        : ['melega-subgraph', 'on-chain-multicall', 'presence-registry'],
      primaryActions: ['view_chart', 'view_recent_swaps', 'swap'],
      runtimeLinks: ['/command-center', '/liquidity-studio', '/trending'],
      missingReason,
      missingReasonDetail,
      ...holderMachine,
      timestamp: new Date().toISOString(),
    }
  }, [transactions, tokenData, pairStats, missingReason, missingReasonDetail, indexerState, holderCount, subgraphReport, useDurableIndexer])

  const isIndexingSwaps = isActivityIndexing && recentSwaps.length === 0
  const isIndexingMetrics =
    !useDurableIndexer &&
    subgraphReport.melegaNativeConfigured &&
    tokenData === undefined &&
    Boolean(tokenAddress) &&
    !publicMarket

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
    hasSwapData: indexerState.status === 'ready',
    swapEmptyReason: !isActivityIndexing && recentSwaps.length === 0
      ? indexerState.status === 'error' || indexerState.status === 'unavailable'
        ? 'DATA_SOURCE_NOT_CONFIGURED'
        : 'NO_EVENTS_INDEXED'
      : undefined,
    swapDiagnostic: !isActivityIndexing && recentSwaps.length === 0 ? indexerState : undefined,
    chartUnavailableDetail,
    indexerState,
    tokenExists: tokenData?.exists,
  }
}

export default useTradeTerminalData
