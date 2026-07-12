import React from 'react'
import styled from 'styled-components'
import { PageMeta } from 'components/Layout/Page'
import TrendingRibbon from 'views/HomeTrade/TrendingRibbon'
import RadarStudioGlobalStyle from './RadarStudioGlobalStyle'
import { RadarRuntimeProvider, useRadarRuntime } from './radarRuntime/RadarRuntimeContext'
import RadarContractIntelligenceInput from './components/RadarContractIntelligenceInput'
import RadarDiscoveriesGrid from './components/RadarDiscoveriesGrid'
import RadarFilterRow from './components/RadarFilterRow'
import RadarHeatmapTable from './components/RadarHeatmapTable'
import RadarKpiRow from './components/RadarKpiRow'
import RadarLiveEventStream from './components/RadarLiveEventStream'
import RadarOpsLeftColumn from './components/RadarOpsLeftColumn'
import RadarOpsRightColumn from './components/RadarOpsRightColumn'
import RadarStudioPageHeader from './components/RadarStudioPageHeader'
import RadarComingSoonBanner from './components/RadarComingSoonBanner'
import { isDexIntelligencePublicReady } from 'lib/data-truth/dexIntelligenceDisposition'
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

  @media (max-width: 767px) {
    width: 100%;
    max-width: 100%;
    padding: 16px;
    box-sizing: border-box;
  }
`

const ConsoleGrid = styled.div<{ $collapsedLeft?: boolean }>`
  display: grid;
  grid-template-columns: ${({ $collapsedLeft }) =>
    $collapsedLeft
      ? `minmax(0, 1fr) ${radarStudioLayout.colRight}`
      : `${radarStudioLayout.colLeft} minmax(0, 1fr) ${radarStudioLayout.colRight}`};
  gap: ${radarStudioLayout.columnGap};
  align-items: stretch;

  @media (max-width: ${radarStudioLayout.stackBreakpoint}) {
    grid-template-columns: 1fr;
  }
`

const ComingSoonOnly = styled.div`
  max-width: ${radarStudioLayout.contentMax};
  margin: 0 auto;
  padding: 0 ${radarStudioLayout.contentPaddingX} 48px;
  box-sizing: border-box;
`

const RadarConsole: React.FC = () => {
  const { intelligenceFeedsAvailable } = useRadarRuntime()
  return (
    <ConsoleGrid data-rd-console-grid $collapsedLeft={!intelligenceFeedsAvailable}>
      <RadarOpsLeftColumn />
      <RadarDiscoveriesGrid />
      <RadarOpsRightColumn />
    </ConsoleGrid>
  )
}

const RadarIntelligenceBody: React.FC = () => {
  if (!isDexIntelligencePublicReady()) {
    return (
      <ComingSoonOnly>
        <RadarStudioPageHeader />
        <RadarComingSoonBanner />
      </ComingSoonOnly>
    )
  }

  return (
    <Content>
      <RadarStudioPageHeader />
      <RadarComingSoonBanner />
      <RadarKpiRow />
      <RadarContractIntelligenceInput />
      <RadarLiveEventStream />
      <RadarFilterRow />
      <RadarConsole />
      <RadarHeatmapTable />
    </Content>
  )
}

export const RadarStudioScreen: React.FC = () => (
  <RadarRuntimeProvider>
    <Root data-radar-studio-screen="true">
      <PageMeta />
      <RadarStudioGlobalStyle />
      <TrendingRibbon />
      <RadarIntelligenceBody />
    </Root>
  </RadarRuntimeProvider>
)

export default RadarStudioScreen
