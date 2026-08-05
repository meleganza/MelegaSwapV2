/**
 * Home Featured Projects — four compact equal premium cards on ONE desktop row.
 * Soft ambient gold glow only (no yellow border). Human-formatted prices.
 */
import React, { useCallback, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import styled, { keyframes, css } from 'styled-components'
import { MelegaTokenAvatar } from 'design-system/melega/components/MelegaTokenAvatar/MelegaTokenAvatar'
import { uxRebuildColors, uxRebuildRadius } from 'design-system/melega/tokens/uxRebuild'
import { resolveFounderFeaturedProjects } from './featuredProjectsCatalog'
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

const TradeBtn = styled.button`
  height: 32px;
  min-height: 32px;
  border: none;
  border-radius: 8px;
  background: ${uxRebuildColors.gold};
  color: #111;
  font-size: 11px;
  font-weight: 750;
  cursor: pointer;

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

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
    () => chartEntries.slice(-24).map((c) => c.close).filter((n) => Number.isFinite(n) && n > 0),
    [chartEntries],
  )
  if (!pairAddress) return <SparkUnavailable>Unavailable</SparkUnavailable>
  if (points.length < 2) {
    return (
      <SparkUnavailable data-testid="featured-spark-unavailable">
        {status === 'loading' ? '…' : 'Unavailable'}
      </SparkUnavailable>
    )
  }
  return <AnimatedSparkline points={points} width={64} height={16} />
}

export const FeaturedProjectsRail: React.FC = () => {
  const router = useRouter()
  const cards = useMemo(() => resolveFounderFeaturedProjects(), [])
  const { rowsBySlug } = useFeaturedProjectMarkets()

  // Founder amendment P0-2: Trade navigates to the project page swap embed —
  // it must never keep the shopper on Home. Client nav must use the filesystem
  // route `/project-hq/[slug]` (rewrite-only `/@slug` leaves Home mounted).
  const onTrade = useCallback(
    (p: (typeof cards)[number]) => {
      if (!p.address || !p.slug) return
      const q = `inputCurrency=BNB&outputCurrency=${p.address}&focus=swap&source=featured-home`
      const href = `/project-hq/${p.slug}?${q}`
      const as = `/@${p.slug}?${q}`
      void router.push(href, as).catch(() => {
        window.location.assign(href)
      })
    },
    [router],
  )

  return (
    <Shell data-testid="dex-home-featured-projects" data-home-section="featured-projects">
      <Grid>
        {cards.map((p) => {
          const market = rowsBySlug[p.slug]
          const change = formatFeaturedChange(market)
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
                      {p.displayName}{' '}
                      <PlacementLabel kind="featured" />
                    </Name>
                    <Meta>{p.symbol}</Meta>
                  </Names>
                </IdentityMain>
                <CardBadges>
                  <MelegaExploreChainBadge chainId={p.chainId} />
                  {p.resolved ? <Verified title="Canonical identity resolved">Verified</Verified> : null}
                </CardBadges>
              </Identity>
              <Metrics>
                <Price
                  title={
                    market?.source === 'melega-factory-reserves'
                      ? 'Reserve price · Melega Factory'
                      : 'Melega DEX'
                  }
                >
                  {formatFeaturedPrice(market)}
                </Price>
                <Change
                  $empty={change.empty}
                  $positive={change.positive}
                  title={
                    change.empty
                      ? change.text
                      : `Melega DEX · ${market?.periodLabel ?? '24H'}`
                  }
                >
                  {change.text}
                </Change>
              </Metrics>
              <SparkRow data-testid={`featured-spark-${p.slug}`}>
                <FeaturedMiniSpark
                  pairAddress={market?.pairAddress ?? FOUNDER_PAIR_BY_SLUG[p.slug]}
                />
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
                  <StatValue title={market?.marketCapLabel ?? 'Unavailable'}>
                    {formatFeaturedMarketCap(market)}
                  </StatValue>
                </Stat>
              </StatGrid>
              <Actions>
                <TradeBtn
                  type="button"
                  disabled={!p.address || !p.slug}
                  onClick={() => onTrade(p)}
                  data-testid={`featured-trade-${p.slug}`}
                >
                  Trade
                </TradeBtn>
                <ViewLink href={`/project-hq/${p.slug}`} data-testid={`featured-view-${p.slug}`}>
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
