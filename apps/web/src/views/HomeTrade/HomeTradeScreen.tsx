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
import useHomeTradeData from './useHomeTradeData'
import { homeTradeLayout } from './homeTradeTokens'

const Root = styled.div`
  color: ${colors.textPrimary};
  font-family: ${typography.fontFamily.body};
  font-size: ${typography.fontSize.base};
  line-height: ${typography.lineHeight.normal};

  @media (max-width: 767px) {
    padding: 0 14px;
  }
`

const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${homeTradeLayout.sectionGap};
  max-width: ${homeTradeLayout.contentMax};
  margin: 0 auto;

  @media (max-width: 767px) {
    gap: 12px;
  }
`

const MarketStripWrap = styled.div`
  margin-top: -8px;
  position: relative;
  z-index: 2;
`

const CtaWrap = styled.div`
  margin-top: -4px;
  position: relative;
  z-index: 1;
`

const GrowWrap = styled.div`
  margin-top: -6px;
  position: relative;
  z-index: 1;
`

const HeroRow = styled.div`
  display: grid;
  gap: ${homeTradeLayout.heroGap};
  margin-top: 0;

  @media (min-width: 768px) {
    grid-template-columns: ${homeTradeLayout.swapWidth} 1fr;
    height: ${homeTradeLayout.heroMaxHeight};
    max-height: ${homeTradeLayout.heroMaxHeight};
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
  const data = useHomeTradeData()

  const pulseRows = useMemo((): MelegaPulseRow[] => {
    const rows: MelegaPulseRow[] = []
    const topFarm = data.marketCards.find((c) => c.id === 'top-farm')
    const latestProject = data.marketCards.find((c) => c.id === 'latest-project')
    const topPool = data.marketCards.find((c) => c.id === 'top-pool')

    if (topFarm) rows.push({ id: 'farm', label: 'Top Farm', value: topFarm.meta || topFarm.value })
    if (topPool) rows.push({ id: 'pool', label: 'Newest Pool', value: topPool.meta || topPool.value })
    if (latestProject) rows.push({ id: 'listing', label: 'Latest Listing', value: latestProject.value })

    return rows.slice(0, 3)
  }, [data.marketCards])

  return (
    <Root data-home-trade-screen="true">
      <PageMeta />
      <HomeTradeGlobalStyle />
      <Content>
        <TrendingRibbon items={data.ribbonItems} />
        <HeroRow>
          <HomeSwapPanel />
          <MelegaCinematicPanel
            pulseRows={pulseRows.length ? pulseRows : undefined}
            liveEconomy={data.liveEconomyMetrics.length ? data.liveEconomyMetrics : undefined}
          />
        </HeroRow>
        {data.showMarket && (
          <MarketStripWrap>
            <QuickMarketStrip cards={data.marketCards} />
          </MarketStripWrap>
        )}
        <CtaWrap>
          <ListProjectCta />
        </CtaWrap>
        <GrowWrap>
          <GrowInsideMelegaPanel />
        </GrowWrap>
        <LowerRow $hasEarn={data.showEarn}>
          {data.showEarn && (
            <EarnOpportunities farmRows={data.farmRows} poolRows={data.poolRows} showNote={data.showEarnNote} />
          )}
          <MarketPulsePanel />
        </LowerRow>
        <LiveActivityFeed rows={data.activityRows} />
        <HomeTradeFooter />
      </Content>
    </Root>
  )
}

export default HomeTradeScreen
