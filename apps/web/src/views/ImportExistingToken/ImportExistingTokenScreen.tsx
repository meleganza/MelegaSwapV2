import React, { useState } from 'react'
import styled from 'styled-components'
import { PageMeta } from 'components/Layout/Page'
import TrendingRibbon from 'views/HomeTrade/TrendingRibbon'
import ImportExistingTokenGlobalStyle from './ImportExistingTokenGlobalStyle'
import { importTokenColors, importTokenLayout } from './importTokenTokens'
import AIDiscoveryPipeline from './components/AIDiscoveryPipeline'
import AIManifestSection from './components/AIManifestSection'
import AIReadinessScore from './components/AIReadinessScore'
import ContractInputHero from './components/ContractInputHero'
import ImportPageHeader from './components/ImportPageHeader'
import InfrastructureSuggestions from './components/InfrastructureSuggestions'
import OnboardingAdvisor from './components/OnboardingAdvisor'
import ProjectDetectedCard from './components/ProjectDetectedCard'
import RecentImportsTimeline from './components/RecentImportsTimeline'
import ServiceActivation from './components/ServiceActivation'

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
  display: flex;
  flex-direction: column;
  gap: ${importTokenLayout.sectionGap};

  @media (max-width: 768px) {
    padding: 20px;
  }
`

const MainGrid = styled.div`
  display: grid;
  grid-template-columns: ${importTokenLayout.colLeft} ${importTokenLayout.colRight};
  gap: ${importTokenLayout.cardGap};
  align-items: start;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr 1fr;
  }

  @media (max-width: 768px) {
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
  animation: fadeIn 400ms ease-out both;

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }
`

export const ImportExistingTokenScreen: React.FC = () => {
  const [analyzed, setAnalyzed] = useState(true)

  return (
    <Root data-import-existing-token-screen>
      <PageMeta />
      <ImportExistingTokenGlobalStyle />
      <TrendingRibbon />
      <Content>
        <ImportPageHeader />
        <MainGrid data-iet-main-grid>
          <LeftCol>
            <ContractInputHero analyzed={analyzed} onAnalyze={() => setAnalyzed(true)} />
            {analyzed ? (
              <AnalyzedBlock data-iet-analyzed>
                <AIDiscoveryPipeline />
                <ProjectDetectedCard />
                <AIReadinessScore />
                <InfrastructureSuggestions />
                <ServiceActivation />
                <AIManifestSection />
              </AnalyzedBlock>
            ) : null}
          </LeftCol>
          <RightCol>
            {analyzed ? <OnboardingAdvisor /> : null}
          </RightCol>
        </MainGrid>
        {analyzed ? <RecentImportsTimeline /> : null}
      </Content>
    </Root>
  )
}

export default ImportExistingTokenScreen
