import { getAddress } from '@ethersproject/address'

/**
 * EIP-55-normalize a canonical EVM address after identity validation.
 *
 * marco.melega.ai can emit a mixed-case payload that is not a valid checksum
 * (Arc OFT `0x30eB6f2878f60ba0Ed6418bfe7CaDcd0f475a265`). ethers v5 then
 * throws INVALID_ARGUMENT at Contract / getAddress / ABI encoding.
 *
 * Lowercase first so getAddress treats the hex as case-insensitive, then
 * return the canonical checksum. Call only after case-insensitive binding
 * equality has already accepted the address. Do not use for Solana.
 */
export function normalizeCanonicalEvmAddress(address: string): string {
  return getAddress(address.trim().toLowerCase())
}
