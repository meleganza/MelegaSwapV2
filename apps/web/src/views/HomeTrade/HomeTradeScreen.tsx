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
import IntelligencePanel from './IntelligencePanel'
import HomeTradeFooter from './HomeTradeFooter'
import useHomeTradeData from './useHomeTradeData'
import { homeTradeLayout } from './homeTradeTokens'

const Root = styled.div`
  color: ${colors.textPrimary};
  font-family: ${typography.fontFamily.body};
  font-size: ${typography.fontSize.base};
  line-height: ${typography.lineHeight.normal};
`

const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
  max-width: ${homeTradeLayout.contentMax};
  margin: 0 auto;
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

const LowerRow = styled.div`
  display: grid;
  gap: ${homeTradeLayout.gridGutter};
  margin-top: ${homeTradeLayout.gridGutter};

  @media (min-width: 768px) {
    grid-template-columns: 1.15fr 1fr;
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
        {data.showRibbon && <TrendingRibbon items={data.ribbonItems} />}
        <HeroRow>
          <HomeSwapPanel />
          <MelegaCinematicPanel pulseRows={pulseRows.length ? pulseRows : undefined} />
        </HeroRow>
        {data.showMarket && <QuickMarketStrip cards={data.marketCards} />}
        <LowerRow>
          <ListProjectCta />
          {data.showEarn && (
            <EarnOpportunities farmRows={data.farmRows} poolRows={data.poolRows} showNote={data.showEarnNote} />
          )}
        </LowerRow>
        <LowerRow>
          <LiveActivityFeed rows={data.activityRows} />
          <IntelligencePanel />
        </LowerRow>
        <HomeTradeFooter />
      </Content>
    </Root>
  )
}

export default HomeTradeScreen
