/**
 * Melega DEX Complete UX Rebuild — Home (trade + discovery surface).
 * Visual SSOT: approved dark Home mockup. Zero fabricated metrics.
 */
import React, { useMemo, useRef } from 'react'
import styled, { keyframes } from 'styled-components'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { PageMeta } from 'components/Layout/Page'
import { DataSurfaceErrorBoundary } from 'components/ErrorBoundary'
import { TrendingUp, Sprout, Droplets, Sparkles, ArrowRight } from 'lucide-react'
import HomeTradeGlobalStyle from './HomeTradeGlobalStyle'
import HomeSwapPanel from './HomeSwapPanel'
import { HomeTradeDataProvider, useHomeCriticalData } from './HomeTradeDataContext'
import { buildHomeNewListings } from './buildHomeNewListings'
import { measureListedProjectsCount } from 'lib/market-registry/listedProjectsCount'
import { FeaturedProjectsRail } from './FeaturedProjectsRail'
import { ExploreMelegaEcosystem } from './ExploreMelegaEcosystem'
import { MelegaExploreChainBadge } from 'components/Logo/MelegaExploreChainBadge'
import { MelegaTokenAvatar } from 'design-system/melega/components/MelegaTokenAvatar/MelegaTokenAvatar'
import {
  uxRebuildColors,
  uxRebuildFont,
  uxRebuildDisplayFont,
  uxRebuildLayout,
  uxRebuildMotion,
  uxRebuildRadius,
  uxRebuildShadow,
} from 'design-system/melega/tokens/uxRebuild'

const ambientDrift = keyframes`
  0%, 100% { opacity: 0.45; transform: translate3d(0, 0, 0) scale(1); }
  50% { opacity: 0.72; transform: translate3d(-2%, 2%, 0) scale(1.06); }
`

const surfaceIn = keyframes`
  from { opacity: 0; transform: translate3d(0, 8px, 0); }
  to { opacity: 1; transform: translate3d(0, 0, 0); }
`

const Root = styled.div`
  color: ${uxRebuildColors.text};
  font-family: ${uxRebuildFont};
  background: radial-gradient(circle at 78% 8%, rgba(221, 185, 47, 0.055), transparent 24%),
    radial-gradient(circle at 12% 42%, rgba(44, 92, 255, 0.035), transparent 30%), ${uxRebuildColors.pageBg};
  min-width: 0;
  overflow-x: hidden;

  font-variant-numeric: tabular-nums;
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
  min-height: 332px;
  align-items: stretch;
  position: relative;
  border: 0;
  background: transparent;
  overflow: visible;

  &::before {
    content: '';
    position: absolute;
    width: 460px;
    height: 460px;
    right: 4%;
    top: -290px;
    border-radius: 50%;
    background: rgba(221, 185, 47, 0.18);
    filter: blur(90px);
    pointer-events: none;
    animation: ${ambientDrift} 12s ease-in-out infinite;
  }

  @media (max-width: 1199px) {
    grid-template-columns: minmax(0, 55%) minmax(0, 45%);
  }

  @media (max-width: 767px) {
    grid-template-columns: 1fr;
    min-height: 0;
  }
`

