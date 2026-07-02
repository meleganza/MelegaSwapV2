import React from 'react'
import styled from 'styled-components'
import { Flex } from '@pancakeswap/uikit'
import Page from 'components/Layout/Page'
import { StaticProjectRecord } from 'registry/projects/types'
import { computeHealthMetrics } from 'registry/projects/intelligence'
import ProjectHero from './components/ProjectHero'
import ProjectIntelligenceCard from './components/ProjectIntelligenceCard'
import ProjectExecutiveIntelligence from './components/ProjectExecutiveIntelligence'
import ProjectHealthSummary from './components/ProjectHealthSummary'
import ProjectManifestViewer from './components/ProjectManifestViewer'
import ProjectRelationshipsSection from './components/ProjectRelationshipsSection'
import ProjectTokenList from './components/ProjectTokenList'
import ProjectAssetsSection from './components/ProjectAssetsSection'
import ProjectVenuesSection from './components/ProjectVenuesSection'
import ProjectEventsSection from './components/ProjectEventsSection'
import ProjectResourceLinks from './components/ProjectResourceLinks'
import ProjectDisclaimer from './components/ProjectDisclaimer'
import GraphExploreLink from 'views/Graph/components/GraphExploreLink'

const Stack = styled(Flex)`
  flex-direction: column;
  gap: 32px;
  max-width: 960px;
  margin: 0 auto;
  width: 100%;
`

interface ProjectDetailProps {
  project: StaticProjectRecord
  manifest: Record<string, unknown>
}

const ProjectDetail: React.FC<ProjectDetailProps> = ({ project, manifest }) => {
  const health = computeHealthMetrics(project)

  return (
    <Page>
      <Stack px="16px">
        <ProjectHero project={project} />
        <ProjectIntelligenceCard project={project} />
        <ProjectExecutiveIntelligence project={project} />
        <ProjectHealthSummary health={health} />
        <ProjectManifestViewer manifest={manifest} slug={project.slug} />
        <ProjectAssetsSection projectSlug={project.slug} />
        <ProjectVenuesSection projectSlug={project.slug} />
        <ProjectEventsSection projectSlug={project.slug} />
        <ProjectTokenList tokens={project.resources.tokens} />
        <ProjectRelationshipsSection project={project} />
        <ProjectResourceLinks project={project} />
        <GraphExploreLink />
        <ProjectDisclaimer />
      </Stack>
    </Page>
  )
}

export default ProjectDetail
