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
    const swap = data.ribbonItems.find((i) => i.icon === 'swap')
    const farm = data.ribbonItems.find((i) => i.icon === 'pool')
    const pool = data.marketCards.find((c) => c.id === 'top-pool')
    const project = data.ribbonItems.find((i) => i.icon === 'project')

    if (swap) rows.push({ id: 'swap', label: 'Latest swap', value: swap.subtitle || swap.meta })
    if (farm) rows.push({ id: 'farm', label: 'Top farm', value: farm.meta || farm.subtitle })
    if (pool) rows.push({ id: 'pool', label: 'New pool', value: pool.meta || pool.value })
    if (project) rows.push({ id: 'project', label: 'Project listed', value: project.title })

    return rows.slice(0, 4)
  }, [data.ribbonItems, data.marketCards])

  return (
    <Root data-home-trade-screen="true">
      <PageMeta />
      <HomeTradeGlobalStyle />
      <Content>
        <TrendingRibbon items={data.ribbonItems} />
        <HeroRow>
          <HomeSwapPanel />
          <MelegaCinematicPanel pulseRows={pulseRows.length ? pulseRows : undefined} />
        </HeroRow>
        {data.showMarket && <QuickMarketStrip cards={data.marketCards} />}
        <ListProjectCta />
        <GrowInsideMelegaPanel />
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
