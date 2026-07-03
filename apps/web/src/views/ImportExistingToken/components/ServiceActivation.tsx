import React, { useState } from 'react'
import styled from 'styled-components'
import { SERVICE_ACTIVATION } from '../importTokenData'
import { IT_FONT_BODY, importTokenColors } from '../importTokenTokens'
import { IconExternal } from './importTokenIcons'
import { ItPanel, ItSectionLabel } from './importTokenPrimitives'

const Panel = styled(ItPanel)`
  padding: 24px;
`

const GroupLabel = styled.div`
  font-family: ${IT_FONT_BODY};
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${importTokenColors.label};
  margin: 16px 0 10px;

  &:first-of-type {
    margin-top: 0;
  }
`

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const Row = styled.label`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid ${importTokenColors.border};
  background: rgba(255, 255, 255, 0.02);
  cursor: pointer;
`

const RowBody = styled.div`
  flex: 1;
  min-width: 0;
`

const Title = styled.div`
  font-family: ${IT_FONT_BODY};
  font-size: 14px;
  font-weight: 600;
  color: ${importTokenColors.white};
  display: flex;
  align-items: center;
  gap: 6px;
`

const Desc = styled.div`
  font-family: ${IT_FONT_BODY};
  font-size: 12px;
  color: ${importTokenColors.muted};
  margin-top: 4px;
`

const ModuleLink = styled.a`
  color: ${importTokenColors.gold};
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  margin-top: 6px;

  &:hover {
    text-decoration: underline;
  }
`

export const ServiceActivation: React.FC = () => {
  const [items, setItems] = useState(SERVICE_ACTIVATION)
  const infra = items.filter((i) => i.category === 'infrastructure')
  const optional = items.filter((i) => i.category === 'optional')

  const toggle = (id: string) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item)))
  }

  const renderGroup = (group: typeof items, label: string) => (
    <>
      <GroupLabel>{label}</GroupLabel>
      <List>
        {group.map((item) => (
          <Row key={item.id}>
            <input type="checkbox" checked={item.checked} onChange={() => toggle(item.id)} />
            <RowBody>
              <Title>{item.title}</Title>
              <Desc>{item.description}</Desc>
              <ModuleLink href={item.moduleHref} target="_blank" rel="noopener noreferrer">
                Open module <IconExternal size={12} />
              </ModuleLink>
            </RowBody>
          </Row>
        ))}
      </List>
    </>
  )

  return (
    <Panel data-iet-service-activation>
      <ItSectionLabel>Step 6 — Service Activation</ItSectionLabel>
      {renderGroup(infra, 'Infrastructure')}
      {renderGroup(optional, 'Optional')}
    </Panel>
  )
}

export default ServiceActivation
