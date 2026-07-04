import React from 'react'
import styled from 'styled-components'
import { MelegaTicker } from 'design-system/melega'
import { PageMeta } from 'components/Layout/Page'
import CommandCenterGlobalStyle from './CommandCenterGlobalStyle'
import { commandCenterColors, commandCenterLayout } from './commandCenterTokens'
import { CommandRuntimeProvider } from './commandCenterRuntime/CommandRuntimeContext'
import AIDailyBriefing from './components/AIDailyBriefing'
import CommandCenterPageHeader from './components/CommandCenterPageHeader'
import CommandKpiCluster from './components/CommandKpiCluster'
import CommandQuickActions from './components/CommandQuickActions'
import CommandRightSidebar from './components/CommandRightSidebar'
import {
  CommandAssetsCard,
  CommandBuilderStatusCard,
  CommandCollectiblesCard,
  CommandFarmsCard,
  CommandInfrastructureCard,
  CommandLiquidityCard,
  CommandPoolsCard,
  CommandRecentActivityCard,
  CommandSettlementCard,
} from './components/CommandDashboardCards'
import MachineSummaryCard from './components/MachineSummaryCard'
import { CcColStack } from './components/commandCenterPrimitives'
import SafeTrendingRibbon from './components/SafeTrendingRibbon'

const Root = styled.div`
  color: ${commandCenterColors.white};
  background: ${commandCenterColors.pageBg};
  width: 100%;
  max-width: 100%;
  min-width: 0;
  overflow-x: hidden;
  box-sizing: border-box;
  padding-bottom: ${commandCenterLayout.mobileBottomPad};

  @media (min-width: 769px) {
    padding-bottom: 32px;
  }
`

const Shell = styled.div`
  width: 100%;
  max-width: ${commandCenterLayout.contentMax};
  margin: 0 auto;
  padding: ${commandCenterLayout.contentPaddingTop} ${commandCenterLayout.contentPaddingX}
    ${commandCenterLayout.contentPaddingBottom};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: ${commandCenterLayout.sectionGap};
  min-width: 0;
`

const HeroRow = styled.div`
  display: grid;
  grid-template-columns: 7fr 5fr;
  gap: ${commandCenterLayout.sectionGap};
  align-items: stretch;
  min-width: 0;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`

const MainGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, ${commandCenterLayout.mainLeft}) minmax(0, ${commandCenterLayout.mainRight});
  gap: ${commandCenterLayout.sectionGap};
  align-items: start;
  min-width: 0;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`

const PositionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: ${commandCenterLayout.sectionGap};
  min-width: 0;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`

const MetaGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: ${commandCenterLayout.sectionGap};
  min-width: 0;
  align-items: stretch;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`

const MobileRail = styled.div`
  display: none;

  @media (max-width: 1024px) {
    display: flex;
    flex-direction: column;
    gap: ${commandCenterLayout.sectionGap};
    min-width: 0;
  }
`

const DesktopRail = styled(CcColStack)`
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
  <CommandRuntimeProvider>
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

      <MobileRail data-cc-mobile-rail>
        <CommandRightSidebar />
        <CommandQuickActions />
      </MobileRail>

      <MainGrid data-cc-main-grid>
        <CcColStack>
          <PositionsGrid data-cc-positions-grid>
            <CommandAssetsCard />
            <CommandLiquidityCard />
            <CommandPoolsCard />
            <CommandFarmsCard />
          </PositionsGrid>

          <MetaGrid data-cc-meta-grid>
            <CommandSettlementCard />
            <CommandCollectiblesCard />
            <CommandInfrastructureCard />
            <CommandBuilderStatusCard />
          </MetaGrid>

          <CommandRecentActivityCard />
          <MachineSummaryCard />
        </CcColStack>

        <DesktopRail data-cc-right-rail>
          <CommandRightSidebar />
          <CommandQuickActions />
        </DesktopRail>
      </MainGrid>

      <KiriFooter data-cc-kiri-footer>
        ⚠ KIRI is observing. KIRI is learning. KIRI is building the Civilization.
      </KiriFooter>
    </Shell>
  </Root>
  </CommandRuntimeProvider>
)

export default CommandCenterScreen
