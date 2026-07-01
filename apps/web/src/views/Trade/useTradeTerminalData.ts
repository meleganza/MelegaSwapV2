import { useMemo } from 'react'
import { Transaction, TransactionType } from 'state/info/types'
import { useProtocolTransactionsSWR, useTokenDataSWR } from 'state/info/hooks'
import { getTokenAddress } from 'views/Swap/components/Chart/utils'

export interface TradeSwapRow {
  id: string
  time: string
  wallet: string
  pair: string
  amount: string
  direction: 'buy' | 'sell'
}

export interface TradePairStat {
  id: string
  label: string
  value?: string
  change?: string
  changePositive?: boolean
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

const matchesPair = (tx: Transaction, token0?: string, token1?: string): boolean => {
  if (!token0 || !token1) return true
  const symbols = new Set([tx.token0Symbol.toUpperCase(), tx.token1Symbol.toUpperCase()])
  return symbols.has(token0.toUpperCase()) && symbols.has(token1.toUpperCase())
}

export const useTradeTerminalData = (inputSymbol?: string, outputSymbol?: string, outputAddress?: string) => {
  const transactions = useProtocolTransactionsSWR()
  const tokenAddress = outputAddress ? getTokenAddress(outputAddress) : undefined
  const tokenData = useTokenDataSWR(tokenAddress)

  const recentSwaps = useMemo((): TradeSwapRow[] => {
    if (!transactions?.length) return []
    return transactions
      .filter((tx) => tx.type === TransactionType.SWAP)
      .filter((tx) => matchesPair(tx, inputSymbol, outputSymbol))
      .slice(0, 12)
      .map((tx) => ({
        id: tx.hash,
        time: formatTimeAgo(tx.timestamp),
        wallet: shortenWallet(tx.sender),
        pair: `${tx.token0Symbol} / ${tx.token1Symbol}`,
        amount: formatUsd(tx.amountUSD) ?? '—',
        direction: swapDirection(tx, outputSymbol),
      }))
  }, [transactions, inputSymbol, outputSymbol])

  const pairStats = useMemo((): TradePairStat[] => {
    const volChange = formatPct(tokenData?.volumeUSDChange ?? NaN)
    const liqChange = formatPct(tokenData?.liquidityUSDChange ?? NaN)
    const priceChange = formatPct(tokenData?.priceUSDChange ?? NaN)

    return [
      {
        id: 'volume',
        label: '24H Volume',
        value: formatUsd(tokenData?.volumeUSD ?? 0),
        change: volChange?.text,
        changePositive: volChange?.positive,
      },
      {
        id: 'liquidity',
        label: 'Liquidity',
        value: formatUsd(tokenData?.liquidityUSD ?? 0),
        change: liqChange?.text,
        changePositive: liqChange?.positive,
      },
      {
        id: 'tvl',
        label: 'TVL',
        value: formatUsd(tokenData?.liquidityUSD ?? 0),
        change: liqChange?.text,
        changePositive: liqChange?.positive,
      },
      {
        id: 'holders',
        label: 'Holders',
        value: undefined,
      },
      {
        id: 'transactions',
        label: 'Transactions',
        value: tokenData?.txCount ? tokenData.txCount.toLocaleString() : undefined,
        change: priceChange?.text,
        changePositive: priceChange?.positive,
      },
    ]
  }, [tokenData])

  const pairPrice = useMemo(() => {
    if (!tokenData?.priceUSD) return undefined
    return {
      value: tokenData.priceUSD,
      change24h: tokenData.priceUSDChange,
      formatted: `$${tokenData.priceUSD < 0.01 ? tokenData.priceUSD.toFixed(6) : tokenData.priceUSD.toFixed(4)}`,
    }
  }, [tokenData])

  return {
    recentSwaps,
    pairStats,
    pairPrice,
    isIndexing: !transactions && !tokenData,
  }
}

export default useTradeTerminalData
