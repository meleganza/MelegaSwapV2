import React from 'react'
import styled from 'styled-components'
import { PageMeta } from 'components/Layout/Page'
import { typography } from 'design-system/melega'
import TrendingRibbon from 'views/HomeTrade/TrendingRibbon'
import PoolsStudioGlobalStyle from './PoolsStudioGlobalStyle'
import { PoolsRuntimeProvider } from './poolsRuntime/PoolsRuntimeContext'
import PoolsActionHost from './poolsRuntime/PoolsActionHost'
import PoolsStudioPageHeader from './components/PoolsStudioPageHeader'
import PoolsKpiRow from './components/PoolsKpiRow'
import FeaturedPoolHero from './components/FeaturedPoolHero'
import PoolsSidebar from './components/PoolsSidebar'
import PoolsViewToolbar from './components/PoolsViewToolbar'
import PoolsGrid from './components/PoolsGrid'
import CreatePoolCta from './components/CreatePoolCta'
import PoolsBelowFold from './components/PoolsBelowFold'
import { poolsStudioColors, poolsStudioLayout } from './poolsStudioTokens'
import { isPoolsUxFixtureEnabled } from './poolsRuntime/poolsUxFixture'

const Root = styled.div`
  color: ${poolsStudioColors.text};
  font-family: ${typography.fontFamily.body};
  background: ${poolsStudioColors.canvas};
  padding: 0 0 32px;
  min-width: 0;
  overflow-x: hidden;
  width: 100%;

  @media (max-width: 767px) {
    padding: 0 0 ${poolsStudioLayout.mobileBottomPad};
  }
`

const Content = styled.div`
  max-width: 1240px;
  margin: 0 auto;
  padding: 64px 40px ${poolsStudioLayout.contentPaddingBottom};
  box-sizing: border-box;
  min-width: 0;
  overflow-x: hidden;

  @media (max-width: 767px) {
    padding: ${poolsStudioLayout.mobileContentPaddingTop} ${poolsStudioLayout.contentPaddingMobile}
      ${poolsStudioLayout.mobileBottomPad};
  }
`

const KpiSection = styled.div`
  margin-top: 0;
`

const MainGrid = styled.div`
  margin-top: 28px;
  display: grid;
  grid-template-columns: minmax(0, 820px) 340px;
  grid-template-rows: auto auto;
  column-gap: 24px;
  row-gap: 0;
  align-items: start;
  min-width: 0;

  @media (max-width: 1099px) {
    grid-template-columns: 1fr;
  }

  @media (max-width: 767px) {
    display: flex;
    flex-direction: column;
  }
`

const MainColumn = styled.div`
  min-width: 0;
  width: 100%;
  max-width: 820px;
  grid-column: 1;
  grid-row: 1;

  @media (max-width: 767px) {
    order: 1;
  }
`

const SidebarColumn = styled.div`
  grid-column: 2;
  grid-row: 1 / span 2;
  min-width: 0;

  @media (max-width: 1099px) {
    grid-column: 1;
    grid-row: auto;
  }

  @media (max-width: 767px) {
    order: 2;
    margin-top: 20px;
  }
`

const ExplorerSection = styled.section`
  grid-column: 1;
  grid-row: 2;
  margin-top: 48px;
  min-width: 0;
  width: 100%;
  max-width: ${poolsStudioLayout.explorerMaxWidth};

  @media (max-width: 1099px) {
    grid-column: 1;
    margin-top: 32px;
  }

  @media (max-width: 767px) {
    order: 3;
    margin-top: 28px;
  }
`

const CreatePoolSection = styled.div`
  grid-column: 1;
  grid-row: 3;
  margin-top: 48px;
  min-width: 0;
  width: 100%;
  max-width: ${poolsStudioLayout.explorerMaxWidth};

  @media (max-width: 1099px) {
    grid-column: 1;
  }

  @media (max-width: 767px) {
    order: 4;
    margin-top: 32px;
    width: calc(100vw - 32px);
    max-width: calc(100vw - 32px);
    margin-left: calc(50% - 50vw + 16px);
    margin-right: calc(50% - 50vw + 16px);
    box-sizing: border-box;
  }
`

const BelowFold = styled.div`
  margin-top: 48px;
  display: flex;
  flex-direction: column;
  gap: ${poolsStudioLayout.gapBuilderBottom};
  min-width: 0;

  @media (max-width: 767px) {
    margin-top: 32px;
  }
`

export const PoolsStudioScreen: React.FC = () => (
  <Root
    data-pools-studio-screen="true"
    data-r706b-step2b="true"
    data-r711-pools-screen
    data-r712-pools-screen
    data-r713-pools-screen
    data-r715-pools-screen
    data-r716-pools-screen
    data-pools-ux-fixture={isPoolsUxFixtureEnabled() ? 'true' : undefined}
  >
    <PageMeta />
    <PoolsStudioGlobalStyle />
    <TrendingRibbon />
    <PoolsRuntimeProvider>
      <PoolsActionHost />
      <Content data-ps-content>
        <PoolsStudioPageHeader />
        <KpiSection>
          <PoolsKpiRow />
        </KpiSection>
        <MainGrid data-ps-main-grid>
          <MainColumn>
            <FeaturedPoolHero />
          </MainColumn>
          <SidebarColumn>
            <PoolsSidebar />
          </SidebarColumn>
          <ExplorerSection data-ps-pool-explorer data-r708-explorer>
            <PoolsViewToolbar />
            <PoolsGrid />
          </ExplorerSection>
          <CreatePoolSection data-ps-create-pool-section>
            <CreatePoolCta />
          </CreatePoolSection>
        </MainGrid>
        <BelowFold data-ps-below-fold>
          <PoolsBelowFold />
        </BelowFold>
      </Content>
    </PoolsRuntimeProvider>
  </Root>
)

export default PoolsStudioScreen
