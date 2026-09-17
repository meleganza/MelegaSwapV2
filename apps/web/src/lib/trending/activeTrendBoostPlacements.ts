/**
 * Maps the public Trend Boost active feed into paid ticker placements.
 * Client-safe: never invents market percentages; missing identity drops the row.
 */
import { getAllProjects } from 'registry/projects/getAllProjects'
import { resolveCanonicalProjectHref } from 'lib/projects/canonicalProjectHref'
import type { PaidTickerPlacement } from 'lib/trending/paidTickerPlacements'

export type ActiveTrendBoostApiPlacement = {
  orderId: string
  projectId: string
  projectSlug: string | null
  projectContract: string | null
  chainId: number
  startsAt: string | null
  endsAt: string | null
}

export type ActiveTrendBoostResponse = {
  placements?: ActiveTrendBoostApiPlacement[]
}

export type TokenLookupEntry = { chainId?: number; address?: string; symbol?: string }

export function mapActiveTrendBoostPlacements(
  placements: ActiveTrendBoostApiPlacement[],
  tokenByAddress?: Map<string, TokenLookupEntry>,
): PaidTickerPlacement[] {
  const projects = getAllProjects()
  return placements.flatMap((placement) => {
    const contract = placement.projectContract?.toLowerCase() ?? null
    const project = projects.find(
      (candidate) =>
        candidate.slug === placement.projectSlug ||
        candidate.aliases?.includes(placement.projectSlug || '') ||
        candidate.resources.tokens.some(
          (token) => token.chainId === placement.chainId && token.address.toLowerCase() === contract,
        ),
    )
    const token =
      project?.resources.tokens.find((candidate) => candidate.chainId === placement.chainId) ??
      (contract ? tokenByAddress?.get(contract) : undefined)
    const address = placement.projectContract ?? token?.address ?? null
    const symbol =
      token?.symbol ||
      (placement.projectSlug && !placement.projectSlug.includes('-') ? placement.projectSlug.toUpperCase() : undefined)
    if (!symbol) return []
    return [
      {
        id: placement.orderId,
        kind: 'boosted' as const,
        symbol,
        chainId: placement.chainId,
        address,
        href: resolveCanonicalProjectHref({
          slug: project?.slug ?? placement.projectSlug,
          chainId: placement.chainId,
          address,
        }),
        startsAt: placement.startsAt,
        endsAt: placement.endsAt,
      },
    ]
  })
}

/** Fail-soft paid feed — organic ticker must continue when this request fails. */
export async function fetchActiveTrendBoostPlacements(): Promise<PaidTickerPlacement[]> {
  try {
    const res = await fetch('/api/trend-boost/active')
    if (!res.ok) return []
    const body = (await res.json()) as ActiveTrendBoostResponse
    return mapActiveTrendBoostPlacements(body.placements ?? [])
  } catch {
    return []
  }
}
