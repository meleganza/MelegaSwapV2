import React from 'react'
import styled from 'styled-components'
import { Flex, Text, Heading, Button } from '@pancakeswap/uikit'
import Link from 'next/link'
import { useTranslation } from '@pancakeswap/localization'
import { StaticProjectRecord } from 'registry/projects/types'
import ProjectTrustBadge from './ProjectTrustBadge'

const HeroCard = styled(Flex)`
  flex-direction: column;
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.02);
`

const UpiText = styled(Text)`
  font-family: monospace;
  font-size: 12px;
  word-break: break-all;
`

interface ProjectHeroProps {
  project: StaticProjectRecord
}

const ProjectHero: React.FC<ProjectHeroProps> = ({ project }) => {
  const { t } = useTranslation()
  const tokenAddress = project.resources.tokens[0]?.address
  const radarHref = tokenAddress ? `/radar?contract=${tokenAddress}` : undefined

  return (
    <HeroCard>
      <Flex justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" style={{ gap: '16px' }}>
        <Flex flexDirection="column" flex="1" style={{ minWidth: '240px' }}>
          <Heading as="h1" scale="xl" color="secondary" mb="8px">
            {project.displayName}
          </Heading>
          {project.tagline && (
            <Text color="textSubtle" mb="12px">
              {project.tagline}
            </Text>
          )}
          <ProjectTrustBadge badges={project.trustBadges} />
        </Flex>
        <Flex style={{ gap: '8px', flexWrap: 'wrap' }}>
          {radarHref ? (
            <Link href={radarHref} passHref legacyBehavior>
              <Button as="a" scale="sm" variant="secondary">
                {t('Open Radar')}
              </Button>
            </Link>
          ) : null}
          {radarHref ? (
            <Link href={radarHref} passHref legacyBehavior>
              <Button as="a" scale="sm" variant="secondary">
                {t('Open Contract Intelligence')}
              </Button>
            </Link>
          ) : null}
          {project.deepLinks.buyMarco ? (
            <Link href={project.deepLinks.buyMarco} passHref legacyBehavior>
              <Button as="a" scale="sm">
                {t('Buy MARCO')}
              </Button>
            </Link>
          ) : null}
        </Flex>
      </Flex>
      <Text color="text" mt="16px" mb="8px">
        {project.description}
      </Text>
      <UpiText color="textDisabled" mb="4px">
        UPI: {project.upi}
      </UpiText>
      <Text fontSize="12px" color="textDisabled">
        {t('Registry snapshot as of %date%', { date: project.asOf })}
      </Text>
    </HeroCard>
  )
}

export default ProjectHero
