/**
 * Melega DEX Complete UX Rebuild — Home (trade + discovery surface).
 * Visual SSOT: approved dark Home mockup. Zero fabricated metrics.
 */
import React, { useMemo, useRef } from 'react'
import styled from 'styled-components'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { PageMeta } from 'components/Layout/Page'
import { DataSurfaceErrorBoundary } from 'components/ErrorBoundary'
import { TrendingUp, Sprout, Droplets, Sparkles, ArrowRight } from 'lucide-react'
import HomeTradeGlobalStyle from './HomeTradeGlobalStyle'
import HomeSwapPanel from './HomeSwapPanel'
import useHomeTradeData from './useHomeTradeData'
import { getAllProjects } from 'registry/projects/getAllProjects'
import { measureListedProjectsCount } from 'lib/market-registry/listedProjectsCount'
import { FeaturedProjectsRail } from './FeaturedProjectsRail'
import { ExploreMelegaEcosystem } from './ExploreMelegaEcosystem'
import {
  uxRebuildColors,
  uxRebuildFont,
  uxRebuildLayout,
  uxRebuildRadius,
  uxRebuildShadow,
} from 'design-system/melega/tokens/uxRebuild'

const Root = styled.div`
  color: ${uxRebuildColors.text};
  font-family: ${uxRebuildFont};
  background: ${uxRebuildColors.pageBg};
  min-width: 0;
  overflow-x: hidden;
`

const Content = styled.div`
  width: calc(100% - 64px);
  max-width: ${uxRebuildLayout.contentMax};
  margin: 0 auto;
  padding: 24px 0 48px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 0;

  @media (max-width: 767px) {
    width: 100%;
    padding: 10px 0 24px;
    gap: 14px;
  }
`

const Hero = styled.section`
  display: grid;
  grid-template-columns: minmax(0, 56%) minmax(0, 44%);
  gap: 24px;
  min-height: 356px;
  align-items: stretch;
  position: relative;
  border-radius: ${uxRebuildRadius.hero};
  background:
    radial-gradient(ellipse 70% 55% at 50% 110%, rgba(221, 185, 47, 0.14), transparent 60%),
    linear-gradient(180deg, #0a0a0a 0%, ${uxRebuildColors.pageBg} 100%);
  overflow: hidden;

  @media (max-width: 1199px) {
    grid-template-columns: minmax(0, 55%) minmax(0, 45%);
  }

  @media (max-width: 767px) {
    grid-template-columns: 1fr;
    min-height: 0;
  }
`

const HeroLeft = styled.div`
  padding: 20px 8px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
  z-index: 1;

  @media (max-width: 767px) {
    padding: 16px 12px 8px;
    order: 1;
  }
`

const HeroRight = styled.div`
  min-width: 0;
  z-index: 1;
  display: flex;
  align-items: stretch;

  @media (max-width: 767px) {
    order: 2;
  }
`

const Badge = styled.div`
  height: 28px;
  width: fit-content;
  padding: 0 12px;
  border-radius: 999px;
  background: ${uxRebuildColors.goldDarkSurface};
  border: 1px solid ${uxRebuildColors.goldBorder};
  color: ${uxRebuildColors.gold};
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  display: inline-flex;
  align-items: center;
  white-space: nowrap;
`

const Headline = styled.h1`
  margin: 16px 0 0;
  max-width: 580px;
  font-weight: 750;
`

const HeadlineLine1 = styled.span`
  display: block;
  font-size: 42px;
  line-height: 48px;
  font-weight: 750;
  color: ${uxRebuildColors.text};

  @media (max-width: 767px) {
    font-size: 34px;
    line-height: 39px;
  }
`

const HeadlineLine2 = styled.span`
  display: block;
  font-size: 48px;
  line-height: 54px;
  font-weight: 800;
  color: ${uxRebuildColors.gold};

  @media (max-width: 767px) {
    font-size: 38px;
    line-height: 43px;
  }
`

const Description = styled.p`
  margin: 14px 0 0;
  max-width: 470px;
  font-size: 15px;
  line-height: 23px;
  color: ${uxRebuildColors.bodySoft};
`

