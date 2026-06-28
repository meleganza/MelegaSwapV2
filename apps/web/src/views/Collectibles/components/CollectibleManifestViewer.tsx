import React from 'react'
import styled from 'styled-components'
import { Flex, Text, Heading } from '@pancakeswap/uikit'
import { useTranslation } from '@pancakeswap/localization'

const Box = styled(Flex)`
  flex-direction: column;
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.2);
  gap: 8px;
`

interface CollectibleManifestViewerProps {
  manifest: Record<string, unknown>
  slug: string
}

const CollectibleManifestViewer: React.FC<CollectibleManifestViewerProps> = ({ manifest, slug }) => {
  const { t } = useTranslation()

  return (
    <Box>
      <Heading as="h2" scale="md" color="secondary">
        {t('Collectibles manifest title')}
      </Heading>
      <Text fontSize="12px" color="textSubtle">
        <a href={`/registry/collectibles/${slug}.json`} style={{ color: 'inherit' }}>
          /registry/collectibles/{slug}.json
        </a>
      </Text>
      <pre
        style={{
          margin: 0,
          fontSize: '11px',
          overflow: 'auto',
          maxHeight: '240px',
          color: '#a9a9a9',
        }}
      >
        {JSON.stringify(manifest, null, 2)}
      </pre>
    </Box>
  )
}

export default CollectibleManifestViewer
