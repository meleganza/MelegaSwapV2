import { fingerprint } from '../evidence/evidenceId'
import { normalizeEvmAddress, parseCaip10, toCaip10Contract, toCaip2ChainId } from '../caip'

/** Build CAIP-10 wallet account for an EVM address on a chain. */
export function toCaip10WalletAccount(chainId: number, address: string): string | null {
  return toCaip10Contract(chainId, address)
}

export function normalizeWalletAccountInput(raw: unknown): string | null {
  if (typeof raw !== 'string' || !raw.trim()) return null
  const trimmed = raw.trim()
  const parsed = parseCaip10(trimmed)
  if (parsed) return toCaip10WalletAccount(parsed.chainId, parsed.address)
  // Bare EVM address is invalid without chain — reject (prevents cross-chain collisions).
  if (normalizeEvmAddress(trimmed)) return null
  return null
}

/** Accept bare address only when chainId is explicit. */
export function walletAccountFromAddressAndChain(address: string, chainId: number): string | null {
  return toCaip10WalletAccount(chainId, address)
}

export function buildRelationshipId(parts: {
  projectId: string
  walletAccount: string
  relationshipType: string
  subjectId: string
  chainId: number | null
}): string {
  const chain = parts.chainId == null ? 'none' : toCaip2ChainId(parts.chainId)
  return `wr_${fingerprint(
    [parts.projectId, parts.walletAccount, parts.relationshipType, parts.subjectId, chain].join('\u001f'),
  )}`
}

export function buildObservationRevision(parts: string[]): string {
  return fingerprint(parts.slice().sort().join('|'))
}