const HeroLeft = styled.div`
  padding: 24px 14px;
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
  font-family: ${uxRebuildDisplayFont};
  letter-spacing: -0.045em;
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
  transition: transform ${uxRebuildMotion.standard}, background ${uxRebuildMotion.standard},
    border-color ${uxRebuildMotion.standard}, box-shadow ${uxRebuildMotion.standard};

  &:hover {
    background: ${uxRebuildColors.goldHover};
    transform: translateY(-2px);
    box-shadow: 0 14px 36px rgba(221, 185, 47, 0.22);
  }

  &:active {
    transform: translateY(0) scale(0.985);
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
  border-radius: 20px;
  border: 0;
  background: transparent;
  box-shadow: none;
  padding: 0;
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
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.024), transparent 45%), ${uxRebuildColors.card};
  border: 1px solid ${uxRebuildColors.border};
  box-shadow: ${uxRebuildShadow.card};
  box-sizing: border-box;
  min-width: 0;
  animation: ${surfaceIn} ${uxRebuildMotion.reveal} both;

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
  font-family: ${uxRebuildDisplayFont};
  letter-spacing: -0.025em;

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
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.024), transparent 42%), ${uxRebuildColors.card};
  border: 1px solid ${uxRebuildColors.border};
  box-shadow: ${uxRebuildShadow.card};
  box-sizing: border-box;
  animation: ${surfaceIn} ${uxRebuildMotion.reveal} both;

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
  border: 1px solid rgba(221, 185, 47, 0.18);
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
  transition: color ${uxRebuildMotion.fast}, transform ${uxRebuildMotion.fast};

  &:hover {
    color: ${uxRebuildColors.goldHover};
    transform: translateX(2px);
  }
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
  border-radius: 10px;
  transition: background ${uxRebuildMotion.fast}, transform ${uxRebuildMotion.fast};

  &:hover {
    background: rgba(255, 255, 255, 0.035);
    transform: translateX(2px);
  }

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
  color: ${({ $tone }) => ($tone === 'up' ? '#00e676' : $tone === 'down' ? '#ff5252' : uxRebuildColors.text)};
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

const DexHomeScreenContent: React.FC = () => {
  const router = useRouter()
  const swapRef = useRef<HTMLDivElement>(null)
  const discoveryRef = useRef<HTMLElement>(null)
  const data = useHomeCriticalData()
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
    const markets = byId.liquidPairs || byId.markets || byLabel['liquid pairs'] || byLabel.markets || NA
    const volumeValue = volCard?.value ?? NA
    const compact = (v: string) => {
      if (/not available/i.test(v)) return '—'
      if (v === '0' || v === NA) return v === '0' ? '0' : '—'
      return v === 'Unavailable' ? '—' : v
    }
    const honestCount = (v: string | number | undefined) => {
      const n = Number(v)
      if (Number.isFinite(n) && n > 0) return String(n)
      if (v === '0' || n === 0) return '0'
      return '—'
    }
    const tvlValue = tvlCard?.value ? compact(tvlCard.value) : data.marketCards.length === 0 ? 'Data syncing' : '—'
    const volValue = volCard?.value ? compact(volumeValue) : '—'
    return [
      {
        label: 'TVL',
        value: tvlValue,
        title: 'Canonical Melega DEX liquidity TVL (factual farm/liquidity sources).',
      },
      {
        label: '24H Volume',
        value: volValue,
        title: 'Aggregate factual Melega DEX swap volume over the last 24 hours (USD when valuation is supported).',
      },
      {
        label: 'Listed Projects',
        value: projectCount > 0 ? String(projectCount) : '—',
        title: listedProjects.provenance,
      },
      {
        label: 'Active Farms',
        value: honestCount(farms),
        title: 'LIVE farm configurations across supported chains (runtime when loaded, else certified inventory).',
      },
      {
        label: 'Active Pools',
        value: honestCount(pools),
        title:
          'LIVE SmartChef pool configurations across supported chains (runtime when loaded, else certified inventory).',
      },
      {
        label: 'Markets',
        value: honestCount(markets),
        title: 'Unique tradeable Factory pairs / markets from canonical Factory indexing.',
      },
    ]
  }, [data.liveEconomyMetrics, data.marketCards, data.marketCards.length, projectCount, listedProjects.provenance])

  // Exact prefix of the shared Top Movers snapshot (same snapshotId as ticker).
  const trendingRows = useMemo(() => {
    const entries = data.homeTopMoversEntries ?? []
    const ribbon = data.indexedRibbonAssets ?? []
    return entries.map((entry, idx) => {
      const move = entry.changeLabel?.trim()
      const positive = entry.accentPositive
      const tone: 'up' | 'down' | 'flat' = positive === true ? 'up' : positive === false ? 'down' : 'flat'
      const arrow = tone === 'up' ? '▲' : tone === 'down' ? '▼' : ''
      const ribbonMatch = ribbon.find(
        (a) =>
          (entry.address && a.address?.toLowerCase() === entry.address.toLowerCase()) ||
          a.symbol?.toUpperCase() === entry.symbol?.toUpperCase(),
      )
      const chainId = entry.chainId ?? ribbonMatch?.chainId ?? 56
      return {
        id: entry.id ?? `trend-${idx}`,
        rank: idx + 1,
        name: entry.symbol,
        address: entry.address,
        chainId,
        meta: entry.address ? `${entry.address.slice(0, 6)}…${entry.address.slice(-4)}` : entry.symbol,
        metric: move ? `${arrow}${move}` : undefined,
        tone,
        srLabel: tone === 'up' ? `Up ${move}` : tone === 'down' ? `Down ${move}` : move || 'Unchanged',
        href: entry.href,
      }
    })
  }, [data.homeTopMoversEntries, data.indexedRibbonAssets])

  const farmRows = (data.farmRows ?? []).slice(0, 3)
  const poolRows = (data.poolRows ?? []).slice(0, 3)

  const newListings = useMemo(() => buildHomeNewListings(3), [])

  return (
    <Root data-dex-home-screen data-ux-rebuild-home>
      <PageMeta />
      <HomeTradeGlobalStyle />
      <Content>
        <DataSurfaceErrorBoundary surface="Homepage" userReason="Homepage market modules are temporarily unavailable.">
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
                <PrimaryCta type="button" data-testid="dex-home-list-project" onClick={() => void router.push('/list')}>
                  List Your Project
                </PrimaryCta>
                <PrimaryCta
                  type="button"
                  data-testid="dex-home-open-trending"
                  onClick={() => void router.push('/projects?sort=trending')}
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(244,196,48,0.45)',
                    color: uxRebuildColors.gold,
                  }}
                >
                  Explore Trending Projects
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
                <ViewAll href="/projects?sort=trending">
                  View all <ArrowRight size={12} style={{ display: 'inline' }} />
                </ViewAll>
              </DiscHead>
              {trendingRows.length === 0 ? (
                <EmptyRow>No verified 24h movers yet</EmptyRow>
              ) : (
                trendingRows.map((row) => (
                  <DiscRow key={row.id} href={row.href} data-testid="home-top-mover-row" data-mover-symbol={row.name}>
                    <Rank>{row.rank}</Rank>
                    <RowMain>
                      <RowName style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                        <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {row.name}
                        </span>
                        <MelegaExploreChainBadge chainId={row.chainId} />
                      </RowName>
                      <RowMeta>{row.meta || '—'}</RowMeta>
                    </RowMain>
                    <RowMetric $tone={row.tone} aria-label={row.srLabel} data-tone={row.tone}>
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
                <EmptyRow>Open Farms for the full LIVE inventory.</EmptyRow>
              ) : (
                farmRows.map((row) => (
                  <DiscRow key={row.id} href={row.href || '/farms'} style={{ position: 'relative' }}>
                    <Rank>·</Rank>
                    <RowMain>
                      <RowName style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                        {(row.tokenSymbols ?? []).slice(0, 2).map((sym, i) => (
                          <MelegaTokenAvatar
                            key={`${row.id}-tok-${i}`}
                            symbol={sym}
                            address={row.tokenAddresses?.[i]}
                            chainId={row.chainId ?? 56}
                            size={18}
                            radius="circle"
                          />
                        ))}
                        <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {row.name}
                        </span>
                        {row.chainId != null ? <MelegaExploreChainBadge chainId={row.chainId} /> : null}
                      </RowName>
                      <RowMeta>{`TVL ${row.tvl || '—'}`}</RowMeta>
                    </RowMain>
                    <GoldMetric>{row.apr || '—'}</GoldMetric>
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
                <EmptyRow>Open Pools for the full LIVE inventory.</EmptyRow>
              ) : (
                poolRows.map((row) => (
                  <DiscRow key={row.id} href={row.href || '/pools'}>
                    <Rank>·</Rank>
                    <RowMain>
                      <RowName style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                        {(row.tokenSymbols ?? []).slice(0, 2).map((sym, i) => (
                          <MelegaTokenAvatar
                            key={`${row.id}-tok-${i}`}
                            symbol={sym}
                            address={row.tokenAddresses?.[i]}
                            chainId={row.chainId ?? 56}
                            size={18}
                            radius="circle"
                          />
                        ))}
                        <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {row.name}
                        </span>
                        {row.chainId != null ? <MelegaExploreChainBadge chainId={row.chainId} /> : null}
                      </RowName>
                      <RowMeta>{`TVL ${row.tvl || '—'}`}</RowMeta>
                    </RowMain>
                    <RowMetric
                      title={row.aprUnavailable ? 'APR awaits a verified staking and reward-token price.' : undefined}
                      aria-label={row.apr ? `APR ${row.apr}` : 'APR pricing pending'}
                    >
                      {row.apr || 'Pricing pending'}
                    </RowMetric>
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
                      <RowName style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                        <MelegaTokenAvatar
                          symbol={row.symbol}
                          name={row.name}
                          address={row.address}
                          chainId={row.chainId}
                          logoURI={row.logoUrl}
                          size={18}
                          radius="circle"
                        />
                        <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {row.name}
                        </span>
                        <MelegaExploreChainBadge chainId={row.chainId} />
                      </RowName>
                      <RowMeta>{row.symbol}</RowMeta>
                    </RowMain>
                    <RowMetric data-listing-timestamp={row.listingTimestamp ?? row.listedAt ?? undefined}>
                      {row.metric}
                    </RowMetric>
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

export const DexHomeScreen: React.FC = () => (
  <HomeTradeDataProvider>
    <DexHomeScreenContent />
  </HomeTradeDataProvider>
)

export default DexHomeScreen
