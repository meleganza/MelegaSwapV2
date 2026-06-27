import React from 'react'
import styled from 'styled-components'
import { Flex, Text } from '@pancakeswap/uikit'
import { useTranslation } from '@pancakeswap/localization'
import Page from 'components/Layout/Page'
import { StaticProjectRecord } from 'registry/projects/types'
import ProjectHero from './components/ProjectHero'
import ProjectTokenList from './components/ProjectTokenList'
import ProjectCapabilityMatrix from './components/ProjectCapabilityMatrix'
import ProjectResourceLinks from './components/ProjectResourceLinks'
import ProjectDisclaimer from './components/ProjectDisclaimer'

const Stack = styled(Flex)`
  flex-direction: column;
  gap: 32px;
  max-width: 960px;
  margin: 0 auto;
  width: 100%;
`

interface ProjectDetailProps {
  project: StaticProjectRecord
}

const ProjectDetail: React.FC<ProjectDetailProps> = ({ project }) => {
  const { t } = useTranslation()

  return (
    <Page>
      <Stack px="16px">
        <ProjectHero project={project} />
        <ProjectTokenList tokens={project.resources.tokens} />
        <ProjectCapabilityMatrix capabilities={project.capabilities} />
        <ProjectResourceLinks project={project} />
        {project.verificationStatus === 'unverified' && (
          <Text fontSize="12px" color="textDisabled" textAlign="center">
            {t('Unverified badge tooltip')}
          </Text>
        )}
        <ProjectDisclaimer />
      </Stack>
    </Page>
  )
}

export default ProjectDetail
