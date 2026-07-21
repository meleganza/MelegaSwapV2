import React from 'react'
import styled from 'styled-components'
import { Card, Flex, Text, Heading } from '@pancakeswap/uikit'
import Link from 'next/link'
import { useTranslation } from '@pancakeswap/localization'
import { StaticProjectRecord } from 'registry/projects/types'
import ProjectTrustBadge from './ProjectTrustBadge'

const StyledCard = styled(Card)`
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.02);
  border-radius: 16px;
  padding: 20px;
  height: 100%;
  transition: border-color 0.2s ease;

  &:hover {
    border-color: rgba(49, 208, 170, 0.4);
  }
`

interface ProjectCardProps {
  project: StaticProjectRecord
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const { t } = useTranslation()

  return (
    <Link href={`/@${project.slug}/`} passHref legacyBehavior>
      <StyledCard as="a" style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
        <Flex flexDirection="column" style={{ gap: '12px' }}>
          <Heading as="h3" scale="lg" color="secondary">
            {project.displayName}
          </Heading>
          {project.tagline && (
            <Text fontSize="14px" color="textSubtle">
              {project.tagline}
            </Text>
          )}
          <ProjectTrustBadge badges={project.trustBadges} />
          <Text fontSize="12px" color="textDisabled">
            {project.sectorTags.join(' · ')}
          </Text>
          <Text fontSize="12px" color="textDisabled">
            {t('%count% chains', { count: project.supportedChains.length })}
          </Text>
        </Flex>
      </StyledCard>
    </Link>
  )
}

export default ProjectCard
