import React from 'react'
import styled from 'styled-components'
import { Flex, Heading, Text } from '@pancakeswap/uikit'
import { useTranslation } from '@pancakeswap/localization'
import Page from 'components/Layout/Page'
import { getAllProjects } from 'registry/projects/getAllProjects'
import ProjectCard from './components/ProjectCard'
import ProjectDisclaimer from './components/ProjectDisclaimer'

const Grid = styled(Flex)`
  flex-wrap: wrap;
  gap: 16px;
  justify-content: center;
`

const Projects: React.FC = () => {
  const { t } = useTranslation()
  const projects = getAllProjects()

  return (
    <Page>
      <Flex flexDirection="column" alignItems="center" maxWidth="1200px" margin="0 auto" px="16px">
        <Heading as="h1" scale="xxl" color="secondary" mb="8px" textAlign="center">
          {t('Project Registry')}
        </Heading>
        <Text color="textSubtle" textAlign="center" mb="24px" maxWidth="640px">
          {t('Project registry intro')}
        </Text>
        <Grid width="100%">
          {projects.map((project) => (
            <Flex key={project.slug} style={{ flex: '1 1 320px', maxWidth: '400px' }}>
              <ProjectCard project={project} />
            </Flex>
          ))}
        </Grid>
        <ProjectDisclaimer />
      </Flex>
    </Page>
  )
}

export default Projects
