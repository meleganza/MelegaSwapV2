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
import ProjectMarketSnapshot from './ProjectMarketSnapshot'
import ProjectChartPanel from './ProjectChartPanel'
import ProjectSwapCard from './ProjectSwapCard'
import ProjectAbout from './ProjectAbout'
import ProjectTokenomicsSection from './ProjectTokenomicsSection'
import ProjectRoadmapSection from './ProjectRoadmapSection'
import ProjectUtilitiesSection from './ProjectUtilitiesSection'
import ProjectEarnSection from './ProjectEarnSection'
import ProjectUpdatesPreview from './ProjectUpdatesPreview'
import ProjectCommunitySection from './ProjectCommunitySection'
import ProjectTransparencySummary from './ProjectTransparencySummary'
import ProjectMoreSection from './ProjectMoreSection'
import { PageFrame, Shell } from './theme'

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
      <ProjectHero
        document={document}
        marketsDocument={marketsDocument}
        liquidityBuildingDocument={liquidityBuildingDocument}
      />
      <ProjectMarketSnapshot marketsDocument={marketsDocument} />
      <ClientWalletRelationship document={document} evidencePack={evidencePack} />
      <ProjectAbout document={document} />
      <SectionAnchor id="chart">
        <ProjectChartPanel slug={document.slug} marketsDocument={marketsDocument} />
      </SectionAnchor>
      <SectionAnchor id="swap">
        <ProjectSwapCard slug={document.slug} marketsDocument={marketsDocument} />
      </SectionAnchor>
      <ProjectTokenomicsSection tokenomicsDocument={tokenomicsDocument} />
      <ProjectRoadmapSection roadmapDocument={roadmapDocument} />
      <ProjectEarnSection
        participationDocument={participationDocument}
        liquidityBuildingDocument={liquidityBuildingDocument}
      />
      <ProjectUtilitiesSection ecosystemDocument={ecosystemDocument} />
      <ProjectUpdatesPreview updatesDocument={updatesDocument} />
      <ProjectCommunitySection document={document} ecosystemDocument={ecosystemDocument} />
      <ProjectTransparencySummary
        evidencePack={evidencePack}
        readinessDocument={readinessDocument}
        machineDocument={machineDocument}
      />
      <ProjectMoreSection
        document={document}
        developerDocument={developerDocument}
        governanceDocument={governanceDocument}
        growthDocument={growthDocument}
      />
    </Shell>
  </PageFrame>
)

const SectionAnchor: React.FC<{ id: string; children: React.ReactNode }> = ({ id, children }) => (
  <div id={id} style={{ scrollMarginTop: 'calc(56px + env(safe-area-inset-top, 0px))' }}>
    {children}
  </div>
)

export default ProjectConsumerShell
