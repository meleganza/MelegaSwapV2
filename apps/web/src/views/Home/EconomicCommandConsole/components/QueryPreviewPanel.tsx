import React from 'react'
import styled from 'styled-components'
import Link from 'next/link'
import { runQueryPreset } from 'registry/query/queries'
import { useCommandTranslation } from '../useCommandTranslation'
import { cmd } from '../tokens'
import { Panel, PanelTitle, PanelAction } from '../styles'

const List = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
`

const ListItem = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid ${cmd.border};
  font-size: 12px;

  &:last-child {
    border-bottom: none;
  }

  span:first-child {
    color: ${cmd.text};
  }

  span:last-child {
    color: ${cmd.textSecondary};
    font-size: 11px;
    white-space: nowrap;
  }
`

const QueryPreviewPanel: React.FC = () => {
  const { t } = useCommandTranslation()
  const result = runQueryPreset('projects-with-marco-assets')
  const items = result.items.slice(0, 5)

  return (
    <Panel>
      <PanelTitle>{t('CMD query preview title')}</PanelTitle>
      {items.length === 0 ? (
        <ListItem>
          <span>{t('No query results')}</span>
        </ListItem>
      ) : (
        <List>
          {items.map((item) => (
            <ListItem key={item.slug}>
              <span>{item.displayName}</span>
              <span>{t('Not indexed')}</span>
            </ListItem>
          ))}
        </List>
      )}
      <Link href="/query" passHref legacyBehavior>
        <PanelAction>
          {t('CMD run query')}
          <span>→</span>
        </PanelAction>
      </Link>
    </Panel>
  )
}

export default QueryPreviewPanel
