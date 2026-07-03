import React from 'react'
import styled from 'styled-components'
import { QUICK_ACTIONS } from '../commandCenterData'
import { safeArray } from '../commandCenterSafe'
import { CC_FONT_BODY, commandCenterColors } from '../commandCenterTokens'
import { CcCardHeader, CcDashCard, CcTitle } from './commandCenterPrimitives'

const ActionLink = styled.a`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid ${commandCenterColors.border};
  background: rgba(255, 255, 255, 0.02);
  text-decoration: none;
  font-family: ${CC_FONT_BODY};
  font-size: 12px;
  font-weight: 600;
  color: ${commandCenterColors.white};
  transition: border-color 150ms ease, color 150ms ease;

  &:hover {
    border-color: ${commandCenterColors.gold};
    color: ${commandCenterColors.gold};
  }
`

const Chevron = styled.span`
  color: ${commandCenterColors.gold};
`

export const CommandQuickActions: React.FC = () => {
  const actions = safeArray(QUICK_ACTIONS)

  return (
    <CcDashCard data-cc-quick-actions>
      <CcCardHeader style={{ marginBottom: 0 }}>
        <CcTitle>Quick Actions</CcTitle>
      </CcCardHeader>
      {actions.map((a) => (
        <ActionLink key={a.id} href={a.href}>
          {a.label}
          <Chevron>›</Chevron>
        </ActionLink>
      ))}
    </CcDashCard>
  )
}

export default CommandQuickActions
