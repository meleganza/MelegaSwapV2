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
import MobileBottomNav from './MobileBottomNav'
import HomeTradeFooter from './HomeTradeFooter'
import useHomeTradeData from './useHomeTradeData'
import { ht } from './homeTradeTokens'

const Root = styled.div`
  min-height: 100vh;
  background: ${ht.canvas};
  color: ${ht.textMain};
  font-family: ${ht.fontBody};
`

const Main = styled.main`
  margin-left: 0;
  padding: 16px 14px 96px;

  @media (min-width: 1024px) {
    margin-left: ${ht.sidebarWidth};
    padding: 20px 28px 32px;
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
  margin-bottom: 12px;

  @media (min-width: 1024px) {
    grid-template-columns: minmax(500px, 43%) 1fr;
    height: 350px;
  }
`

const EarnCtaRow = styled.div`
  display: grid;
  gap: 12px;

  @media (min-width: 1024px) {
    grid-template-columns: 1fr 1fr;
    align-items: start;
  }
`

const ActivityRow = styled.div`
  @media (min-width: 1024px) {
    display: grid;
    grid-template-columns: 1fr;
    gap: 12px;
  }
`

export const HomeTradeScreen: React.FC = () => {
  const data = useHomeTradeData()

  return (
    <Root>
      <PageMeta />
      <HomeTradeGlobalStyle />
      <HomeSidebar marcoPriceLabel={data.marcoPriceLabel} />
      <Main>
        <HomeTopBar />
        <Content>
          <HomeMobileHeader />
          {data.showRibbon && <TrendingRibbon items={data.ribbonItems} />}
          <HeroRow>
            <HomeSwapPanel />
            <CinematicEconomyPanel />
          </HeroRow>
          {data.showMarket && <QuickMarketStrip cards={data.marketCards} />}
          <EarnCtaRow>
            <ListProjectCta />
            {data.showEarn && (
              <EarnOpportunities
                farmRows={data.farmRows}
                poolRows={data.poolRows}
                showNote={data.showEarnNote}
              />
            )}
          </EarnCtaRow>
          <ActivityRow>
            <LiveActivityFeed rows={data.activityRows} />
          </ActivityRow>
          <HomeTradeFooter />
        </Content>
      </Main>
      <MobileBottomNav />
    </Root>
  )
}

export default HomeTradeScreen
