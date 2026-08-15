/**
 * Home Featured Projects — four compact equal premium cards on ONE desktop row.
 * Soft ambient gold glow only (no yellow border). Human-formatted prices.
 */
import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import styled, { keyframes, css } from 'styled-components'
import { MelegaTokenAvatar } from 'design-system/melega/components/MelegaTokenAvatar/MelegaTokenAvatar'
import { uxRebuildColors, uxRebuildRadius } from 'design-system/melega/tokens/uxRebuild'
import {
  resolveFeaturedProjectIdentity,
  resolveFounderFeaturedProjects,
  selectFeaturedRotationWindow,
  type FeaturedProjectResolved,
} from './featuredProjectsCatalog'
import { markProjectNavClick } from 'views/ProjectPage/v5/projectPagePerf'
import {
  formatFeaturedChange,
  formatFeaturedLiquidity,
  formatFeaturedMarketCap,
  formatFeaturedPrice,
  formatFeaturedVolume,
  useFeaturedProjectMarkets,
} from './useFeaturedProjectMarkets'
import { PlacementLabel } from 'views/shared/monetization/PlacementLabel'
import { MelegaExploreChainBadge } from 'components/Logo/MelegaExploreChainBadge'
import { useIndexerCandles } from 'lib/bsc-indexer/client/useIndexerCandles'
import { FOUNDER_WBNB_PAIR_ADDRESSES } from 'lib/bsc-indexer/founderWbnbPairs'
import { AnimatedSparkline } from 'views/TrendingStudio/components/trendingStudioPrimitives'
import type { RotationCandidate } from 'lib/featured-placement'
import { formatPaidPlacementRemaining } from 'lib/trending/paidTickerPlacements'

type FeaturedCardEntry = {
  project: FeaturedProjectResolved
  placement?: RotationCandidate
}

type RotationResponse = { candidates?: RotationCandidate[] }

export function selectFeaturedCardRotation(
  paidCandidates: RotationCandidate[],
  fallbackProjects: FeaturedProjectResolved[],
  nowMs: number,
): FeaturedCardEntry[] {
  const seen = new Set<string>()
  const paid = paidCandidates
    .slice()
    .sort((a, b) => Date.parse(a.scheduledEnd) - Date.parse(b.scheduledEnd))
    .flatMap((placement) => {
      const project = resolveFeaturedProjectIdentity({
        slug: placement.projectSlug,
        address: placement.projectContract,
        chainId: 56,
      })
      if (!project || seen.has(project.slug)) return []
      seen.add(project.slug)
      return [{ project, placement }]
    })

  if (paid.length > 4) {
    return selectFeaturedRotationWindow(paid, nowMs)
  }

  const fallback = fallbackProjects
    .filter((project) => !seen.has(project.slug))
    .map((project) => ({ project }))
  return [...paid, ...fallback].slice(0, 4)
}

const FOUNDER_PAIR_BY_SLUG: Record<string, string> = {
  mm72: FOUNDER_WBNB_PAIR_ADDRESSES[0],
  eyed: FOUNDER_WBNB_PAIR_ADDRESSES[1],
  'young-degens': FOUNDER_WBNB_PAIR_ADDRESSES[2],
  blion: FOUNDER_WBNB_PAIR_ADDRESSES[3],
}

const halo = keyframes`
  0%, 100% {
    box-shadow:
      0 0 0 0 rgba(244, 196, 48, 0),
      0 0 14px 2px rgba(244, 196, 48, 0.12),
      0 8px 22px rgba(0, 0, 0, 0.34);
  }
  50% {
    box-shadow:
      0 0 0 0 rgba(244, 196, 48, 0),
      0 0 28px 8px rgba(244, 196, 48, 0.26),
      0 10px 26px rgba(0, 0, 0, 0.4);
  }
`

const Shell = styled.section`
  min-width: 0;
  padding: 6px 4px 10px;
  margin: -6px -4px -10px;
`

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  min-width: 0;
  align-items: stretch;

  /* Never 2×2 — tablet/mobile become a horizontal snap rail */
  @media (max-width: 1023px) {
    display: flex;
    overflow-x: auto;
    overflow-y: hidden;
    gap: 12px;
    scroll-snap-type: x mandatory;
    scroll-padding-inline: 0;
    -webkit-overflow-scrolling: touch;
    padding: 4px 2px 8px;
    margin: 0;
    overscroll-behavior-x: contain;

    & > * {
      flex: 0 0 min(260px, calc(100vw - 48px));
      max-width: min(260px, calc(100vw - 48px));
      scroll-snap-align: start;
      scroll-snap-stop: always;
    }
  }
