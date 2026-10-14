import type { NormalizedQuote } from './quote'

export const SPLIT_ROUTE_FORBIDDEN = 'SPLIT_ROUTE_FORBIDDEN' as const

export function assertSingleVenueRoute(quote: NormalizedQuote): void {
  const venues = new Set(quote.hops.map((hop) => hop.venueId))
  if (venues.size > 1) throw new Error(SPLIT_ROUTE_FORBIDDEN)
  if (quote.hops.some((hop) => hop.venueId !== quote.venueId)) throw new Error(SPLIT_ROUTE_FORBIDDEN)
}
