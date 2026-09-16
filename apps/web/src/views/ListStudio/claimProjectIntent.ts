import { ethers } from 'ethers'

export const AARON_BNB_CONTRACT = '0x31B5BE085aF875B675392f5B37a1d0B8c3860222'
export const CLAIM_PROJECT_INTENT = 'claim-project'
export const CLAIM_PROJECT_PATH = '/claim-project'
export const CLAIM_PROJECT_LIST_HREF = '/list?intent=claim-project'

export type NormalizedClaimContract =
  | { ok: true; address: string }
  | { ok: false; reason: 'missing' | 'invalid' }

export function normalizeClaimContractInput(raw: unknown): NormalizedClaimContract {
  if (typeof raw !== 'string' || !raw.trim()) return { ok: false, reason: 'missing' }
  const trimmed = raw.trim()
  if (!ethers.utils.isAddress(trimmed)) return { ok: false, reason: 'invalid' }
  try {
    return { ok: true, address: ethers.utils.getAddress(trimmed) }
  } catch {
    return { ok: false, reason: 'invalid' }
  }
}

export function normalizeClaimChainId(raw: unknown): number {
  const value = Array.isArray(raw) ? raw[0] : raw
  const parsed = Number(value ?? 56)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 56
}

/** Package token names sometimes store a website URL. Never use that as a display name. */
export function sanitizeClaimDisplayName(
  name: string | null | undefined,
  symbol: string | null | undefined,
): { name: string; websiteFromName: string | null } {
  const trimmedName = String(name ?? '').trim()
  const trimmedSymbol = String(symbol ?? '').trim()
  if (/^https?:\/\//i.test(trimmedName)) {
    return { name: trimmedSymbol || 'Token', websiteFromName: trimmedName }
  }
  return { name: trimmedName, websiteFromName: null }
}

export function buildClaimProjectListHref(input: {
  contract?: string | null
  chainId?: number | null
  symbol?: string | null
  name?: string | null
  logo?: string | null
}): string {
  const params = new URLSearchParams({ intent: CLAIM_PROJECT_INTENT })
  const contract = normalizeClaimContractInput(input.contract)
  if (contract.ok) params.set('contract', contract.address)
  if (input.chainId) params.set('chain', String(input.chainId))
  const sanitized = sanitizeClaimDisplayName(input.name, input.symbol)
  if (sanitized.name && !/^https?:\/\//i.test(sanitized.name)) params.set('name', sanitized.name)
  if (input.symbol) params.set('symbol', input.symbol)
  if (input.logo) params.set('logo', input.logo)
  return `/list?${params.toString()}`
}
