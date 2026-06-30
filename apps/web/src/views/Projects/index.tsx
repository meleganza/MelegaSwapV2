import React, { useMemo, useState } from 'react'
import styled from 'styled-components'
import { Flex } from '@pancakeswap/uikit'
import { useTranslation } from '@pancakeswap/localization'
import Page from 'components/Layout/Page'
import { getAllProjects } from 'registry/projects/getAllProjects'
import { computeDiscoverySummary, discoverProjects } from 'registry/projects/discovery'
import { HumanPageHeader } from 'views/HumanCore'
import { EconomicAiLayer, EconomicManifestLink } from 'views/EconomicOS/components'
import DiscoveryFiltersPanel, { DiscoveryFilterState } from './components/DiscoveryFilters'
import DiscoverySummaryPanel from './components/DiscoverySummary'
import DiscoveryProjectCard from './components/DiscoveryProjectCard'
import ProjectDisclaimer from './components/ProjectDisclaimer'

const Grid = styled(Flex)`
  flex-wrap: wrap;
  gap: 16px;
  justify-content: center;
`

const DEFAULT_STATE: DiscoveryFilterState = {
  filters: {},
  sortBy: 'alphabetical',
}

const Projects: React.FC = () => {
  const { t } = useTranslation()
  const [state, setState] = useState<DiscoveryFilterState>(DEFAULT_STATE)
  const allProjects = useMemo(() => getAllProjects(), [])

  const results = useMemo(
    () => discoverProjects(state.filters, state.sortBy, allProjects),
    [state.filters, state.sortBy, allProjects],
  )

  const summary = useMemo(() => computeDiscoverySummary(allProjects, results), [allProjects, results])

  return (
    <Page>
      <Flex flexDirection="column" maxWidth="1400px" margin="0 auto" px="16px" style={{ gap: '28px' }}>
        <HumanPageHeader
          title="Explore"
          subtitle="Discover projects, assets, and indexed civilization surfaces."
          primaryAction={{ href: '/launch', label: 'List your project' }}
          secondaryAction={{ href: '/assets', label: 'Browse assets' }}
        />

        <DiscoverySummaryPanel summary={summary} />
        <DiscoveryFiltersPanel state={state} onChange={setState} />

        {results.length === 0 ? (
          <p style={{ color: '#9E9E9E', textAlign: 'center' }}>
            {t('No projects match discovery filters')}
          </p>
        ) : (
          <Grid width="100%">
            {results.map((project) => (
              <Flex key={project.slug} style={{ flex: '1 1 320px', maxWidth: '400px' }}>
                <DiscoveryProjectCard project={project} />
              </Flex>
            ))}
          </Grid>
        )}

        <EconomicAiLayer title={t('Machine discovery index')}>
          <EconomicManifestLink
            manifests={[{ label: 'Project discovery', uri: '/registry/projects/discovery.json' }]}
          />
        </EconomicAiLayer>

        <ProjectDisclaimer />
      </Flex>
    </Page>
  )
}

export default Projects
