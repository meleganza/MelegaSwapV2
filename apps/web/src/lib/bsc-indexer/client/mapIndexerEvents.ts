import { Transaction, TransactionType } from 'state/info/types'
import type { NormalizedIndexerEvent } from '../types'

const KNOWN_SYMBOLS: Record<string, string> = {
  '0x963556de0eb8138e97a85f0a86ee0acd159d210b': 'MARCO',
  '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c': 'WBNB',
  '0x55d398326f99059ff775485246999027b3197955': 'USDT',
  '0xe9e7cea3dedca5984780bafc599bd69add087d56': 'BUSD',
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

export function mapIndexerEventToTransaction(event: NormalizedIndexerEvent): Transaction | undefined {
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
    amountUSD: 0,
    amountToken0: Number.isFinite(amountToken0) ? amountToken0 : 0,
    amountToken1: Number.isFinite(amountToken1) ? amountToken1 : 0,
  }
}

export function mapIndexerEventsToTransactions(events: NormalizedIndexerEvent[]): Transaction[] {
  return events
    .map(mapIndexerEventToTransaction)
    .filter((tx): tx is Transaction => tx !== undefined)
}
