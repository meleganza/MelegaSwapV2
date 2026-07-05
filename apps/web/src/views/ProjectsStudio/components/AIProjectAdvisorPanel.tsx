import React from 'react'
import styled from 'styled-components'
import { PR_FONT_BODY, PR_FONT_DISPLAY, projectsStudioColors, projectsStudioLayout } from '../projectsStudioTokens'
import { useProjectsRuntime } from '../projectsRuntime/ProjectsRuntimeContext'
import { PrPanel } from './projectsStudioPrimitives'

const Panel = styled(PrPanel)`
  height: ${projectsStudioLayout.advisorHeight};
  padding: ${projectsStudioLayout.advisorPadding};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`

const Title = styled.h3`
  margin: 0 0 16px;
  font-family: ${PR_FONT_DISPLAY};
  font-size: 18px;
  font-weight: 700;
  color: ${projectsStudioColors.text};
`

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${projectsStudioLayout.advisorRowGap};
  flex: 1;
  min-height: 0;
`

const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  height: ${projectsStudioLayout.advisorRowHeight};
  min-height: ${projectsStudioLayout.advisorRowHeight};
`

const Label = styled.span`
  font-family: ${PR_FONT_BODY};
  font-size: 15px;
  font-weight: 600;
  color: ${projectsStudioColors.text};
`

const ValueBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
`

const Value = styled.span<{ $tone?: 'green' | 'gold' | 'gray' }>`
  font-family: ${PR_FONT_BODY};
  font-size: 14px;
  font-weight: 600;
  color: ${({ $tone }) =>
    $tone === 'green'
      ? projectsStudioColors.green
      : $tone === 'gold'
        ? projectsStudioColors.gold
        : $tone === 'gray'
          ? projectsStudioColors.muted
          : projectsStudioColors.text};
`

const Confidence = styled.span`
  font-family: ${PR_FONT_BODY};
  font-size: 14px;
  font-weight: 600;
  color: ${projectsStudioColors.muted};
  white-space: nowrap;
  flex-shrink: 0;
`

export const AIProjectAdvisorPanel: React.FC = () => {
  const { advisorRows } = useProjectsRuntime()
  const rows = advisorRows.slice(0, 5)

  return (
    <Panel data-pr-advisor>
      <Title>AI Project Advisor</Title>
      <List>
        {rows.map((row) => (
          <Row key={row.label}>
            <ValueBlock>
              <Label>{row.label}</Label>
              <Value $tone={row.tone}>{row.value}</Value>
            </ValueBlock>
            <Confidence>{row.score}</Confidence>
          </Row>
        ))}
      </List>
    </Panel>
  )
}

export default AIProjectAdvisorPanel
