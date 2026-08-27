import { useMemo } from 'react'
import useSWR from 'swr'
import { Pair, Token, WBNB, WNATIVE } from '@pancakeswap/sdk'
import { Transaction, TransactionType } from 'state/info/types'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { useCurrency } from 'hooks/Tokens'
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
import useBUSDPrice from 'hooks/useBUSDPrice'
import useTotalSupply from 'hooks/useTotalSupply'
import { PairState, usePair, usePairs } from 'hooks/usePairs'
import type { MarcoPairLiquiditySnapshot } from 'lib/trade-market/fetchMarcoPairLiquidity'
import { computeMarcoPairMarket } from 'lib/trade-market/computeMarcoPairMarket'
import { findExactProjectDexPair, type ProjectDexAnalytics } from 'lib/market-data/projectDexAnalytics'
import { usePairTrades } from 'lib/market-data/usePairTrades'
import { formatCompactPriceUsd } from 'utils/formatCompactPrice'
import { publicTradeMatchesPair, resolveTradeMarketOrientation, transactionMatchesPair } from './tradePairTruth'

const SECONDS_24H = 86_400

type TokenPairsResponse = {
  analytics: ProjectDexAnalytics
}

async function fetchTokenPairs(url: string): Promise<TokenPairsResponse> {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`TOKEN_PAIRS_HTTP_${response.status}`)
  return response.json()
}

async function fetchBnbUsdPrice(): Promise<number | undefined> {
  try {
    const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=binancecoin&vs_currencies=usd', {
      headers: { accept: 'application/json' },
    })
    if (!res.ok) return undefined
    const json = (await res.json()) as { binancecoin?: { usd?: number } }
    const usd = json.binancecoin?.usd
    return usd != null && Number.isFinite(usd) && usd > 0 ? usd : undefined
  } catch {
    return undefined
  }
}

