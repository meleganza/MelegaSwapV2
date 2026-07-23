import React from 'react'
import styled from 'styled-components'
import { PageMeta } from 'components/Layout/Page'
import AIDiscoveryPipeline from './components/AIDiscoveryPipeline'
import AIManifestSection from './components/AIManifestSection'
import AIReadinessScore from './components/AIReadinessScore'
import ContractInputHero from './components/ContractInputHero'
import ImportMachinePanel from './components/ImportMachinePanel'
import ImportPageHeader from './components/ImportPageHeader'
import InfrastructureSuggestions from './components/InfrastructureSuggestions'
import OnboardingAdvisor from './components/OnboardingAdvisor'
import PendingReviewCard from './components/PendingReviewCard'
import ProjectDetectedCard from './components/ProjectDetectedCard'
import ImportExistingTokenGlobalStyle from './ImportExistingTokenGlobalStyle'
import { ImportRuntimeProvider, useImportRuntime } from './importExistingTokenRuntime/ImportRuntimeContext'
import { importTokenColors, importTokenLayout } from './importTokenTokens'

const Root = styled.div`
  color: ${importTokenColors.white};
  background: ${importTokenColors.pageBg};
  padding: 0 0 32px;
  min-width: 0;
  overflow-x: hidden;

  @media (max-width: 768px) {
    padding: 0 0 ${importTokenLayout.mobileBottomPad};
  }
`

const Content = styled.div`
  max-width: ${importTokenLayout.contentMax};
  margin: 0 auto;
  padding: ${importTokenLayout.contentPaddingTop} ${importTokenLayout.contentPaddingX}
    ${importTokenLayout.contentPaddingBottom};
  box-sizing: border-box;
  min-width: 0;
`

const MainGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: ${importTokenLayout.sectionGap};
  align-items: start;

  @media (max-width: 1099px) {
    grid-template-columns: 1fr;
  }
`

const LeftCol = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${importTokenLayout.sectionGap};
  min-width: 0;
`

const RightCol = styled.div`
  min-width: 0;
`

const AnalyzedBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${importTokenLayout.sectionGap};
`

const ImportContent: React.FC = () => {
  const { analyzed } = useImportRuntime()

  return (
    <Root data-import-existing-token-screen data-r200-premium="true">
      <PageMeta />
      <ImportExistingTokenGlobalStyle />
      <Content>
        <ImportPageHeader />
        <MainGrid data-iet-main-grid>
          <LeftCol>
            <ContractInputHero />
            {analyzed ? (
              <AnalyzedBlock data-iet-analyzed>
                <AIDiscoveryPipeline />
                <ProjectDetectedCard />
                <PendingReviewCard />
                <AIReadinessScore />
                <InfrastructureSuggestions />
                <AIManifestSection />
                <ImportMachinePanel />
              </AnalyzedBlock>
            ) : null}
          </LeftCol>
          <RightCol>{analyzed ? <OnboardingAdvisor /> : null}</RightCol>
        </MainGrid>
      </Content>
    </Root>
  )
}

export const ImportExistingTokenScreen: React.FC = () => (
  <ImportRuntimeProvider>
    <ImportContent />
  </ImportRuntimeProvider>
)

export default ImportExistingTokenScreen
