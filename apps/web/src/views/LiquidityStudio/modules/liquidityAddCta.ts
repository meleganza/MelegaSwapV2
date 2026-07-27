/**
 * LIQUIDITY_MODULE_004 — CTA / error mapping (pure).
 * Mirrors liquidityRuntime approval → mint host; no second execution path.
 */
import type { LiquidityAddCtaState } from './liquidityAddTokens'

export type ApprovalLike = 'UNKNOWN' | 'NOT_APPROVED' | 'PENDING' | 'APPROVED'

export function resolveLiquidityAddCta(input: {
  account?: string | null
  approvalA: ApprovalLike
  approvalB: ApprovalLike
  errorCode?: string | null
  wrongChain?: boolean
  completed?: boolean
}): { state: LiquidityAddCtaState; label: string; disabled: boolean } {
  if (input.wrongChain) {
    return { state: 'wrong-chain', label: 'Wrong Network', disabled: true }
  }
  if (!input.account) {
    return { state: 'connect', label: 'Connect Wallet', disabled: false }
  }
  if (input.completed) {
    return { state: 'completed', label: 'Completed', disabled: true }
  }
  if (input.errorCode === 'INSUFFICIENT_TOKEN_A' || input.errorCode === 'INSUFFICIENT_TOKEN_B') {
    return { state: 'insufficient', label: 'Insufficient Balance', disabled: true }
  }
  if (
    input.errorCode === 'LIQUIDITY_POOL_NOT_FOUND' ||
    input.errorCode === 'POOL_CLOSED' ||
    input.errorCode === 'NETWORK_UNAVAILABLE'
  ) {
    return { state: 'unavailable', label: 'Pool Unavailable', disabled: true }
  }
  if (input.approvalA === 'PENDING' || input.approvalB === 'PENDING') {
    return { state: 'confirming', label: 'Confirming', disabled: true }
  }
  if (input.approvalA === 'NOT_APPROVED') {
    return { state: 'approve-a', label: 'Approve Token A', disabled: false }
  }
  if (input.approvalB === 'NOT_APPROVED') {
    return { state: 'approve-b', label: 'Approve Token B', disabled: false }
  }
  if (input.errorCode === 'UNKNOWN' || input.errorCode === 'INVALID_RATIO' || input.errorCode === 'SLIPPAGE_TOO_HIGH') {
    return { state: 'failed', label: 'Add Liquidity', disabled: false }
  }
  return { state: 'add', label: 'Add Liquidity', disabled: false }
}

export function mapApprovalState(value: number | string): ApprovalLike {
  // ApprovalState enum: UNKNOWN=0, NOT_APPROVED=1, PENDING=2, APPROVED=3
  if (value === 1 || value === 'NOT_APPROVED') return 'NOT_APPROVED'
  if (value === 2 || value === 'PENDING') return 'PENDING'
  if (value === 3 || value === 'APPROVED') return 'APPROVED'
  return 'UNKNOWN'
}

export function humanizeAddError(code?: string | null, message?: string | null): string | null {
  if (!code && !message) return null
  switch (code) {
    case 'INSUFFICIENT_TOKEN_A':
    case 'INSUFFICIENT_TOKEN_B':
      return 'Insufficient balance'
    case 'APPROVAL_REQUIRED':
      return 'Approval required'
    case 'LIQUIDITY_POOL_NOT_FOUND':
    case 'POOL_CLOSED':
      return 'Pool unavailable'
    case 'INVALID_RATIO':
    case 'SLIPPAGE_TOO_HIGH':
      return 'Price changed'
    case 'WALLET_DISCONNECTED':
      return 'Wallet disconnected'
    case 'NETWORK_UNAVAILABLE':
      return 'Wrong chain'
    case 'ENTER_AMOUNT':
    case 'SELECT_TOKEN':
    case 'CALCULATING':
      return null
    case 'UNKNOWN':
      return message?.trim() || 'Transaction failed'
    default:
      return message?.trim() || null
  }
}
