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
import { FolderKanban, Sprout, Droplets, ChartNoAxesCombined, Zap, ArrowRight } from 'lucide-react'
import HomeTradeGlobalStyle from './HomeTradeGlobalStyle'
import HomeSwapPanel from './HomeSwapPanel'
import useHomeTradeData from './useHomeTradeData'
import { getAllProjects } from 'registry/projects/getAllProjects'
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
  gap: 14px;
  min-width: 0;

  @media (max-width: 767px) {
    width: 100%;
    padding: 12px 16px 32px;
    gap: 12px;
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

const SecondaryCta = styled.a`
  height: 42px;
  padding: 0 22px;
  border-radius: 10px;
  border: 1px solid ${uxRebuildColors.borderStrong};
  background: ${uxRebuildColors.card};
  color: ${uxRebuildColors.text};
  font-size: 14px;
  font-weight: 650;
  display: inline-flex;
  align-items: center;
  text-decoration: none;

  &:hover {
    border-color: rgba(221, 185, 47, 0.45);
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

const SwapTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  height: 28px;
  margin-bottom: 12px;
  font-size: 16px;
  font-weight: 650;
  color: ${uxRebuildColors.text};
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
`

const QuickRail = styled.section`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;

  @media (max-width: 767px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`

const QuickCard = styled(Link)`
  height: 76px;
  padding: 14px;
  border-radius: 12px;
  background: ${uxRebuildColors.card};
  border: 1px solid ${uxRebuildColors.border};
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  color: inherit;
  box-sizing: border-box;
  transition: border-color 160ms ease;

  &:hover {
    border-color: rgba(221, 185, 47, 0.45);
  }
`

const IconTile = styled.span<{ $bg: string }>`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: ${({ $bg }) => $bg};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`

const QuickTitle = styled.div`
  font-size: 14px;
  font-weight: 650;
  color: ${uxRebuildColors.text};
`

const QuickSub = styled.div`
  margin-top: 2px;
  font-size: 12px;
  color: ${uxRebuildColors.muted};
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
  min-height: 330px;
  padding: 16px;
  border-radius: 14px;
  background: ${uxRebuildColors.card};
  border: 1px solid ${uxRebuildColors.border};
  box-sizing: border-box;
`

const DiscHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;
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

const RowMetric = styled.div`
  text-align: right;
  font-size: 13px;
  font-weight: 600;
  color: ${uxRebuildColors.text};
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

const BottomPanels = styled.section`
  display: grid;
  grid-template-columns: 2.2fr 1fr;
  gap: 14px;

  @media (max-width: 767px) {
    grid-template-columns: 1fr;
  }
`

const Panel = styled.section`
  min-height: 190px;
  padding: 22px;
  border-radius: 16px;
  background: ${uxRebuildColors.card};
  border: 1px solid ${uxRebuildColors.border};
  box-sizing: border-box;
  position: relative;
  overflow: hidden;
`

const PanelLabel = styled.div`
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: ${uxRebuildColors.gold};
`

const PanelTitle = styled.h2`
  margin: 10px 0 0;
  font-size: 22px;
  line-height: 28px;
  font-weight: 700;
  color: ${uxRebuildColors.text};
`

const PanelBody = styled.p`
  margin: 8px 0 0;
  max-width: 420px;
  font-size: 14px;
  line-height: 21px;
  color: ${uxRebuildColors.secondary};
`

const PanelCta = styled(Link)`
  margin-top: 16px;
  height: 40px;
  padding: 0 18px;
  border-radius: 10px;
  background: ${uxRebuildColors.gold};
  color: #080808;
  font-size: 14px;
  font-weight: 650;
  display: inline-flex;
  align-items: center;
  text-decoration: none;

  &[data-variant='ghost'] {
    background: ${uxRebuildColors.input};
    border: 1px solid ${uxRebuildColors.borderStrong};
    color: ${uxRebuildColors.text};
  }
`

const TrustRail = styled.footer`
  min-height: 76px;
  margin-top: 10px;
  padding: 16px 18px;
  border-radius: 14px;
  background: ${uxRebuildColors.card};
  border: 1px solid ${uxRebuildColors.border};
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  box-sizing: border-box;
`

const TrustLeft = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  font-size: 12px;
  color: ${uxRebuildColors.muted};
`

const ChainPill = styled.span`
  height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  border: 1px solid ${uxRebuildColors.border};
  background: ${uxRebuildColors.input};
  color: ${uxRebuildColors.secondary};
  font-size: 11px;
  font-weight: 650;
  display: inline-flex;
  align-items: center;
`

const TrustRight = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  font-size: 12px;
  color: ${uxRebuildColors.secondary};
`

const NA = 'Not available'

export const DexHomeScreen: React.FC = () => {
  const router = useRouter()
  const swapRef = useRef<HTMLDivElement>(null)
  const discoveryRef = useRef<HTMLElement>(null)
  const data = useHomeTradeData()
  const projectCount = useMemo(() => getAllProjects().length, [])

  const focusProjects =
    router.query.focus === 'projects' || router.query.view === 'projects' || router.asPath.includes('#projects')

  React.useEffect(() => {
    if (router.query.focus === 'swap') {
      swapRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    if (!focusProjects) return
    discoveryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [focusProjects, router.query.focus])

  const kpiItems = useMemo(() => {
    const byId = Object.fromEntries(data.liveEconomyMetrics.map((m) => [m.id, m.value]))
    const byLabel = Object.fromEntries(data.liveEconomyMetrics.map((m) => [m.label.toLowerCase(), m.value]))
    const tvlCard = data.marketCards.find((c) => /tvl/i.test(c.label))
    const volCard = data.marketCards.find((c) => /volume|24h/i.test(c.label))
    const farms =
      byId.activeFarms ||
      byLabel['active farms'] ||
      data.liveEconomyMetrics.find((m) => /farm/i.test(m.label))?.value ||
      NA
    const pools =
      byId.rewardingPools ||
      byLabel['rewarding pools'] ||
      data.liveEconomyMetrics.find((m) => /pool/i.test(m.label))?.value ||
      NA
    const indexed =
      byId.indexedAssets ||
      byLabel['indexed assets'] ||
      data.liveEconomyMetrics.find((m) => /indexed|asset|token/i.test(m.label))?.value ||
      NA
    return [
      { label: 'TVL', value: tvlCard?.value ?? NA },
      { label: '24H Volume', value: volCard?.value ?? NA },
      { label: 'Active Projects', value: projectCount > 0 ? String(projectCount) : NA },
      { label: 'Farms', value: farms },
      { label: 'Pools', value: pools },
      { label: 'Indexed Tokens', value: indexed },
    ]
  }, [data.liveEconomyMetrics, data.marketCards, projectCount])

  const trendingRows = useMemo(() => {
    const assets = data.indexedRibbonAssets ?? []
    return (data.trendingTickerItems ?? []).slice(0, 5).map((item, idx) => {
      const asset = assets[idx]
      const slug = asset?.slug
      return {
        id: item.id ?? `trend-${idx}`,
        rank: idx + 1,
        name: item.primary ?? asset?.symbol ?? 'Token',
        meta: asset?.displayName ?? asset?.symbol ?? '',
        metric: item.secondary ?? NA,
        href: slug ? `/@${slug}` : '/#projects',
      }
    })
  }, [data.trendingTickerItems, data.indexedRibbonAssets])

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
    swapRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
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
                <PrimaryCta type="button" data-testid="dex-home-start-trading" onClick={scrollToSwap}>
                  Start Trading
                </PrimaryCta>
                <SecondaryCta href="/#projects" data-testid="dex-home-explore-projects">
                  Explore Projects
                </SecondaryCta>
              </CtaRow>
              <Trust>
                Powered by AI. Secured by <strong>MARCO</strong>.
              </Trust>
            </HeroLeft>
            <HeroRight ref={swapRef} id="swap" data-home-section="swap">
              <SwapWrap data-testid="dex-home-instant-swap">
                <SwapTitle>
                  <Zap size={18} color={uxRebuildColors.gold} aria-hidden />
                  Instant Swap
                </SwapTitle>
                <HomeSwapPanel />
              </SwapWrap>
            </HeroRight>
          </Hero>

          <KpiRail data-testid="dex-home-kpi-rail" data-home-section="kpi">
            {kpiItems.map((k) => (
              <KpiCard key={k.label}>
                <KpiLabel>{k.label}</KpiLabel>
                <KpiValue>{k.value}</KpiValue>
              </KpiCard>
            ))}
          </KpiRail>

          <QuickRail data-testid="dex-home-quick-actions" data-home-section="quick-actions">
            <QuickCard href="/#projects">
              <IconTile $bg="rgba(124,58,237,0.16)">
                <FolderKanban size={18} color="#A78BFA" aria-hidden />
              </IconTile>
              <div>
                <QuickTitle>Explore Projects</QuickTitle>
                <QuickSub>Discover verified projects</QuickSub>
              </div>
            </QuickCard>
            <QuickCard href="/farms">
              <IconTile $bg="rgba(22,217,119,0.12)">
                <Sprout size={18} color={uxRebuildColors.positive} aria-hidden />
              </IconTile>
              <div>
                <QuickTitle>Top Farms</QuickTitle>
                <QuickSub>High-yield opportunities</QuickSub>
              </div>
            </QuickCard>
            <QuickCard href="/pools">
              <IconTile $bg="rgba(59,130,246,0.14)">
                <Droplets size={18} color="#60A5FA" aria-hidden />
              </IconTile>
              <div>
                <QuickTitle>Top Pools</QuickTitle>
                <QuickSub>Best liquidity pools</QuickSub>
              </div>
            </QuickCard>
            <QuickCard href="/liquidity-studio?view=building">
              <IconTile $bg="rgba(221,185,47,0.14)">
                <ChartNoAxesCombined size={18} color={uxRebuildColors.gold} aria-hidden />
              </IconTile>
              <div>
                <QuickTitle>Liquidity Builder</QuickTitle>
                <QuickSub>Launch & grow liquidity</QuickSub>
              </div>
            </QuickCard>
          </QuickRail>

          <Discovery ref={discoveryRef} id="projects" data-testid="dex-home-discovery" data-home-section="discovery">
            <DiscCard>
              <DiscHead>
                <DiscTitle>Trending Projects</DiscTitle>
                <ViewAll href="/trending">
                  View all <ArrowRight size={12} style={{ display: 'inline' }} />
                </ViewAll>
              </DiscHead>
              {trendingRows.length === 0 ? (
                <EmptyRow>No verified listings yet</EmptyRow>
              ) : (
                trendingRows.map((row) => (
                  <DiscRow key={row.id} href={row.href}>
                    <Rank>{row.rank}</Rank>
                    <RowMain>
                      <RowName>{row.name}</RowName>
                      <RowMeta>{row.meta || '—'}</RowMeta>
                    </RowMain>
                    <RowMetric>{row.metric}</RowMetric>
                  </DiscRow>
                ))
              )}
            </DiscCard>

            <DiscCard>
              <DiscHead>
                <DiscTitle>Top Farms</DiscTitle>
                <ViewAll href="/farms">View all →</ViewAll>
              </DiscHead>
              {farmRows.length === 0 ? (
                <EmptyRow>Awaiting indexer</EmptyRow>
              ) : (
                farmRows.map((row) => (
                  <DiscRow key={row.id} href={row.href || '/farms'}>
                    <Rank>·</Rank>
                    <RowMain>
                      <RowName>{row.name}</RowName>
                      <RowMeta>{row.tvl ? `TVL ${row.tvl}` : 'TVL not available'}</RowMeta>
                    </RowMain>
                    <GoldMetric>{row.apr ? `${row.apr}` : NA}</GoldMetric>
                  </DiscRow>
                ))
              )}
            </DiscCard>

            <DiscCard>
              <DiscHead>
                <DiscTitle>Top Pools</DiscTitle>
                <ViewAll href="/pools">View all →</ViewAll>
              </DiscHead>
              {poolRows.length === 0 ? (
                <EmptyRow>Awaiting indexer</EmptyRow>
              ) : (
                poolRows.map((row) => (
                  <DiscRow key={row.id} href={row.href || '/pools'}>
                    <Rank>·</Rank>
                    <RowMain>
                      <RowName>{row.name}</RowName>
                      <RowMeta>{row.tvl ? `TVL ${row.tvl}` : 'TVL not available'}</RowMeta>
                    </RowMain>
                    <RowMetric>{row.apr ? row.apr : NA}</RowMetric>
                  </DiscRow>
                ))
              )}
            </DiscCard>

            <DiscCard>
              <DiscHead>
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

          <BottomPanels>
            <Panel data-home-section="builder">
              <PanelLabel>LIQUIDITY BUILDER</PanelLabel>
              <PanelTitle>Build liquidity. Earn more.</PanelTitle>
              <PanelBody>
                Create liquidity for your project and grow through Melega Liquidity Builder.
              </PanelBody>
              <PanelCta href="/liquidity-studio?view=building">Launch Builder</PanelCta>
            </Panel>
            <Panel data-home-section="passport">
              <PanelLabel>IDENTITY</PanelLabel>
              <PanelTitle>MARCO Passport</PanelTitle>
              <PanelBody>Your identity and portfolio hub.</PanelBody>
              <PanelCta href="/passport" data-variant="ghost">
                Go to Passport
              </PanelCta>
            </Panel>
          </BottomPanels>

          <TrustRail data-testid="dex-home-trust-rail" data-home-section="trust">
            <TrustLeft>
              <span>Backed by</span>
              <ChainPill>BNB Chain</ChainPill>
              <ChainPill>Supported networks only</ChainPill>
            </TrustLeft>
            <TrustRight>
              <span>Audited: Not available</span>
              <span>Contract: Not available</span>
              <span>Last Audit: Not available</span>
              <span>Security Score: Not available</span>
            </TrustRight>
          </TrustRail>
        </DataSurfaceErrorBoundary>
      </Content>
    </Root>
  )
}

export default DexHomeScreen
