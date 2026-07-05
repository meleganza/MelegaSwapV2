import React from 'react'
import styled from 'styled-components'
import { PageMeta } from 'components/Layout/Page'
import TrendingRibbon from 'views/HomeTrade/TrendingRibbon'
import BuildStudioGlobalStyle from './BuildStudioGlobalStyle'
import { BuildRuntimeProvider } from './buildRuntime/BuildRuntimeContext'
import { buildStudioColors, buildStudioLayout } from './buildStudioTokens'
import { ImportRuntimeProvider } from 'views/ImportExistingToken/importExistingTokenRuntime/ImportRuntimeContext'
import BuildMachinePanel from './components/BuildMachinePanel'
import BuildStudioPageHeader from './components/BuildStudioPageHeader'
import BuildStudioImportWorkflow from './components/BuildStudioImportWorkflow'
import FutureProductionModules from './components/FutureProductionModules'
import InfrastructureFlow from './components/InfrastructureFlow'

const Root = styled.div`
  color: ${buildStudioColors.white};
  background: ${buildStudioColors.pageBg};
  padding: 0 0 32px;
  min-width: 0;
  overflow-x: hidden;

  @media (max-width: 768px) {
    padding: 0 0 ${buildStudioLayout.mobileBottomPad};
  }
`

const Content = styled.div`
  max-width: ${buildStudioLayout.contentMax};
  margin: 0 auto;
  padding: ${buildStudioLayout.contentPaddingTop} ${buildStudioLayout.contentPaddingX}
    ${buildStudioLayout.contentPaddingBottom};
  box-sizing: border-box;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: ${buildStudioLayout.sectionGap};

  @media (max-width: 768px) {
    padding: 20px;
    gap: 12px;
  }
`

export const BuildStudioScreen: React.FC = () => (
  <BuildRuntimeProvider>
    <Root data-build-studio-screen data-r200-premium="true">
      <PageMeta />
      <BuildStudioGlobalStyle />
      <TrendingRibbon />
      <Content>
        <BuildStudioPageHeader />
        <ImportRuntimeProvider>
          <BuildStudioImportWorkflow />
        </ImportRuntimeProvider>
        <InfrastructureFlow />
        <FutureProductionModules />
        <BuildMachinePanel />
      </Content>
    </Root>
  </BuildRuntimeProvider>
)

export default BuildStudioScreen