const CtaRow = styled.div`
  margin-top: 18px;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
`

const PrimaryCta = styled.button`
  height: 42px;
  padding: 0 24px;
  border: 0;
  border-radius: 10px;
  background: ${uxRebuildColors.gold};
  color: #080808;
  font-size: 14px;
  font-weight: 650;
  cursor: pointer;
  box-shadow: ${uxRebuildShadow.goldCta};

  &:hover {
    background: ${uxRebuildColors.goldHover};
  }
`

const Trust = styled.p`
  margin: 18px 0 0;
  font-size: 13px;
  color: ${uxRebuildColors.secondary};

  strong {
    color: ${uxRebuildColors.gold};
    font-weight: 650;
  }
`

const SwapWrap = styled.div`
  width: 100%;
  border-radius: 18px;
  border: 1px solid #242424;
  background: rgba(16, 16, 16, 0.96);
  box-shadow: ${uxRebuildShadow.elevated};
  padding: 18px;
  box-sizing: border-box;
  min-height: 332px;

  [data-home-swap-panel],
  [data-ls-panel],
  [data-melega-swap-shell] {
    max-width: none !important;
  }
`

const KpiRail = styled.section`
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 12px;

  @media (max-width: 1199px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  @media (max-width: 767px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`

const KpiCard = styled.div`
  min-height: 76px;
  padding: 12px 14px;
  border-radius: 12px;
  background: ${uxRebuildColors.card};
  border: 1px solid ${uxRebuildColors.border};
  box-shadow: ${uxRebuildShadow.card};
  box-sizing: border-box;
  min-width: 0;

  @media (max-width: 767px) {
    min-height: 96px;
    padding: 10px 12px;
  }
`

const KpiLabel = styled.div`
  font-size: 11px;
  line-height: 14px;
  font-weight: 650;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${uxRebuildColors.muted};
`

const KpiValue = styled.div`
  margin-top: 8px;
  font-size: 20px;
  line-height: 27px;
  font-weight: 700;
  color: ${uxRebuildColors.text};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;

  @media (max-width: 767px) {
    margin-top: 6px;
    font-size: 17px;
    line-height: 22px;
  }
`

const Discovery = styled.section`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;

  @media (max-width: 1199px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 767px) {
    grid-template-columns: 1fr;
  }
`

const DiscCard = styled.section`
  min-height: 300px;
  padding: 18px 16px;
  border-radius: ${uxRebuildRadius.card};
  background: ${uxRebuildColors.card};
  border: 1px solid ${uxRebuildColors.border};
  box-shadow: ${uxRebuildShadow.card};
  box-sizing: border-box;

  @media (max-width: 767px) {
    min-height: 0;
    padding: 12px;
  }
`

const DiscIcon = styled.span`
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: rgba(221, 185, 47, 0.12);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`

const DiscHead = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;

  ${/* ViewAll stays right */ ''}
  & > a:last-child {
    margin-left: auto;
  }
`

const DiscTitle = styled.h2`
  margin: 0;
  font-size: 16px;
  line-height: 22px;
  font-weight: 650;
  color: ${uxRebuildColors.text};
  display: inline-flex;
  align-items: center;
  gap: 8px;
`

const ViewAll = styled(Link)`
  font-size: 12px;
  font-weight: 650;
  color: ${uxRebuildColors.gold};
  text-decoration: none;
  white-space: nowrap;
`

const DiscRow = styled(Link)`
  min-height: 52px;
  padding: 10px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  display: grid;
  grid-template-columns: 20px 1fr auto;
  gap: 8px;
  align-items: center;
  text-decoration: none;
  color: inherit;

  &:first-of-type {
    border-top: 0;
  }

  @media (max-width: 767px) {
    min-height: 48px;
    padding: 8px 0;
  }
`

const Rank = styled.span`
  font-size: 12px;
  font-weight: 650;
  color: ${uxRebuildColors.muted};
`

const RowMain = styled.div`
  min-width: 0;
