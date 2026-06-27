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
  overflow-x: auto;
  font-size: 11px;
  color: #b8add2;
  max-height: 480px;
`

interface MachineGraphManifestViewerProps {
  manifest: Record<string, unknown>
}

const MachineGraphManifestViewer: React.FC<MachineGraphManifestViewerProps> = ({ manifest }) => {
  const { t } = useTranslation()
  const [expanded, setExpanded] = useState(false)

  return (
    <Card>
      <Flex justifyContent="space-between" alignItems="center" flexWrap="wrap" style={{ gap: '12px' }}>
        <Heading as="h2" scale="md" color="secondary">
          {t('Graph manifest viewer')}
        </Heading>
        <Button scale="sm" variant="secondary" onClick={() => setExpanded((v) => !v)}>
          {expanded ? t('Hide raw JSON') : t('Show raw JSON')}
        </Button>
      </Flex>
      <Text fontSize="12px" color="textSubtle">
        {t('Graph manifest viewer disclaimer')}
      </Text>
      {expanded && <Pre>{JSON.stringify(manifest, null, 2)}</Pre>}
      <Text fontSize="12px" color="textDisabled">
        {t('Manifest path')}: /registry/graph/index.json
      </Text>
    </Card>
  )
}

export default MachineGraphManifestViewer
