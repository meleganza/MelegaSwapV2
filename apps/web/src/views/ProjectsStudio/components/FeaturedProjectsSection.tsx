/**
 * Featured Projects — same catalog as Home Featured rail.
 * Compact carousel/grid for Projects directory.
 */
import React, { useMemo } from 'react'
import Link from 'next/link'
import styled from 'styled-components'
import { MelegaTokenAvatar } from 'design-system/melega/components/MelegaTokenAvatar/MelegaTokenAvatar'
import { MelegaExploreChainBadge } from 'components/Logo/MelegaExploreChainBadge'
import { resolveFounderFeaturedProjects } from 'views/HomeTrade/featuredProjectsCatalog'
import {
  formatFeaturedChange,
  formatFeaturedLiquidity,
  formatFeaturedPrice,
  formatFeaturedVolume,
  useFeaturedProjectMarkets,
} from 'views/HomeTrade/useFeaturedProjectMarkets'
import { PR_FONT_BODY, projectsStudioColors } from '../projectsStudioTokens'

const Shell = styled.section`
  min-width: 0;
`

const Head = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
`

const Title = styled.h2`
  margin: 0;
  font-family: ${PR_FONT_BODY};
  font-size: 15px;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: ${projectsStudioColors.gold};
`

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;

  @media (max-width: 1199px) {
    display: flex;
    overflow-x: auto;
    gap: 12px;
    scroll-snap-type: x mandatory;
    padding-bottom: 6px;
    -webkit-overflow-scrolling: touch;

    & > * {
      flex: 0 0 min(260px, calc(100vw - 48px));
      scroll-snap-align: start;
    }
  }
`

const Card = styled.article`
  min-width: 0;
  padding: 12px;
  border-radius: 14px;
  border: 1px solid rgba(244, 196, 48, 0.28);
  background: linear-gradient(165deg, rgba(28, 24, 12, 0.95) 0%, rgba(12, 12, 12, 0.98) 100%);
  display: flex;
  flex-direction: column;
  gap: 8px;
  box-sizing: border-box;
`

const Top = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  min-width: 0;
`

const Meta = styled.div`
  min-width: 0;
  flex: 1;
`

const Name = styled.div`
  font-size: 14px;
  font-weight: 750;
  color: ${projectsStudioColors.text};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const Symbol = styled.div`
  font-size: 12px;
  font-weight: 650;
  color: ${projectsStudioColors.gold};
`

const BadgeRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: center;
`

const Badge = styled.span`
  height: 18px;
  padding: 0 7px;
  border-radius: 999px;
  border: 1px solid rgba(52, 211, 153, 0.4);
  background: rgba(52, 211, 153, 0.1);
  color: #6ee7b7;
  font-size: 10px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
`

const Metrics = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px 8px;
`

const MetricLabel = styled.div`
  font-size: 10px;
  font-weight: 600;
  color: ${projectsStudioColors.muted};
  text-transform: uppercase;
`

const MetricValue = styled.div<{ $muted?: boolean; $pos?: boolean; $neg?: boolean }>`
  font-size: 12px;
  font-weight: 700;
  color: ${({ $muted, $pos, $neg }) =>
    $muted ? projectsStudioColors.muted : $pos ? '#6ee7b7' : $neg ? '#f87171' : projectsStudioColors.text};
`

const Spark = styled.svg`
  width: 100%;
  height: 28px;
  margin-top: 2px;
`

const Actions = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-top: 2px;
`

const Btn = styled(Link)<{ $primary?: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 34px;
  border-radius: 9px;
  font-size: 12px;
  font-weight: 750;
  text-decoration: none;
  border: 1px solid
    ${({ $primary }) => ($primary ? 'rgba(244,196,48,0.55)' : projectsStudioColors.cardBorder)};
  background: ${({ $primary }) =>
    $primary ? 'linear-gradient(180deg, #f2c84c 0%, #d4a017 100%)' : 'rgba(255,255,255,0.03)'};
  color: ${({ $primary }) => ($primary ? '#111' : projectsStudioColors.text)};
`

