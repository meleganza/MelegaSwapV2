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
import useHomeTradeData from './useHomeTradeData'
import { buildHomeMachine } from './buildHomeMachine'
import { getAllProjects } from 'registry/projects/getAllProjects'
import { homeTradeLayout } from './homeTradeTokens'
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
    padding: 0 ${homeTradeLayout.contentPaddingX} ${homeTradeLayout.mobileBottomPad};
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
    padding: 16px 16px ${homeTradeLayout.mobileBottomPad};
  }
`

const HeroRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${homeTradeLayout.heroGap};
  margin-top: 0;

  @media (min-width: 768px) {
    display: grid;
    grid-template-columns: ${homeTradeLayout.swapWidth} 1fr;
    height: ${homeTradeLayout.heroMaxHeight};
    max-height: ${homeTradeLayout.heroMaxHeight};
    align-items: stretch;
  }
`

const LowerRow = styled.div<{ $hasEarn?: boolean }>`
  display: grid;
  gap: ${homeTradeLayout.columnGap};

  @media (min-width: 768px) {
    grid-template-columns: ${({ $hasEarn }) => ($hasEarn ? '1fr 1fr' : '1fr')};
  }
`

export const HomeTradeScreen: React.FC = () => {
  return (
    <Root data-home-trade-screen data-r200-premium="true">
      <PageMeta />
      <HomeTradeGlobalStyle />
      <Content>
        <DataSurfaceErrorBoundary
          surface="Trending"
          userReason="Trending market rankings are temporarily unavailable."
        >
          <TrendingRibbon />
        </DataSurfaceErrorBoundary>
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

  const machine = useMemo(
    () =>
      buildHomeMachine({
        indexedProjects: getAllProjects().length,
        marketCards: data.marketCards,
        activityRows: data.activityRows.length,
        earnRows: data.farmRows.length + data.poolRows.length,
        subgraphEndpoint: data.indexerState?.configuredEndpoint,
        subgraphBlocker: data.indexerState?.blockerCode,
      }),
    [data],
  )

  const pulseRows = useMemo((): MelegaPulseRow[] => {
    const rows: MelegaPulseRow[] = []
    const latestProject = data.marketCards.find((c) => c.id === 'latest-listing')

    if (latestProject) rows.push({ id: 'listing', label: 'Latest Listing', value: latestProject.value })

    return rows.slice(0, 3)
  }, [data.marketCards])

  return (
    <>
        <HeroRow>
          <HomeSwapPanel />
          <DataSurfaceErrorBoundary
            surface="Live Economy"
            userReason="Live economy metrics are temporarily unavailable."
          >
            <MelegaCinematicPanel
              pulseRows={pulseRows.length ? pulseRows : undefined}
              liveEconomy={data.liveEconomyMetrics}
            />
          </DataSurfaceErrorBoundary>
        </HeroRow>
        <HomeMarketOverview
          cards={data.marketCards}
          isIndexing={data.isTrendingIndexing}
          unavailableReason={data.marketUnavailableReason}
        />
        <HomeQuickActions />
        <ListProjectCta />
        <GrowInsideMelegaPanel />
        <LowerRow $hasEarn={data.showEarn}>
          {data.showEarn && (
            <EarnOpportunities farmRows={data.farmRows} poolRows={data.poolRows} showNote={data.showEarnNote} />
          )}
          <MarketPulsePanel />
        </LowerRow>
        <DataSurfaceErrorBoundary
          surface="Live Activity"
          userReason="Live protocol activity feed is temporarily unavailable."
        >
          <LiveActivityFeed
            title={data.activityScopeTitle}
            slots={data.activitySlots}
            rows={data.activityRows}
            isIndexing={data.isActivityIndexing}
            activityUnavailable={data.activityUnavailable}
            indexerState={data.indexerState}
          />
        </DataSurfaceErrorBoundary>
        <HomeTradeFooter />
        <HomeMachinePanel machine={machine} />
    </>
  )
}

export default HomeTradeScreen
