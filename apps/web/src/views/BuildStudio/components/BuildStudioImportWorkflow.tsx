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
  gap: 12px;
  width: 100%;
  min-width: 0;
  height: 100%;
  box-sizing: border-box;
`

const WorkflowGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${importTokenLayout.sectionGap};
  align-items: stretch;
  flex: 1;
  min-height: 0;
`

const AnalyzedBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 280px;
  overflow-y: auto;
`

const Intro = styled.p`
  margin: 0;
  font-size: 13px;
  line-height: 20px;
  color: ${buildStudioColors.muted};
`

/** Constitutional infrastructure entry — import workflow lives inside Build Studio. */
export const BuildStudioImportWorkflow: React.FC = () => {
  const { analyzed } = useImportRuntime()

  return (
    <Shell data-bs-import-workflow id="build-import">
      <ImportExistingTokenGlobalStyle />
      <BsLabel style={{ display: 'block' }}>Import Existing Token</BsLabel>
      <Intro>Paste a contract to analyze registry fit, infrastructure, and pending review.</Intro>
      <WorkflowGrid data-bs-import-grid>
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
            <OnboardingAdvisor />
          </AnalyzedBlock>
        ) : null}
      </WorkflowGrid>
    </Shell>
  )
}

export default BuildStudioImportWorkflow
