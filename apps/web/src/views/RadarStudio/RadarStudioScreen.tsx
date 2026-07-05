import React from 'react'
import styled from 'styled-components'
import { PageMeta } from 'components/Layout/Page'
import RadarStudioGlobalStyle from './RadarStudioGlobalStyle'
import { RadarRuntimeProvider } from './radarRuntime/RadarRuntimeContext'
import RadarAiOpportunityPanel from './components/RadarAiOpportunityPanel'
import RadarDiscoveriesGrid from './components/RadarDiscoveriesGrid'
import RadarEventTimeline from './components/RadarEventTimeline'
import RadarFeaturedAnalysisPanel from './components/RadarFeaturedAnalysisPanel'
import RadarFilterRow from './components/RadarFilterRow'
import RadarMachineSummaryPanel from './components/RadarMachineSummaryPanel'
import RadarOperationalIntelligencePanel from './components/RadarOperationalIntelligencePanel'
import RadarStudioPageHeader from './components/RadarStudioPageHeader'
import { radarStudioColors, radarStudioLayout } from './radarStudioTokens'

const Root = styled.div`
  color: ${radarStudioColors.text};
  background: ${radarStudioColors.canvas};
  width: 100%;
  max-width: 100%;
  min-width: 0;
  overflow-x: hidden;
  box-sizing: border-box;
  padding-bottom: ${radarStudioLayout.mobileBottomPad};

  @media (min-width: 769px) {
    padding-bottom: 48px;
  }
`

const Content = styled.div`
  max-width: ${radarStudioLayout.contentMax};
  margin: 0 auto;
  padding: ${radarStudioLayout.contentPaddingTop} ${radarStudioLayout.contentPaddingX}
    ${radarStudioLayout.contentPaddingBottom};
  box-sizing: border-box;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: ${radarStudioLayout.sectionGap};
`

export const RadarStudioScreen: React.FC = () => (
  <RadarRuntimeProvider>
    <Root data-radar-studio-screen data-r112-canonical>
      <PageMeta />
      <RadarStudioGlobalStyle />
      <Content>
        <RadarStudioPageHeader />
        <RadarOperationalIntelligencePanel />
        <RadarFeaturedAnalysisPanel />
        <RadarAiOpportunityPanel />
        <RadarFilterRow />
        <RadarDiscoveriesGrid />
        <RadarEventTimeline />
        <RadarMachineSummaryPanel />
      </Content>
    </Root>
  </RadarRuntimeProvider>
)

export default RadarStudioScreen
