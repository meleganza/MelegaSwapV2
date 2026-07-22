import React from 'react'
import dynamic from 'next/dynamic'
import type { CanonicalProjectDocument } from 'registry/projects/identity/types'
import type { ProjectEvidencePack } from 'registry/projects/identity/evidence/types'
import type { ProjectReadinessDocument } from 'registry/projects/identity/readiness/types'
import type { ProjectMarketsDocument } from 'registry/projects/identity/markets'
import type { ProjectParticipationDocument } from 'registry/projects/identity/participation'
import type { ProjectLiquidityBuildingDocument } from 'registry/projects/identity/liquidityBuilding'
import type { ProjectUpdatesDocument } from 'registry/projects/identity/updates'
import type { ProjectEcosystemDocument } from 'registry/projects/identity/ecosystem'
import type { ProjectDeveloperDocument } from 'registry/projects/identity/developer'
import type { ProjectGovernanceDocument } from 'registry/projects/identity/governance'
import type { ProjectGrowthDocument } from 'registry/projects/identity/growth'
import type { ProjectMachineDocument } from 'registry/projects/identity/machine'
import type { ProjectTokenomicsDocument } from 'registry/projects/identity/tokenomics/schema'
import type { ProjectRoadmapDocument } from 'registry/projects/identity/roadmap/schema'
import ProjectStickyNav from './ProjectStickyNav'
import ProjectHero from './ProjectHero'
import ProjectChartPanel from './ProjectChartPanel'
import ProjectSwapCard from './ProjectSwapCard'
import ProjectAbout from './ProjectAbout'
import ProjectTokenomicsSection from './ProjectTokenomicsSection'
import ProjectRoadmapSection from './ProjectRoadmapSection'
import ProjectEarnSection from './ProjectEarnSection'
import ProjectUpdatesPreview from './ProjectUpdatesPreview'
import ProjectCommunitySection from './ProjectCommunitySection'
import ProjectTransparencySummary from './ProjectTransparencySummary'
import ProjectMoreSection from './ProjectMoreSection'
import { AnimatedSection, PageFrame, Shell } from './theme'

const ClientWalletRelationship = dynamic(() => import('./ProjectWalletConsumer'), {
  ssr: false,
  loading: () => null,
}) as React.ComponentType<{
  document: CanonicalProjectDocument
  evidencePack: ProjectEvidencePack
}>

interface Props {
  document: CanonicalProjectDocument
  evidencePack: ProjectEvidencePack
  readinessDocument: ProjectReadinessDocument
  marketsDocument: ProjectMarketsDocument
  participationDocument: ProjectParticipationDocument
  liquidityBuildingDocument: ProjectLiquidityBuildingDocument
  updatesDocument: ProjectUpdatesDocument
  ecosystemDocument: ProjectEcosystemDocument
  developerDocument: ProjectDeveloperDocument
  governanceDocument: ProjectGovernanceDocument
  growthDocument: ProjectGrowthDocument
  machineDocument: ProjectMachineDocument
  tokenomicsDocument?: ProjectTokenomicsDocument | null
  roadmapDocument?: ProjectRoadmapDocument | null
}

const ProjectConsumerShell: React.FC<Props> = ({
  document,
  evidencePack,
  readinessDocument,
  marketsDocument,
  participationDocument,
  liquidityBuildingDocument,
  updatesDocument,
  ecosystemDocument,
  developerDocument,
  governanceDocument,
  growthDocument,
  machineDocument,
  tokenomicsDocument = null,
  roadmapDocument = null,
}) => (
  <PageFrame>
    <Shell id="project-consumer-shell" data-testid="project-consumer-shell">
      <ProjectStickyNav />
      <SectionAnchor id="overview">
        <ProjectHero document={document} marketsDocument={marketsDocument} />
      </SectionAnchor>
      <SectionAnchor id="markets">
        <span id="chart" aria-hidden style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }} />
        <AnimatedSection>
          <ProjectChartPanel slug={document.slug} marketsDocument={marketsDocument} />
        </AnimatedSection>
        <span id="buy" aria-hidden style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }} />
        <AnimatedSection>
          <ProjectSwapCard slug={document.slug} marketsDocument={marketsDocument} />
        </AnimatedSection>
      </SectionAnchor>
      <AnimatedSection>
        <ClientWalletRelationship document={document} evidencePack={evidencePack} />
      </AnimatedSection>
      <SectionAnchor id="about">
        <AnimatedSection>
          <ProjectAbout document={document} />
        </AnimatedSection>
      </SectionAnchor>
      <SectionAnchor id="community">
        <AnimatedSection>
          <ProjectCommunitySection document={document} ecosystemDocument={ecosystemDocument} />
        </AnimatedSection>
      </SectionAnchor>
      <AnimatedSection>
        <ProjectTokenomicsSection tokenomicsDocument={tokenomicsDocument} />
      </AnimatedSection>
      <AnimatedSection>
        <ProjectRoadmapSection roadmapDocument={roadmapDocument} />
      </AnimatedSection>
      <SectionAnchor id="liquidity">
        <span id="farms" aria-hidden style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }} />
        <span id="pools" aria-hidden style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }} />
        <span id="earn" aria-hidden style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }} />
        <AnimatedSection>
          <ProjectEarnSection
            participationDocument={participationDocument}
            liquidityBuildingDocument={liquidityBuildingDocument}
          />
        </AnimatedSection>
      </SectionAnchor>
      <AnimatedSection>
        <ProjectUpdatesPreview updatesDocument={updatesDocument} />
      </AnimatedSection>
      <SectionAnchor id="trust">
        <AnimatedSection>
          <ProjectTransparencySummary
            evidencePack={evidencePack}
            readinessDocument={readinessDocument}
            machineDocument={machineDocument}
          />
        </AnimatedSection>
      </SectionAnchor>
      <SectionAnchor id="more">
        <AnimatedSection>
          <ProjectMoreSection
            document={document}
            developerDocument={developerDocument}
            governanceDocument={governanceDocument}
            growthDocument={growthDocument}
            ecosystemDocument={ecosystemDocument}
          />
        </AnimatedSection>
      </SectionAnchor>
    </Shell>
  </PageFrame>
)

const SectionAnchor: React.FC<{ id: string; children: React.ReactNode }> = ({ id, children }) => (
  <div id={id} style={{ scrollMarginTop: 'calc(56px + env(safe-area-inset-top, 0px))' }}>
    {children}
  </div>
)

export default ProjectConsumerShell
