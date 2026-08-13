export type ReceiptOutcome =
  | { status: 'confirmed'; reason: null }
  | { status: 'submitted'; reason: string }
  | { status: 'failed'; reason: string }

type ReceiptLike = { status?: number | null }
type WaitableTransaction = { wait?: (confirmations?: number) => Promise<ReceiptLike | null | undefined> }

function receiptStatus(error: unknown): number | null {
  const status = (error as { receipt?: ReceiptLike } | null)?.receipt?.status
  return typeof status === 'number' ? status : null
}

/**
 * Never upgrades an unknown provider result to confirmed. A submitted hash remains
 * submitted until a successful receipt is observed; an explicit status=0 is failed.
 */
export async function resolveReceiptOutcome(transaction: WaitableTransaction): Promise<ReceiptOutcome> {
  if (!transaction.wait) {
    return { status: 'submitted', reason: 'Transaction submitted; confirmation is still pending.' }
  }

  try {
    const receipt = await transaction.wait(1)
    if (receipt?.status === 1) return { status: 'confirmed', reason: null }
    if (receipt?.status === 0) return { status: 'failed', reason: 'Transaction reverted on-chain.' }
    return { status: 'submitted', reason: 'Transaction submitted; confirmation is still pending.' }
  } catch (error) {
    if (receiptStatus(error) === 0) {
      return { status: 'failed', reason: 'Transaction reverted on-chain.' }
    }
    return { status: 'submitted', reason: 'Transaction submitted; receipt verification is still pending.' }
  }
}
