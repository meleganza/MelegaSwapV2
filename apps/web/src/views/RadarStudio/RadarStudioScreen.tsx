import React from 'react'
import styled from 'styled-components'
import { PageMeta } from 'components/Layout/Page'
import TrendingRibbon from 'views/HomeTrade/TrendingRibbon'
import RadarStudioGlobalStyle from './RadarStudioGlobalStyle'
import RadarContractIntelligenceInput from './components/RadarContractIntelligenceInput'
import RadarDiscoveriesGrid from './components/RadarDiscoveriesGrid'
import RadarFilterRow from './components/RadarFilterRow'
import RadarHeatmapTable from './components/RadarHeatmapTable'
import RadarKpiRow from './components/RadarKpiRow'
import RadarLiveEventStream from './components/RadarLiveEventStream'
import RadarOpsLeftColumn from './components/RadarOpsLeftColumn'
import RadarOpsRightColumn from './components/RadarOpsRightColumn'
import RadarStudioPageHeader from './components/RadarStudioPageHeader'
import { RADAR_FONT_BODY, radarStudioColors, radarStudioLayout } from './radarStudioTokens'

const Root = styled.div`
  color: ${radarStudioColors.white};
  font-family: ${RADAR_FONT_BODY};
  background: ${radarStudioColors.pageBg};
  padding: 0 0 32px;
  min-width: 0;
  overflow-x: hidden;

  @media (max-width: 767px) {
    padding: 0 0 ${radarStudioLayout.mobileBottomPad};
  }
`

const Content = styled.div`
  max-width: ${radarStudioLayout.contentMax};
  margin: 0 auto;
  padding: ${radarStudioLayout.contentPaddingTop} ${radarStudioLayout.contentPaddingX}
    ${radarStudioLayout.contentPaddingBottom};
  box-sizing: border-box;
  min-width: 0;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  gap: ${radarStudioLayout.sectionGap};
  background: ${radarStudioColors.contentBg};
  border-radius: 0;

  @media (max-width: 767px) {
    width: calc(100vw - 32px);
    padding: 16px;
  }
`

const ConsoleGrid = styled.div`
  display: grid;
  grid-template-columns: ${radarStudioLayout.colLeft} minmax(0, 1fr) ${radarStudioLayout.colRight};
  gap: ${radarStudioLayout.columnGap};
  align-items: start;
  margin-top: ${radarStudioLayout.consoleMarginTop};

  @media (max-width: ${radarStudioLayout.stackBreakpoint}) {
    grid-template-columns: 1fr;
  }
`

export const RadarStudioScreen: React.FC = () => (
  <Root data-radar-studio-screen="true">
    <PageMeta />
    <RadarStudioGlobalStyle />
    <TrendingRibbon />
    <Content>
      <RadarStudioPageHeader />
      <RadarKpiRow />
      <RadarContractIntelligenceInput />
      <RadarLiveEventStream />
      <RadarFilterRow />
      <ConsoleGrid data-rd-console-grid>
        <RadarOpsLeftColumn />
        <RadarDiscoveriesGrid />
        <RadarOpsRightColumn />
      </ConsoleGrid>
      <RadarHeatmapTable />
    </Content>
  </Root>
)

export default RadarStudioScreen
