import React, { useState } from 'react'
import styled from 'styled-components'
import { Flex, Text, Heading, Button } from '@pancakeswap/uikit'
import { useTranslation } from '@pancakeswap/localization'

const Card = styled(Flex)`
  flex-direction: column;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.02);
  gap: 12px;
`

const Pre = styled.pre`
  margin: 0;
  padding: 16px;
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.08);
  overflow-x: auto;
  font-size: 11px;
  line-height: 1.5;
  color: #b8add2;
  max-height: 480px;
`

const SectionList = styled(Flex)`
  flex-direction: column;
  gap: 8px;
`

interface ProjectManifestViewerProps {
  manifest: Record<string, unknown>
  slug: string
}

const ProjectManifestViewer: React.FC<ProjectManifestViewerProps> = ({ manifest, slug }) => {
  const { t } = useTranslation()
  const [expanded, setExpanded] = useState(false)

  const topLevelKeys = Object.keys(manifest).filter((key) => key !== 'capabilities' && key !== 'resources')

  return (
    <Card>
      <Flex justifyContent="space-between" alignItems="center" flexWrap="wrap" style={{ gap: '12px' }}>
        <Heading as="h2" scale="md" color="secondary">
          {t('Project manifest viewer')}
        </Heading>
        <Button scale="sm" variant="secondary" onClick={() => setExpanded((value) => !value)}>
          {expanded ? t('Hide raw JSON') : t('Show raw JSON')}
        </Button>
      </Flex>
      <Text fontSize="12px" color="textSubtle">
        {t('Manifest viewer disclaimer')}
      </Text>
      <SectionList>
        {topLevelKeys.map((key) => (
          <Flex key={key} flexDirection="column">
            <Text fontSize="12px" color="secondary" fontWeight={600}>
              {key}
            </Text>
            <Text fontSize="12px" color="textSubtle" style={{ wordBreak: 'break-word' }}>
              {typeof manifest[key] === 'object' ? JSON.stringify(manifest[key]) : String(manifest[key])}
            </Text>
          </Flex>
        ))}
      </SectionList>
      {expanded && <Pre>{JSON.stringify(manifest, null, 2)}</Pre>}
      <Text fontSize="12px" color="textDisabled">
        {t('Manifest path')}: /registry/projects/{slug}.json
      </Text>
    </Card>
  )
}

export default ProjectManifestViewer
