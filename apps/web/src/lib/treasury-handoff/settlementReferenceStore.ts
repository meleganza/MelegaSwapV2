import type { SettlementReference } from './types'

const references = new Map<string, SettlementReference>()

function key(chainId: number, txHash: string): string {
  return `${chainId}:${txHash.toLowerCase()}`
}

export function getSettlementReference(chainId: number, txHash: string): SettlementReference | undefined {
  return references.get(key(chainId, txHash))
}

export function setSettlementReference(reference: SettlementReference): void {
  references.set(key(reference.chainId, reference.txHash), reference)
}

export function getLatestSettlementReferenceForWallet(
  chainId: number,
  wallet: string,
): SettlementReference | undefined {
  const normalized = wallet.toLowerCase()
  let latest: SettlementReference | undefined

  for (const ref of references.values()) {
    if (ref.chainId !== chainId) continue
    if (ref.wallet.toLowerCase() !== normalized) continue
    const existingTime = latest ? Date.parse(latest.updatedAt) : 0
    const refTime = Date.parse(ref.updatedAt)
    if (refTime >= existingTime) {
      latest = ref
    }
  }

  if (!latest) return undefined
  return latest
}

/** @internal Test harness only. */
export function clearSettlementReferenceStore(): void {
  references.clear()
}

export function shouldAttemptHandoff(chainId: number, txHash: string): boolean {
  const existing = getSettlementReference(chainId, txHash)
  if (!existing) return true
  if (existing.settlementStatus === 'SETTLEMENT_PENDING' && existing.treasuryRuntimeEndpointStatus === 'unavailable') {
    return true
  }
  return (
    existing.settlementStatus !== 'SETTLEMENT_ACCEPTED' &&
    existing.settlementStatus !== 'SETTLEMENT_DUPLICATE' &&
    existing.settlementStatus !== 'SETTLEMENT_REJECTED'
  )
}
