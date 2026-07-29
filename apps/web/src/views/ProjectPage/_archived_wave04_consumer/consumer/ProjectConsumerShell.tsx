/**
 * Wave 04 Continuation — Project Page rebuilt as one dense long page.
 * No tabs. No anchor menu. No empty hero chrome.
 */
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
import { FeaturedHomePromotionCard } from 'views/shared/FeaturedHomePromotionCard'
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
import { AnimatedSection, PageFrame, Section, SectionTitle, SoftCard, MutedText, Shell } from './theme'
import { getPrimaryAsset } from './helpers'
import { shortenAddress } from '../presentation/humanLabels'

const ClientWalletRelationship = dynamic(() => import('./ProjectWalletConsumer'), {
  ssr: false,
  loading: () => null,
}) as React.ComponentType<{
  document: CanonicalProjectDocument
  evidencePack: ProjectEvidencePack
}>

const ProjectMachineSection = dynamic(() => import('../ProjectMachineSection'), {
  ssr: false,
  loading: () => null,
})

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
}) => {
  const primary = getPrimaryAsset(document)
  const contract =
    primary?.contractAddress && /^0x[a-fA-F0-9]{40}$/.test(primary.contractAddress)
      ? primary.contractAddress
      : null

  return (
    <PageFrame>
      <Shell
        id="project-consumer-shell"
        data-testid="project-consumer-shell"
        data-project-layout="dense-long-page-v2"
        data-project-nav="none"
        data-project-rebuild="wave-04-continuation"
      >
        <Block>
          <ProjectHero document={document} marketsDocument={marketsDocument} />
        </Block>

        <Block>
          <AnimatedSection>
            <ProjectMarketSnapshot marketsDocument={marketsDocument} />
          </AnimatedSection>
        </Block>

        <Block>
          <AnimatedSection>
            <ProjectSwapCard slug={document.slug} marketsDocument={marketsDocument} />
          </AnimatedSection>
        </Block>

        <Block>
          <AnimatedSection>
            <ProjectAbout document={document} />
          </AnimatedSection>
        </Block>

        <Block>
          <AnimatedSection>
            <ProjectTokenomicsSection tokenomicsDocument={tokenomicsDocument} />
          </AnimatedSection>
        </Block>

        <Block>
          <AnimatedSection>
            <Section aria-labelledby="project-distribution-heading">
              <SectionTitle id="project-distribution-heading">Distribution</SectionTitle>
              <SoftCard>
                <MutedText>
                  {tokenomicsDocument?.allocationCategories?.length
                    ? `${tokenomicsDocument.allocationCategories.length} allocation categories registered.`
                    : 'No allocation schedule registered for this project yet.'}
                </MutedText>
              </SoftCard>
            </Section>
          </AnimatedSection>
        </Block>

        <Block>
          <AnimatedSection>
            <ProjectChartPanel slug={document.slug} marketsDocument={marketsDocument} />
          </AnimatedSection>
        </Block>

        <Block>
          <AnimatedSection>
            <ProjectEarnSection
              participationDocument={participationDocument}
              liquidityBuildingDocument={liquidityBuildingDocument}
            />
          </AnimatedSection>
        </Block>

        <Block>
          <AnimatedSection>
            <Section aria-labelledby="project-contract-heading">
              <SectionTitle id="project-contract-heading">Contract</SectionTitle>
              <SoftCard>
                {contract ? (
                  <>
                    <MutedText style={{ fontFamily: 'ui-monospace, monospace' }}>
                      {shortenAddress(contract)} · {contract}
                    </MutedText>
                    <a
                      href={`https://bscscan.com/address/${contract}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#F2C84C', fontWeight: 700, fontSize: 14 }}
                    >
                      View on BscScan ↗
                    </a>
                  </>
                ) : (
                  <MutedText>No primary contract address registered.</MutedText>
                )}
              </SoftCard>
            </Section>
          </AnimatedSection>
        </Block>

        <Block>
          <AnimatedSection>
            <ProjectTransparencySummary
              evidencePack={evidencePack}
              readinessDocument={readinessDocument}
              machineDocument={machineDocument}
              forceExpanded
            />
          </AnimatedSection>
        </Block>

        <Block>
          <AnimatedSection>
            <ClientWalletRelationship document={document} evidencePack={evidencePack} />
          </AnimatedSection>
        </Block>

        <Block>
          <AnimatedSection>
            <ProjectCommunitySection document={document} ecosystemDocument={ecosystemDocument} />
          </AnimatedSection>
        </Block>

        <Block>
          <AnimatedSection>
            <ProjectRoadmapSection roadmapDocument={roadmapDocument} />
          </AnimatedSection>
        </Block>

        <Block>
          <AnimatedSection>
            <ProjectUpdatesPreview updatesDocument={updatesDocument} />
          </AnimatedSection>
        </Block>

        <Block>
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
        </Block>

        <Block>
          <AnimatedSection>
            <Section aria-labelledby="project-featured-promo-heading">
              <SectionTitle id="project-featured-promo-heading">Featured Home Promotion</SectionTitle>
              <FeaturedHomePromotionCard testId="project-featured-home-promotion" />
            </Section>
          </AnimatedSection>
        </Block>

        <Block>
          <AnimatedSection>
            <Section aria-labelledby="project-machine-heading">
              <SectionTitle id="project-machine-heading">Machine information</SectionTitle>
              <ProjectMachineSection machineDocument={machineDocument} />
            </Section>
          </AnimatedSection>
        </Block>
      </Shell>
    </PageFrame>
  )
}

const Block: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ marginBottom: 8, minWidth: 0 }}>{children}</div>
)

export default ProjectConsumerShell