`

const Card = styled.article`
  min-height: 0;
  padding: 10px 12px;
  border-radius: ${uxRebuildRadius.card};
  background: linear-gradient(165deg, rgba(22, 22, 22, 0.98) 0%, rgba(10, 10, 10, 0.98) 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  gap: 6px;
  box-sizing: border-box;
  animation: ${halo} 2.8s ease-in-out infinite;
  overflow: visible;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    box-shadow: 0 0 16px 2px rgba(244, 196, 48, 0.14), 0 8px 22px rgba(0, 0, 0, 0.34);
  }
`

const Identity = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  min-width: 0;
`

const IdentityMain = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  flex: 1;
`

const CardBadges = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  flex-shrink: 0;
`

const Verified = styled.span`
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #6ddc8c;
`

const PlacementCountdown = styled.span`
  font-size: 9px;
  font-weight: 750;
  color: #f4c430;
  font-variant-numeric: tabular-nums;
`

const Names = styled.div`
  min-width: 0;
  flex: 1;
`

const Name = styled.div`
  font-size: 13px;
  font-weight: 750;
  color: ${uxRebuildColors.text};
  line-height: 16px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const Meta = styled.div`
  font-size: 10px;
  color: ${uxRebuildColors.muted};
  margin-top: 1px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const Metrics = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
`

const Price = styled.div`
  font-size: 12px;
  font-weight: 700;
  color: ${uxRebuildColors.text};
  font-variant-numeric: tabular-nums;
`

const Change = styled.div<{ $positive?: boolean; $empty?: boolean }>`
  font-size: 11px;
  font-weight: 700;
  ${({ $empty, $positive }) =>
    $empty
      ? css`
          color: ${uxRebuildColors.muted};
        `
      : css`
          color: ${$positive ? '#3DDC97' : '#FF6B6B'};
        `}
`

const StatGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 4px 6px;
`

const Stat = styled.div`
  min-width: 0;
`

const StatLabel = styled.div`
  font-size: 9px;
  line-height: 12px;
  color: ${uxRebuildColors.muted};
  text-transform: uppercase;
  letter-spacing: 0.02em;
`

const StatValue = styled.div`
  font-size: 10px;
  line-height: 13px;
  font-weight: 650;
  color: ${uxRebuildColors.text};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-variant-numeric: tabular-nums;
`

const Actions = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
  margin-top: 2px;
`

const TradeBtn = styled(Link)<{ $disabled?: boolean }>`
  height: 32px;
  min-height: 32px;
  border: none;
  border-radius: 8px;
  background: ${uxRebuildColors.gold};
  color: #111;
  font-size: 11px;
  font-weight: 750;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  box-sizing: border-box;
  cursor: pointer;

  opacity: ${({ $disabled }) => ($disabled ? 0.45 : 1)};
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};

  &:focus-visible {
    outline: 2px solid ${uxRebuildColors.gold};
    outline-offset: 2px;
  }
`

const ViewLink = styled(Link)`
  height: 32px;
  min-height: 32px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  color: ${uxRebuildColors.text};
  font-size: 11px;
  font-weight: 650;
  box-sizing: border-box;

  &:focus-visible {
    outline: 2px solid ${uxRebuildColors.gold};
    outline-offset: 2px;
  }
`

const SparkRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-height: 18px;
`

const SparkUnavailable = styled.span`
  font-size: 11px;
  font-weight: 650;
  color: rgba(255, 255, 255, 0.38);
`

/** Real indexed sparkline only — never invents points. */
const FeaturedMiniSpark: React.FC<{ pairAddress?: string }> = ({ pairAddress }) => {
  const { chartEntries, status } = useIndexerCandles(
    pairAddress && /^0x[a-fA-F0-9]{40}$/.test(pairAddress) ? pairAddress : undefined,
    '1H',
  )
  const points = useMemo(
    () =>
      chartEntries
        .slice(-24)
        .map((c) => c.close)
        .filter((n) => Number.isFinite(n) && n > 0),
    [chartEntries],
  )
  if (!pairAddress) return <SparkUnavailable>—</SparkUnavailable>
  if (points.length < 2) {
    return (
      <SparkUnavailable data-testid="featured-spark-unavailable">{status === 'loading' ? '…' : '—'}</SparkUnavailable>
    )
  }
  return <AnimatedSparkline points={points} width={64} height={16} />
}

