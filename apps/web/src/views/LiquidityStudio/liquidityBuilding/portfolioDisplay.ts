/**
 * Portfolio display helpers — symbols, pair labels, status, amounts.
 */
import { formatLbTokenAmount } from './formatLbAmount'
import type { LbIndexedLifecycle, LbProgramApiRow } from 'lib/liquidity-builder-indexer/types'

const KNOWN_SYMBOLS: Record<string, string> = {
  '0x963556de0eb8138e97a85f0a86ee0acd159d210b': 'MARCO',
  '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c': 'WBNB',
  '0x55d398326f99059ff775485246999027b3197955': 'USDT',
  '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d': 'USDC',
}

export function symbolForAddress(address: string | null | undefined): string {
  if (!address) return 'TOKEN'
  const key = address.toLowerCase()
  if (KNOWN_SYMBOLS[key]) return KNOWN_SYMBOLS[key]
  return `${address.slice(0, 6)}…${address.slice(-4)}`
}

export function pairLabelForProgram(p: Pick<LbProgramApiRow, 'token' | 'quoteAsset'>): string {
  return `${symbolForAddress(p.token)}/${symbolForAddress(p.quoteAsset)}`
}

export function statusDisplay(status: LbIndexedLifecycle | string): string {
  const s = String(status)
  if (s === 'Active') return 'ACTIVE'
  if (s === 'Paused' || s === 'SafetyPaused') return 'PAUSED'
  if (s === 'Stopped') return 'STOPPED'
  if (s === 'Ready') return 'READY'
  if (s === 'Created') return 'CREATED'
  return s.toUpperCase()
}

export function formatReserveLabel(raw: string | null | undefined, tokenAddress: string | null): string {
  const symbol = symbolForAddress(tokenAddress)
  if (!raw) return `— ${symbol}`
  return formatLbTokenAmount(raw, 18, symbol) ?? `${raw} ${symbol}`
}

export function portfolioSummary(programs: LbProgramApiRow[]) {
  const active = programs.filter((p) => p.status === 'Active' || p.status === 'Paused' || p.status === 'SafetyPaused')
  return {
    activeCount: active.length,
    totalPrograms: programs.length,
    /** Honest: wei sum only when parseable; display as count of reserves with values. */
    reservesWithValue: programs.filter((p) => p.reserve && p.reserve !== '0').length,
    totalExecutions: programs.reduce((n, p) => n + (p.executionCount || 0), 0),
    feesWithValue: programs.filter((p) => p.totalFeePaid && p.totalFeePaid !== '0').length,
  }
}
