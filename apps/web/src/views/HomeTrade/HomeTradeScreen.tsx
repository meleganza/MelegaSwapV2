import React from 'react'
import styled from 'styled-components'
import { PageMeta } from 'components/Layout/Page'
import HomeTradeGlobalStyle from './HomeTradeGlobalStyle'
import HomeSidebar from './HomeSidebar'
import HomeTopBar from './HomeTopBar'
import HomeMobileHeader from './HomeMobileHeader'
import TrendingRibbon from './TrendingRibbon'
import HomeSwapPanel from './HomeSwapPanel'
import CinematicEconomyPanel from './CinematicEconomyPanel'
import QuickMarketStrip from './QuickMarketStrip'
import ListProjectCta from './ListProjectCta'
import EarnOpportunities from './EarnOpportunities'
import LiveActivityFeed from './LiveActivityFeed'
import IntelligencePanel from './IntelligencePanel'
import MobileBottomNav from './MobileBottomNav'
import HomeTradeFooter from './HomeTradeFooter'
import useHomeTradeData from './useHomeTradeData'
import { ht } from './homeTradeTokens'

const Root = styled.div`
  min-height: 100vh;
  background: ${ht.canvas};
  color: ${ht.textMain};
  font-family: ${ht.fontBody};
  font-size: 14px;
  line-height: 1.45;
`

const Main = styled.main`
  margin-left: 0;
  padding: 14px;
  padding-bottom: calc(92px + env(safe-area-inset-bottom, 0px));

  @media (min-width: 1024px) {
    margin-left: ${ht.mainOffset};
    padding: 16px 26px 24px;
    max-width: calc(${ht.contentMax} + 52px);
  }
`

const Content = styled.div`
  max-width: ${ht.contentMax};
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 0;
`

const HeroRow = styled.div`
  display: grid;
  gap: 14px;
  margin-top: 12px;

  @media (min-width: 1024px) {
    grid-template-columns: ${ht.swapWidth} 1fr;
    height: ${ht.heroMaxHeight};
    max-height: ${ht.heroMaxHeight};
    margin-top: 12px;
  }
`

const SplitRow = styled.div`
  display: grid;
  gap: 14px;
  margin-top: 12px;

  @media (min-width: 1024px) {
    grid-template-columns: 52fr 48fr;
  }
`

const StackRow = styled.div`
  display: grid;
  gap: 14px;
  margin-top: 12px;

  @media (min-width: 1024px) {
    grid-template-columns: 52fr 48fr;
  }
`

export const HomeTradeScreen: React.FC = () => {
  const data = useHomeTradeData()

  return (
    <Root data-home-trade-screen="true">
      <PageMeta />
      <HomeTradeGlobalStyle />
      <HomeSidebar marcoPriceLabel={data.marcoPriceLabel} />
      <Main>
        <Content>
          <HomeTopBar />
          <HomeMobileHeader />
          {data.showRibbon && <TrendingRibbon items={data.ribbonItems} />}
          <HeroRow>
            <HomeSwapPanel />
            <CinematicEconomyPanel />
          </HeroRow>
          {data.showMarket && <QuickMarketStrip cards={data.marketCards} />}
          <SplitRow>
            <ListProjectCta />
            {data.showEarn && (
              <EarnOpportunities
                farmRows={data.farmRows}
                poolRows={data.poolRows}
                showNote={data.showEarnNote}
              />
            )}
          </SplitRow>
          <StackRow>
            <LiveActivityFeed rows={data.activityRows} />
            <IntelligencePanel />
          </StackRow>
          <HomeTradeFooter />
        </Content>
      </Main>
      <MobileBottomNav />
    </Root>
  )
}

export default HomeTradeScreen
