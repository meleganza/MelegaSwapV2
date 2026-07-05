import React from 'react'
import styled from 'styled-components'
import ContractInputHero from 'views/ImportExistingToken/components/ContractInputHero'
import AIDiscoveryPipeline from 'views/ImportExistingToken/components/AIDiscoveryPipeline'
import AIManifestSection from 'views/ImportExistingToken/components/AIManifestSection'
import AIReadinessScore from 'views/ImportExistingToken/components/AIReadinessScore'
import ImportMachinePanel from 'views/ImportExistingToken/components/ImportMachinePanel'
import InfrastructureSuggestions from 'views/ImportExistingToken/components/InfrastructureSuggestions'
import OnboardingAdvisor from 'views/ImportExistingToken/components/OnboardingAdvisor'
import PendingReviewCard from 'views/ImportExistingToken/components/PendingReviewCard'
import ProjectDetectedCard from 'views/ImportExistingToken/components/ProjectDetectedCard'
import ImportExistingTokenGlobalStyle from 'views/ImportExistingToken/ImportExistingTokenGlobalStyle'
import { useImportRuntime } from 'views/ImportExistingToken/importExistingTokenRuntime/ImportRuntimeContext'
import { importTokenLayout } from 'views/ImportExistingToken/importTokenTokens'
import { buildStudioColors, buildStudioLayout } from '../buildStudioTokens'
import { BsLabel } from './buildStudioPrimitives'

const Shell = styled.section`
  display: flex;
  flex-direction: column;
  gap: ${buildStudioLayout.sectionGap};
  width: 100%;
  min-width: 0;
`

const WorkflowGrid = styled.div`
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

const AnalyzedBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${importTokenLayout.sectionGap};
`

const Intro = styled.p`
  margin: 0;
  font-size: 14px;
  line-height: 22px;
  color: ${buildStudioColors.muted};
  max-width: 760px;
`

/** Constitutional infrastructure entry — import workflow lives inside Build Studio. */
export const BuildStudioImportWorkflow: React.FC = () => {
  const { analyzed } = useImportRuntime()

  return (
    <Shell data-bs-import-workflow id="build-import">
      <ImportExistingTokenGlobalStyle />
      <BsLabel style={{ display: 'block', marginBottom: 8 }}>Step 1 — Import Existing Token</BsLabel>
      <Intro>
        Paste a contract to start. Analysis flows through registry verification, infrastructure proposal, and future
        create-token / farm / pool actions — one starting point for all build infrastructure.
      </Intro>
      <WorkflowGrid data-bs-import-grid>
        <LeftCol>
          <ContractInputHero embedded />
          {analyzed ? (
            <AnalyzedBlock data-bs-import-analyzed>
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
        {analyzed ? <OnboardingAdvisor /> : null}
      </WorkflowGrid>
    </Shell>
  )
}

export default BuildStudioImportWorkflow
