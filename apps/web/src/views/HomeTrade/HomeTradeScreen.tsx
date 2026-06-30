import React from 'react'
import styled from 'styled-components'
import { PageMeta } from 'components/Layout/Page'
import { colors, typography, spacing, MelegaCinematicPanel } from 'design-system/melega'
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
`

const HeroRow = styled.div`
  display: grid;
  gap: ${homeTradeLayout.gridGutter};
  margin-top: ${spacing[3]};

  @media (min-width: 768px) {
    grid-template-columns: ${homeTradeLayout.swapWidth} 1fr;
    height: ${homeTradeLayout.heroMaxHeight};
    max-height: ${homeTradeLayout.heroMaxHeight};
  }
`

const SplitRow = styled.div`
  display: grid;
  gap: ${homeTradeLayout.gridGutter};
  margin-top: ${spacing[3]};

  @media (min-width: 768px) {
    grid-template-columns: 52fr 48fr;
  }
`

const StackRow = styled.div`
  display: grid;
  gap: ${homeTradeLayout.gridGutter};
  margin-top: ${spacing[3]};

  @media (min-width: 768px) {
    grid-template-columns: 52fr 48fr;
  }
`

export const HomeTradeScreen: React.FC = () => {
  const data = useHomeTradeData()

  return (
    <Root data-home-trade-screen="true">
      <PageMeta />
      <HomeTradeGlobalStyle />
      <Content>
        {data.showRibbon && <TrendingRibbon items={data.ribbonItems} />}
        <HeroRow>
          <HomeSwapPanel />
          <MelegaCinematicPanel />
        </HeroRow>
        {data.showMarket && <QuickMarketStrip cards={data.marketCards} />}
        <SplitRow>
          <ListProjectCta />
          {data.showEarn && (
            <EarnOpportunities farmRows={data.farmRows} poolRows={data.poolRows} showNote={data.showEarnNote} />
          )}
        </SplitRow>
        <StackRow>
          <LiveActivityFeed rows={data.activityRows} />
          <IntelligencePanel />
        </StackRow>
        <HomeTradeFooter />
      </Content>
    </Root>
  )
}

export default HomeTradeScreen
