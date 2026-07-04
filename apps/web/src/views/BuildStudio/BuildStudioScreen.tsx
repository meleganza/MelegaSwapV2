import React from 'react'
import styled from 'styled-components'
import { PageMeta } from 'components/Layout/Page'
import TrendingRibbon from 'views/HomeTrade/TrendingRibbon'
import BuildStudioGlobalStyle from './BuildStudioGlobalStyle'
import { BuildRuntimeProvider } from './buildRuntime/BuildRuntimeContext'
import { buildStudioColors, buildStudioLayout } from './buildStudioTokens'
import AIBuildAdvisorPanel from './components/AIBuildAdvisorPanel'
import AIManifestPanel from './components/AIManifestPanel'
import BuildMachinePanel from './components/BuildMachinePanel'
import AIValidationEngine from './components/AIValidationEngine'
import BuildKpiRow from './components/BuildKpiRow'
import BuildStudioPageHeader from './components/BuildStudioPageHeader'
import CreateTokenPanel from './components/CreateTokenPanel'
import ImportTokenPanel from './components/ImportTokenPanel'
import InfrastructureFlow from './components/InfrastructureFlow'
import OptionalServices from './components/OptionalServices'
import RecentBuildsTable from './components/RecentBuildsTable'
import SecondRowCards from './components/SecondRowCards'
import TrustedInfrastructurePanel from './components/TrustedInfrastructurePanel'

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

const MainGrid = styled.div`
  display: grid;
  grid-template-columns: ${buildStudioLayout.colImport} ${buildStudioLayout.colCreate} ${buildStudioLayout.colRight};
  gap: ${buildStudioLayout.cardGap};
  width: 100%;
  align-items: stretch;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`

export const BuildStudioScreen: React.FC = () => (
  <BuildRuntimeProvider>
    <Root data-build-studio-screen>
      <PageMeta />
      <BuildStudioGlobalStyle />
      <TrendingRibbon />
      <Content>
        <BuildStudioPageHeader />
        <BuildKpiRow />
        <MainGrid data-bs-main-grid>
          <ImportTokenPanel />
          <CreateTokenPanel />
          <AIBuildAdvisorPanel />
        </MainGrid>
        <SecondRowCards />
        <AIValidationEngine />
        <InfrastructureFlow />
        <OptionalServices />
        <AIManifestPanel />
        <BuildMachinePanel />
        <TrustedInfrastructurePanel />
        <RecentBuildsTable />
      </Content>
    </Root>
  </BuildRuntimeProvider>
)

export default BuildStudioScreen
