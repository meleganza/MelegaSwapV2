import React, { useMemo } from 'react'
import styled from 'styled-components'
import { PageMeta } from 'components/Layout/Page'
import { DataSurfaceErrorBoundary } from 'components/ErrorBoundary'
import { typography, MelegaCinematicPanel, type MelegaPulseRow } from 'design-system/melega'
import HomeTradeGlobalStyle from './HomeTradeGlobalStyle'
import TrendingRibbon from './TrendingRibbon'
import HomeSwapPanel from './HomeSwapPanel'
import HomeMarketOverview from './HomeMarketOverview'
import HomeQuickActions from './HomeQuickActions'
import ListProjectCta from './ListProjectCta'
import EarnOpportunities from './EarnOpportunities'
import LiveActivityFeed from './LiveActivityFeed'
import GrowInsideMelegaPanel from './GrowInsideMelegaPanel'
import MarketPulsePanel from './MarketPulsePanel'
import HomeTradeFooter from './HomeTradeFooter'
import HomeMachinePanel from './components/HomeMachinePanel'
import HomeHeroStatement from './HomeHeroStatement'
import useHomeTradeData from './useHomeTradeData'
import { buildHomeMachine } from './buildHomeMachine'
import { getAllProjects } from 'registry/projects/getAllProjects'
import { homeTradeLayout, homeTypography } from './homeTradeTokens'
import { premiumStudioColors } from 'design-system/melega/tokens/premiumStudio'

const Root = styled.div`
  color: ${premiumStudioColors.text};
  font-family: ${typography.fontFamily.body};
  font-size: ${typography.fontSize.base};
  line-height: ${typography.lineHeight.normal};
  background: ${premiumStudioColors.canvas};
  min-width: 0;
  overflow-x: hidden;

  @media (max-width: 767px) {
    /* Shell already applies bottom safe-area pad — avoid double stacking. */
    padding: 0 0 8px;
    font-size: ${homeTypography.mobileBody.size};
  }
`

const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${homeTradeLayout.sectionGap};
  max-width: ${homeTradeLayout.contentMax};
  margin: 0 auto;
  padding: ${homeTradeLayout.contentPaddingTop} ${homeTradeLayout.contentPaddingX}
    ${homeTradeLayout.contentPaddingBottom};
  box-sizing: border-box;
  min-width: 0;

  @media (max-width: 767px) {
    padding: 8px 16px 28px;
    gap: ${homeTradeLayout.mobileSectionGap};
  }
`

const HomeLayout = styled.div`
  display: flex;
  flex-direction: column;
  gap: inherit;
  min-width: 0;

  @media (min-width: 768px) {
    display: grid;
    grid-template-columns: ${homeTradeLayout.swapWidth} 1fr;
    gap: ${homeTradeLayout.sectionGap} ${homeTradeLayout.columnGap};
    grid-template-areas:
      'trending trending'
      'swap cinematic'
      'market market'
      'quick quick'
      'list list'
      'grow grow'
      'earn earn'
      'activity activity'
      'footer footer'
      'machine machine';
  }
`

const HomeSection = styled.div<{ $area: string; $mobileOrder: number }>`
  min-width: 0;
  order: ${({ $mobileOrder }) => $mobileOrder};

  @media (min-width: 768px) {
    order: unset;
    grid-area: ${({ $area }) => $area};
  }
