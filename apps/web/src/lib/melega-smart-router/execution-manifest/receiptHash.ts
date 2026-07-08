/** Deterministic receipt hash for execution manifest immutability. */
export function computeReceiptHash(payload: Record<string, unknown>): string {
  const canonical = JSON.stringify(payload, Object.keys(payload).sort())
  let hash = 2166136261
  for (let i = 0; i < canonical.length; i++) {
    hash ^= canonical.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return `0x${(hash >>> 0).toString(16).padStart(8, '0')}`
}

export function buildExecutionId(chainId: number, receiptHash: string, timestamp: string): string {
  const ts = timestamp.replace(/[^0-9]/g, '').slice(0, 14)
  return `exec-${chainId}-${ts}-${receiptHash.slice(2, 10)}`
}
