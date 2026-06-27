import React, { useMemo, useState } from 'react'
import styled from 'styled-components'
import { Flex, Heading, Text } from '@pancakeswap/uikit'
import { useTranslation } from '@pancakeswap/localization'
import Page from 'components/Layout/Page'
import { getAllProjects } from 'registry/projects/getAllProjects'
import {
  computeDiscoverySummary,
  discoverProjects,
} from 'registry/projects/discovery'
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

  const summary = useMemo(
    () => computeDiscoverySummary(allProjects, results),
    [allProjects, results],
  )

  return (
    <Page>
      <Flex flexDirection="column" alignItems="center" maxWidth="1200px" margin="0 auto" px="16px" style={{ gap: '24px' }}>
        <Flex flexDirection="column" alignItems="center" style={{ gap: '8px' }}>
          <Heading as="h1" scale="xxl" color="secondary" textAlign="center">
            {t('Project Discovery')}
          </Heading>
          <Text color="textSubtle" textAlign="center" maxWidth="720px">
            {t('Project discovery intro')}
          </Text>
          <Text fontSize="12px" color="textDisabled" textAlign="center" maxWidth="720px">
            {t('Civilization readiness disclaimer')}
          </Text>
        </Flex>

        <DiscoverySummaryPanel summary={summary} />
        <DiscoveryFiltersPanel state={state} onChange={setState} />

        {results.length === 0 ? (
          <Text color="textSubtle" textAlign="center">
            {t('No projects match discovery filters')}
          </Text>
        ) : (
          <Grid width="100%">
            {results.map((project) => (
              <Flex key={project.slug} style={{ flex: '1 1 320px', maxWidth: '400px' }}>
                <DiscoveryProjectCard project={project} />
              </Flex>
            ))}
          </Grid>
        )}

        <Text fontSize="12px" color="textDisabled" textAlign="center">
          {t('Machine discovery index')}:{' '}
          <a href="/registry/projects/discovery.json" style={{ color: 'inherit' }}>
            /registry/projects/discovery.json
          </a>
        </Text>

        <ProjectDisclaimer />
      </Flex>
    </Page>
  )
}

export default Projects
