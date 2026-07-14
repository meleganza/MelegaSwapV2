import { useMemo } from 'react'
import useSWR from 'swr'
import { Token, WBNB, WNATIVE } from '@pancakeswap/sdk'
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
import { reconcileTradeSurface, type TradeReconciliationStatus } from 'lib/data-truth/tradeReconciliation'
import { computeValid24hPriceChange } from 'lib/data-truth/compute24hPriceChange'
import { usePriceCakeBusd } from 'state/farms/hooks'
import useBUSDPrice from 'hooks/useBUSDPrice'
import { PairState, usePairs } from 'hooks/usePairs'
import { getBalanceNumber } from '@pancakeswap/utils/formatBalance'

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
  token0Symbol: string
  token1Symbol: string
  token0Address?: string
  token1Address?: string
  amount: string
  amountReason?: string
  received?: string
  receivedReason?: string
  direction: 'buy' | 'sell'
  explorerUrl: string
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
  status?: TradeReconciliationStatus
  reconciliationReasons?: string[]
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
  if (!Number.isFinite(value) || Math.abs(value) <= 0.0001) return undefined
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


const bscExplorerTx = (hash: string): string => `https://bscscan.com/tx/${hash}`

const matchesPair = (tx: Transaction, token0?: string, token1?: string): boolean => {
  if (!token0 || !token1) return true
  const normalize = (sym: string) => {
    const upper = sym.toUpperCase()
    return upper === 'BNB' ? 'WBNB' : upper
  }
  const symbols = new Set([normalize(tx.token0Symbol), normalize(tx.token1Symbol)])
  return symbols.has(normalize(token0)) && symbols.has(normalize(token1))
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
  const marcoOnChainPrice = usePriceCakeBusd({ forceMainnet: true })
  const wbnbOnChainPrice = useBUSDPrice(chainId ? WBNB[chainId] : WBNB[56])
  const effectiveBnbUsd = useMemo(() => {
    if (bnbUsdPrice != null && Number.isFinite(bnbUsdPrice) && bnbUsdPrice > 0) return bnbUsdPrice
    const wbnbUsd = wbnbOnChainPrice ? Number(wbnbOnChainPrice.toSignificant(6)) : undefined
    return wbnbUsd != null && Number.isFinite(wbnbUsd) && wbnbUsd > 0 ? wbnbUsd : undefined
  }, [bnbUsdPrice, wbnbOnChainPrice])
  const marcoToken = useMemo(
    () => (chainId === 56 ? new Token(56, MARCO_BSC_ADDRESS, 18, 'MARCO') : undefined),
    [chainId],
  )
  const wbnbToken = chainId ? WNATIVE[chainId] : undefined
  const [[pairState, pair]] = usePairs([[marcoToken, wbnbToken]])

  const reserveLiquidityUsd = useMemo(() => {
    if (!isMarcoRoute || pairState !== PairState.EXISTS || !pair) return undefined
    const marcoUsd = marcoOnChainPrice?.toNumber()
    const bnbUsd = effectiveBnbUsd
    if (!marcoUsd || !bnbUsd) return undefined
    const marcoReserve = pair.token0.symbol === 'MARCO'
      ? getBalanceNumber(pair.reserve0, pair.token0.decimals)
      : getBalanceNumber(pair.reserve1, pair.token1.decimals)
    const bnbReserve = pair.token0.symbol === 'WBNB' || pair.token0.symbol === 'BNB'
      ? getBalanceNumber(pair.reserve0, pair.token0.decimals)
      : getBalanceNumber(pair.reserve1, pair.token1.decimals)
    const total = marcoReserve * marcoUsd + bnbReserve * bnbUsd
    return total > 0 ? total : undefined
  }, [isMarcoRoute, pairState, pair, marcoOnChainPrice, effectiveBnbUsd])

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
      quoteVolumeWbnb > 0 && effectiveBnbUsd != null && Number.isFinite(effectiveBnbUsd)
        ? quoteVolumeWbnb * effectiveBnbUsd
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
    effectiveBnbUsd,
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
    const swapTxs = transactions.filter((tx) => tx.type === TransactionType.SWAP)
    const pairFiltered = swapTxs.filter((tx) => matchesPair(tx, displayInput, displayOutput))
    const source = pairFiltered.length > 0 ? pairFiltered : swapTxs
    return [...source]
      .sort((a, b) => Number(b.timestamp) - Number(a.timestamp))
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
          token0Symbol: tx.token0Symbol,
          token1Symbol: tx.token1Symbol,
          token0Address: tx.token0Address,
          token1Address: tx.token1Address,
          amount: formatUsd(tx.amountUSD) ?? formatTokenAmount(Math.max(tx.amountToken0, tx.amountToken1), tx.token0Symbol) ?? '—',
          amountReason:
            tx.amountUSD > 0 ? undefined : DATA_REASON_LABELS.NO_EVENTS_INDEXED,
          received: receivedAmount,
          receivedReason: receivedAmount ? undefined : 'Swap output amount not indexed',
          direction: swapDirection(tx, displayOutput),
          explorerUrl: bscExplorerTx(tx.hash),
        }
      })
  }, [transactions, displayInput, displayOutput])

  const pairStats = useMemo((): TradePairStat[] => {
    const useCanonicalIndexerStats = useDurableIndexer && isMarcoRoute
    const volChange = useCanonicalIndexerStats ? undefined : formatPct(tokenData?.volumeUSDChange ?? NaN)
    const liqChange = useCanonicalIndexerStats ? undefined : formatPct(tokenData?.liquidityUSDChange ?? NaN)
    const txChange = useCanonicalIndexerStats ? undefined : formatPct(tokenData?.txCountChange ?? NaN)

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

    const volumeValue = useCanonicalIndexerStats
      ? indexedVolumeValue
      : indexedVolumeValue ?? formatUsd(tokenData?.volumeUSD ?? publicMarket?.volume24hUsd ?? 0)
    const liquidityValue =
      reserveLiquidityUsd != null
        ? formatUsd(reserveLiquidityUsd)
        : useCanonicalIndexerStats
          ? undefined
          : formatUsd(tokenData?.liquidityUSD ?? 0)
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
      reserveLiquidityUsd != null
        ? undefined
        : pairState === PairState.EXISTS && isMarcoRoute
          ? 'SUBGRAPH_LOADING'
          : useCanonicalIndexerStats
            ? 'NO_POOL_FOUND'
            : tokenData === undefined && subgraphReport.melegaNativeConfigured
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
        value: indexedTradeValue ?? (useCanonicalIndexerStats ? undefined : tokenData?.txCount ? tokenData.txCount.toLocaleString() : undefined),
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
  }, [tokenData, publicMarket, tokenAddress, holderCount, holderLoading, indexerMetrics24h, transactions, subgraphReport.melegaNativeConfigured, reserveLiquidityUsd, useDurableIndexer, isMarcoRoute, pairState])

  const pairPrice = useMemo(() => {
    const onChain = marcoOnChainPrice?.toNumber()
    if (isMarcoRoute && onChain && onChain > 0) {
      const marcoChange = computeValid24hPriceChange(indexerCandles)
      return {
        value: onChain,
        change24h: marcoChange ? parseFloat(marcoChange.text.replace(/[^0-9.-]/g, '')) : undefined,
        formatted: `$${onChain < 0.01 ? onChain.toFixed(6) : onChain.toFixed(4)}`,
      }
    }
    if (tokenData?.priceUSD) {
      return {
        value: tokenData.priceUSD,
        change24h: tokenData.priceUSDChange,
        formatted: `$${tokenData.priceUSD < 0.01 ? tokenData.priceUSD.toFixed(6) : tokenData.priceUSD.toFixed(4)}`,
      }
    }
    const close = indexerMetrics24h?.lastClose
    if (close != null && close > 0 && Number.isFinite(close)) {
      if (effectiveBnbUsd != null && Number.isFinite(effectiveBnbUsd) && effectiveBnbUsd > 0) {
        const priceUsd = close * effectiveBnbUsd
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
  }, [tokenData, indexerMetrics24h, effectiveBnbUsd, marcoOnChainPrice, isMarcoRoute, indexerCandles])

  const missingReason = useMemo((): TradeDataMissingReason => {
    if (useDurableIndexer && (transactions?.length || indexerCandles.length > 0)) return null
    if (tokenData === undefined) return null
    if (!tokenAddress) return 'route_not_configured'
    if (!tokenData.exists) return 'pair_not_indexed'
    if (!transactions?.length && !tokenData.volumeUSD) return 'subgraph_empty'
    return null
  }, [useDurableIndexer, tokenData, tokenAddress, transactions, indexerCandles.length])

  const missingReasonDetail = useMemo((): string | undefined => {
    if (missingReason === 'pair_not_indexed') return 'MARCO/WBNB pair not indexed in Melega subgraph'
    if (missingReason === 'subgraph_empty') {
      return useDurableIndexer
        ? 'Indexer scope: MARCO/WBNB featured pair — no swap events in current window'
        : 'Subgraph returned no historical candles or swap events'
    }
    if (missingReason === 'route_not_configured') return 'Output token route not configured'
    return undefined
  }, [missingReason, useDurableIndexer])

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

  const tradeReconciliation = useMemo(() => {
    if (!useDurableIndexer || !isMarcoRoute) {
      return { status: 'ready' as TradeReconciliationStatus, reasons: [] }
    }
    const cutoff = Math.floor(Date.now() / 1000) - SECONDS_24H
    const swapEvents24h =
      transactions?.filter(
        (tx) => tx.type === 0 && Number.isFinite(Number(tx.timestamp)) && Number(tx.timestamp) >= cutoff,
      ).length ?? 0
    const liquidityStat = pairStats.find((stat) => stat.id === 'liquidity')
    return reconcileTradeSurface({
      tradeCount24h: indexerMetrics24h?.tradeCount ?? 0,
      volume24h: indexerMetrics24h?.volumeUsd ?? indexerMetrics24h?.quoteVolumeWbnb ?? 0,
      swapEventCount24h: swapEvents24h,
      recentSwaps,
      candles: indexerCandles,
      reserveLiquidityUsd,
      liquidityDisplayed: Boolean(liquidityStat?.value && !liquidityStat.reasonCode),
      indexerPhase: indexerState.status,
      indexerLag: indexerState.indexingLag,
    })
  }, [
    useDurableIndexer,
    isMarcoRoute,
    indexerMetrics24h,
    transactions,
    recentSwaps,
    indexerCandles,
    reserveLiquidityUsd,
    pairStats,
    indexerState,
  ])

  const reconciliationStatus = tradeReconciliation.status
  const reconciliationBlocked = reconciliationStatus === 'inconsistent'

  const gatedPairStats = reconciliationBlocked ? [] : pairStats
  const gatedRecentSwaps = reconciliationBlocked ? [] : recentSwaps

  return {
    recentSwaps: gatedRecentSwaps,
    pairStats: gatedPairStats,
    pairPrice: reconciliationBlocked ? undefined : pairPrice,
    machine: {
      ...machine,
      status: reconciliationStatus,
      reconciliationReasons: tradeReconciliation.reasons,
    },
    missingReason,
    missingReasonDetail,
    canonicalOutputAddress: resolvedOutput,
    displayInput,
    displayOutput,
    isIndexing: isIndexingSwaps,
    isIndexingMetrics,
    hasSwapData: indexerState.status === 'ready',
    reconciliationStatus,
    tradeReconciliation,
    swapEmptyReason:
      reconciliationStatus === 'inconsistent'
        ? 'DATA_INCONSISTENT'
        : reconciliationStatus === 'syncing'
          ? 'INDEXER_SYNCING'
          : reconciliationStatus === 'unavailable'
            ? 'NO_EVENTS_INDEXED'
            : !isActivityIndexing && recentSwaps.length === 0
          ? indexerState.status === 'error' || indexerState.status === 'unavailable'
            ? 'DATA_SOURCE_NOT_CONFIGURED'
            : 'NO_EVENTS_INDEXED'
          : undefined,
    swapDiagnostic:
      reconciliationStatus === 'inconsistent'
        ? {
            ...indexerState,
            reason: 'Trade metrics contradict indexed swap events — reconciliation gate blocked partial display.',
          }
        : !isActivityIndexing && recentSwaps.length === 0
          ? indexerState
          : undefined,
    chartUnavailableDetail:
      reconciliationStatus === 'inconsistent'
        ? 'Reason: Indexed trade count and recent swaps could not be reconciled · Source: bsc-durable-indexer'
        : chartUnavailableDetail,
    indexerState,
    tokenExists: tokenData?.exists,
  }
}

export default useTradeTerminalData
