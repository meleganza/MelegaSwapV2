import React from 'react'
import Link from 'next/link'
import styled from 'styled-components'
import { passportOne } from './passportTokens'
import { PassportAssetCardShell } from './PassportAssetCardShell'
import type { PassportAssetsViewModel } from './passportAssetsTypes'

const List = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
`

const Item = styled.li`
  min-width: 0;

  &:last-child:nth-child(odd) {
    grid-column: 1 / -1;
  }
`

const ActionLink = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 26px;
  padding: 0 8px;
  border-radius: 8px;
  border: 1px solid ${passportOne.borderStrong};
  background: rgba(221, 185, 47, 0.08);
  color: ${passportOne.text};
  font-size: 11px;
  line-height: 14px;
  font-weight: 650;
  text-decoration: none;
  gap: 4px;

  &:focus-visible {
    outline: 2px solid ${passportOne.gold};
    outline-offset: 2px;
  }
`

const ActionDisabled = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 26px;
  padding: 0 8px;
  border-radius: 8px;
  border: 1px solid ${passportOne.border};
  background: ${passportOne.elevated};
  color: ${passportOne.muted};
  font-size: 11px;
  line-height: 14px;
  font-weight: 650;
  gap: 4px;
`

const Hint = styled.span`
  font-size: 9px;
  font-weight: 500;
  color: ${passportOne.muted};
  flex-shrink: 0;
`

export const PassportAssetsActionsCard: React.FC<{
  actions: PassportAssetsViewModel['actions']
}> = ({ actions }) => (
  <PassportAssetCardShell
    title="Quick Actions"
    status={actions.status}
    testId="passport-assets-actions"
    availability={actions.availability}
  >
    <List>
      {actions.items.map((action) => (
        <Item key={action.id}>
          {action.supported && action.href ? (
            <ActionLink href={action.href} data-testid={`passport-assets-action-${action.id}`}>
              <span>{action.label}</span>
              <Hint>Open</Hint>
            </ActionLink>
          ) : (
            <ActionDisabled
              data-testid={`passport-assets-action-${action.id}`}
              title={action.reason}
              aria-disabled="true"
            >
              <span>{action.label}</span>
              <Hint>Unavailable</Hint>
            </ActionDisabled>
          )}
        </Item>
      ))}
    </List>
  </PassportAssetCardShell>
)

export default PassportAssetsActionsCard
