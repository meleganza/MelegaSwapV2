export type OhlcvTokenSide = 'base' | 'quote'

function relationshipAddress(id?: string | null): string | null {
  if (!id) return null
  const match = id.toLowerCase().match(/0x[a-f0-9]{40}$/)
  return match?.[0] ?? null
}

/** Resolve which GeckoTerminal side represents the token selected in the UI. */
export function resolveOhlcvTokenSide(
  tokenAddress: string,
  baseRelationshipId?: string | null,
  quoteRelationshipId?: string | null,
): OhlcvTokenSide | null {
  const target = tokenAddress.trim().toLowerCase()
  if (!/^0x[a-f0-9]{40}$/.test(target)) return null
  if (relationshipAddress(baseRelationshipId) === target) return 'base'
  if (relationshipAddress(quoteRelationshipId) === target) return 'quote'
  return null
}