`

export const HomeTradeScreen: React.FC = () => {
  return (
    <Root data-home-trade-screen data-r200-premium="true">
      <PageMeta />
      <HomeTradeGlobalStyle />
      <Content>
        <DataSurfaceErrorBoundary
          surface="Homepage"
          userReason="Homepage market modules are temporarily unavailable."
        >
          <HomeTradeScreenContent />
        </DataSurfaceErrorBoundary>
      </Content>
    </Root>
  )
}

const HomeTradeScreenContent: React.FC = () => {
  const data = useHomeTradeData()
  const activityRows = Array.isArray(data.homeActivityRows) ? data.homeActivityRows : []

  const machine = useMemo(
    () =>
      buildHomeMachine({
        indexedProjects: getAllProjects().length,
        marketCards: data.marketCards,
        activityRows: activityRows.length,
        earnRows: data.farmRows.length + data.poolRows.length,
        subgraphEndpoint: data.indexerState?.configuredEndpoint,
        subgraphBlocker: data.indexerState?.blockerCode,
      }),
    [data, activityRows.length],
  )

  const pulseRows = useMemo((): MelegaPulseRow[] => {
    const rows: MelegaPulseRow[] = []
    const latestProject = data.marketCards.find((c) => c.id === 'latest-listing')

    if (latestProject) rows.push({ id: 'listing', label: 'Latest Listing', value: latestProject.value })

    return rows.slice(0, 3)
  }, [data.marketCards])

  return (
    <HomeLayout>
      <HomeSection $area="hero" $mobileOrder={1} data-home-section="hero">
        <HomeHeroStatement />
      </HomeSection>

      <HomeSection $area="swap" $mobileOrder={2} data-home-section="swap">
        <HomeSwapPanel />
      </HomeSection>

      <HomeSection $area="trending" $mobileOrder={3} data-home-section="trending">
        <DataSurfaceErrorBoundary
          surface="Trending"
          userReason="Trending market rankings are temporarily unavailable."
        >
          <TrendingRibbon />
        </DataSurfaceErrorBoundary>
      </HomeSection>

      <HomeSection $area="market" $mobileOrder={4} data-home-section="market">
        <HomeMarketOverview cards={data.marketCards} />
      </HomeSection>

      <HomeSection $area="quick" $mobileOrder={5} data-home-section="quick-actions">
        <HomeQuickActions />
      </HomeSection>

      <HomeSection $area="cinematic" $mobileOrder={6} data-home-section="cinematic">
        <DataSurfaceErrorBoundary
          surface="Live Economy"
          userReason="Live economy metrics are temporarily unavailable."
        >
          <MelegaCinematicPanel pulseRows={pulseRows.length ? pulseRows : undefined} liveEconomy={data.liveEconomyMetrics} />
        </DataSurfaceErrorBoundary>
      </HomeSection>

      <HomeSection $area="list" $mobileOrder={7} data-home-section="list-cta">
        <ListProjectCta />
      </HomeSection>

      <HomeSection $area="grow" $mobileOrder={8} data-home-section="grow">
        <GrowInsideMelegaPanel />
      </HomeSection>

      <HomeSection $area="earn" $mobileOrder={9} data-home-section="earn">
        <LowerRow $hasEarn={data.showEarn}>
          {data.showEarn && (
            <EarnOpportunities farmRows={data.farmRows} poolRows={data.poolRows} showNote={data.showEarnNote} />
          )}
          <MarketPulsePanel />
        </LowerRow>
      </HomeSection>

      <HomeSection $area="activity" $mobileOrder={10} data-home-section="activity">
        <DataSurfaceErrorBoundary
          surface="Live Activity"
          userReason="Live protocol activity feed is temporarily unavailable."
        >
          <LiveActivityFeed
            rows={activityRows}
            viewAllHref={data.activityViewAllHref}
            isIndexing={data.isActivityIndexing}
            isError={data.activityIsError}
            errorDetail={data.activityErrorDetail}
            emptySecondary={data.activityEmptySecondary}
          />
        </DataSurfaceErrorBoundary>
      </HomeSection>

      <HomeSection $area="footer" $mobileOrder={11}>
        <HomeTradeFooter />
      </HomeSection>

      <HomeSection $area="machine" $mobileOrder={12}>
        <HomeMachinePanel machine={machine} />
      </HomeSection>
    </HomeLayout>
  )
}

const LowerRow = styled.div<{ $hasEarn?: boolean }>`
  display: grid;
  gap: ${homeTradeLayout.columnGap};

  @media (min-width: 768px) {
    grid-template-columns: ${({ $hasEarn }) => ($hasEarn ? '1fr 1fr' : '1fr')};
  }
`

export default HomeTradeScreen
