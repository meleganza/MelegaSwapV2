import React from 'react'
import styled from 'styled-components'
import { useImportRuntime } from '../importExistingTokenRuntime/ImportRuntimeContext'
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

const Item = styled.div`
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid ${importTokenColors.border};
  background: rgba(255, 255, 255, 0.02);
`

const Title = styled.div`
  font-family: ${IT_FONT_BODY};
  font-size: 14px;
  font-weight: 700;
  color: ${importTokenColors.white};
`

const Sub = styled.div`
  margin-top: 4px;
  font-size: 12px;
  color: ${importTokenColors.muted};
  line-height: 1.45;
`

const Empty = styled.p`
  margin: 0;
  font-size: 13px;
  color: ${importTokenColors.muted};
`

export const InfrastructureSuggestions: React.FC = () => {
  const { analysis } = useImportRuntime()
  const suggestions = analysis?.suggestions ?? []

  return (
    <Panel data-iet-infrastructure-suggestions>
      <ItSectionLabel>Infrastructure Suggestions</ItSectionLabel>
      {suggestions.length === 0 ? (
        <Empty>
          {analysis?.pending
            ? 'Suggestions unlock after pending profile review and canonical listing.'
            : 'No suggestions available for this contract state.'}
        </Empty>
      ) : (
        <List>
          {suggestions.map((s) => (
            <Item key={s.id}>
              <Title>{s.title}</Title>
              <Sub>{s.description}</Sub>
            </Item>
          ))}
        </List>
      )}
    </Panel>
  )
}

export default InfrastructureSuggestions
