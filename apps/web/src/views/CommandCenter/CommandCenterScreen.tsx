import React from 'react'
import styled from 'styled-components'
import { MelegaTicker } from 'design-system/melega'
import { PageMeta } from 'components/Layout/Page'
import CommandCenterGlobalStyle from './CommandCenterGlobalStyle'
import { commandCenterColors, commandCenterLayout } from './commandCenterTokens'
import AIDailyBriefing from './components/AIDailyBriefing'
import CommandCenterPageHeader from './components/CommandCenterPageHeader'
import CommandKpiCluster from './components/CommandKpiCluster'
import CommandQuickActions from './components/CommandQuickActions'
import CommandRightSidebar from './components/CommandRightSidebar'
import {
  CommandAssetsCard,
  CommandCollectiblesCard,
  CommandFarmsCard,
  CommandInfrastructureCard,
  CommandLiquidityCard,
  CommandPoolsCard,
  CommandRecentActivityCard,
} from './components/CommandDashboardCards'
import MachineSummaryCard from './components/MachineSummaryCard'
import { CcColStack } from './components/commandCenterPrimitives'
import SafeTrendingRibbon from './components/SafeTrendingRibbon'

const Root = styled.div`
  color: ${commandCenterColors.white};
  background: ${commandCenterColors.pageBg};
  min-width: 0;
  overflow-x: hidden;
  padding-bottom: ${commandCenterLayout.mobileBottomPad};

  @media (min-width: 769px) {
    padding-bottom: 32px;
  }
`

const Shell = styled.div`
  max-width: ${commandCenterLayout.contentMax};
  margin: 0 auto;
  padding: ${commandCenterLayout.contentPaddingTop} ${commandCenterLayout.contentPaddingX}
    ${commandCenterLayout.contentPaddingBottom};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: ${commandCenterLayout.sectionGap};
`

const HeroRow = styled.div`
  display: grid;
  grid-template-columns: 7fr 5fr;
  gap: ${commandCenterLayout.sectionGap};
  align-items: stretch;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`

const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: ${commandCenterLayout.colLeft} ${commandCenterLayout.colCenter} ${commandCenterLayout.colRight};
  gap: ${commandCenterLayout.sectionGap};
  align-items: start;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`

const MobileRecs = styled.div`
  display: none;

  @media (max-width: 1024px) {
    display: flex;
    flex-direction: column;
    gap: ${commandCenterLayout.sectionGap};
  }
`

const RightCol = styled(CcColStack)`
  @media (max-width: 1024px) {
    display: none;
  }
`

const KiriFooter = styled.div`
  text-align: center;
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  color: ${commandCenterColors.muted};
  padding-top: 4px;
`

export interface CommandCenterScreenProps {
  runtimeSafeMode?: boolean
}

export const CommandCenterScreen: React.FC<CommandCenterScreenProps> = ({ runtimeSafeMode = false }) => (
  <Root data-command-center-screen>
    <PageMeta />
    <CommandCenterGlobalStyle />
    <Shell>
      <CommandCenterPageHeader />
      {runtimeSafeMode ? (
        <MelegaTicker
          label="TRENDING ON MELEGA DEX"
          items={[]}
          emptyPrimary="Command Center ready"
          emptySecondary="Operational overview loaded with safe fallback data"
        />
      ) : (
        <SafeTrendingRibbon />
      )}

      <HeroRow data-cc-hero-row>
        <AIDailyBriefing />
        <CommandKpiCluster />
      </HeroRow>

      <MobileRecs data-cc-mobile-recs>
        <CommandRightSidebar />
        <CommandQuickActions />
      </MobileRecs>

      <DashboardGrid data-cc-dashboard-grid>
        <CcColStack>
          <CommandAssetsCard />
          <CommandCollectiblesCard />
          <CommandInfrastructureCard />
        </CcColStack>

        <CcColStack>
          <CommandLiquidityCard />
          <CommandPoolsCard />
          <CommandFarmsCard />
        </CcColStack>

        <RightCol>
          <CommandRightSidebar />
          <CommandQuickActions />
        </RightCol>
      </DashboardGrid>

      <CommandRecentActivityCard />
      <MachineSummaryCard />

      <KiriFooter data-cc-kiri-footer>
        ⚠ KIRI is observing. KIRI is learning. KIRI is building the Civilization.
      </KiriFooter>
    </Shell>
  </Root>
)

export default CommandCenterScreen
