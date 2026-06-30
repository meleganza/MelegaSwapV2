import React from 'react'
import styled from 'styled-components'
import { Flex, Text, Heading } from '@pancakeswap/uikit'
import { useTranslation } from '@pancakeswap/localization'
import { StaticProjectRecord } from 'registry/projects/types'

const Card = styled(Flex)`
  flex-direction: column;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.02);
  gap: 16px;
`

const Row = styled(Flex)`
  flex-direction: column;
  padding: 12px;
  border: 1px dashed rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  gap: 4px;
`

interface ProjectRelationshipsSectionProps {
  project: StaticProjectRecord
}

const ProjectRelationshipsSection: React.FC<ProjectRelationshipsSectionProps> = ({ project }) => {
  const { t } = useTranslation()

  const relationships = [
    {
      title: t('Tokens'),
      content:
        project.resources.tokens.length > 0
          ? project.resources.tokens.map((token) => `${token.symbol} (${token.ref})`).join(' · ')
          : t('Relationship not indexed'),
    },
    {
      title: t('Liquidity'),
      content:
        project.resources.liquidityPools.length > 0
          ? project.resources.liquidityPools.join(' · ')
          : t('Relationship not indexed'),
    },
    {
      title: t('Campaigns'),
      content: t('Relationship placeholder campaigns'),
    },
    {
      title: t('Locks'),
      content: t('Relationship placeholder locks'),
    },
    {
      title: t('Governance'),
      content: t('Relationship placeholder governance'),
    },
    {
      title: t('News'),
      content: t('Relationship placeholder news'),
    },
  ]

  return (
    <Card>
      <Heading as="h2" scale="md" color="secondary">
        {t('Relationships')}
      </Heading>
      <Text fontSize="12px" color="textSubtle">
        {t('Relationships disclaimer')}
      </Text>
      {relationships.map((item) => (
        <Row key={item.title}>
          <Text fontSize="14px" color="text" fontWeight={600}>
            {item.title}
          </Text>
          <Text fontSize="12px" color="textSubtle">
            {item.content}
          </Text>
        </Row>
      ))}
    </Card>
  )
}

export default ProjectRelationshipsSection
