/**
 * Click-time decisions for a user-signed BNB swap.
 * This module does not hold a provider and does not send a transaction.
 */

export interface PublicUserTx {
  to: string
  data: string
  value: '0x0'
  chainId: 56
}

export interface SwapReview {
  ok: boolean
  code?: string
  feeBps: number | null
  feeAmountRaw: string | null
  gasUnits: string | null
  venueLabel: string | null
  amountInRaw: string | null
  amountOutRaw: string | null
  slippageBps: number | null
  destination: string | null
  approvalTx: PublicUserTx | null
  unsignedTx: PublicUserTx | null
}

export function reviewAction(review: SwapReview): 'approve' | 'confirm' | 'blocked' {
  if (review.approvalTx && !review.unsignedTx) return 'approve'
  if (
    review.ok &&
    review.unsignedTx &&
    !review.approvalTx &&
    typeof review.gasUnits === 'string' &&
    /^\d+$/.test(review.gasUnits)
  ) {
    return 'confirm'
  }
  return 'blocked'
}

export function sameUserTx(left: PublicUserTx | null, right: PublicUserTx | null): boolean {
  if (!left || !right) return false
  return (
    left.chainId === right.chainId &&
    left.to.toLowerCase() === right.to.toLowerCase() &&
    left.data.toLowerCase() === right.data.toLowerCase() &&
    left.value === right.value
  )
}

export function receiptOutcome(receipt: { status?: string | number } | null | undefined): 'pending' | 'confirmed' | 'failed' {
  if (!receipt) return 'pending'
  const status = receipt.status
  if (status === 1 || status === '0x1' || status === '0x01') return 'confirmed'
  if (status === 0 || status === '0x0' || status === '0x00') return 'failed'
  return 'pending'
}

export function signatureRejected(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false
  const row = error as { code?: number; message?: string }
  if (row.code === 4001) return true
  return typeof row.message === 'string' && /rejected|denied|user cancelled/i.test(row.message)
}