function sparkPath(values: number[]): string {
  if (values.length < 2) return ''
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = max - min || 1
  return values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * 100
      const y = 26 - ((v - min) / span) * 22
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`
    })
    .join(' ')
}

export const FeaturedProjectsSection: React.FC = () => {
  const featured = useMemo(() => resolveFounderFeaturedProjects().filter((p) => p.eligibleForRotation), [])
  const { rowsBySlug, loading } = useFeaturedProjectMarkets()

  return (
    <Shell data-testid="projects-featured-section" data-projects-featured>
      <Head>
        <Title>Featured Projects</Title>
      </Head>
      <Grid>
        {featured.map((p) => {
          const row = rowsBySlug[p.slug]
          const price = formatFeaturedPrice(row)
          const change = formatFeaturedChange(row)
          const liq = formatFeaturedLiquidity(row)
          const vol = formatFeaturedVolume(row)
          const priceLabel =
            !row || price === 'Price updating' || !price ? 'Unavailable' : price
          // Mini chart: synthetic spark from change direction only when change is factual.
          const sparkVals =
            !change.empty && typeof row?.changePct === 'number'
              ? [0, change.positive ? 0.4 : -0.2, change.positive ? 0.7 : -0.5, row.changePct / 100]
              : []
          const path = sparkPath(sparkVals)
          const tradeHref = `/project-hq/${p.slug}?focus=swap&source=projects-featured`

          return (
            <Card key={p.slug} data-testid={`projects-featured-card-${p.slug}`}>
              <Top>
                <MelegaTokenAvatar
                  symbol={p.symbol}
                  name={p.displayName}
                  address={p.address}
                  chainId={p.chainId}
                  logoURI={p.logoUrl}
                  size={36}
                />
                <Meta>
                  <Name title={p.displayName}>{p.displayName}</Name>
                  <Symbol>${p.symbol}</Symbol>
                  <BadgeRow>
                    <MelegaExploreChainBadge chainId={p.chainId} compact />
                    <Badge>Verified</Badge>
                    <Badge style={{ borderColor: 'rgba(244,196,48,0.45)', color: '#F4C430', background: 'rgba(244,196,48,0.12)' }}>
                      Featured
                    </Badge>
                  </BadgeRow>
                </Meta>
              </Top>
              <Metrics>
                <div>
                  <MetricLabel>Price</MetricLabel>
                  <MetricValue $muted={priceLabel === 'Unavailable'}>{loading ? '…' : priceLabel}</MetricValue>
                </div>
                <div>
                  <MetricLabel>24h</MetricLabel>
                  <MetricValue
                    $muted={change.empty}
                    $pos={!change.empty && change.positive === true}
                    $neg={!change.empty && change.positive === false}
                  >
                    {change.empty ? 'Unavailable' : change.text}
                  </MetricValue>
                </div>
                <div>
                  <MetricLabel>Liquidity</MetricLabel>
                  <MetricValue $muted={!liq || liq === '—'}>{liq && liq !== '—' ? liq : 'Unavailable'}</MetricValue>
                </div>
                <div>
                  <MetricLabel>Volume</MetricLabel>
                  <MetricValue $muted={!vol || vol === '—'}>{vol && vol !== '—' ? vol : 'Unavailable'}</MetricValue>
                </div>
                <div>
                  <MetricLabel>Holders</MetricLabel>
                  <MetricValue $muted>Unavailable</MetricValue>
                </div>
              </Metrics>
              {path ? (
                <Spark viewBox="0 0 100 28" preserveAspectRatio="none" aria-hidden>
                  <path d={path} fill="none" stroke="rgba(244,196,48,0.85)" strokeWidth="1.5" />
                </Spark>
              ) : (
                <Spark viewBox="0 0 100 28" aria-hidden>
                  <line x1="0" y1="14" x2="100" y2="14" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                </Spark>
              )}
              <Actions>
                <Btn href={p.href} data-testid={`projects-featured-open-${p.slug}`}>
                  Open Project
                </Btn>
                <Btn href={tradeHref} $primary data-testid={`projects-featured-trade-${p.slug}`}>
                  Trade
                </Btn>
              </Actions>
            </Card>
          )
        })}
      </Grid>
    </Shell>
  )
}

export default FeaturedProjectsSection
