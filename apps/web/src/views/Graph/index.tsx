import React from 'react'
import styled from 'styled-components'
import { Flex, Heading, Text } from '@pancakeswap/uikit'
import { useTranslation } from '@pancakeswap/localization'
import Page from 'components/Layout/Page'
import { resolveEconomicGraph } from 'registry/graph/resolveGraph'
import { serializeGraphManifest } from 'registry/graph/manifest'
import GraphNodeCard from './components/GraphNodeCard'
import GraphRelationshipList from './components/GraphRelationshipList'
import RegistryGraphSummary from './components/RegistryGraphSummary'
import MachineGraphManifestViewer from './components/MachineGraphManifestViewer'

const Stack = styled(Flex)`
  flex-direction: column;
  gap: 32px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
`

const Layer = styled(Flex)`
  flex-direction: column;
  gap: 16px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.02);
`

const Grid = styled(Flex)`
  flex-wrap: wrap;
  gap: 12px;
`

const Arrow = styled(Text)`
  text-align: center;
  font-size: 24px;
  color: #b8add2;
`

const Graph: React.FC = () => {
  const { t } = useTranslation()
  const graph = resolveEconomicGraph()
  const manifest = serializeGraphManifest()

  const layers = [
    { key: 'projects', title: t('Projects'), nodes: graph.layers.projects },
    { key: 'assets', title: t('Assets'), nodes: graph.layers.assets },
    { key: 'venues', title: t('Venues'), nodes: graph.layers.venues },
    { key: 'events', title: t('Events'), nodes: graph.layers.events },
  ] as const

  return (
    <Page>
      <Stack px="16px" py="24px">
        <Flex flexDirection="column" alignItems="center" style={{ gap: '8px' }}>
          <Heading as="h1" scale="xxl" color="secondary" textAlign="center">
            {t('Economic Graph')}
          </Heading>
          <Text color="textSubtle" textAlign="center" maxWidth="720px">
            {t('Economic graph intro')}
          </Text>
          <Text fontSize="12px" color="textDisabled" textAlign="center" maxWidth="720px">
            {t('Economic graph disclaimer')}
          </Text>
        </Flex>

        <RegistryGraphSummary summary={graph.summary} />

        <Flex flexDirection="column" style={{ gap: '8px' }}>
          <Heading as="h2" scale="md" color="secondary">
            {t('Registry layers')}
          </Heading>
          <Text fontSize="12px" color="textSubtle">
            {t('Economic graph flow')}
          </Text>
          {layers.map((layer, index) => (
            <React.Fragment key={layer.key}>
              <Layer>
                <Heading as="h3" scale="sm" color="secondary">
                  {layer.title}
                </Heading>
                <Grid>
                  {layer.nodes.map((node) => (
                    <Flex key={node.slug} style={{ flex: '1 1 240px', maxWidth: '320px' }}>
                      <GraphNodeCard node={node} />
                    </Flex>
                  ))}
                </Grid>
              </Layer>
              {index < layers.length - 1 && <Arrow>↓</Arrow>}
            </React.Fragment>
          ))}
        </Flex>

        <Layer>
          <Heading as="h2" scale="md" color="secondary" mb="8px">
            {t('Graph relationships')}
          </Heading>
          <GraphRelationshipList edges={graph.edges} />
        </Layer>

        <Layer>
          <Heading as="h2" scale="md" color="secondary" mb="8px">
            {t('Treasury attribution')}
          </Heading>
          <Text fontSize="12px" color="textSubtle">
            {t('Treasury attribution')}: not_indexed
          </Text>
          <Text fontSize="11px" color="textDisabled">
            {t('Treasury graph placeholder')}
          </Text>
        </Layer>

        <MachineGraphManifestViewer manifest={manifest} />

        <Text fontSize="12px" color="textDisabled" textAlign="center">
          {t('Machine discovery index')}:{' '}
          <a href="/registry/graph/index.json" style={{ color: 'inherit' }}>
            /registry/graph/index.json
          </a>
        </Text>
      </Stack>
    </Page>
  )
}

export default Graph
