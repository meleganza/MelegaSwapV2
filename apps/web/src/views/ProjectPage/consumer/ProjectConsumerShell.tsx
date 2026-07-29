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
import ProjectHero from './ProjectHero'
import ProjectMarketSnapshot from './ProjectMarketSnapshot'
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

/**
 * Dense one-long-page Project consumer — no sticky anchor menu.
 * Order: Hero → Market snapshot → Trade → Description → Token metrics →
 * Markets → Liquidity/Pools/Farms → Socials → Roadmap → Trust/Contract/Audit →
 * Treasury/Links/Developer → Machine data.
 */
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
    <Shell
      id="project-consumer-shell"
      data-testid="project-consumer-shell"
      data-project-layout="dense-long-page"
      data-project-nav="none"
    >
      <DenseBlock>
        <ProjectHero document={document} marketsDocument={marketsDocument} />
      </DenseBlock>

      <DenseBlock>
        <AnimatedSection>
          <ProjectMarketSnapshot marketsDocument={marketsDocument} />
        </AnimatedSection>
      </DenseBlock>

      <DenseBlock id="trade">
        <AnimatedSection>
          <ProjectSwapCard slug={document.slug} marketsDocument={marketsDocument} />
        </AnimatedSection>
      </DenseBlock>

      <DenseBlock>
        <AnimatedSection>
          <ProjectAbout document={document} />
        </AnimatedSection>
      </DenseBlock>

      <DenseBlock>
        <AnimatedSection>
          <ProjectTokenomicsSection tokenomicsDocument={tokenomicsDocument} />
        </AnimatedSection>
      </DenseBlock>

      <DenseBlock id="markets">
        <AnimatedSection>
          <ProjectChartPanel slug={document.slug} marketsDocument={marketsDocument} />
        </AnimatedSection>
      </DenseBlock>

      <DenseBlock>
        <AnimatedSection>
          <ProjectEarnSection
            participationDocument={participationDocument}
            liquidityBuildingDocument={liquidityBuildingDocument}
          />
        </AnimatedSection>
      </DenseBlock>

      <DenseBlock>
        <AnimatedSection>
          <ClientWalletRelationship document={document} evidencePack={evidencePack} />
        </AnimatedSection>
      </DenseBlock>

      <DenseBlock>
        <AnimatedSection>
          <ProjectCommunitySection document={document} ecosystemDocument={ecosystemDocument} />
        </AnimatedSection>
      </DenseBlock>

      <DenseBlock>
        <AnimatedSection>
          <ProjectRoadmapSection roadmapDocument={roadmapDocument} />
        </AnimatedSection>
      </DenseBlock>

      <DenseBlock>
        <AnimatedSection>
          <ProjectTransparencySummary
            evidencePack={evidencePack}
            readinessDocument={readinessDocument}
            machineDocument={machineDocument}
          />
        </AnimatedSection>
      </DenseBlock>

      <DenseBlock>
        <AnimatedSection>
          <ProjectUpdatesPreview updatesDocument={updatesDocument} />
        </AnimatedSection>
      </DenseBlock>

      <DenseBlock>
        <AnimatedSection>
          <ProjectMoreSection
            document={document}
            developerDocument={developerDocument}
            governanceDocument={governanceDocument}
            growthDocument={growthDocument}
            ecosystemDocument={ecosystemDocument}
            alwaysExpanded
          />
        </AnimatedSection>
      </DenseBlock>
    </Shell>
  </PageFrame>
)

const DenseBlock: React.FC<{ id?: string; children: React.ReactNode }> = ({ id, children }) => (
  <div
    id={id}
    data-project-block={id || 'section'}
    style={{ marginBottom: 10, minWidth: 0 }}
  >
    {children}
  </div>
)

export default ProjectConsumerShell