export const FeaturedProjectsRail: React.FC = () => {
  const fallbackCards = useMemo(() => resolveFounderFeaturedProjects(), [])
  const [paidCandidates, setPaidCandidates] = useState<RotationCandidate[]>([])
  const [rotationNow, setRotationNow] = useState(0)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const response = await fetch('/api/featured/rotation-candidates')
        if (!response.ok) return
        const body = (await response.json()) as RotationResponse
        if (!cancelled) {
          setPaidCandidates(body.candidates ?? [])
          setRotationNow(Date.now())
        }
      } catch {
        // Founder fallback remains visible when the paid placement feed is unavailable.
      }
    }
    const loadWhenVisible = () => {
      if (!document.hidden) void load()
    }
    const onVisibilityChange = () => {
      if (!document.hidden) void load()
    }
    loadWhenVisible()
    const id = window.setInterval(loadWhenVisible, 60_000)
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => {
      cancelled = true
      window.clearInterval(id)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [])

  const cards = useMemo(
    () => selectFeaturedCardRotation(paidCandidates, fallbackCards, rotationNow || 0),
    [paidCandidates, fallbackCards, rotationNow],
  )
  const { rowsBySlug } = useFeaturedProjectMarkets()

  return (
    <Shell data-testid="dex-home-featured-projects" data-home-section="featured-projects">
      <Grid>
        {cards.map(({ project: p, placement }) => {
          const market = rowsBySlug[p.slug]
          const change = formatFeaturedChange(market)
          const q = new URLSearchParams({
            inputCurrency: 'BNB',
            outputCurrency: p.address || '',
            source: 'featured-home',
          })
          const tradeHref = p.address ? `/swap?${q.toString()}` : '/swap'
          return (
            <Card
              key={p.slug}
              data-featured-slug={p.slug}
              data-featured-resolved={p.resolved ? '1' : '0'}
              data-featured-market-status={market?.status ?? 'LOADING'}
            >
              <Identity>
                <IdentityMain>
                  <MelegaTokenAvatar
                    symbol={p.symbol}
                    name={p.displayName}
                    address={p.address}
                    chainId={p.chainId}
                    size={30}
                    radius="circle"
                  />
                  <Names>
                    <Name>
                      {p.displayName} <PlacementLabel kind="featured" />
                    </Name>
                    <Meta>{p.symbol}</Meta>
                  </Names>
                </IdentityMain>
                <CardBadges>
                  <MelegaExploreChainBadge chainId={p.chainId} />
                  {p.resolved ? <Verified title="Canonical identity resolved">Verified</Verified> : null}
                  {placement ? (
                    <PlacementCountdown title="Paid Featured time remaining" data-testid={`featured-time-${p.slug}`}>
                      {formatPaidPlacementRemaining(placement.scheduledEnd, rotationNow || Date.now())}
                    </PlacementCountdown>
                  ) : null}
                </CardBadges>
              </Identity>
              <Metrics>
                <Price
                  title={market?.source === 'melega-factory-reserves' ? 'Reserve price · Melega Factory' : 'Melega DEX'}
                >
                  {formatFeaturedPrice(market)}
                </Price>
                {!change.empty ? (
                  <Change $positive={change.positive} title={`Melega DEX · ${market?.periodLabel ?? '24H'}`}>
                    {change.text}
                  </Change>
                ) : null}
              </Metrics>
              <SparkRow data-testid={`featured-spark-${p.slug}`}>
                <FeaturedMiniSpark pairAddress={market?.pairAddress ?? FOUNDER_PAIR_BY_SLUG[p.slug]} />
              </SparkRow>
              <StatGrid>
                <Stat>
                  <StatLabel>Liquidity</StatLabel>
                  <StatValue>{formatFeaturedLiquidity(market)}</StatValue>
                </Stat>
                <Stat>
                  <StatLabel>24H Volume</StatLabel>
                  <StatValue>{formatFeaturedVolume(market)}</StatValue>
                </Stat>
                <Stat>
                  <StatLabel>{market?.marketCapLabel === 'Fully Diluted Value' ? 'FDV' : 'Mkt Cap'}</StatLabel>
                  <StatValue title={market?.marketCapLabel ?? undefined}>{formatFeaturedMarketCap(market)}</StatValue>
                </Stat>
              </StatGrid>
              <Actions>
                <TradeBtn
                  href={tradeHref}
                  $disabled={!p.address || !p.slug}
                  aria-disabled={!p.address || !p.slug}
                  tabIndex={!p.address || !p.slug ? -1 : undefined}
                  onClick={(event) => {
                    if (!p.address || !p.slug) event.preventDefault()
                  }}
                  data-testid={`featured-trade-${p.slug}`}
                >
                  Trade
                </TradeBtn>
                <ViewLink href={p.href} data-testid={`featured-view-${p.slug}`} onClick={() => markProjectNavClick()}>
                  View Project
                </ViewLink>
              </Actions>
            </Card>
          )
        })}
      </Grid>
    </Shell>
  )
}

export default FeaturedProjectsRail