`

const RowName = styled.div`
  font-size: 13px;
  font-weight: 650;
  color: ${uxRebuildColors.text};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const RowMeta = styled.div`
  margin-top: 2px;
  font-size: 11px;
  color: ${uxRebuildColors.muted};
`

const RowMetric = styled.div<{ $tone?: 'up' | 'down' | 'flat' }>`
  text-align: right;
  font-size: 13px;
  font-weight: 600;
  color: ${({ $tone }) =>
    $tone === 'up' ? '#00e676' : $tone === 'down' ? '#ff5252' : uxRebuildColors.text};
`

const GoldMetric = styled(RowMetric)`
  color: ${uxRebuildColors.gold};
`

const EmptyRow = styled.div`
  padding: 24px 0;
  font-size: 13px;
  color: ${uxRebuildColors.muted};
  text-align: center;
`

const NA = '—'

export const DexHomeScreen: React.FC = () => {
  const router = useRouter()
  const swapRef = useRef<HTMLDivElement>(null)
  const discoveryRef = useRef<HTMLElement>(null)
  const data = useHomeTradeData()
  const listedProjects = useMemo(() => measureListedProjectsCount(), [])
  const projectCount = listedProjects.finalCount

  const focusProjects =
    router.query.focus === 'projects' || router.query.view === 'projects' || router.asPath.includes('#projects')

  React.useEffect(() => {
    if (router.query.focus === 'swap' || router.query.outputCurrency) {
      swapRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    if (!focusProjects) return
    discoveryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [focusProjects, router.query.focus, router.query.outputCurrency])

  const kpiItems = useMemo(() => {
    const byId = Object.fromEntries(data.liveEconomyMetrics.map((m) => [m.id, m.value]))
    const byLabel = Object.fromEntries(data.liveEconomyMetrics.map((m) => [m.label.toLowerCase(), m.value]))
    const tvlCard = data.marketCards.find((c) => /tvl/i.test(c.label))
    const volCard = data.marketCards.find((c) => c.id === 'volume-24h' || /^24H Volume$/i.test(c.label))
    const farms =
      byId.activeFarms ||
      byLabel['active farms'] ||
      data.liveEconomyMetrics.find((m) => /farm/i.test(m.label))?.value ||
      NA
    const pools =
      byId.activePools ||
      byId.rewardingPools ||
      byLabel['active pools'] ||
      byLabel['rewarding pools'] ||
      data.liveEconomyMetrics.find((m) => /pool/i.test(m.label))?.value ||
      NA
    const markets =
      byId.liquidPairs ||
      byId.markets ||
      byLabel['liquid pairs'] ||
      byLabel.markets ||
      NA
    const volumeValue = volCard?.value ?? NA
    const compact = (v: string) => (/not available/i.test(v) ? NA : v)
    return [
      {
        label: 'TVL',
        value: compact(tvlCard?.value ?? NA),
        title: 'Canonical Melega DEX liquidity TVL (factual farm/liquidity sources).',
      },
      {
        label: '24H Volume',
        value: compact(volumeValue),
        title: 'Aggregate factual Melega DEX swap volume over the last 24 hours (USD when valuation is supported).',
      },
      {
        label: 'Listed Projects',
        value: projectCount > 0 ? String(projectCount) : NA,
        title: listedProjects.provenance,
      },
      {
        label: 'Active Farms',
        value: compact(String(farms)),
        title: 'Canonical currently farmable MasterBuilder farms.',
      },
      {
        label: 'Active Pools',
        value: compact(String(pools)),
        title: 'Canonical currently active SmartChef staking pools (not historical totals).',
      },
      {
        label: 'Markets',
        value: compact(String(markets)),
        title: 'Unique tradeable Factory pairs / markets from canonical Factory indexing.',
      },
    ]
  }, [data.liveEconomyMetrics, data.marketCards, projectCount, listedProjects.provenance])

  // Exact prefix of the shared Top Movers snapshot (same snapshotId as ticker).
  const trendingRows = useMemo(() => {
    const entries = data.homeTopMoversEntries ?? []
    return entries.map((entry, idx) => {
      const move = entry.changeLabel?.trim()
      const positive = entry.accentPositive
      const tone: 'up' | 'down' | 'flat' =
        positive === true ? 'up' : positive === false ? 'down' : 'flat'
      const arrow = tone === 'up' ? '▲' : tone === 'down' ? '▼' : ''
      return {
        id: entry.id ?? `trend-${idx}`,
        rank: idx + 1,
        name: entry.symbol,
        meta: entry.address ? `${entry.address.slice(0, 6)}…${entry.address.slice(-4)}` : entry.symbol,
        metric: move ? `${arrow}${move}` : undefined,
        tone,
        srLabel:
          tone === 'up' ? `Up ${move}` : tone === 'down' ? `Down ${move}` : move || 'Unchanged',
        href: entry.href,
      }
    })
  }, [data.homeTopMoversEntries])

  const farmRows = (data.farmRows ?? []).slice(0, 5)
  const poolRows = (data.poolRows ?? []).slice(0, 5)

  const newListings = useMemo(() => {
    return getAllProjects()
      .filter((p) => p.slug && p.slug !== 'melega-dex')
      .slice(0, 5)
      .map((p) => ({
        id: p.slug,
        name: p.displayName || p.slug,
        meta: p.resources?.tokens?.[0]?.symbol || p.slug,
        href: `/@${p.slug}`,
        metric: 'Indexed',
      }))
  }, [])

  const scrollToSwap = () => {
    const root = swapRef.current
    root?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    // Focus the on-page terminal input — no second Swap surface.
    window.setTimeout(() => {
      const input =
        root?.querySelector<HTMLElement>('.home-trade-swap input.token-amount-input') ||
        root?.querySelector<HTMLElement>('.home-trade-swap input') ||
        root?.querySelector<HTMLElement>('[data-home-swap-panel] input')
      input?.focus({ preventScroll: true })
    }, 280)
  }

  return (
    <Root data-dex-home-screen data-ux-rebuild-home>
      <PageMeta />
      <HomeTradeGlobalStyle />
      <Content>
        <DataSurfaceErrorBoundary
          surface="Homepage"
          userReason="Homepage market modules are temporarily unavailable."
        >
          <Hero data-home-section="hero">
            <HeroLeft>
              <Badge>AI-POWERED · MULTICHAIN · BUILT FOR BUILDERS</Badge>
              <Headline>
                <HeadlineLine1>Discover. Trade. Earn.</HeadlineLine1>
                <HeadlineLine2>All in One DEX.</HeadlineLine2>
              </Headline>
              <Description>
                Melega DEX is the next-gen decentralized exchange built for the new era of on-chain finance.
              </Description>
              <CtaRow>
                {/* Single Swap entry — on-page terminal with Instant|Smart mode tabs. No duplicate Instant/Smart CTAs. */}
                <PrimaryCta type="button" data-testid="dex-home-start-trading" onClick={scrollToSwap}>
                  Swap
                </PrimaryCta>
              </CtaRow>
              <Trust>
                Powered by AI. Secured by <strong>MARCO</strong>.
              </Trust>
            </HeroLeft>
            <HeroRight ref={swapRef} id="swap" data-home-section="swap">
              <SwapWrap data-testid="dex-home-instant-swap">
                <HomeSwapPanel />
              </SwapWrap>
            </HeroRight>
          </Hero>

          <FeaturedProjectsRail />

          <KpiRail data-testid="dex-home-kpi-rail" data-home-section="kpi">
            {kpiItems.map((k) => (
              <KpiCard key={k.label} title={k.title} aria-label={`${k.label}: ${k.value}. ${k.title}`}>
                <KpiLabel>{k.label}</KpiLabel>
                <KpiValue>{k.value}</KpiValue>
              </KpiCard>
            ))}
          </KpiRail>

          <Discovery ref={discoveryRef} id="projects" data-testid="dex-home-discovery" data-home-section="discovery">
            <DiscCard
              data-top-movers-snapshot-id={data.topMoversSnapshotId}
              data-top-movers-surface="home-card"
              data-top-movers-prefix={data.topMoversPrefixResult}
            >
              <DiscHead>
                <DiscIcon>
                  <TrendingUp size={14} color={uxRebuildColors.gold} aria-hidden />
                </DiscIcon>
                <DiscTitle>Top Movers</DiscTitle>
                <ViewAll href="/trending">
                  View all <ArrowRight size={12} style={{ display: 'inline' }} />
                </ViewAll>
              </DiscHead>
              {trendingRows.length === 0 ? (
                <EmptyRow>No verified 24h movers yet</EmptyRow>
              ) : (
                trendingRows.map((row) => (
                  <DiscRow key={row.id} href={row.href}>
                    <Rank>{row.rank}</Rank>
                    <RowMain>
                      <RowName>{row.name}</RowName>
                      <RowMeta>{row.meta || '—'}</RowMeta>
                    </RowMain>
                    <RowMetric
                      $tone={row.tone}
                      aria-label={row.srLabel}
                      data-tone={row.tone}
                    >
                      {row.metric ?? ''}
                    </RowMetric>
                  </DiscRow>
                ))
              )}
            </DiscCard>

            <DiscCard>
              <DiscHead>
                <DiscIcon>
                  <Sprout size={14} color={uxRebuildColors.gold} aria-hidden />
                </DiscIcon>
                <DiscTitle>Top Farms</DiscTitle>
                <ViewAll href="/farms">View all →</ViewAll>
              </DiscHead>
              {farmRows.length === 0 ? (
                <EmptyRow>No live farm rankings yet. Open Farms for the full inventory.</EmptyRow>
              ) : (
                farmRows.map((row) => (
                  <DiscRow key={row.id} href={row.href || '/farms'}>
                    <Rank>·</Rank>
                    <RowMain>
                      <RowName>{row.name}</RowName>
                      {row.tvl ? <RowMeta>{`TVL ${row.tvl}`}</RowMeta> : null}
                    </RowMain>
                    <GoldMetric>{row.apr ? `${row.apr}` : NA}</GoldMetric>
                  </DiscRow>
                ))
              )}
            </DiscCard>

            <DiscCard>
              <DiscHead>
                <DiscIcon>
                  <Droplets size={14} color={uxRebuildColors.gold} aria-hidden />
                </DiscIcon>
                <DiscTitle>Top Pools</DiscTitle>
                <ViewAll href="/pools">View all →</ViewAll>
              </DiscHead>
              {poolRows.length === 0 ? (
                <EmptyRow>No live pool rankings yet. Open Pools for the full inventory.</EmptyRow>
              ) : (
                poolRows.map((row) => (
                  <DiscRow key={row.id} href={row.href || '/pools'}>
                    <Rank>·</Rank>
                    <RowMain>
                      <RowName>{row.name}</RowName>
                      {row.tvl ? <RowMeta>{`TVL ${row.tvl}`}</RowMeta> : null}
                    </RowMain>
                    <RowMetric>{row.apr ? row.apr : NA}</RowMetric>
                  </DiscRow>
                ))
              )}
            </DiscCard>

            <DiscCard>
              <DiscHead>
                <DiscIcon>
                  <Sparkles size={14} color={uxRebuildColors.gold} aria-hidden />
                </DiscIcon>
                <DiscTitle>New Listings</DiscTitle>
                <ViewAll href="/list">View all →</ViewAll>
              </DiscHead>
              {newListings.length === 0 ? (
                <EmptyRow>No verified listings yet</EmptyRow>
              ) : (
                newListings.map((row) => (
                  <DiscRow key={row.id} href={row.href}>
                    <Rank>·</Rank>
                    <RowMain>
                      <RowName>{row.name}</RowName>
                      <RowMeta>{row.meta}</RowMeta>
                    </RowMain>
                    <RowMetric>{row.metric}</RowMetric>
                  </DiscRow>
                ))
              )}
            </DiscCard>
          </Discovery>

          <ExploreMelegaEcosystem />
        </DataSurfaceErrorBoundary>
      </Content>
    </Root>
  )
}

export default DexHomeScreen
