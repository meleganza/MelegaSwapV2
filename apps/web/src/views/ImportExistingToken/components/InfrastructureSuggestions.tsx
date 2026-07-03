import React, { useState } from 'react'
import styled from 'styled-components'
import { INFRASTRUCTURE_SUGGESTIONS } from '../importTokenData'
import { IT_FONT_BODY, importTokenColors } from '../importTokenTokens'
import { ItPanel, ItSectionLabel } from './importTokenPrimitives'

const Panel = styled(ItPanel)`
  padding: 24px;
`

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`

const Row = styled.label`
  display: grid;
  grid-template-columns: auto 1fr auto auto auto;
  gap: 12px;
  align-items: center;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid ${importTokenColors.border};
  background: rgba(255, 255, 255, 0.02);
  cursor: pointer;

  @media (max-width: 768px) {
    grid-template-columns: auto 1fr;
    gap: 8px;
  }
`

const Title = styled.span`
  font-family: ${IT_FONT_BODY};
  font-size: 14px;
  font-weight: 600;
  color: ${importTokenColors.white};
`

const Meta = styled.span`
  font-family: ${IT_FONT_BODY};
  font-size: 11px;
  color: ${importTokenColors.muted};

  @media (max-width: 768px) {
    grid-column: 2;
  }
`

const D87 = styled.span`
  font-family: ${IT_FONT_BODY};
  font-size: 11px;
  font-weight: 700;
  color: ${importTokenColors.gold};
  white-space: nowrap;

  @media (max-width: 768px) {
    grid-column: 2;
  }
`

export const InfrastructureSuggestions: React.FC = () => {
  const [items, setItems] = useState(INFRASTRUCTURE_SUGGESTIONS)

  const toggle = (id: string) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item)))
  }

  return (
    <Panel data-iet-suggestions>
      <ItSectionLabel>Step 5 — Infrastructure Suggestions</ItSectionLabel>
      <List>
        {items.map((item) => (
          <Row key={item.id}>
            <input type="checkbox" checked={item.checked} onChange={() => toggle(item.id)} />
            <Title>{item.title}</Title>
            <Meta>{item.estimatedImpact}</Meta>
            <Meta>{item.estimatedCompletion}</Meta>
            <D87>D87: {item.d87Contribution}</D87>
          </Row>
        ))}
      </List>
    </Panel>
  )
}

export default InfrastructureSuggestions
