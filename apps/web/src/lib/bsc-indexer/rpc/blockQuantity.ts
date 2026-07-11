/** Minimal JSON-RPC QUANTITY — no leading zero digits after 0x (except 0x0). */
export function toBlockQuantity(blockNumber: number): string {
  if (blockNumber === 0) return '0x0'
  return `0x${blockNumber.toString(16)}`
}

/** Even-length variant for providers that reject odd-length hex quantities. */
export function toBlockQuantityEven(blockNumber: number): string {
  if (blockNumber === 0) return '0x0'
  let hex = blockNumber.toString(16)
  if (hex.length % 2 === 1) hex = `0${hex}`
  return `0x${hex}`
}

/** Provider-tolerant encodings — minimal first, then even-length padded. */
export function blockQuantityVariants(blockNumber: number): string[] {
  const minimal = toBlockQuantity(blockNumber)
  const even = toBlockQuantityEven(blockNumber)
  return minimal === even ? [minimal] : [minimal, even]
}
