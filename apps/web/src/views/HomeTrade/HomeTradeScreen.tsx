import React, { useMemo } from 'react'
import styled from 'styled-components'
import { PageMeta } from 'components/Layout/Page'
import { colors, typography, MelegaCinematicPanel, type MelegaPulseRow } from 'design-system/melega'
import HomeTradeGlobalStyle from './HomeTradeGlobalStyle'
import TrendingRibbon from './TrendingRibbon'
import HomeSwapPanel from './HomeSwapPanel'
import QuickMarketStrip from './QuickMarketStrip'
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
  color: ${colors.textPrimary};
  font-family: ${typography.fontFamily.body};
  font-size: ${typography.fontSize.base};
  line-height: ${typography.lineHeight.normal};
  background: ${premiumStudioColors.canvas};

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

  @media (max-width: 767px) {
    gap: 16px;
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

const GrowSection = styled.div`
  margin-top: 4px;
`

const LowerSection = styled.div`
  margin-top: 4px;
`

const LowerRow = styled.div<{ $hasEarn?: boolean }>`
  display: grid;
  gap: ${homeTradeLayout.columnGap};

  @media (min-width: 768px) {
    grid-template-columns: ${({ $hasEarn }) => ($hasEarn ? '1fr 1fr' : '1fr')};
  }
`

export const HomeTradeScreen: React.FC = () => {
  const data = useHomeTradeData()

  const machine = useMemo(
    () =>
      buildHomeMachine({
        indexedProjects: getAllProjects().length,
        marketCards: data.marketCards,
        activityRows: data.activityRows.length,
        earnRows: data.farmRows.length + data.poolRows.length,
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
    <Root data-home-trade-screen data-r200-premium="true">
      <PageMeta />
      <HomeTradeGlobalStyle />
      <Content>
        <TrendingRibbon />
        <HeroRow>
          <HomeSwapPanel />
          <MelegaCinematicPanel
            pulseRows={pulseRows.length ? pulseRows : undefined}
            liveEconomy={data.liveEconomyMetrics.length ? data.liveEconomyMetrics : undefined}
          />
        </HeroRow>
        {data.showMarket ? (
          <QuickMarketStrip cards={data.marketCards} isIndexing={data.isActivityIndexing} />
        ) : (
          <QuickMarketStrip cards={[]} isIndexing={data.isActivityIndexing} />
        )}
        <ListProjectCta />
        <GrowSection>
          <GrowInsideMelegaPanel />
        </GrowSection>
        <LowerSection>
          <LowerRow $hasEarn={data.showEarn}>
            {data.showEarn && (
              <EarnOpportunities farmRows={data.farmRows} poolRows={data.poolRows} showNote={data.showEarnNote} />
            )}
            <MarketPulsePanel />
          </LowerRow>
        </LowerSection>
        <LiveActivityFeed
          slots={data.activitySlots}
          rows={data.activityRows}
          isIndexing={data.isActivityIndexing}
          activityUnavailable={data.activityUnavailable}
        />
        <HomeTradeFooter />
        <HomeMachinePanel machine={machine} />
      </Content>
    </Root>
  )
}

export default HomeTradeScreen
