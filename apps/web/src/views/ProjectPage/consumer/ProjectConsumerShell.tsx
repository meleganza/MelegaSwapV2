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
import ProjectWebsiteHero from './ProjectWebsiteHero'
import ProjectMetricsStrip from './ProjectMetricsStrip'
import ProjectChartPanel from './ProjectChartPanel'
import ProjectSwapCard from './ProjectSwapCard'
import ProjectWebsiteInfoRow from './ProjectWebsiteInfoRow'
import ProjectAbout from './ProjectAbout'
import ProjectTokenomicsSection from './ProjectTokenomicsSection'
import ProjectRoadmapSection from './ProjectRoadmapSection'
import ProjectEarnSection from './ProjectEarnSection'
import ProjectUpdatesPreview from './ProjectUpdatesPreview'
import ProjectCommunitySection from './ProjectCommunitySection'
import ProjectTransparencySummary from './ProjectTransparencySummary'
import ProjectMoreSection from './ProjectMoreSection'
import { AnimatedSection, BottomTriple, ChartSwapRow, PageFrame, Shell } from './theme'
import { isTokenProjectTemplate } from './helpers'

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
}) => {
  const tokenMode = isTokenProjectTemplate(document)

  return (
    <PageFrame>
      <Shell
        id="project-consumer-shell"
        data-testid="project-consumer-shell"
        data-project-website="true"
        data-token-mode={tokenMode ? 'true' : 'false'}
      >
        <ProjectStickyNav />

        <SectionAnchor id="overview">
          <ProjectWebsiteHero document={document} />
        </SectionAnchor>

        <AnimatedSection>
          <ProjectMetricsStrip document={document} marketsDocument={marketsDocument} />
        </AnimatedSection>

        <ChartSwapRow>
          <SectionAnchor id="chart">
            <AnimatedSection>
              {tokenMode ? (
                <ProjectChartPanel slug={document.slug} marketsDocument={marketsDocument} dense />
              ) : (
                <ProtocolPanel
                  title="Market Activity"
                  body="Explore live markets and DEX intelligence. Token charts belong on token project pages."
                  href="/radar"
                  cta="Open DEX Intelligence"
                />
              )}
            </AnimatedSection>
          </SectionAnchor>
          <SectionAnchor id="buy">
            <AnimatedSection>
              {tokenMode ? (
                <ProjectSwapCard slug={document.slug} marketsDocument={marketsDocument} dense />
              ) : (
                <ProtocolPanel
                  title="Trade"
                  body="Open the certified Melega swap surface. Melega DEX is a protocol — not a tradable token."
                  href="/trade"
                  cta="Open Trade"
                />
              )}
            </AnimatedSection>
          </SectionAnchor>
        </ChartSwapRow>

        <AnimatedSection>
          <ProjectWebsiteInfoRow
            document={document}
            tokenomicsDocument={tokenomicsDocument}
            roadmapDocument={roadmapDocument}
            ecosystemDocument={ecosystemDocument}
          />
        </AnimatedSection>

        <SectionAnchor id="earn">
          <AnimatedSection>
            <ProjectEarnSection
              participationDocument={participationDocument}
              liquidityBuildingDocument={liquidityBuildingDocument}
              symbol={
                document.assets.find((a) => a.projectRole === 'primary')?.symbol.meta.availability ===
                'AVAILABLE'
                  ? String(document.assets.find((a) => a.projectRole === 'primary')?.symbol.value)
                  : null
              }
            />
          </AnimatedSection>
        </SectionAnchor>

        <AnimatedSection>
          <ClientWalletRelationship document={document} evidencePack={evidencePack} />
        </AnimatedSection>

        <BottomTriple>
          <SectionAnchor id="updates">
            <AnimatedSection>
              <ProjectUpdatesPreview updatesDocument={updatesDocument} />
            </AnimatedSection>
          </SectionAnchor>
          <SectionAnchor id="trust">
            <AnimatedSection>
              <ProjectTransparencySummary
                evidencePack={evidencePack}
                readinessDocument={readinessDocument}
                machineDocument={machineDocument}
              />
            </AnimatedSection>
          </SectionAnchor>
          <SectionAnchor id="community">
            <AnimatedSection>
              <ProjectCommunitySection document={document} ecosystemDocument={ecosystemDocument} />
            </AnimatedSection>
          </SectionAnchor>
        </BottomTriple>

        <SectionAnchor id="about">
          <AnimatedSection>
            <ProjectAbout document={document} />
          </AnimatedSection>
        </SectionAnchor>

        <div id="more-tokenomics">
          <AnimatedSection>
            <ProjectTokenomicsSection tokenomicsDocument={tokenomicsDocument} />
          </AnimatedSection>
        </div>
        <div id="more-roadmap">
          <AnimatedSection>
            <ProjectRoadmapSection roadmapDocument={roadmapDocument} />
          </AnimatedSection>
        </div>

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
}

const SectionAnchor: React.FC<{ id: string; children: React.ReactNode }> = ({ id, children }) => (
  <div id={id} style={{ scrollMarginTop: 'calc(108px + env(safe-area-inset-top, 0px))' }}>
    {children}
  </div>
)

const ProtocolPanel: React.FC<{ title: string; body: string; href: string; cta: string }> = ({
  title,
  body,
  href,
  cta,
}) => (
  <div
    data-testid="project-protocol-panel"
    style={{
      minHeight: 306,
      padding: 18,
      borderRadius: 16,
      background: '#111111',
      border: '1px solid rgba(255,255,255,0.075)',
      boxShadow: '0 14px 40px rgba(0,0,0,0.28)',
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
    }}
  >
    <h2 style={{ margin: 0, fontSize: 22, color: '#fff' }}>{title}</h2>
    <p style={{ margin: 0, fontSize: 14, lineHeight: 1.45, color: 'rgba(255,255,255,0.65)' }}>{body}</p>
    <a
      href={href}
      style={{
        marginTop: 'auto',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: 43,
        borderRadius: 10,
        background: '#ddb92f',
        color: '#111',
        fontWeight: 700,
        fontSize: 14,
        textDecoration: 'none',
      }}
    >
      {cta}
    </a>
  </div>
)

export default ProjectConsumerShell
