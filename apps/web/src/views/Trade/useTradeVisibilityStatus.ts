import { useMemo } from 'react'
import useSWR from 'swr'
import type { RotationCandidate } from 'lib/featured-placement'
import { formatPaidPlacementRemaining } from 'lib/trending/paidTickerPlacements'
import { FOUNDER_FEATURED_SLUGS } from 'views/HomeTrade/featuredProjectsCatalog'

type ActiveTrendBoost = {
  orderId: string
  projectSlug: string | null
  projectContract: string | null
  startsAt: string | null
  endsAt: string | null
}

type FeaturedResponse = { candidates?: RotationCandidate[] }
type BoostResponse = { placements?: ActiveTrendBoost[] }

const jsonFetcher = async <T,>(url: string): Promise<T> => {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Visibility feed returned ${response.status}`)
  return response.json() as Promise<T>
}

const normalize = (value?: string | null) => value?.trim().toLowerCase() || null

export type TradeVisibilityStatus = {
  featured: boolean
  featuredRemaining: string | null
  boosted: boolean
  boostedRemaining: string | null
}

/** Resolves only verified active visibility feeds (plus the canonical founder Featured catalog). */
export function useTradeVisibilityStatus(input: {
  projectSlug?: string
  projectAddress?: string
}): TradeVisibilityStatus {
  const { data: featuredData } = useSWR<FeaturedResponse>(
    input.projectSlug || input.projectAddress ? '/api/featured/rotation-candidates' : null,
    jsonFetcher,
    { refreshInterval: 30_000, revalidateOnFocus: false },
  )
  const { data: boostData } = useSWR<BoostResponse>(
    input.projectSlug || input.projectAddress ? '/api/trend-boost/active' : null,
    jsonFetcher,
    { refreshInterval: 15_000, revalidateOnFocus: false },
  )

  return useMemo(() => {
    const slug = normalize(input.projectSlug)
    const address = normalize(input.projectAddress)
    const matches = (candidateSlug?: string | null, candidateAddress?: string | null) =>
      (slug && normalize(candidateSlug) === slug) || (address && normalize(candidateAddress) === address)

    const featuredPlacement = (featuredData?.candidates ?? []).find((candidate) =>
      matches(candidate.projectSlug, candidate.projectContract),
    )
    const boostPlacement = (boostData?.placements ?? []).find((placement) =>
      matches(placement.projectSlug, placement.projectContract),
    )
    const founderFeatured = Boolean(
      slug && FOUNDER_FEATURED_SLUGS.some((featuredSlug) => featuredSlug === slug),
    )

    return {
      featured: founderFeatured || Boolean(featuredPlacement),
      featuredRemaining: formatPaidPlacementRemaining(featuredPlacement?.scheduledEnd),
      boosted: Boolean(boostPlacement),
      boostedRemaining: formatPaidPlacementRemaining(boostPlacement?.endsAt),
    }
  }, [boostData?.placements, featuredData?.candidates, input.projectAddress, input.projectSlug])
}

export default useTradeVisibilityStatus
