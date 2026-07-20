import React from 'react'
import styled from 'styled-components'
import { PageMeta } from 'components/Layout/Page'
import CommandCenterGlobalStyle from './CommandCenterGlobalStyle'
import { commandCenterColors, commandCenterLayout } from './commandCenterTokens'
import { CommandRuntimeProvider, useCommandRuntime } from './commandCenterRuntime/CommandRuntimeContext'
import {
  CcSpecDailyBriefing,
  CcSpecHeader,
  CcSpecInfrastructureStatus,
  CcSpecMachineSummary,
  CcSpecNotifications,
  CcSpecPortfolioOverview,
  CcSpecRecentActivity,
  CcSpecSettlement,
  CcSpecTodaysPriorities,
} from './components/canonical/CommandCenterCanonicalSections'
import { MyPositionsSection } from './components/MyPositionsSection'

function CcSpecMyPositions() {
  const {
    myPositionsView,
    myPositionsGroups,
    myPositionsSummary,
    myPositionsState,
  } = useCommandRuntime()
  return (
    <MyPositionsSection
      myPositionsView={myPositionsView}
      myPositionsGroups={myPositionsGroups}
      myPositionsSummary={myPositionsSummary}
      myPositionsState={myPositionsState}
    />
  )
}

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
    padding-bottom: 48px;
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

  @media (max-width: ${commandCenterLayout.mobileBreakpoint}) {
    gap: ${commandCenterLayout.sectionGapMobile};
    padding-top: ${commandCenterLayout.contentPaddingTopMobile};
  }
`

export interface CommandCenterScreenProps {
  runtimeSafeMode?: boolean
}

export const CommandCenterScreen: React.FC<CommandCenterScreenProps> = () => (
  <CommandRuntimeProvider>
    <Root data-command-center-screen data-cc-r111a-canonical>
      <PageMeta />
      <CommandCenterGlobalStyle />
      <Shell>
        <CcSpecHeader />
        <CcSpecDailyBriefing />
        <CcSpecPortfolioOverview />
        <CcSpecMyPositions />
        <CcSpecTodaysPriorities />
        <CcSpecInfrastructureStatus />
        <CcSpecRecentActivity />
        <CcSpecNotifications />
        <CcSpecSettlement />
        <CcSpecMachineSummary />
      </Shell>
    </Root>
  </CommandRuntimeProvider>
)

export default CommandCenterScreen
