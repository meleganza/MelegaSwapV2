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
  padding: 12px;
  padding-bottom: calc(88px + env(safe-area-inset-bottom, 0px));

  @media (min-width: 1024px) {
    margin-left: ${ht.sidebarWidth};
    padding: 14px 24px 24px;
  }
`

const Content = styled.div`
  max-width: ${ht.contentMax};
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: ${ht.gridGutter};
  align-content: start;
`

const FullSpan = styled.div`
  grid-column: 1 / -1;
`

const HeroRow = styled(FullSpan)`
  display: grid;
  gap: ${ht.gridGutter};
  max-height: ${ht.heroMaxHeight};

  @media (min-width: 1024px) {
    grid-template-columns: 45fr 55fr;
    height: ${ht.heroMaxHeight};
    max-height: ${ht.heroMaxHeight};
  }
`

const TwoCol = styled(FullSpan)`
  display: grid;
  gap: ${ht.gridGutter};

  @media (min-width: 1024px) {
    grid-template-columns: 1fr 1fr;
  }
`

const ActivityRow = styled(TwoCol)``

export const HomeTradeScreen: React.FC = () => {
  const data = useHomeTradeData()

  return (
    <Root data-home-trade-screen="true">
      <PageMeta />
      <HomeTradeGlobalStyle />
      <HomeSidebar marcoPriceLabel={data.marcoPriceLabel} />
      <Main>
        <HomeTopBar />
        <Content>
          <FullSpan>
            <HomeMobileHeader />
          </FullSpan>
          {data.showRibbon && (
            <FullSpan>
              <TrendingRibbon items={data.ribbonItems} />
            </FullSpan>
          )}
          <HeroRow>
            <HomeSwapPanel />
            <CinematicEconomyPanel />
          </HeroRow>
          {data.showMarket && (
            <FullSpan>
              <QuickMarketStrip cards={data.marketCards} />
            </FullSpan>
          )}
          <TwoCol>
            <ListProjectCta />
            {data.showEarn && (
              <EarnOpportunities
                farmRows={data.farmRows}
                poolRows={data.poolRows}
                showNote={data.showEarnNote}
              />
            )}
          </TwoCol>
          <ActivityRow>
            <LiveActivityFeed rows={data.activityRows} />
            <IntelligencePanel />
          </ActivityRow>
          <FullSpan>
            <HomeTradeFooter />
          </FullSpan>
        </Content>
      </Main>
      <MobileBottomNav />
    </Root>
  )
}

export default HomeTradeScreen
