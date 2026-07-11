import { FEATURED_PAIR_SLUG } from './paths'
import { MARCO_WBNB_PAIR_BSC } from '../constants'

/** Deterministic slug for durable indexer namespace per pair. */
export function slugFromPairAddress(pairAddress: string, token0?: string, token1?: string): string {
  const lower = pairAddress.toLowerCase()
  if (lower === MARCO_WBNB_PAIR_BSC.toLowerCase()) return FEATURED_PAIR_SLUG
  const t0 = token0?.slice(2, 8) ?? lower.slice(2, 8)
  const t1 = token1?.slice(2, 8) ?? lower.slice(-6)
  return `${t0}-${t1}`.toLowerCase()
}

export function resolveSlugFromQuery(
  slug?: string,
  pairAddress?: string,
  token0?: string,
  token1?: string,
): string {
  if (slug?.trim()) return slug.trim().toLowerCase()
  if (pairAddress?.trim()) return slugFromPairAddress(pairAddress, token0, token1)
  return FEATURED_PAIR_SLUG
}
