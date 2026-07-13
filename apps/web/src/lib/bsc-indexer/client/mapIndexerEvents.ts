import { Transaction, TransactionType } from 'state/info/types'
import type { NormalizedIndexerEvent } from '../types'

const KNOWN_SYMBOLS: Record<string, string> = {
  '0x963556de0eb8138e97a85f0a86ee0acd159d210b': 'MARCO',
  '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c': 'WBNB',
  '0x55d398326f99059ff775485246999027b3197955': 'USDT',
  '0xe9e7cea3dedca5984780bafc599bd69add087d56': 'BUSD',
}

const WBNB_ADDRESS = '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c'
const STABLECOIN_ADDRESSES = new Set([
  '0xe9e7cea3dedca5984780bafc599bd69add087d56', // BUSD
  '0x55d398326f99059ff775485246999027b3197955', // USDT
  '0x8ac76a51cc950d9822d68b83fe1ad97b32ce580d', // USDC
])

export interface IndexerUsdHints {
  bnbUsd?: number
  tokenUsdByAddress?: Record<string, number>
}

function estimateSwapUsd(
  event: NormalizedIndexerEvent,
  hints?: IndexerUsdHints,
): number {
  const token0 = event.token0?.toLowerCase() ?? ''
  const token1 = event.token1?.toLowerCase() ?? ''
  const amount0 = Math.abs(Number(event.amount0 ?? 0))
  const amount1 = Math.abs(Number(event.amount1 ?? 0))

  if (STABLECOIN_ADDRESSES.has(token0) && amount0 > 0) return amount0
  if (STABLECOIN_ADDRESSES.has(token1) && amount1 > 0) return amount1

  const bnbUsd = hints?.bnbUsd
  if (bnbUsd != null && Number.isFinite(bnbUsd) && bnbUsd > 0) {
    if (token0 === WBNB_ADDRESS && amount0 > 0) return amount0 * bnbUsd
    if (token1 === WBNB_ADDRESS && amount1 > 0) return amount1 * bnbUsd
  }

  const price0 = hints?.tokenUsdByAddress?.[token0]
  const price1 = hints?.tokenUsdByAddress?.[token1]
  if (price0 != null && amount0 > 0) return amount0 * price0
  if (price1 != null && amount1 > 0) return amount1 * price1

  return 0
}

function shortenAddress(address?: string): string {
  if (!address || address.length < 10) return '???'
  return `${address.slice(0, 6)}…${address.slice(-4)}`
}

function tokenSymbol(address?: string): string {
  if (!address) return '???'
  const key = address.toLowerCase()
  return KNOWN_SYMBOLS[key] ?? shortenAddress(key)
}

function toTransactionType(eventType: NormalizedIndexerEvent['eventType']): TransactionType | undefined {
  if (eventType === 'Swap') return TransactionType.SWAP
  if (eventType === 'Mint') return TransactionType.MINT
  if (eventType === 'Burn') return TransactionType.BURN
  return undefined
}

export function mapIndexerEventToTransaction(
  event: NormalizedIndexerEvent,
  hints?: IndexerUsdHints,
): Transaction | undefined {
  const type = toTransactionType(event.eventType)
  if (type === undefined) return undefined

  const token0 = event.token0?.toLowerCase() ?? ''
  const token1 = event.token1?.toLowerCase() ?? ''
  const amountToken0 = Number(event.amount0 ?? 0)
  const amountToken1 = Number(event.amount1 ?? 0)

  return {
    type,
    hash: event.txHash,
    timestamp: String(event.blockTimestamp || 0),
    sender: event.wallet ?? '',
    token0Symbol: tokenSymbol(token0),
    token1Symbol: tokenSymbol(token1),
    token0Address: token0,
    token1Address: token1,
    amountUSD: estimateSwapUsd(event, hints),
    amountToken0: Number.isFinite(amountToken0) ? amountToken0 : 0,
    amountToken1: Number.isFinite(amountToken1) ? amountToken1 : 0,
  }
}

export function mapIndexerEventsToTransactions(
  events: NormalizedIndexerEvent[],
  hints?: IndexerUsdHints,
): Transaction[] {
  return events
    .map((event) => mapIndexerEventToTransaction(event, hints))
    .filter((tx): tx is Transaction => tx !== undefined)
}