async function fetchMarcoPairLiquiditySnapshot(): Promise<MarcoPairLiquiditySnapshot | undefined> {
  try {
    const response = await fetch('/api/trade/pair-liquidity', {
      headers: { accept: 'application/json' },
    })
    if (!response.ok) return undefined
    const snapshot = (await response.json()) as MarcoPairLiquiditySnapshot
    return snapshot.status === 'ready' && snapshot.liquidityUsd > 0 ? snapshot : undefined
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
  holder_source: 'binplorer' | 'bscscan'
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

const explorerTx = (chainId: number | undefined, hash: string): string => {
  const base =
    chainId === 1
      ? 'https://etherscan.io'
      : chainId === 137
      ? 'https://polygonscan.com'
      : chainId === 8453
      ? 'https://basescan.org'
      : chainId === 42161
      ? 'https://arbiscan.io'
      : chainId === 43114
      ? 'https://snowtrace.io'
      : 'https://bscscan.com'
  return `${base}/tx/${hash}`
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

export const useTradeTerminalData = (
  inputSymbol?: string,
  outputSymbol?: string,
  outputAddress?: string,
  inputAddress?: string,
) => {
  const { chainId } = useActiveChainId()
  const chainName = useGetChainName()
  const subgraphReport = useMemo(() => resolveSubgraphEndpointReport(), [])
  const useDurableIndexer = Boolean(chainName === 'BSC' && !subgraphReport.melegaNativeConfigured)
  const inputCurrency = useCurrency(inputAddress)
  const outputCurrency = useCurrency(outputAddress)
  const market = useMemo(
    () =>
      resolveTradeMarketOrientation({
        inputSymbol: inputSymbol ?? 'Select token',
        outputSymbol: outputSymbol ?? 'Select token',
        inputCurrencyId: inputAddress,
        outputCurrencyId: outputAddress,
      }),
    [inputSymbol, outputSymbol, inputAddress, outputAddress],
  )
  const resolvedOutput = resolveCanonicalOutputAddress(chainId, outputSymbol, outputAddress)
  const resolvedInput = resolveCanonicalOutputAddress(chainId, inputSymbol, inputAddress)
  const marketBaseCurrency = market.baseSide === 'input' ? inputCurrency : outputCurrency
  const marketQuoteCurrency = market.quoteSide === 'input' ? inputCurrency : outputCurrency
  const marketBaseAddress =
    marketBaseCurrency?.wrapped.address ?? (market.baseSide === 'input' ? resolvedInput : resolvedOutput)
  const marketQuoteAddress =
    marketQuoteCurrency?.wrapped.address ?? (market.quoteSide === 'input' ? resolvedInput : resolvedOutput)
  const tokenAddress = marketBaseAddress
  const [selectedPairState, selectedPair] = usePair(inputCurrency, outputCurrency)
  const exactPairAddress = selectedPairState === PairState.EXISTS ? selectedPair?.liquidityToken.address : undefined
  const deterministicPairAddress = useMemo(() => {
    const tokenA = inputCurrency?.wrapped
    const tokenB = outputCurrency?.wrapped
    if (!tokenA || !tokenB || tokenA.equals(tokenB)) return undefined
    try {
      return Pair.getAddress(tokenA, tokenB)
    } catch {
      return undefined
    }
  }, [inputCurrency, outputCurrency])
  const wrappedInputAddress = inputCurrency?.wrapped.address.toLowerCase()
  const wrappedOutputAddress = outputCurrency?.wrapped.address.toLowerCase()
  const canonicalMarco = MARCO_BSC_ADDRESS.toLowerCase()
  const canonicalWbnb = chainId ? WNATIVE[chainId]?.address.toLowerCase() : undefined
  const isCanonicalMarcoWbnbPair = Boolean(
    chainId === 56 &&
      canonicalWbnb &&
      [wrappedInputAddress, wrappedOutputAddress].includes(canonicalMarco) &&
      [wrappedInputAddress, wrappedOutputAddress].includes(canonicalWbnb),
  )
  const selectedPairAddress =
    exactPairAddress ??
    (isCanonicalMarcoWbnbPair ? MARCO_WBNB_PAIR_BSC : undefined) ??
    (selectedPairState === PairState.LOADING ? deterministicPairAddress : undefined)
  const { data: tokenPairsData } = useSWR<TokenPairsResponse>(
    chainId && tokenAddress
      ? `/api/market-data/token-pairs?chainId=${chainId}&address=${encodeURIComponent(tokenAddress)}`
      : null,
    fetchTokenPairs,
    { refreshInterval: 60_000, revalidateOnFocus: false, dedupingInterval: 45_000 },
  )
  const externalDex = tokenPairsData?.analytics
  const exactDexPair = findExactProjectDexPair(externalDex, selectedPairAddress)
  const publicPairTrades = usePairTrades(chainId, selectedPairAddress, tokenAddress)
  const tokenData = useTokenDataSWR(tokenAddress)
  const { data: holderCount, isLoading: holderLoading } = useHolderCount(chainId, tokenAddress)
  const { transactions, indexerState, isActivityIndexing } = useProtocolTransactionsIndexer(
    selectedPairAddress,
    Boolean(selectedPairAddress),
  )
  const { data: publicMarket } = useSWR(
    isCanonicalMarcoWbnbPair ? 'trade-marco-coingecko-market' : null,
    fetchMarcoPublicMarket,
    {
      refreshInterval: 120_000,
      revalidateOnFocus: false,
    },
  )
  const { candles: indexerCandles, status: indexerCandleStatus } = useIndexerCandles(
    selectedPairAddress,
    '1H',
    useDurableIndexer && Boolean(selectedPairAddress),
  )
  const { data: bnbUsdPrice } = useSWR(
    useDurableIndexer && isCanonicalMarcoWbnbPair ? 'trade-bnb-usd-coingecko' : null,
    fetchBnbUsdPrice,
    { refreshInterval: 120_000, revalidateOnFocus: false },
  )
  const { data: indexedPairLiquidity } = useSWR(
    useDurableIndexer && isCanonicalMarcoWbnbPair ? 'trade-marco-wbnb-reserve-liquidity' : null,
    fetchMarcoPairLiquiditySnapshot,
    { refreshInterval: 60_000, revalidateOnFocus: false },
  )
  const wbnbOnChainPrice = useBUSDPrice(chainId ? WBNB[chainId] : WBNB[56])
  const marketBaseOnChainPrice = useBUSDPrice(marketBaseCurrency)
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
  const marcoTotalSupply = useTotalSupply(marcoToken)

  const marcoPairMarket = useMemo(() => {
    if (!isCanonicalMarcoWbnbPair || pairState !== PairState.EXISTS || !pair) return undefined
    const nativeUsd = effectiveBnbUsd
    const marcoReserve =
      pair.token0.symbol === 'MARCO' ? Number(pair.reserve0.toSignificant(18)) : Number(pair.reserve1.toSignificant(18))
    const bnbReserve =
      pair.token0.symbol === 'WBNB' || pair.token0.symbol === 'BNB'
        ? Number(pair.reserve0.toSignificant(18))
        : Number(pair.reserve1.toSignificant(18))
    const totalSupply = marcoTotalSupply ? Number(marcoTotalSupply.toSignificant(18)) : undefined
    return computeMarcoPairMarket({ marcoReserve, nativeReserve: bnbReserve, nativeUsd: nativeUsd ?? 0, totalSupply })
  }, [isCanonicalMarcoWbnbPair, pairState, pair, effectiveBnbUsd, marcoTotalSupply])

  const reserveLiquidityUsd =
    indexedPairLiquidity?.liquidityUsd && indexedPairLiquidity.liquidityUsd > 0
      ? indexedPairLiquidity.liquidityUsd
      : marcoPairMarket?.liquidityUsd

  const onChainFdvUsd = marcoPairMarket?.fdvUsd

  const indexerMetrics24h = useMemo(() => {
    if (!useDurableIndexer || !selectedPairAddress) return undefined
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
    const resolvedTradeCount = tradeCount > 0 ? tradeCount : txCount24h
    const quoteIsWbnb = Boolean(
      marketQuoteAddress && canonicalWbnb && marketQuoteAddress.toLowerCase() === canonicalWbnb,
    )
    const volumeUsd =
      quoteIsWbnb && quoteVolumeWbnb > 0 && effectiveBnbUsd != null && Number.isFinite(effectiveBnbUsd)
        ? quoteVolumeWbnb * effectiveBnbUsd
        : undefined
    const hasData = resolvedTradeCount > 0 || quoteVolumeWbnb > 0 || indexerCandleStatus === 'ready'
    if (!hasData) return undefined
    return {
      volumeUsd,
      quoteVolumeWbnb: quoteIsWbnb && quoteVolumeWbnb > 0 ? quoteVolumeWbnb : undefined,
      tradeCount: resolvedTradeCount,
      lastClose: indexerCandles[indexerCandles.length - 1]?.close,
    }
  }, [
    useDurableIndexer,
    selectedPairAddress,
    indexerCandles,
    transactions,
    effectiveBnbUsd,
    indexerCandleStatus,
    marketQuoteAddress,
    canonicalWbnb,
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

  const displayInput = market.baseSymbol
  const displayOutput = market.quoteSymbol

  const recentSwaps = useMemo((): TradeSwapRow[] => {
    const swapTxs = transactions?.filter((tx) => tx.type === TransactionType.SWAP) ?? []
    const pairFiltered = swapTxs.filter((tx) =>
      transactionMatchesPair(tx, marketBaseAddress, marketQuoteAddress, displayInput, displayOutput),
    )
    const indexedRows = [...pairFiltered]
      .sort((a, b) => Number(b.timestamp) - Number(a.timestamp))
      .slice(0, 12)
      .map((tx): TradeSwapRow => {
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
          amount:
            formatUsd(tx.amountUSD) ??
            formatTokenAmount(Math.max(tx.amountToken0, tx.amountToken1), tx.token0Symbol) ??
            '—',
          amountReason: tx.amountUSD > 0 ? undefined : DATA_REASON_LABELS.NO_EVENTS_INDEXED,
          received: receivedAmount,
          receivedReason: receivedAmount ? undefined : 'Swap output amount not indexed',
          direction: swapDirection(tx, displayOutput),
          explorerUrl: explorerTx(chainId, tx.hash),
        }
      })
    if (indexedRows.length > 0) return indexedRows

    return publicPairTrades.trades
      .filter((trade) => publicTradeMatchesPair(trade, marketBaseAddress, marketQuoteAddress))
      .slice(0, 12)
      .map((trade): TradeSwapRow => {
        const selectedIsBase = trade.selectedTokenAddress === trade.baseTokenAddress
        const token0Symbol = trade.selectedTokenSymbol
        const token1Symbol = selectedIsBase ? trade.quoteTokenSymbol : trade.baseTokenSymbol
        const token0Address = selectedIsBase ? trade.baseTokenAddress : trade.quoteTokenAddress
        const token1Address = selectedIsBase ? trade.quoteTokenAddress : trade.baseTokenAddress
        const selectedAmount = formatTokenAmount(Number(trade.selectedTokenAmount), trade.selectedTokenSymbol)
        return {
          id: trade.id,
          time: formatTimeAgo(String(trade.timestamp)),
          wallet: shortenWallet(trade.wallet),
          pair: `${token0Symbol} / ${token1Symbol}`,
          token0Symbol,
          token1Symbol,
          token0Address,
          token1Address,
          amount: formatUsd(trade.amountUsd ?? 0) ?? selectedAmount ?? '—',
          amountReason: trade.amountUsd != null ? undefined : 'USD volume unavailable from public pair feed',
          direction: trade.direction,
          explorerUrl: explorerTx(chainId, trade.txHash),
        }
      })
  }, [
    transactions,
    marketBaseAddress,
    marketQuoteAddress,
    displayInput,
    displayOutput,
    publicPairTrades.trades,
    chainId,
  ])

  const pairStats = useMemo((): TradePairStat[] => {
    const useCanonicalIndexerStats = useDurableIndexer && isCanonicalMarcoWbnbPair

    const indexedVolumeValue =
      indexerMetrics24h?.volumeUsd != null
        ? formatUsd(indexerMetrics24h.volumeUsd)
        : indexerMetrics24h?.quoteVolumeWbnb != null
        ? `${
            indexerMetrics24h.quoteVolumeWbnb < 0.01
              ? indexerMetrics24h.quoteVolumeWbnb.toFixed(6)
              : indexerMetrics24h.quoteVolumeWbnb.toFixed(4)
          } WBNB`
        : undefined
    const indexedTradeValue =
      indexerMetrics24h?.tradeCount != null && indexerMetrics24h.tradeCount > 0
        ? indexerMetrics24h.tradeCount.toLocaleString()
        : undefined

    const volumeValue =
      indexedVolumeValue ??
      (exactDexPair?.volume24hUsd != null
        ? formatUsd(exactDexPair.volume24hUsd)
        : useCanonicalIndexerStats
        ? formatUsd(publicMarket?.volume24hUsd ?? 0)
        : undefined)
    const liquidityValue =
      reserveLiquidityUsd != null
        ? formatUsd(reserveLiquidityUsd)
        : exactDexPair?.liquidityUsd != null
        ? formatUsd(exactDexPair.liquidityUsd)
        : undefined
    const providerBaseMatchesMarket =
      Boolean(tokenAddress) && exactDexPair?.baseTokenAddress?.toLowerCase() === tokenAddress?.toLowerCase()
    const mcapValue = formatCompactUsd(
      providerBaseMatchesMarket ? exactDexPair?.marketCapUsd ?? undefined : publicMarket?.marketCapUsd,
    )
    const fdvValue = formatCompactUsd(
      providerBaseMatchesMarket
        ? exactDexPair?.fdvUsd ?? undefined
        : publicMarket?.fdvUsd ?? (isCanonicalMarcoWbnbPair ? onChainFdvUsd : undefined),
    )
    const supplyValue = formatSupply(publicMarket?.circulatingSupply)

    const volumeReason: DataReasonCode | undefined = indexedVolumeValue
      ? undefined
      : selectedPairState === PairState.LOADING
      ? 'SUBGRAPH_LOADING'
      : !selectedPairAddress
      ? 'PAIR_NOT_INDEXED'
      : exactDexPair?.volume24hUsd == null && !publicMarket?.volume24hUsd
      ? 'NO_EVENTS_INDEXED'
      : undefined

    const liquidityReason: DataReasonCode | undefined =
      reserveLiquidityUsd != null
        ? undefined
        : selectedPairState === PairState.LOADING
        ? 'SUBGRAPH_LOADING'
        : exactDexPair?.liquidityUsd != null
        ? undefined
        : !selectedPairAddress
        ? 'NO_POOL_FOUND'
        : 'NO_POOL_FOUND'

    const externalTrades =
      exactDexPair?.transactions24h != null ? exactDexPair.transactions24h.toLocaleString() : undefined
    const tradesReason: DataReasonCode | undefined =
      indexedTradeValue || externalTrades
        ? undefined
        : selectedPairState === PairState.LOADING
        ? 'SUBGRAPH_LOADING'
        : !selectedPairAddress
        ? 'PAIR_NOT_INDEXED'
        : !transactions?.length
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
        reasonCode: volumeReason,
      },
      {
        id: 'liquidity',
        label: 'Liquidity',
        value: liquidityValue,
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
        value: indexedTradeValue ?? externalTrades,
        reasonCode: tradesReason,
      },
      {
        id: 'holders',
        label: 'Holders',
        value: !tokenAddress ? RUNTIME_UNAVAILABLE_LABEL : resolveHolderMetric(holderCount, holderLoading).display,
        reasonCode: !tokenAddress
          ? 'DATA_SOURCE_NOT_CONFIGURED'
          : holderLoading
          ? undefined
          : holderCount?.status === 'ready'
          ? undefined
          : 'EXPLORER_SOURCE_MISSING',
      },
    ]
  }, [
    tokenData,
    publicMarket,
    tokenAddress,
    holderCount,
    holderLoading,
    indexerMetrics24h,
    transactions,
    reserveLiquidityUsd,
    useDurableIndexer,
    isCanonicalMarcoWbnbPair,
    selectedPairState,
    selectedPairAddress,
    onChainFdvUsd,
    exactDexPair,
  ])

  const pairPrice = useMemo(() => {
    const onChain = marcoPairMarket?.priceUsd
    if (isCanonicalMarcoWbnbPair && onChain && onChain > 0) {
      const marcoChange = computeValid24hPriceChange(indexerCandles)
      return {
        value: onChain,
        change24h: marcoChange ? parseFloat(marcoChange.text.replace(/[^0-9.-]/g, '')) : undefined,
        formatted: formatCompactPriceUsd(onChain),
      }
    }
    const providerBaseMatchesMarket =
      Boolean(tokenAddress) && exactDexPair?.baseTokenAddress?.toLowerCase() === tokenAddress?.toLowerCase()
    if (providerBaseMatchesMarket && exactDexPair?.priceUsd != null && exactDexPair.priceUsd > 0) {
      return {
        value: exactDexPair.priceUsd,
        change24h: exactDexPair.priceChange24h ?? undefined,
        formatted: formatCompactPriceUsd(exactDexPair.priceUsd),
      }
    }
    const selectedTokenUsd = marketBaseOnChainPrice ? Number(marketBaseOnChainPrice.toSignificant(12)) : undefined
    if (selectedPairAddress && selectedTokenUsd != null && Number.isFinite(selectedTokenUsd) && selectedTokenUsd > 0) {
      return {
        value: selectedTokenUsd,
        change24h: exactDexPair?.priceChange24h ?? undefined,
        formatted: formatCompactPriceUsd(selectedTokenUsd),
      }
    }
    const close = indexerMetrics24h?.lastClose
    const quoteIsWbnb = Boolean(
      marketQuoteAddress && canonicalWbnb && marketQuoteAddress.toLowerCase() === canonicalWbnb,
    )
    if (quoteIsWbnb && close != null && close > 0 && Number.isFinite(close)) {
      if (effectiveBnbUsd != null && Number.isFinite(effectiveBnbUsd) && effectiveBnbUsd > 0) {
        const priceUsd = close * effectiveBnbUsd
        if (Number.isFinite(priceUsd) && priceUsd > 0) {
          return {
            value: priceUsd,
            change24h: undefined,
            formatted: formatCompactPriceUsd(priceUsd),
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
  }, [
    indexerMetrics24h,
    effectiveBnbUsd,
    marcoPairMarket?.priceUsd,
    isCanonicalMarcoWbnbPair,
    indexerCandles,
    exactDexPair,
    tokenAddress,
    marketBaseOnChainPrice,
    selectedPairAddress,
    marketQuoteAddress,
    canonicalWbnb,
  ])

  const missingReason = useMemo((): TradeDataMissingReason => {
    if (!marketBaseAddress || !marketQuoteAddress) return 'route_not_configured'
    if (selectedPairState === PairState.LOADING) return null
    if (!selectedPairAddress) return 'pair_not_indexed'
    if (useDurableIndexer && (transactions?.length || indexerCandles.length > 0)) return null
    if (exactDexPair || publicPairTrades.status === 'ready') return null
    if (isActivityIndexing || publicPairTrades.status === 'loading') return null
    if (!transactions?.length) return 'subgraph_empty'
    return null
  }, [
    marketBaseAddress,
    marketQuoteAddress,
    selectedPairState,
    selectedPairAddress,
    useDurableIndexer,
    transactions,
    indexerCandles.length,
    exactDexPair,
    publicPairTrades.status,
    isActivityIndexing,
  ])

  const missingReasonDetail = useMemo((): string | undefined => {
    if (missingReason === 'pair_not_indexed')
      return `${market.baseSymbol}/${market.quoteSymbol} pool not found on Melega DEX`
    if (missingReason === 'subgraph_empty') {
      return `${market.baseSymbol}/${market.quoteSymbol} has no indexed candles or swap events in the current window`
    }
    if (missingReason === 'route_not_configured') return 'Select both assets to load exact pair data'
    return undefined
  }, [missingReason, market.baseSymbol, market.quoteSymbol])

  const chartUnavailableDetail = useMemo((): string | undefined => {
    if (selectedPairAddress) return undefined
    if (missingReason === 'pair_not_indexed') {
      return `Reason: Pair not indexed · Source: melega-subgraph · Indexer: ${indexerState.indexer}`
    }
    if (missingReason === 'subgraph_empty') {
      return `Reason: ${indexerState.reason ?? 'No indexed candles or swaps'} · Source: ${
        indexerState.source
      } · Indexer: ${indexerState.indexer}`
    }
    if (missingReason === 'route_not_configured') {
      return 'Reason: Select both assets to load exact pair data · Source: trade-runtime'
    }
    if (indexerState.status === 'error' || indexerState.status === 'unavailable') {
      return `Reason: ${indexerState.reason ?? 'Chart data unavailable'} · Source: ${indexerState.source} · Indexer: ${
        indexerState.indexer
      }`
    }
    if (tokenData === undefined) {
      return `Reason: Token metrics loading · Source: melega-subgraph · Indexer: ${indexerState.indexer}`
    }
    return undefined
  }, [missingReason, indexerState, tokenData, selectedPairAddress])

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
        indexerState.status === 'loading' ? 'loading' : transactions && transactions.length > 0 ? 'ready' : 'empty',
      subgraphEndpoint: indexerState.configuredEndpoint,
      subgraphBlocker: indexerState.blockerCode,
      tokenMetrics: tokenData === undefined ? 'loading' : tokenData.exists ? 'ready' : 'missing',
      reasonCodes,
      dataSources: exactDexPair
        ? ['geckoterminal-public-pair', 'on-chain-multicall', 'presence-registry']
        : useDurableIndexer
        ? ['bsc-durable-indexer', 'on-chain-multicall', 'presence-registry']
        : ['melega-subgraph', 'on-chain-multicall', 'presence-registry'],
      primaryActions: ['view_chart', 'view_recent_swaps', 'swap'],
      runtimeLinks: ['/command-center', '/liquidity-studio', '/trending'],
      missingReason,
      missingReasonDetail,
      ...holderMachine,
      timestamp: new Date().toISOString(),
    }
  }, [
    transactions,
    tokenData,
    pairStats,
    missingReason,
    missingReasonDetail,
    indexerState,
    holderCount,
    subgraphReport,
    useDurableIndexer,
    exactDexPair,
  ])

  const isIndexingSwaps = (isActivityIndexing || publicPairTrades.status === 'loading') && recentSwaps.length === 0
  const isIndexingMetrics =
    selectedPairState === PairState.LOADING ||
    (!useDurableIndexer &&
      subgraphReport.melegaNativeConfigured &&
      tokenData === undefined &&
      Boolean(tokenAddress) &&
      !publicMarket)

  const tradeReconciliation = useMemo(() => {
    if (!useDurableIndexer || !isCanonicalMarcoWbnbPair) {
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
    isCanonicalMarcoWbnbPair,
    indexerMetrics24h,
    transactions,
    recentSwaps,
    indexerCandles,
    reserveLiquidityUsd,
    pairStats,
    indexerState,
  ])

  const reconciliationStatus = tradeReconciliation.status

  return {
    // Reconciliation is a diagnostic signal, not permission to erase independently
    // indexed facts. A temporary source mismatch must never blank the whole Trade UI.
    recentSwaps,
    pairStats,
    pairPrice,
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
    hasSwapData: indexerState.status === 'ready' || publicPairTrades.status === 'ready',
    reconciliationStatus,
    tradeReconciliation,
    swapEmptyReason:
      recentSwaps.length > 0
        ? undefined
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
            reason: 'Indexer sources are reconciling. Independently verified metrics remain visible.',
          }
        : selectedPairAddress && !isIndexingSwaps && recentSwaps.length === 0
        ? {
            source: publicPairTrades.source,
            indexer: selectedPairAddress,
            lastAttempt: publicPairTrades.generatedAt ?? new Date().toISOString(),
            reason:
              publicPairTrades.reason ??
              (publicPairTrades.status === 'empty' ? 'No recent swaps returned for the selected pool' : undefined),
          }
        : !isActivityIndexing && recentSwaps.length === 0
        ? indexerState
        : undefined,
    chartUnavailableDetail,
    primaryPairAddress: selectedPairAddress,
    marketBaseSymbol: market.baseSymbol,
    marketQuoteSymbol: market.quoteSymbol,
    marketBaseCurrencyId: market.baseCurrencyId,
    marketQuoteCurrencyId: market.quoteCurrencyId,
    indexerState,
    tokenExists: tokenData?.exists,
  }
}

export default useTradeTerminalData
