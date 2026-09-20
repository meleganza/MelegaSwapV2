/**
 * Fail-closed MARCO identity for every OFT / adapter / registry binding.
 * NAME must be MELEGA. SYMBOL must be MARCO. Never MARCO/MARCO.
 */

export const CANONICAL_MARCO_NAME = 'MELEGA' as const
export const CANONICAL_MARCO_SYMBOL = 'MARCO' as const
export const CANONICAL_MARCO_DECIMALS = 18 as const
export const CANONICAL_MARCO_SHARED_DECIMALS = 6 as const

export type MarcoIdentityCandidate = {
  name: string
  symbol: string
  decimals: number
  sharedDecimals?: number
  totalSupply?: string | number | bigint
}

export class MarcoIdentityError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'MarcoIdentityError'
  }
}

const normalize = (value: string) => value.trim()

export function isForbiddenMarcoMarco(candidate: Pick<MarcoIdentityCandidate, 'name' | 'symbol'>): boolean {
  return normalize(candidate.name) === CANONICAL_MARCO_SYMBOL && normalize(candidate.symbol) === CANONICAL_MARCO_SYMBOL
}

export function marcoIdentityBlockers(candidate: MarcoIdentityCandidate): string[] {
  const blockers: string[] = []
  const name = normalize(candidate.name)
  const symbol = normalize(candidate.symbol)

  if (isForbiddenMarcoMarco(candidate)) {
    blockers.push('MARCO/MARCO is forbidden. Name must be MELEGA and symbol must be MARCO.')
  }
  if (name !== CANONICAL_MARCO_NAME) {
    blockers.push(`Name must be ${CANONICAL_MARCO_NAME}, got ${JSON.stringify(candidate.name)}.`)
  }
  if (symbol !== CANONICAL_MARCO_SYMBOL) {
    blockers.push(`Symbol must be ${CANONICAL_MARCO_SYMBOL}, got ${JSON.stringify(candidate.symbol)}.`)
  }
  if (candidate.decimals !== CANONICAL_MARCO_DECIMALS) {
    blockers.push(`Decimals must be ${CANONICAL_MARCO_DECIMALS}, got ${candidate.decimals}.`)
  }
  if (candidate.sharedDecimals !== undefined && candidate.sharedDecimals !== CANONICAL_MARCO_SHARED_DECIMALS) {
    blockers.push(`sharedDecimals must be ${CANONICAL_MARCO_SHARED_DECIMALS}, got ${candidate.sharedDecimals}.`)
  }
  return blockers
}

export function isCanonicalMarcoIdentity(candidate: MarcoIdentityCandidate): boolean {
  return marcoIdentityBlockers(candidate).length === 0
}

export function assertCanonicalMarcoIdentity(candidate: MarcoIdentityCandidate): true {
  const blockers = marcoIdentityBlockers(candidate)
  if (blockers.length > 0) throw new MarcoIdentityError(blockers[0] ?? 'MARCO identity mismatch.')
  return true
}

/** New destination OFTs must also be sharedDecimals=6 and supply 0 before any bridge mint. */
export function assertNewOftIdentity(candidate: MarcoIdentityCandidate): true {
  assertCanonicalMarcoIdentity(candidate)
  if (candidate.sharedDecimals === undefined) {
    throw new MarcoIdentityError('New OFT must expose sharedDecimals=6.')
  }
  if (candidate.totalSupply !== undefined) {
    const supply = BigInt(candidate.totalSupply)
    if (supply !== 0n) {
      throw new MarcoIdentityError('New OFT initial supply must be 0. Do not mint manually.')
    }
  }
  return true
}

export const CANONICAL_OFT_CONSTRUCTOR = {
  name: CANONICAL_MARCO_NAME,
  symbol: CANONICAL_MARCO_SYMBOL,
  decimals: CANONICAL_MARCO_DECIMALS,
  sharedDecimals: CANONICAL_MARCO_SHARED_DECIMALS,
} as const
