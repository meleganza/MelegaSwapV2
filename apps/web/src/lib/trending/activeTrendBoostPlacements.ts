/**
 * Maps the public Trend Boost active feed into paid ticker placements.
 * Client-safe: never invents market percentages. A settled placement is kept
 * even when logo/symbol metadata is missing.
 */
import { getAllProjects } from 'registry/projects/getAllProjects'
import { lookupCanonicalToken } from 'lib/canonical-token-registry'
import { resolveCanonicalProjectHref } from 'lib/projects/canonicalProjectHref'
import type { PaidTickerPlacement } from 'lib/trending/paidTickerPlacements'

/** Display label when chain+address metadata cannot be resolved. Never an address. */
export const PAID_TREND_BOOST_NEUTRAL_SYMBOL = 'Token'

const EVM_ADDRESS_RE = /^0x[a-fA-F0-9]{40}$/

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

function orderContract(placement: ActiveTrendBoostApiPlacement): string | null {
  const raw = placement.projectContract?.trim()
  if (!raw || !EVM_ADDRESS_RE.test(raw)) return null
  return raw
}

/**
 * A failed or malformed refresh must not be treated as "no active placements".
 * A successful payload, including a confirmed empty set, replaces the previous one.
 */
export function retainActivePaidPlacements(
  previous: PaidTickerPlacement[],
  next: PaidTickerPlacement[] | undefined,
  requestFailed: boolean,
): PaidTickerPlacement[] {
  if (requestFailed || next == null) return previous
  return next
}

export function mapActiveTrendBoostPlacements(
  placements: ActiveTrendBoostApiPlacement[],
  tokenByAddress?: Map<string, TokenLookupEntry>,
): PaidTickerPlacement[] {
  const projects = getAllProjects()
  return placements.flatMap((placement) => {
    if (!placement.orderId) return []
    const contract = orderContract(placement)
    const contractKey = contract?.toLowerCase() ?? null
    const byAddress = contractKey
      ? projects.find((candidate) =>
          candidate.resources.tokens.some(
            (token) => token.chainId === placement.chainId && token.address.toLowerCase() === contractKey,
          ),
        )
      : undefined
    const bySlug =
      !byAddress && placement.projectSlug
        ? projects.find(
            (candidate) =>
              candidate.slug === placement.projectSlug || candidate.aliases?.includes(placement.projectSlug || ''),
          )
        : undefined
    const projectToken = (byAddress ?? bySlug)?.resources.tokens.find(
      (token) => token.chainId === placement.chainId && (!contractKey || token.address.toLowerCase() === contractKey),
    )
    const listed = contract ? lookupCanonicalToken(placement.chainId, contract) : undefined
    const supplied = contractKey ? tokenByAddress?.get(contractKey) : undefined
    const suppliedMatchesChain = Boolean(
      supplied && (supplied.chainId == null || supplied.chainId === placement.chainId),
    )
    const symbol =
      projectToken?.symbol ||
      listed?.symbol ||
      (suppliedMatchesChain ? supplied?.symbol : undefined) ||
      PAID_TREND_BOOST_NEUTRAL_SYMBOL
    const address = contract ?? projectToken?.address ?? listed?.address ?? null
    const slug = byAddress?.slug ?? (bySlug && projectToken ? bySlug.slug : null)
    return [
      {
        id: placement.orderId,
        kind: 'boosted' as const,
        symbol,
        chainId: placement.chainId,
        address,
        href: resolveCanonicalProjectHref({
          slug,
          chainId: placement.chainId,
          address,
        }),
        startsAt: placement.startsAt,
        endsAt: placement.endsAt,
      },
    ]
  })
}

/**
 * Successful active feed only. Non-OK and malformed responses throw so callers
 * can keep the last confirmed placement set instead of flashing an empty bar.
 */
export async function fetchActiveTrendBoostPlacements(): Promise<PaidTickerPlacement[]> {
  const res = await fetch('/api/trend-boost/active')
  if (!res.ok) throw new Error(`TREND_BOOST_ACTIVE_UNAVAILABLE:${res.status}`)
  const body = (await res.json()) as ActiveTrendBoostResponse
  if (!body || !Array.isArray(body.placements)) throw new Error('TREND_BOOST_ACTIVE_MALFORMED')
  return mapActiveTrendBoostPlacements(body.placements)
}
