import React from 'react'
import styled from 'styled-components'
import { MelegaTicker } from 'design-system/melega'
import { PageMeta } from 'components/Layout/Page'
import CommandCenterGlobalStyle from './CommandCenterGlobalStyle'
import { commandCenterColors, commandCenterLayout } from './commandCenterTokens'
import AIDailyBriefing from './components/AIDailyBriefing'
import CommandBottomSection from './components/CommandBottomSection'
import CommandCenterPageHeader from './components/CommandCenterPageHeader'
import CommandKpiCluster from './components/CommandKpiCluster'
import CommandRightSidebar from './components/CommandRightSidebar'
import PositionColumns from './components/PositionColumns'
import SafeTrendingRibbon from './components/SafeTrendingRibbon'

const Root = styled.div`
  color: ${commandCenterColors.white};
  background: ${commandCenterColors.pageBg};
  padding: 0 0 32px;
  min-width: 0;
  overflow-x: hidden;

  @media (max-width: 768px) {
    padding: 0 0 ${commandCenterLayout.mobileBottomPad};
  }
`

const Content = styled.div`
  max-width: ${commandCenterLayout.contentMax};
  margin: 0 auto;
  padding: ${commandCenterLayout.contentPaddingTop} ${commandCenterLayout.contentPaddingX}
    ${commandCenterLayout.contentPaddingBottom};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: ${commandCenterLayout.sectionGap};
`

const TopRow = styled.div`
  display: grid;
  grid-template-columns: 1.35fr 1fr;
  gap: ${commandCenterLayout.sectionGap};
  align-items: start;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`

const MainRow = styled.div`
  display: grid;
  grid-template-columns: 1fr ${commandCenterLayout.colSidebar};
  gap: ${commandCenterLayout.sectionGap};
  align-items: start;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`

const MainCol = styled.div`
  min-width: 0;
`

export interface CommandCenterScreenProps {
  runtimeSafeMode?: boolean
}

export const CommandCenterScreen: React.FC<CommandCenterScreenProps> = ({ runtimeSafeMode = false }) => (
  <Root data-command-center-screen>
    <PageMeta />
    <CommandCenterGlobalStyle />
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
    <Content>
      <CommandCenterPageHeader />
      <TopRow data-cc-top-row>
        <AIDailyBriefing />
        <CommandKpiCluster />
      </TopRow>
      <MainRow data-cc-main-row>
        <MainCol>
          <PositionColumns />
        </MainCol>
        <CommandRightSidebar />
      </MainRow>
      <CommandBottomSection />
    </Content>
  </Root>
)

export default CommandCenterScreen
