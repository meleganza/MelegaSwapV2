import React, { useMemo, useState } from 'react'
import styled from 'styled-components'
import { Flex, Heading, Text } from '@pancakeswap/uikit'
import { useTranslation } from '@pancakeswap/localization'
import Page from 'components/Layout/Page'
import { QUERY_PRESETS } from 'registry/query/constants'
import { runQueryPreset } from 'registry/query/queries'
import { serializeQueryManifest } from 'registry/query/manifest'
import { QueryPresetId } from 'registry/query/types'
import QueryPresetList from './components/QueryPresetList'
import QueryResultCard from './components/QueryResultCard'
import QueryManifestViewer from './components/QueryManifestViewer'

const Stack = styled(Flex)`
  flex-direction: column;
  gap: 32px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
`

const Panel = styled(Flex)`
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

const Layout = styled(Flex)`
  gap: 24px;
  flex-wrap: wrap;
  align-items: flex-start;
`

const Sidebar = styled(Flex)`
  flex-direction: column;
  flex: 1 1 280px;
  max-width: 360px;
  gap: 12px;
`

const Main = styled(Flex)`
  flex-direction: column;
  flex: 2 1 480px;
  gap: 16px;
`

const QueryExplorer: React.FC = () => {
  const { t } = useTranslation()
  const [activePresetId, setActivePresetId] = useState<QueryPresetId>('projects-with-marco-assets')
  const manifest = useMemo(() => serializeQueryManifest(), [])
  const activeResult = useMemo(() => runQueryPreset(activePresetId), [activePresetId])

  return (
    <Page>
      <Stack px="16px" py="24px">
        <Flex flexDirection="column" alignItems="center" style={{ gap: '8px' }}>
          <Heading as="h1" scale="xxl" color="secondary" textAlign="center">
            {t('Economic Query Layer')}
          </Heading>
          <Text color="textSubtle" textAlign="center" maxWidth="720px">
            {t('Query layer intro')}
          </Text>
          <Text fontSize="12px" color="textDisabled" textAlign="center" maxWidth="720px">
            {t('Query layer disclaimer')}
          </Text>
        </Flex>

        <Layout width="100%">
          <Sidebar>
            <Panel>
              <Heading as="h2" scale="md" color="secondary">
                {t('Query presets')}
              </Heading>
              <Text fontSize="12px" color="textSubtle">
                {QUERY_PRESETS.length} {t('static presets')}
              </Text>
              <QueryPresetList activePresetId={activePresetId} onSelect={setActivePresetId} />
            </Panel>
          </Sidebar>

          <Main>
            <Panel>
              <Heading as="h2" scale="md" color="secondary">
                {t(activeResult.label)}
              </Heading>
              <Text fontSize="12px" color="textSubtle">
                {t(activeResult.description)}
              </Text>
              <Text fontSize="12px" color="textDisabled">
                {t('Results')}: {activeResult.resultCount}
              </Text>
              {activeResult.items.length ? (
                <Grid>
                  {activeResult.items.map((item) => (
                    <Flex key={`${item.nodeType}-${item.slug}`} style={{ flex: '1 1 260px', maxWidth: '360px' }}>
                      <QueryResultCard item={item} />
                    </Flex>
                  ))}
                </Grid>
              ) : (
                <Text fontSize="12px" color="textDisabled">
                  {t('No query results')}
                </Text>
              )}
            </Panel>
          </Main>
        </Layout>

        <QueryManifestViewer manifest={manifest} />

        <Text fontSize="12px" color="textDisabled" textAlign="center">
          {t('Machine discovery index')}:{' '}
          <a href="/registry/query/index.json" style={{ color: 'inherit' }}>
            /registry/query/index.json
          </a>
          {' · '}
          <a href="/graph" style={{ color: 'inherit' }}>
            {t('View economic graph')}
          </a>
        </Text>
      </Stack>
    </Page>
  )
}

export default QueryExplorer
