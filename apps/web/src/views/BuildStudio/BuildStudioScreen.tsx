import React from 'react'
import styled from 'styled-components'
import { PageMeta } from 'components/Layout/Page'
import TrendingRibbon from 'views/HomeTrade/TrendingRibbon'
import BuildStudioGlobalStyle from './BuildStudioGlobalStyle'
import { BuildRuntimeProvider } from './buildRuntime/BuildRuntimeContext'
import { buildStudioColors, buildStudioLayout } from './buildStudioTokens'
import { studioConstitutionLayout } from 'design-system/melega'
import { ImportRuntimeProvider } from 'views/ImportExistingToken/importExistingTokenRuntime/ImportRuntimeContext'
import AIBuildAdvisorPanel from './components/AIBuildAdvisorPanel'
import AIManifestPanel from './components/AIManifestPanel'
import BuildMachinePanel from './components/BuildMachinePanel'
import AIValidationEngine from './components/AIValidationEngine'
import BuildKpiRow from './components/BuildKpiRow'
import BuildStudioPageHeader from './components/BuildStudioPageHeader'
import ImportTokenPanel from './components/ImportTokenPanel'
import { CreateFarmCard, StakingPoolCard } from './components/SecondRowCards'
import CreateTokenPanel from './components/CreateTokenPanel'
import InfrastructureFlow from './components/InfrastructureFlow'
import OptionalServices from './components/OptionalServices'
import RecentBuildsTable from './components/RecentBuildsTable'
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

  @media (max-width: ${studioConstitutionLayout.mobileBreakpoint}) {
    padding: 16px 16px ${buildStudioLayout.mobileBottomPad};
  }
`

const MainGrid = styled.div`
  display: grid;
  gap: ${buildStudioLayout.cardGap};
  width: 100%;
  align-items: stretch;

  @media (min-width: 1280px) {
    grid-template-columns: repeat(12, minmax(0, 1fr));
    grid-template-areas:
      'import import import import import import import advisor advisor advisor advisor advisor'
      'create create create create farm farm farm pool pool pool pool pool';
  }

  @media (max-width: 1279px) and (min-width: 769px) {
    grid-template-columns: 1fr 1fr;
    grid-template-areas:
      'import import'
      'advisor advisor'
      'create farm'
      'pool pool';
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    grid-template-areas:
      'import'
      'advisor'
      'create'
      'farm'
      'pool';
  }
`

const ImportArea = styled.div`
  grid-area: import;
  min-width: 0;
`

const AdvisorArea = styled.div`
  grid-area: advisor;
  min-width: 0;
`

const CreateArea = styled.div`
  grid-area: create;
  min-width: 0;
`

const FarmArea = styled.div`
  grid-area: farm;
  min-width: 0;
`

const PoolArea = styled.div`
  grid-area: pool;
  min-width: 0;
`

export const BuildStudioScreen: React.FC = () => (
  <BuildRuntimeProvider>
    <Root data-build-studio-screen data-r200-premium="true">
      <PageMeta />
      <BuildStudioGlobalStyle />
      <TrendingRibbon />
      <Content>
        <BuildStudioPageHeader />
        <BuildKpiRow />
        <ImportRuntimeProvider>
          <MainGrid data-bs-main-grid>
            <ImportArea>
              <ImportTokenPanel />
            </ImportArea>
            <AdvisorArea>
              <AIBuildAdvisorPanel />
            </AdvisorArea>
            <CreateArea>
              <CreateTokenPanel />
            </CreateArea>
            <FarmArea>
              <CreateFarmCard />
            </FarmArea>
            <PoolArea>
              <StakingPoolCard />
            </PoolArea>
          </MainGrid>
        </ImportRuntimeProvider>
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
