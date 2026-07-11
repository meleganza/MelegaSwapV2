/** Canonical JSON-RPC QUANTITY encoding — even-length hex, no redundant leading zero digits. */
export function toBlockQuantity(blockNumber: number): string {
  if (blockNumber === 0) return '0x0'
  let hex = blockNumber.toString(16)
  if (hex.length % 2 === 1) hex = `0${hex}`
  return `0x${hex}`
}
